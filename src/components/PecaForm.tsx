import { useState, useEffect } from 'react';
import { Peca } from '../types';
import { X, Package, Tag, DollarSign, Boxes, Grid3x3, Plus } from 'lucide-react';

interface PecaFormProps {
  peca?: Peca;
  isOpen: boolean;
  onClose: () => void;
  onSave: (peca: Omit<Peca, 'id'>) => void;
}

export function PecaForm({ peca, isOpen, onClose, onSave }: PecaFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    preco: '',
    categoria: '',
    estoque: '',
  });

  const [categorias, setCategorias] = useState([
    'Motor',
    'Freios',
    'Suspensão',
    'Elétrica',
    'Transmissão',
    'Carroceria',
    'Rodas e Pneus',
    'Filtros',
    'Fluidos',
    'Outros'
  ]);
  const [showNovaCategoria, setShowNovaCategoria] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');

  useEffect(() => {
    if (peca) {
      setFormData({
        nome: peca.nome,
        codigo: peca.codigo || '',
        preco: peca.preco.toString(),
        categoria: peca.categoria,
        estoque: peca.estoque !== undefined ? peca.estoque.toString() : '',
      });
    } else {
      setFormData({
        nome: '',
        codigo: '',
        preco: '',
        categoria: '',
        estoque: '0',
      });
    }
  }, [peca]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      nome: formData.nome.trim(),
      codigo: formData.codigo.trim() || undefined,
      preco: parseFloat(formData.preco),
      categoria: formData.categoria,
      estoque: formData.estoque ? parseInt(formData.estoque) : 0,
    });
  };

  const handleAdicionarCategoria = () => {
    if (novaCategoria.trim() && !categorias.includes(novaCategoria.trim())) {
      const novaCat = novaCategoria.trim();
      setCategorias([...categorias, novaCat]);
      setFormData({ ...formData, categoria: novaCat });
      setNovaCategoria('');
      setShowNovaCategoria(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {peca ? 'Editar Peça' : 'Nova Peça'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group"
          >
            <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-5">
            {/* Nome da Peça */}
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                Nome da Peça *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300"
                placeholder="Ex: Pastilha de freio"
              />
            </div>

            {/* Código */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Tag className="w-4 h-4 text-white" />
                </div>
                Código
              </label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300"
                placeholder="Ex: PF-001"
              />
            </div>

            {/* Preço e Estoque */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
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
                    required
                    min="0"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <Boxes className="w-4 h-4 text-white" />
                  </div>
                  Estoque
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.estoque}
                  onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300"
                  placeholder="0"
                />
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
                    required
                    value={formData.categoria}
                    onChange={(e) => {
                      if (e.target.value === '__nova__') {
                        setShowNovaCategoria(true);
                        setFormData({ ...formData, categoria: '' });
                      } else {
                        setFormData({ ...formData, categoria: e.target.value });
                      }
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
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
                    }}
                    className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="mt-8 flex gap-3 justify-end pt-6 border-t border-gray-200 dark:border-gray-700 animate-slide-up" style={{ animationDelay: '0.5s' }}>
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
              {peca ? 'Salvar Alterações' : 'Cadastrar Peça'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
