import { useState } from 'react';
import { BarChart3, TrendingUp, Package, Wrench, Users, Calendar, Download, FileText, DollarSign } from 'lucide-react';

export function Relatorios() {
  const [periodo, setPeriodo] = useState('mensal');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const relatoriosDisponiveis = [
    {
      id: 'faturamento',
      titulo: 'Faturamento',
      descricao: 'Receitas, despesas e lucro líquido',
      icon: DollarSign,
      color: 'from-green-400 to-green-600',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      id: 'pecas_vendidas',
      titulo: 'Peças Mais Vendidas',
      descricao: 'Ranking de peças por quantidade',
      icon: Package,
      color: 'from-yellow-400 to-yellow-600',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      id: 'servicos_realizados',
      titulo: 'Serviços Realizados',
      descricao: 'Tipos de serviço mais executados',
      icon: Wrench,
      color: 'from-blue-400 to-blue-600',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'clientes_frequentes',
      titulo: 'Clientes Frequentes',
      descricao: 'Clientes com mais ordens de serviço',
      icon: Users,
      color: 'from-purple-400 to-purple-600',
      textColor: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-black p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-3 rounded-2xl shadow-strong">
              <BarChart3 className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Relatórios e Análises
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base font-medium">
                Dados e métricas do seu negócio
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-medium dark:shadow-strong border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 animate-slide-up">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-2 rounded-xl shadow-soft">
              <Calendar className="text-white w-5 h-5" />
            </div>
            Período da Análise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 dark:focus:border-yellow-500 transition-all font-medium"
            >
              <option value="hoje">Hoje</option>
              <option value="semanal">Esta Semana</option>
              <option value="mensal">Este Mês</option>
              <option value="trimestral">Este Trimestre</option>
              <option value="anual">Este Ano</option>
              <option value="personalizado">Personalizado</option>
            </select>

            {periodo === 'personalizado' && (
              <>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 dark:focus:border-yellow-500 transition-all font-medium"
                  placeholder="Data Início"
                />
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 dark:focus:border-yellow-500 transition-all font-medium"
                  placeholder="Data Fim"
                />
              </>
            )}
          </div>
        </div>

        {/* Cards de Relatórios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {relatoriosDisponiveis.map((relatorio, idx) => {
            const Icon = relatorio.icon;
            return (
              <div 
                key={relatorio.id} 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-medium dark:shadow-strong border border-gray-200 dark:border-gray-700 hover:shadow-strong hover:scale-105 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl shadow-soft bg-gradient-to-br ${relatorio.color}`}>
                      <Icon className="text-white" size={28} />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold rounded-xl transition-all hover:scale-105 transform shadow-medium">
                      <Download size={16} />
                      Exportar
                    </button>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {relatorio.titulo}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4">
                    {relatorio.descricao}
                  </p>
                  
                  {/* Preview do Relatório */}
                  <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Última atualização</span>
                      <span className={`font-bold ${relatorio.textColor}`}>Agora mesmo</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gráfico de Faturamento */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-medium dark:shadow-strong border border-gray-200 dark:border-gray-700 p-4 sm:p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="bg-gradient-to-br from-indigo-400 to-indigo-600 p-2 rounded-xl shadow-soft">
                <FileText className="text-white w-5 h-5" />
              </div>
              Faturamento Mensal
            </h2>
          </div>
          <div className="h-64 sm:h-80 flex items-end justify-around gap-1 sm:gap-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600">
            {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((mes) => {
              const altura = Math.random() * 100;
              const valor = (altura * 50).toFixed(0);
              return (
                <div key={mes} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 rounded-t-xl transition-all cursor-pointer relative group shadow-soft" 
                    style={{ height: `${altura}%` }}
                  >
                    <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-strong">
                      R$ {valor}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400">{mes}</span>
                </div>
              );
            })}
          </div>
          
          {/* Legenda */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded"></div>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Faturamento</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-600 dark:text-green-400" />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Crescimento Médio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
