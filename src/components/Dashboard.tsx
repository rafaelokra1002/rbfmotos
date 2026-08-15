import React, { useEffect, useState } from 'react';
import { useOficinaData } from '../hooks/useOficinaData';
import { DatabaseStatus } from './DatabaseStatus';
import { WhatsAppButton } from './WhatsAppButton';
import { DashboardStats } from '../types';
import {
  Wrench,
  Clock,
  CheckCircle,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  MessageCircle
} from 'lucide-react';

interface DashboardProps {
  onNavigateToOrdens?: (ordemIdComMensagem?: string) => void;
}

export function Dashboard({ onNavigateToOrdens }: DashboardProps) {
  const { getDashboardStats, ordens, orcamentos, clientes, motos, pecas, servicos, loading } = useOficinaData();
  const [stats, setStats] = useState<DashboardStats>({
    ordensAbertas: 0,
    ordensEmAndamento: 0,
    ordensProntas: 0,
    orcamentosPendentes: 0,
    faturamentoMes: 0,
    faturamentoMesAnterior: 0,
  });
  const [mensagensNaoLidas, setMensagensNaoLidas] = useState(0);
  const [primeiraOrdemComMensagem, setPrimeiraOrdemComMensagem] = useState<string | null>(null);

  // Buscar mensagens não lidas
  useEffect(() => {
    const buscarMensagensNaoLidas = async () => {
      try {
        const API_URL = window.location.hostname === 'localhost' 
          ? '/api'
          : `/api`;

        // Buscar todas as ordens ativas
        const ordensAtivas = ordens.filter(o => 
          ['aberta', 'em_andamento', 'aguardando_peca'].includes(o.status)
        );

        let totalNaoLidas = 0;
        let primeiraOrdem: string | null = null;
        
        // Para cada ordem ativa, verificar se há mensagens não lidas
        for (const ordem of ordensAtivas) {
          const response = await fetch(`${API_URL}/mensagens/${ordem.id}`);
          if (response.ok) {
            const mensagens = await response.json();
            const naoLidas = mensagens.filter((m: any) => 
              m.remetente === 'cliente' && !m.lida
            ).length;
            if (naoLidas > 0) {
              totalNaoLidas += naoLidas;
              if (!primeiraOrdem) {
                primeiraOrdem = ordem.id;
              }
            }
          }
        }

        setMensagensNaoLidas(totalNaoLidas);
        setPrimeiraOrdemComMensagem(primeiraOrdem);
      } catch (error) {
        console.error('Erro ao buscar mensagens não lidas:', error);
      }
    };

    if (ordens.length > 0) {
      buscarMensagensNaoLidas();
      
      // Atualizar a cada 30 segundos
      const interval = setInterval(buscarMensagensNaoLidas, 30000);
      return () => clearInterval(interval);
    }
  }, [ordens]);

  useEffect(() => {
    const loadStats = async () => {
      const data = await getDashboardStats();
      
      // Filtrar ordens finalizadas para contagem
      const ordensFinalizadas = ordens.filter(o => o.status === 'pronta' || o.status === 'entregue');
      
      console.log('� Debug Faturamento:');
      console.log('- Total de ordens:', ordens.length);
      console.log('- Ordens finalizadas (pronta/entregue):', ordensFinalizadas.length);
      console.log('- Faturamento do mês (API/Caixa):', data.faturamentoMes);
      console.log('- Faturamento mês anterior (API/Caixa):', data.faturamentoMesAnterior);
      
      // Calcular estatísticas localmente (exceto faturamento que vem do CAIXA)
      const localStats = {
        ordensAbertas: ordens.filter(o => o.status === 'aberta').length,
        ordensEmAndamento: ordens.filter(o => o.status === 'em_andamento').length,
        ordensProntas: ordensFinalizadas.length,
        orcamentosPendentes: orcamentos.filter(o => o.status === 'pendente').length,
      };
      
      // Usar faturamento do CAIXA (API) como fonte de verdade
      setStats({
        ordensAbertas: localStats.ordensAbertas,
        ordensEmAndamento: localStats.ordensEmAndamento,
        ordensProntas: localStats.ordensProntas,
        orcamentosPendentes: localStats.orcamentosPendentes,
        faturamentoMes: data.faturamentoMes || 0,
        faturamentoMesAnterior: data.faturamentoMesAnterior || 0,
      });
    };
    loadStats();
  }, [ordens, orcamentos]);
  
  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="relative w-14 h-14 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-900 dark:text-slate-100 font-medium">Carregando dashboard...</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Aguarde um momento</p>
          </div>
        </div>
      </div>
    );
  }
  
  const ordensUrgentes = ordens.filter(o => 
    o.prioridade === 'urgente' && ['aberta', 'em_andamento'].includes(o.status)
  );

  const ordensProntas = ordens.filter(o => o.status === 'pronta' || o.status === 'entregue');

  const orcamentosRecentes = orcamentos
    .filter(o => o.status === 'pendente')
    .sort((a, b) => new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime())
    .slice(0, 5);

  const crescimentoFaturamento = stats.faturamentoMesAnterior > 0 
    ? ((stats.faturamentoMes - stats.faturamentoMesAnterior) / stats.faturamentoMesAnterior) * 100
    : 0;

  // Cálculos para visualizações
  const totalOrdens = ordens.length;
  const distribStatus = {
    abertas: ((stats.ordensAbertas / (totalOrdens || 1)) * 100),
    emAndamento: ((stats.ordensEmAndamento / (totalOrdens || 1)) * 100),
    prontas: ((stats.ordensProntas / (totalOrdens || 1)) * 100),
  };

  const pecasEmFalta = pecas.filter(p => (p.estoque ?? 0) < 5).length;
  const servicosMaisUsados = ordens
    .flatMap(o => o.itens || [])
    .filter(item => item.tipo === 'servico')
    .reduce((acc, item) => {
      const servicoId = item.itemId;
      if (servicoId) {
        acc[servicoId] = (acc[servicoId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

  const topServicos = Object.entries(servicosMaisUsados)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({
      servico: servicos.find(s => s.id === id),
      count
    }))
    .filter(item => item.servico);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            Dashboard
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1.5">
            <div className="text-sm text-slate-500 dark:text-slate-400 capitalize">
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <DatabaseStatus />
          </div>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Ordens Abertas" value={stats.ordensAbertas} icon={Wrench} color="blue" />
        <StatCard title="Em Andamento" value={stats.ordensEmAndamento} icon={Clock} color="amber" />
        <StatCard title="Prontas" value={stats.ordensProntas} icon={CheckCircle} color="emerald" />
        <StatCard title="Orçamentos Pendentes" value={stats.orcamentosPendentes} icon={FileText} color="slate" />
      </div>

      {/* Notificação de Mensagens Não Lidas */}
      {mensagensNaoLidas > 0 && (
        <button
          onClick={() => onNavigateToOrdens?.(primeiraOrdemComMensagem || undefined)}
          className="w-full text-left bg-white dark:bg-slate-800 rounded-xl shadow-card border border-blue-200 dark:border-blue-500/40 p-4 sm:p-5 hover:border-blue-400 dark:hover:border-blue-500/60 hover:shadow-medium transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30">
                <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1 bg-red-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                <span className="text-[10px] font-bold text-white">{mensagensNaoLidas}</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {mensagensNaoLidas === 1
                  ? 'Nova mensagem de cliente'
                  : `${mensagensNaoLidas} novas mensagens de clientes`}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Clique para ver as ordens e responder.
              </p>
            </div>
          </div>
        </button>
      )}

      {/* Faturamento */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-base font-medium text-slate-500 dark:text-slate-400">
            Faturamento do Mês
          </h2>
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div className="text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          R$ {stats.faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <div className="flex items-center gap-2 mt-3">
          {crescimentoFaturamento >= 0 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/15 rounded-full border border-emerald-200 dark:border-emerald-500/30">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                +{Math.abs(crescimentoFaturamento).toFixed(1)}%
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-500/15 rounded-full border border-red-200 dark:border-red-500/30">
              <TrendingDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                {Math.abs(crescimentoFaturamento).toFixed(1)}%
              </span>
            </span>
          )}
          <span className="text-sm text-slate-500 dark:text-slate-400">vs mês anterior</span>
        </div>
      </div>

      {/* Resumo Visual de Distribuição */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Distribuição de Status */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Distribuição de Ordens
          </h3>
          <div className="space-y-4">
            <ProgressRow label="Abertas" value={stats.ordensAbertas} pct={distribStatus.abertas} barClass="bg-blue-600" textClass="text-blue-600 dark:text-blue-400" />
            <ProgressRow label="Em Andamento" value={stats.ordensEmAndamento} pct={distribStatus.emAndamento} barClass="bg-amber-500" textClass="text-amber-600 dark:text-amber-400" />
            <ProgressRow label="Concluídas" value={stats.ordensProntas} pct={distribStatus.prontas} barClass="bg-emerald-500" textClass="text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        {/* Top Serviços */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-slate-400" />
            Serviços Mais Realizados
          </h3>
          {topServicos.length > 0 ? (
            <div className="space-y-3">
              {topServicos.map((item) => {
                const maxCount = topServicos[0]?.count || 1;
                const percentage = (item.count / maxCount) * 100;
                return (
                  <div key={item.servico?.id}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-600 dark:text-slate-300 font-medium truncate flex-1">{item.servico?.nome}</span>
                      <span className="text-slate-900 dark:text-slate-100 font-semibold ml-2">{item.count}x</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wrench className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhum serviço realizado ainda</p>
            </div>
          )}
        </div>
      </div>

      {/* Alertas de Estoque */}
      {pecasEmFalta > 0 && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Estoque baixo</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-0.5">
              {pecasEmFalta} {pecasEmFalta === 1 ? 'peça está' : 'peças estão'} com estoque abaixo de 5 unidades.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{pecasEmFalta}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Peças</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Ordens Urgentes */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card border border-slate-200 dark:border-slate-700 p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Ordens Urgentes</h2>
            {ordensUrgentes.length > 0 && (
              <span className="ml-auto text-xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/15 px-2.5 py-1 rounded-full border border-red-200 dark:border-red-500/30">
                {ordensUrgentes.length}
              </span>
            )}
          </div>
          {ordensUrgentes.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma ordem urgente no momento</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {ordensUrgentes.map((ordem) => (
                <div key={ordem.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-all cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{ordem.numero}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{ordem.descricaoProblema}</div>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400 rounded-full font-medium border border-red-200 dark:border-red-500/30 whitespace-nowrap ml-3">
                    {ordem.status === 'aberta' ? 'Aberta' : 'Andamento'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ordens Concluídas */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card border border-slate-200 dark:border-slate-700 p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Ordens Concluídas</h2>
            <span className="ml-auto text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/30">
              {ordensProntas.length}
            </span>
          </div>
          {ordensProntas.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma ordem concluída</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {ordensProntas.slice(0, 5).map((ordem) => {
                const cliente = clientes.find(c => c.id === ordem.clienteId);
                return (
                  <div key={ordem.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-all cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{ordem.numero}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">{cliente?.nome}</div>
                    </div>
                    <div className="text-right ml-3">
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/15 rounded-full border border-emerald-200 dark:border-emerald-500/30 whitespace-nowrap">
                        {ordem.status === 'pronta' ? 'Pronta' : 'Entregue'}
                      </span>
                      {ordem.dataConclusao && (
                        <div className="text-xs text-slate-400 mt-1">{new Date(ordem.dataConclusao).toLocaleDateString('pt-BR')}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Orçamentos Pendentes */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card border border-slate-200 dark:border-slate-700 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Orçamentos Pendentes</h2>
          {orcamentosRecentes.length > 0 && (
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/15 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-500/30">
              {orcamentosRecentes.length}
            </span>
          )}
        </div>
        {orcamentosRecentes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhum orçamento pendente</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {orcamentosRecentes.map((orcamento) => {
              const cliente = clientes.find(c => c.id === orcamento.clienteId);
              const moto = motos.find(m => m.id === orcamento.motoId);
              return (
                <div key={orcamento.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-all cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{orcamento.numero}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 truncate">{orcamento.descricaoProblema}</div>
                    {cliente && <div className="text-xs text-slate-400 mt-0.5">{cliente.nome}</div>}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <div className="text-right">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                        R$ {orcamento.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-slate-400">{new Date(orcamento.dataEmissao).toLocaleDateString('pt-BR')}</div>
                    </div>
                    {cliente && moto && (
                      <WhatsAppButton orcamento={orcamento} cliente={cliente} moto={moto} tipo="orcamento" variant="icon" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface ProgressRowProps {
  label: string;
  value: number;
  pct: number;
  barClass: string;
  textClass: string;
}

function ProgressRow({ label, value, pct, barClass, textClass }: ProgressRowProps) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-600 dark:text-slate-300 font-medium">{label}</span>
        <span className={`font-semibold ${textClass}`}>{value} ({pct.toFixed(0)}%)</span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${barClass} rounded-full transition-all duration-700 ease-out`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'amber' | 'emerald' | 'slate';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const iconColors = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card border border-slate-200 dark:border-slate-700 p-5 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-medium">
      <div className="flex items-start justify-between gap-4 mb-3">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</p>
        <div className={`flex-shrink-0 ${iconColors[color]} rounded-lg p-2`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">{value}</p>
    </div>
  );
}
