/**
 * 🤖 INTEGRAÇÃO BOT WHATSAPP + CAIXA RBF MOTOS
 * 
 * Este arquivo contém os endpoints e lógica para integrar
 * um bot do WhatsApp com o sistema de controle de caixa.
 * 
 * Funcionalidades:
 * - Registrar receitas via WhatsApp
 * - Registrar despesas via WhatsApp
 * - Consultar saldo do caixa
 * - Listar movimentações do dia
 * - Autenticação por senha/token
 */

import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { CATEGORIAS_RECEITA, CATEGORIAS_DESPESA, FORMAS_PAGAMENTO, ADMIN_NUMBER } from '../config/bot-config';

const router = Router();

// ============================================
// CONFIGURAÇÃO DE SEGURANÇA
// ============================================

// Token de autenticação para o bot (altere para algo seguro!)
const BOT_TOKEN = process.env.BOT_WHATSAPP_TOKEN || 'rbfmotos_bot_2025';

// Middleware de autenticação
const authenticateBot = (req: any, res: any, next: any) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  
  if (token !== BOT_TOKEN) {
    return res.status(401).json({ 
      error: 'Token inválido',
      message: 'Autenticação necessária para usar o bot' 
    });
  }
  
  next();
};

// ============================================
// TIPOS E INTERFACES
// ============================================

interface BotCommand {
  comando: string;
  parametros: string[];
  remetenteNumero: string;
  remetenteNome?: string;
}

interface MovimentacaoCaixa {
  tipo: 'entrada' | 'saida';
  categoria: string;
  descricao: string;
  valor: number;
  formaPagamento: string;
  data: string;
  observacoes?: string;
}

// ============================================
// FORMATADORES DE RESPOSTA
// ============================================

