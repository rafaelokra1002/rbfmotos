-- AlterTable / CreateTable
-- Make motoId optional in agendamentos table (or create if not exists)

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS "agendamentos" (
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
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "agendamentos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "agendamentos_motoId_fkey" FOREIGN KEY ("motoId") REFERENCES "motos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
