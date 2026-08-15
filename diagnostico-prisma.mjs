import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';

const prisma = new PrismaClient();

console.log('\n=== DIAGNÓSTICO COMPLETO ===\n');

// 1. Verificar modelos disponíveis no Prisma Client
console.log('1. MODELOS NO PRISMA CLIENT:');
const models = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')).sort();
console.log(models);
console.log('\n✓ Total de modelos:', models.length);
console.log('✓ Tem movimentacaoCaixa?', models.includes('movimentacaoCaixa') ? 'SIM' : 'NÃO');

// 2. Verificar tabelas no banco de dados
console.log('\n2. TABELAS NO BANCO DE DADOS:');
try {
  const db = new Database('./prisma/dev.db', { readonly: true });
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  console.log(tables.map(t => t.name));
  console.log('\n✓ Total de tabelas:', tables.length);
  console.log('✓ Tem movimentacoes_caixa?', tables.some(t => t.name === 'movimentacoes_caixa') ? 'SIM' : 'NÃO');
  db.close();
} catch (error) {
  console.log('❌ Erro ao acessar banco:', error.message);
}

// 3. Testar acesso ao modelo
console.log('\n3. TESTE DE ACESSO:');
try {
  if (prisma.movimentacaoCaixa) {
    console.log('✓ prisma.movimentacaoCaixa está definido');
    const count = await prisma.movimentacaoCaixa.count();
    console.log('✓ Registros na tabela:', count);
  } else {
    console.log('❌ prisma.movimentacaoCaixa é UNDEFINED');
    console.log('\nSOLUÇÃO:');
    console.log('1. Pare o servidor (Ctrl+C)');
    console.log('2. Rode: npx prisma generate');
    console.log('3. Reinicie: npm run dev');
  }
} catch (error) {
  console.log('❌ Erro ao testar:', error.message);
}

await prisma.$disconnect();
