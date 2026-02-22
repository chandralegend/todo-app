"use client";

import { useEffect, useRef, useCallback } from "react";

export function CursorEffect() {
  const effectRef = useRef<{ destroy: () => void } | null>(null);
  const enabledRef = useRef<boolean | null>(null);

  const startEffect = useCallback(() => {
    if (effectRef.current) return; // already running
    // Skip on touch-only devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    import("@/lib/ants-cursor").then(({ antsCursor }) => {
      // Double-check we still want it (race condition guard)
      if (enabledRef.current === false) return;
      effectRef.current = antsCursor();
    });
  }, []);

  const stopEffect = useCallback(() => {
    if (effectRef.current) {
      effectRef.current.destroy();
      effectRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Fetch the cursor_enabled setting on mount
    let cancelled = false;

    async function init() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) {
          // Default to enabled if we can't fetch settings
          enabledRef.current = true;
          startEffect();
          return;
        }
        const settings = await res.json();
        if (cancelled) return;
        const enabled = settings.cursor_enabled !== "false"; // default true
        enabledRef.current = enabled;
        if (enabled) {
          startEffect();
        }
      } catch {
        // Default to enabled on error
        if (cancelled) return;
        enabledRef.current = true;
        startEffect();
      }
    }

    init();

    // Listen for setting changes from the Appearance tab
    function handleSettingChanged(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.key === "cursor_enabled") {
        const enabled = detail.value !== "false";
        enabledRef.current = enabled;
        if (enabled) {
          startEffect();
        } else {
          stopEffect();
        }
      }
    }

    window.addEventListener("setting-changed", handleSettingChanged);

    return () => {
      cancelled = true;
      stopEffect();
      window.removeEventListener("setting-changed", handleSettingChanged);
    };
  }, [startEffect, stopEffect]);

  return null;
}
