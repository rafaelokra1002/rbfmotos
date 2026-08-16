// Alertas de mensagem em tempo real (som + notificação do navegador),
// usados tanto pela oficina quanto pelo portal do cliente enquanto a tela está aberta.

// Toca um bipe curto usando Web Audio (não precisa de arquivo de som).
export function tocarBeep() {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const fechar = () => ctx.close().catch(() => {});

    const tocar = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
      osc.onended = fechar;
    };

    // Alguns navegadores criam o contexto suspenso até um gesto do usuário
    if (ctx.state === 'suspended') {
      ctx.resume().then(tocar).catch(fechar);
    } else {
      tocar();
    }
  } catch (e) {
    /* silencioso */
  }
}

// Dispara uma notificação do navegador (se já autorizada).
export function notificarNavegador(title: string, body: string) {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/file.png', tag: 'rbf-mensagem' });
    }
  } catch (e) {
    /* silencioso */
  }
}

// Pede permissão de notificação uma única vez (se ainda não decidida).
export async function pedirPermissaoNotificacao() {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  } catch (e) {
    /* silencioso */
  }
}
