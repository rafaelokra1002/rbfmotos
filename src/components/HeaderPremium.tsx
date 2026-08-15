import { useState } from 'react';
import { Bell, Plus, Search, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';

interface HeaderPremiumProps {
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
  onNewOrder?: () => void;
  onNavigate?: (view: string) => void;
  notificationCount?: number;
}

export function HeaderPremium({
  userName = 'Administrador',
  userRole = 'Gerente',
  onLogout,
  onNewOrder,
  onNavigate,
  notificationCount = 0,
}: HeaderPremiumProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const today = new Date();
  const dateString = today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Date & Search */}
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden md:block">
              <p className="text-sm text-slate-400 capitalize">
                {dateString}
              </p>
            </div>
            
            <div className="hidden lg:block flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Buscar ordens, clientes, motos..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Action: Nova Ordem */}
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus size={18} />}
              onClick={onNewOrder}
              className="hidden sm:inline-flex"
            >
              Nova Ordem
            </Button>
            
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus size={18} />}
              onClick={onNewOrder}
              className="sm:hidden"
            />

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
              >
                <Bell size={20} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-slate-900">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              {/* Dropdown de Notificações */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-20 animate-scale-in">
                    <div className="p-4 border-b border-slate-700">
                      <h3 className="font-semibold text-slate-100">Notificações</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notificationCount > 0 ? (
                        <div className="p-4 space-y-3">
                          {/* Exemplos de notificações */}
                          <div className="flex gap-3 p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors cursor-pointer">
                            <div className="w-2 h-2 mt-2 bg-orange-500 rounded-full flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-slate-200 font-medium">Nova ordem criada</p>
                              <p className="text-xs text-slate-400 mt-1">Ordem #1234 foi registrada</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-slate-500">
                          <Bell size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Nenhuma notificação</p>
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
                className="flex items-center gap-3 p-2 pr-3 hover:bg-slate-800 rounded-xl transition-all group"
              >
                <Avatar
                  name={userName}
                  size="md"
                  status="online"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                    {userName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {userRole}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  className="hidden lg:block text-slate-500 group-hover:text-slate-300 transition-colors"
                />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-20 animate-scale-in overflow-hidden">
                    <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                      <p className="font-semibold text-slate-100">{userName}</p>
                      <p className="text-sm text-slate-400">{userRole}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate?.('configuracoes');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-xl transition-colors"
                      >
                        <User size={16} />
                        Meu Perfil
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate?.('configuracoes');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-xl transition-colors"
                      >
                        <Settings size={16} />
                        Configurações
                      </button>
                    </div>
                    <div className="p-2 border-t border-slate-700">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout?.();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                      >
                        <LogOut size={16} />
                        Sair
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
