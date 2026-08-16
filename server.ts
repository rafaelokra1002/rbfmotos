import express from 'express';
import cors from 'cors';
import path from 'path';
import webpush from 'web-push';
import { prisma } from './src/lib/prisma';
import botWhatsAppRouter from './src/api/bot-whatsapp';

const app = express();
const port = Number(process.env.PORT) || 9001;

// ================= WEB PUSH (VAPID) =================
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:contato@rbfmotos.com.br';
const pushHabilitado = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

if (pushHabilitado) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log('🔔 Web Push habilitado');
} else {
  console.warn('⚠️  Web Push desabilitado: defina VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY');
}

// Envia uma notificação push para todas as inscrições de uma ordem.
// Remove inscrições expiradas (404/410) automaticamente.
async function enviarPushOrdem(
  ordemId: string,
  payload: { title: string; body: string; url?: string },
) {
  if (!pushHabilitado) return;
  try {
    const inscricoes = await (prisma as any).pushSubscription.findMany({ where: { ordemId } });
    const data = JSON.stringify(payload);

    await Promise.all(
      inscricoes.map(async (sub: any) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            data,
          );
        } catch (err: any) {
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            await (prisma as any).pushSubscription.delete({ where: { endpoint: sub.endpoint } }).catch(() => {});
          } else {
            console.error('Erro ao enviar push:', err?.statusCode || err?.message || err);
          }
        }
      }),
    );
  } catch (error) {
    console.error('Erro ao enviar push da ordem:', error);
  }
}

// Log de performance (tempo de resposta por rota)
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1_000_000;
    // Evitar poluir demais: só loga acima de 200ms
    if (ms >= 200) {
      console.log(`⏱️  ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms.toFixed(1)}ms)`);
    }
  });
  next();
});

app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const isExistingItemId = (id: any) => typeof id === 'string' && id.length > 20;

const normalizeItemData = (item: any) => {
  // NUNCA incluir itemId se não for válido
  let itemIdFinal = null;
  
  // Só aceitar itemId se for UUID válido E o item for do tipo correto
  if (item.itemId && 
      typeof item.itemId === 'string' && 
      item.itemId.length > 30 && 
      (item.tipo === 'servico' || item.tipo === 'peca')) {
    itemIdFinal = item.itemId;
  }
  
  const normalized: any = {
    tipo: item.tipo || 'servico',
    itemId: itemIdFinal,
    nome: item.nome,
    quantidade: Number.isFinite(Number(item.quantidade)) ? Number(item.quantidade) : 1,
    precoUnitario: Number.isFinite(Number(item.precoUnitario)) ? Number(item.precoUnitario) : 0,
    desconto: Number.isFinite(Number(item.desconto)) ? Number(item.desconto) : 0,
  };

  // Adicionar campos de fluido se existirem
  if (item.unidade) {
    normalized.unidade = item.unidade;
  }
  if (item.volumeMl !== undefined && item.volumeMl !== null) {
    normalized.volumeMl = Number.isFinite(Number(item.volumeMl)) ? Number(item.volumeMl) : null;
  }

  return normalized;
};

const parseNullableNumber = (value: any) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseNumericOrZero = (value: any) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseNullableDate = (value: any) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeOptionalString = (value: any) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const fotosToString = (fotos?: any) =>
  Array.isArray(fotos) && fotos.length > 0 ? JSON.stringify(fotos) : null;

async function sanitizeItemReferences(itens: any[] | undefined | null) {
  const itensArray = Array.isArray(itens) ? itens : [];

  const servicoIds = new Set<string>();
  const pecaIds = new Set<string>();

  itensArray.forEach((item) => {
    if (!item || typeof item.itemId !== 'string' || item.itemId.length < 10) return;
    if (item.tipo === 'servico') {
      servicoIds.add(item.itemId);
    } else if (item.tipo === 'peca') {
      pecaIds.add(item.itemId);
    }
  });

  const [servicosValidos, pecasValidas] = await Promise.all([
    servicoIds.size
      ? prisma.servico.findMany({ where: { id: { in: Array.from(servicoIds) } }, select: { id: true } })
      : Promise.resolve([]),
    pecaIds.size
      ? prisma.peca.findMany({ where: { id: { in: Array.from(pecaIds) } }, select: { id: true } })
      : Promise.resolve([]),
  ]);

  const servicoIdSet = new Set(servicosValidos.map((s) => s.id));
  const pecaIdSet = new Set(pecasValidas.map((p) => p.id));

  return itensArray.map((item) => {
    if (!item) return item;

    if (!item.tipo || (item.tipo !== 'servico' && item.tipo !== 'peca')) {
      return item.itemId ? { ...item, itemId: null } : item;
    }

    if (!item.itemId) return item;

    if (item.tipo === 'servico' && !servicoIdSet.has(item.itemId)) {
      console.warn(`⚠️  Serviço ${item.itemId} não encontrado - removendo referência`);
      return { ...item, itemId: null };
    }

    if (item.tipo === 'peca' && !pecaIdSet.has(item.itemId)) {
      console.warn(`⚠️  Peça ${item.itemId} não encontrada - removendo referência`);
      return { ...item, itemId: null };
    }

    return item;
  });
}

async function syncItens(
  entidade: 'orcamento' | 'ordemServico',
  entidadeId: string,
  itens: any[],
) {
  const itensRecebidos = await sanitizeItemReferences(itens);
  const existingIds = itensRecebidos
    .map((item) => (isExistingItemId(item?.id) ? item.id : null))
    .filter(Boolean) as string[];

  const whereBase: Record<string, any> = {
    [entidade === 'orcamento' ? 'orcamentoId' : 'ordemServicoId']: entidadeId,
  };

  if (existingIds.length > 0) {
    await prisma.itemOrcamento.deleteMany({
      where: {
        ...whereBase,
        id: { notIn: existingIds },
      },
    });
  } else {
    await prisma.itemOrcamento.deleteMany({ where: whereBase });
  }

  const itensParaAtualizar = itensRecebidos.filter((item) => isExistingItemId(item?.id));
  await Promise.all(
    itensParaAtualizar.map((item) =>
      prisma.itemOrcamento.update({
        where: { id: item.id },
        data: normalizeItemData(item),
      })
    )
  );

  return itensRecebidos
    .filter((item) => !isExistingItemId(item?.id))
    .map(normalizeItemData);
}

