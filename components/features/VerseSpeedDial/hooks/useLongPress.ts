import { useRef, useState, useEffect } from "react";
import { TIMING, THRESHOLDS } from "../constants";
import { getCurrentOpenMenu, setCurrentOpenMenu } from "../utils/globalState";

export const useLongPress = (
  elementId: string,
  onLongPress: () => void,
  enabled: boolean
) => {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTouchRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isLongPressTriggeredRef = useRef(false);
  const [isPressed, setIsPressed] = useState(false);
  const onLongPressRef = useRef(onLongPress);

  useEffect(() => {
    onLongPressRef.current = onLongPress;
  }, [onLongPress]);

  useEffect(() => {
    if (!enabled) return;

    const el = document.getElementById(elementId);
    if (!el) return;

    el.style.setProperty("-webkit-touch-callout", "none");
    el.style.setProperty("-webkit-user-select", "none");
    el.style.userSelect = "none";

    const start = (e: Event) => {
      if (e instanceof TouchEvent && e.touches.length > 0) {
        const touch = e.touches[0];
        startTouchRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        };
      } else if (e instanceof MouseEvent) {
        startTouchRef.current = {
          x: e.clientX,
          y: e.clientY,
          time: Date.now(),
        };
      }

      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }

      isLongPressTriggeredRef.current = false;
      setIsPressed(true);

      longPressTimer.current = setTimeout(() => {
        const elapsed = Date.now() - (startTouchRef.current?.time || 0);
        if (elapsed < 200) return;

        const current = getCurrentOpenMenu();
        if (current && current !== elementId) return;

        setCurrentOpenMenu(elementId);
        isLongPressTriggeredRef.current = true;
        onLongPressRef.current();

        if ('vibrate' in navigator) {
          try {
            navigator.vibrate(50);
          } catch (e) {
            console.error("Vibration not supported:", e);
          }
        }

        try {
          window.dispatchEvent(new CustomEvent('versespeeddial:opened', { detail: { verseId: elementId } }));
        } catch (e) {
          console.error("Error dispatching opened event:", e);
        }
      }, TIMING.LONG_PRESS_DELAY);
    };

    const cancel = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      setIsPressed(false);
      startTouchRef.current = null;
    };

    const handleTouchMove = (e: Event) => {
      if (!startTouchRef.current || isLongPressTriggeredRef.current) return;

      if (e instanceof TouchEvent && e.touches.length > 0) {
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - startTouchRef.current.x);
        const deltaY = Math.abs(touch.clientY - startTouchRef.current.y);
        if (deltaX > THRESHOLDS.MOVE || deltaY > THRESHOLDS.MOVE) {
          cancel();
        }
      }
    };

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      return false;
    };

    el.addEventListener("mousedown", start);
    el.addEventListener("mouseup", cancel);
    el.addEventListener("mouseleave", cancel);
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchend", cancel, { passive: true });
    el.addEventListener("touchcancel", cancel, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("contextmenu", handleContextMenu);

    return () => {
      el.style.removeProperty("-webkit-touch-callout");
      el.style.removeProperty("-webkit-user-select");
      el.style.userSelect = "";

      cancel();
      el.removeEventListener("mousedown", start);
      el.removeEventListener("mouseup", cancel);
      el.removeEventListener("mouseleave", cancel);
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchend", cancel);
      el.removeEventListener("touchcancel", cancel);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [elementId, enabled]);

  return { isPressed, isLongPressTriggeredRef };
};
