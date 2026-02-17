import { useState, useEffect } from "react";

export const useTafsirStatus = () => {
  const [isTafsirOpen, setIsTafsirOpen] = useState(false);

  useEffect(() => {
    const checkTafsir = () => {
      const candidate = document.querySelector(
        "#tafsir, .tafsir, [data-tafsir], [data-tafsir-open]"
      ) as HTMLElement | null;
      const open = !!candidate && candidate.offsetHeight > 0 && candidate.offsetParent !== null;
      setIsTafsirOpen(open);
    };

    checkTafsir();
    const mo = new MutationObserver(checkTafsir);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true });
    window.addEventListener("resize", checkTafsir, { passive: true });
    return () => {
      mo.disconnect();
      window.removeEventListener("resize", checkTafsir);
    };
  }, []);

  return isTafsirOpen;
};
