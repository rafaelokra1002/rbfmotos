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

  // Se um chunk (import dinâmico) falhar ao carregar — típico após um novo
  // deploy com hashes diferentes — recarrega a página uma única vez para
  // buscar a versão nova, evitando a "tela preta".
  window.addEventListener('vite:preloadError', () => {
    if (!sessionStorage.getItem('rbf_reloaded_preload')) {
      sessionStorage.setItem('rbf_reloaded_preload', '1');
      window.location.reload();
    }
  });

  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    // Quando um novo Service Worker assume o controle, recarrega para aplicar
    // a versão nova (uma vez só, sem loop).
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

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
