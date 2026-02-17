"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import styles from "./SurahFavorites.module.css";
import CloseIcon from "@mui/icons-material/Close";

const STORAGE_KEY = "favoriteVerses";
const EVENT_NAME = "favoriteVerseChanged";
const NAVIGATE_EVENT = "navigateToVerse";
const MIN_SURAH = 1;
const MAX_SURAH = 114;

interface FavoriteVerse {
  id: string;
  verseNumber: number;
  surahName: string;
  text: string;
  surahId?: number;
}


function isValidSurahNumber(num: number): boolean {
  return !isNaN(num) && num >= MIN_SURAH && num <= MAX_SURAH;
}

function getSurahNumber(verse: FavoriteVerse): number {
  const surahId = verse.surahId ?? parseInt(verse.id.split("-")[1]);
  return isValidSurahNumber(surahId) ? surahId : MIN_SURAH;
}

function loadFavorites(): FavoriteVerse[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: FavoriteVerse[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, { detail: { favorites }, bubbles: true })
    );
  } catch {
    
  }
}

export default function VerseFavorites() {
  const [favorites, setFavorites] = useState<FavoriteVerse[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedVerseId, setSelectedVerseId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const isNavigatingRef = useRef(false);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  
  useEffect(() => {
    setMounted(true);
    setFavorites(loadFavorites());

    const handleFavoriteChange = (ev: Event) => {
      const favs = (ev as CustomEvent).detail?.favorites as
        | FavoriteVerse[]
        | undefined;
      if (Array.isArray(favs)) setFavorites(favs);
    };

    window.addEventListener(EVENT_NAME, handleFavoriteChange as EventListener);
    return () =>
      window.removeEventListener(EVENT_NAME, handleFavoriteChange as EventListener);
  }, []);

  
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  
  useEffect(() => {
    if (!listRef.current || favorites.length === 0) return;
    try {
      gsap.from(listRef.current.children, {
        y: 10,
        stagger: 0.05,
        duration: 0.4,
        ease: "power2.out",
      });
    } catch {
      
    }
  }, [favorites]);

  const removeFavorite = useCallback(
    (id: string) => {
      const updated = favorites.filter((v) => v.id !== id);
      setFavorites(updated);
      saveFavorites(updated);
    },
    [favorites]
  );

  const handleSelectVerse = useCallback((verse: FavoriteVerse) => {
    if (isNavigatingRef.current) return;

    try {
      const surahNumber = getSurahNumber(verse);
      if (!isValidSurahNumber(surahNumber)) {
        console.error("[VerseFavorites] Invalid surah number:", surahNumber);
        return;
      }

      isNavigatingRef.current = true;
      setSelectedVerseId(verse.id);

      window.dispatchEvent(
        new CustomEvent(NAVIGATE_EVENT, {
          detail: {
            surahNumber,
            verseNumber: verse.verseNumber,
            scrollIntoView: true,
            source: "favorites",
          },
          bubbles: true,
          cancelable: false,
        })
      );

      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      navigationTimeoutRef.current = setTimeout(() => {
        isNavigatingRef.current = false;
      }, 1500);
    } catch (e) {
      console.error("[VerseFavorites] Error navigating to verse:", e);
      isNavigatingRef.current = false;
    }
  }, []);

  
  if (!mounted) {
    return (
      <div className={styles.container}>
        <details className={styles.details}>
          <summary className={styles.summary}>الآيات المفضلة</summary>
        </details>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <details className={styles.details}>
        <summary className={styles.summary}>
          الآيات المفضلة{favorites.length > 0 ? ` (${favorites.length})` : ""}
        </summary>
        <div ref={listRef} className={styles.list}>
          {favorites.length === 0 ? (
            <div className={styles.empty}>لا توجد آيات مفضلة بعد</div>
          ) : (
            favorites.map((verse) => (
              <div
                key={verse.id}
                className={`${styles.item} ${
                  selectedVerseId === verse.id ? styles.selected : ""
                }`}
                onClick={() => handleSelectVerse(verse)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleSelectVerse(verse);
                }}
                aria-label={`اذهب إلى ${verse.surahName}:${verse.verseNumber}`}
              >
                <span
                  className={styles.name}
                  title={`${verse.surahName}:${verse.verseNumber}`}
                >
                  {verse.surahName}:{verse.verseNumber}
                </span>
                <button
                  className={styles.remove}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(verse.id);
                    setSelectedVerseId(null);
                  }}
                  aria-label={`إزالة ${verse.surahName}:${verse.verseNumber} من المفضلة`}
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>
            ))
          )}
        </div>
      </details>
    </div>
  );
}
