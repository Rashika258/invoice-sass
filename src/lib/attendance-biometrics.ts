/**
 * Biometric Attendance System Library
 * Handles Fingerprint capture (Mantra MFS100 / Morpho RD Service & WebAuthn),
 * Face Scanning metadata, and Attendance record encoding/decoding.
 */

export type AttendanceVerificationMethod = "FINGERPRINT" | "FACE_SCAN" | "MANUAL";

export interface AttendanceMetadata {
  method: AttendanceVerificationMethod;
  inTime?: string; // e.g. "09:15 AM"
  outTime?: string; // e.g. "06:45 PM"
  quality?: number; // 0-100% for fingerprint/face confidence
  photoUrl?: string; // data URI or photo thumbnail
  device?: string; // e.g. "Mantra MFS100", "Windows Hello", "Integrated Camera"
  punchType?: "IN" | "OUT" | "FULL_DAY";
  notes?: string;
  timestamp?: string;
}

const META_DELIMITER = "|||__META__:";

/**
 * Encodes structured biometric metadata into the AttendanceRecord notes string
 */
export function encodeAttendanceNotes(
  metadata: AttendanceMetadata,
  humanNote?: string,
): string {
  const methodLabel =
    metadata.method === "FINGERPRINT"
      ? `[FINGERPRINT ${metadata.device || "Scanner"}]`
      : metadata.method === "FACE_SCAN"
      ? `[FACE SCAN ${metadata.quality ? `${metadata.quality}% match` : ""}]`
      : "[MANUAL PUNCH]";

  const timeDetails = [
    metadata.inTime ? `In: ${metadata.inTime}` : null,
    metadata.outTime ? `Out: ${metadata.outTime}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const header = `${methodLabel} ${timeDetails}${humanNote ? ` - ${humanNote}` : ""}`.trim();
  const jsonMeta = JSON.stringify(metadata);

  return `${header} ${META_DELIMITER}${jsonMeta}`;
}

/**
 * Parses attendance notes to extract biometric metadata and human-readable text
 */
export function parseAttendanceNotes(
  rawNotes: string | null | undefined,
): {
  metadata: AttendanceMetadata | null;
  displayText: string;
} {
  if (!rawNotes) {
    return {
      metadata: null,
      displayText: "",
    };
  }

  if (rawNotes.includes(META_DELIMITER)) {
    const parts = rawNotes.split(META_DELIMITER);
    const displayText = parts[0]?.trim() || "";
    try {
      const metadata = JSON.parse(parts[1]) as AttendanceMetadata;
      return { metadata, displayText };
    } catch {
      // Fallback
    }
  }

  // Detect legacy or shorthand notes
  let fallbackMethod: AttendanceVerificationMethod = "MANUAL";
  if (rawNotes.toUpperCase().includes("FINGERPRINT")) fallbackMethod = "FINGERPRINT";
  else if (rawNotes.toUpperCase().includes("FACE")) fallbackMethod = "FACE_SCAN";

  return {
    metadata: {
      method: fallbackMethod,
      notes: rawNotes,
    },
    displayText: rawNotes,
  };
}

/**
 * USB RD Service Interface for Mantra MFS100 / Morpho Scanners
 * Typically runs on http://localhost:11100/rd/info and /rd/capture
 */
export async function captureMantraFingerprint(options?: {
  timeoutSeconds?: number;
  minQuality?: number;
}): Promise<{
  success: boolean;
  quality: number;
  device?: string;
  error?: string;
}> {
  const timeoutMs = (options?.timeoutSeconds || 10) * 1000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // 1. Attempt handshake with local Mantra RD service
    const rdServicePort = "11100";
    const response = await fetch(`http://localhost:${rdServicePort}/rd/capture`, {
      method: "CAPTURE",
      headers: { "Content-Type": "text/xml" },
      body: `<PidOptions ver="1.0"><Opts fCount="1" fType="2" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="${timeoutMs}" env="P" posh="UNKNOWN" /></PidOptions>`,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const xmlText = await response.text();
      // Extract quality or qScore from XML
      const qScoreMatch = xmlText.match(/qScore="(\d+)"/i);
      const quality = qScoreMatch ? parseInt(qScoreMatch[1], 10) : 88;

      return {
        success: true,
        quality,
        device: "Mantra MFS100 (USB Optical)",
      };
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    // When scanner hardware is not attached locally or during demo/testing,
    // we return a clear note so UI can offer the interactive tester.
  }

  // Graceful fallback for test/simulator mode
  return {
    success: false,
    quality: 0,
    device: "Mantra MFS100",
    error: "Mantra RD Service not detected on localhost:11100. Ensure scanner is plugged in and Mantra RD service is running, or use Simulator Mode.",
  };
}

/**
 * Browser Native WebAuthn Biometric Capture
 * Works with Windows Hello fingerprint, Touch ID, Android biometrics.
 */
export async function captureWebAuthnBiometric(
  employeeName: string,
): Promise<{
  success: boolean;
  quality: number;
  device?: string;
  error?: string;
}> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) {
    return {
      success: false,
      quality: 0,
      error: "WebAuthn / Biometric platform authenticator is not supported on this browser.",
    };
  }

  try {
    const isAvailable =
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    if (!isAvailable) {
      return {
        success: false,
        quality: 0,
        error: "No platform biometric sensor (Windows Hello / Touch ID) found on this device.",
      };
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);
    const userId = new Uint8Array(16);
    window.crypto.getRandomValues(userId);

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: "Sri Manjunatha Engineering Attendance",
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: employeeName.toLowerCase().replace(/\s+/g, "."),
          displayName: employeeName,
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
      },
    });

    if (credential) {
      return {
        success: true,
        quality: 98,
        device: "Platform Biometric (Windows Hello / Touch ID)",
      };
    }
  } catch (err: any) {
    if (err.name === "NotAllowedError") {
      return {
        success: false,
        quality: 0,
        error: "Biometric prompt was cancelled or timed out.",
      };
    }
    return {
      success: false,
      quality: 0,
      error: err.message || "Biometric authentication failed.",
    };
  }

  return {
    success: false,
    quality: 0,
    error: "Biometric sensor did not return credentials.",
  };
}
