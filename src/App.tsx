import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { SidebarProfessional } from './components/SidebarProfessional';
import { Dashboard } from './components/Dashboard';
const OrdensServico = lazy(() => import('./components/OrdensServico').then(m => ({ default: m.OrdensServico })));
const Clientes = lazy(() => import('./components/Clientes').then(m => ({ default: m.Clientes })));
const Motos = lazy(() => import('./components/Motos').then(m => ({ default: m.Motos })));
const Servicos = lazy(() => import('./components/Servicos').then(m => ({ default: m.Servicos })));
const Pecas = lazy(() => import('./components/Pecas').then(m => ({ default: m.Pecas })));
const Orcamentos = lazy(() => import('./components/Orcamentos').then(m => ({ default: m.Orcamentos })));
const Financeiro = lazy(() => import('./components/Financeiro').then(m => ({ default: m.Financeiro })));
const MinhasDividas = lazy(() => import('./components/MinhasDividas').then(m => ({ default: m.MinhasDividas })));
const Caixa = lazy(() => import('./components/Caixa').then(m => ({ default: m.Caixa })));
const ListaPedidos = lazy(() => import('./components/ListaPedidos').then(m => ({ default: m.ListaPedidos })));
const Configuracoes = lazy(() => import('./components/Configuracoes').then(m => ({ default: m.Configuracoes })));
const Agendamentos = lazy(() => import('./components/Agendamentos').then(m => ({ default: m.Agendamentos })));
const Relatorios = lazy(() => import('./components/Relatorios').then(m => ({ default: m.Relatorios })));
const Mecanicos = lazy(() => import('./components/Mecanicos').then(m => ({ default: m.Mecanicos })));
const PortalCliente = lazy(() => import('./components/PortalCliente').then(m => ({ default: m.PortalCliente })));
import { Lock, User, Key, Bike } from 'lucide-react';
import { InstallPWAButton } from './components/InstallPWAButton';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isClientPortal, setIsClientPortal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const [ordemIdParaAbrir, setOrdemIdParaAbrir] = useState<string | undefined>(undefined);
  const autoCollapsedRef = useRef(false);

  // Ajustar layout em telas menores (1366x768)
  useEffect(() => {
    const updateLayoutPreferences = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const shouldUseCompact = width <= 1366 || height <= 820;
      const isMobile = width < 768;

      setIsCompactLayout(shouldUseCompact);

      if (isMobile) {
        setSidebarCollapsed(true);
        autoCollapsedRef.current = true;
        return;
      }

      if (shouldUseCompact && !autoCollapsedRef.current) {
        setSidebarCollapsed(true);
        autoCollapsedRef.current = true;
      } else if (!shouldUseCompact && autoCollapsedRef.current) {
        setSidebarCollapsed(false);
        autoCollapsedRef.current = false;
      }
    };

    updateLayoutPreferences();
    window.addEventListener('resize', updateLayoutPreferences);
    return () => window.removeEventListener('resize', updateLayoutPreferences);
  }, []);

  // Aplicar classe global para ajustar fontes e espaçamentos no modo compacto
  useEffect(() => {
    const root = document.documentElement;
    if (isCompactLayout) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }

    return () => {
      root.classList.remove('compact-mode');
    };
  }, [isCompactLayout]);

  useEffect(() => {
    // PRIMEIRO: Verificar se está acessando via URL do portal do cliente
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('portal') === 'cliente' || window.location.hash === '#portal-cliente') {
      setIsClientPortal(true);
      return; // Não verificar autenticação se for portal do cliente
    }

    // DEPOIS: Verificar se já está autenticado no localStorage (apenas se NÃO for portal)
    const auth = localStorage.getItem('rbfmotos_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (username === 'Rbfmotos' && password === '259918') {
      setIsAuthenticated(true);
      localStorage.setItem('rbfmotos_authenticated', 'true');
    } else {
      setLoginError('Usuário ou senha incorretos');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('rbfmotos_authenticated');
    setUsername('');
    setPassword('');
  };

  const handleSidebarToggle = () => {
    autoCollapsedRef.current = false;
    setSidebarCollapsed((prev) => !prev);
  };

  // Se for acesso do portal do cliente, renderizar apenas o portal
  if (isClientPortal) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Carregando portal...</p>
          </div>
        </div>
      }>
        <PortalCliente />
      </Suspense>
    );
  }

  // Se não estiver autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-8">
            {/* Logo e Título */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-lg shadow-sm mb-4 border border-slate-200 dark:border-slate-600">
                <Bike className="text-slate-700 dark:text-slate-300" size={32} />
              </div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
                RBF Motos
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Sistema de Gestão de Oficina</p>
            </div>

            {/* Formulário de Login */}
            <form onSubmit={handleLogin} className="space-y-5">
              {loginError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-red-800 dark:text-red-300 text-sm text-center flex items-center justify-center gap-2">
                    <Lock size={16} />
                    {loginError}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Usuário
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 transition-all"
                    placeholder="Digite seu usuário"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 transition-all"
                    placeholder="Digite sua senha"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500 text-white font-medium py-3 px-4 rounded-lg shadow-sm hover:shadow-md transform transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Lock size={18} />
                Entrar no Sistema
              </button>
            </form>

            <div className="mt-6">
              <InstallPWAButton variant="full" />
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                © 2024 RBF Motos - Sistema de Gestão
              </p>
            </div>
          </div>

          {/* Informação adicional */}
          <div className="mt-4 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center justify-center gap-1.5">
              <Lock size={14} />
              Acesso restrito a usuários autorizados
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
          onNavigateToOrdens={(ordemId?: string) => {
            setOrdemIdParaAbrir(ordemId);
            setCurrentView('ordens');
          }}
        />;
      case 'ordens':
        return <OrdensServico ordemIdParaAbrir={ordemIdParaAbrir} onChatAberto={() => setOrdemIdParaAbrir(undefined)} />;
      case 'clientes':
        return <Clientes />;
      case 'motos':
        return <Motos />;
      case 'orcamentos':
        return <Orcamentos />;
      case 'servicos':
        return <Servicos />;
      case 'pecas':
        return <Pecas />;
      case 'financeiro':
        return <Financeiro />;
      case 'dividas':
        return <MinhasDividas />;
      case 'caixa':
        return <Caixa />;
      case 'pedidos':
        return <ListaPedidos />;
      case 'agendamentos':
        return <Agendamentos />;
      case 'relatorios':
        return <Relatorios />;
      case 'mecanicos':
        return <Mecanicos />;
      case 'portal':
        return <PortalCliente />;
      case 'configuracoes':
        return <Configuracoes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar Professional */}
      <SidebarProfessional
        currentView={currentView}
        onViewChange={(view: string) => {
          setCurrentView(view);
          // Fechar menu mobile após selecionar
          if (window.innerWidth < 768) {
            setIsMobileMenuOpen(false);
          }
        }}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleSidebarToggle}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onLogout={handleLogout}
        isCompactLayout={isCompactLayout}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <div className="flex items-center gap-3 flex-1">
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 capitalize">
                {currentView === 'dashboard' ? 'Visão Geral' : currentView.replace(/-/g, ' ')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <InstallPWAButton />
            <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:block">
              {username || 'Administrador'}
            </span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
          <div className={`w-full max-w-full ${isCompactLayout ? 'p-4' : 'p-6'}`}>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-300 dark:border-slate-600 mx-auto mb-3"></div>
                  <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
                </div>
              </div>
            }>
              {renderContent()}
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;