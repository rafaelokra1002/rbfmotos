import { useState, useEffect } from 'react';
import {
  Home,
  Users,
  Bike,
  FileText,
  Wrench,
  Package,
  DollarSign,
  Settings,
  Cog,
  ChevronLeft,
  ChevronRight,
  Calendar,
  BarChart3,
  UserCog,
  Monitor,
  Menu,
  X,
  LogOut,
  Wallet,
  CreditCard
} from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
  onLogout?: () => void;
  isCompactLayout?: boolean;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'portal', label: 'Portal do Cliente', icon: Monitor },
  { id: 'agendamentos', label: 'Agendamentos', icon: Calendar },
  { id: 'ordens', label: 'Ordens de Serviço', icon: Wrench },
  { id: 'orcamentos', label: 'Orçamentos', icon: FileText },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'motos', label: 'Motos', icon: Bike },
  { id: 'mecanicos', label: 'Mecânicos', icon: UserCog },
  { id: 'servicos', label: 'Serviços', icon: Settings },
  { id: 'pecas', label: 'Peças', icon: Package },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'dividas', label: 'Minhas Dívidas', icon: CreditCard },
  { id: 'caixa', label: 'Caixa', icon: Wallet },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  { id: 'configuracoes', label: 'Configurações', icon: Cog }
];

export function Sidebar({ currentView, onViewChange, isCollapsed, onToggleCollapse, isMobileMenuOpen, onMobileMenuToggle, onLogout, isCompactLayout }: SidebarProps) {
  const [logo, setLogo] = useState<string>('');

  useEffect(() => {
    const configSalva = localStorage.getItem('configuracaoEmpresa');
    if (configSalva) {
      const config = JSON.parse(configSalva);
      setLogo(config.logo || '');
    }
  }, []);

  return (
    <>
      {/* Botão Menu Mobile - fixo no topo */}
      <button
        onClick={onMobileMenuToggle}
        className="md:hidden fixed top-4 right-4 z-50 p-3 bg-slate-800 text-white rounded-xl shadow-xl hover:bg-slate-700 active:scale-95 transition-all duration-200 border border-slate-700"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`
        bg-slate-900 text-slate-100 transition-all duration-300 flex flex-col border-r border-slate-700/50
        ${isCollapsed ? 'w-16' : (isCompactLayout ? 'w-56' : 'w-64')}
        md:relative md:translate-x-0 md:z-10
        fixed inset-y-0 left-0 z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        backdrop-blur-xl shadow-2xl
      `}>
        <div className="px-3 py-4 border-b border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center justify-between gap-3">
            {!isCollapsed ? (
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {logo ? (
                  <>
                    <img 
                      src={logo} 
                      alt="Rbf Motos" 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border-2 border-amber-400/30 flex-shrink-0 shadow-lg shadow-amber-500/20"
                    />
                    <div className="flex-1 min-w-0">
                      <h1 className="text-base sm:text-lg font-bold text-amber-400 truncate">Rbf Motos</h1>
                      <p className="text-xs text-slate-400 truncate">Sistema de Gestão</p>
                    </div>
                  </>
                ) : (
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold text-amber-400">Rbf Motos</h1>
                    <p className="text-xs sm:text-sm text-slate-400">Sistema de Gestão</p>
                  </div>
                )}
              </div>
            ) : (
              logo ? (
                <img 
                  src={logo} 
                  alt="RBF" 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover border-2 border-amber-400/30 shadow-lg shadow-amber-500/20"
                />
              ) : (
                <div className="text-amber-400 font-bold text-lg sm:text-xl">RBF</div>
              )
            )}
            <button
              onClick={onToggleCollapse}
              className="hidden md:block p-1.5 hover:bg-slate-800 rounded-lg transition-all duration-200 flex-shrink-0 text-slate-400 hover:text-amber-400 active:scale-95"
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>
        
        <nav className={`flex-1 ${isCompactLayout ? 'p-2' : 'p-2 sm:p-4'} overflow-y-auto custom-scrollbar`}>
          <ul className={`${isCompactLayout ? 'space-y-1' : 'space-y-1 sm:space-y-2'}`}>
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`
                    w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 rounded-xl transition-all duration-200 font-medium
                    ${isCompactLayout ? 'py-2 text-xs sm:text-sm' : 'py-2.5 sm:py-3 text-sm sm:text-base'}
                    ${currentView === item.id
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-bold shadow-lg shadow-amber-500/30 scale-105'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:scale-105 active:scale-95'
                    }
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon size={isCompactLayout ? 16 : 18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Botão de Logout */}
        {onLogout && (
          <div className="p-2 sm:p-4 border-t border-slate-700/50">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl transition-all duration-200 text-sm sm:text-base font-medium bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white hover:scale-105 active:scale-95 border border-red-500/20 hover:border-red-500"
              title={isCollapsed ? 'Sair do Sistema' : undefined}
            >
              <LogOut size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">Sair do Sistema</span>}
            </button>
          </div>
        )}

        {/* Toggle Dark Mode */}
        <div className="p-3 border-t border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center justify-center">
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </>
  );
}
