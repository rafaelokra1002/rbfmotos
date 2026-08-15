import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, User, Bike } from 'lucide-react';

interface Mensagem {
  id: string;
  ordemId: string;
  remetente: 'cliente' | 'oficina';
  mensagem: string;
  data: string;
  lida: boolean;
}

interface ChatOrdemProps {
  ordemId: string;
  ordemNumero: string;
  ordemStatus: string;
  clienteNome?: string;
  motoInfo?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatOrdem({ ordemId, ordemNumero, ordemStatus, clienteNome, motoInfo, isOpen, onClose }: ChatOrdemProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);
  const mensagensEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll quando novas mensagens chegarem
  useEffect(() => {
    if (mensagens.length > 0) {
      mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensagens]);

  useEffect(() => {
    if (isOpen) {
      carregarMensagens();
      // Atualizar a cada 3 segundos quando o chat estiver aberto (tempo real)
      const interval = setInterval(carregarMensagens, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, ordemId]);

  const carregarMensagens = async () => {
    try {
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:9001/api'
        : `http://${window.location.hostname}:9001/api`;

      const response = await fetch(`${API_URL}/mensagens/${ordemId}`);
      if (response.ok) {
        const data = await response.json();
        setMensagens(data);
        
        // Marcar mensagens do cliente como lidas
        await fetch(`${API_URL}/mensagens/${ordemId}/marcar-lidas`, {
          method: 'PATCH'
        });
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const handleEnviarMensagem = async () => {
    if (!novaMensagem.trim() || enviandoMensagem) return;

    setEnviandoMensagem(true);

    try {
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:9001/api'
        : `http://${window.location.hostname}:9001/api`;

      const response = await fetch(`${API_URL}/mensagens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ordemId,
          remetente: 'oficina',
          mensagem: novaMensagem.trim(),
          data: new Date().toISOString(),
          lida: false
        })
      });

      if (response.ok) {
        setNovaMensagem('');
        await carregarMensagens();
      } else {
        alert('Erro ao enviar mensagem. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Verifique sua conexão.');
    } finally {
      setEnviandoMensagem(false);
    }
  };

  const chatAtivo = ['aberta', 'em_andamento', 'aguardando_peca'].includes(ordemStatus);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-700/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Chat com Cliente</h2>
              <div className="flex flex-col gap-1 mt-1">
                <p className="text-sm text-blue-100">OS {ordemNumero}</p>
                {clienteNome && (
                  <div className="flex items-center gap-1.5 text-sm text-blue-100">
                    <User className="w-3.5 h-3.5" />
                    <span>{clienteNome}</span>
                  </div>
                )}
                {motoInfo && (
                  <div className="flex items-center gap-1.5 text-sm text-blue-100">
                    <Bike className="w-3.5 h-3.5" />
                    <span>{motoInfo}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group"
          >
            <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Área de Mensagens */}
        <div className="p-6">
          <div className="bg-slate-900 rounded-xl p-4 h-96 overflow-y-auto space-y-3 mb-4">
            {mensagens.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <MessageCircle size={48} className="mb-3 opacity-50" />
                <p className="text-sm text-center">
                  Nenhuma mensagem ainda.<br />
                  O cliente ainda não enviou nenhuma mensagem.
                </p>
              </div>
            ) : (
              mensagens.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.remetente === 'oficina' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-4 ${
                      msg.remetente === 'oficina'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900'
                        : 'bg-slate-700 text-slate-100 border border-slate-600'
                    }`}
                  >
                    <p className="text-xs font-semibold mb-1 opacity-75">
                      {msg.remetente === 'oficina' ? 'Você (Oficina)' : 'Cliente'}
                    </p>
                    <p className="text-sm break-words">{msg.mensagem}</p>
                    <p className="text-xs mt-2 opacity-60">
                      {new Date(msg.data).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {msg.remetente === 'cliente' && msg.lida && ' • ✓✓'}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={mensagensEndRef} />
          </div>

          {/* Input de Nova Mensagem */}
          {chatAtivo ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEnviarMensagem()}
                placeholder="Digite sua resposta..."
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all"
                disabled={enviandoMensagem}
              />
              <button
                onClick={handleEnviarMensagem}
                disabled={!novaMensagem.trim() || enviandoMensagem}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-amber-500/30"
              >
                <Send size={18} />
                Enviar
              </button>
            </div>
          ) : (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
              <p className="text-slate-300 text-sm">
                Chat encerrado. Esta ordem já foi finalizada.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
