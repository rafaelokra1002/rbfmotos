// Script para migrar ordens de serviço finalizadas para o caixa
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrarOrdensParaCaixa() {
  try {
    console.log('🔄 Iniciando migração de ordens para o caixa...\n');

    // Buscar todas as ordens finalizadas (pronta ou entregue)
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

    console.log(`📊 Encontradas ${ordensFinalizadas.length} ordens finalizadas\n`);

    if (ordensFinalizadas.length === 0) {
      console.log('✅ Nenhuma ordem para migrar.');
      return;
    }

    let migradas = 0;
    let erros = 0;
    let jaMigradas = 0;

    for (const ordem of ordensFinalizadas) {
      try {
        // Verificar se já existe movimentação para esta OS
        const movimentacaoExistente = await prisma.movimentacaoCaixa.findFirst({
          where: {
            ordemServicoId: ordem.id
          }
        });

        if (movimentacaoExistente) {
          console.log(`⏭️  OS ${ordem.numero} já tem movimentação no caixa - pulando`);
          jaMigradas++;
          continue;
        }

        // Determinar a data da movimentação
        // Prioridade: dataConclusao > dataEntrega > dataAbertura
        const dataMovimentacao = ordem.dataConclusao || ordem.dataEntrega || ordem.dataAbertura;

        // Criar movimentação no caixa
        await prisma.movimentacaoCaixa.create({
          data: {
            tipo: 'entrada',
            categoria: 'Venda de Serviço',
            descricao: `OS #${ordem.numero} - ${ordem.descricaoProblema}`,
            valor: ordem.valorTotal,
            formaPagamento: ordem.formaPagamento || 'dinheiro',
            data: new Date(dataMovimentacao),
            ordemServicoId: ordem.id,
            observacoes: `Migração automática - OS finalizada em ${new Date(dataMovimentacao).toLocaleDateString('pt-BR')}`
          }
        });

        console.log(`✅ OS ${ordem.numero} migrada - R$ ${ordem.valorTotal.toFixed(2)} (${new Date(dataMovimentacao).toLocaleDateString('pt-BR')})`);
        migradas++;

      } catch (error) {
        console.error(`❌ Erro ao migrar OS ${ordem.numero}:`, error.message);
        erros++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📈 RESUMO DA MIGRAÇÃO');
    console.log('='.repeat(50));
    console.log(`✅ Migradas com sucesso: ${migradas}`);
    console.log(`⏭️  Já existentes: ${jaMigradas}`);
    console.log(`❌ Erros: ${erros}`);
    console.log(`📊 Total processadas: ${ordensFinalizadas.length}`);
    console.log('='.repeat(50) + '\n');

    if (migradas > 0) {
      // Calcular total migrado
      const totalMigrado = ordensFinalizadas
        .slice(0, migradas)
        .reduce((sum, o) => sum + o.valorTotal, 0);
      
      console.log(`💰 Total em valores migrados: R$ ${totalMigrado.toFixed(2)}\n`);
    }

    console.log('✨ Migração concluída!');

  } catch (error) {
    console.error('❌ Erro geral na migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração
migrarOrdensParaCaixa();
