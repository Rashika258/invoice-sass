export interface DiagnosticInfo {
  supportId: string;
  timestamp: string;
  appVersion: string;
  dbSchemaVersion: string;
  userRole: string;
  userAgent: string;
  errorMessage: string;
  sanitizedStack?: string;
  url?: string;
}

export function generateSupportId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `ERR-${year}-${month}${day}-${randomSuffix}`;
}

export function sanitizeDiagnosticText(text: string): string {
  if (!text) return "";

  // Replace emails with [EMAIL_REDACTED]
  let sanitized = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL_REDACTED]");

  // Replace 10-12 digit numbers with [PHONE_REDACTED]
  sanitized = sanitized.replace(/\b(?:\+91|0)?[6-9]\d{9}\b/g, "[PHONE_REDACTED]");

  // Replace GSTIN formats with [GSTIN_REDACTED]
  sanitized = sanitized.replace(/\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/g, "[GSTIN_REDACTED]");

  return sanitized;
}

export function createDiagnosticPayload(
  error: Error | string,
  userRole: string = "ADMIN",
  currentUrl?: string
): DiagnosticInfo {
  const supportId = generateSupportId();
  const message = typeof error === "string" ? error : error.message;
  const rawStack = typeof error === "object" && error.stack ? error.stack : "";

  return {
    supportId,
    timestamp: new Date().toISOString(),
    appVersion: "v1.4.2",
    dbSchemaVersion: "v12",
    userRole,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Node/Server",
    errorMessage: sanitizeDiagnosticText(message),
    sanitizedStack: sanitizeDiagnosticText(rawStack),
    url: currentUrl || (typeof window !== "undefined" ? window.location.href : undefined),
  };
}

export function formatDiagnosticTextForCopy(info: DiagnosticInfo): string {
  return [
    `=== BILLORA SUPPORT DIAGNOSTIC PAYLOAD ===`,
    `Support ID: ${info.supportId}`,
    `Timestamp: ${info.timestamp}`,
    `App Version: ${info.appVersion}`,
    `DB Schema: ${info.dbSchemaVersion}`,
    `User Role: ${info.userRole}`,
    `Route URL: ${info.url || "N/A"}`,
    `Error Message: ${info.errorMessage}`,
    `----------------------------------------`,
    `Sanitized Trace:`,
    info.sanitizedStack || "No stack trace recorded.",
    `========================================`,
  ].join("\n");
}
