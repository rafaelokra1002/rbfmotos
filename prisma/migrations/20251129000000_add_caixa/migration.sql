-- CreateTable
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
