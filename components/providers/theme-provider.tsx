"use client";

import { useEffect, useCallback } from "react";

type ThemeMode = "system" | "light" | "dark";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode: ThemeMode) {
  const resolved = mode === "system" ? getSystemTheme() : mode;
  const root = document.documentElement;

  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Store in a data attribute for reference
  root.dataset.theme = mode;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const init = useCallback(() => {
    // Fetch theme from API on mount
    async function load() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) return;
        const settings = await res.json();
        const mode = (settings.theme_mode as ThemeMode) || "system";
        applyTheme(mode);
      } catch {
        // Default to system on error
        applyTheme("system");
      }
    }
    load();
  }, []);

  useEffect(() => {
    init();

    // Listen for theme changes from Settings page
    function handleSettingChanged(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.key === "theme_mode") {
        applyTheme(detail.value as ThemeMode);
      }
    }

    // Listen for system preference changes (only matters in "system" mode)
    function handleSystemChange() {
      const current = document.documentElement.dataset.theme;
      if (current === "system") {
        applyTheme("system");
      }
    }

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", handleSystemChange);
    window.addEventListener("setting-changed", handleSettingChanged);

    return () => {
      mq.removeEventListener("change", handleSystemChange);
      window.removeEventListener("setting-changed", handleSettingChanged);
    };
  }, [init]);

  return <>{children}</>;
}
