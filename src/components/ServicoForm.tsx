import { useState, useEffect } from 'react';
import { Servico } from '../types';
import { X, Wrench, DollarSign, Clock, FileText, Grid3x3, Plus } from 'lucide-react';

interface ServicoFormProps {
  servico?: Servico;
  isOpen: boolean;
  onClose: () => void;
  onSave: (servico: Omit<Servico, 'id'>) => void;
}

export function ServicoForm({ servico, isOpen, onClose, onSave }: ServicoFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: 'mecanica' as const,
    tempoEstimado: ''
  });

  const [categorias, setCategorias] = useState([
    { value: 'mecanica', label: 'Mecânica' },
    { value: 'eletrica', label: 'Elétrica' },
    { value: 'pneus', label: 'Pneus' },
    { value: 'oleo', label: 'Óleo' },
    { value: 'revisao', label: 'Revisão' },
    { value: 'outros', label: 'Outros' }
  ]);
  const [showNovaCategoria, setShowNovaCategoria] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');

  useEffect(() => {
    if (servico) {
      setFormData({
        nome: servico.nome,
        descricao: servico.descricao || '',
        preco: servico.preco.toString(),
        categoria: servico.categoria as any,
        tempoEstimado: servico.tempoEstimado?.toString() || ''
      });
    } else {
      setFormData({
        nome: '',
        descricao: '',
        preco: '',
        categoria: 'mecanica',
        tempoEstimado: ''
      });
    }
  }, [servico, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.preco) {
      alert('Nome e preço são obrigatórios');
      return;
    }

    const dadosServico: Omit<Servico, 'id'> = {
      nome: formData.nome.trim(),
      descricao: formData.descricao.trim() || undefined,
      preco: parseFloat(formData.preco),
      categoria: formData.categoria,
      tempoEstimado: formData.tempoEstimado ? parseInt(formData.tempoEstimado) : undefined
    };

    onSave(dadosServico);
    onClose();
  };

  const handleAdicionarCategoria = () => {
    if (novaCategoria.trim()) {
      const value = novaCategoria.toLowerCase().replace(/\s+/g, '_');
      const novaCat = { value, label: novaCategoria.trim() };
      setCategorias([...categorias, novaCat]);
      setFormData({ ...formData, categoria: value as any });
      setNovaCategoria('');
      setShowNovaCategoria(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {servico ? 'Editar Serviço' : 'Novo Serviço'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group"
          >
            <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nome do Serviço */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              Nome do Serviço *
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300"
              placeholder="Ex: Troca de Óleo"
              required
            />
          </div>

          {/* Descrição */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              Descrição
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300 resize-none"
              rows={3}
              placeholder="Descrição detalhada do serviço..."
            />
          </div>

          {/* Preço e Tempo */}
          <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                Preço *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.preco}
                  onChange={(e) => setFormData(prev => ({ ...prev, preco: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                Tempo
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={formData.tempoEstimado}
                  onChange={(e) => setFormData(prev => ({ ...prev, tempoEstimado: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300"
                  placeholder="60"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                  min
                </span>
              </div>
            </div>
          </div>

          {/* Categoria */}
          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg flex items-center justify-center">
                <Grid3x3 className="w-4 h-4 text-white" />
              </div>
              Categoria *
            </label>
            
            {!showNovaCategoria ? (
              <div className="flex gap-2">
                <select
                  value={formData.categoria}
                  onChange={(e) => {
                    if (e.target.value === '__nova__') {
                      setShowNovaCategoria(true);
                      setFormData(prev => ({ ...prev, categoria: '' as any }));
                    } else {
                      setFormData(prev => ({ ...prev, categoria: e.target.value as any }));
                    }
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300"
                  required
                >
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                  <option value="__nova__">➕ Nova Categoria...</option>
                </select>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAdicionarCategoria();
                    }
                  }}
                  placeholder="Digite o nome da nova categoria"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAdicionarCategoria}
                  className="px-4 py-3 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl hover:from-green-500 hover:to-green-600 transition-all font-semibold flex items-center gap-2"
                >
                  <Plus size={18} />
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNovaCategoria(false);
                    setNovaCategoria('');
                    setFormData(prev => ({ ...prev, categoria: 'mecanica' }));
                  }}
                  className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 font-semibold hover:scale-105"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white rounded-xl transition-all duration-200 font-semibold hover:shadow-lg hover:scale-105 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700"
            >
              {servico ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
