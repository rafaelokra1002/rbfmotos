// Classes CSS comuns reutilizáveis para o tema dark

export const commonClasses = {
  // Títulos
  pageTitle: 'text-2xl sm:text-3xl font-bold text-gray-900 dark:text-yellow-400',
  sectionTitle: 'text-lg sm:text-xl font-semibold text-gray-900 dark:text-yellow-400',
  cardTitle: 'font-semibold text-gray-900 dark:text-white',
  
  // Textos
  subtitle: 'text-sm sm:text-base text-gray-600 dark:text-gray-300',
  textMuted: 'text-gray-500 dark:text-gray-400',
  textNormal: 'text-gray-900 dark:text-white',
  
  // Cards e containers
  card: 'bg-white dark:bg-dark-card rounded-xl shadow-lg dark:shadow-black/50 border border-gray-200 dark:border-dark-border transition-all hover:shadow-xl',
  cardSimple: 'bg-white dark:bg-dark-card rounded-lg shadow-sm border border-gray-200 dark:border-dark-border',
  
  // Inputs
  input: 'px-3 py-2 text-sm border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-hover text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400',
  select: 'px-3 py-2 text-sm border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-hover text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500',
  
  // Botões
  btnPrimary: 'flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-bold hover:from-yellow-400 hover:to-yellow-500 rounded-lg transition-all shadow-lg hover:shadow-yellow-500/30',
  btnSecondary: 'flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-200 dark:bg-dark-hover text-gray-700 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors border dark:border-dark-border',
  btnDanger: 'flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-500 dark:bg-red-600 text-white font-semibold hover:bg-red-600 dark:hover:bg-red-700 rounded-lg transition-colors',
  
  // Badges
  badgeSuccess: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30',
  badgeWarning: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  badgeDanger: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30',
  badgeInfo: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30',
  
  // Tabelas
  table: 'min-w-full divide-y divide-gray-200 dark:divide-dark-border',
  tableHeader: 'bg-gray-50 dark:bg-dark-hover',
  tableHeaderCell: 'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
  tableRow: 'hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors border-b dark:border-dark-border',
  tableCell: 'px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white',
};
