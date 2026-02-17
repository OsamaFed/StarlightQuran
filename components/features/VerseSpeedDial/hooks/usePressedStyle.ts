import { useEffect } from "react";
import { TIMING } from "../constants";

export const usePressedStyle = (verseId: string, isPressed: boolean, isDarkMode: boolean) => {
  useEffect(() => {
    const el = document.getElementById(verseId) as HTMLElement | null;
    if (!el) return;

    if (isPressed) {
      el.style.transition = `background-color ${TIMING.PRESS_TRANSITION}ms ease`;
      el.style.backgroundColor = isDarkMode
        ? "rgba(255,255,255,0.04)"
        : "rgba(0,0,0,0.04)";
    } else {
      el.style.backgroundColor = "";
    }

    return () => {
      if (el) el.style.backgroundColor = "";
    };
  }, [isPressed, verseId, isDarkMode]);
};
