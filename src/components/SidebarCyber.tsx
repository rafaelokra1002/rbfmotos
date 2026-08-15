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
  Wallet,
  Hexagon
} from 'lucide-react';

interface SidebarCyberProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
  onLogout?: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'neon-cyan' },
  { id: 'portal', label: 'Portal Cliente', icon: Monitor, color: 'neon-blue' },
  { id: 'agendamentos', label: 'Agendamentos', icon: Calendar, color: 'neon-purple' },
  { id: 'ordens', label: 'Ordens', icon: Wrench, color: 'neon-magenta' },
  { id: 'orcamentos', label: 'Orçamentos', icon: FileText, color: 'neon-cyan' },
  { id: 'clientes', label: 'Clientes', icon: Users, color: 'neon-blue' },
  { id: 'motos', label: 'Motos', icon: Bike, color: 'neon-purple' },
  { id: 'mecanicos', label: 'Mecânicos', icon: UserCog, color: 'neon-green' },
  { id: 'servicos', label: 'Serviços', icon: Settings, color: 'neon-yellow' },
  { id: 'pecas', label: 'Peças', icon: Package, color: 'neon-pink' },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign, color: 'neon-green' },
  { id: 'caixa', label: 'Caixa', icon: Wallet, color: 'neon-yellow' },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3, color: 'neon-magenta' },
  { id: 'configuracoes', label: 'Config', icon: Cog, color: 'neon-cyan' }
];

export function SidebarCyber({
  currentView,
  onViewChange,
  isCollapsed,
  onToggleCollapse,
  isMobileMenuOpen = false,
  onMobileMenuToggle,
  onLogout
}: SidebarCyberProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-neon-cyan/30 text-neon-cyan shadow-neon-cyan hover:bg-slate-800 transition-all"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-30"
          onClick={onMobileMenuToggle}
        />
      )}

      {/* Sidebar Cyber */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-40
          bg-black border-r border-neon-cyan/20
          shadow-[4px_0_20px_rgba(0,240,255,0.2)]
          transition-all duration-300 ease-in-out
          flex flex-col
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Cyber Grid Background */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }} />

        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-neon-cyan via-neon-magenta to-neon-cyan opacity-50" />

        {/* Header com Logo */}
        <div className={`
          relative h-20 flex items-center border-b border-neon-cyan/20
          ${isCollapsed ? 'justify-center px-4' : 'justify-between px-6'}
        `}>
          {!isCollapsed && (
            <div className="flex items-center space-x-3 animate-slide-in-right">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-neon-cyan to-neon-blue rounded-lg flex items-center justify-center shadow-neon-cyan">
                  <Bike className="w-6 h-6 text-black" />
                </div>
                <div className="absolute -inset-1 bg-neon-cyan/30 rounded-lg blur animate-glow-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-display font-black text-neon-cyan tracking-tighter">
                  RBF_MOTOS
                </h1>
                <p className="text-xs text-slate-500 font-mono">{'> v4.0_cyber'}</p>
              </div>
            </div>
          )}
          
          {isCollapsed && (
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-neon-cyan to-neon-blue rounded-lg flex items-center justify-center shadow-neon-cyan">
                <Bike className="w-6 h-6 text-black" />
              </div>
              <div className="absolute -inset-1 bg-neon-cyan/30 rounded-lg blur animate-glow-pulse" />
            </div>
          )}

          {/* Toggle Button - Desktop */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900/50 border border-neon-cyan/30 text-neon-cyan hover:bg-slate-800 hover:shadow-neon-cyan transition-all"
            aria-label={isCollapsed ? 'Expandir' : 'Recolher'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-neon-cyan/20 scrollbar-track-transparent">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isHovered = hoveredItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`
                  relative w-full flex items-center gap-3 px-3 py-3 rounded-lg
                  transition-all duration-200 group
                  ${isActive 
                    ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/50 shadow-neon-cyan' 
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 border border-transparent'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                  animate-slide-in-right
                `}
                title={isCollapsed ? item.label : ''}
              >
                {/* Hexagon background para item ativo */}
                {isActive && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Hexagon size={60} className="text-neon-cyan" />
                  </div>
                )}

                {/* Icon com efeito */}
                <div className="relative z-10">
                  <Icon 
                    size={20} 
                    className={`
                      transition-all duration-200
                      ${isActive ? 'drop-shadow-[0_0_6px_rgba(0,240,255,0.8)]' : ''}
                      ${isHovered && !isActive ? 'scale-110' : ''}
                    `}
                  />
                </div>
                
                {!isCollapsed && (
                  <span className="relative z-10 font-mono text-sm font-medium tracking-wide">
                    {item.label.toUpperCase()}
                  </span>
                )}

                {/* Barra lateral de destaque */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-neon-cyan rounded-r-full shadow-neon-cyan animate-glow-pulse" />
                )}

                {/* Tooltip para sidebar colapsada */}
                {isCollapsed && isHovered && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-slate-900/95 backdrop-blur-xl border border-neon-cyan/50 text-neon-cyan text-sm font-mono rounded-lg shadow-neon-cyan whitespace-nowrap z-50 animate-scale-in">
                    {item.label.toUpperCase()}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-neon-cyan/50" />
                  </div>
                )}

                {/* Particle effect no hover */}
                {isHovered && !isActive && (
                  <div className="absolute inset-0 rounded-lg overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-1 bg-neon-cyan rounded-full animate-ping" />
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer com Logout */}
        <div className={`border-t border-neon-cyan/20 p-4 ${isCollapsed ? 'px-3' : 'px-4'}`}>
          {onLogout && (
            <button
              onClick={onLogout}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-lg
                text-red-400 hover:bg-red-500/10 hover:text-red-300
                border border-transparent hover:border-red-500/50
                transition-all duration-200 group
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? 'Sair' : ''}
            >
              <LogOut size={20} className="group-hover:animate-pulse" />
              {!isCollapsed && (
                <span className="font-mono text-sm font-medium tracking-wide">LOGOUT</span>
              )}
            </button>
          )}

          {/* System Status */}
          {!isCollapsed && (
            <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-glow-pulse shadow-neon-green" />
                <span className="text-xs font-mono text-neon-green">SYSTEM_ONLINE</span>
              </div>
              <p className="text-xs text-slate-600 font-mono">Ver 4.0.0_CYBER</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
