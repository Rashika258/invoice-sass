"use client";

import { useEffect } from "react";

function navigateTo(path: string) {
  if (typeof window !== "undefined") {
    window.location.assign(path);
  }
}

export function useGlobalKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N: Create New Invoice
      if (e.ctrlKey && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        navigateTo("/invoices/new");
      }

      // Ctrl+Q: Quick Search / Command Palette
      if (e.ctrlKey && (e.key === "q" || e.key === "Q")) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>("input[placeholder*='Search']");
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Ctrl+,: Settings
      if (e.ctrlKey && e.key === ",") {
        e.preventDefault();
        navigateTo("/settings");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}

interface SpeechRecognitionResult {
  0: {
    transcript: string;
  };
}

interface SpeechRecognitionEvent {
  results: {
    0: SpeechRecognitionResult;
  };
}

export function startSpeechRecognition(
  onCommandParsed: (command: string) => void,
) {
  if (typeof window === "undefined") return;

  const win = window as unknown as Record<string, unknown>;
  const SpeechRecognitionConstructor = (win.SpeechRecognition || win.webkitSpeechRecognition) as
    | (new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: (event: SpeechRecognitionEvent) => void;
        start: () => void;
      })
    | undefined;

  if (!SpeechRecognitionConstructor) {
    console.warn("Speech recognition is not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognitionConstructor();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    console.log("[Voice Command Recognized]:", transcript);

    if (transcript.includes("new invoice") || transcript.includes("create invoice")) {
      navigateTo("/invoices/new");
    } else if (transcript.includes("report") || transcript.includes("reports")) {
      navigateTo("/reports");
    } else if (transcript.includes("customer") || transcript.includes("parties")) {
      navigateTo("/customers");
    } else if (transcript.includes("inventory") || transcript.includes("items")) {
      navigateTo("/items");
    }

    onCommandParsed(transcript);
  };

  recognition.start();
}
