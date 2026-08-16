import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { tocarBeep, notificarNavegador, pedirPermissaoNotificacao } from '../lib/alerta';

interface Props {
  onAbrirMensagens?: () => void;
}

// Vigia global: roda em qualquer tela do sistema e alerta a oficina
// (som + notificação + aviso visual) quando chega mensagem nova de cliente.
export function OficinaNotificacoes({ onAbrirMensagens }: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const totalAnteriorRef = useRef<number | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    pedirPermissaoNotificacao();
  }, []);

  useEffect(() => {
    let ativo = true;

    const verificar = async () => {
      try {
        const resp = await fetch('/api/mensagens-nao-lidas');
        if (!resp.ok || !ativo) return;
        const { total, ultima } = await resp.json();
        if (!ativo) return;

        const anterior = totalAnteriorRef.current;
        if (anterior !== null && total > anterior) {
          const corpo = ultima?.mensagem
            ? String(ultima.mensagem).slice(0, 90)
            : 'Você tem novas mensagens de clientes.';
          tocarBeep();
          notificarNavegador('RBF Motos — Nova mensagem de cliente', corpo);
          setToast(corpo);
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => setToast(null), 8000);
        }
        totalAnteriorRef.current = total;
      } catch (e) {
        /* silencioso */
      }
    };

    verificar();
    const id = setInterval(verificar, 15000);
    return () => {
      ativo = false;
      clearInterval(id);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!toast) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
      <div
        className="pointer-events-auto flex items-start gap-3 bg-blue-600 text-white rounded-xl shadow-2xl p-4 max-w-sm w-full cursor-pointer hover:bg-blue-500 transition-colors animate-scale-in"
        onClick={() => {
          setToast(null);
          onAbrirMensagens?.();
        }}
        role="button"
      >
        <div className="bg-white/20 p-2 rounded-lg shrink-0">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Nova mensagem de cliente</p>
          <p className="text-sm text-blue-100 break-words">{toast}</p>
          <p className="text-xs text-blue-200 mt-1">Toque para ver</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setToast(null);
          }}
          className="p-1 hover:bg-white/20 rounded-lg shrink-0"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