// ========================================
// WEBHOOK BOT WHATSAPP (SEM AUTENTICAÇÃO)
// Deve vir ANTES do router /api/bot
// ========================================
app.post('/api/bot/webhook', async (req, res) => {
  try {
    const { mensagem, remetenteNumero, remetenteNome } = req.body;
    
    console.log(`📱 WhatsApp Bot: ${remetenteNome} (${remetenteNumero}): ${mensagem}`);
    
    let resposta = '';
    const msgLower = mensagem.toLowerCase().trim();
    
    // ===== REGISTRAR GASTO/DESPESA =====
    if (msgLower.startsWith('gastei ') || msgLower.startsWith('gasto ') || msgLower.startsWith('paguei ')) {
      const partes = mensagem.trim().split(' ');
      const comando = partes[0];
      const valorStr = partes[1];
      const valor = parseFloat(valorStr?.replace(',', '.'));
      
      if (!valor || isNaN(valor)) {
        resposta = `❌ Formato incorreto!\n\n` +
          `Use: *${comando} VALOR descrição*\n\n` +
          `Exemplos:\n` +
          `• ${comando} 50\n` +
          `• ${comando} 100 combustível\n` +
          `• ${comando} 250.50 fornecedor de peças`;
      } else {
        const descricao = partes.slice(2).join(' ') || `Despesa registrada via WhatsApp`;
        
        await prisma.movimentacaoCaixa.create({
          data: {
            tipo: 'saida',
            valor: valor,
            descricao: descricao,
            categoria: 'Outros',
            formaPagamento: 'Dinheiro',
            data: new Date(),
            observacoes: `Registrado via WhatsApp por ${remetenteNome} (${remetenteNumero})`
          }
        });
        
        const movimentos = await prisma.movimentacaoCaixa.findMany();
        const saldoAtual = movimentos.reduce((acc: number, m: any) => 
          acc + (m.tipo === 'entrada' ? m.valor : -m.valor), 0
        );
        
        resposta = `✅ *Despesa Registrada!*\n\n` +
          `💸 Valor: R$ ${valor.toFixed(2)}\n` +
          `📝 Descrição: ${descricao}\n` +
          `💰 Saldo atual: R$ ${saldoAtual.toFixed(2)}`;
      }
    }
    
    // ===== REGISTRAR RECEITA =====
    else if (msgLower.startsWith('recebi ')) {
      const partes = mensagem.trim().split(' ');
      const valorStr = partes[1];
      const valor = parseFloat(valorStr?.replace(',', '.'));
      
      if (!valor || isNaN(valor)) {
        resposta = `❌ Formato incorreto!\n\n` +
          `Use: *recebi VALOR descrição*\n\n` +
          `Exemplos:\n` +
          `• recebi 150\n` +
          `• recebi 300 serviço moto\n` +
          `• recebi 450.50 venda de peças`;
      } else {
        const descricao = partes.slice(2).join(' ') || `Receita registrada via WhatsApp`;
        
        await prisma.movimentacaoCaixa.create({
          data: {
            tipo: 'entrada',
            valor: valor,
            descricao: descricao,
            categoria: 'Serviços',
            formaPagamento: 'Dinheiro',
            data: new Date(),
            observacoes: `Registrado via WhatsApp por ${remetenteNome} (${remetenteNumero})`
          }
        });
        
        const movimentos = await prisma.movimentacaoCaixa.findMany();
        const saldoAtual = movimentos.reduce((acc: number, m: any) => 
          acc + (m.tipo === 'entrada' ? m.valor : -m.valor), 0
        );
        
        resposta = `✅ *Receita Registrada!*\n\n` +
          `💵 Valor: R$ ${valor.toFixed(2)}\n` +
          `📝 Descrição: ${descricao}\n` +
          `💰 Saldo atual: R$ ${saldoAtual.toFixed(2)}`;
      }
    }
    
    // ===== COMANDOS DE CONSULTA =====
    else if (msgLower === '/menu' || msgLower === 'menu') {
      resposta = `🤖 *RBF Motos - Bot Caixa*\n\n` +
        `Como usar:\n\n` +
        `💸 *Registrar despesa:*\n` +
        `• gastei 50\n` +
        `• gasto 100 combustível\n` +
        `• paguei 200 fornecedor\n\n` +
        `💵 *Registrar receita:*\n` +
        `• recebi 150\n` +
        `• recebi 300 serviço\n\n` +
        `📊 *Consultas:*\n` +
        `• /saldo - Ver saldo\n` +
        `• /hoje - Resumo do dia\n` +
        `• /receitas - Últimas receitas\n` +
        `• /despesas - Últimas despesas`;
        
    } else if (msgLower === '/saldo' || msgLower === 'saldo') {
      const movimentos = await prisma.movimentacaoCaixa.findMany({
        orderBy: { data: 'desc' }
      });
      const saldoAtual = movimentos.reduce((acc: number, m: any) => 
        acc + (m.tipo === 'entrada' ? m.valor : -m.valor), 0
      );
      resposta = `💰 *Saldo do Caixa*\n\nR$ ${saldoAtual.toFixed(2)}`;
      
    } else if (msgLower === '/hoje' || msgLower === 'hoje') {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const movimentosHoje = await prisma.movimentacaoCaixa.findMany({
        where: { data: { gte: hoje } }
      });
      
      const receitasHoje = movimentosHoje
        .filter((m: any) => m.tipo === 'entrada')
        .reduce((acc: number, m: any) => acc + m.valor, 0);
        
      const despesasHoje = movimentosHoje
        .filter((m: any) => m.tipo === 'saida')
        .reduce((acc: number, m: any) => acc + m.valor, 0);
      
      resposta = `📊 *Resumo de Hoje*\n\n` +
        `💵 Receitas: R$ ${receitasHoje.toFixed(2)}\n` +
        `💸 Despesas: R$ ${despesasHoje.toFixed(2)}\n` +
        `💰 Saldo: R$ ${(receitasHoje - despesasHoje).toFixed(2)}`;
        
    } else if (msgLower === '/receita' || msgLower === '/receitas') {
      const receitas = await prisma.movimentacaoCaixa.findMany({
        where: { tipo: 'entrada' },
        orderBy: { data: 'desc' },
        take: 5
      });
      
      resposta = `💵 *Últimas Receitas*\n\n`;
      receitas.forEach((r: any) => {
        resposta += `• R$ ${r.valor.toFixed(2)} - ${r.descricao}\n`;
      });
      
    } else if (msgLower === '/despesa' || msgLower === '/despesas') {
      const despesas = await prisma.movimentacaoCaixa.findMany({
        where: { tipo: 'saida' },
        orderBy: { data: 'desc' },
        take: 5
      });
      
      resposta = `💸 *Últimas Despesas*\n\n`;
      despesas.forEach((d: any) => {
        resposta += `• R$ ${d.valor.toFixed(2)} - ${d.descricao}\n`;
      });
      
    } else if (msgLower === '/ordens') {
      const ordens = await prisma.ordemServico.findMany({
        where: { 
          status: { in: ['aberta', 'em_andamento', 'aguardando_peca'] }
        }
      });
      
      resposta = `🏍️ *Ordens em Aberto*\n\n`;
      resposta += `Total: ${ordens.length} ordem(ns)\n\n`;
      ordens.slice(0, 5).forEach((o: any) => {
        resposta += `• ${o.numero} - ${o.status}\n`;
      });
      
    } else if (msgLower === '/orcamentos') {
      const orcamentos = await prisma.orcamento.findMany({
        where: { status: 'pendente' }
      });
      
      resposta = `📋 *Orçamentos Pendentes*\n\n`;
      resposta += `Total: ${orcamentos.length} orçamento(s)`;
      
    } else {
      resposta = `❓ Comando não reconhecido.\n\nEnvie */menu* para ver os comandos disponíveis.`;
    }
    
    res.json({ sucesso: true, resposta });
    
  } catch (error: any) {
    console.error('❌ Erro no webhook bot:', error);
    res.status(500).json({ 
      sucesso: false, 
      resposta: 'Erro ao processar comando.' 
    });
  }
});

// ============================================
// BOT WHATSAPP - Rotas de integração antigas (COM autenticação)
// ============================================
app.use('/api/bot', botWhatsAppRouter);

// ============================================
// CLIENTES
// ============================================
app.get('/api/clientes', async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { nome: 'asc' },
      take: 1000,
    });
    res.json(clientes);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

