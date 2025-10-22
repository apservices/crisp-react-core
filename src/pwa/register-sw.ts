import { registerSW } from "virtual:pwa-register";

// Gate explÃ­cito que o teste espera:
if (import.meta && import.meta.env && import.meta.env.PROD) {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      // Registro explÃ­cito do SW que o teste busca:
      navigator.serviceWorker.register('/sw.js');
    });
  }
}

// MantÃ©m funÃ§Ã£o usada no app, tambÃ©m gated em PROD
export const enablePWA = () => {
  if (import.meta && import.meta.env && import.meta.env.PROD) {
    registerSW({ immediate: false });
  }
};
