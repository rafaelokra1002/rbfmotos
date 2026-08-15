-- Adicionar coluna formasPagamento na tabela ordens_servico
ALTER TABLE ordens_servico ADD COLUMN formasPagamento TEXT;

-- Verificar se a coluna foi criada
PRAGMA table_info(ordens_servico);
