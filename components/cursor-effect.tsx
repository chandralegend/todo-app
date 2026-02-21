"use client";

import { useEffect } from "react";

export function CursorEffect() {
  useEffect(() => {
    // Skip on touch-only devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let effect: { destroy: () => void } | null = null;

    import("cursor-effects").then(({ trailingCursor }) => {
      effect = trailingCursor({
        particles: 15,
        rate: 0.4,
      });
    });

    return () => {
      effect?.destroy();
    };
  }, []);

  return null;
}
