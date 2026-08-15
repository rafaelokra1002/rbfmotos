const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando banco de dados...\n');

// Listar todas as tabelas
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('❌ Erro ao listar tabelas:', err);
    return;
  }
  
  console.log('📋 Tabelas existentes:');
  tables.forEach(table => console.log('  -', table.name));
  
  const hasMovimentacoes = tables.some(t => t.name === 'movimentacoes_caixa');
  
  if (!hasMovimentacoes) {
    console.log('\n⚠️  Tabela movimentacoes_caixa NÃO existe!');
    console.log('📝 Criando tabela...\n');
    
    const createTableSQL = `
      CREATE TABLE "movimentacoes_caixa" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "tipo" TEXT NOT NULL,
        "categoria" TEXT NOT NULL,
        "descricao" TEXT NOT NULL,
        "valor" REAL NOT NULL,
        "formaPagamento" TEXT NOT NULL,
        "data" DATETIME NOT NULL,
        "ordemServicoId" TEXT,
        "observacoes" TEXT,
        "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    db.run(createTableSQL, (err) => {
      if (err) {
        console.error('❌ Erro ao criar tabela:', err);
      } else {
        console.log('✅ Tabela movimentacoes_caixa criada com sucesso!');
      }
      db.close();
    });
  } else {
    console.log('\n✅ Tabela movimentacoes_caixa já existe!');
    
    // Verificar estrutura da tabela
    db.all("PRAGMA table_info(movimentacoes_caixa)", (err, columns) => {
      if (err) {
        console.error('❌ Erro ao verificar colunas:', err);
      } else {
        console.log('\n📊 Estrutura da tabela:');
        columns.forEach(col => {
          console.log(`  - ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}`);
        });
      }
      db.close();
    });
  }
});
