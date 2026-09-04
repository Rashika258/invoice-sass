"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { setDocumentTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    setDocumentTheme(nextTheme ? "dark" : "light");
  };

  return (
    <Button variant="ghost" size="icon" className="size-9" onClick={toggleTheme} aria-label="Toggle theme">
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
