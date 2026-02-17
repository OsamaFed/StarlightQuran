



interface GlobalMenuState {
  currentOpenId: string | null;
  currentPlayingAudioId: string | null;
}

export const globalMenuState: GlobalMenuState = {
  currentOpenId: null,
  currentPlayingAudioId: null,
};


export const setCurrentOpenMenu = (verseId: string | null): void => {
  globalMenuState.currentOpenId = verseId;
};

export const getCurrentOpenMenu = (): string | null =>
  globalMenuState.currentOpenId;

export const closeMenuAndClear = (verseId: string): void => {
  if (globalMenuState.currentOpenId === verseId) {
    globalMenuState.currentOpenId = null;
  }
};


export const setGlobalAudioPlaying = (verseId: string | null): void => {
  
  if (
    globalMenuState.currentPlayingAudioId &&
    globalMenuState.currentPlayingAudioId !== verseId &&
    typeof window !== "undefined"
  ) {
    window.dispatchEvent(
      new CustomEvent("ayahaudio:stop", {
        detail: { verseId: globalMenuState.currentPlayingAudioId },
      })
    );
  }
  globalMenuState.currentPlayingAudioId = verseId;
};

export const getCurrentPlayingAudio = (): string | null =>
  globalMenuState.currentPlayingAudioId;


export const resetGlobalState = (): void => {
  globalMenuState.currentOpenId = null;
  globalMenuState.currentPlayingAudioId = null;
};
