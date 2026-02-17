"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Ayah } from "@/types";
import VerseSpeedDial from "./VerseSpeedDial";
import styles from "./VerseCard.module.css";

interface VerseCardProps {
  ayah: Ayah;
  verseNumber: number;
  surahName: string;
  surahId: number;
  isDarkMode: boolean;
  onLoadTafseer: (ayahNumber: number) => Promise<string | null>;
  fontSize?: number;
}

function VerseCard({
  ayah,
  verseNumber,
  surahName,
  surahId,
  isDarkMode,
  onLoadTafseer,
  fontSize = 24,
}: VerseCardProps) {
  const [showTafseer, setShowTafseer] = useState(false);
  const [tafseer, setTafseer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const verseId = useMemo(() => `verse-${surahId}-${ayah.numberInSurah}`, [surahId, ayah.numberInSurah]);

  const handleTafsirToggle = useCallback(async (ev: Event) => {
    try {
      const detail = (ev as CustomEvent).detail;
      if (!detail || !detail.verseId) return;
      if (detail.verseId !== verseId) return;

      
      if (showTafseer) {
        setShowTafseer(false);
        try {
          const evClosed = new CustomEvent("tafsirClosed", { detail: { verseId } });
          window.dispatchEvent(evClosed);
        } catch (e) {}
        return;
      }

      
      if (!tafseer) {
        setLoading(true);
        const tafseerText = await onLoadTafseer(ayah.number);
        setTafseer(tafseerText);
        setLoading(false);
        try {
          const evLoaded = new CustomEvent("tafsirLoaded", { detail: { verseId } });
          window.dispatchEvent(evLoaded);
        } catch (e) {}
      }

      setShowTafseer(true);
    } catch (e) {
      console.error(e);
    }
  }, [verseId, showTafseer, tafseer, onLoadTafseer, ayah.number]);

  useEffect(() => {
    setShowTafseer(false);
    setTafseer(null);
    setLoading(false);
  }, [surahId]);

  useEffect(() => {
    window.addEventListener("openTafsir", handleTafsirToggle as EventListener);
    return () => window.removeEventListener("openTafsir", handleTafsirToggle as EventListener);
  }, [handleTafsirToggle]);

  
  const dynamicStyle = useMemo(() => {
    const verseLength = ayah.text.length;
    let style: React.CSSProperties = {};

    if (verseLength < 50) {
      style = {
        padding: "12px 16px",
        marginBottom: "16px",
      };
    } else if (verseLength < 100) {
      style = {
        padding: "14px 18px",
        marginBottom: "18px",
      };
    } else if (verseLength < 200) {
      style = {
        padding: "20px",
        marginBottom: "24px",
      };
    } else if (verseLength < 300) {
      style = {
        padding: "24px",
        marginBottom: "28px",
      };
    } else {
      style = {
        padding: "28px",
        marginBottom: "32px",
      };
    }
    return style;
  }, [ayah.text.length])

  return (
    <div
      id={verseId}
      data-verse-number={ayah.numberInSurah}
      className={styles.verse}
      style={{ ...dynamicStyle, fontSize: `${fontSize}px` }}
    >
      <span className={styles.verseNumber}>{verseNumber}</span>
      <span className={styles.verseText}>{ayah.text}</span>
      {showTafseer && (
        <div className={styles.tafseerText}>
          {loading ? "جاري تحميل التفسير..." : tafseer}
        </div>
      )}
      <VerseSpeedDial
        verseId={verseId}
        verseText={ayah.text}
        verseNumber={verseNumber}
        surahName={surahName}
        surahId={surahId}
      />
    </div>
  );
}

export default memo(VerseCard);
