import { useState, useEffect } from 'react';
import { 
  Wrench, 
  Users, 
  Bike, 
  DollarSign, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Package
} from 'lucide-react';
import { useOficinaData } from '../hooks/useOficinaData';

interface DashboardV2Props {
  onNavigateToOrdens?: (ordemId?: string) => void;
}

export function DashboardV2({ onNavigateToOrdens }: DashboardV2Props) {
  const { ordens, clientes, motos, pecas, loading } = useOficinaData();
  const [stats, setStats] = useState({
    ordensAbertas: 0,
    ordensAndamento: 0,
    ordensHoje: 0,
    faturamentoMes: 0,
    totalClientes: 0,
    totalMotos: 0,
    ordensEntregues: 0,
    pecasBaixoEstoque: 0
  });

  const [ordensRecentes, setOrdensRecentes] = useState<any[]>([]);

  useEffect(() => {
    if (ordens && clientes && motos && pecas) {
      // Calcular estatísticas
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const ordensAbertas = ordens.filter((o: any) => o.status === 'aberta').length;
      const ordensAndamento = ordens.filter((o: any) => o.status === 'em_andamento').length;
      const ordensHoje = ordens.filter((o: any) => {
        const dataOrdem = new Date(o.dataAbertura);
        dataOrdem.setHours(0, 0, 0, 0);
        return dataOrdem.getTime() === hoje.getTime();
      }).length;

      const faturamentoMes = ordens
        .filter((o: any) => {
          const dataOrdem = new Date(o.dataAbertura);
          return dataOrdem.getMonth() === hoje.getMonth() && 
                 dataOrdem.getFullYear() === hoje.getFullYear() &&
                 o.status === 'entregue';
        })
        .reduce((sum: number, o: any) => sum + o.valorTotal, 0);

      const ordensEntregues = ordens.filter((o: any) => o.status === 'entregue').length;
      const pecasBaixoEstoque = pecas.filter((p: any) => (p.quantidadeEstoque || 0) < (p.estoqueMinimo || 5)).length;

      setStats({
        ordensAbertas,
        ordensAndamento,
        ordensHoje,
        faturamentoMes,
        totalClientes: clientes.length,
        totalMotos: motos.length,
        ordensEntregues,
        pecasBaixoEstoque
      });

      // Ordens recentes (últimas 5)
      const recentes = [...ordens]
        .sort((a: any, b: any) => new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime())
        .slice(0, 5);
      
      setOrdensRecentes(recentes);
    }
  }, [ordens, clientes, motos, pecas]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    aberta: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    em_andamento: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    pronta: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    entregue: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    aguardando_peca: 'bg-orange-500/10 text-orange-400 border-orange-500/30'
  };

  const statusLabels: Record<string, string> = {
    aberta: 'Aberta',
    em_andamento: 'Em Andamento',
    pronta: 'Pronta',
    entregue: 'Entregue',
    aguardando_peca: 'Aguardando Peça'
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Visão geral do sistema RBF Motos</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Cards de Estatísticas Principais - 4 colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Ordens Abertas */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <AlertCircle className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-3xl font-bold text-blue-400">{stats.ordensAbertas}</span>
            </div>
            <h3 className="text-slate-300 text-sm font-medium">Ordens Abertas</h3>
            <p className="text-slate-500 text-xs mt-1">Aguardando atendimento</p>
          </div>

          {/* Ordens em Andamento */}
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <Wrench className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-3xl font-bold text-amber-400">{stats.ordensAndamento}</span>
            </div>
            <h3 className="text-slate-300 text-sm font-medium">Em Andamento</h3>
            <p className="text-slate-500 text-xs mt-1">Sendo executadas</p>
          </div>

          {/* Faturamento do Mês */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-2xl font-bold text-emerald-400">
                R$ {stats.faturamentoMes.toFixed(0)}
              </span>
            </div>
            <h3 className="text-slate-300 text-sm font-medium">Faturamento Mês</h3>
            <p className="text-slate-500 text-xs mt-1">Ordens entregues</p>
          </div>

          {/* Ordens Hoje */}
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-3xl font-bold text-purple-400">{stats.ordensHoje}</span>
            </div>
            <h3 className="text-slate-300 text-sm font-medium">Ordens Hoje</h3>
            <p className="text-slate-500 text-xs mt-1">Abertas hoje</p>
          </div>
        </div>

        {/* Cards Secundários - 4 colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Total Clientes */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:bg-slate-700/50 transition-all">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 text-slate-400" />
              <span className="text-2xl font-bold text-white">{stats.totalClientes}</span>
            </div>
            <h3 className="text-slate-300 text-sm font-medium mt-3">Total Clientes</h3>
          </div>

          {/* Total Motos */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:bg-slate-700/50 transition-all">
            <div className="flex items-center justify-between">
              <Bike className="w-8 h-8 text-slate-400" />
              <span className="text-2xl font-bold text-white">{stats.totalMotos}</span>
            </div>
            <h3 className="text-slate-300 text-sm font-medium mt-3">Total Motos</h3>
          </div>

          {/* Ordens Concluídas */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:bg-slate-700/50 transition-all">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8 text-slate-400" />
              <span className="text-2xl font-bold text-white">{stats.ordensEntregues}</span>
            </div>
            <h3 className="text-slate-300 text-sm font-medium mt-3">Ordens Concluídas</h3>
          </div>

          {/* Peças Baixo Estoque */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:bg-slate-700/50 transition-all">
            <div className="flex items-center justify-between">
              <Package className="w-8 h-8 text-orange-400" />
              <span className="text-2xl font-bold text-orange-400">{stats.pecasBaixoEstoque}</span>
            </div>
            <h3 className="text-slate-300 text-sm font-medium mt-3">Peças Baixo Estoque</h3>
          </div>
        </div>

        {/* Ordens Recentes */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Ordens Recentes
            </h2>
          </div>

          <div className="space-y-3">
            {ordensRecentes.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Nenhuma ordem de serviço encontrada</p>
            ) : (
              ordensRecentes.map((ordem) => (
                <div
                  key={ordem.id}
                  onClick={() => onNavigateToOrdens?.(ordem.id)}
                  className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4 hover:bg-slate-700/50 hover:border-amber-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                          OS-{ordem.numero}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-md border ${statusColors[ordem.status] || 'bg-slate-500/10 text-slate-400 border-slate-500/30'}`}>
                          {statusLabels[ordem.status] || ordem.status}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm line-clamp-1 mb-1">
                        {ordem.descricaoProblema}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {new Date(ordem.dataAbertura).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-lg font-bold text-emerald-400">
                        R$ {ordem.valorTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
