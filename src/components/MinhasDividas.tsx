import { useState, useEffect } from 'react';
import { Trash2, Edit, CheckCircle, XCircle, ChevronDown, ChevronUp, DollarSign, Calendar, AlertTriangle, X } from 'lucide-react';

interface Parcela {
  id: string;
  numeroParcela: number;
  dataVencimento: string;
  valor: number;
  status: string;
}

interface ContaPagar {
  id: string;
  descricao: string;
  fornecedor?: string;
  valorTotal: number;
  valorParcela: number;
  frequencia: string;
  dataVencimento: string;
  observacoes?: string;
  categoria?: { id: string; nome: string; icone?: string; cor?: string };
  parcelas: Parcela[];
  createdAt: string;
}

export function MinhasDividas() {
  const [dividas, setDividas] = useState<ContaPagar[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingDivida, setEditingDivida] = useState<ContaPagar | null>(null);
  const [editForm, setEditForm] = useState({
    descricao: '',
    fornecedor: '',
    valorTotal: '',
    valorParcela: '',
    frequencia: 'MENSAL',
    dataVencimento: '',
    observacoes: ''
  });

  const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:9001/api'
    : `http://${window.location.hostname}:9001/api`;

  // Buscar dívidas
  const fetchDividas = () => {
    setLoading(true);
    fetch(`${API_URL}/financeiro/contas-pagar`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDividas(data);
        else setDividas([]);
      })
      .catch(() => setDividas([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDividas();
  }, []);

  // Abrir modal de edição
  const abrirEdicao = (divida: ContaPagar) => {
    setEditingDivida(divida);
    setEditForm({
      descricao: divida.descricao,
      fornecedor: divida.fornecedor || '',
      valorTotal: divida.valorTotal.toString(),
      valorParcela: divida.valorParcela.toString(),
      frequencia: divida.frequencia,
      dataVencimento: divida.dataVencimento ? divida.dataVencimento.split('T')[0] : '',
      observacoes: divida.observacoes || ''
    });
  };

  // Salvar edição
  const salvarEdicao = async () => {
    if (!editingDivida) return;
    await fetch(`${API_URL}/financeiro/contas-pagar/${editingDivida.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descricao: editForm.descricao,
        fornecedor: editForm.fornecedor || null,
        valorTotal: parseFloat(editForm.valorTotal),
        valorParcela: parseFloat(editForm.valorParcela),
        frequencia: editForm.frequencia,
        dataVencimento: editForm.dataVencimento ? new Date(editForm.dataVencimento).toISOString() : undefined,
        observacoes: editForm.observacoes || null
      })
    });
    setEditingDivida(null);
    fetchDividas();
  };

  // Marcar parcela como paga
  const marcarPago = async (parcelaId: string) => {
    await fetch(`${API_URL}/financeiro/parcelas-pagar/${parcelaId}/pagar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataPagamento: new Date().toISOString(), valorPago: 0, formaPagamento: 'DINHEIRO' })
    });
    fetchDividas();
  };

  // Excluir dívida
  const excluirDivida = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta dívida?')) return;
    await fetch(`${API_URL}/financeiro/contas-pagar/${id}`, { method: 'DELETE' });
    fetchDividas();
  };

  // Frequência legível
  const frequenciaLabel = (f: string) => {
    switch (f) {
      case 'MENSAL': return 'Mensal';
      case 'QUINZENAL': return 'Quinzenal';
      case 'SEMANAL': return 'Semanal';
      case 'AVISTA': return 'À Vista';
      default: return f;
    }
  };

  // Status badge
  const statusBadge = (status: string) => {
    switch (status) {
      case 'PAGO':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30"><CheckCircle size={14} /> Pago</span>;
      case 'ATRASADO':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30"><AlertTriangle size={14} /> Atrasado</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30"><XCircle size={14} /> Pendente</span>;
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Modal de Edição */}
      {editingDivida && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-100">Editar Dívida</h2>
              <button onClick={() => setEditingDivida(null)} className="text-slate-400 hover:text-red-400 transition"><X size={22} /></button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Descrição</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
                  value={editForm.descricao}
                  onChange={e => setEditForm(f => ({ ...f, descricao: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Fornecedor</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
                  value={editForm.fornecedor}
                  onChange={e => setEditForm(f => ({ ...f, fornecedor: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Valor Total</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
                    value={editForm.valorTotal}
                    onChange={e => setEditForm(f => ({ ...f, valorTotal: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Valor Parcela</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
                    value={editForm.valorParcela}
                    onChange={e => setEditForm(f => ({ ...f, valorParcela: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Frequência</label>
                  <select
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
                    value={editForm.frequencia}
                    onChange={e => setEditForm(f => ({ ...f, frequencia: e.target.value }))}
                  >
                    <option value="MENSAL">Mensal (30 dias)</option>
                    <option value="QUINZENAL">Quinzenal (15 dias)</option>
                    <option value="SEMANAL">Semanal (7 dias)</option>
                    <option value="AVISTA">À Vista</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Data Vencimento</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
                    value={editForm.dataVencimento}
                    onChange={e => setEditForm(f => ({ ...f, dataVencimento: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Observações</label>
                <textarea
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
                  rows={3}
                  value={editForm.observacoes}
                  onChange={e => setEditForm(f => ({ ...f, observacoes: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditingDivida(null)} className="px-4 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600">Cancelar</button>
              <button onClick={salvarEdicao} className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-purple-500 text-white font-bold shadow hover:from-orange-600 hover:to-purple-600">Salvar</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2">Minhas Dívidas</h1>
            <p className="text-slate-400 text-sm sm:text-base font-medium">Gerencie suas contas a pagar e parcelas</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : dividas.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <DollarSign size={48} className="mx-auto mb-4 opacity-40" />
            <p className="text-lg font-semibold">Nenhuma dívida cadastrada.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {dividas.map(divida => (
              <div key={divida.id} className="bg-slate-900/80 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 cursor-pointer hover:bg-slate-800/60 transition"
                  onClick={() => setExpandedId(expandedId === divida.id ? null : divida.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{divida.categoria?.icone || '💸'}</span>
                    <div>
                      <h2 className="text-lg font-bold text-slate-100">{divida.descricao}</h2>
                      <p className="text-xs text-slate-400">{divida.categoria?.nome} &middot; {frequenciaLabel(divida.frequencia)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xl font-bold text-orange-400">R$ {divida.valorTotal.toFixed(2)}</p>
                      <p className="text-xs text-slate-400">{divida.parcelas.length} parcela(s)</p>
                    </div>
                    <button className="text-slate-400 hover:text-orange-400 transition" onClick={e => { e.stopPropagation(); abrirEdicao(divida); }}>
                      <Edit size={20} />
                    </button>
                    <button className="text-slate-400 hover:text-red-400 transition" onClick={e => { e.stopPropagation(); excluirDivida(divida.id); }}>
                      <Trash2 size={20} />
                    </button>
                    {expandedId === divida.id ? <ChevronUp size={22} className="text-slate-400" /> : <ChevronDown size={22} className="text-slate-400" />}
                  </div>
                </div>

                {expandedId === divida.id && (
                  <div className="border-t border-slate-700 bg-slate-950/60 p-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-400 text-xs uppercase">
                          <th className="text-left py-2">Parcela</th>
                          <th className="text-left py-2">Vencimento</th>
                          <th className="text-right py-2">Valor</th>
                          <th className="text-center py-2">Status</th>
                          <th className="text-center py-2">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {divida.parcelas.map(p => (
                          <tr key={p.id} className="border-t border-slate-800">
                            <td className="py-2 text-slate-200 font-medium">{p.numeroParcela}</td>
                            <td className="py-2 text-slate-300 flex items-center gap-1"><Calendar size={14} className="text-amber-400" /> {new Date(p.dataVencimento).toLocaleDateString('pt-BR')}</td>
                            <td className="py-2 text-right text-slate-200 font-semibold">R$ {p.valor.toFixed(2)}</td>
                            <td className="py-2 text-center">{statusBadge(p.status)}</td>
                            <td className="py-2 text-center">
                              {p.status !== 'PAGO' && (
                                <button
                                  className="px-3 py-1 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-bold shadow transition"
                                  onClick={() => marcarPago(p.id)}
                                >
                                  Marcar Pago
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
