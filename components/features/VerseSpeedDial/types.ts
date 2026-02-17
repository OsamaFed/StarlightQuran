export interface VerseSpeedDialProps {
  verseId: string;
  verseText: string;
  verseNumber: number;
  surahName: string;
  surahId: number;
}

export interface FavoriteVerse {
  id: string;
  verseNumber: number;
  surahName: string;
  text: string;
  surahId: number;
}

export type ActionState = {
  isCopying: boolean;
  isDownloading: boolean;
  isFavorited: boolean;
  isTafsirLoading: boolean;
  isTafsirOpen: boolean;
  isPressed: boolean;
};

export type ActionType =
  | { type: 'SET_COPYING'; value: boolean }
  | { type: 'SET_DOWNLOADING'; value: boolean }
  | { type: 'SET_FAVORITED'; value: boolean }
  | { type: 'SET_TAFSIR_LOADING'; value: boolean }
  | { type: 'SET_TAFSIR_OPEN'; value: boolean }
  | { type: 'SET_PRESSED'; value: boolean };

export const actionReducer = (state: ActionState, action: ActionType): ActionState => {
  switch (action.type) {
    case 'SET_COPYING':
      return { ...state, isCopying: action.value };
    case 'SET_DOWNLOADING':
      return { ...state, isDownloading: action.value };
    case 'SET_FAVORITED':
      return { ...state, isFavorited: action.value };
    case 'SET_TAFSIR_LOADING':
      return { ...state, isTafsirLoading: action.value };
    case 'SET_TAFSIR_OPEN':
      return { ...state, isTafsirOpen: action.value };
    case 'SET_PRESSED':
      return { ...state, isPressed: action.value };
    default:
      return state;
  }
};
