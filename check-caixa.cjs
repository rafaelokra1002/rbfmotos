const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCaixa() {
  try {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    console.log('\n=== DATAS DE REFERÊNCIA ===');
    console.log('Hoje:', hoje.toISOString());
    console.log('Início do mês:', inicioMes.toISOString());

    // Buscar TODAS as movimentações do caixa
    const todasMovimentacoes = await prisma.movimentacaoCaixa.findMany({
      select: {
        descricao: true,
        valor: true,
        tipo: true,
        categoria: true,
        data: true
      }
    });

    console.log('\n=== TODAS AS MOVIMENTAÇÕES DO CAIXA ===');
    console.log('Total:', todasMovimentacoes.length);
    todasMovimentacoes.forEach(m => {
      console.log(`- [${m.tipo}] ${m.categoria || 'SEM CATEGORIA'}: ${m.descricao} = R$ ${m.valor}`);
      console.log(`  data: ${m.data}`);
    });

    // Buscar entradas do mês
    const entradasMes = await prisma.movimentacaoCaixa.findMany({
      where: {
        tipo: 'entrada',
        data: {
          gte: inicioMes,
          lte: hoje
        }
      }
    });

    console.log('\n=== ENTRADAS DO MÊS ===');
    let totalEntradas = 0;
    entradasMes.forEach(m => {
      console.log(`- ${m.categoria}: ${m.descricao} = R$ ${m.valor}`);
      totalEntradas += m.valor;
    });
    console.log('TOTAL ENTRADAS MÊS:', totalEntradas);

    // Verificar filtro atual do server (categoria = "Venda de Serviço")
    const entradasVendaServico = await prisma.movimentacaoCaixa.findMany({
      where: {
        tipo: 'entrada',
        categoria: 'Venda de Serviço',
        data: {
          gte: inicioMes,
          lte: hoje
        }
      }
    });

    console.log('\n=== ENTRADAS COM CATEGORIA "Venda de Serviço" (filtro atual) ===');
    console.log('Total:', entradasVendaServico.length);
    entradasVendaServico.forEach(m => {
      console.log(`- ${m.descricao} = R$ ${m.valor}`);
    });

    // Listar categorias únicas
    const categorias = [...new Set(todasMovimentacoes.map(m => m.categoria || 'NULL'))];
    console.log('\n=== CATEGORIAS EXISTENTES ===');
    categorias.forEach(c => console.log(`- "${c}"`));

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCaixa();
