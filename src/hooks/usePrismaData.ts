import { useState, useEffect } from 'react';
import { Cliente, Moto, Orcamento, OrdemServico, DashboardStats } from '../types';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:9001/api'
  : `http://${window.location.hostname}:9001/api`;

export function usePrismaData() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [motos, setMotos] = useState<Moto[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadClientes(),
        loadMotos(),
        loadOrcamentos(),
        loadOrdens(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClientes = async () => {
    try {
      const response = await fetch(`${API_URL}/clientes`);
      const data = await response.json();
      setClientes(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const loadMotos = async () => {
    try {
      const response = await fetch(`${API_URL}/motos`);
      const data = await response.json();
      setMotos(data);
    } catch (error) {
      console.error('Erro ao carregar motos:', error);
    }
  };

  const loadOrcamentos = async () => {
    try {
      const response = await fetch(`${API_URL}/orcamentos`);
      const data = await response.json();
      setOrcamentos(data);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    }
  };

  const loadOrdens = async () => {
    try {
      const response = await fetch(`${API_URL}/ordens-servico`);
      const data = await response.json();
      console.log('Ordens carregadas do servidor:', data);
      // Converter fotos de JSON string para array se necessário
      const ordensProcessadas = data.map((ordem: any) => {
        console.log(`Ordem ${ordem.numero} - Itens:`, ordem.itens, 'Tipo:', typeof ordem.itens);
        return {
          ...ordem,
          fotos: typeof ordem.fotos === 'string' ? JSON.parse(ordem.fotos) : (ordem.fotos || []),
          itens: Array.isArray(ordem.itens) ? ordem.itens : []
        };
      });
      console.log('Ordens processadas:', ordensProcessadas);
      setOrdens(ordensProcessadas);
    } catch (error) {
      console.error('Erro ao carregar ordens de serviço:', error);
    }
  };

  // Funções para clientes
  const adicionarCliente = async (cliente: Omit<Cliente, 'id' | 'dataCadastro'>) => {
    try {
      const response = await fetch(`${API_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente),
      });
      const novoCliente = await response.json();
      setClientes(prev => [...prev, novoCliente]);
      return novoCliente;
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      throw error;
    }
  };

  const atualizarCliente = async (id: string, dadosAtualizados: Partial<Cliente>) => {
    try {
      await fetch(`${API_URL}/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados),
      });
      setClientes(prev => prev.map(c => c.id === id ? { ...c, ...dadosAtualizados } : c));
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  };

  const removerCliente = async (id: string) => {
    try {
      await fetch(`${API_URL}/clientes/${id}`, { method: 'DELETE' });
      setClientes(prev => prev.filter(c => c.id !== id));
      setMotos(prev => prev.filter(m => m.clienteId !== id));
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      throw error;
    }
  };

  // Funções para motos
  const adicionarMoto = async (moto: Omit<Moto, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/motos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moto),
      });
      const novaMoto = await response.json();
      setMotos(prev => [...prev, novaMoto]);
      return novaMoto;
    } catch (error) {
      console.error('Erro ao adicionar moto:', error);
      throw error;
    }
  };

  const atualizarMoto = async (id: string, dadosAtualizados: Partial<Moto>) => {
    try {
      await fetch(`${API_URL}/motos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados),
      });
      setMotos(prev => prev.map(m => m.id === id ? { ...m, ...dadosAtualizados } : m));
    } catch (error) {
      console.error('Erro ao atualizar moto:', error);
      throw error;
    }
  };

  const removerMoto = async (id: string) => {
    try {
      await fetch(`${API_URL}/motos/${id}`, { method: 'DELETE' });
      setMotos(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Erro ao remover moto:', error);
      throw error;
    }
  };

  // Funções para orçamentos
  const adicionarOrcamento = async (orcamento: Omit<Orcamento, 'id' | 'numero' | 'dataEmissao'>) => {
    try {
      const numeroOrcamento = `ORC-${String(orcamentos.length + 1).padStart(6, '0')}`;
      const response = await fetch(`${API_URL}/orcamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...orcamento, numero: numeroOrcamento }),
      });
      const novoOrcamento = await response.json();
      setOrcamentos(prev => [...prev, novoOrcamento]);
      return novoOrcamento;
    } catch (error) {
      console.error('Erro ao adicionar orçamento:', error);
      throw error;
    }
  };

  const atualizarOrcamento = async (id: string, dadosAtualizados: Partial<Orcamento>) => {
    try {
      await fetch(`${API_URL}/orcamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados),
      });
      setOrcamentos(prev => prev.map(o => o.id === id ? { ...o, ...dadosAtualizados } : o));
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      throw error;
    }
  };

  // Funções para ordens de serviço
  const adicionarOrdem = async (ordem: Omit<OrdemServico, 'id' | 'numero' | 'dataAbertura'>) => {
    try {
      const numeroOrdem = `OS-${String(ordens.length + 1).padStart(6, '0')}`;
      const response = await fetch(`${API_URL}/ordens-servico`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ordem, numero: numeroOrdem }),
      });
      const novaOrdem = await response.json();
      console.log('Nova ordem recebida do servidor:', novaOrdem);
      
      // Processar a nova ordem
      const ordemProcessada = {
        ...novaOrdem,
        fotos: typeof novaOrdem.fotos === 'string' ? JSON.parse(novaOrdem.fotos) : (novaOrdem.fotos || []),
        itens: Array.isArray(novaOrdem.itens) ? novaOrdem.itens : []
      };
      
      setOrdens(prev => [...prev, ordemProcessada]);
      return ordemProcessada;
    } catch (error) {
      console.error('Erro ao adicionar ordem de serviço:', error);
      throw error;
    }
  };

  const atualizarOrdem = async (id: string, dadosAtualizados: Partial<OrdemServico>) => {
    try {
      const response = await fetch(`${API_URL}/ordens-servico/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados),
      });
      const ordemAtualizada = await response.json();
      console.log('Ordem atualizada recebida do servidor:', ordemAtualizada);
      
      // Processar a ordem atualizada
      const ordemProcessada = {
        ...ordemAtualizada,
        fotos: typeof ordemAtualizada.fotos === 'string' ? JSON.parse(ordemAtualizada.fotos) : (ordemAtualizada.fotos || []),
        itens: Array.isArray(ordemAtualizada.itens) ? ordemAtualizada.itens : []
      };
      
      setOrdens(prev => prev.map(o => o.id === id ? ordemProcessada : o));
    } catch (error) {
      console.error('Erro ao atualizar ordem de serviço:', error);
      throw error;
    }
  };

  // Dashboard stats
  const getDashboardStats = async (): Promise<DashboardStats> => {
    try {
      const response = await fetch(`${API_URL}/dashboard/stats`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        ordensAbertas: 0,
        ordensEmAndamento: 0,
        ordensProntas: 0,
        orcamentosPendentes: 0,
        faturamentoMes: 0,
        faturamentoMesAnterior: 0,
      };
    }
  };

  return {
    clientes,
    motos,
    orcamentos,
    ordens,
    loading,
    adicionarCliente,
    atualizarCliente,
    removerCliente,
    adicionarMoto,
    atualizarMoto,
    removerMoto,
    adicionarOrcamento,
    atualizarOrcamento,
    adicionarOrdem,
    atualizarOrdem,
    getDashboardStats,
  };
}
