import { useState, useEffect } from 'react';
import { Cliente, Moto, Servico, Peca, Orcamento, OrdemServico } from '../types';
import { API_URL } from '../lib/api';

// Timeout para requisições (10 segundos)
const FETCH_TIMEOUT = 10000;

// Cache localStorage para acelerar carregamento
const CACHE_KEYS = {
  clientes: 'rbf_cache_clientes',
  motos: 'rbf_cache_motos',
  servicos: 'rbf_cache_servicos',
  pecas: 'rbf_cache_pecas',
  orcamentos: 'rbf_cache_orcamentos',
  // ordens: 'rbf_cache_ordens', // NÃO cachear ordens (muito grande)
  timestamp: 'rbf_cache_timestamp',
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Verificar se cache é válido
function isCacheValid(): boolean {
  const timestamp = localStorage.getItem(CACHE_KEYS.timestamp);
  if (!timestamp) return false;
  const age = Date.now() - parseInt(timestamp);
  return age < CACHE_DURATION;
}

// Carregar do cache
function loadFromCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn(`⚠️ Erro ao carregar cache ${key}:`, error);
    return null;
  }
}

// Salvar no cache
function saveToCache(key: string, data: any): void {
  try {
    const jsonData = JSON.stringify(data);
    // Verificar tamanho antes de salvar (limite 5MB para ser seguro)
    const sizeInMB = new Blob([jsonData]).size / (1024 * 1024);
    
    if (sizeInMB > 5) {
      console.warn(`⚠️ Cache ${key} muito grande (${sizeInMB.toFixed(2)}MB) - não salvando`);
      return;
    }
    
    localStorage.setItem(key, jsonData);
    localStorage.setItem(CACHE_KEYS.timestamp, Date.now().toString());
  } catch (error: any) {
    if (error.name === 'QuotaExceededError') {
      console.warn(`⚠️ Cache cheio - limpando cache antigo para ${key}`);
      // Limpar cache antigo e tentar novamente
      Object.values(CACHE_KEYS).forEach(k => {
        if (k !== CACHE_KEYS.timestamp && k !== key) {
          localStorage.removeItem(k);
        }
      });
      try {
        localStorage.setItem(key, JSON.stringify(data));
        localStorage.setItem(CACHE_KEYS.timestamp, Date.now().toString());
      } catch (retryError) {
        console.warn(`⚠️ Ainda não foi possível salvar cache ${key}`);
      }
    } else {
      console.warn(`⚠️ Erro ao salvar cache ${key}:`, error);
    }
  }
}

// Função helper para fetch com timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Timeout: Servidor não respondeu em 10 segundos');
    }
    throw error;
  }
}

