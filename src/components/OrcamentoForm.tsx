import { useState, useEffect } from 'react';
import { useOficinaData } from '../hooks/useOficinaData';
import { Orcamento } from '../types';
import { X, Plus, Trash2, User, Bike, CheckCircle, Calendar, FileText, ShoppingCart, DollarSign } from 'lucide-react';

interface OrcamentoFormProps {
  orcamento?: Orcamento;
  isOpen: boolean;
  onClose: () => void;
  onSave: (orcamento: Omit<Orcamento, 'id' | 'numero' | 'dataEmissao'>) => void;
}

export function OrcamentoForm({ orcamento, isOpen, onClose, onSave }: OrcamentoFormProps) {
  const { clientes, motos, servicos, pecas } = useOficinaData();
  const [formData, setFormData] = useState({
    clienteId: '',
    motoId: '',
    status: 'pendente',
    validade: '',
    observacoes: '',
  });

  const [itens, setItens] = useState<Array<{
    nome: string;
    tipo: 'servico' | 'peca' | 'fluido';
    quantidade: number;
    precoUnitario: number;
    desconto: number;
    unidade?: 'un' | 'ml';
    volumeMl?: number;
  }>>([]);

  useEffect(() => {
    if (orcamento) {
      setFormData({
        clienteId: orcamento.clienteId,
        motoId: orcamento.motoId,
        status: orcamento.status,
        validade: '',
        observacoes: orcamento.observacoes || '',
      });
      setItens(orcamento.itens.map(item => ({
        nome: item.nome,
        tipo: item.tipo,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        desconto: item.desconto || 0,
        unidade: item.unidade || 'un',
        volumeMl: item.volumeMl
      })) || []);
    } else {
      setFormData({
        clienteId: '',
        motoId: '',
        status: 'pendente',
        validade: '',
        observacoes: '',
      });
      setItens([]);
    }
  }, [orcamento]);

  const motosDoCliente = motos.filter(m => m.clienteId === formData.clienteId);

  const handleAddItem = () => {
    setItens([...itens, {
      nome: '',
      tipo: 'servico',
      quantidade: 1,
      precoUnitario: 0,
      desconto: 0,
      unidade: 'un',
    }]);
  };

  const handleRemoveItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItens = [...itens];
    newItens[index] = { ...newItens[index], [field]: value };
    
    // Se mudou o tipo ou nome, atualiza o preço
    if (field === 'nome') {
      const item = newItens[index];
      if (item.tipo === 'servico' || item.tipo === 'fluido') {
        const servico = servicos.find(s => s.nome === value);
        if (servico) {
          newItens[index].precoUnitario = servico.preco;
          newItens[index].unidade = servico.unidade || 'un';
          if (servico.unidade === 'ml') {
            newItens[index].tipo = 'fluido';
            newItens[index].volumeMl = 1000; // 1 litro padrão
          }
        }
      } else {
        const peca = pecas.find(p => p.nome === value);
        if (peca) {
          newItens[index].precoUnitario = peca.preco;
          newItens[index].unidade = peca.unidade || 'un';
          if (peca.unidade === 'ml') {
            newItens[index].tipo = 'fluido';
            newItens[index].volumeMl = 1000; // 1 litro padrão
          }
        }
      }
    }
    
    setItens(newItens);
  };

  const calcularTotal = () => {
    return itens.reduce((total, item) => {
      const subtotal = item.quantidade * item.precoUnitario;
      return total + (subtotal - item.desconto);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      clienteId: formData.clienteId,
      motoId: formData.motoId,
      descricaoProblema: formData.observacoes || 'Sem descrição',
      status: formData.status as 'pendente' | 'aprovado' | 'rejeitado' | 'expirado',
      itens: itens.map((item, index) => ({
        id: `temp-${Date.now()}-${index}`,
        tipo: item.tipo,
        itemId: '',
        nome: item.nome,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        desconto: item.desconto,
        unidade: item.unidade,
        volumeMl: item.volumeMl
      })),
      valorTotal: calcularTotal(),
      validadeAte: formData.validade || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      observacoes: formData.observacoes || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {orcamento ? 'Editar Orçamento' : 'Novo Orçamento'}
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
          <div className="space-y-6">
            {/* Cliente e Moto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  Cliente *
                </label>
                <select
                  required
                  value={formData.clienteId}
                  onChange={(e) => {
                    setFormData({ ...formData, clienteId: e.target.value, motoId: '' });
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300"
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
                    <Bike className="w-4 h-4 text-white" />
                  </div>
                  Moto *
                </label>
                <select
                  required
                  value={formData.motoId}
                  onChange={(e) => setFormData({ ...formData, motoId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300 disabled:opacity-50"
                  disabled={!formData.clienteId}
                >
                  <option value="">Selecione uma moto</option>
                  {motosDoCliente.map(moto => (
                    <option key={moto.id} value={moto.id}>
                      {moto.marca} {moto.modelo} - {moto.placa}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status e Validade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300"
                >
                  <option value="pendente">Pendente</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="rejeitado">Rejeitado</option>
                  <option value="expirado">Expirado</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  Validade
                </label>
                <input
                  type="date"
                  value={formData.validade}
                  onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300"
                />
              </div>
            </div>

            {/* Itens */}
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </div>
                  Itens do Orçamento
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-semibold hover:from-yellow-500 hover:to-yellow-600 rounded-xl transition-all duration-200 hover:scale-105 shadow-medium"
                >
                  <Plus size={18} />
                  Adicionar Item
                </button>
              </div>

              <div className="space-y-3">
                {itens.map((item, index) => (
                  <div key={index} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-600">
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-12 md:col-span-2">
                        <select
                          value={item.tipo}
                          onChange={(e) => handleItemChange(index, 'tipo', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white text-sm transition-all"
                        >
                          <option value="servico">Serviço</option>
                          <option value="peca">Peça</option>
                        </select>
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <select
                          value={item.nome}
                          onChange={(e) => handleItemChange(index, 'nome', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white text-sm transition-all"
                        >
                          <option value="">Selecione...</option>
                          {item.tipo === 'servico' 
                            ? servicos.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)
                            : pecas.map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)
                          }
                        </select>
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={item.tipo === 'fluido' ? '0.001' : '1'}
                            step={item.tipo === 'fluido' ? '0.001' : '1'}
                            value={item.quantidade}
                            onChange={(e) => handleItemChange(
                              index, 
                              'quantidade', 
                              item.tipo === 'fluido' 
                                ? parseFloat(e.target.value) 
                                : parseInt(e.target.value)
                            )}
                            placeholder={item.tipo === 'fluido' ? 'Qtd (L)' : 'Qtd'}
                            className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 text-sm transition-all ${
                              item.tipo === 'fluido'
                                ? 'border-cyan-300 dark:border-cyan-600 focus:ring-cyan-500 focus:border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                                : 'border-gray-300 dark:border-gray-600 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-700'
                            } dark:text-white`}
                          />
                          {item.tipo === 'fluido' && item.quantidade > 0 && (
                            <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                              ({(item.quantidade * 1000).toFixed(0)}ml)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-5 md:col-span-3">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-xs font-semibold">
                            R$
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.precoUnitario}
                            onChange={(e) => handleItemChange(index, 'precoUnitario', parseFloat(e.target.value))}
                            placeholder="Preço"
                            className="w-full pl-8 pr-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white text-sm transition-all"
                          />
                        </div>
                      </div>
                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="w-full h-full flex items-center justify-center text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Remover item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border-2 border-green-200 dark:border-green-700 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Valor Total:</span>
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  R$ {calcularTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Observações */}
            <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                Observações
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300 resize-none"
                placeholder="Observações adicionais..."
              />
            </div>
          </div>

          {/* Botões */}
          <div className="mt-8 flex gap-3 justify-end pt-6 border-t-2 border-gray-200 dark:border-gray-700 animate-slide-up" style={{ animationDelay: '0.6s' }}>
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
              {orcamento ? 'Salvar Alterações' : 'Criar Orçamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
