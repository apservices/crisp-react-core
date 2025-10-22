declare global {
  interface Window {
    audioCtx?: AudioContext;
    webkitAudioContext?: typeof AudioContext;
    __PWA_UPDATE_SW?: () => void;
  }
}
export {};
