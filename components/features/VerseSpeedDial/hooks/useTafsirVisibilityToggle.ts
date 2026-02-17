import { useEffect } from "react";

export const useTafsirVisibilityToggle = (menuVisible: boolean) => {
  useEffect(() => {
    try {
      const ev = new CustomEvent(menuVisible ? "versespeeddial:hideInlineTafsir" : "versespeeddial:showInlineTafsir");
      window.dispatchEvent(ev);
    } catch (e) {
      console.error("Error dispatching tafsir visibility event:", e);
    }
  }, [menuVisible]);
};
