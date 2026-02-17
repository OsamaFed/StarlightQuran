"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { surahs } from "@/data/surahs";
import { useQuran } from "@/hooks/useQuran";
import { useTheme } from "@/hooks/useTheme";
import { PageHeader } from "@/components/layout";
import { SearchInput, Pagination, ScrollToTop } from "@/components/common";
import { SurahSelector, VerseCard, SurahFavorites, SurahStarButton, SearchResults } from "@/components/features";
import VerseFavorites from "@/components/features/VerseFavorites";
import { FontControls } from "@/components/ui";
import { WaqfGuide } from "@/components/common";
import styles from "./mushaf.module.css";

export default function MushafPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const {
    currentSurah,
    currentPage,
    currentVerses,
    totalPages,
    loading,
    error,
    loadSurah,
    loadTafseer,
    unloadSurah,
    nextPage,
    prevPage,
    goToPage,
    goToVerse,
    nextSurah,
    prevSurah,
  } = useQuran();

  const [mounted, setMounted] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [showWaqfGuide, setShowWaqfGuide] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<{
    surahNumber: number;
    verseNumber: number;
  } | null>(null);

  
  const handleLoadTafseer = useCallback(async (ayahNumber: number): Promise<string | null> => {
    if (!currentSurah) return null;
    
    const ayahNumberInSurah = ayahNumber; 
    return loadTafseer(currentSurah.number, ayahNumberInSurah);
  }, [currentSurah, loadTafseer]);

  const versesContainerRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredSurahs = searchTerm.length > 0
    ? surahs.filter((surah) =>
        surah.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 2, 36));
  const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 2, 18));

  const handleSurahSelect = (surahId: number | null) => {
    if (surahId === null) {
      unloadSurah();
      setShowWaqfGuide(false);
      setSearchTerm("");
      setShowResults(false);
      setTimeout(() => {
        introRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
      return;
    }
    loadSurah(surahId);
    setShowWaqfGuide(false);
    setSearchTerm("");
    setShowResults(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowResults(value.length > 0);
  };

  const scrollToVerseWithHighlight = useCallback((verseNumber: number, retryCount = 0) => {
    const verseElement = document.querySelector(
      `[data-verse-number="${verseNumber}"]`
    ) as HTMLElement | null;

    if (verseElement) {
      verseElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      setHighlightedVerse(verseNumber);
      setTimeout(() => setHighlightedVerse(null), 3000);
    } else if (retryCount < 3) {
      setTimeout(() => {
        scrollToVerseWithHighlight(verseNumber, retryCount + 1);
      }, 200 * (retryCount + 1));
    }
  }, []);

  useEffect(() => {
    const handleNavigateToVerse = async (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (!detail?.surahNumber || detail.verseNumber === undefined) return;

      const { surahNumber, verseNumber } = detail;
      if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) return;

      if (currentSurah?.number !== surahNumber) {
        await loadSurah(surahNumber);
      }

      setPendingNavigation({ surahNumber, verseNumber });
    };

    window.addEventListener("navigateToVerse", handleNavigateToVerse as EventListener);
    return () => window.removeEventListener("navigateToVerse", handleNavigateToVerse as EventListener);
  }, [currentSurah?.number, loadSurah]);

  useEffect(() => {
    if (introRef.current && !currentSurah && !loading && !error) {
      const nodes = Array.from(introRef.current.children) as HTMLElement[];
      
      gsap.to(nodes, {
        y: 0,
        opacity: 1,
        stagger: 0.05,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [currentSurah, loading, error]);

  useEffect(() => {
    if (!pendingNavigation || loading) return;
    if (currentSurah?.number !== pendingNavigation.surahNumber) return;
    if (currentVerses.length === 0) return;

    const { verseNumber } = pendingNavigation;
    const verseExists = currentVerses.some(
      (verse) => verse.numberInSurah === verseNumber
    );

    if (!verseExists) {
      goToVerse(verseNumber);
    } else {
      setPendingNavigation(null);
      setTimeout(() => {
        scrollToVerseWithHighlight(verseNumber);
      }, 0);
    }
  }, [currentSurah, currentVerses, loading, pendingNavigation, goToVerse, scrollToVerseWithHighlight]);

  useEffect(() => {
    versesContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  function showbis(){
    return(
      <div className={styles.Bismallah}>
        <h1>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</h1>
      </div>
    )
  }

  return (
    <div className={`${styles.wrapper} ${mounted && isDarkMode ? styles.darkMode : ""}`}>
      <div className={styles.container}>
        <PageHeader
          isDarkMode={isDarkMode}
          onToggle={toggleDarkMode}
          backLink="/"
          backText="العودة للرئيسية"
          showDarkModeToggle={true}
        />
        <header className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.titleText}>وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا</h1>
          </div>
          <div className={styles.controlsGrid}>
            <div className={styles.searchAndSurahSection}>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
              />
              <div className={styles.SearchResults}>
                <SearchResults
                  results={filteredSurahs}
                  isVisible={showResults}
                  onSelect={handleSurahSelect}
                />
              </div>
              <SurahSelector
                currentSurahId={currentSurah?.number}
                onSelect={handleSurahSelect}
              />
            </div>
            <div className={styles.favoritesSection}>
              <SurahFavorites onSelect={handleSurahSelect} />
              <VerseFavorites />
            </div>
          </div>
          <div className={styles.fontControlsCenter}>
            <FontControls
              onIncrease={increaseFontSize}
              onDecrease={decreaseFontSize}
            />
          </div>
        </header>

        <div className={styles.quranFrame}>
          <div className={styles.quranContent} style={{ fontSize: `${fontSize}px` }} translate="no">
            <div className={styles.versesContainer} ref={versesContainerRef} translate="no">
              {loading && <p className={styles.loadingText}>جاري تحميل السورة...</p>}
              {error && <p className={styles.errorText}>{error}</p>}
              {!loading && !error && !currentSurah && (
                <div className={styles.introContainer} ref={introRef}>
                  <p className={styles.introTitle}>
                    اختر سورة من المصحف، ثم حدِّد الآية المراد التفاعل معها. اضغط مطوّلًا على الآية، أو استخدم زر الفأرة الأيمن في حال كنت على جهاز حاسب
                  </p>
                  <p className={styles.introSubtitle}>بعد ذلك يمكنك:</p>
                  <ul className={styles.introList}>
                    <li>حفظ صورة الآية</li>
                    <li>مشاركة الآية مع غيرك</li>
                    <li>نسخ نص الآية</li>
                  </ul>
                  <p className={styles.introFooter}>خذ وقتك مع الآيات… فالقرآن يُقرأ بتدبّر</p>
                </div>
              )}
              {currentSurah && (
                <>
                  <div className={styles.waqfDropdownContainer}>
                    <button
                      className={styles.waqfDropdownBtn}
                      onClick={() => setShowWaqfGuide(!showWaqfGuide)}
                    >
                      <span>علامات الوقف والضبط</span>
                      <span className={`${styles.dropdownArrow} ${showWaqfGuide ? styles.arrowUp : ""}`}>▼</span>
                    </button>
                    {showWaqfGuide && (
                      <div className={styles.waqfDropdownContent}>
                        <WaqfGuide />
                      </div>
                    )}
                  </div>
                  <div className={styles.surahIndicator}>
                    <span className={styles.surahName}>{currentSurah.name}</span>
                    <SurahStarButton surahNumber={currentSurah.number} />
                  </div>

                  {currentPage === 1 && currentSurah.number !== 1 && currentSurah.number !== 9 && showbis()}

                  {currentVerses.map((ayah) => (
                    <VerseCard
                      key={ayah.number}
                      ayah={ayah}
                      verseNumber={ayah.numberInSurah}
                      surahName={currentSurah.name}
                      surahId={currentSurah.number}
                      isDarkMode={isDarkMode}
                      onLoadTafseer={handleLoadTafseer}
                      fontSize={fontSize}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {currentSurah && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onNextPage={nextPage}
            onPrevPage={prevPage}
            onGoToPage={goToPage}
            onNextSurah={nextSurah}
            onPrevSurah={prevSurah}
            hasNextSurah={currentSurah.number < 114}
            hasPrevSurah={currentSurah.number > 1}
            isDarkMode={isDarkMode}
          />
        )}
        <ScrollToTop isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}
