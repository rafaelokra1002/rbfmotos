-- CreateTable
CREATE TABLE "itens_pedido" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "precoEstimado" REAL,
    "categoria" TEXT,
    "fornecedor" TEXT,
    "urgencia" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "origem" TEXT,
    "origemId" TEXT,
    "pecaId" TEXT,
    "observacoes" TEXT,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAtualizacao" DATETIME NOT NULL,
    "dataPedido" DATETIME,
    "dataRecebimento" DATETIME
);
