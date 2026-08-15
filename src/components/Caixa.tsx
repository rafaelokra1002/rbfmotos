import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Calendar,
  CreditCard,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  X,
  Edit,
  Trash2,
  Filter,
  Download,
  Search,
  CheckCircle,
  Wrench
} from 'lucide-react';

interface MovimentacaoCaixa {
  id: string;
  tipo: 'entrada' | 'saida';
  categoria: string;
  descricao: string;
  valor: number;
  formaPagamento: string;
  data: string;
  ordemServicoId?: string;
  observacoes?: string;
  criadoEm: string;
}

interface CaixaProps {
  // Props opcionais para integração futura
}

export function Caixa({}: CaixaProps) {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoCaixa[]>([]);
  const [ordensAbertas, setOrdensAbertas] = useState<any[]>([]);
  const [todasOrdens, setTodasOrdens] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showFinalizarOS, setShowFinalizarOS] = useState(false);
  const [showFecharMes, setShowFecharMes] = useState(false);
  const [showVendaAvulsa, setShowVendaAvulsa] = useState(false);
  const [numeroOSBusca, setNumeroOSBusca] = useState('');
  const [editando, setEditando] = useState<MovimentacaoCaixa | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'entrada' | 'saida'>('todos');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [busca, setBusca] = useState('');

  // Estado para venda avulsa
  const [vendaAvulsa, setVendaAvulsa] = useState({
    formaPagamento: 'dinheiro',
    observacoes: ''
  });

  // Itens da venda avulsa (peças, serviços ou itens avulsos)
  interface ItemVenda {
    id: string;
    nome: string;
    tipo: 'peca' | 'servico' | 'avulso';
    preco: number;
    quantidade: number;
  }
  const [itensVenda, setItensVenda] = useState<ItemVenda[]>([]);
  const [buscaItem, setBuscaItem] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [pecas, setPecas] = useState<any[]>([]);
  const [servicos, setServicos] = useState<any[]>([]);
  
  // Estado para item avulso manual
  const [itemAvulso, setItemAvulso] = useState({
    nome: '',
    preco: '',
    tipo: 'avulso' as 'peca' | 'servico' | 'avulso'
  });
  const [showItemAvulso, setShowItemAvulso] = useState(false);

  const [formData, setFormData] = useState({
    tipo: 'entrada' as 'entrada' | 'saida',
    categoria: '',
    descricao: '',
    valor: '',
    formaPagamento: 'dinheiro',
    data: new Date().toISOString().split('T')[0],
    ordemServicoId: '',
    observacoes: ''
  });

  const [periodoSelecionado, setPeriodoSelecionado] = useState<'dia' | 'semana' | 'mes'>('mes');

  // Categorias pré-definidas
  const categoriasEntrada = [
    'Venda de Serviço',
    'Venda de Peça',
    'Recebimento de Cliente',
    'Outras Entradas'
  ];

  const categoriasSaida = [
    'Compra de Peças',
    'Salários',
    'Aluguel',
    'Energia Elétrica',
    'Água',
    'Internet',
    'Manutenção',
    'Impostos',
    'Marketing',
    'Outras Despesas'
  ];

  const formasPagamento = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'pix', label: 'PIX' },
    { value: 'cartao_debito', label: 'Cartão Débito' },
    { value: 'cartao_credito', label: 'Cartão Crédito' },
    { value: 'transferencia', label: 'Transferência' }
  ];

  useEffect(() => {
    carregarMovimentacoes();
    carregarOrdensAbertas();
    carregarPecasServicos();
  }, []);

  const carregarPecasServicos = async () => {
    try {
      const [resPecas, resServicos] = await Promise.all([
        fetch('/api/pecas'),
        fetch('/api/servicos')
      ]);
      if (resPecas.ok) {
        const dataPecas = await resPecas.json();
        setPecas(dataPecas);
      }
      if (resServicos.ok) {
        const dataServicos = await resServicos.json();
        setServicos(dataServicos);
      }
    } catch (error) {
      console.error('Erro ao carregar peças/serviços:', error);
    }
  };

  const carregarMovimentacoes = async () => {
    try {
      const response = await fetch('/api/caixa');
      if (response.ok) {
        const data = await response.json();
        setMovimentacoes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
    }
  };

  const carregarOrdensAbertas = async () => {
    try {
      const response = await fetch('/api/ordens-servico');
      if (response.ok) {
        const data = await response.json();
        setTodasOrdens(data); // Guardar todas as ordens
        // Filtrar apenas ordens em andamento ou aguardando peça (prontas para finalizar)
        const abertas = data.filter((os: any) => 
          os.status === 'em_andamento' || os.status === 'aguardando_peca'
        );
        setOrdensAbertas(abertas);
      }
    } catch (error) {
      console.error('Erro ao carregar ordens abertas:', error);
    }
  };

  const handleSalvar = async () => {
    try {
      const dados = {
        ...formData,
        valor: parseFloat(formData.valor)
      };

      const url = editando 
        ? `/api/caixa/${editando.id}`
        : '/api/caixa';

      const response = await fetch(url, {
        method: editando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      if (response.ok) {
        await carregarMovimentacoes();
        resetForm();
        setShowForm(false);
      }
    } catch (error) {
      console.error('Erro ao salvar movimentação:', error);
    }
  };

  const handleExcluir = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta movimentação?')) return;

    try {
      const response = await fetch(`/api/caixa/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await carregarMovimentacoes();
      }
    } catch (error) {
      console.error('Erro ao excluir movimentação:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 'entrada',
      categoria: '',
      descricao: '',
      valor: '',
      formaPagamento: 'dinheiro',
      data: new Date().toISOString().split('T')[0],
      ordemServicoId: '',
      observacoes: ''
    });
    setEditando(null);
  };

  const resetVendaAvulsa = () => {
    setVendaAvulsa({
      formaPagamento: 'dinheiro',
      observacoes: ''
    });
    setItensVenda([]);
    setBuscaItem('');
    setShowDropdown(false);
    setShowItemAvulso(false);
    setItemAvulso({ nome: '', preco: '', tipo: 'avulso' });
  };

  const handleVendaAvulsa = async () => {
    if (itensVenda.length === 0) {
      alert('Adicione pelo menos um item à venda');
      return;
    }

    const valorTotal = itensVenda.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    const descricaoItens = itensVenda.map(item => 
      `${item.nome} (${item.quantidade}x R$ ${item.preco.toFixed(2)})`
    ).join(', ');

    // Determinar categoria baseada nos itens
    const temServico = itensVenda.some(i => i.tipo === 'servico');
    const temPeca = itensVenda.some(i => i.tipo === 'peca');
    let categoria = 'Outros';
    if (temServico && temPeca) categoria = 'Serviços';
    else if (temServico) categoria = 'Serviços';
    else if (temPeca) categoria = 'Peças';

    try {
      // 1. Dar baixa no estoque das peças e adicionar à lista de pedidos
      const pecasVendidas = itensVenda.filter(item => item.tipo === 'peca');
      for (const itemVenda of pecasVendidas) {
        // Extrair o ID real da peça (formato: p-{pecaId}-{timestamp})
        const pecaIdMatch = itemVenda.id.match(/^p-(.+?)-\d+$/);
        if (pecaIdMatch) {
          const pecaId = pecaIdMatch[1];
          // Buscar a peça atual para pegar o estoque
          const pecaAtual = pecas.find(p => p.id === pecaId);
          if (pecaAtual && pecaAtual.estoque !== undefined) {
            const novoEstoque = Math.max(0, pecaAtual.estoque - itemVenda.quantidade);
            // Atualizar estoque
            await fetch(`/api/pecas/${pecaId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ estoque: novoEstoque })
            });

            // Adicionar à lista de pedidos para reposição
            await fetch('/api/pedidos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                nome: itemVenda.nome,
                quantidade: itemVenda.quantidade,
                precoEstimado: itemVenda.preco,
                categoria: 'Peça',
                urgencia: novoEstoque <= 0 ? 'alta' : 'normal',
                origem: 'venda_avulsa',
                pecaId: pecaId,
                observacoes: `Vendido em ${new Date().toLocaleDateString('pt-BR')} - Estoque restante: ${novoEstoque}`
              })
            });
          }
        } else if (itemVenda.tipo === 'peca') {
          // Peça avulsa (não cadastrada) - adicionar à lista de pedidos
          await fetch('/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nome: itemVenda.nome,
              quantidade: itemVenda.quantidade,
              precoEstimado: itemVenda.preco,
              categoria: 'Peça',
              urgencia: 'normal',
              origem: 'venda_avulsa',
              observacoes: `Item avulso vendido em ${new Date().toLocaleDateString('pt-BR')}`
            })
          });
        }
      }

      // Adicionar itens avulsos à lista de pedidos também
      const itensAvulsos = itensVenda.filter(item => item.tipo === 'avulso');
      for (const itemAvulso of itensAvulsos) {
        await fetch('/api/pedidos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: itemAvulso.nome,
            quantidade: itemAvulso.quantidade,
            precoEstimado: itemAvulso.preco,
            categoria: 'Outros',
            urgencia: 'normal',
            origem: 'venda_avulsa',
            observacoes: `Item avulso vendido em ${new Date().toLocaleDateString('pt-BR')}`
          })
        });
      }

      // 2. Registrar a venda no caixa
      const dados = {
        tipo: 'entrada',
        categoria: categoria,
        descricao: `Venda Avulsa: ${descricaoItens}`,
        valor: valorTotal,
        formaPagamento: vendaAvulsa.formaPagamento,
        data: new Date().toISOString(),
        observacoes: vendaAvulsa.observacoes || 'Venda avulsa (sem OS)'
      };

      const response = await fetch('/api/caixa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      if (response.ok) {
        await carregarMovimentacoes();
        await carregarPecasServicos(); // Recarregar peças para atualizar estoque na tela
        resetVendaAvulsa();
        setShowVendaAvulsa(false);
        alert('✅ Venda registrada com sucesso!\n📋 Itens adicionados à Lista de Pedidos');
      } else {
        const error = await response.json();
        alert('Erro ao registrar venda: ' + (error.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao registrar venda avulsa:', error);
      alert('Erro ao registrar venda: ' + error);
    }
  };

  const handleFinalizarOS = async (ordem: any, formaPagamento: string) => {
    try {
      console.log('Iniciando finalização da OS:', ordem.numero);
      
      // 1. Atualizar status da OS para 'pronta' e definir dataConclusao
      const updateResponse = await fetch(`/api/ordens-servico/${ordem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'pronta',
          dataConclusao: new Date().toISOString(),
          valorPago: ordem.valorTotal,
          formaPagamento: formaPagamento
        })
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('Erro ao atualizar OS:', errorText);
        alert('Erro ao atualizar ordem de serviço');
        return;
      }

      console.log('OS atualizada com sucesso');

      // 2. Registrar entrada no caixa
      const movimentacaoData = {
        tipo: 'entrada',
        categoria: 'Venda de Serviço',
        descricao: `OS #${ordem.numero} - ${ordem.descricaoProblema}`,
        valor: ordem.valorTotal,
        formaPagamento: formaPagamento,
        data: new Date().toISOString(),
        ordemServicoId: ordem.id,
        observacoes: `Finalização da OS #${ordem.numero}`
      };
      
      console.log('Dados da movimentação:', movimentacaoData);
      
      const movimentacaoResponse = await fetch('/api/caixa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movimentacaoData)
      });

      if (!movimentacaoResponse.ok) {
        const errorData = await movimentacaoResponse.json();
        console.error('Erro ao registrar movimentação:', errorData);
        alert(`Erro ao registrar entrada no caixa:\n${errorData.details || errorData.error}\n\n⚠️ Verifique se a tabela 'movimentacoes_caixa' existe no banco de dados.`);
        return;
      }

      const movimentacaoCriada = await movimentacaoResponse.json();
      console.log('Movimentação criada:', movimentacaoCriada);
      
      await carregarMovimentacoes();
      await carregarOrdensAbertas();
      setShowFinalizarOS(false);
      alert('Ordem de serviço finalizada e entrada registrada no caixa!');
    } catch (error) {
      console.error('Erro ao finalizar OS:', error);
      alert('Erro ao finalizar ordem de serviço: ' + error);
    }
  };

  const handleFecharMes = async () => {
    try {
      const confirmacao = window.confirm(
        '⚠️ ATENÇÃO!\n\n' +
        'Esta ação irá:\n' +
        '• Criar um resumo do mês atual\n' +
        '• EXCLUIR todas as movimentações do mês\n' +
        '• Zerar os valores para o próximo mês\n\n' +
        'Deseja realmente fechar o mês?'
      );

      if (!confirmacao) return;

      // Obter movimentações do mês atual
      const hoje = new Date();
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

      const movimentacoesMes = movimentacoes.filter(m => {
        const dataMovimentacao = new Date(m.data);
        return dataMovimentacao >= primeiroDiaMes && dataMovimentacao <= ultimoDiaMes;
      });

      if (movimentacoesMes.length === 0) {
        alert('Não há movimentações no mês atual para fechar.');
        return;
      }

      // Calcular totais
      const totalEntradas = movimentacoesMes
        .filter(m => m.tipo === 'entrada')
        .reduce((sum, m) => sum + m.valor, 0);
      
      const totalSaidas = movimentacoesMes
        .filter(m => m.tipo === 'saida')
        .reduce((sum, m) => sum + m.valor, 0);
      
      const saldo = totalEntradas - totalSaidas;

      // Criar registro de resumo do mês
      const mesAno = `${hoje.toLocaleString('pt-BR', { month: 'long' })}/${hoje.getFullYear()}`;
      
      const resumoResponse = await fetch('/api/caixa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: saldo >= 0 ? 'entrada' : 'saida',
          categoria: 'Fechamento de Mês',
          descricao: `Resumo de ${mesAno}`,
          valor: Math.abs(saldo),
          formaPagamento: 'resumo',
          data: ultimoDiaMes.toISOString(),
          observacoes: `Total Entradas: R$ ${totalEntradas.toFixed(2)} | Total Saídas: R$ ${totalSaidas.toFixed(2)} | Saldo: R$ ${saldo.toFixed(2)} | ${movimentacoesMes.length} movimentações`
        })
      });

      if (!resumoResponse.ok) {
        throw new Error('Erro ao criar resumo do mês');
      }

      // Excluir todas as movimentações do mês (exceto o resumo)
      for (const mov of movimentacoesMes) {
        await fetch(`/api/caixa/${mov.id}`, {
          method: 'DELETE'
        });
      }

      await carregarMovimentacoes();
      setShowFecharMes(false);
      
      alert(
        `✅ Mês fechado com sucesso!\n\n` +
        `📊 Resumo de ${mesAno}:\n` +
        `💰 Entradas: R$ ${totalEntradas.toFixed(2)}\n` +
        `💸 Saídas: R$ ${totalSaidas.toFixed(2)}\n` +
        `📈 Saldo: R$ ${saldo.toFixed(2)}\n\n` +
        `${movimentacoesMes.length} movimentações foram arquivadas.`
      );
    } catch (error) {
      console.error('Erro ao fechar mês:', error);
      alert('Erro ao fechar o mês: ' + error);
    }
  };

  const handleMigrarOrdens = async () => {
    try {
      const confirmacao = window.confirm(
        '🔄 Migrar Ordens Finalizadas para o Caixa\n\n' +
        'Esta ação irá:\n' +
        '• Buscar todas as ordens com status "pronta" ou "entregue"\n' +
        '• Criar movimentações de entrada no caixa para cada uma\n' +
        '• Pular ordens que já têm movimentação registrada\n\n' +
        'Deseja continuar?'
      );

      if (!confirmacao) return;

      console.log('Iniciando migração...');
      
      const response = await fetch('/api/caixa/migrar-ordens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensagem || 'Erro ao migrar ordens');
      }

      const resultado = await response.json();
      console.log('Resultado da migração:', resultado);

      await carregarMovimentacoes();

      alert(
        `✅ Migração concluída!\n\n` +
        `📊 Resumo:\n` +
        `• Total de ordens: ${resultado.resumo.total}\n` +
        `• Migradas: ${resultado.resumo.migradas}\n` +
        `• Já existentes: ${resultado.resumo.jaMigradas}\n` +
        `• Erros: ${resultado.resumo.erros}\n\n` +
        `Recarregue a página para ver os valores atualizados no Dashboard.`
      );

    } catch (error) {
      console.error('Erro ao migrar ordens:', error);
      alert('Erro ao migrar ordens: ' + error);
    }
  };

  const buscarOSPorNumero = async () => {
    if (!numeroOSBusca.trim()) {
      alert('Digite o número da OS');
      return;
    }

    const ordemEncontrada = todasOrdens.find(os => os.numero === numeroOSBusca.trim());
    
    if (!ordemEncontrada) {
      alert('Ordem de serviço não encontrada');
      return;
    }

    if (ordemEncontrada.status === 'pronta' || ordemEncontrada.status === 'entregue') {
      alert('Esta ordem de serviço já está finalizada');
      return;
    }

    if (ordemEncontrada.status === 'cancelada') {
      alert('Esta ordem de serviço está cancelada');
      return;
    }

    // Adicionar temporariamente à lista de ordens abertas se não estiver
    if (!ordensAbertas.find(os => os.id === ordemEncontrada.id)) {
      setOrdensAbertas([ordemEncontrada, ...ordensAbertas]);
    }

    setNumeroOSBusca('');
  };

  const handleEditar = (mov: MovimentacaoCaixa) => {
    setEditando(mov);
    setFormData({
      tipo: mov.tipo,
      categoria: mov.categoria,
      descricao: mov.descricao,
      valor: mov.valor.toString(),
      formaPagamento: mov.formaPagamento,
      data: mov.data.split('T')[0],
      ordemServicoId: mov.ordemServicoId || '',
      observacoes: mov.observacoes || ''
    });
    setShowForm(true);
  };

  // Filtrar movimentações
  const movimentacoesFiltradas = movimentacoes.filter(mov => {
    const matchTipo = filtroTipo === 'todos' || mov.tipo === filtroTipo;
    const matchBusca = !busca || 
      mov.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      mov.categoria.toLowerCase().includes(busca.toLowerCase());
    
    const dataMovimentacao = new Date(mov.data);
    const matchDataInicio = !filtroDataInicio || dataMovimentacao >= new Date(filtroDataInicio);
    const matchDataFim = !filtroDataFim || dataMovimentacao <= new Date(filtroDataFim);

    return matchTipo && matchBusca && matchDataInicio && matchDataFim;
  });

  // Funções auxiliares para calcular períodos
  const getInicioDia = () => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0);
  };

  const getInicioSemana = () => {
    const hoje = new Date();
    const diaSemana = hoje.getDay();
    const diff = hoje.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1); // Segunda-feira
    return new Date(hoje.getFullYear(), hoje.getMonth(), diff, 0, 0, 0);
  };

  const getInicioMes = () => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1, 0, 0, 0);
  };

  // Filtrar movimentações por período
  const filtrarPorPeriodo = (dataInicio: Date) => {
    const agora = new Date();
    return movimentacoes.filter(m => {
      const dataM = new Date(m.data);
      return dataM >= dataInicio && dataM <= agora;
    });
  };

  // Calcular totais por período
  const calcularTotais = (movs: MovimentacaoCaixa[]) => {
    const entradas = movs.filter(m => m.tipo === 'entrada').reduce((sum, m) => sum + m.valor, 0);
    const saidas = movs.filter(m => m.tipo === 'saida').reduce((sum, m) => sum + m.valor, 0);
    return { entradas, saidas, saldo: entradas - saidas };
  };

  // Totais por período
  const totaisDia = calcularTotais(filtrarPorPeriodo(getInicioDia()));
  const totaisSemana = calcularTotais(filtrarPorPeriodo(getInicioSemana()));
  const totaisMes = calcularTotais(filtrarPorPeriodo(getInicioMes()));

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
            <Wallet className="text-amber-400" size={32} />
            Controle de Caixa
          </h1>
          <p className="text-slate-400 mt-1">
            Gerencie entradas e saídas financeiras
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => {
              resetVendaAvulsa();
              setShowVendaAvulsa(true);
            }}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition-all"
            title="Registrar venda sem ordem de serviço"
          >
            <DollarSign size={20} />
            Venda Avulsa
          </button>
          <button
            onClick={handleMigrarOrdens}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition-all"
            title="Importar ordens finalizadas antigas para o caixa"
          >
            <Download size={20} />
            Migrar Ordens
          </button>
          <button
            onClick={() => setShowFecharMes(true)}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition-all"
          >
            <Calendar size={20} />
            Fechar Mês
          </button>
          <button
            onClick={() => {
              setShowFinalizarOS(true);
              setNumeroOSBusca('');
            }}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition-all"
          >
            <CheckCircle size={20} />
            Finalizar OS
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-900 rounded-xl font-semibold shadow-lg shadow-amber-500/30 hover:scale-105 transition-all"
          >
            <Plus size={20} />
            Nova Movimentação
          </button>
        </div>
      </div>

      {/* Seletor de Período + Cards de Resumo */}
      <div className="space-y-4">
        {/* Tabs de Período */}
        <div className="flex gap-2 bg-slate-800 p-1 rounded-xl w-fit border border-slate-700/50">
          <button
            onClick={() => setPeriodoSelecionado('dia')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              periodoSelecionado === 'dia'
                ? 'bg-amber-500 text-slate-900 shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setPeriodoSelecionado('semana')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              periodoSelecionado === 'semana'
                ? 'bg-amber-500 text-slate-900 shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setPeriodoSelecionado('mes')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              periodoSelecionado === 'mes'
                ? 'bg-amber-500 text-slate-900 shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            Mês
          </button>
        </div>

        {/* Cards de Resumo por Período */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Entradas */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <ArrowUpCircle size={24} />
              </div>
              <TrendingUp size={32} className="opacity-50" />
            </div>
            <p className="text-green-100 text-sm font-medium mb-1">
              Entradas {periodoSelecionado === 'dia' ? 'Hoje' : periodoSelecionado === 'semana' ? 'da Semana' : 'do Mês'}
            </p>
            <p className="text-3xl font-bold">
              R$ {(periodoSelecionado === 'dia' ? totaisDia.entradas : periodoSelecionado === 'semana' ? totaisSemana.entradas : totaisMes.entradas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Total Saídas */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <ArrowDownCircle size={24} />
              </div>
              <TrendingDown size={32} className="opacity-50" />
            </div>
            <p className="text-red-100 text-sm font-medium mb-1">
              Saídas {periodoSelecionado === 'dia' ? 'Hoje' : periodoSelecionado === 'semana' ? 'da Semana' : 'do Mês'}
            </p>
            <p className="text-3xl font-bold">
              R$ {(periodoSelecionado === 'dia' ? totaisDia.saidas : periodoSelecionado === 'semana' ? totaisSemana.saidas : totaisMes.saidas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Saldo */}
          {(() => {
            const saldoPeriodo = periodoSelecionado === 'dia' ? totaisDia.saldo : periodoSelecionado === 'semana' ? totaisSemana.saldo : totaisMes.saldo;
            return (
              <div className={`bg-gradient-to-br ${saldoPeriodo >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-xl p-6 text-white shadow-lg hover:scale-105 transition-transform`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <DollarSign size={24} />
                  </div>
                  <Wallet size={32} className="opacity-50" />
                </div>
                <p className="text-blue-100 text-sm font-medium mb-1">
                  Saldo {periodoSelecionado === 'dia' ? 'Hoje' : periodoSelecionado === 'semana' ? 'da Semana' : 'do Mês'}
                </p>
                <p className="text-3xl font-bold">
                  {saldoPeriodo < 0 ? '-' : ''} R$ {Math.abs(saldoPeriodo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" size={20} />
            <input
              type="text"
              placeholder="Buscar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 bg-slate-900 text-slate-100 placeholder-slate-500 transition-all"
            />
          </div>

          {/* Filtro Tipo */}
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as any)}
            className="px-4 py-2 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 bg-slate-900 text-slate-100 appearance-none cursor-pointer transition-all"
          >
            <option value="todos">Todos</option>
            <option value="entrada">Entradas</option>
            <option value="saida">Saídas</option>
          </select>

          {/* Data Início */}
          <input
            type="date"
            value={filtroDataInicio}
            onChange={(e) => setFiltroDataInicio(e.target.value)}
            className="px-4 py-2 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 bg-slate-900 text-slate-100 transition-all"
          />

          {/* Data Fim */}
          <input
            type="date"
            value={filtroDataFim}
            onChange={(e) => setFiltroDataFim(e.target.value)}
            className="px-4 py-2 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 bg-slate-900 text-slate-100 transition-all"
          />
        </div>
      </div>

      {/* Lista de Movimentações */}
      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Forma Pgto
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {movimentacoesFiltradas.map((mov) => (
                <tr key={mov.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {new Date(mov.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      mov.tipo === 'entrada' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {mov.tipo === 'entrada' ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                      {mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                    {mov.categoria}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                    {mov.descricao}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                    {formasPagamento.find(f => f.value === mov.formaPagamento)?.label || mov.formaPagamento}
                  </td>
                  <td className={`px-6 py-4 text-right text-sm font-semibold ${
                    mov.tipo === 'entrada' 
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {mov.tipo === 'entrada' ? '+' : '-'} R$ {mov.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditar(mov)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleExcluir(mov.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {movimentacoesFiltradas.length === 0 && (
            <div className="text-center py-12">
              <Wallet className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">Nenhuma movimentação encontrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editando ? 'Editar Movimentação' : 'Nova Movimentação'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Tipo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tipo *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tipo: 'entrada', categoria: '' }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.tipo === 'entrada'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                    }`}
                  >
                    <ArrowUpCircle className="mx-auto mb-2" size={32} />
                    <span className="font-semibold">Entrada</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tipo: 'saida', categoria: '' }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.tipo === 'saida'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-red-300'
                    }`}
                  >
                    <ArrowDownCircle className="mx-auto mb-2" size={32} />
                    <span className="font-semibold">Saída</span>
                  </button>
                </div>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-white"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {(formData.tipo === 'entrada' ? categoriasEntrada : categoriasSaida).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Descrição e Valor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Valor *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Forma Pagamento e Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Forma de Pagamento *
                  </label>
                  <select
                    value={formData.formaPagamento}
                    onChange={(e) => setFormData(prev => ({ ...prev, formaPagamento: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-white"
                  >
                    {formasPagamento.map(forma => (
                      <option key={forma.value} value={forma.value}>{forma.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-white"
                  rows={3}
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={handleSalvar}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-xl font-semibold shadow-lg transition-all"
                >
                  {editando ? 'Atualizar' : 'Salvar'}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Finalizar OS */}
      {showFinalizarOS && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="text-green-500" size={28} />
                Finalizar Ordem de Serviço
              </h2>
              <button
                onClick={() => {
                  setShowFinalizarOS(false);
                  setNumeroOSBusca('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Campo de busca por número de OS */}
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Buscar OS por Número
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={numeroOSBusca}
                    onChange={(e) => setNumeroOSBusca(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && buscarOSPorNumero()}
                    placeholder="Digite o número da OS (ex: 001)"
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    onClick={buscarOSPorNumero}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-xl font-semibold shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <Search size={20} />
                    Buscar
                  </button>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Digite o número exato da OS para buscá-la, mesmo que não esteja em andamento
                </p>
              </div>

              {ordensAbertas.length === 0 ? (
                <div className="text-center py-12">
                  <Wrench className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Nenhuma ordem de serviço em andamento
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                    Use a busca acima para encontrar uma OS específica
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Ordens de serviço disponíveis para finalização:
                  </p>
                  {ordensAbertas.map((ordem) => (
                    <FinalizarOSCard
                      key={ordem.id}
                      ordem={ordem}
                      onFinalizar={handleFinalizarOS}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Fechar Mês */}
      {showFecharMes && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="bg-purple-500 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Calendar size={28} />
                Fechar Mês
              </h2>
              <button
                onClick={() => setShowFecharMes(false)}
                className="p-2 hover:bg-purple-600 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-6 mb-6">
                <div className="flex gap-3">
                  <div className="text-yellow-600 dark:text-yellow-400 flex-shrink-0">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-yellow-800 dark:text-yellow-300 mb-2">
                      ⚠️ Atenção! Esta ação é irreversível
                    </h3>
                    <p className="text-yellow-700 dark:text-yellow-400 text-sm space-y-1">
                      Ao fechar o mês, o sistema irá:
                    </p>
                    <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-400 text-sm mt-2 space-y-1">
                      <li>Criar um registro de resumo do mês com totais de entradas e saídas</li>
                      <li>Excluir todas as movimentações individuais do mês atual</li>
                      <li>Zerar os valores para iniciar o próximo mês</li>
                    </ul>
                  </div>
                </div>
              </div>

              {(() => {
                const hoje = new Date();
                const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
                
                const movimentacoesMes = movimentacoes.filter(m => {
                  const dataMovimentacao = new Date(m.data);
                  return dataMovimentacao >= primeiroDiaMes && dataMovimentacao <= ultimoDiaMes;
                });

                const totalEntradas = movimentacoesMes
                  .filter(m => m.tipo === 'entrada')
                  .reduce((sum, m) => sum + m.valor, 0);
                
                const totalSaidas = movimentacoesMes
                  .filter(m => m.tipo === 'saida')
                  .reduce((sum, m) => sum + m.valor, 0);
                
                const saldo = totalEntradas - totalSaidas;
                const mesAno = hoje.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

                return (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mb-6">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
                      📊 Resumo de {mesAno}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-green-600 dark:text-green-400 text-sm font-medium mb-1">
                          💰 Total Entradas
                        </div>
                        <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                          R$ {totalEntradas.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="text-red-600 dark:text-red-400 text-sm font-medium mb-1">
                          💸 Total Saídas
                        </div>
                        <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                          R$ {totalSaidas.toFixed(2)}
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg border ${
                        saldo >= 0 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                          : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                      }`}>
                        <div className={`text-sm font-medium mb-1 ${
                          saldo >= 0 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-orange-600 dark:text-orange-400'
                        }`}>
                          📈 Saldo
                        </div>
                        <div className={`text-2xl font-bold ${
                          saldo >= 0 
                            ? 'text-blue-700 dark:text-blue-300' 
                            : 'text-orange-700 dark:text-orange-300'
                        }`}>
                          R$ {saldo.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-center text-gray-600 dark:text-gray-400 text-sm">
                      {movimentacoesMes.length} movimentações serão arquivadas
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowFecharMes(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleFecharMes}
                  className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors"
                >
                  Confirmar Fechamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Venda Avulsa */}
      {showVendaAvulsa && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center sticky top-0">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <DollarSign size={28} />
                Venda Avulsa
              </h2>
              <button
                onClick={() => {
                  setShowVendaAvulsa(false);
                  resetVendaAvulsa();
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Busque itens do cadastro ou adicione itens avulsos para registrar uma venda rápida.
              </p>

              {/* Busca de Itens */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Buscar Peça ou Serviço
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={buscaItem}
                    onChange={(e) => {
                      setBuscaItem(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Digite para buscar..."
                    className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  {buscaItem && (
                    <button
                      type="button"
                      onClick={() => {
                        setBuscaItem('');
                        setShowDropdown(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* Dropdown de resultados */}
                {showDropdown && buscaItem && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {/* Serviços */}
                    {servicos
                      .filter(s => s.nome.toLowerCase().includes(buscaItem.toLowerCase()))
                      .slice(0, 5)
                      .map(servico => (
                        <button
                          key={`s-${servico.id}`}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            const novoItem = {
                              id: `s-${servico.id}-${Date.now()}`,
                              nome: servico.nome,
                              tipo: 'servico' as const,
                              preco: servico.preco || 0,
                              quantidade: 1
                            };
                            setItensVenda([...itensVenda, novoItem]);
                            setBuscaItem('');
                            setShowDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-emerald-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded mr-2">Serviço</span>
                              <span className="font-medium text-gray-900 dark:text-white">{servico.nome}</span>
                            </div>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              R$ {servico.preco?.toFixed(2) || '0,00'}
                            </span>
                          </div>
                        </button>
                      ))}
                    
                    {/* Peças */}
                    {pecas
                      .filter(p => p.nome.toLowerCase().includes(buscaItem.toLowerCase()) || p.codigo?.toLowerCase().includes(buscaItem.toLowerCase()))
                      .slice(0, 5)
                      .map(peca => (
                        <button
                          key={`p-${peca.id}`}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            const novoItem = {
                              id: `p-${peca.id}-${Date.now()}`,
                              nome: peca.nome,
                              tipo: 'peca' as const,
                              preco: peca.preco || 0,
                              quantidade: 1
                            };
                            setItensVenda([...itensVenda, novoItem]);
                            setBuscaItem('');
                            setShowDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-emerald-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="inline-block px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded mr-2">Peça</span>
                              <span className="font-medium text-gray-900 dark:text-white">{peca.nome}</span>
                              {peca.codigo && <span className="text-xs text-gray-500 ml-2">#{peca.codigo}</span>}
                            </div>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              R$ {peca.preco?.toFixed(2) || '0,00'}
                            </span>
                          </div>
                        </button>
                      ))}

                    {/* Nenhum resultado + opção de adicionar avulso */}
                    {servicos.filter(s => s.nome.toLowerCase().includes(buscaItem.toLowerCase())).length === 0 &&
                     pecas.filter(p => p.nome.toLowerCase().includes(buscaItem.toLowerCase()) || p.codigo?.toLowerCase().includes(buscaItem.toLowerCase())).length === 0 && (
                      <div className="px-4 py-3 text-center text-gray-500">
                        Nenhum item encontrado
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botão Adicionar Item Avulso */}
              <button
                type="button"
                onClick={() => setShowItemAvulso(!showItemAvulso)}
                className="w-full px-4 py-3 border-2 border-dashed border-emerald-400 dark:border-emerald-600 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Adicionar Item Avulso (não cadastrado)
              </button>

              {/* Form de Item Avulso */}
              {showItemAvulso && (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl space-y-3 border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={itemAvulso.nome}
                        onChange={(e) => setItemAvulso({ ...itemAvulso, nome: e.target.value })}
                        placeholder="Nome do item"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        value={itemAvulso.preco}
                        onChange={(e) => setItemAvulso({ ...itemAvulso, preco: e.target.value })}
                        placeholder="Preço (R$)"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={itemAvulso.tipo}
                      onChange={(e) => setItemAvulso({ ...itemAvulso, tipo: e.target.value as 'peca' | 'servico' | 'avulso' })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="avulso">Avulso</option>
                      <option value="peca">Peça</option>
                      <option value="servico">Serviço</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (!itemAvulso.nome.trim() || !itemAvulso.preco) {
                          alert('Preencha o nome e preço do item');
                          return;
                        }
                        const novoItem = {
                          id: `avulso-${Date.now()}`,
                          nome: itemAvulso.nome,
                          tipo: itemAvulso.tipo,
                          preco: parseFloat(itemAvulso.preco),
                          quantidade: 1
                        };
                        setItensVenda([...itensVenda, novoItem]);
                        setItemAvulso({ nome: '', preco: '', tipo: 'avulso' });
                        setShowItemAvulso(false);
                      }}
                      className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      Adicionar
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de Itens da Venda */}
              {itensVenda.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 font-medium text-gray-700 dark:text-gray-300">
                    Itens da Venda
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {itensVenda.map((item) => (
                      <div key={item.id} className="px-4 py-3 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <span className={`inline-block px-2 py-0.5 text-xs rounded mr-2 ${
                            item.tipo === 'servico' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' :
                            item.tipo === 'peca' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {item.tipo === 'servico' ? 'Serviço' : item.tipo === 'peca' ? 'Peça' : 'Avulso'}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">{item.nome}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (item.quantidade > 1) {
                                  setItensVenda(itensVenda.map(i => 
                                    i.id === item.id ? { ...i, quantidade: i.quantidade - 1 } : i
                                  ));
                                }
                              }}
                              className="w-7 h-7 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-medium text-gray-900 dark:text-white">{item.quantidade}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setItensVenda(itensVenda.map(i => 
                                  i.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i
                                ));
                              }}
                              className="w-7 h-7 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold w-24 text-right">
                            R$ {(item.preco * item.quantidade).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setItensVenda(itensVenda.filter(i => i.id !== item.id))}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 flex justify-between items-center">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Total:</span>
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      R$ {itensVenda.reduce((sum, item) => sum + (item.preco * item.quantidade), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Forma de Pagamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={vendaAvulsa.formaPagamento}
                  onChange={(e) => setVendaAvulsa({ ...vendaAvulsa, formaPagamento: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="dinheiro">Dinheiro</option>
                  <option value="pix">PIX</option>
                  <option value="cartao_debito">Cartão Débito</option>
                  <option value="cartao_credito">Cartão Crédito</option>
                  <option value="transferencia">Transferência</option>
                </select>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Observações
                </label>
                <textarea
                  value={vendaAvulsa.observacoes}
                  onChange={(e) => setVendaAvulsa({ ...vendaAvulsa, observacoes: e.target.value })}
                  placeholder="Observações adicionais..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white resize-none"
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowVendaAvulsa(false);
                    resetVendaAvulsa();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleVendaAvulsa}
                  disabled={itensVenda.length === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  Registrar Venda
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente auxiliar para cada card de OS
function FinalizarOSCard({ ordem, onFinalizar }: { ordem: any; onFinalizar: (ordem: any, formaPagamento: string) => void }) {
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');

  const formasPagamento = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'pix', label: 'PIX' },
    { value: 'cartao_debito', label: 'Cartão Débito' },
    { value: 'cartao_credito', label: 'Cartão Crédito' },
    { value: 'transferencia', label: 'Transferência' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_andamento': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300';
      case 'aguardando_peca': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-300';
    }
  };

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-yellow-500 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              OS #{ordem.numero}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(ordem.status)}`}>
              {ordem.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-1">
            {ordem.descricaoProblema}
          </p>
          <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Cliente: {ordem.cliente?.nome || 'N/A'}</span>
            <span>•</span>
            <span>Moto: {ordem.moto?.marca} {ordem.moto?.modelo}</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              R$ {ordem.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:min-w-[250px]">
          <select
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-white"
          >
            {formasPagamento.map(forma => (
              <option key={forma.value} value={forma.value}>{forma.label}</option>
            ))}
          </select>
          <button
            onClick={() => {
              if (confirm(`Confirma a finalização da OS #${ordem.numero} com pagamento via ${formasPagamento.find(f => f.value === formaPagamento)?.label}?`)) {
                onFinalizar(ordem, formaPagamento);
              }
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold shadow-lg transition-all hover:scale-105"
          >
            <CheckCircle size={18} />
            Finalizar e Receber
          </button>
        </div>
      </div>
    </div>
  );
}

