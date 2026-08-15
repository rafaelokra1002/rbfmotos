const fetch = require('node-fetch');

async function testarCaixa() {
  try {
    console.log('🔍 Buscando movimentações do caixa...\n');
    
    const response = await fetch('http://localhost:9001/api/caixa');
    const data = await response.json();
    
    console.log('✅ Total de movimentações:', data.length);
    console.log('\n📊 Resumo:');
    
    const entradas = data.filter(m => m.tipo === 'entrada');
    const saidas = data.filter(m => m.tipo === 'saida');
    
    const totalEntradas = entradas.reduce((sum, m) => sum + m.valor, 0);
    const totalSaidas = saidas.reduce((sum, m) => sum + m.valor, 0);
    
    console.log(`💰 Entradas: ${entradas.length} - R$ ${totalEntradas.toFixed(2)}`);
    console.log(`💸 Saídas: ${saidas.length} - R$ ${totalSaidas.toFixed(2)}`);
    console.log(`💵 Saldo: R$ ${(totalEntradas - totalSaidas).toFixed(2)}`);
    
    if (data.length > 0) {
      console.log('\n📋 Primeiras 3 movimentações:');
      data.slice(0, 3).forEach((m, i) => {
        console.log(`\n${i + 1}. ${m.descricao}`);
        console.log(`   Tipo: ${m.tipo} | Valor: R$ ${m.valor} | Data: ${new Date(m.data).toLocaleDateString('pt-BR')}`);
        console.log(`   Forma: ${m.formaPagamento}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testarCaixa();
