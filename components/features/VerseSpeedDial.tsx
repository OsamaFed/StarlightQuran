"use client";

import { useState, useEffect, useRef, useReducer, useCallback, memo } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import CheckIcon from "@mui/icons-material/Check";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import gsap from "gsap";
import { useTheme } from "@/hooks/useTheme";

import { useAyahAudio } from "./VerseSpeedDial/hooks/useAyahAudio"; 
import { VerseSpeedDialProps, ActionType, ActionState } from "./VerseSpeedDial/types";
import { TIMING } from "./VerseSpeedDial/constants";
import { closeMenuAndClear } from "./VerseSpeedDial/utils/globalState";
import { captureElementAsBlob } from "./VerseSpeedDial/utils/captureElement";
import { actionReducer } from "./VerseSpeedDial/types";

import { useLongPress } from "./VerseSpeedDial/hooks/useLongPress";
import { useFavorites } from "./VerseSpeedDial/hooks/useFavorites";
import { useClickOutside } from "./VerseSpeedDial/hooks/useClickOutside";
import { useMenuAnimation } from "./VerseSpeedDial/hooks/useMenuAnimation";
import { usePressedStyle } from "./VerseSpeedDial/hooks/usePressedStyle";
import { useTafsirStatus } from "./VerseSpeedDial/hooks/useTafsirStatus";
import { useOtherMenuHandler } from "./VerseSpeedDial/hooks/useOtherMenuHandler";
import { useTafsirVisibilityToggle } from "./VerseSpeedDial/hooks/useTafsirVisibilityToggle";
import { useScrollHandler } from "./VerseSpeedDial/hooks/useScrollHandler";

