"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { surahs } from "@/data/surahs";
import styles from "./SurahFavorites.module.css";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@/hooks/useTheme";

const STORAGE_KEY = "favoriteSurahs";
const EVENT_NAME = "favoriteChanged";


function loadFavorites(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveFavorites(arr: number[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, { detail: { favorites: arr }, bubbles: true })
    );
  } catch {
    
  }
}

export default function SurahFavorites({
  onSelect,
}: {
  onSelect?: (id: number) => void;
}) {
  const { isDarkMode } = useTheme();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  
  useEffect(() => {
    setMounted(true);
    setFavorites(loadFavorites());

    const handler = (ev: Event) => {
      const favs = (ev as CustomEvent).detail?.favorites as number[] | undefined;
      if (Array.isArray(favs)) setFavorites(favs);
    };

    window.addEventListener(EVENT_NAME, handler as EventListener);
    return () => window.removeEventListener(EVENT_NAME, handler as EventListener);
  }, []);

  
  useEffect(() => {
    if (!listRef.current || favorites.length === 0) return;
    try {
      gsap.from(listRef.current.children, {
        y: -10,
        stagger: 0.04,
        duration: 0.3,
        ease: "back.out(1.7)",
      });
    } catch {
      
    }
  }, [favorites]);

  const toggle = useCallback(
    (id: number) => {
      const next = favorites.includes(id)
        ? favorites.filter((s) => s !== id)
        : [id, ...favorites];
      setFavorites(next);
      saveFavorites(next);
    },
    [favorites]
  );

  const handleItemClick = useCallback(
    (e: React.MouseEvent, surahId: number) => {
      if ((e.target as HTMLElement).closest(`.${styles.remove}`)) return;
      onSelect?.(surahId);
    },
    [onSelect]
  );

  
  if (!mounted) {
    return (
      <div className={styles.container}>
        <details className={styles.details}>
          <summary className={styles.summary}>السور المفضلة (0)</summary>
        </details>
      </div>
    );
  }

  const favList = favorites
    .map((id) => surahs.find((s) => s.id === id))
    .filter(Boolean) as typeof surahs;

  return (
    <div className={styles.container}>
      <details className={styles.details}>
        <summary className={styles.summary}>
          السور المفضلة ({favList.length})
        </summary>
        <div ref={listRef} className={styles.list}>
          {favList.length === 0 && (
            <div className={styles.empty}>لا توجد سور مفضلة بعد</div>
          )}
          {favList.map((s) => (
            <div
              key={s.id}
              className={styles.item}
              onClick={(e) => handleItemClick(e, s.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelect?.(s.id);
              }}
              aria-label={`اختيار سورة ${s.name}`}
            >
              <span className={styles.name}>
                {s.id}. {s.name}
              </span>
              <button
                className={styles.remove}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(s.id);
                }}
                aria-label={`إزالة ${s.name} من المفضلة`}
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
