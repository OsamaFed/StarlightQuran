"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage("darkMode", false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');

    if (isDarkMode) {
      document.body.classList.add("darkMode");
      document.documentElement.setAttribute("data-theme", "dark");
      themeColorMeta?.setAttribute("content", "#0a0a12"); 
    } else {
      document.body.classList.remove("darkMode");
      document.documentElement.setAttribute("data-theme", "light");
      themeColorMeta?.setAttribute("content", "#7955B8");
    }
  }, [isDarkMode, mounted]);

  useEffect(() => {
    return () => {
      document.body.classList.remove("darkMode");
    };
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, [setIsDarkMode]);

  return { isDarkMode, toggleDarkMode, mounted };
}
