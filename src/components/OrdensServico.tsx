import { useState, useEffect } from 'react';
import { useOficinaData } from '../hooks/useOficinaData';
import { OrdemServicoForm } from './OrdemServicoForm';
import { OrdemServicoWizard } from './OrdemServicoWizard';
import { PagamentoModal } from './PagamentoModal';
import { WhatsAppButton } from './WhatsAppButton';
import { HistoricoMoto } from './HistoricoMoto';
import { CompartilharPortal } from './CompartilharPortal';
import { ChatOrdem } from './ChatOrdem';
import { OrdemServico, Moto } from '../types';
import { Plus, Search, CreditCard as Edit, Calendar, Clock, DollarSign, User, Wrench, AlertTriangle, FileText, CheckCircle, MessageCircle } from 'lucide-react';
import { Card, CardBody } from './ui/Card';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';

interface OrdensServicoProps {
  ordemIdParaAbrir?: string;
  onChatAberto?: () => void;
}

export function OrdensServico({ ordemIdParaAbrir, onChatAberto }: OrdensServicoProps) {
  const { ordens, clientes, motos, adicionarOrdem, atualizarOrdem, removerOrdem, loading } = useOficinaData();
  const [showForm, setShowForm] = useState(false);
  const [editingOrdem, setEditingOrdem] = useState<OrdemServico | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [prioridadeFilter, setPrioridadeFilter] = useState('');
  const [viewMode] = useState<'table' | 'cards'>('table');
  const [showHistorico, setShowHistorico] = useState(false);
  const [selectedMotoForHistory, setSelectedMotoForHistory] = useState<Moto | undefined>();
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);
  const [ordemParaFinalizar, setOrdemParaFinalizar] = useState<OrdemServico | undefined>();
  const [showChat, setShowChat] = useState(false);
  const [ordemParaChat, setOrdemParaChat] = useState<OrdemServico | undefined>();
  
  // Detectar se está em mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Abrir automaticamente o chat quando vindo do Dashboard
  useEffect(() => {
    if (ordemIdParaAbrir && ordens.length > 0) {
      const ordem = ordens.find(o => o.id === ordemIdParaAbrir);
      if (ordem) {
        setOrdemParaChat(ordem);
        setShowChat(true);
        onChatAberto?.();
      }
    }
  }, [ordemIdParaAbrir, ordens, onChatAberto]);

  const ordensFiltered = ordens.filter(ordem => {
    const matchesSearch = 
      ordem.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.descricaoProblema.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClienteNome(ordem.clienteId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || ordem.status === statusFilter;
    const matchesPrioridade = !prioridadeFilter || ordem.prioridade === prioridadeFilter;
    
    return matchesSearch && matchesStatus && matchesPrioridade;
  });

  function getClienteNome(clienteId: string): string {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nome : 'Cliente não encontrado';
  }

  function getCliente(clienteId: string) {
    return clientes.find(c => c.id === clienteId);
  }

  function getMoto(motoId: string) {
    return motos.find(m => m.id === motoId);
  }

  function getMotoInfo(motoId: string): string {
    const moto = motos.find(m => m.id === motoId);
    return moto ? `${moto.marca} ${moto.modelo} - ${moto.placa}` : 'Moto não encontrada';
  }

  const handleFinalizarOrdem = (ordem: OrdemServico) => {
    if (ordem.status !== 'pronta') {
      alert('Apenas ordens com status "Pronta" podem ser finalizadas!');
      return;
    }
    setOrdemParaFinalizar(ordem);
    setShowPagamentoModal(true);
  };

  const handlePagamentoConfirmado = async (dadosPagamento: any) => {
    if (!ordemParaFinalizar) return;

    try {
      // Mapear tipo de pagamento para formato legível
      const tiposPagamento: Record<string, string> = {
        'pix': 'PIX',
        'dinheiro': 'Dinheiro',
        'cartao_debito': 'Cartão Débito',
        'cartao_credito': 'Cartão Crédito'
      };

      const formaPagamento = tiposPagamento[dadosPagamento.tipo] || dadosPagamento.tipo;
      const descricaoPagamento = dadosPagamento.tipo === 'cartao_credito' && dadosPagamento.parcelas > 1
        ? `${formaPagamento} (${dadosPagamento.parcelas}x)`
        : formaPagamento;

      const ordemAtualizada = {
        ...ordemParaFinalizar,
        status: 'entregue' as const,
        valorPago: dadosPagamento.valor,
        formaPagamento: descricaoPagamento,
        dataEntrega: new Date().toISOString(),
        observacoes: ordemParaFinalizar.observacoes 
          ? `${ordemParaFinalizar.observacoes}\n\nFinalizada e paga em ${new Date().toLocaleString('pt-BR')} - ${descricaoPagamento}`
          : `Finalizada e paga em ${new Date().toLocaleString('pt-BR')} - ${descricaoPagamento}`
      };

      await atualizarOrdem(ordemParaFinalizar.id, ordemAtualizada);

      // Registrar no caixa
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:9001/api'
        : `http://${window.location.hostname}:9001/api`;

      await fetch(`${API_URL}/caixa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'entrada',
          categoria: 'Recebimento de Cliente',
          descricao: `Pagamento OS ${ordemParaFinalizar.numero}`,
          valor: dadosPagamento.valor,
          formaPagamento: dadosPagamento.tipo,
          data: new Date().toISOString(),
          ordemServicoId: ordemParaFinalizar.id,
          observacoes: `Finalização de ordem de serviço - ${descricaoPagamento}`
        })
      });

      setShowPagamentoModal(false);
      setOrdemParaFinalizar(undefined);
      alert('Ordem de serviço finalizada e registrada no caixa com sucesso!');
    } catch (error) {
      console.error('Erro ao finalizar ordem:', error);
      alert('Erro ao finalizar ordem de serviço.');
    }
  };

  const handleSaveOrdem = async (dados: Omit<OrdemServico, 'id' | 'numero' | 'dataAbertura'>) => {
    try {
      if (editingOrdem) {
        await atualizarOrdem(editingOrdem.id, dados);
      } else {
        await adicionarOrdem(dados);
      }
      setShowForm(false);
      setEditingOrdem(undefined);
    } catch (error) {
      console.error('Erro ao salvar ordem:', error);
      alert('Erro ao salvar ordem de serviço');
    }
  };

  const handleDeleteOrdem = async (ordemId: string) => {
    try {
      await removerOrdem(ordemId);
      setShowForm(false);
      setEditingOrdem(undefined);
    } catch (error) {
      console.error('Erro ao excluir ordem:', error);
      alert('Erro ao excluir ordem de serviço. Tente novamente.');
    }
  };

  const handleEditOrdem = async (ordem: OrdemServico) => {
    try {
      console.log('🔧 handleEditOrdem iniciado para ordem:', ordem.numero);
      console.log('📱 Modo mobile:', isMobile);
      
      // Buscar dados completos da ordem do servidor
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:9001/api'
        : `http://${window.location.hostname}:9001/api`;
      
      const response = await fetch(`${API_URL}/ordens-servico/${ordem.id}`);
      const ordemCompleta = await response.json();
      
      console.log('📦 Ordem completa do servidor:', ordemCompleta);
      
      // Processar a ordem
      const ordemProcessada = {
        ...ordemCompleta,
        fotos: typeof ordemCompleta.fotos === 'string' ? JSON.parse(ordemCompleta.fotos) : (ordemCompleta.fotos || []),
        itens: Array.isArray(ordemCompleta.itens) ? ordemCompleta.itens : []
      };
      
      console.log('✨ Ordem processada para edição:', {
        numero: ordemProcessada.numero,
        clienteId: ordemProcessada.clienteId,
        motoId: ordemProcessada.motoId,
        descricao: ordemProcessada.descricaoProblema,
        itensCount: ordemProcessada.itens?.length
      });
      
      // IMPORTANTE: Definir AMBOS ao mesmo tempo usando callback
      // Isso garante que são atualizados no mesmo render cycle
      setEditingOrdem(ordemProcessada);
      setShowForm(true);
      
      console.log('✅ Estados atualizados - ordem definida e modal aberto');
      
    } catch (error) {
      console.error('❌ Erro ao carregar ordem para edição:', error);
      // Fallback para os dados locais
      setEditingOrdem(ordem);
      setShowForm(true);
    }
  };

  const handleOpenHistorico = (motoId: string) => {
    const moto = motos.find(m => m.id === motoId);
    if (moto) {
      setSelectedMotoForHistory(moto);
      setShowHistorico(true);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      aberta: { label: 'Aberta', variant: 'info' as const },
      em_andamento: { label: 'Em Andamento', variant: 'warning' as const },
      aguardando_peca: { label: 'Aguardando Peça', variant: 'neutral' as const },
      pronta: { label: 'Pronta', variant: 'success' as const },
      entregue: { label: 'Entregue', variant: 'neutral' as const },
      cancelada: { label: 'Cancelada', variant: 'error' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'neutral' as const };

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const prioridadeConfig = {
      baixa: { label: 'Baixa', variant: 'neutral' as const },
      media: { label: 'Média', variant: 'info' as const },
      alta: { label: 'Alta', variant: 'warning' as const },
      urgente: { label: 'Urgente', variant: 'error' as const }
    };

    const config = prioridadeConfig[prioridade as keyof typeof prioridadeConfig] || { label: prioridade, variant: 'neutral' as const };

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getWhatsAppButtonType = (status: string): 'criada' | 'em_andamento' | 'pronta' | null => {
    switch (status) {
      case 'aberta':
        return 'criada';
      case 'em_andamento':
        return 'em_andamento';
      case 'pronta':
        return 'pronta';
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-300 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Carregando ordens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <FileText className="text-slate-600 dark:text-slate-400" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">Total</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{ordens.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="elevated">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Clock className="text-amber-600 dark:text-amber-400" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">Em Andamento</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {ordens.filter(o => o.status === 'em_andamento').length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="elevated">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Calendar className="text-purple-600 dark:text-purple-400" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">Pronta</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {ordens.filter(o => o.status === 'pronta').length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="elevated">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <DollarSign className="text-emerald-600 dark:text-emerald-400" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">Faturamento</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  R$ {ordens.reduce((acc, o) => acc + o.valorTotal, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Header Title and Action */}
      <Card variant="elevated">
        <CardBody className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                Ordens de Serviço
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {ordensFiltered.length} {ordensFiltered.length === 1 ? 'ordem encontrada' : 'ordens encontradas'}
              </p>
            </div>
            <Button
              variant="primary"
              leftIcon={<Plus size={18} />}
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto"
            >
              Nova Ordem
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Filtros */}
      <Card variant="elevated">
        <CardBody className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="sm:col-span-2 lg:col-span-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                placeholder="Buscar ordem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro Status */}
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'Todos os Status' },
                { value: 'aberta', label: 'Aberta' },
                { value: 'em_andamento', label: 'Em Andamento' },
                { value: 'aguardando_peca', label: 'Aguardando Peça' },
                { value: 'pronta', label: 'Pronta' },
                { value: 'entregue', label: 'Entregue' },
                { value: 'cancelada', label: 'Cancelada' }
              ]}
            />

            {/* Filtro Prioridade */}
            <Select
              value={prioridadeFilter}
              onChange={(e) => setPrioridadeFilter(e.target.value)}
              options={[
                { value: '', label: 'Todas as Prioridades' },
                { value: 'baixa', label: 'Baixa' },
                { value: 'media', label: 'Média' },
                { value: 'alta', label: 'Alta' },
                { value: 'urgente', label: 'Urgente' }
              ]}
            />

            {/* Counter */}
            <div className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg px-4 py-3">
              <Wrench size={18} className="text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{ordensFiltered.length}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline">ordens</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Lista de Ordens */}
      {ordensFiltered.length === 0 ? (
        <Card variant="elevated">
          <CardBody className="p-12 sm:p-16 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wrench className="h-10 w-10 text-slate-600 dark:text-slate-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Nenhuma Ordem Encontrada
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {searchTerm || statusFilter || prioridadeFilter 
                ? 'Ajuste os filtros para encontrar outras ordens' 
                : 'Crie sua primeira ordem de serviço'
              }
            </p>
            {!searchTerm && !statusFilter && !prioridadeFilter && (
              <Button
                variant="primary"
                leftIcon={<Plus size={20} />}
                onClick={() => setShowForm(true)}
              >
                Criar Primeira Ordem
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <>
        {/* Cards - sempre no mobile, opcional no desktop */}
          <div className={`${viewMode === 'cards' ? 'block' : 'block lg:hidden'}`}>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {ordensFiltered.map((ordem) => {
            const cliente = getCliente(ordem.clienteId);
            const moto = getMoto(ordem.motoId);
            const whatsappType = getWhatsAppButtonType(ordem.status);
            const diasAbertura = Math.floor((new Date().getTime() - new Date(ordem.dataAbertura).getTime()) / (1000 * 60 * 60 * 24));

            return (
              <Card key={ordem.id} variant="elevated" className="group hover:shadow-lg transition-all duration-200">
                <CardBody className="p-0">
                  {/* Header do Card */}
                  <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">{ordem.numero}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {getStatusBadge(ordem.status)}
                          {getPrioridadeBadge(ordem.prioridade)}
                        </div>
                      </div>
                      <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                      {cliente && moto && (
                        <>
                          <CompartilharPortal numeroOS={ordem.numero} />
                          {ordem.status === 'pronta' && (
                            <button
                              onClick={() => handleFinalizarOrdem(ordem)}
                              className="p-1.5 sm:p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                              title="Finalizar e registrar pagamento"
                            >
                              <CheckCircle size={16} className="sm:w-4 sm:h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenHistorico(ordem.motoId)}
                            className="p-1.5 sm:p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Ver histórico da moto"
                          >
                            <FileText size={16} className="sm:w-4 sm:h-4" />
                          </button>
                          {whatsappType && (
                            <WhatsAppButton
                              ordem={ordem}
                              cliente={cliente}
                              moto={moto}
                              tipo={whatsappType}
                              variant="icon"
                              className=""
                            />
                          )}
                          <WhatsAppButton
                            ordem={ordem}
                            cliente={cliente}
                            moto={moto}
                            tipo="ordem_completa"
                            variant="icon"
                            className=""
                          />
                        </>
                      )}
                      <button
                        onClick={() => {
                          setOrdemParaChat(ordem);
                          setShowChat(true);
                        }}
                        className="p-1.5 sm:p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all"
                        title="Chat com cliente"
                      >
                        <MessageCircle size={16} className="sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => handleEditOrdem(ordem)}
                        className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                        title="Editar ordem"
                      >
                        <Edit size={16} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {/* Cliente e Moto */}
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <User size={14} className="flex-shrink-0 text-slate-600 dark:text-slate-400" />
                      <span className="font-medium">Cliente:</span>
                    </div>
                    <div className="text-sm sm:text-base text-slate-900 dark:text-slate-100 font-medium truncate">{getClienteNome(ordem.clienteId)}</div>
                    <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{getMotoInfo(ordem.motoId)}</div>
                  </div>

                  {/* Problema */}
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <AlertTriangle size={14} className="flex-shrink-0 text-amber-600 dark:text-amber-400" />
                      <span className="font-medium">Problema:</span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                      {ordem.descricaoProblema}
                    </div>
                  </div>

                  {/* Informações Adicionais */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <DollarSign size={14} className="flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-medium">Valor:</span>
                      </div>
                      <div className="text-base sm:text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                        R$ {ordem.valorTotal.toFixed(2)}
                      </div>
                      {ordem.valorPago && ordem.valorPago > 0 && (
                        <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                          Pago: R$ {ordem.valorPago.toFixed(2)}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <Calendar size={14} className="flex-shrink-0 text-purple-600 dark:text-purple-400" />
                        <span className="font-medium">Abertura:</span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        {new Date(ordem.dataAbertura).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {diasAbertura === 0 ? 'Hoje' : `${diasAbertura} dia${diasAbertura > 1 ? 's' : ''}`}
                      </div>
                    </div>
                  </div>

                  {/* Técnico e Previsão */}
                  {(ordem.tecnicoResponsavel || ordem.dataPrevisao) && (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                      {ordem.tecnicoResponsavel && (
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                            <Wrench size={14} className="flex-shrink-0 text-slate-600 dark:text-slate-400" />
                            <span className="font-medium">Técnico:</span>
                          </div>
                          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 truncate">{ordem.tecnicoResponsavel}</div>
                        </div>
                      )}

                      {ordem.dataPrevisao && (
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                            <Clock size={14} className="flex-shrink-0 text-amber-600 dark:text-amber-400" />
                            <span className="font-medium">Previsão:</span>
                          </div>
                          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                            {new Date(ordem.dataPrevisao).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
            );
          })}
        </div>
          </div>
          
          {/* Tabela - apenas desktop quando selecionado */}
          <div className={`${viewMode === 'table' ? 'hidden lg:block' : 'hidden'}`}>
            <Card variant="elevated" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">
                        Número
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">
                        Cliente
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">
                        Moto
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">
                        Problema
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">
                        Prioridade
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">
                        Valor
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">
                        Abertura
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                {ordensFiltered.map((ordem) => {
                  const cliente = getCliente(ordem.clienteId);
                  const moto = getMoto(ordem.motoId);
                  const whatsappType = getWhatsAppButtonType(ordem.status);

                  return (
                    <tr key={ordem.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                          {ordem.numero}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {getClienteNome(ordem.clienteId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {getMotoInfo(ordem.motoId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="text-sm text-slate-600 dark:text-slate-400 truncate" title={ordem.descricaoProblema}>
                          {ordem.descricaoProblema}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(ordem.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPrioridadeBadge(ordem.prioridade)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          R$ {ordem.valorTotal.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(ordem.dataAbertura).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <CompartilharPortal numeroOS={ordem.numero} />
                          {ordem.status === 'pronta' && (
                            <button
                              onClick={() => handleFinalizarOrdem(ordem)}
                              className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                              title="Finalizar e registrar pagamento"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenHistorico(ordem.motoId)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Ver histórico"
                          >
                            <FileText size={16} />
                          </button>
                          {cliente && moto && whatsappType && (
                            <WhatsAppButton
                              ordem={ordem}
                              cliente={cliente}
                              moto={moto}
                              tipo={whatsappType}
                              className="text-xs px-2 py-1"
                            />
                          )}
                          <button
                            onClick={() => {
                              setOrdemParaChat(ordem);
                              setShowChat(true);
                            }}
                            className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                            title="Chat com cliente"
                          >
                            <MessageCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleEditOrdem(ordem)}
                            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Usar Wizard no mobile APENAS para NOVA ordem, Form completo para edição */}
      {(isMobile && !editingOrdem) ? (
        <OrdemServicoWizard
          ordem={editingOrdem}
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingOrdem(undefined);
          }}
          onSave={handleSaveOrdem}
          onDelete={handleDeleteOrdem}
        />
      ) : (
        <OrdemServicoForm
          ordem={editingOrdem}
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingOrdem(undefined);
          }}
          onSave={handleSaveOrdem}
          onDelete={handleDeleteOrdem}
        />
      )}

      {selectedMotoForHistory && (() => {
        const cliente = clientes.find(c => c.id === selectedMotoForHistory.clienteId);
        return cliente ? (
          <HistoricoMoto
            moto={selectedMotoForHistory}
            cliente={cliente}
            isOpen={showHistorico}
            onClose={() => {
              setShowHistorico(false);
              setSelectedMotoForHistory(undefined);
            }}
          />
        ) : null;
      })()}

      {showPagamentoModal && ordemParaFinalizar && (
        <PagamentoModal
          ordemServico={{
            numero: ordemParaFinalizar.numero,
            valorTotal: ordemParaFinalizar.valorTotal,
            valorPago: ordemParaFinalizar.valorPago || 0
          }}
          onClose={() => {
            setShowPagamentoModal(false);
            setOrdemParaFinalizar(undefined);
          }}
          onPagamento={handlePagamentoConfirmado}
        />
      )}

      {showChat && ordemParaChat && (
        <ChatOrdem
          ordemId={ordemParaChat.id}
          ordemNumero={ordemParaChat.numero}
          ordemStatus={ordemParaChat.status}
          clienteNome={getClienteNome(ordemParaChat.clienteId)}
          motoInfo={(() => {
            const moto = motos.find(m => m.id === ordemParaChat.motoId);
            return moto ? `${moto.marca} ${moto.modelo} - ${moto.placa}` : undefined;
          })()}
          isOpen={showChat}
          onClose={() => {
            setShowChat(false);
            setOrdemParaChat(undefined);
          }}
        />
      )}
    </div>
  );
}
