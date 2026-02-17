import { useEffect } from "react";
import { TIMING } from "../constants";

export const useScrollHandler = () => {
  useEffect(() => {
    const scrollTimeoutRef = { current: null as ReturnType<typeof setTimeout> | null };

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {}, TIMING.SCROLL_DEBOUNCE);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);
};
