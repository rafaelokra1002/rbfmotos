import { useState } from 'react';
import { Bell, Plus, Search, Settings, LogOut, User, ChevronDown, Zap } from 'lucide-react';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';

interface HeaderCyberProps {
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
  onNewOrder?: () => void;
  onNavigate?: (view: string) => void;
  notificationCount?: number;
}

export function HeaderCyber({
  userName = 'Administrador',
  userRole = 'Gerente',
  onLogout,
  onNewOrder,
  onNavigate,
  notificationCount = 0,
}: HeaderCyberProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const today = new Date();
  const dateString = today.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-neon-cyan/20">
      {/* Scan line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-30" />
      
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Date & Search */}
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-glow-pulse shadow-neon-green" />
              <p className="text-sm text-slate-400 font-mono uppercase">
                {dateString}
              </p>
            </div>
            
            <div className="hidden lg:block flex-1 max-w-md">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neon-cyan/50 group-focus-within:text-neon-cyan transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="BUSCAR_DADOS..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-neon-cyan/20 rounded-lg text-sm text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-neon-cyan focus:shadow-neon-cyan/50 transition-all uppercase"
                />
                <div className="absolute inset-0 rounded-lg border border-neon-cyan/0 group-focus-within:border-neon-cyan/30 pointer-events-none transition-colors" />
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Action: Nova Ordem */}
            <Button
              variant="primary"
              size="md"
              leftIcon={<Zap size={18} />}
              onClick={onNewOrder}
              className="hidden sm:inline-flex bg-gradient-to-r from-neon-cyan to-neon-blue hover:from-neon-blue hover:to-neon-cyan shadow-neon-cyan border border-neon-cyan/30 font-mono font-bold"
            >
              NOVA_ORDEM
            </Button>
            
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus size={18} />}
              onClick={onNewOrder}
              className="sm:hidden bg-gradient-to-r from-neon-cyan to-neon-blue border border-neon-cyan/30"
            />

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-neon-cyan hover:bg-slate-900/50 rounded-lg transition-all border border-transparent hover:border-neon-cyan/30"
              >
                <Bell size={20} />
                {notificationCount > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-neon-pink text-white text-xs font-mono font-bold rounded-full flex items-center justify-center ring-2 ring-black animate-pulse">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-neon-pink rounded-full animate-ping opacity-50" />
                  </>
                )}
              </button>

              {/* Dropdown de Notificações */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-neon-cyan/30 rounded-xl shadow-2xl shadow-neon-cyan/20 z-20 animate-scale-in overflow-hidden">
                    <div className="p-4 border-b border-neon-cyan/20 bg-slate-800/50">
                      <h3 className="font-mono font-bold text-neon-cyan uppercase tracking-wider">NOTIFICAÇÕES</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notificationCount > 0 ? (
                        <div className="p-4 space-y-3">
                          <div className="flex gap-3 p-3 bg-slate-800/30 border border-neon-cyan/10 rounded-lg hover:border-neon-cyan/30 transition-colors cursor-pointer">
                            <div className="w-2 h-2 mt-2 bg-neon-cyan rounded-full shadow-neon-cyan flex-shrink-0 animate-pulse" />
                            <div className="flex-1">
                              <p className="text-sm text-slate-200 font-medium">Nova ordem criada</p>
                              <p className="text-xs text-slate-500 mt-1 font-mono">{'> Ordem #1234 registrada'}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-slate-600">
                          <Bell size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm font-mono">{'> NENHUMA_NOTIFICAÇÃO'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-2 pr-3 hover:bg-slate-900/50 rounded-lg transition-all group border border-transparent hover:border-neon-cyan/30"
              >
                <Avatar
                  name={userName}
                  size="md"
                  status="online"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-mono font-medium text-slate-200 group-hover:text-neon-cyan transition-colors uppercase">
                    {userName}
                  </p>
                  <p className="text-xs text-slate-500 font-mono uppercase">
                    {userRole}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  className="hidden lg:block text-slate-500 group-hover:text-neon-cyan transition-colors"
                />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-neon-cyan/30 rounded-xl shadow-2xl shadow-neon-cyan/20 z-20 animate-scale-in overflow-hidden">
                    <div className="p-4 border-b border-neon-cyan/20 bg-slate-800/50">
                      <p className="font-mono font-bold text-neon-cyan uppercase">{userName}</p>
                      <p className="text-sm text-slate-400 font-mono uppercase">{userRole}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate?.('configuracoes');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-neon-cyan/10 hover:text-neon-cyan rounded-lg transition-colors font-mono border border-transparent hover:border-neon-cyan/30"
                      >
                        <User size={16} />
                        MEU_PERFIL
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate?.('configuracoes');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-neon-cyan/10 hover:text-neon-cyan rounded-lg transition-colors font-mono border border-transparent hover:border-neon-cyan/30"
                      >
                        <Settings size={16} />
                        CONFIG
                      </button>
                    </div>
                    <div className="p-2 border-t border-neon-cyan/20">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout?.();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors font-mono border border-transparent hover:border-red-500/30"
                      >
                        <LogOut size={16} />
                        LOGOUT
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
