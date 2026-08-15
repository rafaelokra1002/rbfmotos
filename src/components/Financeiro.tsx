import { useState, useMemo, useEffect } from 'react';
import { CadastroDividaForm } from './CadastroDividaForm';
import { useOficinaData } from '../hooks/useOficinaData';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  CreditCard,
  Wallet,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3
} from 'lucide-react';

interface MovimentacaoCaixa {
  id: string;
  tipo: string;
  categoria: string;
  descricao: string;
  valor: number;
  formaPagamento: string;
  data: string;
  ordemServicoId?: string;
  observacoes?: string;
  criadoEm: string;
}

export function Financeiro() {
  const [showDividaModal, setShowDividaModal] = useState(false);

  // Função para cadastrar dívida parcelada (chama API backend)
  async function handleCadastrarDivida(data: { valorTotal: number; valorParcela: number; frequencia: string; descricao: string; categoriaId: string }) {
    const API_URL = window.location.hostname === 'localhost'
      ? 'http://localhost:9001/api'
      : `http://${window.location.hostname}:9001/api`;
    await fetch(`${API_URL}/financeiro/contas-pagar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descricao: data.descricao,
        valorTotal: data.valorTotal,
        valorParcela: data.valorParcela,
        frequencia: data.frequencia,
        categoriaId: data.categoriaId,
      })
    });
    setShowDividaModal(false);
    // Opcional: atualizar lista de movimentações/contas a pagar
  }
  const { ordens, orcamentos } = useOficinaData();
  const [periodo, setPeriodo] = useState('mes'); // mes, trimestre, ano
  const [tipoPagamento, setTipoPagamento] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoCaixa[]>([]);

  // Buscar movimentações do caixa
  useEffect(() => {
    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:9001/api'
      : `http://${window.location.hostname}:9001/api`;
    
    fetch(`${API_URL}/caixa`)
      .then(res => res.json())
      .then(data => setMovimentacoes(data))
      .catch(err => console.error('Erro ao buscar movimentações:', err));
  }, []);

  // Cálculos financeiros
  const dadosFinanceiros = useMemo(() => {
    const hoje = new Date();
    let dataLimite: Date;

    switch (periodo) {
      case 'mes':
        dataLimite = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        break;
      case 'trimestre':
        dataLimite = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
        break;
      case 'ano':
        dataLimite = new Date(hoje.getFullYear(), 0, 1);
        break;
      default:
        dataLimite = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    }

    // Filtrar movimentações do período
    let movimentacoesFiltradas = movimentacoes.filter(mov => {
      const dataMov = new Date(mov.data);
      
      if (dataInicio && dataFim) {
        return dataMov >= new Date(dataInicio) && dataMov <= new Date(dataFim);
      }
      
      return dataMov >= dataLimite;
    });

    // Filtrar por tipo de pagamento
    if (tipoPagamento !== 'todos') {
      movimentacoesFiltradas = movimentacoesFiltradas.filter(m => m.formaPagamento === tipoPagamento);
    }

    // Receitas (entradas do caixa)
    const receitas = movimentacoesFiltradas
      .filter(m => m.tipo === 'entrada')
      .reduce((total, m) => total + m.valor, 0);

    // Despesas (saídas do caixa)
    const despesas = movimentacoesFiltradas
      .filter(m => m.tipo === 'saida')
      .reduce((total, m) => total + m.valor, 0);

    // Ordens em aberto (valor a receber)
    const aReceber = ordens
      .filter(o => ['pronta', 'em_andamento', 'aberta'].includes(o.status))
      .reduce((total, o) => total + o.valorTotal, 0);

    // Orçamentos pendentes
    const orcamentosPendentes = orcamentos
      .filter(o => o.status === 'pendente')
      .reduce((total, o) => total + o.valorTotal, 0);

    // Ordens por status
    const ordemPorStatus = {
      entregue: ordens.filter(o => o.status === 'entregue').length,
      pronta: ordens.filter(o => o.status === 'pronta').length,
      em_andamento: ordens.filter(o => o.status === 'em_andamento').length,
      aberta: ordens.filter(o => o.status === 'aberta').length,
    };

    // Receitas por forma de pagamento
    const receitasPorPagamento = movimentacoesFiltradas
      .filter(m => m.tipo === 'entrada')
      .reduce((acc, m) => {
        const forma = m.formaPagamento || 'Não informado';
        acc[forma] = (acc[forma] || 0) + m.valor;
        return acc;
      }, {} as Record<string, number>);

    // Ticket médio
    const entradasPeriodo = movimentacoesFiltradas.filter(m => m.tipo === 'entrada');
    const ticketMedio = entradasPeriodo.length > 0 
      ? receitas / entradasPeriodo.length 
      : 0;

    // Comparação com período anterior
    const periodoAnteriorInicio = new Date(dataLimite);
    periodoAnteriorInicio.setMonth(periodoAnteriorInicio.getMonth() - (periodo === 'mes' ? 1 : periodo === 'trimestre' ? 3 : 12));
    
    const receitasPeriodoAnterior = movimentacoes
      .filter(m => {
        const data = new Date(m.data);
        return data >= periodoAnteriorInicio && data < dataLimite && m.tipo === 'entrada';
      })
      .reduce((total, m) => total + m.valor, 0);

    const crescimento = receitasPeriodoAnterior > 0
      ? ((receitas - receitasPeriodoAnterior) / receitasPeriodoAnterior) * 100
      : 0;

    return {
      receitas,
      despesas,
      aReceber,
      orcamentosPendentes,
      ordemPorStatus,
      receitasPorPagamento,
      ticketMedio,
      crescimento,
      ordensEntregues: entradasPeriodo.length,
    };
  }, [movimentacoes, ordens, orcamentos, periodo, tipoPagamento, dataInicio, dataFim]);

  const formasPagamento = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'pix', label: 'PIX' },
    { value: 'cartao_debito', label: 'Cartão Débito' },
    { value: 'cartao_credito', label: 'Cartão Crédito' },
    { value: 'transferencia', label: 'Transferência' }
  ];

  const getFormaPagamentoLabel = (forma: string) => {
    const item = formasPagamento.find(f => f.value === forma);
    return item?.label || forma;
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Botão para abrir modal de cadastro de dívida parcelada */}
      <div className="flex justify-end mb-4">
        <button
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-purple-500 text-white font-bold shadow hover:from-orange-600 hover:to-purple-600"
          onClick={() => setShowDividaModal(true)}
        >
          Nova Dívida Parcelada
        </button>
      </div>
      <CadastroDividaForm
        isOpen={showDividaModal}
        onClose={() => setShowDividaModal(false)}
        onSubmit={handleCadastrarDivida}
      />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 animate-fadeIn">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2">
              Financeiro
            </h1>
            <p className="text-slate-400 text-sm sm:text-base font-medium">
              Visão completa das finanças da oficina
            </p>
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold rounded-xl shadow-lg shadow-amber-500/30 hover:scale-105 transform transition-all duration-300">
            <Download size={20} />
            Exportar Relatório
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 p-4 sm:p-6 mb-6 animate-slideUp">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">
                Período
              </label>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="w-full px-4 py-3 border border-slate-700 bg-slate-900 text-slate-100 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 text-sm font-medium transition-all cursor-pointer hover:border-amber-400/50 appearance-none"
              >
                <option value="mes">Este Mês</option>
                <option value="trimestre">Último Trimestre</option>
                <option value="ano">Este Ano</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>

            {periodo === 'personalizado' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-700 bg-slate-900 text-slate-100 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 text-sm font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-700 bg-slate-900 text-slate-100 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 text-sm font-medium transition-all"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">
                Forma Pagamento
              </label>
              <select
                value={tipoPagamento}
                onChange={(e) => setTipoPagamento(e.target.value)}
                className="w-full px-4 py-3 border border-slate-700 bg-slate-900 text-slate-100 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 text-sm font-medium transition-all cursor-pointer hover:border-amber-400/50 appearance-none"
              >
                <option value="todos">Todas</option>
                {formasPagamento.map(forma => (
                  <option key={forma.value} value={forma.value}>{forma.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          {/* Receitas */}
          <div className="group bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg hover:shadow-xl p-6 text-white transition-all duration-300 hover:scale-105 transform animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-md">
                <DollarSign size={28} />
              </div>
              <div className="flex items-center gap-1 text-sm font-bold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                {dadosFinanceiros.crescimento >= 0 ? (
                  <>
                    <ArrowUpRight size={16} />
                    <span>+{dadosFinanceiros.crescimento.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight size={16} />
                    <span>{dadosFinanceiros.crescimento.toFixed(1)}%</span>
                  </>
                )}
              </div>
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wide opacity-90 mb-2">Receitas</h3>
            <p className="text-3xl sm:text-4xl font-bold mb-2">R$ {dadosFinanceiros.receitas.toFixed(2)}</p>
            <p className="text-xs opacity-80 font-medium">{dadosFinanceiros.ordensEntregues} entradas registradas</p>
          </div>

          {/* A Receber */}
          <div className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl p-6 text-white transition-all duration-300 hover:scale-105 transform animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Wallet size={28} />
              </div>
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wide opacity-90 mb-2">A Receber</h3>
            <p className="text-3xl sm:text-4xl font-bold mb-2">R$ {dadosFinanceiros.aReceber.toFixed(2)}</p>
            <p className="text-xs opacity-80 font-medium">Ordens em andamento</p>
          </div>

          {/* Orçamentos Pendentes */}
          <div className="group bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg hover:shadow-xl p-6 text-white transition-all duration-300 hover:scale-105 transform animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Receipt size={28} />
              </div>
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wide opacity-90 mb-2">Orçamentos Pendentes</h3>
            <p className="text-3xl sm:text-4xl font-bold mb-2">R$ {dadosFinanceiros.orcamentosPendentes.toFixed(2)}</p>
            <p className="text-xs opacity-80 font-medium">Aguardando aprovação</p>
          </div>

          {/* Ticket Médio */}
          <div className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg hover:shadow-xl p-6 text-white transition-all duration-300 hover:scale-105 transform animate-slideUp" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-md">
                <TrendingUp size={28} />
              </div>
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wide opacity-90 mb-2">Ticket Médio</h3>
            <p className="text-3xl sm:text-4xl font-bold mb-2">R$ {dadosFinanceiros.ticketMedio.toFixed(2)}</p>
            <p className="text-xs opacity-80 font-medium">Por ordem de serviço</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Receitas por Forma de Pagamento */}
          <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 p-6 animate-slideUp" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-md">
                <PieChart className="text-white" size={24} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100">Receitas por Forma de Pagamento</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(dadosFinanceiros.receitasPorPagamento).length > 0 ? (
                Object.entries(dadosFinanceiros.receitasPorPagamento)
                  .sort((a, b) => b[1] - a[1])
                  .map(([forma, valor]) => {
                    const percentual = (valor / dadosFinanceiros.receitas) * 100;
                    return (
                      <div key={forma} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-slate-300">{getFormaPagamentoLabel(forma)}</span>
                          <span className="text-sm font-bold text-slate-100">R$ {valor.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500 group-hover:scale-105"
                            style={{ width: `${percentual}%` }}
                          />
                        </div>
                        <div className="text-xs font-semibold text-blue-400 mt-1">{percentual.toFixed(1)}%</div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-12">
                  <PieChart className="mx-auto mb-3 text-slate-600" size={48} />
                  <p className="text-sm text-slate-400 font-medium">Nenhuma receita registrada no período</p>
                </div>
              )}
            </div>
          </div>

          {/* Status das Ordens */}
          <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 p-6 animate-slideUp" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-md">
                <BarChart3 className="text-white" size={24} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100">Distribuição de Ordens</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-xl hover:scale-105 transition-transform">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full shadow-md" />
                  <span className="text-sm font-bold text-slate-300">Entregues</span>
                </div>
                <span className="text-xl font-bold text-green-400">{dadosFinanceiros.ordemPorStatus.entregue}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl hover:scale-105 transition-transform">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full shadow-md" />
                  <span className="text-sm font-bold text-slate-300">Prontas</span>
                </div>
                <span className="text-xl font-bold text-blue-400">{dadosFinanceiros.ordemPorStatus.pronta}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-xl hover:scale-105 transition-transform">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-amber-500 rounded-full shadow-md" />
                  <span className="text-sm font-bold text-slate-300">Em Andamento</span>
                </div>
                <span className="text-xl font-bold text-amber-400">{dadosFinanceiros.ordemPorStatus.em_andamento}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-500/10 to-slate-600/10 border border-slate-500/30 rounded-xl hover:scale-105 transition-transform">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-slate-500 rounded-full shadow-md" />
                  <span className="text-sm font-bold text-slate-300">Abertas</span>
                </div>
                <span className="text-xl font-bold text-slate-400">{dadosFinanceiros.ordemPorStatus.aberta}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Últimas Transações */}
        <div className="mt-6 bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 overflow-hidden animate-slideUp" style={{ animationDelay: '0.6s' }}>
          <div className="px-6 py-4 bg-gradient-to-r from-amber-500/10 to-slate-800 border-b border-amber-500/20">
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
              <CreditCard size={24} className="text-amber-400" />
              Últimas Transações
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">OS</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Pagamento</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-amber-400 uppercase tracking-wider">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {ordens
                  .filter(o => o.status === 'entregue' && o.valorPago)
                  .sort((a, b) => new Date(b.dataEntrega || b.dataAbertura).getTime() - new Date(a.dataEntrega || a.dataAbertura).getTime())
                  .slice(0, 10)
                  .map((ordem, index) => (
                    <tr key={ordem.id} className={`${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-900/50'} hover:bg-slate-700/50 transition-colors`}>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-100">{ordem.numero}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                          <Calendar size={14} className="text-amber-400" />
                          {new Date(ordem.dataEntrega || ordem.dataAbertura).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                          <CreditCard size={14} className="text-blue-400" />
                          {ordem.formaPagamento || 'Não informado'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/30">
                          Pago
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-green-400">
                          + R$ {(ordem.valorPago || 0).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
