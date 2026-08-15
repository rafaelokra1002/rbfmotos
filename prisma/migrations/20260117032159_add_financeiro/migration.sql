/*
  Warnings:

  - You are about to drop the column `formasPagamento` on the `ordens_servico` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "itens_orcamento" ADD COLUMN "unidade" TEXT;
ALTER TABLE "itens_orcamento" ADD COLUMN "volumeMl" INTEGER;

-- AlterTable
ALTER TABLE "pecas" ADD COLUMN "estoqueMinimo" INTEGER;
ALTER TABLE "pecas" ADD COLUMN "fornecedor" TEXT;
ALTER TABLE "pecas" ADD COLUMN "localizacao" TEXT;
ALTER TABLE "pecas" ADD COLUMN "ultimaCompra" DATETIME;

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ordemServicoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "parcela" INTEGER,
    "totalParcelas" INTEGER,
    "dataPagamento" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataVencimento" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pago',
    "pixChave" TEXT,
    "pixQrCode" TEXT,
    "comprovante" TEXT,
    "observacoes" TEXT
);

-- CreateTable
CREATE TABLE "movimentacoes_estoque" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pecaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valorUnitario" REAL,
    "motivo" TEXT NOT NULL,
    "ordemServicoId" TEXT,
    "usuarioId" TEXT,
    "observacoes" TEXT,
    "dataMovimento" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "movimentacoes_estoque_pecaId_fkey" FOREIGN KEY ("pecaId") REFERENCES "pecas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "relatorios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "dataInicio" DATETIME NOT NULL,
    "dataFim" DATETIME NOT NULL,
    "dados" TEXT NOT NULL,
    "geradoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "geradoPor" TEXT
);

-- CreateTable
CREATE TABLE "mecanicos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "cpf" TEXT,
    "especialidade" TEXT,
    "salario" REAL,
    "dataAdmissao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "observacoes" TEXT
);

-- CreateTable
CREATE TABLE "CategoriaFinanceira" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "icone" TEXT NOT NULL DEFAULT '📦',
    "cor" TEXT NOT NULL DEFAULT '#6b7280',
    "oficinaId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ContaPagar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "descricao" TEXT NOT NULL,
    "fornecedor" TEXT,
    "valorTotal" REAL NOT NULL,
    "dataVencimento" DATETIME NOT NULL,
    "frequencia" TEXT NOT NULL,
    "valorParcela" REAL NOT NULL,
    "observacoes" TEXT,
    "categoriaId" TEXT NOT NULL,
    "compraPecaId" TEXT,
    "oficinaId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContaPagar_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaFinanceira" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ContaPagar_compraPecaId_fkey" FOREIGN KEY ("compraPecaId") REFERENCES "pecas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ParcelaPagar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contaPagarId" TEXT NOT NULL,
    "numeroParcela" INTEGER NOT NULL,
    "dataVencimento" DATETIME NOT NULL,
    "valor" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ParcelaPagar_contaPagarId_fkey" FOREIGN KEY ("contaPagarId") REFERENCES "ContaPagar" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PagamentoSaida" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parcelaPagarId" TEXT NOT NULL,
    "dataPagamento" DATETIME NOT NULL,
    "valorPago" REAL NOT NULL,
    "formaPagamento" TEXT NOT NULL,
    "observacao" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PagamentoSaida_parcelaPagarId_fkey" FOREIGN KEY ("parcelaPagarId") REFERENCES "ParcelaPagar" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContaReceber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "descricao" TEXT NOT NULL,
    "clienteId" TEXT,
    "clienteNome" TEXT NOT NULL,
    "valorTotal" REAL NOT NULL,
    "dataVencimento" DATETIME NOT NULL,
    "frequencia" TEXT NOT NULL,
    "valorParcela" REAL NOT NULL,
    "observacoes" TEXT,
    "categoriaId" TEXT NOT NULL,
    "ordemServicoId" TEXT,
    "oficinaId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContaReceber_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ContaReceber_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaFinanceira" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ContaReceber_ordemServicoId_fkey" FOREIGN KEY ("ordemServicoId") REFERENCES "ordens_servico" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ParcelaReceber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contaReceberId" TEXT NOT NULL,
    "numeroParcela" INTEGER NOT NULL,
    "dataVencimento" DATETIME NOT NULL,
    "valor" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ParcelaReceber_contaReceberId_fkey" FOREIGN KEY ("contaReceberId") REFERENCES "ContaReceber" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recebimento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parcelaReceberId" TEXT NOT NULL,
    "dataRecebimento" DATETIME NOT NULL,
    "valorRecebido" REAL NOT NULL,
    "formaPagamento" TEXT NOT NULL,
    "observacao" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Recebimento_parcelaReceberId_fkey" FOREIGN KEY ("parcelaReceberId") REFERENCES "ParcelaReceber" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MetaFinanceira" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valorMeta" REAL NOT NULL,
    "valorAtual" REAL NOT NULL DEFAULT 0,
    "dataInicio" DATETIME NOT NULL,
    "dataFim" DATETIME NOT NULL,
    "descricao" TEXT,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "oficinaId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_agendamentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "motoId" TEXT,
    "dataAgendada" DATETIME NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,
    "servicos" TEXT NOT NULL,
    "mecanico" TEXT,
    "status" TEXT NOT NULL DEFAULT 'agendado',
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_agendamentos" ("clienteId", "criadoEm", "dataAgendada", "horaFim", "horaInicio", "id", "mecanico", "motoId", "observacoes", "servicos", "status") SELECT "clienteId", "criadoEm", "dataAgendada", "horaFim", "horaInicio", "id", "mecanico", "motoId", "observacoes", "servicos", "status" FROM "agendamentos";
DROP TABLE "agendamentos";
ALTER TABLE "new_agendamentos" RENAME TO "agendamentos";
CREATE TABLE "new_ordens_servico" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "motoId" TEXT NOT NULL,
    "orcamentoId" TEXT,
    "descricaoProblema" TEXT NOT NULL,
    "diagnostico" TEXT,
    "observacoes" TEXT,
    "observacoesTecnicas" TEXT,
    "fotos" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aberta',
    "prioridade" TEXT NOT NULL DEFAULT 'media',
    "dataAbertura" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataInicio" DATETIME,
    "dataPrevisao" DATETIME,
    "dataConclusao" DATETIME,
    "dataEntrega" DATETIME,
    "valorTotal" REAL NOT NULL,
    "valorPago" REAL,
    "formaPagamento" TEXT,
    "garantia" INTEGER,
    "tecnicoResponsavel" TEXT,
    CONSTRAINT "ordens_servico_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ordens_servico_motoId_fkey" FOREIGN KEY ("motoId") REFERENCES "motos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ordens_servico_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES "orcamentos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ordens_servico" ("clienteId", "dataAbertura", "dataConclusao", "dataEntrega", "dataInicio", "dataPrevisao", "descricaoProblema", "diagnostico", "formaPagamento", "fotos", "garantia", "id", "motoId", "numero", "observacoes", "observacoesTecnicas", "orcamentoId", "prioridade", "status", "tecnicoResponsavel", "valorPago", "valorTotal") SELECT "clienteId", "dataAbertura", "dataConclusao", "dataEntrega", "dataInicio", "dataPrevisao", "descricaoProblema", "diagnostico", "formaPagamento", "fotos", "garantia", "id", "motoId", "numero", "observacoes", "observacoesTecnicas", "orcamentoId", "prioridade", "status", "tecnicoResponsavel", "valorPago", "valorTotal" FROM "ordens_servico";
DROP TABLE "ordens_servico";
ALTER TABLE "new_ordens_servico" RENAME TO "ordens_servico";
CREATE UNIQUE INDEX "ordens_servico_numero_key" ON "ordens_servico"("numero");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ContaPagar_dataVencimento_idx" ON "ContaPagar"("dataVencimento");

-- CreateIndex
CREATE INDEX "ContaPagar_categoriaId_idx" ON "ContaPagar"("categoriaId");

-- CreateIndex
CREATE INDEX "ParcelaPagar_contaPagarId_dataVencimento_idx" ON "ParcelaPagar"("contaPagarId", "dataVencimento");

-- CreateIndex
CREATE UNIQUE INDEX "PagamentoSaida_parcelaPagarId_key" ON "PagamentoSaida"("parcelaPagarId");

-- CreateIndex
CREATE INDEX "ContaReceber_dataVencimento_idx" ON "ContaReceber"("dataVencimento");

-- CreateIndex
CREATE INDEX "ContaReceber_clienteId_idx" ON "ContaReceber"("clienteId");

-- CreateIndex
CREATE INDEX "ParcelaReceber_contaReceberId_dataVencimento_idx" ON "ParcelaReceber"("contaReceberId", "dataVencimento");

-- CreateIndex
CREATE UNIQUE INDEX "Recebimento_parcelaReceberId_key" ON "Recebimento"("parcelaReceberId");
