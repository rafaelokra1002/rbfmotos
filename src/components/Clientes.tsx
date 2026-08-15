import { useState } from 'react';
import { useOficinaData } from '../hooks/useOficinaData';
import { ClienteForm } from './ClienteForm';
import { HistoricoMoto } from './HistoricoMoto';
import { Cliente, Moto } from '../types';
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin, FileText } from 'lucide-react';

export function Clientes() {
  const { clientes, motos, adicionarCliente, atualizarCliente, removerCliente } = useOficinaData();
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistorico, setShowHistorico] = useState(false);
  const [selectedMotoForHistory, setSelectedMotoForHistory] = useState<Moto | undefined>();
  const [selectedClienteForHistory, setSelectedClienteForHistory] = useState<Cliente | undefined>();

  const clientesFiltered = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone.includes(searchTerm) ||
    (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSaveCliente = (dados: Omit<Cliente, 'id' | 'dataCadastro'>) => {
    if (editingCliente) {
      atualizarCliente(editingCliente.id, dados);
    } else {
      adicionarCliente(dados);
    }
    setShowForm(false);
    setEditingCliente(undefined);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setShowForm(true);
  };

  const handleDeleteCliente = (cliente: Cliente) => {
    if (confirm(`Tem certeza que deseja excluir o cliente ${cliente.nome}?`)) {
      removerCliente(cliente.id);
    }
  };

  const handleOpenHistorico = (cliente: Cliente) => {
    // Buscar a primeira moto do cliente
    const moto = motos.find(m => m.clienteId === cliente.id);
    if (moto) {
      setSelectedMotoForHistory(moto);
      setSelectedClienteForHistory(cliente);
      setShowHistorico(true);
    } else {
      alert('Este cliente não possui motos cadastradas.');
    }
  };

  return (
    <div className="p-4 sm:p-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 tracking-tight">
            Clientes
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {clientes.length} {clientes.length === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-semibold hover:from-amber-400 hover:to-amber-500 rounded-xl transition-all shadow-lg shadow-amber-500/30 group w-full sm:w-auto"
        >
          <Plus size={20} className="group-hover:scale-110 transition-transform" />
          Novo Cliente
        </button>
      </div>

      {/* Busca */}
      <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700/50 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-amber-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm sm:text-base bg-slate-900 text-slate-100 placeholder-slate-500 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      {/* Lista de Clientes */}
      {clientesFiltered.length === 0 ? (
        <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700/50 p-12 text-center animate-fadeIn">
          <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="h-10 w-10 text-amber-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-100 mb-2">Nenhum cliente encontrado</h3>
          <p className="text-slate-400 mb-6">
            {searchTerm 
              ? 'Tente ajustar os filtros de busca.' 
              : 'Comece cadastrando seu primeiro cliente.'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-bold hover:from-amber-400 hover:to-amber-300 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/30 hover:scale-105"
            >
              <Plus size={20} />
              Cadastrar Primeiro Cliente
            </button>
          )}
        </div>
      ) : (
        <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700/50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-amber-400 uppercase tracking-wider whitespace-nowrap">Nome</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-amber-400 uppercase tracking-wider whitespace-nowrap">Telefone</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-amber-400 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Email</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-amber-400 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">CPF</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-amber-400 uppercase tracking-wider whitespace-nowrap hidden xl:table-cell">Endereço</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-amber-400 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Cadastro</th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-amber-400 uppercase tracking-wider whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {clientesFiltered.map((cliente, index) => (
                    <tr key={cliente.id} className={index % 2 === 0 ? 'bg-slate-800 hover:bg-slate-700/50' : 'bg-slate-900 hover:bg-slate-700/50'}>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="text-xs sm:text-sm font-medium text-slate-100">{cliente.nome}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-300">
                        <Phone size={14} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{cliente.telefone}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                      {cliente.email ? (
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-300">
                          <Mail size={14} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate">{cliente.email}</span>
                        </div>
                      ) : (
                        <span className="text-xs sm:text-sm text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                      {cliente.cpf ? (
                        <span className="text-xs sm:text-sm text-slate-300">{cliente.cpf}</span>
                      ) : (
                        <span className="text-xs sm:text-sm text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden xl:table-cell">
                      {cliente.endereco ? (
                        <div className="flex items-start gap-1 text-xs sm:text-sm text-slate-300 max-w-xs">
                          <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{cliente.endereco}</span>
                        </div>
                      ) : (
                        <span className="text-xs sm:text-sm text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                      <span className="text-xs sm:text-sm text-slate-300">
                        {new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button
                          onClick={() => handleOpenHistorico(cliente)}
                          className="p-1.5 sm:p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Ver histórico"
                        >
                          <FileText size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleEditCliente(cliente)}
                          className="p-1.5 sm:p-2 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-colors"
                          title="Editar cliente"
                        >
                          <Edit size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCliente(cliente)}
                          className="p-1.5 sm:p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Excluir cliente"
                        >
                          <Trash2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      <ClienteForm
        cliente={editingCliente}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingCliente(undefined);
        }}
        onSave={handleSaveCliente}
      />

      {selectedMotoForHistory && selectedClienteForHistory && (
        <HistoricoMoto
          moto={selectedMotoForHistory}
          cliente={selectedClienteForHistory}
          isOpen={showHistorico}
          onClose={() => {
            setShowHistorico(false);
            setSelectedMotoForHistory(undefined);
            setSelectedClienteForHistory(undefined);
          }}
        />
      )}
    </div>
  );
}
