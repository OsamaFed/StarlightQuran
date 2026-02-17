
import { useState, useCallback, useRef, useEffect } from "react";
import { setGlobalAudioPlaying } from "../utils/globalState";

export const useAyahAudio = (
  surahId: number,
  verseNumber: number,
  verseId: string
) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isUnmountedRef = useRef(false);

  
  useEffect(() => {
    isUnmountedRef.current = false;

    const handleStop = (ev: Event) => {
      if ((ev as CustomEvent).detail?.verseId === verseId) {
        stopAudio();
      }
    };

    window.addEventListener("ayahaudio:stop", handleStop as EventListener);

    return () => {
      isUnmountedRef.current = true;
      window.removeEventListener("ayahaudio:stop", handleStop as EventListener);

      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ""; 
        audioRef.current = null;
      }
    };
    
  }, [verseId]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (!isUnmountedRef.current) {
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopAudio();
      setGlobalAudioPlaying(null);
      return;
    }

    
    setGlobalAudioPlaying(verseId);

    const s = String(surahId).padStart(3, "0");
    const v = String(verseNumber).padStart(3, "0");
    const url = `https://everyayah.com/data/Alafasy_128kbps/${s}${v}.mp3`;

    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "none"; 

      audio.onended = () => {
        if (!isUnmountedRef.current) {
          setIsPlaying(false);
          setGlobalAudioPlaying(null);
        }
      };

      audio.onerror = (e) => {
        console.error("[useAyahAudio] Failed to play audio:", url, e);
        if (!isUnmountedRef.current) {
          setIsPlaying(false);
          setGlobalAudioPlaying(null);
        }
      };

      audioRef.current = audio;
    }

    audioRef.current.src = url;
    audioRef.current.play().catch((e) => {
      
      console.error("[useAyahAudio] Play failed:", e);
      if (!isUnmountedRef.current) {
        setIsPlaying(false);
        setGlobalAudioPlaying(null);
      }
    });

    if (!isUnmountedRef.current) {
      setIsPlaying(true);
    }
  }, [isPlaying, surahId, verseNumber, verseId, stopAudio]);

  return { isPlaying, togglePlay, stopAudio };
};