function VerseSpeedDial({
  verseId,
  verseText,
  verseNumber,
  surahName,
  surahId,
}: VerseSpeedDialProps) {
  const { isDarkMode } = useTheme();
  const lastObjectUrlRef = useRef<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const favoriteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tafsirTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isPlaying, togglePlay } = useAyahAudio(surahId, verseNumber, verseId);

  const [state, dispatch] = useReducer(actionReducer, {
    isCopying: false,
    isDownloading: false,
    isFavorited: false,
    isTafsirLoading: false,
    isTafsirOpen: false,
    isPressed: false,
  });

  const handleLongPress = useCallback(() => {
    setMenuVisible(true);
  }, []);

  const { isPressed, isLongPressTriggeredRef } = useLongPress(
    verseId,
    handleLongPress,
    true
  );

  const { isFavorited, toggleFavorite } = useFavorites(
    verseId,
    verseNumber,
    surahName,
    verseText,
    surahId
  );

  useEffect(() => {
    dispatch({ type: 'SET_FAVORITED', value: isFavorited });
  }, [isFavorited]);

  useEffect(() => {
    dispatch({ type: 'SET_PRESSED', value: isPressed });
  }, [isPressed]);

  const handleClose = useCallback(() => {
    setMenuVisible(false);
  }, []);

  useClickOutside(verseId, menuRef, menuVisible, handleClose, isLongPressTriggeredRef);
  useMenuAnimation(menuRef, menuVisible);
  usePressedStyle(verseId, state.isPressed, isDarkMode);
  const isTafsirOpen = useTafsirStatus();
  useOtherMenuHandler(verseId, menuVisible, handleClose);
  useTafsirVisibilityToggle(menuVisible);
  useScrollHandler();

  useEffect(() => {
    dispatch({ type: 'SET_TAFSIR_OPEN', value: isTafsirOpen });
  }, [isTafsirOpen]);

  useEffect(() => {
    return () => {
      if (lastObjectUrlRef.current) {
        try { URL.revokeObjectURL(lastObjectUrlRef.current); } catch (e) {}
        lastObjectUrlRef.current = null;
      }
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      if (favoriteTimeoutRef.current) clearTimeout(favoriteTimeoutRef.current);
      if (tafsirTimeoutRef.current) clearTimeout(tafsirTimeoutRef.current);
      closeMenuAndClear(verseId);
    };
  }, [verseId]);

  const handlePlayAudio = useCallback(() => {
    togglePlay();
  }, [togglePlay]);

  const handleCopy = useCallback(() => {
    const text = `${verseText}\n\n${surahName}:${verseNumber}`;
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      dispatch({ type: 'SET_COPYING', value: true });
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'SET_COPYING', value: false });
        closeMenuAndClear(verseId);
        setMenuVisible(false);
      }, TIMING.COPY_FEEDBACK_DURATION);
    }).catch((err) => {
      console.error(err);
    });
  }, [verseText, surahName, verseNumber, verseId]);

  const handleAddToFavorites = useCallback(() => {
    toggleFavorite();
    if (favoriteTimeoutRef.current) clearTimeout(favoriteTimeoutRef.current);
    favoriteTimeoutRef.current = setTimeout(() => {
      closeMenuAndClear(verseId);
      setMenuVisible(false);
    }, TIMING.FAVORITE_FEEDBACK_DURATION);
  }, [toggleFavorite, verseId]);

  const handleShare = useCallback(async () => {
    try {
      if ("share" in navigator) {
        await navigator.share({
          title: `${surahName}:${verseNumber}`,
          text: verseText,
        });
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error(err);
      }
    } finally {
      setMenuVisible(false);
      closeMenuAndClear(verseId);
    }
  }, [surahName, verseNumber, verseText, verseId]);

  const handleSavePhoto = useCallback(async () => {
    try {
      dispatch({ type: 'SET_DOWNLOADING', value: true });
      const verseElement = document.getElementById(verseId);
      if (!verseElement) return;

      const blob = await captureElementAsBlob(verseElement);
      if (!blob) return;

      if (lastObjectUrlRef.current) {
        try { URL.revokeObjectURL(lastObjectUrlRef.current); } catch (e) {}
      }

      const url = URL.createObjectURL(blob);
      lastObjectUrlRef.current = url;

      const link = document.createElement("a");
      link.href = url;
      link.download = `${surahName}_${verseNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        if (lastObjectUrlRef.current === url) {
          try { URL.revokeObjectURL(url); } catch (e) {}
          lastObjectUrlRef.current = null;
        }
      }, TIMING.URL_REVOKE_DELAY);
    } catch (err) {
      console.error(err);
    } finally {
      dispatch({ type: 'SET_DOWNLOADING', value: false });
      closeMenuAndClear(verseId);
      setMenuVisible(false);
    }
  }, [verseId, surahName, verseNumber]);

  const handleOpenTafsir = useCallback(() => {
    try {
      const ev = new CustomEvent("openTafsir", { detail: { verseId } });
      window.dispatchEvent(ev);
    } catch (e) {
      console.error(e);
    }

    dispatch({ type: 'SET_TAFSIR_LOADING', value: true });
    setMenuVisible(false);
    closeMenuAndClear(verseId);

    if (tafsirTimeoutRef.current) clearTimeout(tafsirTimeoutRef.current);
    tafsirTimeoutRef.current = setTimeout(() => {
      dispatch({ type: 'SET_TAFSIR_LOADING', value: false });
    }, TIMING.TAFSIR_LOADING_TIMEOUT);
  }, [verseId]);

  return (
    <>
      {menuVisible && (
        <div
          ref={menuRef}
          data-html2canvas-ignore="true"
          data-verse-speeddial
          role="toolbar"
          aria-label="Options"
          style={{
            position: "absolute",
            bottom: 6,
            left: 6,
            display: "flex",
            gap: 8,
            padding: 8,
            borderRadius: 12,
            zIndex: 50,
            alignItems: 'center',
            background: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.02)' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: isDarkMode ? '0 8px 30px rgba(0,0,0,0.25)' : '0 6px 20px rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(6px)',
            pointerEvents: 'auto',
            minWidth: 180,
          }}
        >
          <Tooltip title={isPlaying ? "إيقاف التلاوة" : "تلاوة الآية"}>
            <IconButton
              onClick={handlePlayAudio}
              aria-label={isPlaying ? "إيقاف التلاوة" : "تلاوة الآية"}
              size="small"
              sx={{
                color: isPlaying ? "#4caf50" : (isDarkMode ? "white" : "#0b0b0b"),
                bgcolor: "transparent",
                '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }
              }}
            >
              {isPlaying ? <StopIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Tooltip title="تفسير">
            <IconButton
              onClick={handleOpenTafsir}
              aria-label="تفسير"
              size="small"
              disabled={state.isTafsirLoading}
              data-tafsir-button
              sx={{
                color: isDarkMode ? "white" : "var(--highlight-color)",
                bgcolor: "transparent",
                boxShadow: isDarkMode ? "0 4px 16px rgba(58,123,213,0.08)" : "var(--shadow-xs)",
                border: "1px solid transparent",
                backdropFilter: "blur(6px)",
                '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' },
                '&:disabled': { opacity: 0.6 }
              }}
            >
              {state.isTafsirLoading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <MenuBookIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title={state.isFavorited ? "إزالة من المفضلة" : "إضافة للمفضلة"}>
            <IconButton
              onClick={handleAddToFavorites}
              aria-label={state.isFavorited ? "إزالة من المفضلة" : "إضافة للمفضلة"}
              size="small"
              sx={{
                color: state.isFavorited ? "#ffd700" : (isDarkMode ? "white" : "#0b0b0b"),
                bgcolor: "transparent",
                '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }
              }}
            >
              {state.isFavorited ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Tooltip title="نسخ">
            <IconButton
              onClick={handleCopy}
              aria-label="نسخ"
              size="small"
              sx={{
                color: isDarkMode ? "white" : "#0b0b0b",
                bgcolor: "transparent",
                '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }
              }}
            >
              {state.isCopying ? (
                <CheckIcon sx={{ color: "#4caf50" }} fontSize="small" />
              ) : (
                <ContentCopyIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="مشاركة">
            <IconButton
              onClick={handleShare}
              aria-label="مشاركة"
              size="small"
              sx={{
                color: isDarkMode ? "white" : "#0b0b0b",
                bgcolor: "transparent",
                '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }
              }}
            >
              <ShareIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="حفظ صورة">
            <IconButton
              onClick={handleSavePhoto}
              aria-label="حفظ صورة"
              size="small"
              disabled={state.isDownloading}
              sx={{
                color: isDarkMode ? "white" : "#0b0b0b",
                bgcolor: "transparent",
                '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' },
                '&:disabled': { opacity: 0.6 }
              }}
            >
              {state.isDownloading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveAltIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </div>
      )}
    </>
  );
}

export default memo(VerseSpeedDial);
