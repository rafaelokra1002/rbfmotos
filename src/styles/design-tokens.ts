/**
 * SISTEMA DE DESIGN - RBF MOTOS
 * Design Tokens para consistência visual em todo o sistema
 * Dark Mode Profissional
 */

export const designTokens = {
  // ============================================
  // CORES - Dark Mode Profissional
  // ============================================
  colors: {
    // Background
    background: {
      primary: '#0f172a',      // Fundo principal (slate-900)
      secondary: '#1e293b',    // Fundo secundário (slate-800)
      tertiary: '#334155',     // Fundo terciário (slate-700)
      hover: '#475569',        // Hover states (slate-600)
    },
    
    // Cards e Surfaces
    surface: {
      primary: '#1e293b',      // Cards principais
      secondary: '#334155',    // Cards secundários
      elevated: '#475569',     // Cards elevados
      border: '#475569',       // Bordas sutis
    },
    
    // Texto
    text: {
      primary: '#f1f5f9',      // Texto principal (slate-100)
      secondary: '#cbd5e1',    // Texto secundário (slate-300)
      tertiary: '#94a3b8',     // Texto terciário (slate-400)
      muted: '#64748b',        // Texto desabilitado (slate-500)
      inverse: '#0f172a',      // Texto em backgrounds claros
    },
    
    // Brand - Amarelo (Identidade RBF Motos)
    brand: {
      primary: '#fbbf24',      // Amarelo principal (amber-400)
      light: '#fcd34d',        // Amarelo claro (amber-300)
      dark: '#f59e0b',         // Amarelo escuro (amber-500)
      subtle: '#fef3c7',       // Amarelo suave para backgrounds
    },
    
    // Status & Feedback
    success: {
      primary: '#10b981',      // Verde (emerald-500)
      light: '#34d399',        // Verde claro (emerald-400)
      dark: '#059669',         // Verde escuro (emerald-600)
      bg: '#064e3b',           // Background verde
    },
    
    error: {
      primary: '#ef4444',      // Vermelho (red-500)
      light: '#f87171',        // Vermelho claro (red-400)
      dark: '#dc2626',         // Vermelho escuro (red-600)
      bg: '#7f1d1d',           // Background vermelho
    },
    
    warning: {
      primary: '#f59e0b',      // Laranja (amber-500)
      light: '#fbbf24',        // Laranja claro (amber-400)
      dark: '#d97706',         // Laranja escuro (amber-600)
      bg: '#78350f',           // Background laranja
    },
    
    info: {
      primary: '#3b82f6',      // Azul (blue-500)
      light: '#60a5fa',        // Azul claro (blue-400)
      dark: '#2563eb',         // Azul escuro (blue-600)
      bg: '#1e3a8a',           // Background azul
    },
    
    // Estados
    states: {
      aberta: '#3b82f6',       // Azul
      emAndamento: '#f59e0b',  // Laranja
      pronta: '#10b981',       // Verde
      entregue: '#64748b',     // Cinza
      cancelada: '#ef4444',    // Vermelho
      aguardando: '#8b5cf6',   // Roxo
    },
  },

  // ============================================
  // TIPOGRAFIA
  // ============================================
  typography: {
    fontFamily: {
      sans: '"Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"Fira Code", "Courier New", monospace',
    },
    
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // ============================================
  // ESPAÇAMENTO
  // ============================================
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },

  // ============================================
  // BORDAS
  // ============================================
  borders: {
    radius: {
      sm: '0.375rem',   // 6px
      md: '0.5rem',     // 8px
      lg: '0.75rem',    // 12px
      xl: '1rem',       // 16px
      full: '9999px',   // Circular
    },
    
    width: {
      thin: '1px',
      medium: '2px',
      thick: '4px',
    },
  },

  // ============================================
  // SOMBRAS
  // ============================================
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(251, 191, 36, 0.3)', // Glow amarelo
  },

  // ============================================
  // TRANSIÇÕES
  // ============================================
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },

  // ============================================
  // Z-INDEX
  // ============================================
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // ============================================
  // BREAKPOINTS (Responsivo)
  // ============================================
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// ============================================
// CLASSES UTILITÁRIAS PRÉ-DEFINIDAS
// ============================================
export const commonClasses = {
  // Tipografia
  pageTitle: 'text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100',
  sectionTitle: 'text-xl sm:text-2xl font-semibold text-slate-100',
  cardTitle: 'text-lg font-semibold text-slate-100',
  subtitle: 'text-sm sm:text-base text-slate-300',
  textMuted: 'text-slate-400',
  textNormal: 'text-slate-100',
  
  // Containers
  pageContainer: 'min-h-screen bg-slate-900 p-4 sm:p-6 lg:p-8',
  contentWrapper: 'max-w-7xl mx-auto space-y-6',
  
  // Cards
  card: 'bg-slate-800 rounded-xl shadow-lg border border-slate-700 transition-all duration-250 hover:shadow-xl hover:border-slate-600',
  cardSimple: 'bg-slate-800 rounded-lg shadow-sm border border-slate-700',
  cardInteractive: 'bg-slate-800 rounded-xl shadow-lg border border-slate-700 transition-all duration-250 hover:shadow-xl hover:border-amber-400 hover:-translate-y-1 cursor-pointer',
  cardHeader: 'px-6 py-4 border-b border-slate-700',
  cardBody: 'p-6',
  cardFooter: 'px-6 py-4 border-t border-slate-700 bg-slate-800/50',
  
  // Botões
  btnPrimary: 'px-4 py-2.5 bg-amber-400 text-slate-900 font-semibold rounded-lg shadow-md hover:bg-amber-300 hover:shadow-lg transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
  btnSecondary: 'px-4 py-2.5 bg-slate-700 text-slate-100 font-semibold rounded-lg shadow-md hover:bg-slate-600 hover:shadow-lg transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
  btnDanger: 'px-4 py-2.5 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 hover:shadow-lg transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
  btnSuccess: 'px-4 py-2.5 bg-emerald-500 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-600 hover:shadow-lg transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
  btnGhost: 'px-4 py-2.5 text-slate-300 font-medium rounded-lg hover:bg-slate-700 hover:text-slate-100 transition-all duration-250',
  btnIcon: 'p-2 text-slate-300 hover:text-slate-100 hover:bg-slate-700 rounded-lg transition-all duration-250',
  
  // Inputs
  input: 'w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-250',
  inputError: 'w-full px-4 py-2.5 bg-slate-700 border-2 border-red-500 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400',
  label: 'block text-sm font-medium text-slate-300 mb-2',
  labelRequired: 'block text-sm font-medium text-slate-300 mb-2 after:content-["*"] after:ml-1 after:text-red-400',
  
  // Select
  select: 'w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-250',
  
  // Textarea
  textarea: 'w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-250 resize-none',
  
  // Badges
  badge: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
  badgeSuccess: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  badgeWarning: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30',
  badgeError: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30',
  badgeInfo: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30',
  badgeNeutral: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-300 border border-slate-600',
  
  // Tabelas
  table: 'min-w-full divide-y divide-slate-700',
  tableHeader: 'bg-slate-800/50',
  tableHeaderCell: 'px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider',
  tableBody: 'bg-slate-800 divide-y divide-slate-700',
  tableRow: 'hover:bg-slate-700/50 transition-colors duration-150',
  tableCell: 'px-6 py-4 whitespace-nowrap text-sm text-slate-300',
  
  // Modais
  modalOverlay: 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4',
  modalContent: 'bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-700',
  modalHeader: 'flex items-center justify-between px-6 py-5 border-b border-slate-700 bg-slate-800/90',
  modalBody: 'flex-1 overflow-y-auto p-6',
  modalFooter: 'flex items-center justify-end gap-3 px-6 py-5 border-t border-slate-700 bg-slate-800/50',
  
  // Loading
  spinner: 'animate-spin rounded-full border-4 border-slate-700 border-t-amber-400',
  
  // Alertas
  alert: 'p-4 rounded-lg border flex items-start gap-3',
  alertSuccess: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  alertError: 'bg-red-500/10 border-red-500/30 text-red-400',
  alertWarning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  alertInfo: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  
  // Dividers
  divider: 'border-t border-slate-700',
  
  // Grid
  grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
  gridTight: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
};

export default designTokens;