const formatarMoeda = (valor: number): string => {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatarData = (data: Date | string): string => {
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  return dataObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ============================================
// PROCESSADORES DE COMANDOS
// ============================================

/**
 * Processa comando de registrar receita
 * Formato: /receita <valor> <categoria> <forma_pagamento> [descrição]
 * Exemplo: /receita 150.50 servico pix Troca de óleo
 */
const processarReceita = async (params: string[]): Promise<string> => {
  try {
    if (params.length < 3) {
      return `❌ *Formato inválido!*\n\n` +
        `Use: /receita <valor> <categoria> <pagamento> [descrição]\n\n` +
        `*Exemplo:*\n` +
        `/receita 150.50 servico pix Troca de óleo\n\n` +
        `*Categorias:* servico, peca, cliente, outros\n` +
        `*Pagamentos:* dinheiro, pix, debito, credito, transferencia`;
    }

    const valor = parseFloat(params[0].replace(',', '.'));
    const categoria = params[1].toLowerCase();
    const formaPagamento = params[2].toLowerCase();
    const descricao = params.slice(3).join(' ') || 'Receita via WhatsApp';

    if (isNaN(valor) || valor <= 0) {
      return '❌ Valor inválido! Use números positivos (ex: 150.50)';
    }

    const categoriaFinal = CATEGORIAS_RECEITA[categoria as keyof typeof CATEGORIAS_RECEITA] || 'Outras Entradas';
    const pagamentoFinal = FORMAS_PAGAMENTO[formaPagamento as keyof typeof FORMAS_PAGAMENTO] || 'dinheiro';

    // Criar movimentação no banco
    const movimentacao = await prisma.movimentacaoCaixa.create({
      data: {
        tipo: 'entrada',
        categoria: categoriaFinal,
        descricao,
        valor,
        formaPagamento: pagamentoFinal,
        data: new Date().toISOString(),
        observacoes: 'Registrado via Bot WhatsApp'
      }
    });

    return `✅ *Receita registrada com sucesso!*\n\n` +
      `💰 Valor: ${formatarMoeda(valor)}\n` +
      `📊 Categoria: ${categoriaFinal}\n` +
      `💳 Pagamento: ${pagamentoFinal}\n` +
      `📝 Descrição: ${descricao}\n` +
      `🕐 Data: ${formatarData(movimentacao.criadoEm)}`;
  } catch (error) {
    console.error('Erro ao processar receita:', error);
    return '❌ Erro ao registrar receita. Tente novamente.';
  }
};

/**
 * Processa comando de registrar despesa
 * Formato: /despesa <valor> <categoria> <forma_pagamento> [descrição]
 * Exemplo: /despesa 500 pecas pix Compra de peças
 */
const processarDespesa = async (params: string[]): Promise<string> => {
  try {
    if (params.length < 3) {
      return `❌ *Formato inválido!*\n\n` +
        `Use: /despesa <valor> <categoria> <pagamento> [descrição]\n\n` +
        `*Exemplo:*\n` +
        `/despesa 500 pecas pix Compra de peças\n\n` +
        `*Categorias:* pecas, salarios, aluguel, energia, agua, internet, manutencao, impostos, marketing, outros\n` +
        `*Pagamentos:* dinheiro, pix, debito, credito, transferencia`;
    }

    const valor = parseFloat(params[0].replace(',', '.'));
    const categoria = params[1].toLowerCase();
    const formaPagamento = params[2].toLowerCase();
    const descricao = params.slice(3).join(' ') || 'Despesa via WhatsApp';

    if (isNaN(valor) || valor <= 0) {
      return '❌ Valor inválido! Use números positivos (ex: 500.00)';
    }

    const categoriaFinal = CATEGORIAS_DESPESA[categoria as keyof typeof CATEGORIAS_DESPESA] || 'Outras Despesas';
    const pagamentoFinal = FORMAS_PAGAMENTO[formaPagamento as keyof typeof FORMAS_PAGAMENTO] || 'dinheiro';

    // Criar movimentação no banco
    const movimentacao = await prisma.movimentacaoCaixa.create({
      data: {
        tipo: 'saida',
        categoria: categoriaFinal,
        descricao,
        valor,
        formaPagamento: pagamentoFinal,
        data: new Date().toISOString(),
        observacoes: 'Registrado via Bot WhatsApp'
      }
    });

    return `✅ *Despesa registrada com sucesso!*\n\n` +
      `💸 Valor: ${formatarMoeda(valor)}\n` +
      `📊 Categoria: ${categoriaFinal}\n` +
      `💳 Pagamento: ${pagamentoFinal}\n` +
      `📝 Descrição: ${descricao}\n` +
      `🕐 Data: ${formatarData(movimentacao.criadoEm)}`;
  } catch (error) {
    console.error('Erro ao processar despesa:', error);
    return '❌ Erro ao registrar despesa. Tente novamente.';
  }
};

/**
 * Consulta saldo do caixa
 */
const consultarSaldo = async (): Promise<string> => {
  try {
    const movimentacoes = await prisma.movimentacaoCaixa.findMany();

    const entradas = movimentacoes
      .filter(m => m.tipo === 'entrada')
      .reduce((sum, m) => sum + m.valor, 0);

    const saidas = movimentacoes
      .filter(m => m.tipo === 'saida')
      .reduce((sum, m) => sum + m.valor, 0);

    const saldo = entradas - saidas;

    return `💰 *SALDO DO CAIXA*\n\n` +
      `📈 Entradas: ${formatarMoeda(entradas)}\n` +
      `📉 Saídas: ${formatarMoeda(saidas)}\n` +
      `━━━━━━━━━━━━━━━\n` +
      `💵 Saldo: ${formatarMoeda(saldo)}`;
  } catch (error) {
    console.error('Erro ao consultar saldo:', error);
    return '❌ Erro ao consultar saldo. Tente novamente.';
  }
};

/**
 * Lista movimentações do dia
 */
const listarMovimentacoesHoje = async (): Promise<string> => {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const movimentacoes = await prisma.movimentacaoCaixa.findMany({
      where: {
        criadoEm: {
          gte: hoje.toISOString()
        }
      },
      orderBy: {
        criadoEm: 'desc'
      }
    });

    if (movimentacoes.length === 0) {
      return '📋 *Nenhuma movimentação hoje*';
    }

    let mensagem = `📋 *MOVIMENTAÇÕES DE HOJE*\n` +
      `Total: ${movimentacoes.length} movimentações\n\n`;

    movimentacoes.forEach((mov) => {
      const icone = mov.tipo === 'entrada' ? '📈' : '📉';
      mensagem += `${icone} *${mov.categoria}*\n` +
        `   ${formatarMoeda(mov.valor)} - ${mov.descricao}\n` +
        `   ${mov.formaPagamento} | ${formatarData(mov.criadoEm)}\n\n`;
    });

    const totalEntradas = movimentacoes
      .filter(m => m.tipo === 'entrada')
      .reduce((sum, m) => sum + m.valor, 0);

    const totalSaidas = movimentacoes
      .filter(m => m.tipo === 'saida')
      .reduce((sum, m) => sum + m.valor, 0);

    mensagem += `━━━━━━━━━━━━━━━\n` +
      `📈 Total Entradas: ${formatarMoeda(totalEntradas)}\n` +
      `📉 Total Saídas: ${formatarMoeda(totalSaidas)}`;

    return mensagem;
  } catch (error) {
    console.error('Erro ao listar movimentações:', error);
    return '❌ Erro ao listar movimentações. Tente novamente.';
  }
};

/**
 * Menu de ajuda
 */
const mostrarAjuda = (): string => {
  return `🤖 *BOT RBF MOTOS - AJUDA*\n\n` +
    `*REGISTRAR RECEITA:*\n` +
    `/receita <valor> <categoria> <pagamento> [descrição]\n` +
    `Exemplo: /receita 150.50 servico pix Troca de óleo\n\n` +
    `*REGISTRAR DESPESA:*\n` +
    `/despesa <valor> <categoria> <pagamento> [descrição]\n` +
    `Exemplo: /despesa 500 pecas pix Compra de peças\n\n` +
    `*CONSULTAR SALDO:*\n` +
    `/saldo\n\n` +
    `*VER MOVIMENTAÇÕES HOJE:*\n` +
    `/hoje\n\n` +
    `*CATEGORIAS RECEITA:*\n` +
    `servico, peca, cliente, outros\n\n` +
    `*CATEGORIAS DESPESA:*\n` +
    `pecas, salarios, aluguel, energia, agua, internet, manutencao, impostos, marketing, outros\n\n` +
    `*FORMAS DE PAGAMENTO:*\n` +
    `dinheiro, pix, debito, credito, transferencia`;
};

// ============================================
// ENDPOINTS DA API
// ============================================

/**
 * POST /api/bot/webhook
 * Endpoint principal para receber comandos do bot
 */
router.post('/webhook', authenticateBot, async (req, res) => {
  try {
    const { mensagem, remetenteNumero, remetenteNome } = req.body;

    if (!mensagem || !remetenteNumero) {
      return res.status(400).json({ 
        error: 'Mensagem e remetenteNumero são obrigatórios' 
      });
    }

    // Processar comando
    const mensagemLimpa = mensagem.trim().toLowerCase();
    let resposta = '';

    if (mensagemLimpa.startsWith('/receita')) {
      const params = mensagem.split(' ').slice(1);
      resposta = await processarReceita(params);
    } 
    else if (mensagemLimpa.startsWith('/despesa')) {
      const params = mensagem.split(' ').slice(1);
      resposta = await processarDespesa(params);
    } 
    else if (mensagemLimpa === '/saldo') {
      resposta = await consultarSaldo();
    } 
    else if (mensagemLimpa === '/hoje') {
      resposta = await listarMovimentacoesHoje();
    } 
    else if (mensagemLimpa === '/ajuda' || mensagemLimpa === '/help') {
      resposta = mostrarAjuda();
    } 
    else {
      resposta = `❓ Comando não reconhecido.\n\nDigite /ajuda para ver os comandos disponíveis.`;
    }

    // Log da interação
    console.log(`📱 Bot WhatsApp: ${remetenteNome || remetenteNumero} - ${mensagem.substring(0, 50)}`);

    return res.json({
      sucesso: true,
      resposta,
      remetente: remetenteNumero
    });

  } catch (error) {
    console.error('Erro no webhook do bot:', error);
    return res.status(500).json({
      error: 'Erro ao processar comando',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

/**
 * GET /api/bot/status
 * Verifica status do bot
 */
router.get('/status', authenticateBot, async (_req, res) => {
  try {
    const totalMovimentacoes = await prisma.movimentacaoCaixa.count();
    const ultimaMovimentacao = await prisma.movimentacaoCaixa.findFirst({
      orderBy: { criadoEm: 'desc' }
    });

    return res.json({
      status: 'online',
      totalMovimentacoes,
      ultimaMovimentacao: ultimaMovimentacao ? {
        tipo: ultimaMovimentacao.tipo,
        valor: ultimaMovimentacao.valor,
        data: ultimaMovimentacao.criadoEm
      } : null
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao verificar status' });
  }
});

export default router;
