import { useState, useEffect } from 'react';
import { 
  Wrench, 
  Users, 
  Bike, 
  DollarSign,
  Clock,
  AlertTriangle,
  Package,
  TrendingUp,
  ArrowRight,
  Plus,
  ChevronRight,
  Activity,
  Zap
} from 'lucide-react';
import { useOficinaData } from '../hooks/useOficinaData';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface DashboardUltraProps {
  onNavigateToOrdens?: (ordemId?: string) => void;
  onNavigate?: (view: string) => void;
}

export function DashboardUltra({ onNavigateToOrdens, onNavigate }: DashboardUltraProps) {
  const { ordens, clientes, motos, pecas, loading } = useOficinaData();
  const [stats, setStats] = useState({
    ordensAbertas: 0,
    ordensAndamento: 0,
    ordensHoje: 0,
    faturamentoMes: 0,
    faturamentoTendencia: 0,
    totalClientes: 0,
    totalMotos: 0,
    pecasBaixoEstoque: 0,
  });

  const [ordensRecentes, setOrdensRecentes] = useState<any[]>([]);
  const [alertas, setAlertas] = useState<any[]>([]);

  useEffect(() => {
    if (ordens && clientes && motos && pecas) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const mesAtual = hoje.getMonth();
      const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
      const anoMesAnterior = mesAtual === 0 ? hoje.getFullYear() - 1 : hoje.getFullYear();

      const ordensAbertas = ordens.filter((o: any) => o.status === 'aberta').length;
      const ordensAndamento = ordens.filter((o: any) => o.status === 'em_andamento').length;
      
      const ordensHoje = ordens.filter((o: any) => {
        const dataOrdem = new Date(o.dataAbertura);
        dataOrdem.setHours(0, 0, 0, 0);
        return dataOrdem.getTime() === hoje.getTime();
      }).length;

      const faturamentoMesAtual = ordens
        .filter((o: any) => {
          const dataOrdem = new Date(o.dataAbertura);
          return dataOrdem.getMonth() === mesAtual && 
                 dataOrdem.getFullYear() === hoje.getFullYear() &&
                 o.status === 'entregue';
        })
        .reduce((sum: number, o: any) => sum + (o.valorTotal || 0), 0);

      const faturamentoMesAnteriorCalc = ordens
        .filter((o: any) => {
          const dataOrdem = new Date(o.dataAbertura);
          return dataOrdem.getMonth() === mesAnterior && 
                 dataOrdem.getFullYear() === anoMesAnterior &&
                 o.status === 'entregue';
        })
        .reduce((sum: number, o: any) => sum + (o.valorTotal || 0), 0);

      const tendencia = faturamentoMesAnteriorCalc > 0
        ? ((faturamentoMesAtual - faturamentoMesAnteriorCalc) / faturamentoMesAnteriorCalc) * 100
        : 0;

      const pecasBaixoEstoque = pecas.filter((p: any) => 
        (p.quantidadeEstoque || 0) < (p.estoqueMinimo || 5)
      ).length;

      setStats({
        ordensAbertas,
        ordensAndamento,
        ordensHoje,
        faturamentoMes: faturamentoMesAtual,
        faturamentoTendencia: tendencia,
        totalClientes: clientes.length,
        totalMotos: motos.length,
        pecasBaixoEstoque,
      });

      // Ordens recentes
      const recentes = [...ordens]
        .sort((a: any, b: any) => new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime())
        .slice(0, 5);
      setOrdensRecentes(recentes);

      // Alertas
      const listaAlertas = [];
      if (pecasBaixoEstoque > 0) {
        listaAlertas.push({
          tipo: 'warning',
          titulo: 'Peças com estoque baixo',
          descricao: `${pecasBaixoEstoque} peça(s) precisam de reposição`,
          icon: Package,
        });
      }

      const ordensAtrasadas = ordens.filter((o: any) => {
        const dataOrdem = new Date(o.dataAbertura);
        const diasAbertos = Math.floor((hoje.getTime() - dataOrdem.getTime()) / (1000 * 60 * 60 * 24));
        return (o.status === 'aberta' || o.status === 'em_andamento') && diasAbertos > 7;
      }).length;

      if (ordensAtrasadas > 0) {
        listaAlertas.push({
          tipo: 'danger',
          titulo: 'Ordens atrasadas',
          descricao: `${ordensAtrasadas} ordem(ns) há mais de 7 dias em aberto`,
          icon: AlertTriangle,
        });
      }

      setAlertas(listaAlertas);
    }
  }, [ordens, clientes, motos, pecas]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-t-4 border-b-4 border-orange-500 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-r-4 border-l-4 border-purple-500 rounded-full animate-spin-reverse opacity-50"></div>
        </div>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; variant: any }> = {
    aberta: { label: 'Aberta', variant: 'aberta' },
    em_andamento: { label: 'Andamento', variant: 'andamento' },
    pronta: { label: 'Pronta', variant: 'pronta' },
    entregue: { label: 'Entregue', variant: 'entregue' },
    aguardando_peca: { label: 'Aguardando', variant: 'aguardando' },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white font-display">
            Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Visão geral do sistema</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          leftIcon={<Plus size={20} />}
          onClick={() => onNavigate?.('ordens')}
        >
          Nova Ordem
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card: Ordens Abertas */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300 cursor-pointer"
          onClick={() => onNavigate?.('ordens')}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-orange-500/10 rounded-xl">
              <Clock className="text-orange-500" size={24} />
            </div>
            <ChevronRight className="text-slate-600 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-400 font-medium">Ordens Abertas</p>
            <p className="text-3xl font-bold text-white">{stats.ordensAbertas}</p>
          </div>
          {/* Glow effect */}
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl group-hover:bg-orange-500/30 transition-all" />
        </div>

        {/* Card: Em Andamento */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 cursor-pointer"
          onClick={() => onNavigate?.('ordens')}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Activity className="text-blue-500" size={24} />
            </div>
            <ChevronRight className="text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-400 font-medium">Em Andamento</p>
            <p className="text-3xl font-bold text-white">{stats.ordensAndamento}</p>
          </div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all" />
        </div>

        {/* Card: Faturamento do Mês */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer"
          onClick={() => onNavigate?.('financeiro')}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <DollarSign className="text-emerald-500" size={24} />
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
              stats.faturamentoTendencia >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
              <TrendingUp size={12} className={stats.faturamentoTendencia < 0 ? 'rotate-180' : ''} />
              {Math.abs(stats.faturamentoTendencia).toFixed(1)}%
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-400 font-medium">Faturamento do Mês</p>
            <p className="text-3xl font-bold text-white">
              {stats.faturamentoMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all" />
        </div>

        {/* Card: Ordens Hoje */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 cursor-pointer"
          onClick={() => onNavigate?.('ordens')}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Zap className="text-purple-500" size={24} />
            </div>
            <ChevronRight className="text-slate-600 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-400 font-medium">Ordens Hoje</p>
            <p className="text-3xl font-bold text-white">{stats.ordensHoje}</p>
          </div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all" />
        </div>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alertas.map((alerta, idx) => {
            const Icon = alerta.icon;
            const colors = {
              warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: 'text-amber-500' },
              danger: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: 'text-red-500' },
            };
            const color = colors[alerta.tipo as keyof typeof colors];

            return (
              <div key={idx} className={`${color.bg} border ${color.border} rounded-2xl p-4 flex items-start gap-4`}>
                <div className={`p-2 ${color.icon}`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${color.text}`}>{alerta.titulo}</h4>
                  <p className="text-sm text-slate-400 mt-1">{alerta.descricao}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ordens Recentes */}
        <div className="lg:col-span-2 bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Ordens Recentes</h2>
              <p className="text-sm text-slate-400 mt-1">Últimas atividades</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight size={16} />}
              onClick={() => onNavigate?.('ordens')}
            >
              Ver todas
            </Button>
          </div>

          <div className="space-y-3">
            {ordensRecentes.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Wrench size={48} className="mx-auto mb-3 opacity-30" />
                <p>Nenhuma ordem recente</p>
              </div>
            ) : (
              ordensRecentes.map((ordem) => (
                <div 
                  key={ordem.id}
                  onClick={() => onNavigateToOrdens?.(ordem.id)}
                  className="group flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30 hover:border-orange-500/30 rounded-xl transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 font-bold flex-shrink-0">
                      #{ordem.id.toString().slice(-3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors truncate">
                        {ordem.cliente?.nome || 'Cliente Desconhecido'}
                      </h3>
                      <p className="text-sm text-slate-400 flex items-center gap-2 truncate">
                        <Bike size={12} />
                        {ordem.moto?.modelo || 'Moto não identificada'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge 
                      variant={statusConfig[ordem.status]?.variant || 'default'}
                      className="capitalize"
                    >
                      {statusConfig[ordem.status]?.label || ordem.status}
                    </Badge>
                    <ChevronRight className="text-slate-600 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" size={20} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stats Resumo */}
        <div className="space-y-4">
          {/* Clientes Card */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all cursor-pointer"
            onClick={() => onNavigate?.('clientes')}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Users className="text-blue-500" size={24} />
              </div>
              <ChevronRight className="text-slate-600" size={20} />
            </div>
            <p className="text-sm text-slate-400 font-medium">Total de Clientes</p>
            <p className="text-2xl font-bold text-white mt-2">{stats.totalClientes}</p>
          </div>

          {/* Motos Card */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all cursor-pointer"
            onClick={() => onNavigate?.('motos')}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <Bike className="text-purple-500" size={24} />
              </div>
              <ChevronRight className="text-slate-600" size={20} />
            </div>
            <p className="text-sm text-slate-400 font-medium">Motos Cadastradas</p>
            <p className="text-2xl font-bold text-white mt-2">{stats.totalMotos}</p>
          </div>

          {/* Estoque Baixo Card */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:border-amber-500/30 transition-all cursor-pointer"
            onClick={() => onNavigate?.('pecas')}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <Package className="text-amber-500" size={24} />
              </div>
              {stats.pecasBaixoEstoque > 0 && (
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">
                  {stats.pecasBaixoEstoque}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 font-medium">Estoque Baixo</p>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.pecasBaixoEstoque > 0 ? `${stats.pecasBaixoEstoque} peças` : 'Normal'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