export function useApiData() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [motos, setMotos] = useState<Moto[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [carregado, setCarregado] = useState(false);

  // Carregar dados iniciais apenas uma vez
  useEffect(() => {
    if (!carregado) {
      carregarTodosDados();
    }
  }, [carregado]);

  const carregarTodosDados = async () => {
    setLoading(true);
    
    // Tentar carregar do cache primeiro para UX instantânea
    if (isCacheValid()) {
      console.log('⚡ Carregando dados do cache...');
      const cachedClientes = loadFromCache<Cliente[]>(CACHE_KEYS.clientes);
      const cachedMotos = loadFromCache<Moto[]>(CACHE_KEYS.motos);
      const cachedServicos = loadFromCache<Servico[]>(CACHE_KEYS.servicos);
      const cachedPecas = loadFromCache<Peca[]>(CACHE_KEYS.pecas);
      const cachedOrcamentos = loadFromCache<Orcamento[]>(CACHE_KEYS.orcamentos);

      if (cachedClientes) setClientes(cachedClientes);
      if (cachedMotos) setMotos(cachedMotos);
      if (cachedServicos) setServicos(cachedServicos);
      if (cachedPecas) setPecas(cachedPecas);
      if (cachedOrcamentos) setOrcamentos(cachedOrcamentos);
      // Ordens sempre carregam do servidor (não cacheadas)
      
      setLoading(false);
      setCarregado(true);
      
      // Atualizar em background se houver cache
      const hasCache = cachedClientes || cachedMotos || cachedServicos;
      if (hasCache) {
        console.log('🔄 Atualizando dados em background...');
        setTimeout(() => carregarDadosFrescos(), 100);
      }
      return;
    }
    
    // Cache inválido ou inexistente - carregar do servidor
    console.log('📡 Carregando dados do servidor...');
    try {
      await carregarDadosFrescos();
      setCarregado(true);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarDadosFrescos = async () => {
    try {
      const startTime = performance.now();
      
      // Carregar dados leves primeiro para feedback rápido
      const resultadosRapidos = await Promise.allSettled([
        carregarServicos(),
        carregarPecas(),
      ]);
      
      // Depois carregar dados pesados (ordens por último)
      const resultadosPesados = await Promise.allSettled([
        carregarClientes(),
        carregarMotos(),
        carregarOrcamentos(),
      ]);
      
      // Carregar ordens por último (é o mais pesado)
      await carregarOrdens();
      
      const duration = performance.now() - startTime;
      
      // Contar erros
      const todosResultados = [...resultadosRapidos, ...resultadosPesados];
      const erros = todosResultados.filter(r => r.status === 'rejected').length;
      
      if (erros === 0) {
        console.log(`✅ Dados carregados em ${Math.round(duration)}ms`);
      } else if (erros === todosResultados.length) {
        console.error(`❌ Falha total ao carregar dados (${Math.round(duration)}ms) - Backend offline?`);
      } else {
        console.warn(`⚠️ ${erros} de ${todosResultados.length} endpoints falharam (${Math.round(duration)}ms)`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados frescos:', error);
    }
  };

  // ============= CLIENTES =============
  const carregarClientes = async () => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/clientes`);
      if (response.ok) {
        const data = await response.json();
        setClientes(data);
        saveToCache(CACHE_KEYS.clientes, data);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error);
    }
  };

  const adicionarCliente = async (cliente: Omit<Cliente, 'id' | 'dataCadastro'>) => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente),
      });
      if (response.ok) {
        const novoCliente = await response.json();
        setClientes(prev => {
          const updated = [...prev, novoCliente];
          saveToCache(CACHE_KEYS.clientes, updated);
          return updated;
        });
        return novoCliente;
      }
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      throw error;
    }
  };

  const atualizarCliente = async (id: string, dadosAtualizados: Partial<Cliente>) => {
    try {
      const response = await fetch(`${API_URL}/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados),
      });
      if (response.ok) {
        await carregarClientes();
      }
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  };

  const removerCliente = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/clientes/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setClientes(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      throw error;
    }
  };

  // ============= MOTOS =============
  const carregarMotos = async () => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/motos`);
      if (response.ok) {
        const data = await response.json();
        setMotos(data);
        saveToCache(CACHE_KEYS.motos, data);
      }
    } catch (error) {
      console.error('Erro ao carregar motos:', error);
    }
  };

  const adicionarMoto = async (moto: Omit<Moto, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/motos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moto),
      });
      if (response.ok) {
        const novaMoto = await response.json();
        setMotos(prev => [...prev, novaMoto]);
        return novaMoto;
      }
    } catch (error) {
      console.error('Erro ao adicionar moto:', error);
      throw error;
    }
  };

  const atualizarMoto = async (id: string, dadosAtualizados: Partial<Moto>) => {
    try {
      const response = await fetch(`${API_URL}/motos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados),
      });
      if (response.ok) {
        await carregarMotos();
      }
    } catch (error) {
      console.error('Erro ao atualizar moto:', error);
      throw error;
    }
  };

  const removerMoto = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/motos/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setMotos(prev => prev.filter(m => m.id !== id));
      }
    } catch (error) {
      console.error('Erro ao remover moto:', error);
      throw error;
    }
  };

  // ============= SERVIÇOS =============
  const carregarServicos = async () => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/servicos`);
      if (response.ok) {
        const data = await response.json();
        setServicos(data);
        saveToCache(CACHE_KEYS.servicos, data);
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
  };

  const adicionarServico = async (servico: Omit<Servico, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/servicos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(servico),
      });
      if (response.ok) {
        const novoServico = await response.json();
        setServicos(prev => [...prev, novoServico]);
        return novoServico;
      }
    } catch (error) {
      console.error('Erro ao adicionar serviço:', error);
      throw error;
    }
  };

  const atualizarServico = async (id: string, dadosAtualizados: Partial<Servico>) => {
    try {
      const response = await fetch(`${API_URL}/servicos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados),
      });
      if (response.ok) {
        await carregarServicos();
      }
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      throw error;
    }
  };

  const removerServico = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/servicos/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setServicos(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Erro ao remover serviço:', error);
      throw error;
    }
  };

  // ============= PEÇAS =============
  const carregarPecas = async () => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/pecas`);
      if (response.ok) {
        const data = await response.json();
        setPecas(data);
        saveToCache(CACHE_KEYS.pecas, data);
      }
    } catch (error) {
      console.error('Erro ao carregar peças:', error);
    }
  };

  const adicionarPeca = async (peca: Omit<Peca, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/pecas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(peca),
      });
      if (response.ok) {
        const novaPeca = await response.json();
        setPecas(prev => [...prev, novaPeca]);
        return novaPeca;
      }
    } catch (error) {
      console.error('Erro ao adicionar peça:', error);
      throw error;
    }
  };

  const atualizarPeca = async (id: string, dadosAtualizados: Partial<Peca>) => {
    try {
      const response = await fetch(`${API_URL}/pecas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados),
      });
      if (response.ok) {
        await carregarPecas();
      }
    } catch (error) {
      console.error('Erro ao atualizar peça:', error);
      throw error;
    }
  };

  const removerPeca = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/pecas/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setPecas(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Erro ao remover peça:', error);
      throw error;
    }
  };

  // ============= ORÇAMENTOS =============
  const carregarOrcamentos = async () => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/orcamentos`);
      if (response.ok) {
        const data = await response.json();
        setOrcamentos(data);
        saveToCache(CACHE_KEYS.orcamentos, data);
      }
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    }
  };

  const adicionarOrcamento = async (orcamento: any) => {
    try {
      const response = await fetch(`${API_URL}/orcamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orcamento),
      });
      if (response.ok) {
        const novoOrcamento = await response.json();
        setOrcamentos(prev => [...prev, novoOrcamento]);
        return novoOrcamento;
      }
    } catch (error) {
      console.error('Erro ao adicionar orçamento:', error);
      throw error;
    }
  };

  const atualizarOrcamento = async (id: string, dadosAtualizados: any) => {
    try {
      const response = await fetch(`${API_URL}/orcamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados),
      });
      if (response.ok) {
        await carregarOrcamentos();
      }
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      throw error;
    }
  };

  const removerOrcamento = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/orcamentos/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setOrcamentos(prev => prev.filter(o => o.id !== id));
      }
    } catch (error) {
      console.error('Erro ao remover orçamento:', error);
      throw error;
    }
  };

  // ============= ORDENS DE SERVIÇO =============
  const carregarOrdens = async () => {
    try {
      // Carregar SEM fotos para listagem (muito mais rápido)
      const response = await fetchWithTimeout(`${API_URL}/ordens-servico?photos=false`);
      if (response.ok) {
        const data = await response.json();
        setOrdens(data);
        // NÃO salvar no cache (pode ser grande mesmo sem fotos)
        console.log(`📦 ${data.length} ordens carregadas (sem fotos para performance)`);
      }
    } catch (error) {
      console.error('Erro ao carregar ordens:', error);
    }
  };

  const adicionarOrdem = async (ordem: any) => {
    try {
      const response = await fetch(`${API_URL}/ordens-servico`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ordem),
      });
      
      if (response.ok) {
        const novaOrdem = await response.json();
        setOrdens(prev => [...prev, novaOrdem]);
        return novaOrdem;
      } else {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao adicionar ordem:', error);
      throw error;
    }
  };

  const atualizarOrdem = async (id: string, dadosAtualizados: any) => {
    try {
      const response = await fetch(`${API_URL}/ordens-servico/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados),
      });
      
      if (response.ok) {
        await carregarOrdens();
      } else {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar ordem:', error);
      throw error;
    }
  };

  const removerOrdem = async (id: string) => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/ordens-servico/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setOrdens(prev => prev.filter(o => o.id !== id));
      }
    } catch (error) {
      console.error('Erro ao remover ordem:', error);
      throw error;
    }
  };

  // Carregar fotos de uma ordem específica (sob demanda)
  const carregarOrdemComFotos = async (id: string): Promise<OrdemServico | null> => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/ordens-servico/${id}`);
      if (response.ok) {
        const ordem = await response.json();
        // Atualizar no estado local
        setOrdens(prev => prev.map(o => o.id === id ? ordem : o));
        return ordem;
      }
      return null;
    } catch (error) {
      console.error('Erro ao carregar ordem com fotos:', error);
      return null;
    }
  };

  // ============= DASHBOARD STATS =============
  const getDashboardStats = async () => {
    try {
      // Buscar estatísticas do servidor
      const response = await fetch(`${API_URL}/dashboard/stats`);
      if (response.ok) {
        const serverStats = await response.json();
        return serverStats;
      }
    } catch (error) {
      console.error('Erro ao buscar stats do servidor, calculando localmente:', error);
    }

    // Fallback: calcular localmente se o servidor falhar
    const ordensAbertas = ordens.filter(o => o.status === 'aberta').length;
    const ordensEmAndamento = ordens.filter(o => o.status === 'em_andamento').length;
    const ordensProntas = ordens.filter(o => o.status === 'pronta' || o.status === 'entregue').length;
    const orcamentosPendentes = orcamentos.filter(o => o.status === 'pendente').length;
    
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
    
    // Calcular faturamento baseado em dataConclusao ou dataEntrega
    const faturamentoMes = ordens
      .filter(o => 
        (o.status === 'pronta' || o.status === 'entregue') && 
        ((o.dataConclusao && new Date(o.dataConclusao) >= inicioMes) ||
         (o.dataEntrega && new Date(o.dataEntrega) >= inicioMes))
      )
      .reduce((total, o) => total + (o.valorTotal || 0), 0);
    
    const faturamentoMesAnterior = ordens
      .filter(o => 
        (o.status === 'pronta' || o.status === 'entregue') &&
        ((o.dataConclusao && new Date(o.dataConclusao) >= inicioMesAnterior && new Date(o.dataConclusao) <= fimMesAnterior) ||
         (o.dataEntrega && new Date(o.dataEntrega) >= inicioMesAnterior && new Date(o.dataEntrega) <= fimMesAnterior))
      )
      .reduce((total, o) => total + (o.valorTotal || 0), 0);

    return {
      ordensAbertas,
      ordensEmAndamento,
      ordensProntas,
      orcamentosPendentes,
      faturamentoMes,
      faturamentoMesAnterior
    };
  };

  return {
    // Dados
    clientes,
    motos,
    servicos,
    pecas,
    orcamentos,
    ordens,
    loading,
    
    // Funções de atualização
    carregarTodosDados,
    getDashboardStats,
    
    // Clientes
    adicionarCliente,
    atualizarCliente,
    removerCliente,
    
    // Motos
    adicionarMoto,
    atualizarMoto,
    removerMoto,
    
    // Serviços
    adicionarServico,
    atualizarServico,
    removerServico,
    
    // Peças
    adicionarPeca,
    atualizarPeca,
    removerPeca,
    
    // Orçamentos
    adicionarOrcamento,
    atualizarOrcamento,
    removerOrcamento,
    
    // Ordens
    adicionarOrdem,
    atualizarOrdem,
    removerOrdem,
    carregarOrdemComFotos,
  };
}
