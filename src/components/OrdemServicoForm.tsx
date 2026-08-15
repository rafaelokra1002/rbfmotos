import React, { useState, useEffect } from 'react';
import { useOficinaData } from '../hooks/useOficinaData';
import { MotoForm } from './MotoForm';
import { ClienteForm } from './ClienteForm';
import { OrdemServico, Cliente, Moto, ItemOrcamento } from '../types';
import { X, Trash2, Bike, Calculator, Clock, User, Wrench, UserPlus, Camera, Image as ImageIcon, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { ModalCyber } from './ui/ModalCyber';
import { InputCyber } from './ui/InputCyber';
import { SelectCyber } from './ui/SelectCyber';
import { TextareaCyber } from './ui/TextareaCyber';
import { Button } from './ui/Button';
import { BadgeCyber } from './ui/BadgeCyber';

interface OrdemServicoFormProps {
  ordem?: OrdemServico;
  isOpen: boolean;
  onClose: () => void;
  onSave: (ordem: Omit<OrdemServico, 'id' | 'numero' | 'dataAbertura'>) => void;
  onDelete?: (ordemId: string) => void;
}

export function OrdemServicoForm({ ordem, isOpen, onClose, onSave, onDelete }: OrdemServicoFormProps) {
  const { clientes, motos, servicos, pecas, adicionarMoto, adicionarCliente } = useOficinaData();
  
  // Debug: Verificar se props estão sendo recebidas
  console.log('OrdemServicoForm - ordem:', ordem?.id, 'onDelete:', !!onDelete);
  
  const [formData, setFormData] = useState({
    clienteId: '',
    motoId: '',
    descricaoProblema: '',
    diagnostico: '',
    observacoes: '',
    observacoesTecnicas: '',
    status: 'aberta' as 'aberta' | 'em_andamento' | 'aguardando_peca' | 'pronta' | 'entregue' | 'cancelada',
    prioridade: 'media' as 'baixa' | 'media' | 'alta' | 'urgente',
    dataPrevisao: '',
    dataInicio: '',
    dataConclusao: '',
    dataEntrega: '',
    valorTotal: 0,
    valorPago: 0,
    formaPagamento: '',
    tecnicoResponsavel: '',
    garantia: 30
  });
  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [motosCliente, setMotosCliente] = useState<Moto[]>([]);
  const [showMotoForm, setShowMotoForm] = useState(false);
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'dados' | 'itens' | 'fotos' | 'observacoes'>('dados');
  const [fotos, setFotos] = useState<string[]>([]);
  
  // Estados para busca de serviços e peças
  const [buscaServico, setBuscaServico] = useState('');
  const [buscaPeca, setBuscaPeca] = useState('');
  const [showServicosDropdown, setShowServicosDropdown] = useState(false);
  const [showPecasDropdown, setShowPecasDropdown] = useState(false);

  // Estado para accordion de configurações
  const [configuracoesAberto, setConfiguracoesAberto] = useState(false);

  useEffect(() => {
    console.log('🔄 OrdemServicoForm useEffect - isOpen:', isOpen, 'ordem:', ordem?.numero || 'undefined');
    
    if (isOpen && ordem) {
      console.log('==== ORDEM RECEBIDA NO FORM ====');
      console.log('Ordem completa:', ordem);
      console.log('ordem.itens:', ordem.itens);
      console.log('Tipo de ordem.itens:', typeof ordem.itens);
      console.log('É array?', Array.isArray(ordem.itens));
      console.log('Quantidade de itens:', ordem.itens?.length);
      console.log('================================');
      
      setFormData({
        clienteId: ordem.clienteId,
        motoId: ordem.motoId,
        descricaoProblema: ordem.descricaoProblema,
        diagnostico: ordem.diagnostico || '',
        observacoes: ordem.observacoes || '',
        observacoesTecnicas: ordem.observacoesTecnicas || '',
        status: ordem.status,
        prioridade: ordem.prioridade,
        dataPrevisao: ordem.dataPrevisao ? ordem.dataPrevisao.split('T')[0] : '',
        dataInicio: ordem.dataInicio ? ordem.dataInicio.split('T')[0] : '',
        dataConclusao: ordem.dataConclusao ? ordem.dataConclusao.split('T')[0] : '',
        dataEntrega: ordem.dataEntrega ? ordem.dataEntrega.split('T')[0] : '',
        valorTotal: ordem.valorTotal,
        valorPago: ordem.valorPago || 0,
        formaPagamento: ordem.formaPagamento || '',
        tecnicoResponsavel: ordem.tecnicoResponsavel || '',
        garantia: ordem.garantia || 30
      });
      
      // Carregar itens - verificar se é string JSON ou array
      try {
        let itensCarregados: ItemOrcamento[] = [];
        
        if (typeof ordem.itens === 'string') {
          const itensParseados = JSON.parse(ordem.itens);
          itensCarregados = Array.isArray(itensParseados) ? itensParseados : [];
        } else if (Array.isArray(ordem.itens)) {
          itensCarregados = ordem.itens;
        } else {
          itensCarregados = [];
        }
        
        console.log('Itens carregados no formulário:', itensCarregados);
        console.log('Quantidade final de itens:', itensCarregados.length);
        setItens(itensCarregados);
      } catch (error) {
        console.error('Erro ao carregar itens:', error);
        setItens(ordem.itens || []);
      }
      
      // Verificar se fotos é string JSON ou array
      try {
        if (typeof ordem.fotos === 'string') {
          setFotos(JSON.parse(ordem.fotos));
        } else if (Array.isArray(ordem.fotos)) {
          setFotos(ordem.fotos);
        } else {
          setFotos([]);
        }
      } catch (error) {
        console.error('Erro ao carregar fotos:', error);
        setFotos([]);
      }
    } else if (isOpen && !ordem) {
      console.log('📝 Abrindo formulário para NOVA ordem');
      resetForm();
    }
  }, [ordem, isOpen]);

  useEffect(() => {
    if (formData.clienteId) {
      const cliente = clientes.find(c => c.id === formData.clienteId);
      setSelectedCliente(cliente || null);
      const motosDoCliente = motos.filter(m => m.clienteId === formData.clienteId);
      setMotosCliente(motosDoCliente);
      
      if (motosDoCliente.length === 0) {
        setFormData(prev => ({ ...prev, motoId: '' }));
      }
    } else {
      setSelectedCliente(null);
      setMotosCliente([]);
    }
  }, [formData.clienteId, clientes, motos]);

  useEffect(() => {
    const total = itens.reduce((sum, item) => {
      const subtotal = item.quantidade * item.precoUnitario;
      const desconto = item.desconto || 0;
      return sum + (subtotal - desconto);
    }, 0);
    setFormData(prev => ({ ...prev, valorTotal: total }));
  }, [itens]);

  // Preencher dataConclusao automaticamente quando status mudar para 'pronta'
  useEffect(() => {
    if (formData.status === 'pronta' && !formData.dataConclusao) {
      const hoje = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, dataConclusao: hoje }));
    }
  }, [formData.status]);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-servicos')) {
        setShowServicosDropdown(false);
      }
      if (!target.closest('.dropdown-pecas')) {
        setShowPecasDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetForm = () => {
    setFormData({
      clienteId: '',
      motoId: '',
      descricaoProblema: '',
      diagnostico: '',
      observacoes: '',
      observacoesTecnicas: '',
      status: 'aberta',
      prioridade: 'media',
      dataPrevisao: '',
      dataInicio: '',
      dataConclusao: '',
      dataEntrega: '',
      valorTotal: 0,
      valorPago: 0,
      formaPagamento: '',
      tecnicoResponsavel: '',
      garantia: 30
    });
    setItens([]);
    setSelectedCliente(null);
    setMotosCliente([]);
    setActiveTab('dados');
    setFotos([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clienteId || !formData.motoId || !formData.descricaoProblema) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    console.log('==== ENVIANDO ORDEM ====');
    console.log('Itens no estado antes de enviar:', itens);
    console.log('Quantidade de itens:', itens.length);

    // Enviar itens preservando os dados importantes
    // MANTÉM o ID do banco de dados se existir (para itens já salvos)
    // MANTÉM o itemId para manter referência ao serviço/peça
    const itensParaEnviar = itens.map((item) => ({
      id: item.id, // Preserva ID do banco se existir
      tipo: item.tipo,
      itemId: item.itemId,
      nome: item.nome,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
      desconto: item.desconto
    })) as any;

    console.log('Itens processados para enviar:', itensParaEnviar);

    // Calcular o valor total baseado nos itens
    const calcularValorTotal = () => {
      return itens.reduce((total, item) => {
        const subtotal = item.quantidade * item.precoUnitario;
        return total + (subtotal - (item.desconto || 0));
      }, 0);
    };

    const valorTotalCalculado = calcularValorTotal();
    console.log('Valor total calculado:', valorTotalCalculado);

    // Se não houver valor nos itens nem no campo, enviar 0
    const valorFinal = valorTotalCalculado > 0 ? valorTotalCalculado : (formData.valorTotal || 0);

    const dadosOrdem: Omit<OrdemServico, 'id' | 'numero' | 'dataAbertura'> = {
      ...formData,
      valorTotal: valorFinal,
      valorPago: formData.valorPago || 0, // Garantir que valorPago nunca seja undefined
      itens: itensParaEnviar,
      fotos: fotos,
      dataPrevisao: formData.dataPrevisao ? new Date(formData.dataPrevisao).toISOString() : undefined,
      dataInicio: formData.dataInicio ? new Date(formData.dataInicio).toISOString() : undefined,
      dataConclusao: formData.dataConclusao ? new Date(formData.dataConclusao).toISOString() : undefined,
      dataEntrega: formData.dataEntrega ? new Date(formData.dataEntrega).toISOString() : undefined
    };

    console.log('Dados completos sendo salvos:', dadosOrdem);
    console.log('========================');

    onSave(dadosOrdem);
    onClose();
    resetForm();
  };

  const handleSaveMoto = async (dadosMoto: Omit<Moto, 'id'>) => {
    const novaMoto = await adicionarMoto(dadosMoto);
    setFormData(prev => ({ ...prev, motoId: novaMoto.id }));
    setShowMotoForm(false);
  };

  const handleSaveCliente = async (dadosCliente: Omit<Cliente, 'id' | 'dataCadastro'>) => {
    const novoCliente = await adicionarCliente(dadosCliente);
    setFormData(prev => ({ ...prev, clienteId: novoCliente.id }));
    setShowClienteForm(false);
  };

  const adicionarItem = (tipo: 'servico' | 'peca', itemId: string) => {
    const item = tipo === 'servico' 
      ? servicos.find(s => s.id === itemId)
      : pecas.find(p => p.id === itemId);
    
    if (!item) return;

    // Detectar se é fluido baseado na categoria ou unidade
    const isFluido = item.unidade === 'ml' || 
                     (tipo === 'servico' && (item as any).categoria === 'fluidos') ||
                     (tipo === 'peca' && ['fluidos', 'oleo', 'fluido'].some(cat => 
                       (item as any).categoria?.toLowerCase().includes(cat)));

    const novoItem: ItemOrcamento = {
      id: Date.now().toString(),
      tipo: isFluido ? 'fluido' : tipo,
      itemId: item.id,
      nome: item.nome,
      quantidade: 1,
      precoUnitario: item.preco,
      unidade: item.unidade || 'un',
      volumeMl: isFluido ? 1000 : undefined // Valor padrão: 1 litro (1000ml)
    };

    setItens(prev => [...prev, novoItem]);
  };

  const removerItem = (id: string) => {
    setItens(prev => prev.filter(item => item.id !== id));
  };

  const atualizarItem = (id: string, campo: keyof ItemOrcamento, valor: any) => {
    setItens(prev => prev.map(item => 
      item.id === id ? { ...item, [campo]: valor } : item
    ));
  };

  const MAX_FOTO_SIZE_MB = 8;

  const handleAddFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      // Limitar tamanho da foto a 8MB
      if (file.size > MAX_FOTO_SIZE_MB * 1024 * 1024) {
        alert(`A foto ${file.name} é muito grande. Máximo ${MAX_FOTO_SIZE_MB}MB por foto.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        
        // Comprimir imagem se necessário
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Reduzir resolução se muito grande (max 1920px)
          const maxSize = 1920;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Converter para base64 com qualidade reduzida
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setFotos(prev => [...prev, compressedBase64]);
        };
        img.src = base64;
      };
      reader.readAsDataURL(file);
    });
  };

  const removerFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleDelete = () => {
    if (!ordem?.id || !onDelete) return;
    
    if (window.confirm(`Tem certeza que deseja EXCLUIR permanentemente a Ordem #${ordem.numero}?\n\nEsta ação não pode ser desfeita!`)) {
      onDelete(ordem.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ModalCyber
        isOpen={isOpen}
        onClose={onClose}
        title={ordem ? `Editar Ordem #${ordem.numero}` : 'Nova Ordem de Serviço'}
        subtitle={selectedCliente ? `${selectedCliente.nome} - ${selectedCliente.telefone}` : undefined}
        size="xl"
        closeOnOverlayClick={false}
        footer={
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-3 flex-1">
              {/* Botão Excluir - Apenas ao editar */}
              {ordem && onDelete ? (
                <Button 
                  variant="danger" 
                  onClick={handleDelete}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white border-red-600"
                  title="Excluir ordem permanentemente"
                >
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">Excluir</span>
                </Button>
              ) : null}
              
              {/* Resumo de itens */}
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {itens.length > 0 && (
                  <span className="flex items-center gap-2">
                    <Calculator size={16} className="text-amber-600 dark:text-amber-400" />
                    <span>{itens.length} {itens.length === 1 ? 'item' : 'itens'} - </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      R$ {formData.valorTotal.toFixed(2)}
                    </span>
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSubmit}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {ordem ? 'Atualizar Ordem' : 'Criar Ordem'}
              </Button>
            </div>
          </div>
        }
      >
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 overflow-x-auto -mx-6 px-6 -mt-6 mb-6">
          <button
            onClick={() => setActiveTab('dados')}
            className={`px-4 sm:px-6 py-3 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'dados'
                ? 'border-b-2 border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Wrench size={16} />
              <span>Dados</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('itens')}
            className={`px-4 sm:px-6 py-3 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'itens'
                ? 'border-b-2 border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calculator size={16} />
              <span>Itens</span>
              {itens.length > 0 && (
                <BadgeCyber variant="info" size="sm">
                  {itens.length}
                </BadgeCyber>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('fotos')}
            className={`px-4 sm:px-6 py-3 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'fotos'
                ? 'border-b-2 border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Camera size={16} />
              <span>Fotos</span>
              {fotos.length > 0 && (
                <BadgeCyber variant="success" size="sm">
                  {fotos.length}
                </BadgeCyber>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('observacoes')}
            className={`px-4 sm:px-6 py-3 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'observacoes'
                ? 'border-b-2 border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>Observações</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Tab: Dados Principais */}
          {activeTab === 'dados' && (
            <div className="space-y-4">
                  {/* Cliente */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Cliente *
                    </label>
                    <div className="flex gap-2">
                      <SelectCyber
                        value={formData.clienteId}
                        onChange={(e) => setFormData(prev => ({ ...prev, clienteId: e.target.value, motoId: '' }))}
                        required
                        icon={User}
                      >
                        <option value="">Selecione um cliente</option>
                        {clientes.map(cliente => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nome} - {cliente.telefone}
                          </option>
                        ))}
                      </SelectCyber>
                      <Button
                        type="button"
                        onClick={() => setShowClienteForm(true)}
                        variant="primary"
                        className="px-3 bg-amber-600 hover:bg-amber-700"
                        title="Novo cliente"
                      >
                        <UserPlus size={18} />
                      </Button>
                    </div>
                  </div>

                  {/* Moto */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Moto *
                    </label>
                    <div className="flex gap-2">
                      <SelectCyber
                        value={formData.motoId}
                        onChange={(e) => setFormData(prev => ({ ...prev, motoId: e.target.value }))}
                        required
                        disabled={!formData.clienteId}
                        icon={Bike}
                      >
                        <option value="">
                          {motosCliente.length === 0 && formData.clienteId 
                            ? 'Nenhuma moto cadastrada' 
                            : 'Selecione uma moto'
                          }
                        </option>
                        {motosCliente.map(moto => (
                          <option key={moto.id} value={moto.id}>
                            {moto.marca} {moto.modelo} - {moto.placa}
                          </option>
                        ))}
                      </SelectCyber>
                      {formData.clienteId && (
                        <Button
                          type="button"
                          onClick={() => setShowMotoForm(true)}
                          variant="success"
                          className="px-3"
                          title="Nova moto"
                        >
                          <Bike size={18} />
                        </Button>
                      )}
                    </div>
                    {motosCliente.length === 0 && formData.clienteId && (
                      <div className="text-xs text-yellow-700 dark:text-yellow-400 mt-2 flex items-center gap-2 bg-yellow-50 dark:bg-yellow-500/10 px-3 py-2 rounded border border-yellow-200 dark:border-yellow-500/30">
                        Este cliente não possui motos cadastradas
                      </div>
                    )}
                  </div>

                  {/* Descrição do Problema */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Descrição do Problema *
                    </label>
                    <TextareaCyber
                      value={formData.descricaoProblema}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricaoProblema: e.target.value }))}
                      rows={3}
                      placeholder="Descreva o problema relatado pelo cliente..."
                      required
                    />
                  </div>

                  {/* Accordion: Configurações da Ordem */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setConfiguracoesAberto(!configuracoesAberto)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-left transition-colors"
                    >
                      <span className="font-medium text-slate-900 dark:text-slate-100">Configurações da Ordem</span>
                      {configuracoesAberto ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    
                    {configuracoesAberto && (
                      <div className="p-4 space-y-4 bg-white dark:bg-slate-900/20">
                        {/* Status, Prioridade e Técnico */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Status
                            </label>
                            <SelectCyber
                              value={formData.status}
                              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                            >
                              <option value="aberta">Aberta</option>
                              <option value="em_andamento">Em Andamento</option>
                              <option value="aguardando_peca">Aguardando Peça</option>
                              <option value="pronta">Pronta</option>
                              <option value="entregue">Entregue</option>
                              <option value="cancelada">Cancelada</option>
                            </SelectCyber>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Prioridade
                            </label>
                            <SelectCyber
                              value={formData.prioridade}
                              onChange={(e) => setFormData(prev => ({ ...prev, prioridade: e.target.value as any }))}
                            >
                              <option value="baixa">Baixa</option>
                              <option value="media">Média</option>
                              <option value="alta">Alta</option>
                              <option value="urgente">Urgente</option>
                            </SelectCyber>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Técnico Responsável
                            </label>
                            <InputCyber
                              type="text"
                              value={formData.tecnicoResponsavel}
                              onChange={(e) => setFormData(prev => ({ ...prev, tecnicoResponsavel: e.target.value }))}
                              placeholder="Nome do técnico"
                              icon={User}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Resumo de Valores (Sempre visível, simplificado) */}
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-500/10 rounded-lg p-4 border border-amber-200 dark:border-amber-500/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Valor Total da Ordem</span>
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        R$ {formData.valorTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Itens (Serviços e Peças) */}
              {activeTab === 'itens' && (
                <div className="space-y-4">
                  {/* Busca de Serviços */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Adicionar Serviço
                    </label>
                      <div className="relative">
                        <InputCyber
                          type="text"
                          value={buscaServico}
                          onChange={(e) => {
                            setBuscaServico(e.target.value);
                            setShowServicosDropdown(true);
                          }}
                          onFocus={() => setShowServicosDropdown(true)}
                          onBlur={() => {
                            // Delay para permitir que o clique no item seja processado
                            setTimeout(() => setShowServicosDropdown(false), 200);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setBuscaServico('');
                              setShowServicosDropdown(false);
                            }
                          }}
                          placeholder="Digite para buscar um serviço..."
                          icon={Search}
                        />
                        {buscaServico && (
                          <button
                            type="button"
                            onClick={() => {
                              setBuscaServico('');
                              setShowServicosDropdown(false);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                      
                      {showServicosDropdown && buscaServico && (
                        <div className="mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {servicos
                            .filter(s => s.nome.toLowerCase().includes(buscaServico.toLowerCase()))
                            .map(servico => (
                              <button
                                key={servico.id}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  adicionarItem('servico', servico.id);
                                  setBuscaServico('');
                                  setShowServicosDropdown(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-amber-50 dark:hover:bg-slate-700 border-b border-slate-200 dark:border-slate-700 last:border-0 transition-all cursor-pointer block"
                              >
                                <div className="font-medium text-slate-900 dark:text-slate-100">{servico.nome}</div>
                                <div className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">R$ {servico.preco.toFixed(2)}</div>
                              </button>
                            ))}
                          {servicos.filter(s => s.nome.toLowerCase().includes(buscaServico.toLowerCase())).length === 0 && (
                            <div className="px-4 py-3 text-center text-slate-500 dark:text-slate-400 text-sm">
                              Nenhum serviço encontrado
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Busca de Peças */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Adicionar Peça
                      </label>
                      <div className="relative">
                        <InputCyber
                          type="text"
                          value={buscaPeca}
                          onChange={(e) => {
                            setBuscaPeca(e.target.value);
                            setShowPecasDropdown(true);
                          }}
                          onFocus={() => setShowPecasDropdown(true)}
                          onBlur={() => {
                            // Delay para permitir que o clique no item seja processado
                            setTimeout(() => setShowPecasDropdown(false), 200);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setBuscaPeca('');
                              setShowPecasDropdown(false);
                            }
                          }}
                          placeholder="Digite para buscar uma peça..."
                          icon={Search}
                        />
                        {buscaPeca && (
                          <button
                            type="button"
                            onClick={() => {
                              setBuscaPeca('');
                              setShowPecasDropdown(false);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                      
                      {showPecasDropdown && buscaPeca && (
                        <div className="mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {pecas
                            .filter(p => p.nome.toLowerCase().includes(buscaPeca.toLowerCase()) || p.codigo?.toLowerCase().includes(buscaPeca.toLowerCase()))
                            .map(peca => (
                              <button
                                key={peca.id}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  adicionarItem('peca', peca.id);
                                  setBuscaPeca('');
                                  setShowPecasDropdown(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-amber-50 dark:hover:bg-slate-700 border-b border-slate-200 dark:border-slate-700 last:border-0 transition-all cursor-pointer block"
                              >
                                <div className="font-medium text-slate-900 dark:text-slate-100">{peca.nome}</div>
                                <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                  {peca.codigo && <span className="text-xs bg-slate-100 dark:bg-slate-700 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-semibold">#{peca.codigo}</span>}
                                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">R$ {peca.preco.toFixed(2)}</span>
                                  {peca.estoque !== undefined && (
                                    <BadgeCyber 
                                      variant={peca.estoque > 0 ? 'success' : 'error'}
                                      size="sm"
                                    >
                                      Estoque: {peca.estoque}
                                    </BadgeCyber>
                                  )}
                                </div>
                              </button>
                            ))}
                          {pecas.filter(p => p.nome.toLowerCase().includes(buscaPeca.toLowerCase()) || p.codigo?.toLowerCase().includes(buscaPeca.toLowerCase())).length === 0 && (
                            <div className="px-4 py-3 text-center text-slate-400 text-sm">
                              Nenhuma peça encontrada
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  {/* Lista de Itens */}
                  {itens.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/30 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700">
                      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Calculator className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                      </div>
                      <p className="text-slate-900 dark:text-slate-100 font-medium">Nenhum item adicionado</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Busque serviços ou peças acima</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {itens.map(item => (
                        <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                          {/* Cabeçalho do Item */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">{item.nome}</div>
                              <BadgeCyber 
                                variant={
                                  item.tipo === 'servico' ? 'info' :
                                  item.tipo === 'fluido' ? 'pending' : 'success'
                                }
                                size="sm"
                              >
                                {item.tipo === 'servico' ? 'Serviço' : item.tipo === 'fluido' ? 'Fluido' : 'Peça'}
                              </BadgeCyber>
                            </div>
                            <Button
                              type="button"
                              onClick={() => removerItem(item.id)}
                              variant="danger"
                              className="p-2 flex-shrink-0"
                              title="Remover"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>

                          {/* Campos de Edição - Layout Vertical Mobile */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {/* Quantidade */}
                            <div>
                              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                {item.tipo === 'fluido' ? 'Quantidade (L)' : 'Quantidade'}
                              </label>
                              <InputCyber
                                type="number"
                                min={item.tipo === 'fluido' ? '0.001' : '1'}
                                step={item.tipo === 'fluido' ? '0.001' : '1'}
                                value={item.quantidade}
                                onChange={(e) => atualizarItem(
                                  item.id, 
                                  'quantidade', 
                                  item.tipo === 'fluido' 
                                    ? (parseFloat(e.target.value) || 0)
                                    : (parseInt(e.target.value) || 1)
                                )}
                                className="w-full"
                              />
                              {item.tipo === 'fluido' && (
                                <span className="text-xs text-amber-600 dark:text-amber-400 mt-1 block">
                                  {(item.quantidade * 1000).toFixed(0)}ml
                                </span>
                              )}
                            </div>

                            {/* Preço Unitário */}
                            <div>
                              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                Preço Unit.
                              </label>
                              <InputCyber
                                type="number"
                                step="0.01"
                                value={item.precoUnitario}
                                onChange={(e) => atualizarItem(item.id, 'precoUnitario', parseFloat(e.target.value) || 0)}
                                className="w-full"
                              />
                            </div>

                            {/* Subtotal - Destaque */}
                            <div className="col-span-2 sm:col-span-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-3 py-2 rounded-lg flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Subtotal:</span>
                              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                R$ {(item.quantidade * item.precoUnitario).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Total Geral */}
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-500/10 rounded-lg p-4 border-2 border-amber-200 dark:border-amber-500/30">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            Total Geral
                          </span>
                          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            R$ {formData.valorTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Fotos */}
              {activeTab === 'fotos' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-900/30 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center transition-all hover:border-amber-500 dark:hover:border-amber-500 group">
                    <div className="w-20 h-20 bg-amber-100 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Camera className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Adicionar Fotos</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Fotos do estado da moto para documentação
                    </p>
                    <label className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white hover:shadow-md rounded-lg transition-all cursor-pointer font-medium transform hover:scale-105">
                      <Camera size={18} />
                      Selecionar Fotos
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAddFoto}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 sm:mt-3">
                      JPG, PNG • Máximo 8MB por foto
                    </p>
                  </div>

                  {fotos.length > 0 && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 flex items-center gap-2">
                        <ImageIcon size={16} className="text-amber-600 dark:text-amber-400" />
                        Fotos Adicionadas ({fotos.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                        {fotos.map((foto, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={foto}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-32 sm:h-40 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700 transition-all group-hover:border-yellow-400 dark:group-hover:border-yellow-600"
                            />
                            <button
                              type="button"
                              onClick={() => removerFoto(index)}
                              className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1.5 sm:p-2 bg-red-500 dark:bg-red-600 text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-red-600 dark:hover:bg-red-700 shadow-medium hover:scale-110"
                              title="Remover foto"
                            >
                              <Trash2 size={14} className="sm:w-4 sm:h-4" />
                            </button>
                            <div className="absolute bottom-1 left-1 right-1 sm:bottom-2 sm:left-2 sm:right-2 bg-black/70 backdrop-blur-sm text-white text-xs py-1 px-2 rounded-lg font-semibold">
                              Foto {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {fotos.length === 0 && (
                    <div className="text-center py-6 sm:py-8 text-gray-400">
                      <ImageIcon className="mx-auto h-12 w-12 sm:h-16 sm:w-16 mb-2 sm:mb-3 opacity-30" />
                      <p className="text-xs sm:text-sm">Nenhuma foto adicionada</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Observações e Datas */}
              {activeTab === 'observacoes' && (
                <div className="space-y-6">
                  {/* Datas */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-800 shadow-soft">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-blue-400 mb-4 flex items-center gap-2">
                      <Clock size={20} className="text-blue-600 dark:text-blue-400" />
                      Controle de Datas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-yellow-600 dark:text-yellow-400" />
                            Data Previsão
                          </div>
                        </label>
                        <input
                          type="date"
                          value={formData.dataPrevisao}
                          onChange={(e) => setFormData(prev => ({ ...prev, dataPrevisao: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all hover:border-yellow-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-green-600 dark:text-green-400" />
                            Data Início
                          </div>
                        </label>
                        <input
                          type="date"
                          value={formData.dataInicio}
                          onChange={(e) => setFormData(prev => ({ ...prev, dataInicio: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all hover:border-yellow-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-blue-600 dark:text-blue-400" />
                            Data Conclusão
                          </div>
                        </label>
                        <input
                          type="date"
                          value={formData.dataConclusao}
                          onChange={(e) => setFormData(prev => ({ ...prev, dataConclusao: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all hover:border-yellow-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-purple-600 dark:text-purple-400" />
                            Data Entrega
                          </div>
                        </label>
                        <input
                          type="date"
                          value={formData.dataEntrega}
                          onChange={(e) => setFormData(prev => ({ ...prev, dataEntrega: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all hover:border-yellow-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Observações */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <div className="flex items-center gap-2">
                          <Wrench size={16} className="text-yellow-600 dark:text-yellow-400" />
                          Diagnóstico Técnico
                        </div>
                      </label>
                      <textarea
                        value={formData.diagnostico}
                        onChange={(e) => setFormData(prev => ({ ...prev, diagnostico: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all hover:border-yellow-400 resize-none"
                        rows={4}
                        placeholder="Diagnóstico detalhado do problema encontrado..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <div className="flex items-center gap-2">
                          <Wrench size={16} className="text-yellow-600 dark:text-yellow-400" />
                          Observações Técnicas
                        </div>
                      </label>
                      <textarea
                        value={formData.observacoesTecnicas}
                        onChange={(e) => setFormData(prev => ({ ...prev, observacoesTecnicas: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all hover:border-yellow-400 resize-none"
                        rows={4}
                        placeholder="Observações para a equipe técnica..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Observações Gerais
                    </label>
                    <textarea
                      value={formData.observacoes}
                      onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all hover:border-yellow-400 resize-none"
                      rows={3}
                      placeholder="Observações gerais sobre o atendimento, acordos com o cliente, etc..."
                    />
                  </div>
                </div>
              )}
        </div>
      </ModalCyber>

      <MotoForm
        clienteId={formData.clienteId}
        isOpen={showMotoForm}
        onClose={() => setShowMotoForm(false)}
        onSave={handleSaveMoto}
      />

      <ClienteForm
        isOpen={showClienteForm}
        onClose={() => setShowClienteForm(false)}
        onSave={handleSaveCliente}
      />
    </>
  );
}
