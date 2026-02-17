import { useState, useEffect, useCallback } from "react";
import { FavoriteVerse } from "../types";

const STORAGE_KEY = "favoriteVerses";
const EVENT_NAME = "favoriteVerseChanged";


function readFavorites(): FavoriteVerse[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFavorites(favs: FavoriteVerse[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, { detail: { favorites: favs } })
    );
  } catch {
    
  }
}

export const useFavorites = (
  verseId: string,
  verseNumber: number,
  surahName: string,
  verseText: string,
  surahId: number
) => {
  const [isFavorited, setIsFavorited] = useState(false);

  
  useEffect(() => {
    
    const favs = readFavorites();
    setIsFavorited(favs.some((v) => v.id === verseId));

    
    const handler = (ev: Event) => {
      const favs = (ev as CustomEvent).detail?.favorites as
        | FavoriteVerse[]
        | undefined;
      if (Array.isArray(favs)) {
        setIsFavorited(favs.some((v) => v.id === verseId));
      }
    };

    window.addEventListener(EVENT_NAME, handler as EventListener);
    return () => window.removeEventListener(EVENT_NAME, handler as EventListener);
  }, [verseId]);

  const toggleFavorite = useCallback((): boolean => {
    const favs = readFavorites();
    const existsIndex = favs.findIndex((v) => v.id === verseId);
    const exists = existsIndex !== -1;

    const updatedFavs = exists
      ? favs.filter((v) => v.id !== verseId)
      : [
          ...favs,
          { id: verseId, verseNumber, surahName, text: verseText, surahId },
        ];

    writeFavorites(updatedFavs);
    setIsFavorited(!exists);
    return !exists;
  }, [verseId, verseNumber, surahName, verseText, surahId]);

  return { isFavorited, toggleFavorite };
};
