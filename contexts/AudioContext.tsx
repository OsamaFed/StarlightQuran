"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";


interface AudioContextType {
  currentAudioId: string | null;
  setCurrentAudioId: (id: string | null) => void;
  stopAllAudio: () => void;
  currentAudioRef: React.RefObject<HTMLAudioElement> | null;
  registerAudio: (id: string, ref: React.RefObject<HTMLAudioElement>) => void;
  unregisterAudio: (id: string) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentAudioId, setCurrentAudioIdState] = useState<string | null>(null);
  
  const audioRefsMap = useRef<Map<string, React.RefObject<HTMLAudioElement>>>(new Map());

  
  useEffect(() => {
    return () => {
      audioRefsMap.current.forEach((ref) => {
        if (ref.current) {
          ref.current.pause();
          ref.current.src = ""; 
        }
      });
      audioRefsMap.current.clear();
    };
  }, []);

  const stopAllAudio = useCallback(() => {
    audioRefsMap.current.forEach((ref) => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });
    setCurrentAudioIdState(null);
  }, []);

  const setCurrentAudioId = useCallback(
    (id: string | null) => {
      
      if (currentAudioId && currentAudioId !== id) {
        const prevRef = audioRefsMap.current.get(currentAudioId);
        if (prevRef?.current) {
          prevRef.current.pause();
          prevRef.current.currentTime = 0;
        }
      }
      setCurrentAudioIdState(id);
    },
    [currentAudioId]
  );

  const registerAudio = useCallback(
    (id: string, ref: React.RefObject<HTMLAudioElement>) => {
      audioRefsMap.current.set(id, ref);
    },
    []
  );

  
  const unregisterAudio = useCallback((id: string) => {
    const ref = audioRefsMap.current.get(id);
    if (ref?.current) {
      ref.current.pause();
      ref.current.src = "";
    }
    audioRefsMap.current.delete(id);
  }, []);

  const currentAudioRef = currentAudioId
    ? (audioRefsMap.current.get(currentAudioId) ?? null)
    : null;

  return (
    <AudioContext.Provider
      value={{
        currentAudioId,
        setCurrentAudioId,
        stopAllAudio,
        currentAudioRef,
        registerAudio,
        unregisterAudio,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio(): AudioContextType {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
}
