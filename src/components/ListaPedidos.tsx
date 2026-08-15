import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  Package,
  Truck,
  Trash2,
  Edit,
  Filter,
  RefreshCw
} from 'lucide-react';

interface ItemPedido {
  id: string;
  nome: string;
  quantidade: number;
  precoEstimado?: number;
  categoria?: string;
  fornecedor?: string;
  urgencia: string;
  status: string;
  origem?: string;
  origemId?: string;
  pecaId?: string;
  observacoes?: string;
  dataCriacao: string;
  dataPedido?: string;
  dataRecebimento?: string;
}

export function ListaPedidos() {
  const [pedidos, setPedidos] = useState<ItemPedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<ItemPedido | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroUrgencia, setFiltroUrgencia] = useState<string>('todos');
  const [busca, setBusca] = useState('');

  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    quantidade: 1,
    precoEstimado: '',
    categoria: 'Peça',
    fornecedor: '',
    urgencia: 'normal',
    observacoes: ''
  });

  // Busca de peças
  const [buscaPeca, setBuscaPeca] = useState('');
  const [pecas, setPecas] = useState<any[]>([]);
  const [showPecasDropdown, setShowPecasDropdown] = useState(false);
  const [verificandoEstoque, setVerificandoEstoque] = useState(false);

  useEffect(() => {
    carregarPedidos();
    carregarPecas();
    // Verificar estoque baixo ao carregar a página
    verificarEstoqueBaixo(true);
  }, []);

  const carregarPedidos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pedidos');
      if (response.ok) {
        const data = await response.json();
        setPedidos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarPecas = async () => {
    try {
      const response = await fetch('/api/pecas');
      if (response.ok) {
        const data = await response.json();
        setPecas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar peças:', error);
    }
  };

  const verificarEstoqueBaixo = async (silencioso = false) => {
    try {
      setVerificandoEstoque(true);
      const response = await fetch('/api/pedidos/verificar-estoque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limite: 5 })
      });

      if (response.ok) {
        const data = await response.json();
        await carregarPedidos();
        if (!silencioso) {
          if (data.pecasAdicionadas > 0) {
            alert(`✅ ${data.pecasAdicionadas} peças com estoque baixo adicionadas à lista!\n\n📦 Total verificado: ${data.pecasVerificadas} peças`);
          } else if (data.pecasVerificadas > 0) {
            alert(`📋 ${data.pecasVerificadas} peças com estoque baixo encontradas.\n\n⚠️ Todas já estão na lista de pedidos.`);
          } else {
            alert('✅ Nenhuma peça com estoque baixo!');
          }
        }
      } else {
        const error = await response.json();
        console.error('Erro na API:', error);
        if (!silencioso) {
          alert('Erro ao verificar estoque: ' + (error.error || 'Erro desconhecido'));
        }
      }
    } catch (error) {
      console.error('Erro ao verificar estoque:', error);
      if (!silencioso) {
        alert('Erro ao conectar com o servidor');
      }
    } finally {
      setVerificandoEstoque(false);
    }
  };

  const handleSalvar = async () => {
    if (!formData.nome.trim()) {
      alert('Informe o nome do item');
      return;
    }

    try {
      const dados = {
        ...formData,
        quantidade: parseInt(String(formData.quantidade)) || 1,
        precoEstimado: formData.precoEstimado ? parseFloat(formData.precoEstimado) : null,
        origem: 'manual'
      };

      const url = editando
        ? `/api/pedidos/${editando.id}`
        : '/api/pedidos';

      const response = await fetch(url, {
        method: editando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      if (response.ok) {
        await carregarPedidos();
        resetForm();
        setShowForm(false);
      }
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
      alert('Erro ao salvar pedido');
    }
  };

  const handleExcluir = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const response = await fetch(`/api/pedidos/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await carregarPedidos();
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  const handleAtualizarStatus = async (id: string, novoStatus: string) => {
    try {
      const dados: any = { status: novoStatus };
      if (novoStatus === 'pedido') {
        dados.dataPedido = new Date().toISOString();
      } else if (novoStatus === 'recebido') {
        dados.dataRecebimento = new Date().toISOString();
      }

      const response = await fetch(`/api/pedidos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      if (response.ok) {
        await carregarPedidos();
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      quantidade: 1,
      precoEstimado: '',
      categoria: 'Peça',
      fornecedor: '',
      urgencia: 'normal',
      observacoes: ''
    });
    setBuscaPeca('');
    setEditando(null);
  };

  const handleEditar = (pedido: ItemPedido) => {
    setEditando(pedido);
    setFormData({
      nome: pedido.nome,
      quantidade: pedido.quantidade,
      precoEstimado: pedido.precoEstimado?.toString() || '',
      categoria: pedido.categoria || 'Peça',
      fornecedor: pedido.fornecedor || '',
      urgencia: pedido.urgencia,
      observacoes: pedido.observacoes || ''
    });
    setShowForm(true);
  };

  const selecionarPeca = (peca: any) => {
    setFormData({
      ...formData,
      nome: peca.nome,
      precoEstimado: peca.preco?.toString() || '',
      categoria: 'Peça',
      fornecedor: peca.fornecedor || ''
    });
    setBuscaPeca('');
    setShowPecasDropdown(false);
  };

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(p => {
    if (filtroStatus !== 'todos' && p.status !== filtroStatus) return false;
    if (filtroUrgencia !== 'todos' && p.urgencia !== filtroUrgencia) return false;
    if (busca && !p.nome.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  // Contadores
  const contadores = {
    pendentes: pedidos.filter(p => p.status === 'pendente').length,
    pedidos: pedidos.filter(p => p.status === 'pedido').length,
    urgentes: pedidos.filter(p => p.urgencia === 'urgente' && p.status === 'pendente').length,
    estoqueBaixo: pecas.filter(p => (p.estoque ?? 0) < 5).length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'pedido': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'recebido': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelado': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgenciaColor = (urgencia: string) => {
    switch (urgencia) {
      case 'baixa': return 'text-gray-500';
      case 'normal': return 'text-blue-500';
      case 'alta': return 'text-orange-500';
      case 'urgente': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getOrigemLabel = (origem?: string) => {
    switch (origem) {
      case 'venda_avulsa': return '🛒 Venda Avulsa';
      case 'ordem_servico': return '🔧 Ordem de Serviço';
      case 'estoque_baixo': return '📦 Estoque Baixo';
      case 'manual': return '✋ Manual';
      default: return origem || '-';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
              <ShoppingCart className="text-white" size={28} />
            </div>
            Lista de Pedidos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Controle de itens para compra e reposição
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => verificarEstoqueBaixo(false)}
            disabled={verificandoEstoque}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Package size={18} />
            {verificandoEstoque ? 'Verificando...' : 'Verificar Estoque Baixo'}
          </button>
          <button
            onClick={carregarPedidos}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Atualizar
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus size={18} />
            Novo Item
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
            <div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{contadores.pendentes}</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Truck className="text-blue-600 dark:text-blue-400" size={24} />
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Aguardando Entrega</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{contadores.pedidos}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
            <div>
              <p className="text-sm text-red-600 dark:text-red-400">Urgentes</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{contadores.urgentes}</p>
            </div>
          </div>
        </div>
        <div 
          onClick={() => verificarEstoqueBaixo(false)}
          className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Package className="text-orange-600 dark:text-orange-400" size={24} />
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400">Estoque Baixo (&lt;5)</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{contadores.estoqueBaixo}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar item..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="todos">Todos os Status</option>
              <option value="pendente">Pendentes</option>
              <option value="pedido">Pedidos</option>
              <option value="recebido">Recebidos</option>
              <option value="cancelado">Cancelados</option>
            </select>
            <select
              value={filtroUrgencia}
              onChange={(e) => setFiltroUrgencia(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="todos">Todas Urgências</option>
              <option value="baixa">Baixa</option>
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">Nenhum item na lista de pedidos</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Adicionar Primeiro Item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Item</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Qtd</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Preço Est.</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Urgência</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Origem</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {pedidosFiltrados.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{pedido.nome}</div>
                      {pedido.fornecedor && (
                        <div className="text-sm text-gray-500">{pedido.fornecedor}</div>
                      )}
                      {pedido.observacoes && (
                        <div className="text-xs text-gray-400 mt-1">{pedido.observacoes}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                      {pedido.quantidade}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {pedido.precoEstimado ? `R$ ${pedido.precoEstimado.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${getUrgenciaColor(pedido.urgencia)}`}>
                        {pedido.urgencia === 'urgente' && '🔴 '}
                        {pedido.urgencia === 'alta' && '🟠 '}
                        {pedido.urgencia.charAt(0).toUpperCase() + pedido.urgencia.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(pedido.status)}`}>
                        {pedido.status.charAt(0).toUpperCase() + pedido.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {getOrigemLabel(pedido.origem)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {pedido.status === 'pendente' && (
                          <button
                            onClick={() => handleAtualizarStatus(pedido.id, 'pedido')}
                            title="Marcar como Pedido"
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          >
                            <Truck size={18} />
                          </button>
                        )}
                        {pedido.status === 'pedido' && (
                          <button
                            onClick={() => handleAtualizarStatus(pedido.id, 'recebido')}
                            title="Marcar como Recebido"
                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditar(pedido)}
                          title="Editar"
                          className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleExcluir(pedido.id)}
                          title="Excluir"
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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
        )}
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart size={24} />
                {editando ? 'Editar Item' : 'Novo Item para Pedido'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Busca de Peça */}
              {!editando && (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Buscar Peça Cadastrada
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={buscaPeca}
                      onChange={(e) => {
                        setBuscaPeca(e.target.value);
                        setShowPecasDropdown(true);
                      }}
                      onFocus={() => setShowPecasDropdown(true)}
                      placeholder="Digite para buscar uma peça..."
                      className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                  {showPecasDropdown && buscaPeca && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {pecas
                        .filter(p => p.nome.toLowerCase().includes(buscaPeca.toLowerCase()))
                        .slice(0, 5)
                        .map(peca => (
                          <button
                            key={peca.id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selecionarPeca(peca);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-purple-50 dark:hover:bg-gray-700"
                          >
                            <span className="font-medium text-gray-900 dark:text-white">{peca.nome}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              R$ {peca.preco?.toFixed(2) || '0,00'}
                            </span>
                          </button>
                        ))}
                      {pecas.filter(p => p.nome.toLowerCase().includes(buscaPeca.toLowerCase())).length === 0 && (
                        <div className="px-4 py-2 text-gray-500 text-sm">Nenhuma peça encontrada</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="border-t dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {editando ? 'Edite os dados do item:' : 'Ou preencha manualmente:'}
                </p>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome do Item *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Pastilha de freio dianteira"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Quantidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Preço Estimado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Preço Estimado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precoEstimado}
                    onChange={(e) => setFormData({ ...formData, precoEstimado: e.target.value })}
                    placeholder="0,00"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="Peça">Peça</option>
                    <option value="Acessório">Acessório</option>
                    <option value="Ferramenta">Ferramenta</option>
                    <option value="Material">Material</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                {/* Urgência */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Urgência
                  </label>
                  <select
                    value={formData.urgencia}
                    onChange={(e) => setFormData({ ...formData, urgencia: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">🔴 Urgente</option>
                  </select>
                </div>
              </div>

              {/* Fornecedor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fornecedor
                </label>
                <input
                  type="text"
                  value={formData.fornecedor}
                  onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                  placeholder="Nome do fornecedor"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações adicionais..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white resize-none"
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvar}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  {editando ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
