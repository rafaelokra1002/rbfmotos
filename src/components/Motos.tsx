import { useState } from 'react';
import { useOficinaData } from '../hooks/useOficinaData';
import { MotoForm } from './MotoForm';
import { HistoricoMoto } from './HistoricoMoto';
import { Moto } from '../types';
import { Plus, Search, Edit, Trash2, Bike, Calendar, Gauge, Palette, FileText } from 'lucide-react';

export function Motos() {
  const { motos, clientes, adicionarMoto, atualizarMoto, removerMoto } = useOficinaData();
  const [showForm, setShowForm] = useState(false);
  const [editingMoto, setEditingMoto] = useState<Moto | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [marcaFilter, setMarcaFilter] = useState('');
  const [anoFilter, setAnoFilter] = useState('');
  const [showHistorico, setShowHistorico] = useState(false);
  const [selectedMotoForHistory, setSelectedMotoForHistory] = useState<Moto | undefined>();

  const motosFiltered = motos.filter(moto => {
    const cliente = clientes.find(c => c.id === moto.clienteId);
    const clienteNome = cliente ? cliente.nome : '';
    
    const matchesSearch = 
      moto.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moto.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moto.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clienteNome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMarca = !marcaFilter || moto.marca.toLowerCase().includes(marcaFilter.toLowerCase());
    const matchesAno = !anoFilter || moto.ano.toString() === anoFilter;
    
    return matchesSearch && matchesMarca && matchesAno;
  });

  // Obter marcas e anos únicos para os filtros
  const marcasUnicas = [...new Set(motos.map(m => m.marca))].sort();
  const anosUnicos = [...new Set(motos.map(m => m.ano))].sort((a, b) => b - a);

  function getClienteInfo(clienteId: string): { nome: string; telefone: string } {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente 
      ? { nome: cliente.nome, telefone: cliente.telefone }
      : { nome: 'Cliente não encontrado', telefone: '' };
  }

  const handleSaveMoto = (dados: Omit<Moto, 'id'>) => {
    if (editingMoto) {
      atualizarMoto(editingMoto.id, dados);
    } else {
      adicionarMoto(dados);
    }
    setShowForm(false);
    setEditingMoto(undefined);
  };

  const handleEditMoto = (moto: Moto) => {
    setEditingMoto(moto);
    setShowForm(true);
  };

  const handleDeleteMoto = (moto: Moto) => {
    const clienteInfo = getClienteInfo(moto.clienteId);
    if (confirm(`Tem certeza que deseja excluir a moto ${moto.marca} ${moto.modelo} (${moto.placa}) do cliente ${clienteInfo.nome}?`)) {
      removerMoto(moto.id);
    }
  };

  const handleOpenHistorico = (moto: Moto) => {
    setSelectedMotoForHistory(moto);
    setShowHistorico(true);
  };

  return (
    <div className="p-4 sm:p-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 tracking-tight">
            Motos
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {motos.length} {motos.length === 1 ? 'moto cadastrada' : 'motos cadastradas'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-semibold hover:from-amber-400 hover:to-amber-500 rounded-xl transition-all shadow-lg shadow-amber-500/30 group w-full sm:w-auto"
        >
          <Plus size={20} className="group-hover:scale-110 transition-transform" />
          Nova Moto
        </button>
      </div>

      {/* Filtros modernizados */}
      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 p-4 sm:p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400 pointer-events-none" size={20} />
            <input
              type="text"
              placeholder="Buscar por marca, modelo, placa ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-10 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 bg-slate-900 text-slate-100 placeholder-slate-500 transition-all"
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
            value={marcaFilter}
            onChange={(e) => setMarcaFilter(e.target.value)}
            className="px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 bg-slate-900 text-slate-100 transition-all appearance-none cursor-pointer"
          >
            <option value="">Todas as Marcas</option>
            {marcasUnicas.map(marca => (
              <option key={marca} value={marca}>{marca}</option>
            ))}
          </select>

          <select
            value={anoFilter}
            onChange={(e) => setAnoFilter(e.target.value)}
            className="px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 bg-slate-900 text-slate-100 transition-all appearance-none cursor-pointer"
          >
            <option value="">Todos os Anos</option>
            {anosUnicos.map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>

          <div className="flex items-center justify-center sm:justify-start gap-2 px-4 py-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <Bike className="w-5 h-5 text-amber-400" />
            <span className="text-sm">
              <span className="font-bold text-amber-400">{motosFiltered.length}</span>
              <span className="text-slate-400 ml-1">
                {motosFiltered.length === 1 ? 'moto' : 'motos'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Motos */}
      {motosFiltered.length === 0 ? (
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 p-12 text-center animate-scaleIn">
          <div className="max-w-sm mx-auto">
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
              <Bike className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">
              {searchTerm || marcaFilter || anoFilter ? 'Nenhuma moto encontrada' : 'Comece agora!'}
            </h3>
            <p className="text-slate-400 mb-6">
              {searchTerm || marcaFilter || anoFilter
                ? 'Tente ajustar os filtros de busca.' 
                : 'Cadastre a primeira moto para começar a gerenciar.'
              }
            </p>
            {!searchTerm && !marcaFilter && !anoFilter && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-bold hover:from-amber-400 hover:to-amber-500 rounded-xl transition-all shadow-lg shadow-amber-500/30 group"
              >
                <Plus size={20} className="group-hover:scale-110 transition-transform" />
                Cadastrar Primeira Moto
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-amber-400 uppercase tracking-wider">Moto</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-amber-400 uppercase tracking-wider">Placa</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-amber-400 uppercase tracking-wider">Proprietário</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-amber-400 uppercase tracking-wider">Ano</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-amber-400 uppercase tracking-wider">Cor</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-amber-400 uppercase tracking-wider">KM</th>
                  <th className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-amber-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {motosFiltered.map((moto, index) => {
                  const clienteInfo = getClienteInfo(moto.clienteId);
                  
                  return (
                    <tr 
                      key={moto.id} 
                      className={`
                        ${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-900/50'}
                        hover:bg-slate-700/50 transition-colors duration-150 group
                      `}
                    >
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
                            <Bike className="w-5 h-5 text-amber-400" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-100 group-hover:text-amber-400 transition-colors">
                              {moto.marca} {moto.modelo}
                            </div>
                            {moto.observacoes && (
                              <div className="text-xs text-slate-400 line-clamp-1 mt-0.5" title={moto.observacoes}>
                                {moto.observacoes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700 text-slate-100 border border-slate-600">
                          {moto.placa}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-100">{clienteInfo.nome}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{clienteInfo.telefone}</div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-slate-300">
                          <Calendar size={14} className="text-slate-400" />
                          {moto.ano}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {moto.cor ? (
                          <div className="flex items-center gap-1 text-sm text-slate-300">
                            <Palette size={14} className="text-slate-400" />
                            {moto.cor}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-600">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {moto.km ? (
                          <div className="flex items-center gap-1 text-sm text-slate-300">
                            <Gauge size={14} className="text-slate-400" />
                            {moto.km.toLocaleString('pt-BR')}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-600">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenHistorico(moto)}
                            className="p-2 text-green-400 hover:bg-green-500/10 hover:text-green-300 rounded-lg transition-all border border-transparent hover:border-green-500/30"
                            title="Histórico de manutenção"
                          >
                            <FileText size={16} />
                          </button>
                          <button
                            onClick={() => handleEditMoto(moto)}
                            className="p-2 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 rounded-lg transition-all border border-transparent hover:border-amber-500/30"
                            title="Editar moto"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteMoto(moto)}
                            className="p-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all border border-transparent hover:border-red-500/30"
                            title="Excluir moto"
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

      <MotoForm
        clienteId=""
        moto={editingMoto}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingMoto(undefined);
        }}
        onSave={handleSaveMoto}
      />

      {selectedMotoForHistory && (() => {
        const cliente = clientes.find(c => c.id === selectedMotoForHistory.clienteId);
        if (!cliente) return null;
        
        return (
          <HistoricoMoto
            moto={selectedMotoForHistory}
            cliente={cliente}
            isOpen={showHistorico}
            onClose={() => {
              setShowHistorico(false);
              setSelectedMotoForHistory(undefined);
            }}
          />
        );
      })()}
    </div>
  );
}
