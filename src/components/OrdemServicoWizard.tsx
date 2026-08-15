import { useState, useEffect } from 'react';
import { useOficinaData } from '../hooks/useOficinaData';
import { OrdemServico, ItemOrcamento } from '../types';
import { X, ChevronRight, ChevronLeft, Check, User, Bike, Wrench, FileText, Plus, ChevronDown, ChevronUp, UserPlus } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Card, CardBody } from './ui/Card';
import { ClienteForm } from './ClienteForm';
import { MotoForm } from './MotoForm';

interface OrdemServicoWizardProps {
  ordem?: OrdemServico;
  isOpen: boolean;
  onClose: () => void;
  onSave: (ordem: Omit<OrdemServico, 'id' | 'numero' | 'dataAbertura'>) => void;
  onDelete?: (ordemId: string) => void;
}

type WizardStep = 'cliente' | 'veiculo' | 'servico' | 'confirmacao';

export function OrdemServicoWizard({ ordem, isOpen, onClose, onSave, onDelete }: OrdemServicoWizardProps) {
  const { clientes, motos, servicos, adicionarCliente, adicionarMoto } = useOficinaData();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('cliente');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Modals
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [showMotoForm, setShowMotoForm] = useState(false);
  
  // Form data
  const [clienteId, setClienteId] = useState('');
  const [motoId, setMotoId] = useState('');
  const [descricaoProblema, setDescricaoProblema] = useState('');
  const [servicosPrincipais, setServicosPrincipais] = useState<string[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [prioridade, setPrioridade] = useState<'baixa' | 'media' | 'alta' | 'urgente'>('media');
  const [dataPrevisao, setDataPrevisao] = useState('');
  
  // Filtros e buscas
  const [buscaCliente, setBuscaCliente] = useState('');
  const [buscaMoto, setBuscaMoto] = useState('');
  const [buscaServico, setBuscaServico] = useState('');
  
  // Motos do cliente selecionado
  const motosCliente = clienteId 
    ? motos.filter(m => m.clienteId === clienteId)
    : [];

  // Filtros
  const clientesFiltrados = clientes.filter(c => 
    c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
    c.telefone.includes(buscaCliente)
  );

  const motosFiltradas = motosCliente.filter(m =>
    `${m.marca} ${m.modelo}`.toLowerCase().includes(buscaMoto.toLowerCase()) ||
    m.placa.toLowerCase().includes(buscaMoto.toLowerCase())
  );

  const servicosFiltrados = servicos.filter(s =>
    s.nome.toLowerCase().includes(buscaServico.toLowerCase())
  );

  // Load ordem data if editing - PRIORIDADE MÁXIMA
  useEffect(() => {
    console.log('🔄 OrdemServicoWizard useEffect - isOpen:', isOpen, 'ordem:', ordem?.numero || 'undefined');
    
    if (isOpen && ordem) {
      console.log('✏️ MODO EDIÇÃO - Carregando ordem:', ordem.numero);
      console.log('📋 Dados da ordem:', {
        clienteId: ordem.clienteId,
        motoId: ordem.motoId,
        descricao: ordem.descricaoProblema.substring(0, 50) + '...',
        itens: ordem.itens?.length || 0,
        prioridade: ordem.prioridade
      });
      
      setClienteId(ordem.clienteId);
      setMotoId(ordem.motoId);
      setDescricaoProblema(ordem.descricaoProblema);
      setObservacoes(ordem.observacoes || '');
      setPrioridade(ordem.prioridade);
      setDataPrevisao(ordem.dataPrevisao ? ordem.dataPrevisao.split('T')[0] : '');
      
      // Carregar serviços da ordem
      if (ordem.itens && Array.isArray(ordem.itens)) {
        const servicosIds = ordem.itens
          .filter(item => item.tipo === 'servico')
          .map(item => item.itemId);
        setServicosPrincipais(servicosIds);
        console.log('🔧 Serviços carregados:', servicosIds);
      }
      
      // Em modo edição, começar do primeiro passo para permitir editar tudo
      setCurrentStep('cliente');
      
      console.log('✅ Ordem carregada no wizard com sucesso');
    } else if (isOpen && !ordem) {
      console.log('📝 MODO NOVA ORDEM - Resetando formulário');
      setCurrentStep('cliente');
      setClienteId('');
      setMotoId('');
      setDescricaoProblema('');
      setServicosPrincipais([]);
      setObservacoes('');
      setPrioridade('media');
      setDataPrevisao('');
    }
  }, [ordem, isOpen]);

  // Reset form only when closing - COM DELAY
  useEffect(() => {
    if (!isOpen) {
      console.log('🚪 Modal fechando - Aguardando para resetar...');
      // Aguardar um pouco antes de resetar para não interferir
      const timer = setTimeout(() => {
        console.log('🧹 Resetando formulário após fechamento');
        setCurrentStep('cliente');
        setClienteId('');
        setMotoId('');
        setDescricaoProblema('');
        setServicosPrincipais([]);
        setObservacoes('');
        setPrioridade('media');
        setDataPrevisao('');
        setBuscaCliente('');
        setBuscaMoto('');
        setBuscaServico('');
        setShowAdvanced(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSaveCliente = async (clienteData: any) => {
    const novoCliente = await adicionarCliente(clienteData);
    setClienteId(novoCliente.id);
    setShowClienteForm(false);
  };

  const handleSaveMoto = async (motoData: any) => {
    const novaMoto = await adicionarMoto(motoData);
    setMotoId(novaMoto.id);
    setShowMotoForm(false);
  };

  const handleNext = () => {
    if (currentStep === 'cliente' && clienteId) {
      setCurrentStep('veiculo');
    } else if (currentStep === 'veiculo' && motoId) {
      setCurrentStep('servico');
    } else if (currentStep === 'servico' && descricaoProblema) {
      setCurrentStep('confirmacao');
    }
  };

  const handleBack = () => {
    if (currentStep === 'veiculo') {
      setCurrentStep('cliente');
    } else if (currentStep === 'servico') {
      setCurrentStep('veiculo');
    } else if (currentStep === 'confirmacao') {
      setCurrentStep('servico');
    }
  };

  const handleSubmit = () => {
    const cliente = clientes.find(c => c.id === clienteId);
    const moto = motos.find(m => m.id === motoId);
    
    if (!cliente || !moto || !descricaoProblema) return;

    // Criar itens do orçamento baseado nos serviços selecionados
    const itens: ItemOrcamento[] = servicosPrincipais
      .map(servicoId => {
        const servico = servicos.find(s => s.id === servicoId);
        if (!servico) return null;
        
        return {
          id: Math.random().toString(36).substring(7),
          tipo: 'servico' as const,
          itemId: servico.id,
          nome: servico.nome,
          quantidade: 1,
          precoUnitario: servico.preco
        } as ItemOrcamento;
      })
      .filter(item => item !== null) as ItemOrcamento[];

    const valorTotal = itens.reduce((acc, item) => acc + (item.precoUnitario * item.quantidade), 0);

    const ordemData: Omit<OrdemServico, 'id' | 'numero' | 'dataAbertura'> = {
      clienteId,
      motoId,
      descricaoProblema,
      diagnostico: '',
      observacoes,
      observacoesTecnicas: '',
      status: 'aberta',
      prioridade,
      dataPrevisao: dataPrevisao || undefined,
      dataInicio: undefined,
      dataConclusao: undefined,
      dataEntrega: undefined,
      valorTotal,
      valorPago: 0,
      formaPagamento: '',
      tecnicoResponsavel: '',
      garantia: 30,
      itens: itens as any, // Will be converted to JSON by backend
      fotos: undefined
    };

    onSave(ordemData);
    onClose();
  };

  const toggleServico = (servicoId: string) => {
    setServicosPrincipais(prev => 
      prev.includes(servicoId)
        ? prev.filter(id => id !== servicoId)
        : [...prev, servicoId]
    );
  };

  const selectedCliente = clientes.find(c => c.id === clienteId);
  const selectedMoto = motos.find(m => m.id === motoId);

  const canProceed = () => {
    if (currentStep === 'cliente') return !!clienteId;
    if (currentStep === 'veiculo') return !!motoId;
    if (currentStep === 'servico') return !!descricaoProblema;
    if (currentStep === 'confirmacao') return true;
    return false;
  };

  const stepIndicator = () => {
    const steps = [
      { id: 'cliente', label: 'Cliente', icon: User },
      { id: 'veiculo', label: 'Veículo', icon: Bike },
      { id: 'servico', label: 'Serviço', icon: Wrench },
      { id: 'confirmacao', label: 'Confirmar', icon: Check }
    ];

    const currentIndex = steps.findIndex(s => s.id === currentStep);

    return (
      <div className="flex items-center justify-between mb-6 px-1">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = index < currentIndex;
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${isActive ? 'bg-blue-600 text-white scale-110' : ''}
                  ${isCompleted ? 'bg-emerald-600 text-white' : ''}
                  ${!isActive && !isCompleted ? 'bg-slate-200 dark:bg-slate-700 text-slate-400' : ''}
                `}>
                  <Icon size={18} />
                </div>
                <span className={`text-xs mt-1 font-medium ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 ${isCompleted ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {ordem ? 'Editar Ordem' : 'Nova Ordem de Serviço'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>
          
          {stepIndicator()}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 pb-24">
          {/* STEP 1: Cliente */}
          {currentStep === 'cliente' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Selecione o Cliente
                </h3>
                
                <Input
                  placeholder="Buscar por nome ou telefone..."
                  value={buscaCliente}
                  onChange={(e) => setBuscaCliente(e.target.value)}
                  className="mb-4"
                />

                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {clientesFiltrados.length === 0 ? (
                    <Card variant="elevated">
                      <CardBody className="p-8 text-center">
                        <User className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 mb-4">
                          {buscaCliente ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                        </p>
                        <Button 
                          variant="primary" 
                          leftIcon={<UserPlus size={18} />}
                          onClick={() => setShowClienteForm(true)}
                        >
                          Cadastrar Cliente
                        </Button>
                      </CardBody>
                    </Card>
                  ) : (
                    <>
                      {clientesFiltrados.map(cliente => (
                      <Card
                        key={cliente.id}
                        variant={clienteId === cliente.id ? 'elevated' : 'default'}
                        className={`cursor-pointer transition-all ${
                          clienteId === cliente.id 
                            ? 'ring-2 ring-blue-500' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => setClienteId(cliente.id)}
                      >
                        <CardBody className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {cliente.nome}
                              </h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {cliente.telefone}
                              </p>
                            </div>
                            {clienteId === cliente.id && (
                              <Check size={24} className="text-blue-600 flex-shrink-0 ml-3" />
                            )}
                          </div>
                        </CardBody>
                      </Card>
                      ))}
                      
                      {/* Botão adicionar cliente sempre visível na lista */}
                      <Button
                        variant="secondary"
                        leftIcon={<UserPlus size={18} />}
                        onClick={() => setShowClienteForm(true)}
                        className="w-full mt-3"
                      >
                        Cadastrar Novo Cliente
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Veículo */}
          {currentStep === 'veiculo' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Selecione o Veículo
                </h3>
                {selectedCliente && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Cliente: <span className="font-medium">{selectedCliente.nome}</span>
                  </p>
                )}
                
                {motosCliente.length > 0 && (
                  <Input
                    placeholder="Buscar por modelo ou placa..."
                    value={buscaMoto}
                    onChange={(e) => setBuscaMoto(e.target.value)}
                    className="mb-4"
                  />
                )}

                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {motosCliente.length === 0 ? (
                    <Card variant="elevated">
                      <CardBody className="p-8 text-center">
                        <Bike className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 mb-4">
                          Este cliente não possui veículos cadastrados
                        </p>
                        <Button 
                          variant="primary" 
                          leftIcon={<Plus size={18} />}
                          onClick={() => setShowMotoForm(true)}
                        >
                          Cadastrar Veículo
                        </Button>
                      </CardBody>
                    </Card>
                  ) : motosFiltradas.length === 0 ? (
                    <Card variant="elevated">
                      <CardBody className="p-8 text-center">
                        <p className="text-slate-500 dark:text-slate-400 mb-4">
                          Nenhum veículo encontrado
                        </p>
                        <Button 
                          variant="primary" 
                          leftIcon={<Plus size={18} />}
                          onClick={() => setShowMotoForm(true)}
                        >
                          Cadastrar Veículo
                        </Button>
                      </CardBody>
                    </Card>
                  ) : (
                    <>
                      {motosFiltradas.map(moto => (
                        <Card
                          key={moto.id}
                          variant={motoId === moto.id ? 'elevated' : 'default'}
                          className={`cursor-pointer transition-all ${
                            motoId === moto.id 
                              ? 'ring-2 ring-blue-500' 
                              : 'hover:shadow-md'
                          }`}
                          onClick={() => setMotoId(moto.id)}
                        >
                          <CardBody className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {moto.marca} {moto.modelo}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="neutral" className="text-xs">
                                    {moto.placa}
                                  </Badge>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {moto.ano}
                                  </span>
                                </div>
                              </div>
                              {motoId === moto.id && (
                                <Check size={24} className="text-blue-600 flex-shrink-0 ml-3" />
                              )}
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                      
                      {/* Botão adicionar veículo sempre visível na lista */}
                      <Button
                        variant="secondary"
                        leftIcon={<Plus size={18} />}
                        onClick={() => setShowMotoForm(true)}
                        className="w-full mt-3"
                      >
                        Cadastrar Novo Veículo
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Serviço */}
          {currentStep === 'servico' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Descreva o Problema
                </h3>
                {selectedMoto && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Veículo: <span className="font-medium">{selectedMoto.marca} {selectedMoto.modelo}</span>
                  </p>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Problema Relatado pelo Cliente *
                    </label>
                    <textarea
                      value={descricaoProblema}
                      onChange={(e) => setDescricaoProblema(e.target.value)}
                      placeholder="Ex: Moto não liga, barulho no motor, freio com problema..."
                      rows={4}
                      className="w-full px-4 py-3 text-base rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Prioridade
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'baixa', label: 'Baixa' },
                        { value: 'media', label: 'Média' },
                        { value: 'alta', label: 'Alta' },
                        { value: 'urgente', label: 'Urgente' }
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => setPrioridade(value as any)}
                          className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                            prioridade === value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Serviços Sugeridos */}
                  <div>
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center justify-between w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Serviços (opcional)
                      </span>
                      {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {showAdvanced && (
                      <div className="mt-3 space-y-3">
                        <Input
                          placeholder="Buscar serviço..."
                          value={buscaServico}
                          onChange={(e) => setBuscaServico(e.target.value)}
                        />
                        
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {servicosFiltrados.slice(0, 10).map(servico => {
                            const isSelected = servicosPrincipais.includes(servico.id);
                            return (
                              <button
                                key={servico.id}
                                onClick={() => toggleServico(servico.id)}
                                className={`w-full p-3 rounded-lg border text-left transition-all ${
                                  isSelected
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                      {servico.nome}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                      R$ {servico.preco.toFixed(2)}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <Check size={18} className="text-blue-600 flex-shrink-0 ml-2" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Previsão de Entrega (opcional)
                    </label>
                    <Input
                      type="date"
                      value={dataPrevisao}
                      onChange={(e) => setDataPrevisao(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Observações (opcional)
                    </label>
                    <textarea
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Informações adicionais..."
                      rows={3}
                      className="w-full px-4 py-3 text-base rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Confirmação */}
          {currentStep === 'confirmacao' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Confirme os Dados
              </h3>

              <Card variant="elevated">
                <CardBody className="p-4 space-y-4">
                  {/* Cliente */}
                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                      <User size={16} />
                      <span className="font-medium">Cliente</span>
                    </div>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {selectedCliente?.nome}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {selectedCliente?.telefone}
                    </p>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                      <Bike size={16} />
                      <span className="font-medium">Veículo</span>
                    </div>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {selectedMoto?.marca} {selectedMoto?.modelo}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="neutral">{selectedMoto?.placa}</Badge>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {selectedMoto?.ano}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                      <Wrench size={16} />
                      <span className="font-medium">Problema</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {descricaoProblema}
                    </p>
                  </div>

                  {servicosPrincipais.length > 0 && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                        <FileText size={16} />
                        <span className="font-medium">Serviços</span>
                      </div>
                      <div className="space-y-2">
                        {servicosPrincipais.map(servicoId => {
                          const servico = servicos.find(s => s.id === servicoId);
                          if (!servico) return null;
                          return (
                            <div key={servicoId} className="flex items-center justify-between text-sm">
                              <span className="text-slate-700 dark:text-slate-300">{servico.nome}</span>
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                R$ {servico.preco.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {dataPrevisao && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                        Previsão de Entrega
                      </div>
                      <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {new Date(dataPrevisao + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      Prioridade
                    </div>
                    <Badge variant={
                      prioridade === 'urgente' ? 'error' :
                      prioridade === 'alta' ? 'warning' :
                      prioridade === 'media' ? 'info' : 'neutral'
                    }>
                      {prioridade.charAt(0).toUpperCase() + prioridade.slice(1)}
                    </Badge>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 sticky bottom-0">
          <div className="flex items-center gap-3">
            {currentStep !== 'cliente' && (
              <Button
                variant="secondary"
                onClick={handleBack}
                leftIcon={<ChevronLeft size={18} />}
                className="flex-shrink-0"
              >
                Voltar
              </Button>
            )}
            
            {currentStep === 'confirmacao' ? (
              <Button
                variant="primary"
                onClick={handleSubmit}
                leftIcon={<Check size={18} />}
                className="flex-1 py-4 text-base font-semibold"
                disabled={!canProceed()}
              >
                Salvar Ordem
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleNext}
                rightIcon={<ChevronRight size={18} />}
                className="flex-1 py-4 text-base font-semibold"
                disabled={!canProceed()}
              >
                Continuar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modais */}
      <ClienteForm
        isOpen={showClienteForm}
        onClose={() => setShowClienteForm(false)}
        onSave={handleSaveCliente}
      />

      {clienteId && (
        <MotoForm
          clienteId={clienteId}
          isOpen={showMotoForm}
          onClose={() => setShowMotoForm(false)}
          onSave={handleSaveMoto}
        />
      )}
    </div>
  );
}
