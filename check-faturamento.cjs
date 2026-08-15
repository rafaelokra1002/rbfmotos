const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFaturamento() {
  try {
    // Verificar datas do mês atual
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    console.log('\n=== DATAS DE REFERÊNCIA ===');
    console.log('Hoje:', hoje.toISOString());
    console.log('Início do mês:', inicioMes.toISOString());

    // Buscar movimentações do CAIXA (entradas)
    const movimentacoesCaixa = await prisma.movimentacaoCaixa.findMany({
      where: {
        tipo: 'entrada',
        dataHora: {
          gte: inicioMes,
          lte: hoje
        }
      },
      select: {
        descricao: true,
        valor: true,
        tipo: true,
        dataHora: true
      }
    });

    console.log('\n=== MOVIMENTAÇÕES DO CAIXA (ENTRADAS DO MÊS) ===');
    console.log('Total de entradas:', movimentacoesCaixa.length);
    let totalEntradas = 0;
    movimentacoesCaixa.forEach(m => {
      console.log(`- ${m.descricao}: R$ ${m.valor} | ${m.dataHora}`);
      totalEntradas += m.valor;
    });
    console.log('TOTAL ENTRADAS:', totalEntradas);

    // Buscar ordens finalizadas
    const ordens = await prisma.ordemServico.findMany({
      where: {
        status: { in: ['pronta', 'entregue'] }
      },
      select: {
        numero: true,
        status: true,
        valorTotal: true,
        dataConclusao: true,
        dataEntrega: true,
        dataAbertura: true
      }
    });

    console.log('\n=== ORDENS FINALIZADAS ===');
    console.log('Total de ordens com status pronta/entregue:', ordens.length);
    
    if (ordens.length > 0) {
      console.log('\nDetalhes:');
      ordens.forEach(o => {
        console.log(`- OS ${o.numero}: R$ ${o.valorTotal} | Status: ${o.status}`);
        console.log(`  dataConclusao: ${o.dataConclusao}`);
        console.log(`  dataEntrega: ${o.dataEntrega}`);
        console.log(`  dataAbertura: ${o.dataAbertura}`);
      });
    }

    // Verificar datas do mês atual
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    console.log('\n=== DATAS DE REFERÊNCIA ===');
    console.log('Hoje:', hoje.toISOString());
    console.log('Início do mês:', inicioMes.toISOString());

    // Calcular faturamento
    let faturamentoMes = 0;
    ordens.forEach(o => {
      const dataRef = o.dataConclusao || o.dataEntrega;
      if (dataRef) {
        const data = new Date(dataRef);
        if (data >= inicioMes && data <= hoje) {
          faturamentoMes += o.valorTotal || 0;
          console.log(`\n✅ Ordem ${o.numero} conta para faturamento: R$ ${o.valorTotal}`);
        }
      } else {
        console.log(`\n⚠️ Ordem ${o.numero} SEM data de conclusão/entrega`);
      }
    });

    console.log('\n=== RESULTADO ===');
    console.log('Faturamento do mês:', faturamentoMes);

    // Verificar TODAS as ordens
    const todasOrdens = await prisma.ordemServico.findMany({
      select: {
        numero: true,
        status: true,
        valorTotal: true
      }
    });
    
    console.log('\n=== TODAS AS ORDENS ===');
    console.log('Total de ordens:', todasOrdens.length);
    todasOrdens.forEach(o => {
      console.log(`- OS ${o.numero}: R$ ${o.valorTotal} | Status: ${o.status}`);
    });

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFaturamento();
