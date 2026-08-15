// Registro do Service Worker e controle do prompt de instalação do PWA.
// Registrado apenas em produção para não interferir no hot-reload do Vite.

let deferredPrompt: any = null;

export function initPWA() {
  if (typeof window === 'undefined') return;

  // Captura o evento de instalação para podermos disparar depois via botão
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa:installable'));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa:installed'));
  });

  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Falha ao registrar o Service Worker:', err);
      });
    });
  }
}

export function canInstall() {
  return deferredPrompt !== null;
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome === 'accepted';
}
