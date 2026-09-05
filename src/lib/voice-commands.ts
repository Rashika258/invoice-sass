"use client";

import { useEffect } from "react";

export function useGlobalKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N: Create New Invoice
      if (e.ctrlKey && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        window.location.href = "/invoices/new";
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
        window.location.href = "/settings";
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}

export function startSpeechRecognition(
  onCommandParsed: (command: string) => void,
) {
  if (typeof window === "undefined") return;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn("Speech recognition is not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    console.log("[Voice Command Recognized]:", transcript);

    if (transcript.includes("new invoice") || transcript.includes("create invoice")) {
      window.location.href = "/invoices/new";
    } else if (transcript.includes("report") || transcript.includes("reports")) {
      window.location.href = "/reports";
    } else if (transcript.includes("customer") || transcript.includes("parties")) {
      window.location.href = "/customers";
    } else if (transcript.includes("inventory") || transcript.includes("items")) {
      window.location.href = "/items";
    }

    onCommandParsed(transcript);
  };

  recognition.start();
}
