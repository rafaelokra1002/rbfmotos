import { useState } from 'react';
import { useOficinaData } from '../hooks/useOficinaData';
import { OrcamentoForm } from './OrcamentoForm';
import { PagamentoModal } from './PagamentoModal';
import { Orcamento } from '../types';
import { Plus, Search, Edit, DollarSign, Calendar, FileText, User, Bike, Printer, CheckCircle } from 'lucide-react';
import { generateOrcamentoPDF } from '../lib/pdfGenerator';

export function Orcamentos() {
  const { orcamentos, clientes, motos, adicionarOrcamento, atualizarOrcamento, adicionarOrdem } = useOficinaData();
  const [showForm, setShowForm] = useState(false);
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);
  const [orcamentoParaFinalizar, setOrcamentoParaFinalizar] = useState<Orcamento | undefined>();

  const orcamentosFiltered = orcamentos.filter(orcamento => {
    const cliente = clientes.find(c => c.id === orcamento.clienteId);
    const moto = motos.find(m => m.id === orcamento.motoId);
    
    const matchesSearch = 
      orcamento.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (moto?.marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (moto?.modelo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || orcamento.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSaveOrcamento = (dados: Omit<Orcamento, 'id' | 'numero' | 'dataEmissao'>) => {
    if (editingOrcamento) {
      atualizarOrcamento(editingOrcamento.id, dados);
    } else {
      adicionarOrcamento(dados);
    }
    setShowForm(false);
    setEditingOrcamento(undefined);
  };

  const handleEditOrcamento = (orcamento: Orcamento) => {
    setEditingOrcamento(orcamento);
    setShowForm(true);
  };

  const getClienteInfo = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente || { nome: 'Cliente não encontrado', telefone: '' };
  };

  const getMotoInfo = (motoId: string) => {
    const moto = motos.find(m => m.id === motoId);
    return moto || { marca: '', modelo: '', placa: '' };
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', label: 'Pendente' },
      aprovado: { color: 'bg-green-500/20 text-green-300 border-green-500/30', label: 'Aprovado' },
      rejeitado: { color: 'bg-red-500/20 text-red-300 border-red-500/30', label: 'Rejeitado' },
      expirado: { color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', label: 'Expirado' },
    };
    return statusConfig[status as keyof typeof statusConfig] || { color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', label: status };
  };

  const handleImprimirOrcamento = async (orcamento: Orcamento) => {
    try {
      const cliente = getClienteInfo(orcamento.clienteId);
      const moto = getMotoInfo(orcamento.motoId);
      const blob = await generateOrcamentoPDF(orcamento, cliente as any, moto as any);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Orcamento-${orcamento.numero}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF do orçamento');
    }
  };

  const handleFinalizarOrcamento = (orcamento: Orcamento) => {
    if (orcamento.status !== 'aprovado') {
      alert('Apenas orçamentos aprovados podem ser finalizados!');
      return;
    }
    setOrcamentoParaFinalizar(orcamento);
    setShowPagamentoModal(true);
  };

  const handlePagamentoConfirmado = async (dadosPagamento: any) => {
    if (!orcamentoParaFinalizar) return;

    try {
      // Mapear tipo de pagamento para formato legível
      const tiposPagamento: Record<string, string> = {
        'pix': 'PIX',
        'dinheiro': 'Dinheiro',
        'cartao_debito': 'Cartão Débito',
        'cartao_credito': 'Cartão Crédito'
      };

      const formaPagamento = tiposPagamento[dadosPagamento.tipo] || dadosPagamento.tipo;
      const descricaoPagamento = dadosPagamento.tipo === 'cartao_credito' && dadosPagamento.parcelas > 1
        ? `${formaPagamento} (${dadosPagamento.parcelas}x)`
        : formaPagamento;

      // Criar ordem de serviço a partir do orçamento
      const novaOrdem = {
        clienteId: orcamentoParaFinalizar.clienteId,
        motoId: orcamentoParaFinalizar.motoId,
        orcamentoId: orcamentoParaFinalizar.id,
        itens: orcamentoParaFinalizar.itens,
        descricaoProblema: orcamentoParaFinalizar.descricaoProblema,
        observacoes: orcamentoParaFinalizar.observacoes,
        status: 'entregue' as const,
        prioridade: 'media' as const,
        valorTotal: orcamentoParaFinalizar.valorTotal,
        valorPago: dadosPagamento.valor,
        formaPagamento: descricaoPagamento,
        dataConclusao: new Date().toISOString(),
        dataEntrega: new Date().toISOString(),
      };

      const ordemCriada = await adicionarOrdem(novaOrdem);

      // Registrar no caixa
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:9001/api'
        : `http://${window.location.hostname}:9001/api`;

      await fetch(`${API_URL}/caixa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'entrada',
          categoria: 'Recebimento de Cliente',
          descricao: `Pagamento Orçamento ${orcamentoParaFinalizar.numero}`,
          valor: dadosPagamento.valor,
          formaPagamento: dadosPagamento.tipo,
          data: new Date().toISOString(),
          ordemServicoId: ordemCriada?.id || null,
          observacoes: `Finalização de orçamento aprovado - ${descricaoPagamento}`
        })
      });

      // Atualizar status do orçamento para indicar que foi convertido
      await atualizarOrcamento(orcamentoParaFinalizar.id, {
        observacoes: `${orcamentoParaFinalizar.observacoes || ''}\n[Convertido em OS e finalizado em ${new Date().toLocaleDateString('pt-BR')} - ${descricaoPagamento}]`
      });

      setShowPagamentoModal(false);
      setOrcamentoParaFinalizar(undefined);
      alert('✅ Orçamento finalizado com sucesso!\nOrdem de serviço criada e registrada no caixa.');
    } catch (error) {
      console.error('Erro ao finalizar orçamento:', error);
      alert('Erro ao finalizar orçamento. Tente novamente.');
    }
  };

  return (
    <div className="p-4 sm:p-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 tracking-tight">Orçamentos</h1>
          <p className="text-sm text-slate-400 mt-1">{orcamentos.length} orçamentos cadastrados</p>
        </div>
        <button
          onClick={() => {
            setEditingOrcamento(undefined);
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-semibold rounded-xl shadow-lg shadow-amber-500/30 transition-all hover:scale-105 w-full sm:w-auto"
        >
          <Plus size={20} />
          Novo Orçamento
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative md:col-span-2 lg:col-span-1 group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Buscar por número, cliente ou moto..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-slate-700 bg-slate-900 text-slate-100 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all cursor-pointer hover:border-amber-400/50 appearance-none"
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="aprovado">Aprovado</option>
            <option value="rejeitado">Rejeitado</option>
            <option value="expirado">Expirado</option>
          </select>
          
          <div className="flex items-center justify-center gap-2 bg-amber-500/10 rounded-xl px-4 py-3 border border-amber-500/20">
            <FileText size={18} className="text-amber-400" />
            <span className="text-sm font-bold text-amber-400">{orcamentosFiltered.length}</span>
            <span className="text-sm text-slate-400 hidden sm:inline">orçamento(s)</span>
          </div>
        </div>
      </div>

      {/* Lista de Orçamentos */}
      {orcamentosFiltered.length === 0 ? (
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 p-12 sm:p-16 text-center animate-scaleIn">
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="h-10 w-10 text-amber-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-100 mb-3">Nenhum orçamento encontrado</h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            {searchTerm || statusFilter 
              ? 'Tente ajustar os filtros de busca para encontrar outros orçamentos.' 
              : 'Comece cadastrando seu primeiro orçamento clicando no botão abaixo.'
            }
          </p>
          {!searchTerm && !statusFilter && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-semibold rounded-xl shadow-lg shadow-amber-500/30 transition-all hover:scale-105"
            >
              <Plus size={20} />
              Cadastrar Primeiro Orçamento
            </button>
          )}
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 overflow-hidden animate-scaleIn">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Número</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Moto</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Validade</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-amber-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {orcamentosFiltered.map((orcamento, index) => {
                  const cliente = getClienteInfo(orcamento.clienteId);
                  const moto = getMotoInfo(orcamento.motoId);
                  const statusBadge = getStatusBadge(orcamento.status);
                  
                  return (
                    <tr key={orcamento.id} className={`${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-900/50'} hover:bg-slate-700/30 transition-colors duration-150`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                            <FileText size={16} className="text-amber-400" />
                          </div>
                          <span className="text-sm font-bold text-amber-400">{orcamento.numero}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
                          <User size={16} className="text-slate-500" />
                          {cliente.nome}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Bike size={16} className="text-slate-500" />
                          {moto.marca} {moto.modelo}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm font-bold text-amber-400">
                          <DollarSign size={16} className="text-amber-500" />
                          R$ {orcamento.valorTotal.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Calendar size={16} className="text-slate-500" />
                          {new Date(orcamento.dataEmissao).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-100">
                          {new Date(orcamento.validadeAte).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {orcamento.status === 'aprovado' && (
                            <button
                              onClick={() => handleFinalizarOrcamento(orcamento)}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 border border-transparent hover:border-green-500/30 rounded-lg transition-all hover:scale-110"
                              title="Finalizar e registrar no caixa"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleImprimirOrcamento(orcamento)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 border border-transparent hover:border-blue-500/30 rounded-lg transition-all hover:scale-110"
                            title="Imprimir orçamento (PDF)"
                          >
                            <Printer size={16} />
                          </button>
                          <button
                            onClick={() => handleEditOrcamento(orcamento)}
                            className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 border border-transparent hover:border-amber-500/30 rounded-lg transition-all hover:scale-110"
                            title="Editar orçamento"
                          >
                            <Edit size={16} />
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
        <OrcamentoForm
          orcamento={editingOrcamento}
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingOrcamento(undefined);
          }}
          onSave={handleSaveOrcamento}
        />
      )}

      {showPagamentoModal && orcamentoParaFinalizar && (
        <PagamentoModal
          ordemServico={{ 
            numero: orcamentoParaFinalizar.numero,
            valorTotal: orcamentoParaFinalizar.valorTotal,
            valorPago: 0
          }}
          onClose={() => {
            setShowPagamentoModal(false);
            setOrcamentoParaFinalizar(undefined);
          }}
          onPagamento={handlePagamentoConfirmado}
        />
      )}
    </div>
  );
}
