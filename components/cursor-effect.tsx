"use client";

import { useEffect } from "react";

export function CursorEffect() {
  useEffect(() => {
    // Skip on touch-only devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let effect: { destroy: () => void } | null = null;

    import("@/lib/ants-cursor").then(({ antsCursor }) => {
      effect = antsCursor();
    });

    return () => {
      effect?.destroy();
    };
  }, []);

  return null;
}
