// Web Push — inscrição do portal do cliente para receber notificações.

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function pushSuportado(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Inscreve o navegador do cliente para receber push desta ordem.
 * Deve ser chamada a partir de um gesto do usuário (ex.: após buscar a OS).
 * Retorna true se a inscrição foi registrada com sucesso.
 */
export async function inscreverPushOrdem(ordemId: string): Promise<boolean> {
  try {
    if (!pushSuportado()) return false;

    // Buscar chave pública VAPID do backend
    const vapidResp = await fetch('/api/push/vapid-public-key');
    if (!vapidResp.ok) return false;
    const { publicKey, habilitado } = await vapidResp.json();
    if (!habilitado || !publicKey) return false;

    // Pedir permissão (só age se ainda não foi decidida)
    let permissao = Notification.permission;
    if (permissao === 'default') {
      permissao = await Notification.requestPermission();
    }
    if (permissao !== 'granted') return false;

    // Sem service worker registrado (ex.: ambiente de dev), não há como inscrever
    const existente = await navigator.serviceWorker.getRegistration();
    if (!existente) return false;

    // Garantir service worker pronto
    const registration = await navigator.serviceWorker.ready;

    // Reaproveitar inscrição existente ou criar nova
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    // Enviar inscrição ao backend, associada à ordem
    const resp = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ordemId, subscription }),
    });

    return resp.ok;
  } catch (error) {
    console.error('Erro ao inscrever push:', error);
    return false;
  }
}
