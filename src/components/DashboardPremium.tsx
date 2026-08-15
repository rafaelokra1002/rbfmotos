import { useState, useEffect } from 'react';
import { 
  Wrench, 
  Users, 
  Bike, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Calendar,
  ArrowRight,
  Plus,
  Bell,
  ChevronRight
} from 'lucide-react';
import { useOficinaData } from '../hooks/useOficinaData';
import { StatCard } from './ui/StatCard';
import { Badge } from './ui/Badge';

interface DashboardPremiumProps {
  onNavigateToOrdens?: (ordemId?: string) => void;
  onNavigate?: (view: string) => void;
}

export function DashboardPremium({ onNavigateToOrdens, onNavigate }: DashboardPremiumProps) {
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
  const [ordensUrgentes, setOrdensUrgentes] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (ordens && clientes && motos && pecas) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const mesAtual = hoje.getMonth();
      const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
      const anoMesAnterior = mesAtual === 0 ? hoje.getFullYear() - 1 : hoje.getFullYear();

      // Calcular estatísticas
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

      // Ordens recentes (últimas 6)
      const recentes = [...ordens]
        .sort((a: any, b: any) => new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime())
        .slice(0, 6);
      setOrdensRecentes(recentes);

      // Ordens urgentes (mais de 7 dias em aberto)
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
      
      const urgentes = ordens.filter((o: any) => {
        const dataOrdem = new Date(o.dataAbertura);
        return (o.status === 'aberta' || o.status === 'em_andamento') && 
               dataOrdem < seteDiasAtras;
      });
      setOrdensUrgentes(urgentes);
    }
  }, [ordens, clientes, motos, pecas]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
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

  const menuItems = [
    { label: 'Ordens', icon: Wrench, view: 'ordens', color: 'orange' },
    { label: 'Clientes', icon: Users, view: 'clientes', color: 'blue' },
    { label: 'Motos', icon: Bike, view: 'motos', color: 'purple' },
    { label: 'Estoque', icon: Package, view: 'pecas', color: 'emerald' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-slate-100 overflow-x-hidden">
      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[0%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[0%] left-[20%] w-[35%] h-[35%] bg-blue-500/10 rounded-full blur-[110px]" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto p-6 lg:p-10 space-y-10">
        
        {/* Top Navigation / Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              RBF Motos
            </h1>
            <p className="text-slate-400 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sistema Operacional v3.0
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/50 p-2 pr-6 rounded-full border border-slate-800/50 backdrop-blur-md">
            <div className="flex -space-x-2 px-4">
               {/* Avatares falsos para efeito visual */}
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 border-2 border-slate-900 flex items-center justify-center font-bold text-xs">AD</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-700"></div>
            <div className="text-right">
              <div className="text-sm font-semibold text-white">Administrador</div>
              <div className="text-xs text-slate-400">
                {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </div>
            <button className="p-2 hover:bg-slate-800 rounded-full transition-colors relative">
               <Bell size={20} className="text-slate-400" />
               <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Quick Actions Grid (Bento Box Style) */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
          
          {/* Main Action - Create Order */}
          <div 
            onClick={() => onNavigate?.('ordens')}
            className="md:col-span-2 lg:col-span-2 relative group cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] hover:shadow-orange-500/30"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 group-hover:rotate-12 duration-500">
              <Wrench size={120} />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="p-3 bg-white/20 w-fit rounded-2xl backdrop-blur-sm mb-4">
                <Plus size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">Nova Ordem</h3>
                <p className="text-orange-50 opacity-90">Iniciar serviço</p>
              </div>
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="md:col-span-2 lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {menuItems.map((item) => (
              <div 
                key={item.label}
                onClick={() => onNavigate?.(item.view)}
                className="group cursor-pointer bg-slate-900/60 border border-slate-800/50 rounded-3xl p-6 hover:bg-slate-800/80 transition-all hover:border-slate-700 flex flex-col items-center justify-center gap-3 backdrop-blur-xl"
              >
                <div className={`p-4 rounded-2xl bg-${item.color}-500/10 text-${item.color}-500 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon size={28} />
                </div>
                <span className="font-semibold text-slate-300 group-hover:text-white">{item.label}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Ordens Abertas"
            value={stats.ordensAbertas}
            icon={AlertCircle}
            color="slate"
            onClick={() => onNavigate?.('ordens')}
          />
          <StatCard
            title="Em Andamento"
            value={stats.ordensAndamento}
            icon={Clock}
            color="zinc"
            onClick={() => onNavigate?.('ordens')}
          />
          <StatCard
            title="Faturamento Mês"
            value={`R$ ` + stats.faturamentoMes.toLocaleString('pt-BR')}
            icon={DollarSign}
            color="stone"
            trend={{
              value: Math.abs(stats.faturamentoTendencia),
              isPositive: stats.faturamentoTendencia >= 0,
            }}
            onClick={() => onNavigate?.('financeiro')}
          />
          <StatCard
            title="Ordens Hoje"
            value={stats.ordensHoje}
            icon={Calendar}
            color="neutral"
            onClick={() => onNavigate?.('ordens')}
          />
        </div>

        {/* Main Workspace Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Orders List */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/50 rounded-[30px] p-8 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock size={20} className="text-orange-500" />
                  Atividades Recentes
                </h2>
                <p className="text-slate-400 text-sm mt-1">Últimos serviços atualizados</p>
              </div>
              <button 
                onClick={() => onNavigate?.('ordens')}
                className="text-sm text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1 transition-colors"
              >
                Ver todas <ArrowRight size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {ordensRecentes.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  Nenhuma atividade recente
                </div>
              ) : (
                ordensRecentes.map((ordem) => (
                  <div 
                    key={ordem.id}
                    onClick={() => onNavigateToOrdens?.(ordem.id)}
                    className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                        #{ordem.id.toString().slice(-3)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                          {ordem.cliente?.nome || 'Cliente Desconhecido'}
                        </h3>
                        <p className="text-sm text-slate-400 flex items-center gap-2">
                          <Bike size={12} />
                          {ordem.moto?.modelo || 'Moto não identificada'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                      <Badge 
                        variant={statusConfig[ordem.status]?.variant || 'default'}
                        className="capitalize"
                      >
                        {statusConfig[ordem.status]?.label || ordem.status}
                      </Badge>
                      <ChevronRight size={18} className="text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Side Panel: Urgent & Alerts */}
          <div className="space-y-6">
            
            {/* Alerts Card */}
            <div className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border border-slate-800/50 rounded-[30px] p-6 backdrop-blur-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-red-500" />
                Atenção Necessária
              </h3>
              
              <div className="space-y-3">
                {stats.pecasBaixoEstoque > 0 && (
                  <div 
                    onClick={() => onNavigate?.('pecas')}
                    className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 cursor-pointer hover:bg-red-500/20 transition-all"
                  >
                    <Package className="text-red-400 shrink-0 mt-1" size={18} />
                    <div>
                      <p className="text-red-200 font-medium">Estoque Baixo</p>
                      <p className="text-red-300/60 text-sm">{stats.pecasBaixoEstoque} itens precisam de reposição</p>
                    </div>
                  </div>
                )}
                
                {ordensUrgentes.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                    <Clock className="text-amber-400 shrink-0 mt-1" size={18} />
                    <div>
                      <p className="text-amber-200 font-medium">Ordens Atrasadas</p>
                      <p className="text-amber-300/60 text-sm">{ordensUrgentes.length} ordens abertas há mais de 7 dias</p>
                    </div>
                  </div>
                )}

                {stats.pecasBaixoEstoque === 0 && ordensUrgentes.length === 0 && (
                  <div className="p-8 text-center text-slate-500 bg-white/5 rounded-2xl border border-dashed border-slate-700">
                    <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500/50" />
                    <p>Tudo em dia!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats / Mini Cards */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
                  <p className="text-slate-400 text-xs uppercase font-semibold tracking-normal mb-1">Clientes</p>
                  <p className="text-2xl font-bold text-white">{stats.totalClientes}</p>
               </div>
               <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
                  <p className="text-slate-400 text-xs uppercase font-semibold tracking-normal mb-1">Motos</p>
                  <p className="text-2xl font-bold text-white">{stats.totalMotos}</p>
               </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}