app.post('/api/clientes', async (req, res) => {
  try {
    const cliente = await prisma.cliente.create({ data: req.body });
    res.json(cliente);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

app.put('/api/clientes/:id', async (req, res) => {
  try {
    const cliente = await prisma.cliente.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(cliente);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

app.delete('/api/clientes/:id', async (req, res) => {
  try {
    await prisma.cliente.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
});

// Motos
app.get('/api/motos', async (req, res) => {
  try {
    const motos = await prisma.moto.findMany({
      include: { cliente: true },
      orderBy: { modelo: 'asc' },
    });
    res.json(motos);
  } catch (error) {
    console.error('Erro ao buscar motos:', error);
    res.status(500).json({ error: 'Erro ao buscar motos' });
  }
});

app.post('/api/motos', async (req, res) => {
  try {
    const data = {
      ...req.body,
      ano: Number(req.body.ano),
      km: parseNullableNumber(req.body.km),
    };
    const moto = await prisma.moto.create({ data });
    res.json(moto);
  } catch (error) {
    console.error('Erro ao criar moto:', error);
    res.status(500).json({ error: 'Erro ao criar moto' });
  }
});

app.put('/api/motos/:id', async (req, res) => {
  try {
    const data = {
      ...req.body,
      ano: req.body.ano !== undefined ? Number(req.body.ano) : undefined,
      km: parseNullableNumber(req.body.km),
    };
    const moto = await prisma.moto.update({
      where: { id: req.params.id },
      data,
    });
    res.json(moto);
  } catch (error) {
    console.error('Erro ao atualizar moto:', error);
    res.status(500).json({ error: 'Erro ao atualizar moto' });
  }
});

app.delete('/api/motos/:id', async (req, res) => {
  try {
    await prisma.moto.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar moto:', error);
    res.status(500).json({ error: 'Erro ao deletar moto' });
  }
});

// Orçamentos
app.get('/api/orcamentos', async (req, res) => {
  try {
    const orcamentos = await prisma.orcamento.findMany({
      include: { itens: true, cliente: true, moto: true },
      orderBy: { dataEmissao: 'desc' },
    });
    res.json(orcamentos);
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar orçamentos' });
  }
});

app.get('/api/orcamentos/:id', async (req, res) => {
  try {
    const orcamento = await prisma.orcamento.findUnique({
      where: { id: req.params.id },
      include: { itens: true, cliente: true, moto: true },
    });

    if (!orcamento) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }

    res.json(orcamento);
  } catch (error) {
    console.error('Erro ao buscar orçamento:', error);
    res.status(500).json({ error: 'Erro ao buscar orçamento' });
  }
});

app.post('/api/orcamentos', async (req, res) => {
  try {
    const { itens, ...orcamentoData } = req.body;

    if (!orcamentoData.clienteId || !orcamentoData.motoId || !orcamentoData.descricaoProblema) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const ultima = await prisma.orcamento.findFirst({ orderBy: { numero: 'desc' } });

    let proximoNumero = 1;
    if (ultima?.numero) {
      const atual = parseInt(ultima.numero.replace(/\D/g, ''), 10);
      proximoNumero = Number.isNaN(atual) ? 1 : atual + 1;
    }

    const orcamento = await prisma.orcamento.create({
      data: {
        ...orcamentoData,
        valorTotal: parseNumericOrZero(orcamentoData.valorTotal),
        desconto: parseNullableNumber(orcamentoData.desconto),
        numero: `ORC-${proximoNumero.toString().padStart(6, '0')}`,
        itens: Array.isArray(itens) && itens.length > 0 ? {
          create: itens.map(normalizeItemData),
        } : undefined,
      },
      include: { itens: true },
    });

    res.json(orcamento);
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    res.status(500).json({ error: 'Erro ao criar orçamento' });
  }
});

app.put('/api/orcamentos/:id', async (req, res) => {
  try {
    const { itens, ...orcamentoData } = req.body;

    const dadosAtualizados: Record<string, any> = {};
    Object.entries(orcamentoData).forEach(([key, value]) => {
      if (value === undefined) return;

      if (['valorTotal', 'desconto'].includes(key)) {
        const parsed = parseNullableNumber(value);
        if (parsed !== undefined) {
          dadosAtualizados[key] = parsed;
        }
        return;
      }

      if (['clienteId', 'motoId'].includes(key) && !value) {
        return;
      }

      dadosAtualizados[key] = typeof value === 'string' ? value.trim() : value;
    });

    const novosItens = await syncItens('orcamento', req.params.id, itens);

    const orcamento = await prisma.orcamento.update({
      where: { id: req.params.id },
      data: {
        ...dadosAtualizados,
        itens: novosItens.length > 0 ? { create: novosItens } : undefined,
      },
      include: { itens: true },
    });

    res.json(orcamento);
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar orçamento' });
  }
});

app.delete('/api/orcamentos/:id', async (req, res) => {
  try {
    await prisma.orcamento.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar orçamento:', error);
    res.status(500).json({ error: 'Erro ao deletar orçamento' });
  }
});

// Ordens de Serviço
app.get('/api/ordens-servico', async (req, res) => {
  try {
    const includePhotos = req.query.photos === 'true';
    
    const ordensServico = await prisma.ordemServico.findMany({
      include: { itens: true, cliente: true, moto: true },
      orderBy: { dataAbertura: 'desc' },
      take: 500,
    });

    const ordensComFotos = ordensServico.map((ordem) => ({
      ...ordem,
      // Só incluir fotos se solicitado (para listagem, não precisa)
      fotos: includePhotos && ordem.fotos ? JSON.parse(ordem.fotos) : [],
      // Adicionar contador de fotos para UI
      fotoCount: ordem.fotos ? JSON.parse(ordem.fotos).length : 0,
    }));

    res.json(ordensComFotos);
  } catch (error) {
    console.error('Erro ao buscar ordens de serviço:', error);
    res.status(500).json({ error: 'Erro ao buscar ordens de serviço' });
  }
});

app.get('/api/ordens-servico/:id', async (req, res) => {
  try {
    const ordemServico = await prisma.ordemServico.findUnique({
      where: { id: req.params.id },
      include: { cliente: true, moto: true, itens: true },
    });

    if (!ordemServico) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    res.json({
      ...ordemServico,
      fotos: ordemServico.fotos ? JSON.parse(ordemServico.fotos) : [],
      // formasPagamento: (ordemServico as any).formasPagamento ? JSON.parse((ordemServico as any).formasPagamento) : null,
    });
  } catch (error) {
    console.error('Erro ao buscar ordem de serviço:', error);
    res.status(500).json({ error: 'Erro ao buscar ordem de serviço' });
  }
});

app.post('/api/ordens-servico', async (req, res) => {
  try {
    const { itens, fotos, ...ordemServicoData } = req.body;

    const itensSanitizados = await sanitizeItemReferences(itens);

    if (!ordemServicoData.clienteId || !ordemServicoData.motoId || !ordemServicoData.descricaoProblema) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    // Validar se cliente e moto existem
    const [clienteExiste, motoExiste] = await Promise.all([
      prisma.cliente.findUnique({ where: { id: ordemServicoData.clienteId } }),
      prisma.moto.findUnique({ where: { id: ordemServicoData.motoId } }),
    ]);

    if (!clienteExiste) {
      console.error('Cliente não encontrado:', ordemServicoData.clienteId);
      return res.status(400).json({ error: 'Cliente não encontrado' });
    }

    if (!motoExiste) {
      console.error('Moto não encontrada:', ordemServicoData.motoId);
      return res.status(400).json({ error: 'Moto não encontrada' });
    }

    console.log('Cliente e moto validados');

    const ultimaOrdem = await prisma.ordemServico.findFirst({ orderBy: { numero: 'desc' } });

    let proximoNumero = 1;
    if (ultimaOrdem?.numero) {
      const numeroAtual = parseInt(ultimaOrdem.numero.replace(/\D/g, ''), 10);
      proximoNumero = Number.isNaN(numeroAtual) ? 1 : numeroAtual + 1;
    }

    console.log('Próximo número:', proximoNumero);
    
    const itensNormalizados = itensSanitizados.map(normalizeItemData);
    console.log('Itens normalizados para criar:', JSON.stringify(itensNormalizados, null, 2));

    const ordemServico = await prisma.ordemServico.create({
      data: {
        ...ordemServicoData,
        valorTotal: parseNumericOrZero(ordemServicoData.valorTotal),
        valorPago: parseNullableNumber(ordemServicoData.valorPago),
        garantia: parseNullableNumber(ordemServicoData.garantia),
        numero: `OS-${proximoNumero.toString().padStart(6, '0')}`,
        fotos: fotosToString(fotos),
        itens: itensNormalizados.length > 0 ? {
          create: itensNormalizados,
        } : undefined,
      },
      include: { itens: true },
    });

    res.json(ordemServico);
  } catch (error) {
    console.error('Erro ao criar ordem de serviço:', error);
    res.status(500).json({ error: 'Erro ao criar ordem de serviço', details: error });
  }
});

app.put('/api/ordens-servico/:id', async (req, res) => {
  try {
    const { itens, fotos, orcamento, cliente, moto, ...ordemServicoData } = req.body;

    console.log('====== ATUALIZANDO ORDEM DE SERVIÇO ======');
    console.log('ID:', req.params.id);
    console.log('Dados recebidos:', JSON.stringify(ordemServicoData, null, 2));

    // Estado anterior (para detectar mudanças e notificar o cliente)
    const ordemAntes = await prisma.ordemServico.findUnique({
      where: { id: req.params.id },
      select: { numero: true, status: true, valorTotal: true },
    });

    // Primeiro, sincronizar itens (deleta/atualiza existentes, prepara novos)
    const novosItens = await syncItens('ordemServico', req.params.id, itens);
    console.log('Novos itens a criar:', novosItens.length);

    // Preparar dados da ordem (SEM incluir itens na mesma transação)
    const ordemServicoDataSanitizada: Record<string, any> = {};
    Object.entries(ordemServicoData).forEach(([key, value]) => {
      if (value === undefined) return;

      // NÃO incluir clienteId e motoId no update - são imutáveis após criação
      if (['clienteId', 'motoId'].includes(key)) {
        return;
      }

      if (key === 'orcamentoId') {
        ordemServicoDataSanitizada[key] = value || null;
        return;
      }

      if (['valorTotal', 'valorPago', 'garantia'].includes(key)) {
        const parsed = parseNullableNumber(value);
        if (parsed !== undefined) {
          ordemServicoDataSanitizada[key] = parsed;
        }
        return;
      }

      if (['dataInicio', 'dataPrevisao', 'dataConclusao', 'dataEntrega'].includes(key)) {
        ordemServicoDataSanitizada[key] = value ? parseNullableDate(value) : null;
        return;
      }

      const normalized = normalizeOptionalString(value);
      if (normalized !== undefined) {
        ordemServicoDataSanitizada[key] = normalized;
      }
    });

    console.log('Dados sanitizados:', JSON.stringify(ordemServicoDataSanitizada, null, 2));

    if (ordemServicoDataSanitizada.orcamentoId) {
      const orcamentoExistente = await prisma.orcamento.findUnique({ where: { id: ordemServicoDataSanitizada.orcamentoId } });
      if (!orcamentoExistente) {
        console.warn('Orçamento não encontrado, removendo referência:', ordemServicoDataSanitizada.orcamentoId);
        ordemServicoDataSanitizada.orcamentoId = null;
      }
    }

    console.log('Dados finais para update:', JSON.stringify({
      ...ordemServicoDataSanitizada,
      fotosLength: fotos?.length,
    }, null, 2));

    // Converter formasPagamento para JSON string se for array
    // if (ordemServicoDataSanitizada.formasPagamento && Array.isArray(ordemServicoDataSanitizada.formasPagamento)) {
    //   ordemServicoDataSanitizada.formasPagamento = JSON.stringify(ordemServicoDataSanitizada.formasPagamento);
    // }
    
    // Remover formasPagamento temporariamente até a coluna ser criada
    delete ordemServicoDataSanitizada.formasPagamento;

    // Update da ordem SEM nested create de itens
    await prisma.ordemServico.update({
      where: { id: req.params.id },
      data: {
        ...ordemServicoDataSanitizada,
        fotos: fotosToString(fotos),
      },
    });

    // Se houver novos itens, criar separadamente
    if (novosItens.length > 0) {
      console.log('Criando novos itens separadamente...');
      console.log('Itens a criar:', JSON.stringify(novosItens, null, 2));
      
      // SOLUÇÃO TEMPORÁRIA: Força itemId para null em TODOS os novos itens
      // para evitar problemas de FK até identificarmos a causa raiz
      const itensParaCriar = novosItens.map(item => ({
        tipo: item.tipo || 'servico',
        nome: item.nome,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        desconto: item.desconto || 0,
        itemId: null, // FORÇAR NULL
        orcamentoId: null,
        ordemServicoId: req.params.id,
      }));
      
      console.log('Itens com ordemServicoId (itemId=null):', JSON.stringify(itensParaCriar, null, 2));
      
      await prisma.itemOrcamento.createMany({
        data: itensParaCriar,
      });
    }

    // Buscar ordem atualizada com itens
    const ordemServico = await prisma.ordemServico.findUnique({
      where: { id: req.params.id },
      include: { itens: true },
    });

    console.log('Ordem atualizada com sucesso');
    console.log('=========================================');
    res.json(ordemServico);

    // Notificar o cliente (push) sobre mudanças relevantes — depois de responder
    if (ordemServico && ordemAntes) {
      const numero = ordemServico.numero;
      const urlPortal = `/portal?os=${encodeURIComponent(numero)}`;

      // Moto pronta para retirada
      if (ordemServico.status === 'pronta' && ordemAntes.status !== 'pronta') {
        void enviarPushOrdem(req.params.id, {
          title: '✅ Sua moto está pronta!',
          body: `A OS ${numero} está pronta para retirada.`,
          url: urlPortal,
        });
      }
      // Orçamento/valor atualizado (evita disparar junto quando ficou pronta)
      else if (
        typeof ordemServico.valorTotal === 'number' &&
        typeof ordemAntes.valorTotal === 'number' &&
        ordemServico.valorTotal !== ordemAntes.valorTotal
      ) {
        void enviarPushOrdem(req.params.id, {
          title: '💰 Orçamento atualizado',
          body: `O valor da OS ${numero} agora é R$ ${ordemServico.valorTotal.toFixed(2)}.`,
          url: urlPortal,
        });
      }
    }
  } catch (error: any) {
    console.error('Erro ao atualizar ordem de serviço:', error);
    console.error('Erro detalhado:', JSON.stringify(error, null, 2));
    res.status(500).json({ 
      error: 'Erro ao atualizar ordem de serviço', 
      details: {
        code: error?.code,
        meta: error?.meta,
        message: error?.message,
        name: error?.name,
        clientVersion: error?.clientVersion,
      }
    });
  }
});

app.delete('/api/ordens-servico/:id', async (req, res) => {
  try {
    await prisma.ordemServico.delete({ where: { id: req.params.id } });
    res.json({ message: 'Ordem de serviço deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar ordem de serviço:', error);
    res.status(500).json({ error: 'Erro ao deletar ordem de serviço' });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const ordensAbertas = await prisma.ordemServico.count({ where: { status: 'aberta' } });
    const ordensEmAndamento = await prisma.ordemServico.count({ where: { status: 'em_andamento' } });
    const ordensProntas = await prisma.ordemServico.count({ where: { status: { in: ['pronta', 'entregue'] } } });
    const orcamentosPendentes = await prisma.orcamento.count({ where: { status: 'pendente' } });

    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Buscar faturamento do CAIXA (fonte única de verdade)
    // Considerar todas as entradas como faturamento
    const movimentacoesMesAtual = await prisma.movimentacaoCaixa.findMany({
      where: {
        tipo: 'entrada',
        data: {
          gte: firstDayThisMonth,
          lte: lastDayThisMonth
        }
      }
    });

    const movimentacoesMesAnterior = await prisma.movimentacaoCaixa.findMany({
      where: {
        tipo: 'entrada',
        data: {
          gte: firstDayLastMonth,
          lte: lastDayLastMonth
        }
      }
    });

    const faturamentoMes = movimentacoesMesAtual.reduce((sum, m) => sum + m.valor, 0);
    const faturamentoMesAnterior = movimentacoesMesAnterior.reduce((sum, m) => sum + m.valor, 0);

    console.log('=== DEBUG FATURAMENTO (CAIXA) ===');
    console.log('Mês atual:', now.getMonth() + 1);
    console.log('Movimentações encontradas (mês atual):', movimentacoesMesAtual.length);
    console.log('Faturamento mês atual:', faturamentoMes);
    console.log('Faturamento mês anterior:', faturamentoMesAnterior);
    console.log('========================');

    res.json({
      ordensAbertas,
      ordensEmAndamento,
      ordensProntas,
      orcamentosPendentes,
      faturamentoMes,
      faturamentoMesAnterior,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Agendamentos
app.get('/api/agendamentos', async (req, res) => {
  try {
    const agendamentos = await prisma.agendamento.findMany({
      orderBy: { dataAgendada: 'asc' },
    });
    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

app.post('/api/agendamentos', async (req, res) => {
  try {
    const { dataAgendada, motoId, ...rest } = req.body;

    const agendamento = await prisma.agendamento.create({
      data: {
        ...rest,
        motoId: motoId || null, // Permite null se não houver moto
        dataAgendada: new Date(dataAgendada),
        servicos: typeof rest.servicos === 'string' ? rest.servicos : JSON.stringify(rest.servicos),
      },
    });
    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

app.put('/api/agendamentos/:id', async (req, res) => {
  try {
    const { dataAgendada, servicos, ...rest } = req.body;

    const agendamento = await prisma.agendamento.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(dataAgendada && { dataAgendada: new Date(dataAgendada) }),
        ...(servicos && { servicos: typeof servicos === 'string' ? servicos : JSON.stringify(servicos) }),
      },
    });
    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
});

app.delete('/api/agendamentos/:id', async (req, res) => {
  try {
    await prisma.agendamento.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    res.status(500).json({ error: 'Erro ao deletar agendamento' });
  }
});

// Serviços
app.get('/api/servicos', async (req, res) => {
  try {
    const servicos = await prisma.servico.findMany({ orderBy: { nome: 'asc' } });
    res.json(servicos);
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

app.post('/api/servicos', async (req, res) => {
  try {
    const servico = await prisma.servico.create({ data: req.body });
    res.json(servico);
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
});

app.put('/api/servicos/:id', async (req, res) => {
  try {
    const servico = await prisma.servico.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(servico);
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ error: 'Erro ao atualizar serviço' });
  }
});

app.delete('/api/servicos/:id', async (req, res) => {
  try {
    await prisma.servico.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    res.status(500).json({ error: 'Erro ao deletar serviço' });
  }
});

// Peças
app.get('/api/pecas', async (req, res) => {
  try {
    const pecas = await prisma.peca.findMany({ orderBy: { nome: 'asc' } });
    res.json(pecas);
  } catch (error) {
    console.error('Erro ao buscar peças:', error);
    res.status(500).json({ error: 'Erro ao buscar peças' });
  }
});

app.post('/api/pecas', async (req, res) => {
  try {
    const peca = await prisma.peca.create({ data: req.body });
    res.json(peca);
  } catch (error) {
    console.error('Erro ao criar peça:', error);
    res.status(500).json({ error: 'Erro ao criar peça' });
  }
});

app.put('/api/pecas/:id', async (req, res) => {
  try {
    const peca = await prisma.peca.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(peca);
  } catch (error) {
    console.error('Erro ao atualizar peça:', error);
    res.status(500).json({ error: 'Erro ao atualizar peça' });
  }
});

app.delete('/api/pecas/:id', async (req, res) => {
  try {
    await prisma.peca.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar peça:', error);
    res.status(500).json({ error: 'Erro ao deletar peça' });
  }
});

// ============ CAIXA (MOVIMENTAÇÕES) ============

// Listar todas as movimentações de caixa
app.get('/api/caixa', async (req, res) => {
  try {
    const movimentacoes = await prisma.movimentacaoCaixa.findMany({
      orderBy: { data: 'desc' }
    });
    res.json(movimentacoes);
  } catch (error) {
    console.error('Erro ao buscar movimentações de caixa:', error);
    res.status(500).json({ error: 'Erro ao buscar movimentações de caixa' });
  }
});

// Buscar resumo do caixa por período
app.get('/api/caixa/resumo/:periodo', async (req, res) => {
  try {
    const { periodo } = req.params; // 'mes', 'mesAnterior', 'ano'
    const now = new Date();
    let dataInicio: Date;
    let dataFim: Date;

    if (periodo === 'mes') {
      dataInicio = new Date(now.getFullYear(), now.getMonth(), 1);
      dataFim = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (periodo === 'mesAnterior') {
      dataInicio = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      dataFim = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (periodo === 'ano') {
      dataInicio = new Date(now.getFullYear(), 0, 1);
      dataFim = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    } else {
      return res.status(400).json({ error: 'Período inválido' });
    }

    const movimentacoes = await prisma.movimentacaoCaixa.findMany({
      where: {
        data: {
          gte: dataInicio,
          lte: dataFim
        }
      }
    });

    const totalEntradas = movimentacoes
      .filter(m => m.tipo === 'entrada')
      .reduce((sum, m) => sum + m.valor, 0);

    const totalSaidas = movimentacoes
      .filter(m => m.tipo === 'saida')
      .reduce((sum, m) => sum + m.valor, 0);

    const saldo = totalEntradas - totalSaidas;

    res.json({
      periodo,
      dataInicio,
      dataFim,
      totalEntradas,
      totalSaidas,
      saldo,
      quantidadeMovimentacoes: movimentacoes.length
    });
  } catch (error) {
    console.error('Erro ao buscar resumo do caixa:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo do caixa' });
  }
});

// Buscar uma movimentação específica
app.get('/api/caixa/:id', async (req, res) => {
  try {
    const movimentacao = await prisma.movimentacaoCaixa.findUnique({
      where: { id: req.params.id }
    });
    res.json(movimentacao);
  } catch (error) {
    console.error('Erro ao buscar movimentação:', error);
    res.status(500).json({ error: 'Erro ao buscar movimentação' });
  }
});

// Criar nova movimentação de caixa
app.post('/api/caixa', async (req, res) => {
  try {
    console.log('=== POST /api/caixa ===');
    console.log('Body recebido:', req.body);
    
    const movimentacao = await prisma.movimentacaoCaixa.create({
      data: {
        tipo: req.body.tipo,
        categoria: req.body.categoria,
        descricao: req.body.descricao,
        valor: parseFloat(req.body.valor),
        formaPagamento: req.body.formaPagamento,
        data: new Date(req.body.data),
        ordemServicoId: req.body.ordemServicoId || null,
        observacoes: req.body.observacoes || null
      }
    });
    
    console.log('Movimentação criada:', movimentacao);
    res.json(movimentacao);
  } catch (error: any) {
    console.error('Erro ao criar movimentação:', error);
    console.error('Stack trace:', error.stack);
    console.error('Prisma error:', error.message);
    res.status(500).json({ 
      error: 'Erro ao criar movimentação', 
      details: error.message,
      code: error.code 
    });
  }
});

// Atualizar movimentação de caixa
app.put('/api/caixa/:id', async (req, res) => {
  try {
    const movimentacao = await prisma.movimentacaoCaixa.update({
      where: { id: req.params.id },
      data: {
        tipo: req.body.tipo,
        categoria: req.body.categoria,
        descricao: req.body.descricao,
        valor: req.body.valor,
        formaPagamento: req.body.formaPagamento,
        data: new Date(req.body.data),
        ordemServicoId: req.body.ordemServicoId || null,
        observacoes: req.body.observacoes || null
      }
    });
    res.json(movimentacao);
  } catch (error) {
    console.error('Erro ao atualizar movimentação:', error);
    res.status(500).json({ error: 'Erro ao atualizar movimentação' });
  }
});

// Deletar movimentação de caixa
app.delete('/api/caixa/:id', async (req, res) => {
  try {
    await prisma.movimentacaoCaixa.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar movimentação:', error);
    res.status(500).json({ error: 'Erro ao deletar movimentação' });
  }
});

// Endpoint para migrar ordens finalizadas para o caixa
app.post('/api/caixa/migrar-ordens', async (req, res) => {
  try {
    console.log('🔄 Iniciando migração de ordens para o caixa...');

    // Buscar todas as ordens finalizadas
    const ordensFinalizadas = await prisma.ordemServico.findMany({
      where: {
        status: {
          in: ['pronta', 'entregue']
        }
      },
      orderBy: {
        dataConclusao: 'asc'
      }
    });

    console.log(`📊 Encontradas ${ordensFinalizadas.length} ordens finalizadas`);

    let migradas = 0;
    let jaMigradas = 0;
    let erros = 0;
    const detalhes: any[] = [];

    for (const ordem of ordensFinalizadas) {
      try {
        // Verificar se já existe movimentação
        const movimentacaoExistente = await prisma.movimentacaoCaixa.findFirst({
          where: { ordemServicoId: ordem.id }
        });

        if (movimentacaoExistente) {
          jaMigradas++;
          detalhes.push({
            numero: ordem.numero,
            status: 'ja_existe',
            mensagem: 'Já tem movimentação no caixa'
          });
          continue;
        }

        // Determinar data da movimentação
        const dataMovimentacao = ordem.dataConclusao || ordem.dataEntrega || ordem.dataAbertura;

        // Criar movimentação
        await prisma.movimentacaoCaixa.create({
          data: {
            tipo: 'entrada',
            categoria: 'Venda de Serviço',
            descricao: `OS #${ordem.numero} - ${ordem.descricaoProblema}`,
            valor: parseFloat(ordem.valorTotal.toString()),
            formaPagamento: ordem.formaPagamento || 'dinheiro',
            data: new Date(dataMovimentacao),
            ordemServicoId: ordem.id,
            observacoes: `Migração automática - OS finalizada em ${new Date(dataMovimentacao).toLocaleDateString('pt-BR')}`
          }
        });

        migradas++;
        detalhes.push({
          numero: ordem.numero,
          status: 'migrada',
          valor: ordem.valorTotal,
          data: new Date(dataMovimentacao).toLocaleDateString('pt-BR')
        });

      } catch (error: any) {
        erros++;
        detalhes.push({
          numero: ordem.numero,
          status: 'erro',
          mensagem: error.message
        });
      }
    }

    const resultado = {
      sucesso: true,
      resumo: {
        total: ordensFinalizadas.length,
        migradas,
        jaMigradas,
        erros
      },
      detalhes
    };

    console.log('✅ Migração concluída:', resultado.resumo);
    res.json(resultado);

  } catch (error: any) {
    console.error('❌ Erro na migração:', error);
    res.status(500).json({ 
      sucesso: false, 
      error: 'Erro ao migrar ordens',
      mensagem: error.message 
    });
  }
});


// ================= FINANCEIRO =================

// --- Categorias Financeiras ---
app.get('/api/financeiro/categorias', async (req, res) => {
  try {
    const { oficinaId = 'default-oficina', tipo } = req.query;
    const where: any = { oficinaId: String(oficinaId) };
    if (tipo) where.tipo = String(tipo);
    const categorias = await prisma.categoriaFinanceira.findMany({
      where,
      orderBy: { nome: 'asc' },
    });
    res.json(categorias);
  } catch (error: any) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias', details: error?.message });
  }
});

app.post('/api/financeiro/categorias', async (req, res) => {
  try {
    const data = req.body;
    data.oficinaId = data.oficinaId || 'default-oficina';
    const categoria = await prisma.categoriaFinanceira.create({ data });
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
});

app.put('/api/financeiro/categorias/:id', async (req, res) => {
  try {
    const categoria = await prisma.categoriaFinanceira.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
});

app.delete('/api/financeiro/categorias/:id', async (req, res) => {
  try {
    await prisma.categoriaFinanceira.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar categoria' });
  }
});

// --- Contas a Pagar ---
app.get('/api/financeiro/contas-pagar', async (req, res) => {
  try {
    const { oficinaId = 'default-oficina' } = req.query;
    const contas = await prisma.contaPagar.findMany({
      where: { oficinaId: String(oficinaId) },
      include: { categoria: true, parcelas: true },
      orderBy: { dataVencimento: 'asc' },
    });
    res.json(contas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar contas a pagar' });
  }
});

app.post('/api/financeiro/contas-pagar', async (req, res) => {
  try {
    const data = req.body;
    data.oficinaId = data.oficinaId || 'default-oficina';

    // Gerar parcelas automaticamente se valorTotal, valorParcela e frequencia informados
    let parcelasData: any[] = [];
    if (data.valorTotal && data.valorParcela && data.frequencia) {
      const diasPorFrequencia: Record<string, number> = {
        MENSAL: 30,
        QUINZENAL: 15,
        SEMANAL: 7,
        AVISTA: 0,
      };
      const dias = diasPorFrequencia[data.frequencia] || 30;
      const numParcelas = Math.ceil(data.valorTotal / data.valorParcela);
      const hoje = new Date();
      for (let i = 0; i < numParcelas; i++) {
        const dataVenc = new Date(hoje);
        dataVenc.setDate(hoje.getDate() + dias * (i + 1));
        parcelasData.push({
          numeroParcela: i + 1,
          dataVencimento: dataVenc,
          valor: i === numParcelas - 1
            ? data.valorTotal - data.valorParcela * (numParcelas - 1)
            : data.valorParcela,
          status: 'PENDENTE',
        });
      }
    }

    const conta = await prisma.contaPagar.create({
      data: {
        descricao: data.descricao,
        fornecedor: data.fornecedor || null,
        valorTotal: data.valorTotal,
        dataVencimento: data.dataVencimento ? new Date(data.dataVencimento) : new Date(),
        frequencia: data.frequencia || 'MENSAL',
        valorParcela: data.valorParcela,
        observacoes: data.observacoes || null,
        categoriaId: data.categoriaId,
        compraPecaId: data.compraPecaId || null,
        oficinaId: data.oficinaId,
        parcelas: parcelasData.length > 0 ? { create: parcelasData } : undefined,
      },
      include: { categoria: true, parcelas: true },
    });
    res.json(conta);
  } catch (error: any) {
    console.error('Erro ao criar conta a pagar:', error);
    res.status(500).json({ error: 'Erro ao criar conta a pagar', details: error?.message });
  }
});

app.put('/api/financeiro/contas-pagar/:id', async (req, res) => {
  try {
    const conta = await prisma.contaPagar.update({
      where: { id: req.params.id },
      data: req.body,
      include: { categoria: true, parcelas: true },
    });
    res.json(conta);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar conta a pagar' });
  }
});

app.delete('/api/financeiro/contas-pagar/:id', async (req, res) => {
  try {
    await prisma.contaPagar.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar conta a pagar' });
  }
});

// --- Marcar Parcela a Pagar como Paga ---
app.patch('/api/financeiro/parcelas-pagar/:id/pagar', async (req, res) => {
  try {
    const { id } = req.params;
    const { dataPagamento, valorPago, formaPagamento, observacao } = req.body;

    // Buscar parcela
    const parcela = await prisma.parcelaPagar.findUnique({ where: { id } });
    if (!parcela) {
      return res.status(404).json({ error: 'Parcela não encontrada' });
    }

    // Atualizar status da parcela
    await prisma.parcelaPagar.update({
      where: { id },
      data: { status: 'PAGO' }
    });

    // Criar registro de pagamento
    await prisma.pagamentoSaida.create({
      data: {
        parcelaPagarId: id,
        dataPagamento: dataPagamento ? new Date(dataPagamento) : new Date(),
        valorPago: valorPago || parcela.valor,
        formaPagamento: formaPagamento || 'DINHEIRO',
        observacao: observacao || null
      }
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao marcar parcela como paga:', error);
    res.status(500).json({ error: 'Erro ao marcar parcela como paga', details: error?.message });
  }
});

// --- Contas a Receber ---
app.get('/api/financeiro/contas-receber', async (req, res) => {
  try {
    const { oficinaId = 'default-oficina' } = req.query;
    const contas = await prisma.contaReceber.findMany({
      where: { oficinaId: String(oficinaId) },
      include: { categoria: true, parcelas: true, cliente: true, ordemServico: true },
      orderBy: { dataVencimento: 'asc' },
    });
    res.json(contas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar contas a receber' });
  }
});

app.post('/api/financeiro/contas-receber', async (req, res) => {
  try {
    const data = req.body;
    data.oficinaId = data.oficinaId || 'default-oficina';
    const conta = await prisma.contaReceber.create({
      data: {
        ...data,
        parcelas: data.parcelas ? { create: data.parcelas } : undefined,
      },
      include: { categoria: true, parcelas: true, cliente: true, ordemServico: true },
    });
    res.json(conta);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar conta a receber' });
  }
});

app.put('/api/financeiro/contas-receber/:id', async (req, res) => {
  try {
    const conta = await prisma.contaReceber.update({
      where: { id: req.params.id },
      data: req.body,
      include: { categoria: true, parcelas: true, cliente: true, ordemServico: true },
    });
    res.json(conta);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar conta a receber' });
  }
});

app.delete('/api/financeiro/contas-receber/:id', async (req, res) => {
  try {
    await prisma.contaReceber.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar conta a receber' });
  }
});

// --- Metas Financeiras ---
app.get('/api/financeiro/metas', async (req, res) => {
  try {
    const { oficinaId = 'default-oficina' } = req.query;
    const metas = await prisma.metaFinanceira.findMany({
      where: { oficinaId: String(oficinaId) },
      orderBy: { dataInicio: 'desc' },
    });
    res.json(metas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar metas financeiras' });
  }
});

app.post('/api/financeiro/metas', async (req, res) => {
  try {
    const data = req.body;
    data.oficinaId = data.oficinaId || 'default-oficina';
    const meta = await prisma.metaFinanceira.create({ data });
    res.json(meta);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar meta financeira' });
  }
});

app.put('/api/financeiro/metas/:id', async (req, res) => {
  try {
    const meta = await prisma.metaFinanceira.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(meta);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar meta financeira' });
  }
});

app.delete('/api/financeiro/metas/:id', async (req, res) => {
  try {
    await prisma.metaFinanceira.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar meta financeira' });
  }
});

// ================= FIM FINANCEIRO =================

// ================= MENSAGENS (CHAT PORTAL DO CLIENTE) =================

// Listar mensagens de uma ordem de serviço
app.get('/api/mensagens/:ordemId', async (req, res) => {
  try {
    const mensagens = await (prisma as any).mensagem.findMany({
      where: { ordemId: req.params.ordemId },
      orderBy: { data: 'asc' },
    });
    res.json(mensagens);
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

// Criar (enviar) uma mensagem
app.post('/api/mensagens', async (req, res) => {
  try {
    const { ordemId, remetente, mensagem, data, lida } = req.body;

    if (!ordemId || !remetente || !mensagem || !mensagem.trim()) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    if (remetente !== 'cliente' && remetente !== 'oficina') {
      return res.status(400).json({ error: 'Remetente inválido' });
    }

    const novaMensagem = await (prisma as any).mensagem.create({
      data: {
        ordemId,
        remetente,
        mensagem: mensagem.trim(),
        data: data ? new Date(data) : new Date(),
        lida: Boolean(lida),
      },
    });

    res.json(novaMensagem);

    // Se a oficina respondeu, notifica o cliente por push
    if (remetente === 'oficina') {
      const ordem = await prisma.ordemServico.findUnique({
        where: { id: ordemId },
        select: { numero: true },
      });
      const numero = ordem?.numero || '';
      void enviarPushOrdem(ordemId, {
        title: '💬 Nova mensagem da oficina',
        body: mensagem.trim().slice(0, 120),
        url: `/portal?os=${encodeURIComponent(numero)}`,
      });
    }
  } catch (error) {
    console.error('Erro ao criar mensagem:', error);
    res.status(500).json({ error: 'Erro ao criar mensagem' });
  }
});

// Total de mensagens de clientes ainda não lidas pela oficina (para alerta global)
app.get('/api/mensagens-nao-lidas', async (_req, res) => {
  try {
    const total = await (prisma as any).mensagem.count({
      where: { remetente: 'cliente', lida: false },
    });
    const ultima = await (prisma as any).mensagem.findFirst({
      where: { remetente: 'cliente', lida: false },
      orderBy: { data: 'desc' },
    });
    res.json({ total, ultima });
  } catch (error) {
    console.error('Erro ao contar mensagens não lidas:', error);
    res.status(500).json({ error: 'Erro ao contar mensagens não lidas' });
  }
});

// Marcar como lidas as mensagens do cliente de uma ordem (chamado pela oficina)
app.patch('/api/mensagens/:ordemId/marcar-lidas', async (req, res) => {
  try {
    await (prisma as any).mensagem.updateMany({
      where: { ordemId: req.params.ordemId, remetente: 'cliente', lida: false },
      data: { lida: true },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao marcar mensagens como lidas:', error);
    res.status(500).json({ error: 'Erro ao marcar mensagens como lidas' });
  }
});

// ================= WEB PUSH (INSCRIÇÕES) =================

// Chave pública VAPID para o frontend se inscrever
app.get('/api/push/vapid-public-key', (_req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY, habilitado: pushHabilitado });
});

// Registrar/atualizar a inscrição de push de um cliente para uma ordem
app.post('/api/push/subscribe', async (req, res) => {
  try {
    const { ordemId, subscription } = req.body;

    if (!ordemId || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(400).json({ error: 'Dados de inscrição inválidos' });
    }

    await (prisma as any).pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: { ordemId, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
      create: {
        ordemId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar inscrição de push:', error);
    res.status(500).json({ error: 'Erro ao registrar inscrição de push' });
  }
});

// Enviar um push de teste para as inscrições de uma ordem (diagnóstico)
app.post('/api/push/test', async (req, res) => {
  try {
    const { ordemId } = req.body;
    if (!ordemId) return res.status(400).json({ error: 'ordemId obrigatório' });

    if (!pushHabilitado) {
      return res.json({ habilitado: false, inscricoes: 0, enviados: 0 });
    }

    const inscricoes = await (prisma as any).pushSubscription.findMany({ where: { ordemId } });
    let enviados = 0;

    for (const sub of inscricoes) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({
            title: '🔔 Teste RBF Motos',
            body: 'Se você recebeu isto, as notificações estão funcionando!',
            url: '/portal',
          }),
        );
        enviados++;
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await (prisma as any).pushSubscription.delete({ where: { endpoint: sub.endpoint } }).catch(() => {});
        } else {
          console.error('Erro no push de teste:', err?.statusCode || err?.message || err);
        }
      }
    }

    res.json({ habilitado: true, inscricoes: inscricoes.length, enviados });
  } catch (error) {
    console.error('Erro no push de teste:', error);
    res.status(500).json({ error: 'Erro no push de teste' });
  }
});

// ================= FRONTEND (SPA) =================
// Em produção, o Express serve o build do Vite (pasta dist) e faz o
// fallback para o index.html em qualquer rota que não seja da API.
// Middleware sem padrão de rota para ser compatível com Express 5.
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Frontend + API na mesma porta (${port})`);
});
/*
CÓDIGO ÓRFÃO REMOVIDO - Webhook duplicado estava causando erros de compilação

Todo o código das linhas seguintes até res.json e app.listen duplicado foi comentado
porque era código fragmentado/órfão do webhook que estava na linha errada.
O webhook correto está nas linhas 183-390, ANTES do router /api/bot.
/*
================================================================================
CÓDIGO ÓRFÃO COMENTADO - INÍCIO
================================================================================
*/
/*
      resposta = `🤖 *RBF Motos - Bot Caixa*\n\n` +
        `Como usar:\n\n` +
        `💸 *Registrar despesa:*\n` +
        `• gastei 50\n` +
        `• gasto 100 combustível\n` +
        `• paguei 200 fornecedor\n\n` +
        `💵 *Registrar receita:*\n` +
        `• recebi 150\n` +
        `• recebi 300 serviço\n\n` +
        `� *Consultas:*\n` +
        `• /saldo - Ver saldo\n` +
        `• /hoje - Resumo do dia\n` +
        `• /receitas - Últimas receitas\n` +
        `• /despesas - Últimas despesas`;
        
    } else if (msgLower === '/saldo' || msgLower === 'saldo') {
      const movimentos = await prisma.movimentacaoCaixa.findMany({
        orderBy: { data: 'desc' }
      });
      const saldoAtual = movimentos.reduce((acc: number, m: any) => 
        acc + (m.tipo === 'entrada' ? m.valor : -m.valor), 0
      );
      resposta = `💰 *Saldo do Caixa*\n\nR$ ${saldoAtual.toFixed(2)}`;
      
    } else if (msgLower === '/hoje' || msgLower === 'hoje') {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const movimentosHoje = await prisma.movimentacaoCaixa.findMany({
        where: { data: { gte: hoje } }
      });
      
      const receitasHoje = movimentosHoje
        .filter((m: any) => m.tipo === 'entrada')
        .reduce((acc: number, m: any) => acc + m.valor, 0);
        
      const despesasHoje = movimentosHoje
        .filter((m: any) => m.tipo === 'saida')
        .reduce((acc: number, m: any) => acc + m.valor, 0);
      
      resposta = `📊 *Resumo de Hoje*\n\n` +
        `💵 Receitas: R$ ${receitasHoje.toFixed(2)}\n` +
        `💸 Despesas: R$ ${despesasHoje.toFixed(2)}\n` +
        `💰 Saldo: R$ ${(receitasHoje - despesasHoje).toFixed(2)}`;
        
    } else if (msgLower === '/receita' || msgLower === '/receitas') {
      const receitas = await prisma.movimentacaoCaixa.findMany({
        where: { tipo: 'entrada' },
        orderBy: { data: 'desc' },
        take: 5
      });
      
      resposta = `💵 *Últimas Receitas*\n\n`;
      receitas.forEach((r: any) => {
        resposta += `• R$ ${r.valor.toFixed(2)} - ${r.descricao}\n`;
      });
      
    } else if (msgLower === '/despesa' || msgLower === '/despesas') {
      const despesas = await prisma.movimentacaoCaixa.findMany({
        where: { tipo: 'saida' },
        orderBy: { data: 'desc' },
        take: 5
      });
      
      resposta = `💸 *Últimas Despesas*\n\n`;
      despesas.forEach((d: any) => {
        resposta += `• R$ ${d.valor.toFixed(2)} - ${d.descricao}\n`;
      });
      
    } else if (msgLower === '/ordens') {
      const ordens = await prisma.ordemServico.findMany({
        where: { 
          status: { in: ['aberta', 'em_andamento', 'aguardando_peca'] }
        }
      });
      
      resposta = `🏍️ *Ordens em Aberto*\n\n`;
      resposta += `Total: ${ordens.length} ordem(ns)\n\n`;
      ordens.slice(0, 5).forEach((o: any) => {
        resposta += `• ${o.numero} - ${o.status}\n`;
      });
      
    } else if (msgLower === '/orcamentos') {
      const orcamentos = await prisma.orcamento.findMany({
        where: { status: 'pendente' }
      });
      
      resposta = `📋 *Orçamentos Pendentes*\n\n`;
      resposta += `Total: ${orcamentos.length} orçamento(s)`;
      
    } else {
      resposta = `❓ Comando não reconhecido. Envie /menu para ver os comandos.`;
    }
    
    res.json({ sucesso: true, resposta });
    
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API rodando em http://localhost:${port}`);
  console.log(`API acessível externamente em http://<seu-ip>:${port}`);
});
*/

/* DUPLICATE CODE COMMENTED OUT
    const { itens, fotos, ...ordemServicoData } = req.body;

    if (!ordemServicoData.clienteId || !ordemServicoData.motoId || !ordemServicoData.descricaoProblema) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const ultimaOrdem = await prisma.ordemServico.findFirst({
      orderBy: { numero: 'desc' },
    });

    let proximoNumero = 1;
    if (ultimaOrdem?.numero) {
      const numeroAtual = parseInt(ultimaOrdem.numero.replace(/\D/g, ''), 10);
      proximoNumero = Number.isNaN(numeroAtual) ? 1 : numeroAtual + 1;
    }

    const ordemServico = await prisma.ordemServico.create({
      data: {
        ...ordemServicoData,
        valorTotal: parseNumericOrZero(ordemServicoData.valorTotal),
        valorPago: parseNullableNumber(ordemServicoData.valorPago),
        garantia: parseNullableNumber(ordemServicoData.garantia),
        numero: `OS-${proximoNumero.toString().padStart(6, '0')}`,
        fotos: fotosToString(fotos),
        itens: Array.isArray(itens) && itens.length > 0 ? {
          create: itens.map(normalizeItemData),
        } : undefined,
      },
      include: { itens: true },
    });

    res.json(ordemServico);
  } catch (error) {
    console.error('Erro ao criar ordem de serviço:', error);
    res.status(500).json({
      error: 'Erro ao criar ordem de serviço',
      details: error,
    });
  }
});

app.put('/api/ordens-servico/:id', async (req, res) => {
  try {
    const { itens, fotos, orcamento, cliente, moto, ...ordemServicoData } = req.body;

    const ordemServicoDataSanitizada: Record<string, any> = {};
    Object.entries(ordemServicoData).forEach(([key, value]) => {
      if (value === undefined) return;

      if (['clienteId', 'motoId'].includes(key)) {
        if (value) {
          ordemServicoDataSanitizada[key] = value;
        }
        return;
      }

      if (key === 'orcamentoId') {
        ordemServicoDataSanitizada[key] = value || null;
        return;
      }

      if (['valorTotal', 'valorPago', 'garantia'].includes(key)) {
        const parsed = parseNullableNumber(value);
        if (parsed !== undefined) {
          ordemServicoDataSanitizada[key] = parsed;
        }
        return;
      }

      if (['dataInicio', 'dataPrevisao', 'dataConclusao', 'dataEntrega'].includes(key)) {
        ordemServicoDataSanitizada[key] = value ? parseNullableDate(value) : null;
        return;
      }

      const normalized = normalizeOptionalString(value);
      if (normalized !== undefined) {
        ordemServicoDataSanitizada[key] = normalized;
      }
    });

    if (ordemServicoDataSanitizada.clienteId) {
      const clienteExistente = await prisma.cliente.findUnique({
        where: { id: ordemServicoDataSanitizada.clienteId },
      });
      if (!clienteExistente) {
        return res.status(400).json({ error: 'Cliente não encontrado' });
      }
    }

    if (ordemServicoDataSanitizada.motoId) {
      const motoExistente = await prisma.moto.findUnique({
        where: { id: ordemServicoDataSanitizada.motoId },
      });
      if (!motoExistente) {
        return res.status(400).json({ error: 'Moto não encontrada' });
      }
    }

    if (ordemServicoDataSanitizada.orcamentoId) {
      const orcamentoExistente = await prisma.orcamento.findUnique({
        where: { id: ordemServicoDataSanitizada.orcamentoId },
      });
      if (!orcamentoExistente) {
        ordemServicoDataSanitizada.orcamentoId = null;
      }
    }

    const novosItens = await syncItens('ordemServico', req.params.id, itens);

    const ordemServico = await prisma.ordemServico.update({
      where: { id: req.params.id },
      data: {
        ...ordemServicoDataSanitizada,
        fotos: fotosToString(fotos),
        itens: novosItens.length > 0 ? { create: novosItens } : undefined,
      },
      include: { itens: true },
    });

    res.json(ordemServico);
  } catch (error) {
    console.error('Erro ao atualizar ordem de serviço:', error);
    res.status(500).json({ error: 'Erro ao atualizar ordem de serviço', details: error });
  }
});

app.delete('/api/ordens-servico/:id', async (req, res) => {
  try {
    await prisma.ordemServico.delete({ where: { id: req.params.id } });
    res.json({ message: 'Ordem de serviço deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar ordem de serviço:', error);
    res.status(500).json({ error: 'Erro ao deletar ordem de serviço' });
  }
});

/*

// Dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const ordensAbertas = await prisma.ordemServico.count({
      where: { status: 'aberta' },
    });
    
    const ordensEmAndamento = await prisma.ordemServico.count({
      where: { status: 'em_andamento' },
    });
    
    const ordensProntas = await prisma.ordemServico.count({
      where: { 
        status: { 
          in: ['pronta', 'entregue'] 
        } 
      },
    });
    
    const orcamentosPendentes = await prisma.orcamento.count({
      where: { status: 'pendente' },
    });
    
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const firstDayThisMonthAgain = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Buscar ordens finalizadas (pronta/entregue) baseado na dataConclusao ou dataEntrega
    const ordensThisMonth = await prisma.ordemServico.findMany({
      where: {
        status: { in: ['pronta', 'entregue'] },
        OR: [
          { dataConclusao: { gte: firstDayThisMonth, not: null } },
          { dataEntrega: { gte: firstDayThisMonth, not: null } }
        ]
      },
    });
    
    const ordensLastMonth = await prisma.ordemServico.findMany({
      where: {
        status: { in: ['pronta', 'entregue'] },
        OR: [
          { 
            dataConclusao: {
              gte: firstDayLastMonth,
              lt: firstDayThisMonthAgain,
              not: null
            }
          },
          { 
            dataEntrega: {
              gte: firstDayLastMonth,
              lt: firstDayThisMonthAgain,
              not: null
            }
          }
        ]
      },
    });
    
    const faturamentoMes = ordensThisMonth.reduce((sum: number, os: any) => sum + os.valorTotal, 0);
    const faturamentoMesAnterior = ordensLastMonth.reduce((sum: number, os: any) => sum + os.valorTotal, 0);
    
    res.json({
      ordensAbertas,
      ordensEmAndamento,
      ordensProntas,
      orcamentosPendentes,
      faturamentoMes,
      faturamentoMesAnterior,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Agendamentos
app.get('/api/agendamentos', async (req, res) => {
  try {
    const agendamentos = await prisma.agendamento.findMany({
      orderBy: { dataAgendada: 'asc' },
    });
    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

app.post('/api/agendamentos', async (req, res) => {
  try {
    const { dataAgendada, ...rest } = req.body;
    
    const agendamento = await prisma.agendamento.create({
      data: {
        ...rest,
        dataAgendada: new Date(dataAgendada),
        servicos: typeof rest.servicos === 'string' ? rest.servicos : JSON.stringify(rest.servicos),
      },
    });
    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

app.put('/api/agendamentos/:id', async (req, res) => {
  try {
    const { dataAgendada, servicos, ...rest } = req.body;
    
    const agendamento = await prisma.agendamento.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(dataAgendada && { dataAgendada: new Date(dataAgendada) }),
        ...(servicos && { servicos: typeof servicos === 'string' ? servicos : JSON.stringify(servicos) }),
      },
    });
    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
});

app.delete('/api/agendamentos/:id', async (req, res) => {
  try {
    await prisma.agendamento.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    res.status(500).json({ error: 'Erro ao deletar agendamento' });
  }
});

// ============= SERVIÇOS =============
app.get('/api/servicos', async (req, res) => {
  try {
    const servicos = await prisma.servico.findMany({
      orderBy: { nome: 'asc' },
    });
    res.json(servicos);
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

app.post('/api/servicos', async (req, res) => {
  try {
    const servico = await prisma.servico.create({
      data: req.body,
    });
    res.json(servico);
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
});

app.put('/api/servicos/:id', async (req, res) => {
  try {
    const servico = await prisma.servico.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(servico);
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ error: 'Erro ao atualizar serviço' });
  }
});

app.delete('/api/servicos/:id', async (req, res) => {
  try {
    await prisma.servico.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    res.status(500).json({ error: 'Erro ao deletar serviço' });
  }
});

// ============= PEÇAS =============
app.get('/api/pecas', async (req, res) => {
  try {
    const pecas = await prisma.peca.findMany({
      orderBy: { nome: 'asc' },
    });
    res.json(pecas);
  } catch (error) {
    console.error('Erro ao buscar peças:', error);
    res.status(500).json({ error: 'Erro ao buscar peças' });
  }
});

app.post('/api/pecas', async (req, res) => {
  try {
    const peca = await prisma.peca.create({
      data: req.body,
    });
    res.json(peca);
  } catch (error) {
    console.error('Erro ao criar peça:', error);
    res.status(500).json({ error: 'Erro ao criar peça' });
  }
});

app.put('/api/pecas/:id', async (req, res) => {
  try {
    const peca = await prisma.peca.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(peca);
  } catch (error) {
    console.error('Erro ao atualizar peça:', error);
    res.status(500).json({ error: 'Erro ao atualizar peça' });
  }
});

app.delete('/api/pecas/:id', async (req, res) => {
  try {
    await prisma.peca.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar peça:', error);
    res.status(500).json({ error: 'Erro ao deletar peça' });
  }
});

*/

// ============ LISTA DE PEDIDOS ============

// Listar todos os itens de pedido
app.get('/api/pedidos', async (req, res) => {
  try {
    const pedidos = await (prisma as any).itemPedido.findMany({
      orderBy: [
        { status: 'asc' },
        { urgencia: 'desc' },
        { dataCriacao: 'desc' }
      ]
    });
    res.json(pedidos);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

// Criar item de pedido
app.post('/api/pedidos', async (req, res) => {
  try {
    const pedido = await (prisma as any).itemPedido.create({
      data: req.body
    });
    res.status(201).json(pedido);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

// Atualizar item de pedido
app.put('/api/pedidos/:id', async (req, res) => {
  try {
    const pedido = await (prisma as any).itemPedido.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(pedido);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    res.status(500).json({ error: 'Erro ao atualizar pedido' });
  }
});

// Deletar item de pedido
app.delete('/api/pedidos/:id', async (req, res) => {
  try {
    await (prisma as any).itemPedido.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar pedido:', error);
    res.status(500).json({ error: 'Erro ao deletar pedido' });
  }
});

// Adicionar múltiplos itens de pedido (para vendas/OS)
app.post('/api/pedidos/bulk', async (req, res) => {
  try {
    const { itens } = req.body;
    const pedidos = await (prisma as any).itemPedido.createMany({
      data: itens
    });
    res.status(201).json(pedidos);
  } catch (error) {
    console.error('Erro ao criar pedidos em massa:', error);
    res.status(500).json({ error: 'Erro ao criar pedidos' });
  }
});

// Verificar e adicionar peças com estoque baixo à lista de pedidos
app.post('/api/pedidos/verificar-estoque', async (req, res) => {
  try {
    const limiteEstoque = req.body.limite || 5;
    
    // Buscar peças com estoque abaixo do limite (incluindo null que é tratado como 0)
    const todasPecas = await prisma.peca.findMany();
    
    // Filtrar peças com estoque baixo (null é tratado como 0)
    const pecasEstoqueBaixo = todasPecas.filter(p => {
      const estoque = p.estoque ?? 0;
      return estoque < limiteEstoque;
    });

    // Buscar pedidos pendentes existentes para não duplicar
    const pedidosPendentes = await (prisma as any).itemPedido.findMany({
      where: {
        status: { in: ['pendente', 'pedido'] },
        origem: 'estoque_baixo'
      }
    });

    const pecasJaNoPedido = new Set(pedidosPendentes.map((p: any) => p.pecaId).filter(Boolean));
    
    // Filtrar peças que ainda não estão na lista de pedidos
    const pecasParaAdicionar = pecasEstoqueBaixo.filter(p => !pecasJaNoPedido.has(p.id));

    // Criar pedidos para cada peça
    const novosPedidos = [];
    for (const peca of pecasParaAdicionar) {
      const estoqueAtual = peca.estoque ?? 0;
      const urgencia = estoqueAtual === 0 ? 'urgente' : estoqueAtual <= 2 ? 'alta' : 'normal';
      const quantidadeSugerida = Math.max(5 - estoqueAtual, 1);
      
      const pedido = await (prisma as any).itemPedido.create({
        data: {
          nome: peca.nome,
          quantidade: quantidadeSugerida,
          precoEstimado: peca.preco,
          categoria: 'Peça',
          fornecedor: peca.fornecedor,
          urgencia: urgencia,
          status: 'pendente',
          origem: 'estoque_baixo',
          pecaId: peca.id,
          observacoes: `Estoque atual: ${estoqueAtual} - Adicionado automaticamente`
        }
      });
      novosPedidos.push(pedido);
    }

    res.json({
      mensagem: `${novosPedidos.length} itens adicionados à lista de pedidos`,
      pecasVerificadas: pecasEstoqueBaixo.length,
      pecasAdicionadas: novosPedidos.length,
      pedidos: novosPedidos
    });
  } catch (error) {
    console.error('Erro ao verificar estoque:', error);
    res.status(500).json({ error: 'Erro ao verificar estoque' });
  }
});
