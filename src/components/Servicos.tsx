import { useState } from 'react';
import { useOficinaData } from '../hooks/useOficinaData';
import { ServicoForm } from './ServicoForm';
import { Servico } from '../types';
import { Plus, Search, Edit, Trash2, Wrench, Clock, DollarSign } from 'lucide-react';

export function Servicos() {
  const { servicos, adicionarServico, atualizarServico, removerServico } = useOficinaData();
  const [showForm, setShowForm] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');

  const servicosFiltered = servicos.filter(servico => {
    const matchesSearch = 
      servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (servico.descricao && servico.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategoria = !categoriaFilter || servico.categoria === categoriaFilter;
    
    return matchesSearch && matchesCategoria;
  });

  const handleSaveServico = (dados: Omit<Servico, 'id'>) => {
    if (editingServico) {
      atualizarServico(editingServico.id, dados);
    } else {
      adicionarServico(dados);
    }
    setShowForm(false);
    setEditingServico(undefined);
  };

  const handleEditServico = (servico: Servico) => {
    setEditingServico(servico);
    setShowForm(true);
  };

  const handleDeleteServico = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      removerServico(id);
    }
  };

  const getCategoriaInfo = (categoria: string) => {
    const categorias: Record<string, { label: string; color: string }> = {
      mecanica: { label: 'Mecânica', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
      eletrica: { label: 'Elétrica', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
      pneus: { label: 'Pneus', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
      oleo: { label: 'Óleo', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
      revisao: { label: 'Revisão', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
      outros: { label: 'Outros', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' }
    };
    return categorias[categoria] || { label: categoria, color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
  };

  return (
    <div className="p-4 sm:p-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 tracking-tight">Serviços</h1>
          <p className="text-sm text-slate-400 mt-1">{servicos.length} serviços cadastrados</p>
        </div>
        <button
          onClick={() => {
            setEditingServico(undefined);
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-semibold rounded-xl shadow-lg shadow-amber-500/30 transition-all hover:scale-105 w-full sm:w-auto"
        >
          <Plus size={20} />
          Novo Serviço
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative md:col-span-2 lg:col-span-1 group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-10 py-3 border border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
            className="px-4 py-3 border border-slate-700 bg-slate-900 text-slate-100 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all cursor-pointer hover:border-amber-400/50 appearance-none"
          >
            <option value="">Todas as categorias</option>
            <option value="mecanica">Mecânica</option>
            <option value="eletrica">Elétrica</option>
            <option value="pneus">Pneus</option>
            <option value="oleo">Óleo</option>
            <option value="revisao">Revisão</option>
            <option value="outros">Outros</option>
          </select>
          
          <div className="flex items-center justify-center gap-2 bg-amber-500/10 rounded-xl px-4 py-3 border border-amber-500/20">
            <Wrench size={18} className="text-amber-400" />
            <span className="text-sm font-bold text-amber-400">{servicosFiltered.length}</span>
            <span className="text-sm text-slate-400 hidden sm:inline">serviço(s)</span>
          </div>
        </div>
      </div>

      {/* Lista de Serviços */}
      {servicosFiltered.length === 0 ? (
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 p-12 sm:p-16 text-center animate-scaleIn">
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wrench className="h-10 w-10 text-amber-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-100 mb-3">Nenhum serviço encontrado</h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            {searchTerm || categoriaFilter 
              ? 'Tente ajustar os filtros de busca para encontrar outros serviços.' 
              : 'Comece cadastrando seu primeiro serviço clicando no botão abaixo.'
            }
          </p>
          {!searchTerm && !categoriaFilter && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-semibold rounded-xl shadow-lg shadow-amber-500/30 transition-all hover:scale-105"
            >
              <Plus size={20} />
              Cadastrar Primeiro Serviço
            </button>
          )}
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 overflow-hidden animate-scaleIn">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Serviço</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Preço</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Tempo</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-amber-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {servicosFiltered.map((servico, index) => {
                  const categoriaInfo = getCategoriaInfo(servico.categoria);
                  
                  return (
                    <tr key={servico.id} className={`${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-900/50'} hover:bg-slate-700/30 transition-colors duration-150`}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-bold text-slate-100">{servico.nome}</div>
                          {servico.descricao && (
                            <div className="text-sm text-slate-400 line-clamp-1 mt-1">{servico.descricao}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${categoriaInfo.color}`}>
                          {categoriaInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm font-bold text-amber-400">
                          <DollarSign size={16} className="text-amber-500" />
                          R$ {servico.preco.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {servico.tempoEstimado ? (
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <div className="p-1.5 bg-blue-500/20 border border-blue-500/30 rounded">
                              <Clock size={14} className="text-blue-400" />
                            </div>
                            <span className="font-medium">{servico.tempoEstimado} min</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditServico(servico)}
                            className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 border border-transparent hover:border-amber-500/30 rounded-lg transition-all hover:scale-110"
                            title="Editar serviço"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteServico(servico.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 rounded-lg transition-all hover:scale-110"
                            title="Excluir serviço"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <ServicoForm
          servico={editingServico}
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingServico(undefined);
          }}
          onSave={handleSaveServico}
        />
      )}
    </div>
  );
}
