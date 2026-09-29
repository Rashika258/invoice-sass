"use client";

import { useEffect } from "react";
import { toast } from "sonner";

/**
 * GlobalFormValidation interceptor
 * Replaces native browser validation bubbles ("Please fill in this field")
 * with custom, accessible inline errors and toast alerts across all forms.
 */
export function GlobalFormValidation() {
  useEffect(() => {
    let lastToastTime = 0;

    const getFieldLabel = (element: HTMLElement): string => {
      // 1. Check if input has explicit associated label
      if ("labels" in element && (element as HTMLInputElement).labels?.length) {
        const text = (element as HTMLInputElement).labels![0].textContent?.trim();
        if (text) return cleanLabelText(text);
      }

      // 2. Check closest form group or parent container for a label element
      const container = element.closest(
        ".space-y-1\\.5, .space-y-1, .space-y-2, .space-y-3, .space-y-4, div, form"
      );
      if (container) {
        const labelEl = container.querySelector(
          "label, .text-xs.font-semibold, .text-xs.font-medium, .text-sm.font-medium"
        );
        if (labelEl && labelEl.textContent) {
          const text = cleanLabelText(labelEl.textContent);
          if (text && text.length > 0 && text.length < 50) return text;
        }
      }

      // 3. Check aria-label
      const ariaLabel = element.getAttribute("aria-label");
      if (ariaLabel) return cleanLabelText(ariaLabel);

      // 4. Check placeholder (if it's not a generic example)
      const placeholder = element.getAttribute("placeholder");
      if (
        placeholder &&
        !placeholder.toLowerCase().startsWith("e.g.") &&
        !placeholder.includes("••") &&
        placeholder.length < 35
      ) {
        return cleanLabelText(placeholder);
      }

      // 5. Check name attribute and convert camelCase/kebab-case to Title Case
      const name = element.getAttribute("name");
      if (name) {
        return name
          .replace(/([A-Z])/g, " $1")
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .trim();
      }

      return "This field";
    };

    const cleanLabelText = (raw: string): string => {
      return raw
        .replace(/[*:]/g, "")
        .replace(/\(optional\)/gi, "")
        .replace(/\(required\)/gi, "")
        .trim();
    };

    const handleInvalid = (e: Event) => {
      // 1. Block the ugly native browser bubble
      e.preventDefault();

      const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (!target || typeof target.getBoundingClientRect !== "function") return;

      const fieldName = getFieldLabel(target);
      const isMissing = target.validity?.valueMissing;
      const isEmail = target.type === "email" && target.validity?.typeMismatch;
      const isTooShort = target.validity?.tooShort;

      let errorMessage = `${fieldName} is mandatory`;
      if (isEmail) {
        errorMessage = `Please enter a valid ${fieldName}`;
      } else if (isTooShort && "minLength" in target) {
        errorMessage = `${fieldName} must be at least ${target.minLength} characters`;
      } else if (!isMissing && target.validationMessage) {
        errorMessage = target.validationMessage;
      }

      // 2. Add error classes to target element
      target.classList.add("border-destructive", "focus-visible:ring-destructive");
      target.setAttribute("aria-invalid", "true");

      // 3. Inject / update inline custom error message
      const parent = target.parentElement;
      if (parent) {
        const fieldKey = target.id || target.name || "field";
        const container = target.closest(".space-y-1\\.5, .space-y-1, .space-y-2, .space-y-3") || parent;
        let errorEl = container.querySelector(`[data-custom-error="${fieldKey}"]`) as HTMLElement;

        if (!errorEl) {
          errorEl = document.createElement("p");
          errorEl.setAttribute("data-custom-error", fieldKey);
          errorEl.className =
            "text-[11px] font-medium text-destructive mt-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-150";
          errorEl.innerHTML = `
            <svg class="size-3 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span class="custom-error-text">${errorMessage}</span>
          `;

          // If inside a relative container (like an input with leading currency symbol), insert after parent
          if (parent.classList.contains("relative")) {
            parent.insertAdjacentElement("afterend", errorEl);
          } else {
            target.insertAdjacentElement("afterend", errorEl);
          }
        } else {
          const span = errorEl.querySelector(".custom-error-text");
          if (span) span.textContent = errorMessage;
        }
      }

      // 4. Clear error as soon as user types or changes input
      const clearError = () => {
        target.classList.remove("border-destructive", "focus-visible:ring-destructive");
        target.removeAttribute("aria-invalid");
        const fieldKey = target.id || target.name || "field";
        const container = target.closest(".space-y-1\\.5, .space-y-1, .space-y-2, .space-y-3") || target.parentElement;
        if (container) {
          const errEl = container.querySelector(`[data-custom-error="${fieldKey}"]`);
          if (errEl) errEl.remove();
        }
        target.removeEventListener("input", clearError);
        target.removeEventListener("change", clearError);
      };

      target.addEventListener("input", clearError, { once: true });
      target.addEventListener("change", clearError, { once: true });

      // 5. Toast notification and focus for the first invalid field
      const now = Date.now();
      if (now - lastToastTime > 1200) {
        lastToastTime = now;
        toast.error(errorMessage, {
          id: "mandatory-field-error",
          duration: 3500,
        });
        target.focus({ preventScroll: false });
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    // Capture invalid events across the entire window
    document.addEventListener("invalid", handleInvalid, true);

    return () => {
      document.removeEventListener("invalid", handleInvalid, true);
    };
  }, []);

  return null;
}
