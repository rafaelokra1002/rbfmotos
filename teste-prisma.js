const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('\n=== TESTE RÁPIDO ===\n');

const props = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')).sort();

console.log('Modelos disponíveis:', props.join(', '));
console.log('\nProcurando movimentacaoCaixa...');
console.log('Encontrado:', props.includes('movimentacaoCaixa') ? '✓ SIM' : '✗ NÃO');

if (!props.includes('movimentacaoCaixa')) {
  console.log('\n❌ PROBLEMA: movimentacaoCaixa NÃO está no Prisma Client!');
  console.log('\n📋 SOLUÇÃO:');
  console.log('1. Pare o servidor (Ctrl+C no terminal do servidor)');
  console.log('2. Execute: npx prisma generate');
  console.log('3. Inicie: npm run server');
} else {
  console.log('\n✓ Tudo OK! O modelo existe.');
}

prisma.$disconnect();
