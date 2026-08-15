import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Categorias padrão de despesas
  const despesas = [
    { nome: 'Peças/Fornecedores', tipo: 'DESPESA', icone: '🛠️', cor: '#f87171' },
    { nome: 'Salários/Mecânicos', tipo: 'DESPESA', icone: '👨‍🔧', cor: '#fbbf24' },
    { nome: 'Aluguel', tipo: 'DESPESA', icone: '🏠', cor: '#60a5fa' },
    { nome: 'Energia/Água', tipo: 'DESPESA', icone: '💡', cor: '#34d399' },
    { nome: 'Impostos', tipo: 'DESPESA', icone: '💸', cor: '#a78bfa' },
    { nome: 'Outros', tipo: 'DESPESA', icone: '📦', cor: '#6b7280' },
  ];
  // Categorias padrão de receitas
  const receitas = [
    { nome: 'Serviços', tipo: 'RECEITA', icone: '🧰', cor: '#38bdf8' },
    { nome: 'Venda de Peças', tipo: 'RECEITA', icone: '🔩', cor: '#facc15' },
    { nome: 'Outros', tipo: 'RECEITA', icone: '💵', cor: '#22d3ee' },
  ];

  // Oficina padrão (multi-oficina: ajuste conforme necessário)
  const oficinaId = 'default-oficina';

  for (const cat of [...despesas, ...receitas]) {
    await prisma.categoriaFinanceira.create({
      data: {
        nome: cat.nome,
        tipo: cat.tipo as any, // Enum
        icone: cat.icone,
        cor: cat.cor,
        oficinaId
      }
    });
  }

  console.log('Categorias financeiras padrão criadas!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
