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
  LogOut,
  Wallet,
  CreditCard,
  ShoppingCart
} from 'lucide-react';

interface SidebarProfessionalProps {
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
  { id: 'ordens', label: 'Ordens de Serviço', icon: Wrench },
  { id: 'agendamentos', label: 'Agendamentos', icon: Calendar },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'motos', label: 'Motos', icon: Bike },
  { id: 'mecanicos', label: 'Mecânicos', icon: UserCog },
  { id: 'pecas', label: 'Peças', icon: Package },
  { id: 'servicos', label: 'Serviços', icon: Settings },
  { id: 'orcamentos', label: 'Orçamentos', icon: FileText },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'dividas', label: 'Minhas Dívidas', icon: CreditCard },
  { id: 'caixa', label: 'Caixa', icon: Wallet },
  { id: 'pedidos', label: 'Lista de Pedidos', icon: ShoppingCart },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  { id: 'portal', label: 'Portal do Cliente', icon: Monitor },
  { id: 'configuracoes', label: 'Configurações', icon: Cog }
];

export function SidebarProfessional({
  currentView,
  onViewChange,
  isCollapsed,
  onToggleCollapse,
  isMobileMenuOpen,
  onMobileMenuToggle,
  onLogout,
  isCompactLayout
}: SidebarProfessionalProps) {
  const [logo, setLogo] = useState<string>('');

  useEffect(() => {
    const configSalva = localStorage.getItem('configuracaoEmpresa');
    if (configSalva) {
      const config = JSON.parse(configSalva);
      setLogo(config.logo || '');
    }
  }, []);

  const handleMenuItemClick = (viewId: string) => {
    onViewChange(viewId);
    if (onMobileMenuToggle && window.innerWidth < 768) {
      onMobileMenuToggle();
    }
  };

  return (
    <>
      {/* Mobile Menu Toggle - Moved to header area in App.tsx */}
      
      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-30 backdrop-blur-sm"
          onClick={onMobileMenuToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative top-0 left-0 h-screen z-40
          bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          transition-all duration-300 ease-in-out
          flex flex-col
          ${isCollapsed ? 'w-16' : (isCompactLayout ? 'w-56' : 'w-64')}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="min-h-[4rem] pt-[env(safe-area-inset-top)] border-b border-slate-200 dark:border-slate-800 flex items-center px-4 flex-shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {logo ? (
                <img 
                  src={logo} 
                  alt="RBF Motos" 
                  className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700">
                  <Wrench className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  RBF Motos
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Sistema de Gestão
                </p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-700">
              <Wrench className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleMenuItemClick(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200
                      ${isActive
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon 
                      size={18} 
                      strokeWidth={isActive ? 2 : 1.5}
                      className="flex-shrink-0" 
                    />
                    {!isCollapsed && (
                      <span className="text-sm truncate">{item.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-2 flex-shrink-0">
          {/* Toggle Collapse Button - Desktop */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex w-full items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all text-sm"
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {isCollapsed ? (
              <ChevronRight size={18} strokeWidth={1.5} />
            ) : (
              <>
                <ChevronLeft size={18} strokeWidth={1.5} />
                <span className="text-sm">Recolher</span>
              </>
            )}
          </button>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mt-1
                text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                transition-all text-sm
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? 'Sair' : undefined}
            >
              <LogOut size={18} strokeWidth={1.5} className="flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">Sair</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
