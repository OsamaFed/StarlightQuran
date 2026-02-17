import { useState, useCallback, useEffect, useRef } from "react";
import { SurahData, Ayah } from "@/types";

const VERSES_PER_PAGE = 12;
const STORAGE_KEY_SURAH = "quran_surah_id";
const STORAGE_KEY_PAGE = "quran_page";
const FETCH_TIMEOUT_MS = 6000; 


const surahCache = new Map<number, SurahData>();

const pendingRequests = new Map<number, Promise<SurahData | null>>();


function safeGetStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    
  }
}

function safeRemoveStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    
  }
}

export function useQuran() {
  const [currentSurah, setCurrentSurah] = useState<SurahData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  
  const fetchSurah = useCallback(
    async (surahId: number): Promise<SurahData | null> => {
      
      if (surahCache.has(surahId)) {
        return surahCache.get(surahId)!;
      }

      
      if (pendingRequests.has(surahId)) {
        return pendingRequests.get(surahId)!;
      }

      
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const fetchPromise = (async () => {
        try {
          const response = await fetch(`/api/quran/${surahId}`, {
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.message || `خطأ في الاتصال: ${response.status}`);
          }

          const result = await response.json();

          if (result.code !== 200 || !result.data) {
            throw new Error("بيانات السورة غير صالحة");
          }

          const rawData = result.data;
          const formattedSurah: SurahData = {
            number: rawData.number,
            name: rawData.name,
            englishName: rawData.englishName ?? "",
            englishNameTranslation: rawData.englishNameTranslation ?? "",
            revelationType: rawData.revelationType ?? "",
            numberOfAyahs: rawData.ayahs?.length ?? 0,
            ayahs: rawData.ayahs.map((ayah: any, index: number) => ({
              number: index + 1,
              numberInSurah: ayah.numberInSurah,
              text: ayah.text,
            })),
          };

          
          surahCache.set(surahId, formattedSurah);
          return formattedSurah;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        } finally {
          
          pendingRequests.delete(surahId);
        }
      })();

      
      pendingRequests.set(surahId, fetchPromise);

      return fetchPromise;
    },
    []
  );

  
  useEffect(() => {
    const savedSurahId = safeGetStorage(STORAGE_KEY_SURAH);
    const savedPage = safeGetStorage(STORAGE_KEY_PAGE);
    if (!savedSurahId) return;

    let cancelled = false;
    const init = async () => {
      try {
        const surahId = parseInt(savedSurahId, 10);
        if (isNaN(surahId) || surahId < 1 || surahId > 114) return;

        const pageNum = savedPage ? parseInt(savedPage, 10) : 1;
        const surah = await fetchSurah(surahId);

        if (!cancelled && surah) {
          setCurrentSurah(surah);
          setCurrentPage(isNaN(pageNum) ? 1 : pageNum);
        }
      } catch (err: any) {
        if (!cancelled && err.name !== "AbortError") {
          console.error("[useQuran] Failed to restore session:", err);
        }
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [fetchSurah]);

  
  useEffect(() => {
    if (currentSurah) {
      safeSetStorage(STORAGE_KEY_SURAH, currentSurah.number.toString());
      safeSetStorage(STORAGE_KEY_PAGE, currentPage.toString());
    }
  }, [currentSurah, currentPage]);

  
  const loadSurah = useCallback(
    async (surahId: number) => {
      setLoading(true);
      setError(null);
      try {
        const surah = await fetchSurah(surahId);
        if (surah) {
          setCurrentSurah(surah);
          setCurrentPage(1);
        } else {
          setError("عذراً، لم نتمكن من تحميل السورة");
        }
      } catch (err: any) {
        if (err.name === "AbortError") return; 
        setError(
          err.message?.includes("503")
            ? "انتهت مهلة الاتصال. تحقق من اتصالك بالإنترنت."
            : "حدث خطأ أثناء تحميل السورة"
        );
      } finally {
        setLoading(false);
      }
    },
    [fetchSurah]
  );

  const unloadSurah = useCallback(() => {
    abortControllerRef.current?.abort();
    setCurrentSurah(null);
    setCurrentPage(1);
    safeRemoveStorage(STORAGE_KEY_SURAH);
    safeRemoveStorage(STORAGE_KEY_PAGE);
  }, []);

  
  const loadTafseer = useCallback(
    async (surahNumber: number, ayahNumberInSurah: number) => {
      try {
        const response = await fetch(`/api/tafsir?surah=${surahNumber}&ayah=${ayahNumberInSurah}`);
        if (!response.ok) return null;

        const result = await response.json();
        return result.data?.tafsir || "التفسير غير متوفر حالياً";
      } catch (err) {
        console.error("[useQuran] Error loading tafseer:", err);
        return null;
      }
    },
    []
  );

  
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const totalPages = currentSurah
    ? Math.ceil(currentSurah.ayahs.length / VERSES_PER_PAGE)
    : 0;

  const currentVerses = currentSurah
    ? currentSurah.ayahs.slice(
        (currentPage - 1) * VERSES_PER_PAGE,
        currentPage * VERSES_PER_PAGE
      )
    : [];

  return {
    currentSurah,
    currentPage,
    currentVerses,
    totalPages,
    loading,
    error,
    loadSurah,
    loadTafseer,
    unloadSurah,
    nextPage: () => currentPage < totalPages && setCurrentPage((p) => p + 1),
    prevPage: () => currentPage > 1 && setCurrentPage((p) => p - 1),
    goToPage: (p: number) => setCurrentPage(p),
    goToVerse: (v: number) =>
      currentSurah && setCurrentPage(Math.ceil(v / VERSES_PER_PAGE)),
    nextSurah: () =>
      currentSurah &&
      currentSurah.number < 114 &&
      loadSurah(currentSurah.number + 1),
    prevSurah: () =>
      currentSurah &&
      currentSurah.number > 1 &&
      loadSurah(currentSurah.number - 1),
  };
}
