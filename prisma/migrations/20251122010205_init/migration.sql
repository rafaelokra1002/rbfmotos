-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "endereco" TEXT,
    "cpf" TEXT,
    "dataCadastro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "motos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "placa" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "km" INTEGER,
    "observacoes" TEXT,
    CONSTRAINT "motos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "servicos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" REAL NOT NULL,
    "categoria" TEXT NOT NULL,
    "tempoEstimado" INTEGER
);

-- CreateTable
CREATE TABLE "pecas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "codigo" TEXT,
    "preco" REAL NOT NULL,
    "categoria" TEXT NOT NULL,
    "estoque" INTEGER
);

-- CreateTable
CREATE TABLE "itens_orcamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orcamentoId" TEXT,
    "ordemServicoId" TEXT,
    "tipo" TEXT NOT NULL,
    "itemId" TEXT,
    "nome" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnitario" REAL NOT NULL,
    "desconto" REAL,
    CONSTRAINT "itens_orcamento_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES "orcamentos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "itens_orcamento_ordemServicoId_fkey" FOREIGN KEY ("ordemServicoId") REFERENCES "ordens_servico" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "itens_orcamento_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "servicos" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "itens_orcamento_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "pecas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orcamentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "motoId" TEXT NOT NULL,
    "descricaoProblema" TEXT NOT NULL,
    "observacoes" TEXT,
    "valorTotal" REAL NOT NULL,
    "desconto" REAL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "dataEmissao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validadeAte" DATETIME NOT NULL,
    "aprovadoEm" DATETIME,
    CONSTRAINT "orcamentos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orcamentos_motoId_fkey" FOREIGN KEY ("motoId") REFERENCES "motos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ordens_servico" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "motoId" TEXT NOT NULL,
    "orcamentoId" TEXT,
    "descricaoProblema" TEXT NOT NULL,
    "diagnostico" TEXT,
    "observacoes" TEXT,
    "observacoesTecnicas" TEXT,
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

-- CreateIndex
CREATE UNIQUE INDEX "motos_placa_key" ON "motos"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "orcamentos_numero_key" ON "orcamentos"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "ordens_servico_numero_key" ON "ordens_servico"("numero");
