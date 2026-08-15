import { useState } from 'react';
import { useOficinaData } from '../hooks/useOficinaData';
import { PecaForm } from './PecaForm';
import { Peca } from '../types';
import { Plus, Search, Edit, Trash2, Package, DollarSign, Hash } from 'lucide-react';

export function Pecas() {
  const { pecas, adicionarPeca, atualizarPeca, removerPeca } = useOficinaData();
  const [showForm, setShowForm] = useState(false);
  const [editingPeca, setEditingPeca] = useState<Peca | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');

  const pecasFiltered = pecas.filter(peca => {
    const matchesSearch = 
      peca.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (peca.codigo && peca.codigo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategoria = !categoriaFilter || peca.categoria === categoriaFilter;
    
    return matchesSearch && matchesCategoria;
  });

  const handleSavePeca = (dados: Omit<Peca, 'id'>) => {
    if (editingPeca) {
      atualizarPeca(editingPeca.id, dados);
    } else {
      adicionarPeca(dados);
    }
    setShowForm(false);
    setEditingPeca(undefined);
  };

  const handleEditPeca = (peca: Peca) => {
    setEditingPeca(peca);
    setShowForm(true);
  };

  const handleDeletePeca = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta peça?')) {
      removerPeca(id);
    }
  };

  const categorias = [...new Set(pecas.map(p => p.categoria))];

  return (
    <div className="p-4 sm:p-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 tracking-tight">Peças</h1>
          <p className="text-sm text-slate-400 mt-1">{pecas.length} peças cadastradas</p>
        </div>
        <button
          onClick={() => {
            setEditingPeca(undefined);
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-semibold rounded-xl shadow-lg shadow-amber-500/30 transition-all hover:scale-105 w-full sm:w-auto"
        >
          <Plus size={20} />
          Nova Peça
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative md:col-span-2 lg:col-span-1 group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Buscar peças por nome ou código..."
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
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <div className="flex items-center justify-center gap-2 bg-amber-500/10 rounded-xl px-4 py-3 border border-amber-500/20">
            <Package size={18} className="text-amber-400" />
            <span className="text-sm font-bold text-amber-400">{pecasFiltered.length}</span>
            <span className="text-sm text-slate-400 hidden sm:inline">peça(s)</span>
          </div>
        </div>
      </div>

      {/* Lista de Peças */}
      {pecasFiltered.length === 0 ? (
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 p-12 sm:p-16 text-center animate-scaleIn">
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-amber-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-100 mb-3">Nenhuma peça encontrada</h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            {searchTerm || categoriaFilter 
              ? 'Tente ajustar os filtros de busca para encontrar outras peças.' 
              : 'Comece cadastrando sua primeira peça clicando no botão abaixo.'
            }
          </p>
          {!searchTerm && !categoriaFilter && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-semibold rounded-xl shadow-lg shadow-amber-500/30 transition-all hover:scale-105"
            >
              <Plus size={20} />
              Cadastrar Primeira Peça
            </button>
          )}
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 overflow-hidden animate-fadeIn">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Peça</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Preço</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Estoque</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-amber-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {pecasFiltered.map((peca) => {
                  const estoqueClass = 
                    peca.estoque === undefined ? 'text-slate-500' :
                    peca.estoque === 0 ? 'text-red-400' :
                    peca.estoque < 5 ? 'text-orange-400' :
                    'text-green-400';
                  
                  return (
                    <tr key={peca.id} className="hover:bg-slate-700/50 transition-colors duration-150 even:bg-slate-900/50 odd:bg-slate-800">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-100">{peca.nome}</div>
                      </td>
                      <td className="px-6 py-4">
                        {peca.codigo ? (
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <div className="p-1.5 bg-slate-700 rounded">
                              <Hash size={14} />
                            </div>
                            <span className="font-mono">{peca.codigo}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                          {peca.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm font-bold text-amber-400">
                          <DollarSign size={16} className="text-amber-400" />
                          R$ {peca.preco.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {peca.estoque !== undefined ? (
                          <div className="flex items-center gap-2">
                            <Package size={16} className="text-slate-400" />
                            <span className={`text-sm font-bold ${estoqueClass}`}>
                              {peca.estoque}
                            </span>
                            {peca.estoque === 0 && (
                              <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">Esgotado</span>
                            )}
                            {peca.estoque > 0 && peca.estoque < 5 && (
                              <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30">Baixo</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditPeca(peca)}
                            className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all hover:scale-110 border border-transparent hover:border-amber-500/30"
                            title="Editar peça"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePeca(peca.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all hover:scale-110 border border-transparent hover:border-red-500/30"
                            title="Excluir peça"
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
        <PecaForm
          peca={editingPeca}
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingPeca(undefined);
          }}
          onSave={handleSavePeca}
        />
      )}
    </div>
  );
}
