
import { useEffect } from "react";
import { closeMenuAndClear, setGlobalAudioPlaying } from "../utils/globalState"; 

export const useOtherMenuHandler = (verseId: string, menuVisible: boolean, onClose: () => void) => {
  useEffect(() => {
    const handleOtherMenuOpened = (ev: Event) => {
      try {
        const d = (ev as CustomEvent).detail;
        if (d?.verseId !== verseId && menuVisible) {
          onClose();
          closeMenuAndClear(verseId);
          setGlobalAudioPlaying(null); 
        }
      } catch (e) {
        console.error("Error handling other menu opened:", e);
      }
    };

    window.addEventListener('versespeeddial:opened', handleOtherMenuOpened as EventListener);
    return () => {
      window.removeEventListener('versespeeddial:opened', handleOtherMenuOpened as EventListener);
    };
  }, [verseId, menuVisible, onClose]);
};
