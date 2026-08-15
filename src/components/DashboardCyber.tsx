import { useState, useEffect } from 'react';
import { 
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
  Zap,
  Cpu,
  Box,
  Layers,
  Target
} from 'lucide-react';
import { useOficinaData } from '../hooks/useOficinaData';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface DashboardCyberProps {
  onNavigateToOrdens?: (ordemId?: string) => void;
  onNavigate?: (view: string) => void;
}

export function DashboardCyber({ onNavigateToOrdens, onNavigate }: DashboardCyberProps) {
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

      const recentes = [...ordens]
        .sort((a: any, b: any) => new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime())
        .slice(0, 5);
      setOrdensRecentes(recentes);

      const listaAlertas = [];
      if (pecasBaixoEstoque > 0) {
        listaAlertas.push({
          tipo: 'warning',
          titulo: 'ALERTA DE ESTOQUE',
          descricao: `${pecasBaixoEstoque} peça(s) crítico`,
          icon: Package,
          color: 'neon-yellow',
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
          titulo: 'ORDENS CRÍTICAS',
          descricao: `${ordensAtrasadas} ordem(ns) atrasada(s)`,
          icon: AlertTriangle,
          color: 'neon-pink',
        });
      }

      setAlertas(listaAlertas);
    }
  }, [ordens, clientes, motos, pecas]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="relative">
          <div className="w-20 h-20 border-t-4 border-b-4 border-neon-cyan rounded-full animate-spin shadow-neon-cyan"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-r-4 border-l-4 border-neon-magenta rounded-full animate-spin-reverse opacity-70 shadow-neon-magenta"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Cpu className="text-neon-cyan animate-pulse" size={32} />
          </div>
        </div>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; variant: any }> = {
    aberta: { label: 'ABERTA', variant: 'aberta' },
    em_andamento: { label: 'PROC.', variant: 'andamento' },
    pronta: { label: 'PRONTA', variant: 'pronta' },
    entregue: { label: 'OK', variant: 'entregue' },
    aguardando_peca: { label: 'WAIT', variant: 'aguardando' },
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 relative overflow-hidden">
      
      {/* 🌌 CYBER BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Grid Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
        
        {/* Neon Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-neon-magenta/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        
        {/* Scan Line */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-30 animate-scan" />
      </div>

      <div className="relative z-10 max-w-[1800px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* 🎯 HEADER CYBER */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-glow-pulse shadow-neon-green" />
                <div className="absolute inset-0 w-2 h-2 bg-neon-green rounded-full animate-ping" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-purple bg-clip-text text-transparent">
                RBF_SYSTEM
              </h1>
            </div>
            <p className="text-sm text-slate-500 font-mono pl-5">
              {'> OFICINA_MECANICA_V4.0_ONLINE'}
            </p>
          </div>
          
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Plus size={20} />}
            onClick={() => onNavigate?.('ordens')}
            className="bg-gradient-to-r from-neon-cyan to-neon-blue hover:from-neon-blue hover:to-neon-cyan shadow-neon-cyan border border-neon-cyan/30"
          >
            <span className="font-display font-bold">NOVA ORDEM</span>
          </Button>
        </div>

        {/* 🎮 KPI CARDS - HOLOGRAPHIC STYLE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* ORDENS ABERTAS */}
          <div 
            onClick={() => onNavigate?.('ordens')}
            className="group relative cursor-pointer"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-cyan to-neon-blue rounded-2xl opacity-30 group-hover:opacity-60 blur transition duration-300" />
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-neon-cyan/30 rounded-2xl p-6 hover:border-neon-cyan transition-all duration-300">
              {/* Scan effect */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-neon-cyan to-transparent animate-scan opacity-50" />
              
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-neon-cyan/10 rounded-xl border border-neon-cyan/30 group-hover:shadow-neon-cyan transition-all">
                  <Clock className="text-neon-cyan" size={24} />
                </div>
                <div className="font-mono text-xs text-neon-cyan opacity-70">STATUS</div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-mono text-slate-400 uppercase tracking-wider">Ordens Abertas</p>
                <p className="text-4xl font-display font-black text-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
                  {stats.ordensAbertas}
                </p>
              </div>
              
              <div className="absolute bottom-2 right-2">
                <Target className="text-neon-cyan/20 group-hover:text-neon-cyan/40 transition-all" size={48} />
              </div>
            </div>
          </div>

          {/* EM ANDAMENTO */}
          <div 
            onClick={() => onNavigate?.('ordens')}
            className="group relative cursor-pointer"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-purple to-neon-magenta rounded-2xl opacity-30 group-hover:opacity-60 blur transition duration-300" />
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-neon-purple/30 rounded-2xl p-6 hover:border-neon-purple transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-neon-purple to-transparent animate-scan opacity-50" style={{ animationDelay: '0.5s' }} />
              
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-neon-purple/10 rounded-xl border border-neon-purple/30 group-hover:shadow-neon-purple transition-all">
                  <Activity className="text-neon-purple" size={24} />
                </div>
                <div className="font-mono text-xs text-neon-purple opacity-70">ACTIVE</div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-mono text-slate-400 uppercase tracking-wider">Em Processo</p>
                <p className="text-4xl font-display font-black text-neon-purple drop-shadow-[0_0_8px_rgba(189,0,255,0.5)]">
                  {stats.ordensAndamento}
                </p>
              </div>
              
              <div className="absolute bottom-2 right-2">
                <Layers className="text-neon-purple/20 group-hover:text-neon-purple/40 transition-all" size={48} />
              </div>
            </div>
          </div>

          {/* FATURAMENTO */}
          <div 
            onClick={() => onNavigate?.('financeiro')}
            className="group relative cursor-pointer"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-green to-emerald-400 rounded-2xl opacity-30 group-hover:opacity-60 blur transition duration-300" />
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-neon-green/30 rounded-2xl p-6 hover:border-neon-green transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-neon-green to-transparent animate-scan opacity-50" style={{ animationDelay: '1s' }} />
              
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-neon-green/10 rounded-xl border border-neon-green/30 group-hover:shadow-neon-green transition-all">
                  <DollarSign className="text-neon-green" size={24} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono font-bold ${
                  stats.faturamentoTendencia >= 0 ? 'bg-neon-green/10 text-neon-green' : 'bg-neon-pink/10 text-neon-pink'
                }`}>
                  <TrendingUp size={10} className={stats.faturamentoTendencia < 0 ? 'rotate-180' : ''} />
                  {Math.abs(stats.faturamentoTendencia).toFixed(1)}%
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-mono text-slate-400 uppercase tracking-wider">Revenue/Mês</p>
                <p className="text-3xl font-display font-black text-neon-green drop-shadow-[0_0_8px_rgba(0,255,65,0.5)]">
                  {stats.faturamentoMes.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  })}
                </p>
              </div>
              
              <div className="absolute bottom-2 right-2">
                <TrendingUp className="text-neon-green/20 group-hover:text-neon-green/40 transition-all" size={48} />
              </div>
            </div>
          </div>

          {/* HOJE */}
          <div 
            onClick={() => onNavigate?.('ordens')}
            className="group relative cursor-pointer"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-pink to-red-500 rounded-2xl opacity-30 group-hover:opacity-60 blur transition duration-300" />
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-neon-pink/30 rounded-2xl p-6 hover:border-neon-pink transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-neon-pink to-transparent animate-scan opacity-50" style={{ animationDelay: '1.5s' }} />
              
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-neon-pink/10 rounded-xl border border-neon-pink/30 group-hover:shadow-neon-pink transition-all">
                  <Zap className="text-neon-pink" size={24} />
                </div>
                <div className="font-mono text-xs text-neon-pink opacity-70">HOJE</div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-mono text-slate-400 uppercase tracking-wider">Ordens/Hoje</p>
                <p className="text-4xl font-display font-black text-neon-pink drop-shadow-[0_0_8px_rgba(255,0,110,0.5)]">
                  {stats.ordensHoje}
                </p>
              </div>
              
              <div className="absolute bottom-2 right-2">
                <Zap className="text-neon-pink/20 group-hover:text-neon-pink/40 transition-all" size={48} />
              </div>
            </div>
          </div>
        </div>

        {/* 🚨 ALERTAS CRÍTICOS */}
        {alertas.length > 0 && (
          <div className="space-y-3">
            {alertas.map((alerta, idx) => {
              const Icon = alerta.icon;
              return (
                <div key={idx} className="relative group">
                  <div className={`absolute -inset-0.5 bg-${alerta.color} rounded-xl opacity-30 blur`} />
                  <div className="relative bg-slate-900/90 backdrop-blur-xl border border-red-500/50 rounded-xl p-4 flex items-center gap-4">
                    <div className="relative">
                      <Icon className="text-red-500 animate-pulse" size={28} />
                      <div className="absolute inset-0 animate-ping">
                        <Icon className="text-red-500 opacity-30" size={28} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-display font-bold text-red-400 tracking-wide">{alerta.titulo}</h4>
                      <p className="text-sm text-slate-400 font-mono mt-1">{alerta.descricao}</p>
                    </div>
                    <div className="px-3 py-1 bg-red-500/20 rounded-lg">
                      <span className="font-mono text-xs text-red-400 font-bold">!</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 📊 GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ORDENS RECENTES */}
          <div className="lg:col-span-2 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-cyan/30 to-neon-purple/30 rounded-2xl opacity-30 blur" />
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white tracking-tight">RECENTES</h2>
                  <p className="text-sm text-slate-500 font-mono mt-1">{'> últimas_atividades'}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ArrowRight size={16} />}
                  onClick={() => onNavigate?.('ordens')}
                  className="font-mono text-neon-cyan hover:text-neon-cyan"
                >
                  VER_TODAS
                </Button>
              </div>

              <div className="space-y-2">
                {ordensRecentes.length === 0 ? (
                  <div className="text-center py-12 text-slate-600">
                    <Box size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="font-mono text-sm">{'> NENHUM_REGISTRO_ENCONTRADO'}</p>
                  </div>
                ) : (
                  ordensRecentes.map((ordem) => (
                    <div 
                      key={ordem.id}
                      onClick={() => onNavigateToOrdens?.(ordem.id)}
                      className="group/item relative cursor-pointer"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-cyan/0 to-neon-cyan/20 rounded-xl opacity-0 group-hover/item:opacity-100 blur transition duration-300" />
                      <div className="relative flex items-center gap-4 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/30 hover:border-neon-cyan/50 rounded-xl transition-all">
                        <div className="w-12 h-12 bg-slate-700/50 backdrop-blur-sm rounded-lg flex items-center justify-center font-mono text-sm font-bold text-neon-cyan border border-slate-600">
                          #{ordem.id.toString().slice(-3)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white group-hover/item:text-neon-cyan transition-colors truncate">
                            {ordem.cliente?.nome || 'UNKNOW_USER'}
                          </h3>
                          <p className="text-sm text-slate-500 flex items-center gap-2 truncate font-mono">
                            <Bike size={12} />
                            {ordem.moto?.modelo || 'N/A'}
                          </p>
                        </div>
                        
                        <Badge 
                          variant={statusConfig[ordem.status]?.variant || 'default'}
                          className="font-mono text-xs"
                        >
                          {statusConfig[ordem.status]?.label || ordem.status}
                        </Badge>
                        
                        <ChevronRight className="text-slate-600 group-hover/item:text-neon-cyan group-hover/item:translate-x-1 transition-all" size={20} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* STATS LATERAL */}
          <div className="space-y-4">
            {/* Clientes */}
            <div className="relative group cursor-pointer" onClick={() => onNavigate?.('clientes')}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-xl opacity-30 group-hover:opacity-60 blur transition duration-300" />
              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/50 rounded-xl p-5 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Users className="text-cyan-400" size={24} />
                  <ChevronRight className="text-slate-600 group-hover:text-cyan-400 transition-colors" size={20} />
                </div>
                <p className="text-sm font-mono text-slate-400 uppercase">Clientes</p>
                <p className="text-3xl font-display font-bold text-white mt-2">{stats.totalClientes}</p>
              </div>
            </div>

            {/* Motos */}
            <div className="relative group cursor-pointer" onClick={() => onNavigate?.('motos')}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-xl opacity-30 group-hover:opacity-60 blur transition duration-300" />
              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 rounded-xl p-5 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Bike className="text-purple-400" size={24} />
                  <ChevronRight className="text-slate-600 group-hover:text-purple-400 transition-colors" size={20} />
                </div>
                <p className="text-sm font-mono text-slate-400 uppercase">Motos</p>
                <p className="text-3xl font-display font-bold text-white mt-2">{stats.totalMotos}</p>
              </div>
            </div>

            {/* Estoque */}
            <div className="relative group cursor-pointer" onClick={() => onNavigate?.('pecas')}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-xl opacity-30 group-hover:opacity-60 blur transition duration-300" />
              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-amber-500/50 rounded-xl p-5 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Package className="text-amber-400" size={24} />
                  {stats.pecasBaixoEstoque > 0 && (
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-mono font-bold rounded-full animate-pulse">
                      !{stats.pecasBaixoEstoque}
                    </span>
                  )}
                </div>
                <p className="text-sm font-mono text-slate-400 uppercase">Estoque</p>
                <p className="text-2xl font-display font-bold text-white mt-2">
                  {stats.pecasBaixoEstoque > 0 ? `${stats.pecasBaixoEstoque} BAIXO` : 'NORMAL'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
