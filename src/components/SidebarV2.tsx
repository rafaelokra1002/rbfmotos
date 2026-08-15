import { useState } from 'react';
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
  Wallet
} from 'lucide-react';

interface SidebarV2Props {
  currentView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
  onLogout?: () => void;
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
  { id: 'caixa', label: 'Caixa', icon: Wallet },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  { id: 'configuracoes', label: 'Configurações', icon: Cog }
];

export function SidebarV2({
  currentView,
  onViewChange,
  isCollapsed,
  onToggleCollapse,
  isMobileMenuOpen = false,
  onMobileMenuToggle,
  onLogout
}: SidebarV2Props) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Fechar menu mobile ao selecionar item
  const handleMenuItemClick = (viewId: string) => {
    onViewChange(viewId);
    if (onMobileMenuToggle && window.innerWidth < 768) {
      onMobileMenuToggle();
    }
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 text-white shadow-lg hover:bg-slate-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={onMobileMenuToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-40
          bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
          border-r border-slate-800/50
          shadow-2xl shadow-black/50
          transition-all duration-300 ease-in-out
          flex flex-col
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header com Logo */}
        <div className={`
          h-16 flex items-center border-b border-slate-800/50
          ${isCollapsed ? 'justify-center px-4' : 'justify-between px-6'}
        `}>
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Bike className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white font-display">RBF Motos</h1>
                <p className="text-xs text-slate-400">Sistema de Gestão</p>
              </div>
            </div>
          )}
          
          {isCollapsed && (
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Bike className="w-6 h-6 text-white" />
            </div>
          )}

          {/* Toggle Button - Desktop */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isHovered = hoveredItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl
                  transition-all duration-200 group relative font-medium text-sm
                  ${isActive 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : ''}
              >
                {/* Borda de destaque à esquerda */}
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                )}
                
                <Icon 
                  size={20} 
                  className={`
                    flex-shrink-0 transition-transform duration-200
                    ${isHovered && !isActive ? 'scale-110' : ''}
                  `}
                />
                
                {!isCollapsed && (
                  <span>{item.label}</span>
                )}

                {/* Tooltip para sidebar colapsada */}
                {isCollapsed && isHovered && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 border border-slate-700 text-white text-sm rounded-xl shadow-2xl whitespace-nowrap z-50 animate-scale-in">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer com Logout */}
        <div className={`border-t border-slate-800 p-4 ${isCollapsed ? 'px-3' : 'px-4'}`}>
          {onLogout && (
            <button
              onClick={onLogout}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-slate-300 hover:bg-red-500/10 hover:text-red-400
                transition-all duration-200 group
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? 'Sair' : ''}
            >
              <LogOut size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="font-medium text-sm">Sair</span>}
            </button>
          )}

          {/* Versão */}
          {!isCollapsed && (
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-500">Versão 2.0</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
