import { useEffect } from "react";
import { TIMING } from "../constants";
import { closeMenuAndClear } from "../utils/globalState";

export const useClickOutside = (
  verseId: string,
  menuRef: React.RefObject<HTMLDivElement | null>,
  menuVisible: boolean,
  onClose: () => void,
  isLongPressTriggeredRef: React.MutableRefObject<boolean>
) => {
  useEffect(() => {
    if (!menuVisible) return;

    const handler = (e: Event) => {
      if (isLongPressTriggeredRef.current && e.type === 'touchstart') {
        isLongPressTriggeredRef.current = false;
        return;
      }

      const target = e.target as Node | null;
      const menuEl = menuRef.current;
      const verseEl = document.getElementById(verseId);

      if ((menuEl?.contains(target || null)) || (verseEl?.contains(target || null))) return;

      closeMenuAndClear(verseId);
      onClose();
      try {
        window.dispatchEvent(new CustomEvent('versespeeddial:closed', { detail: { verseId } }));
      } catch (e) {
        console.error("Error dispatching closed event:", e);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handler);
      document.addEventListener('touchstart', handler);
    }, TIMING.CLICK_OUTSIDE_DELAY);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [menuVisible, verseId, menuRef, onClose, isLongPressTriggeredRef]);
};
