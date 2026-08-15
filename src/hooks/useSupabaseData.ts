import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Cliente, Moto, Servico, Peca, Orcamento, OrdemServico, DashboardStats } from '../types';

export function useSupabaseData() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [motos, setMotos] = useState<Moto[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar se Supabase está configurado
  const supabaseConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (supabaseConfigured) {
      loadAllData();
    } else {
      setLoading(false);
    }
  }, [supabaseConfigured]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadClientes(),
        loadMotos(),
        loadServicos(),
        loadPecas(),
        loadOrcamentos(),
        loadOrdens()
      ]);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados do banco');
    } finally {
      setLoading(false);
    }
  };

  const loadClientes = async () => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    setClientes(data || []);
  };

  const loadMotos = async () => {
    const { data, error } = await supabase
      .from('motos')
      .select('*')
      .order('marca, modelo');
    
    if (error) throw error;
    setMotos(data || []);
  };

  const loadServicos = async () => {
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    setServicos(data || []);
  };

  const loadPecas = async () => {
    const { data, error } = await supabase
      .from('pecas')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    setPecas(data || []);
  };

  const loadOrcamentos = async () => {
    const { data, error } = await supabase
      .from('orcamentos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setOrcamentos(data || []);
  };

  const loadOrdens = async () => {
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setOrdens(data || []);
  };

  // Funções para clientes
  const adicionarCliente = async (cliente: Omit<Cliente, 'id' | 'dataCadastro'>) => {
    const { data, error } = await supabase
      .from('clientes')
      .insert([{
        nome: cliente.nome,
        telefone: cliente.telefone,
        email: cliente.email,
        endereco: cliente.endereco,
        cpf: cliente.cpf
      }])
      .select()
      .single();

    if (error) throw error;
    
    const novoCliente = {
      ...data,
      dataCadastro: data.created_at
    };
    
    setClientes(prev => [...prev, novoCliente]);
    return novoCliente;
  };

  const atualizarCliente = async (id: string, dadosAtualizados: Partial<Cliente>) => {
    const { error } = await supabase
      .from('clientes')
      .update(dadosAtualizados)
      .eq('id', id);

    if (error) throw error;
    
    setClientes(prev => prev.map(cliente => 
      cliente.id === id ? { ...cliente, ...dadosAtualizados } : cliente
    ));
  };

  const removerCliente = async (id: string) => {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    setClientes(prev => prev.filter(cliente => cliente.id !== id));
    setMotos(prev => prev.filter(moto => moto.clienteId !== id));
  };

  // Funções para motos
  const adicionarMoto = async (moto: Omit<Moto, 'id'>) => {
    const { data, error } = await supabase
      .from('motos')
      .insert([{
        cliente_id: moto.clienteId,
        marca: moto.marca,
        modelo: moto.modelo,
        ano: moto.ano,
        placa: moto.placa,
        cor: moto.cor,
        km: moto.km,
        observacoes: moto.observacoes
      }])
      .select()
      .single();

    if (error) throw error;
    
    const novaMoto = {
      id: data.id,
      clienteId: data.cliente_id,
      marca: data.marca,
      modelo: data.modelo,
      ano: data.ano,
      placa: data.placa,
      cor: data.cor,
      km: data.km,
      observacoes: data.observacoes
    };
    
    setMotos(prev => [...prev, novaMoto]);
    return novaMoto;
  };

  const atualizarMoto = async (id: string, dadosAtualizados: Partial<Moto>) => {
    const updateData: any = { ...dadosAtualizados };
    if (updateData.clienteId) {
      updateData.cliente_id = updateData.clienteId;
      delete updateData.clienteId;
    }

    const { error } = await supabase
      .from('motos')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    
    setMotos(prev => prev.map(moto => 
      moto.id === id ? { ...moto, ...dadosAtualizados } : moto
    ));
  };

  const removerMoto = async (id: string) => {
    const { error } = await supabase
      .from('motos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    setMotos(prev => prev.filter(moto => moto.id !== id));
  };

  // Funções para ordens de serviço
  const adicionarOrdem = async (ordem: Omit<OrdemServico, 'id' | 'numero' | 'dataAbertura'>) => {
    const numero = `OS-${new Date().getFullYear()}-${String(ordens.length + 1).padStart(4, '0')}`;
    
    const { data, error } = await supabase
      .from('ordens_servico')
      .insert([{
        numero,
        cliente_id: ordem.clienteId,
        moto_id: ordem.motoId,
        orcamento_id: ordem.orcamentoId,
        itens: ordem.itens,
        descricao_problema: ordem.descricaoProblema,
        diagnostico: ordem.diagnostico,
        observacoes: ordem.observacoes,
        observacoes_tecnicas: ordem.observacoesTecnicas,
        status: ordem.status,
        prioridade: ordem.prioridade,
        data_previsao: ordem.dataPrevisao,
        data_inicio: ordem.dataInicio,
        data_conclusao: ordem.dataConclusao,
        data_entrega: ordem.dataEntrega,
        valor_total: ordem.valorTotal,
        valor_pago: ordem.valorPago,
        forma_pagamento: ordem.formaPagamento,
        garantia: ordem.garantia,
        tecnico_responsavel: ordem.tecnicoResponsavel
      }])
      .select()
      .single();

    if (error) throw error;
    
    const novaOrdem: OrdemServico = {
      id: data.id,
      numero: data.numero,
      clienteId: data.cliente_id,
      motoId: data.moto_id,
      orcamentoId: data.orcamento_id,
      itens: data.itens,
      descricaoProblema: data.descricao_problema,
      diagnostico: data.diagnostico,
      observacoes: data.observacoes,
      observacoesTecnicas: data.observacoes_tecnicas,
      status: data.status,
      prioridade: data.prioridade,
      dataAbertura: data.created_at,
      dataInicio: data.data_inicio,
      dataPrevisao: data.data_previsao,
      dataConclusao: data.data_conclusao,
      dataEntrega: data.data_entrega,
      valorTotal: data.valor_total,
      valorPago: data.valor_pago,
      formaPagamento: data.forma_pagamento,
      garantia: data.garantia,
      tecnicoResponsavel: data.tecnico_responsavel
    };
    
    setOrdens(prev => [novaOrdem, ...prev]);
    return novaOrdem;
  };

  const atualizarOrdem = async (id: string, dadosAtualizados: Partial<OrdemServico>) => {
    const updateData: any = { ...dadosAtualizados };
    
    // Mapear campos para o formato do banco
    const fieldMapping: { [key: string]: string } = {
      clienteId: 'cliente_id',
      motoId: 'moto_id',
      orcamentoId: 'orcamento_id',
      descricaoProblema: 'descricao_problema',
      observacoesTecnicas: 'observacoes_tecnicas',
      dataAbertura: 'created_at',
      dataInicio: 'data_inicio',
      dataPrevisao: 'data_previsao',
      dataConclusao: 'data_conclusao',
      dataEntrega: 'data_entrega',
      valorTotal: 'valor_total',
      valorPago: 'valor_pago',
      formaPagamento: 'forma_pagamento',
      tecnicoResponsavel: 'tecnico_responsavel'
    };

    Object.keys(fieldMapping).forEach(key => {
      if (updateData[key] !== undefined) {
        updateData[fieldMapping[key]] = updateData[key];
        delete updateData[key];
      }
    });

    const { error } = await supabase
      .from('ordens_servico')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    
    setOrdens(prev => prev.map(ordem => 
      ordem.id === id ? { ...ordem, ...dadosAtualizados } : ordem
    ));
  };

  // Função para obter estatísticas do dashboard
  const getDashboardStats = (): DashboardStats => {
    const ordensAbertas = ordens.filter(o => o.status === 'aberta').length;
    const ordensEmAndamento = ordens.filter(o => o.status === 'em_andamento').length;
    const ordensProntas = ordens.filter(o => o.status === 'pronta').length;
    const orcamentosPendentes = orcamentos.filter(o => o.status === 'pendente').length;
    
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
    
    const faturamentoMes = ordens
      .filter(o => o.status === 'entregue' && o.dataEntrega && new Date(o.dataEntrega) >= inicioMes)
      .reduce((total, o) => total + (o.valorPago || 0), 0);
    
    const faturamentoMesAnterior = ordens
      .filter(o => o.status === 'entregue' && o.dataEntrega &&
        new Date(o.dataEntrega) >= inicioMesAnterior && 
        new Date(o.dataEntrega) <= fimMesAnterior)
      .reduce((total, o) => total + (o.valorPago || 0), 0);

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
    clientes,
    motos,
    servicos,
    pecas,
    orcamentos,
    ordens,
    loading,
    error,
    supabaseConfigured,
    adicionarCliente,
    atualizarCliente,
    removerCliente,
    adicionarMoto,
    atualizarMoto,
    removerMoto,
    adicionarOrdem,
    atualizarOrdem,
    getDashboardStats,
    reloadData: loadAllData
  };
}