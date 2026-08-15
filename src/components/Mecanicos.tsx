import { useState, useEffect } from 'react';
import { MecanicoForm } from './MecanicoForm';
import { Plus, Search, Edit, Trash2, Phone, Mail, Wrench, User, DollarSign } from 'lucide-react';

interface Mecanico {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  cpf?: string;
  especialidade?: string;
  salario?: number;
  dataAdmissao: string;
  status: string;
  observacoes?: string;
}

export function Mecanicos() {
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMecanico, setEditingMecanico] = useState<Mecanico | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMecanicos();
  }, []);

  const loadMecanicos = () => {
    const saved = localStorage.getItem('mecanicos');
    if (saved) {
      setMecanicos(JSON.parse(saved));
    }
  };

  const mecanicosFiltered = mecanicos.filter(mecanico =>
    mecanico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mecanico.telefone.includes(searchTerm) ||
    (mecanico.email && mecanico.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSaveMecanico = (dados: Omit<Mecanico, 'id' | 'dataAdmissao'>) => {
    let novosMecanicos;
    
    if (editingMecanico) {
      novosMecanicos = mecanicos.map(m => 
        m.id === editingMecanico.id 
          ? { ...editingMecanico, ...dados }
          : m
      );
    } else {
      const novoMecanico: Mecanico = {
        id: Date.now().toString(),
        ...dados,
        dataAdmissao: new Date().toISOString()
      };
      novosMecanicos = [...mecanicos, novoMecanico];
    }
    
    setMecanicos(novosMecanicos);
    localStorage.setItem('mecanicos', JSON.stringify(novosMecanicos));
    setShowForm(false);
    setEditingMecanico(undefined);
  };

  const handleEditMecanico = (mecanico: Mecanico) => {
    setEditingMecanico(mecanico);
    setShowForm(true);
  };

  const handleDeleteMecanico = (mecanico: Mecanico) => {
    if (confirm(`Tem certeza que deseja excluir o mecânico ${mecanico.nome}?`)) {
      const novosMecanicos = mecanicos.filter(m => m.id !== mecanico.id);
      setMecanicos(novosMecanicos);
      localStorage.setItem('mecanicos', JSON.stringify(novosMecanicos));
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ativo: 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 border-green-300 dark:border-green-500',
      inativo: 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border-red-300 dark:border-red-500',
      ferias: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-500';
  };

  const getEspecialidadeLabel = (especialidade?: string) => {
    const labels = {
      mecanica_geral: 'Mecânica Geral',
      eletrica: 'Elétrica',
      suspensao: 'Suspensão',
      motor: 'Motor',
      freios: 'Freios'
    };
    return especialidade ? labels[especialidade as keyof typeof labels] || especialidade : '-';
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">
            Mecânicos
          </h1>
          <p className="text-slate-400 mt-1">Gerencie a equipe de mecânicos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-semibold rounded-xl shadow-lg shadow-amber-500/30 transition-all hover:scale-105"
        >
          <Plus size={20} />
          <span>Novo Mecânico</span>
        </button>
      </div>

      {/* Busca */}
      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 p-4 sm:p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all"
          />
        </div>
      </div>

      {/* Lista de Mecânicos */}
      {mecanicosFiltered.length === 0 ? (
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 p-12 text-center animate-scaleIn">
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wrench className="text-amber-400" size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-100 mb-2">Nenhum mecânico encontrado</h3>
          <p className="text-slate-400 mb-6">
            {searchTerm 
              ? 'Tente ajustar os filtros de busca.' 
              : 'Comece cadastrando seu primeiro mecânico.'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-semibold rounded-xl shadow-lg shadow-amber-500/30 transition-all hover:scale-105"
            >
              <Plus size={20} />
              Cadastrar Primeiro Mecânico
            </button>
          )}
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Especialidade
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Salário
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Data Admissão
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                {mecanicosFiltered.map((mecanico) => (
                  <tr 
                    key={mecanico.id} 
                    className="hover:bg-yellow-50/30 dark:hover:bg-yellow-500/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                          <User className="text-white" size={20} />
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {mecanico.nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone size={14} className="text-green-500" />
                          {mecanico.telefone}
                        </div>
                        {mecanico.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Mail size={14} className="text-blue-500" />
                            {mecanico.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-500/20 rounded-lg w-fit">
                        <Wrench className="text-purple-600 dark:text-purple-400" size={14} />
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                          {getEspecialidadeLabel(mecanico.especialidade)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {mecanico.salario ? (
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-500/20 rounded-lg w-fit">
                          <DollarSign className="text-green-600 dark:text-green-400" size={14} />
                          <span className="text-sm font-bold text-green-700 dark:text-green-300">
                            R$ {mecanico.salario.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-lg border-2 ${getStatusBadge(mecanico.status)}`}>
                        {mecanico.status.charAt(0).toUpperCase() + mecanico.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {new Date(mecanico.dataAdmissao).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditMecanico(mecanico)}
                          className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Editar mecânico"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteMecanico(mecanico)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Excluir mecânico"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <MecanicoForm
        mecanico={editingMecanico}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingMecanico(undefined);
        }}
        onSave={handleSaveMecanico}
      />
    </div>
  );
}
