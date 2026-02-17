export const TIMING = {
  LONG_PRESS_DELAY: 350,
  COPY_FEEDBACK_DURATION: 1000,
  FAVORITE_FEEDBACK_DURATION: 500,
  TAFSIR_LOADING_TIMEOUT: 2000,
  PRESS_TRANSITION: 120,
  MENU_ANIMATION_DURATION: 0.4,
  CLICK_OUTSIDE_DELAY: 100,
  URL_REVOKE_DELAY: 100,
  SCROLL_DEBOUNCE: 200,
} as const;

export const THRESHOLDS = {
  MOVE: 10,
} as const;

export const ANIMATION = {
  MENU_EASE: "back.out(1.7)",
  MENU_FROM: { opacity: 0, y: 20, scale: 0.8 },
  MENU_TO: { opacity: 1, y: 0, scale: 1 },
} as const;

export const CAPTURE_CONFIG = {
  SCALE: 4,
  IMAGE_FORMAT: "image/png" as const,
  IMAGE_QUALITY: 1,
  IMAGE_TIMEOUT: 5000,
} as const;
