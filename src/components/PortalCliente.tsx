import { useState, useEffect, useRef } from 'react';
import { Search, Lock, Bike, Wrench, Clock, DollarSign, FileText, CheckCircle, AlertCircle, XCircle, X, ZoomIn, MessageCircle, Send } from 'lucide-react';
import { useOficinaData } from '../hooks/useOficinaData';

interface Mensagem {
  id: string;
  ordemId: string;
  remetente: 'cliente' | 'oficina';
  mensagem: string;
  data: string;
  lida: boolean;
}

interface OrdemServico {
  id: string;
  numero: string;
  clienteId: string;
  motoId: string;
  status: string;
  prioridade: string;
  descricaoProblema: string;
  observacoes?: string;
  valorTotal: number;
  dataAbertura: string;
  dataPrevisao?: string;
  tecnicoResponsavel?: string;
  servicos?: any[];
  pecas?: any[];
  itens?: string;
  fotos?: string[];
}

interface Cliente {
  nome: string;
  telefone: string;
}

interface Moto {
  marca: string;
  modelo: string;
  placa: string;
  ano: number;
}

export function PortalCliente() {
  const { ordens, clientes, motos, carregarOrdemComFotos } = useOficinaData();
  const [codigoAcesso, setCodigoAcesso] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [ordemAtual, setOrdemAtual] = useState<OrdemServico | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [moto, setMoto] = useState<Moto | null>(null);
  const [historicoServicos, setHistoricoServicos] = useState<OrdemServico[]>([]);
  const [error, setError] = useState('');
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);
  
  // Estados para mensagens
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

  // Preencher automaticamente o código da OS da URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const osParam = urlParams.get('os');
    if (osParam) {
      setCodigoAcesso(osParam);
      // Mostrar mensagem informativa
      setTimeout(() => {
        const infoElement = document.getElementById('codigo-preenchido-info');
        if (infoElement) {
          infoElement.style.display = 'block';
        }
      }, 100);
    }
  }, []);

  const handleBuscar = async () => {
    setError('');
    
    // Normalizar código de acesso (remover "OS-" se existir e converter para maiúsculas)
    const codigoNormalizado = codigoAcesso.toUpperCase().replace(/^OS-?/i, '');
    
    // Buscar ordem pelo número (aceita com ou sem OS-)
    const ordem = ordens.find((o: any) => {
      const numeroOrdem = o.numero.toUpperCase().replace(/^OS-?/i, '');
      return numeroOrdem === codigoNormalizado;
    });
    
    if (!ordem) {
      setError('Código de acesso inválido. Verifique o número da ordem de serviço.');
      return;
    }

    // Buscar dados do cliente e moto
    const clienteData = clientes.find((c: any) => c.id === ordem.clienteId);
    const motoData = motos.find((m: any) => m.id === ordem.motoId);

    // Processar itens se existirem
    const ordemProcessada: any = { ...ordem };
    if (ordem.itens) {
      try {
        const itensParseados = typeof ordem.itens === 'string' ? JSON.parse(ordem.itens) : ordem.itens;
        const itensArray = Array.isArray(itensParseados) ? itensParseados : [];
        const servicosItens = itensArray.filter((item: any) => item.tipo === 'servico');
        const pecasItens = itensArray.filter((item: any) => item.tipo === 'peca');
        ordemProcessada.servicos = servicosItens;
        ordemProcessada.pecas = pecasItens;
      } catch (e) {
        console.error('Erro ao processar itens:', e);
        ordemProcessada.servicos = [];
        ordemProcessada.pecas = [];
      }
    } else {
      ordemProcessada.servicos = [];
      ordemProcessada.pecas = [];
    }

    // Buscar histórico de serviços desta moto
    const historicoMoto = ordens
      .filter((o: any) => o.motoId === ordem.motoId && o.id !== ordem.id)
      .map((o: any) => {
        const ordemHist: any = { ...o };
        if (o.itens) {
          try {
            const itensParseados = typeof o.itens === 'string' ? JSON.parse(o.itens) : o.itens;
            const itensArray = Array.isArray(itensParseados) ? itensParseados : [];
            const servicosItens = itensArray.filter((item: any) => item.tipo === 'servico');
            const pecasItens = itensArray.filter((item: any) => item.tipo === 'peca');
            ordemHist.servicos = servicosItens;
            ordemHist.pecas = pecasItens;
          } catch (e) {
            console.error('Erro ao processar itens do histórico:', e);
            ordemHist.servicos = [];
            ordemHist.pecas = [];
          }
        } else {
          ordemHist.servicos = [];
          ordemHist.pecas = [];
        }
        return ordemHist;
      })
      .sort((a: any, b: any) => new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime());

    setOrdemAtual(ordemProcessada);
    setCliente(clienteData || null);
    setMoto(motoData || null);
    setHistoricoServicos(historicoMoto);
    setAuthenticated(true);

    // Carregar mensagens da ordem
    carregarMensagens(ordemProcessada.id);

    // A listagem de ordens é carregada sem fotos (por performance).
    // Buscar a ordem completa sob demanda para exibir as fotos no portal.
    try {
      const ordemCompleta = await carregarOrdemComFotos(ordem.id);
      if (ordemCompleta && Array.isArray(ordemCompleta.fotos)) {
        setOrdemAtual((atual) =>
          atual && atual.id === ordem.id
            ? { ...atual, fotos: ordemCompleta.fotos }
            : atual
        );
      }
    } catch (e) {
      console.error('Erro ao carregar fotos da ordem:', e);
    }
  };

  // Atualizar mensagens automaticamente quando autenticado
  useEffect(() => {
    if (authenticated && ordemAtual) {
      // Atualizar a cada 3 segundos (tempo real)
      const interval = setInterval(() => {
        carregarMensagens(ordemAtual.id);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [authenticated, ordemAtual]);

  const carregarMensagens = async (ordemId: string) => {
    try {
      const API_URL = window.location.hostname === 'localhost' 
        ? '/api'
        : `/api`;

      const response = await fetch(`${API_URL}/mensagens/${ordemId}`);
      if (response.ok) {
        const data = await response.json();
        setMensagens(data);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const handleEnviarMensagem = async () => {
    if (!novaMensagem.trim() || !ordemAtual || enviandoMensagem) return;

    // Verificar se a ordem permite comunicação
    if (!['aberta', 'em_andamento', 'aguardando_peca'].includes(ordemAtual.status)) {
      alert('Não é possível enviar mensagens para ordens finalizadas ou canceladas.');
      return;
    }

    setEnviandoMensagem(true);

    try {
      const API_URL = window.location.hostname === 'localhost' 
        ? '/api'
        : `/api`;

      const response = await fetch(`${API_URL}/mensagens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ordemId: ordemAtual.id,
          remetente: 'cliente',
          mensagem: novaMensagem.trim(),
          data: new Date().toISOString(),
          lida: false
        })
      });

      if (response.ok) {
        setNovaMensagem('');
        await carregarMensagens(ordemAtual.id);
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

  const handleSair = () => {
    setAuthenticated(false);
    setOrdemAtual(null);
    setCliente(null);
    setMoto(null);
    setHistoricoServicos([]);
    setCodigoAcesso('');
    setError('');
    setMensagens([]);
    setNovaMensagem('');
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      aberta: { label: 'Aberta', color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', icon: Clock },
      em_andamento: { label: 'Em Andamento', color: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30', icon: Wrench },
      aguardando_peca: { label: 'Aguardando Peça', color: 'bg-orange-500/20 text-orange-300 border border-orange-500/30', icon: AlertCircle },
      pronta: { label: 'Pronta para Retirada', color: 'bg-green-500/20 text-green-300 border border-green-500/30', icon: CheckCircle },
      entregue: { label: 'Entregue', color: 'bg-slate-500/20 text-slate-300 border border-slate-500/30', icon: CheckCircle },
      cancelada: { label: 'Cancelada', color: 'bg-red-500/20 text-red-300 border border-red-500/30', icon: XCircle }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.aberta;
  };

  const getPrioridadeColor = (prioridade: string) => {
    const colors = {
      baixa: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
      media: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      alta: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
      urgente: 'bg-red-500/20 text-red-300 border border-red-500/30'
    };
    return colors[prioridade as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl dark:shadow-strong max-w-md w-full p-8 border border-gray-200 dark:border-gray-700 animate-scale-in">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-orange-600 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-yellow animate-pulse-slow">
              <Bike className="text-white" size={48} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent mb-2">
              Portal do Cliente
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Acompanhe seu serviço em tempo real</p>
          </div>

          <div className="space-y-5">
            {codigoAcesso && (
              <div id="codigo-preenchido-info" className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-400 dark:border-green-600 rounded-xl p-4 animate-fade-in shadow-soft">
                <p className="text-green-800 dark:text-green-300 text-sm text-center font-semibold">
                  ✅ Código de acesso preenchido automaticamente!
                  <br />
                  <span className="text-xs font-normal">Clique em "Entrar" para acessar seu serviço</span>
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Lock size={16} className="text-yellow-600 dark:text-yellow-400" />
                Código de Acesso
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={22} />
                <input
                  type="text"
                  value={codigoAcesso}
                  onChange={(e) => setCodigoAcesso(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
                  placeholder="Digite o número da OS (ex: OS-001)"
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-yellow-500/30 dark:focus:ring-yellow-400/30 focus:border-yellow-500 dark:focus:border-yellow-400 text-center text-xl font-bold transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                    codigoAcesso ? 'border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center font-medium">
                {codigoAcesso ? '🔓 Código carregado! Clique em Entrar' : '📱 O código foi enviado para você via WhatsApp'}
              </p>
            </div>

            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border-2 border-red-400 dark:border-red-600 rounded-xl p-4 animate-fade-in">
                <p className="text-red-800 dark:text-red-300 text-sm font-semibold text-center">{error}</p>
              </div>
            )}

            <button
              onClick={handleBuscar}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-orange-600 text-white py-4 rounded-xl hover:from-yellow-600 hover:to-yellow-700 dark:hover:from-yellow-500 dark:hover:to-orange-500 transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3 shadow-medium hover:shadow-strong hover:scale-105 transform"
            >
              <Search size={24} />
              Buscar Meu Serviço
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center font-medium">
              💬 Precisa de ajuda? Entre em contato conosco
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!ordemAtual) return null;

  const statusInfo = getStatusInfo(ordemAtual.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black p-2 sm:p-4 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-medium dark:shadow-strong p-4 sm:p-6 border border-gray-200 dark:border-gray-700 animate-slide-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Olá, {cliente?.nome}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg">Acompanhe seu serviço abaixo</p>
            </div>
            <button
              onClick={handleSair}
              className="w-full sm:w-auto px-5 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all duration-300 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:scale-105 transform shadow-soft"
            >
              Sair
            </button>
          </div>

          {/* Status Card */}
          <div className="bg-gradient-to-br from-yellow-500 via-yellow-600 to-orange-600 dark:from-yellow-600 dark:via-orange-600 dark:to-red-600 rounded-2xl p-4 sm:p-6 text-white shadow-glow-yellow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-xl">
                  <StatusIcon size={28} className="sm:w-9 sm:h-9" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm opacity-90 font-medium">Status do Serviço</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold drop-shadow-lg">{statusInfo.label}</p>
                </div>
              </div>
              <div className="w-full sm:w-auto text-left sm:text-right bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 rounded-xl border border-white/20">
                <p className="text-xs sm:text-sm opacity-90 font-medium">Ordem de Serviço</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold drop-shadow-lg">{ordemAtual.numero}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações da Moto */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-medium dark:shadow-strong p-4 sm:p-6 border border-gray-200 dark:border-gray-700 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5 flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-orange-600 p-2 sm:p-3 rounded-xl shadow-soft">
              <Bike className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            Informações da Moto
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1 uppercase tracking-wide">Marca/Modelo</p>
              <p className="font-bold text-gray-900 dark:text-white text-base sm:text-lg break-words">{moto?.marca} {moto?.modelo}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1 uppercase tracking-wide">Placa</p>
              <p className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">{moto?.placa}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1 uppercase tracking-wide">Ano</p>
              <p className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">{moto?.ano}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1 uppercase tracking-wide">Contato</p>
              <p className="font-bold text-gray-900 dark:text-white text-base sm:text-lg break-all">{cliente?.telefone}</p>
            </div>
          </div>
        </div>

        {/* Detalhes do Serviço */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-medium dark:shadow-strong p-4 sm:p-6 border border-gray-200 dark:border-gray-700 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5 flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-orange-600 p-2 sm:p-3 rounded-xl shadow-soft">
              <Wrench className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            Detalhes do Serviço
          </h2>
          
          <div className="space-y-4 sm:space-y-5">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 sm:p-5 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400 font-bold mb-2 uppercase tracking-wide">Problema Relatado</p>
              <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base md:text-lg leading-relaxed break-words">{ordemAtual.descricaoProblema}</p>
            </div>

            {ordemAtual.observacoes && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 sm:p-5 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-400 font-bold mb-2 uppercase tracking-wide">Observações</p>
                <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base md:text-lg leading-relaxed break-words">{ordemAtual.observacoes}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 sm:pt-5 border-t-2 border-gray-200 dark:border-gray-700">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-2 uppercase tracking-wide flex items-center gap-2">
                  <Clock size={14} className="text-yellow-600 dark:text-yellow-400" />
                  Data de Abertura
                </p>
                <p className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">
                  {new Date(ordemAtual.dataAbertura).toLocaleDateString('pt-BR')}
                </p>
              </div>
              {ordemAtual.dataPrevisao && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 sm:p-4 rounded-xl border-2 border-green-400 dark:border-green-600">
                  <p className="text-xs text-green-700 dark:text-green-400 font-semibold mb-2 uppercase tracking-wide flex items-center gap-2">
                    <Clock size={14} className="text-green-600 dark:text-green-400" />
                    Previsão de Entrega
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">
                    {new Date(ordemAtual.dataPrevisao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
              {ordemAtual.tecnicoResponsavel && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-2 uppercase tracking-wide">Técnico Responsável</p>
                  <p className="font-bold text-gray-900 dark:text-white text-base sm:text-lg break-words">{ordemAtual.tecnicoResponsavel}</p>
                </div>
              )}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-2 uppercase tracking-wide">Prioridade</p>
                <span className={`inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-soft ${getPrioridadeColor(ordemAtual.prioridade)}`}>
                  {ordemAtual.prioridade.charAt(0).toUpperCase() + ordemAtual.prioridade.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Serviços e Peças */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-medium dark:shadow-strong p-4 sm:p-6 border border-gray-200 dark:border-gray-700 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5 flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-orange-600 p-2 sm:p-3 rounded-xl shadow-soft">
              <FileText className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            Serviços e Peças
          </h2>

          {ordemAtual.servicos && ordemAtual.servicos.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 uppercase tracking-wide">Serviços Realizados</p>
              <div className="space-y-2">
                {ordemAtual.servicos.map((servico: any, idx: number) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 sm:p-4 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-soft transition-all">
                    <span className="text-gray-900 dark:text-gray-100 font-medium flex items-center gap-2 text-sm sm:text-base break-words">
                      <Wrench size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      {servico.nome}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">
                      R$ {(servico.preco || servico.precoUnitario || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ordemAtual.pecas && ordemAtual.pecas.length > 0 && (
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 uppercase tracking-wide">Peças Utilizadas</p>
              <div className="space-y-2">
                {ordemAtual.pecas.map((peca: any, idx: number) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 sm:p-4 rounded-xl border border-green-200 dark:border-green-800 hover:shadow-soft transition-all">
                    <span className="text-gray-900 dark:text-gray-100 font-medium text-sm sm:text-base break-words">
                      {peca.nome} <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">(x{peca.quantidade || 1})</span>
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">
                      R$ {((peca.preco || peca.precoUnitario || 0) * (peca.quantidade || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!ordemAtual.servicos || ordemAtual.servicos.length === 0) && (!ordemAtual.pecas || ordemAtual.pecas.length === 0) && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FileText size={48} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium text-sm sm:text-base">Nenhum serviço ou peça registrado nesta ordem</p>
            </div>
          )}
        </div>

        {/* Valor Total */}
        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 rounded-2xl shadow-medium dark:shadow-strong p-4 sm:p-6 border-2 border-green-400 dark:border-green-600 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 p-3 sm:p-4 rounded-2xl shadow-glow-yellow">
                <DollarSign className="text-white w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-green-700 dark:text-green-400 font-bold uppercase tracking-wide mb-1">Valor Total</p>
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white drop-shadow-lg">
                  R$ {ordemAtual.valorTotal.toFixed(2)}
                </p>
              </div>
            </div>
            {ordemAtual.status === 'pronta' && (
              <div className="w-full sm:w-auto text-left sm:text-right bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl border-2 border-green-400 dark:border-green-600 shadow-soft">
                <p className="text-green-600 dark:text-green-400 font-bold mb-2 text-base sm:text-lg md:text-xl flex items-center sm:justify-end gap-2">
                  <CheckCircle size={20} className="sm:w-6 sm:h-6" />
                  Serviço Concluído!
                </p>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">Retire sua moto quando desejar</p>
              </div>
            )}
          </div>
        </div>

        {/* Fotos */}
        {ordemAtual.fotos && ordemAtual.fotos.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-medium dark:shadow-strong p-4 sm:p-6 border border-gray-200 dark:border-gray-700 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5 flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-orange-600 p-2 sm:p-3 rounded-xl shadow-soft">
                <FileText className="text-white w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              Fotos do Serviço
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {ordemAtual.fotos.map((foto, idx) => (
                <div 
                  key={idx} 
                  className="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-yellow-400 dark:hover:border-yellow-500 transition-all hover:shadow-medium cursor-pointer"
                  onClick={() => setFotoAmpliada(foto)}
                >
                  <img
                    src={foto}
                    alt={`Foto ${idx + 1}`}
                    className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-3 left-3 text-white font-bold text-sm sm:text-base flex items-center gap-2">
                      <ZoomIn size={18} />
                      Foto {idx + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat com a Oficina */}
        {['aberta', 'em_andamento', 'aguardando_peca'].includes(ordemAtual.status) && (
          <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700/50 p-4 sm:p-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-100 mb-4 sm:mb-5 flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-400 p-2 sm:p-3 rounded-xl shadow-lg">
                <MessageCircle className="text-white w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              Chat com a Oficina
            </h2>

            {/* Área de Mensagens */}
            <div className="bg-slate-900 rounded-xl p-4 mb-4 h-64 sm:h-80 overflow-y-auto space-y-3">
              {mensagens.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <MessageCircle size={48} className="mb-3 opacity-50" />
                  <p className="text-sm sm:text-base text-center">
                    Nenhuma mensagem ainda.<br />
                    Envie uma mensagem para a oficina!
                  </p>
                </div>
              ) : (
                mensagens.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.remetente === 'cliente' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-3 sm:p-4 ${
                        msg.remetente === 'cliente'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900'
                          : 'bg-slate-700 text-slate-100 border border-slate-600'
                      }`}
                    >
                      <p className="text-xs font-semibold mb-1 opacity-75">
                        {msg.remetente === 'cliente' ? 'Você' : 'Oficina'}
                      </p>
                      <p className="text-sm sm:text-base break-words">{msg.mensagem}</p>
                      <p className="text-xs mt-2 opacity-60">
                        {new Date(msg.data).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={mensagensEndRef} />
            </div>

            {/* Input de Nova Mensagem */}
            <div className="flex gap-2">
              <input
                type="text"
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEnviarMensagem()}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all"
                disabled={enviandoMensagem}
              />
              <button
                onClick={handleEnviarMensagem}
                disabled={!novaMensagem.trim() || enviandoMensagem}
                className="px-4 sm:px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-amber-500/30"
              >
                <Send size={18} />
                <span className="hidden sm:inline">Enviar</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-3 text-center">
              💬 A oficina responderá suas dúvidas em breve
            </p>
          </div>
        )}

        {/* Aviso quando ordem está finalizada */}
        {!['aberta', 'em_andamento', 'aguardando_peca'].includes(ordemAtual.status) && mensagens.length > 0 && (
          <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700/50 p-4 sm:p-6 animate-slide-up">
            <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <AlertCircle className="text-blue-400 flex-shrink-0" size={24} />
              <div>
                <p className="text-slate-100 font-semibold mb-1">Chat Encerrado</p>
                <p className="text-sm text-slate-400">
                  O chat foi encerrado pois esta ordem de serviço já foi finalizada. 
                  Você ainda pode visualizar as mensagens anteriores.
                </p>
              </div>
            </div>

            {/* Histórico de Mensagens (apenas leitura) */}
            <div className="bg-slate-900 rounded-xl p-4 mt-4 max-h-64 overflow-y-auto space-y-3">
              {mensagens.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.remetente === 'cliente' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-3 sm:p-4 ${
                      msg.remetente === 'cliente'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900'
                        : 'bg-slate-700 text-slate-100 border border-slate-600'
                    }`}
                  >
                    <p className="text-xs font-semibold mb-1 opacity-75">
                      {msg.remetente === 'cliente' ? 'Você' : 'Oficina'}
                    </p>
                    <p className="text-sm break-words">{msg.mensagem}</p>
                    <p className="text-xs mt-2 opacity-60">
                      {new Date(msg.data).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={mensagensEndRef} />
            </div>
          </div>
        )}

        {/* Histórico de Serviços da Moto */}
        {historicoServicos.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-medium dark:shadow-strong p-4 sm:p-6 border border-gray-200 dark:border-gray-700 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5 flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-500 dark:to-pink-600 p-2 sm:p-3 rounded-xl shadow-soft">
                <Clock className="text-white w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              Histórico de Serviços desta Moto
            </h2>
            
            <div className="space-y-3 sm:space-y-4">
              {historicoServicos.map((ordem) => {
                const statusHist = getStatusInfo(ordem.status);
                const StatusHistIcon = statusHist.icon;
                
                return (
                  <div key={ordem.id} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 sm:p-5 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 transition-all hover:shadow-soft">
                    {/* Cabeçalho da Ordem */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                          <StatusHistIcon size={18} className="text-purple-600 dark:text-purple-400 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">{ordem.numero}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(ordem.dataAbertura).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="w-full sm:w-auto">
                        <span className={`inline-block w-full sm:w-auto text-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold shadow-soft ${statusHist.color}`}>
                          {statusHist.label}
                        </span>
                      </div>
                    </div>

                    {/* Problema */}
                    <div className="mb-3 sm:mb-4">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1 uppercase tracking-wide">Problema</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 break-words">{ordem.descricaoProblema}</p>
                    </div>

                    {/* Serviços Realizados */}
                    {ordem.servicos && ordem.servicos.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-2 uppercase tracking-wide">Serviços Realizados</p>
                        <div className="space-y-1">
                          {ordem.servicos.map((servico: any, sIdx: number) => (
                            <div key={sIdx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-xs sm:text-sm bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                              <span className="text-gray-900 dark:text-gray-100 flex items-center gap-2 break-words">
                                <Wrench size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                {servico.nome}
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                R$ {(servico.preco || servico.precoUnitario || 0).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Peças Utilizadas */}
                    {ordem.pecas && ordem.pecas.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-2 uppercase tracking-wide">Peças Utilizadas</p>
                        <div className="space-y-1">
                          {ordem.pecas.map((peca: any, pIdx: number) => (
                            <div key={pIdx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-xs sm:text-sm bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800">
                              <span className="text-gray-900 dark:text-gray-100 break-words">
                                {peca.nome} <span className="text-xs text-gray-600 dark:text-gray-400">(x{peca.quantidade || 1})</span>
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                R$ {((peca.preco || peca.precoUnitario || 0) * (peca.quantidade || 1)).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Valor Total */}
                    <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200 dark:border-gray-600">
                      <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Valor Total</span>
                      <span className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                        R$ {ordem.valorTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {historicoServicos.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Clock size={48} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium">Nenhum histórico anterior encontrado</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Foto Ampliada */}
      {fotoAmpliada && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setFotoAmpliada(null)}
        >
          <button
            onClick={() => setFotoAmpliada(null)}
            className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-strong hover:scale-110 transition-all z-10"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>
          
          <div className="max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            <img
              src={fotoAmpliada}
              alt="Foto ampliada"
              className="max-w-full max-h-full object-contain rounded-lg shadow-strong animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
            Clique fora da imagem para fechar
          </div>
        </div>
      )}
    </div>
  );
}
