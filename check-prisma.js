const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('\n=== PRISMA CLIENT CHECK ===\n');

const models = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')).sort();

console.log('Available models:', models);
console.log('\nLooking for movimentacaoCaixa:', models.includes('movimentacaoCaixa') ? '✓ FOUND' : '✗ NOT FOUND');

if (!models.includes('movimentacaoCaixa')) {
  console.log('\n⚠️  movimentacaoCaixa model NOT found in Prisma Client!');
  console.log('You need to:');
  console.log('1. Stop the server (Ctrl+C)');
  console.log('2. Run: npx prisma generate');
  console.log('3. Run: npm run dev');
}

prisma.$disconnect();
