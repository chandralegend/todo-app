"use client";

import { useEffect } from "react";

export function CursorEffect() {
  useEffect(() => {
    // Skip on touch-only devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let effect: { destroy: () => void } | null = null;

    import("cursor-effects").then(({ clockCursor }) => {
      effect = clockCursor({
        dateColor: "#E07A5F",
        faceColor: "#78716c",
        secondsColor: "#E07A5F",
        minutesColor: "#57534e",
        hoursColor: "#292524",
      });
    });

    return () => {
      effect?.destroy();
    };
  }, []);

  return null;
}
