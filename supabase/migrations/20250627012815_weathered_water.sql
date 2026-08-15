/*
  # Schema Completo para Sistema de Oficina de Motos

  1. Novas Tabelas
    - `clientes` - Dados dos clientes da oficina
    - `motos` - Motocicletas cadastradas
    - `servicos` - Catálogo de serviços oferecidos
    - `pecas` - Catálogo de peças disponíveis
    - `orcamentos` - Orçamentos emitidos
    - `ordens_servico` - Ordens de serviço

  2. Segurança
    - Habilita RLS em todas as tabelas
    - Políticas para usuários autenticados

  3. Funcionalidades
    - Relacionamentos entre tabelas
    - Campos para controle de status
    - Campos para valores e datas
    - Campos JSON para itens flexíveis
*/

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  telefone text NOT NULL,
  email text,
  endereco text,
  cpf text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Motos
CREATE TABLE IF NOT EXISTS motos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  marca text NOT NULL,
  modelo text NOT NULL,
  ano integer NOT NULL,
  placa text NOT NULL,
  cor text,
  km integer,
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Serviços
CREATE TABLE IF NOT EXISTS servicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  preco decimal(10,2) NOT NULL DEFAULT 0,
  categoria text NOT NULL DEFAULT 'outros',
  tempo_estimado integer, -- em minutos
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Peças
CREATE TABLE IF NOT EXISTS pecas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  codigo text,
  preco decimal(10,2) NOT NULL DEFAULT 0,
  categoria text NOT NULL,
  estoque integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Orçamentos
CREATE TABLE IF NOT EXISTS orcamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text NOT NULL UNIQUE,
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  moto_id uuid REFERENCES motos(id) ON DELETE CASCADE,
  itens jsonb NOT NULL DEFAULT '[]',
  descricao_problema text NOT NULL,
  observacoes text,
  valor_total decimal(10,2) NOT NULL DEFAULT 0,
  desconto decimal(10,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'pendente',
  data_emissao timestamptz DEFAULT now(),
  validade_ate timestamptz,
  aprovado_em timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Ordens de Serviço
CREATE TABLE IF NOT EXISTS ordens_servico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text NOT NULL UNIQUE,
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  moto_id uuid REFERENCES motos(id) ON DELETE CASCADE,
  orcamento_id uuid REFERENCES orcamentos(id),
  itens jsonb NOT NULL DEFAULT '[]',
  descricao_problema text NOT NULL,
  diagnostico text,
  observacoes text,
  observacoes_tecnicas text,
  status text NOT NULL DEFAULT 'aberta',
  prioridade text NOT NULL DEFAULT 'media',
  data_abertura timestamptz DEFAULT now(),
  data_inicio timestamptz,
  data_previsao timestamptz,
  data_conclusao timestamptz,
  data_entrega timestamptz,
  valor_total decimal(10,2) NOT NULL DEFAULT 0,
  valor_pago decimal(10,2),
  forma_pagamento text,
  garantia integer DEFAULT 30, -- em dias
  tecnico_responsavel text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
CREATE INDEX IF NOT EXISTS idx_clientes_telefone ON clientes(telefone);
CREATE INDEX IF NOT EXISTS idx_motos_cliente_id ON motos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_motos_placa ON motos(placa);
CREATE INDEX IF NOT EXISTS idx_orcamentos_cliente_id ON orcamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_ordens_cliente_id ON ordens_servico(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordens_status ON ordens_servico(status);
CREATE INDEX IF NOT EXISTS idx_ordens_prioridade ON ordens_servico(prioridade);

-- Habilitar RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE motos ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pecas ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (permitir acesso para usuários autenticados)
CREATE POLICY "Usuários autenticados podem gerenciar clientes"
  ON clientes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem gerenciar motos"
  ON motos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem gerenciar serviços"
  ON servicos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem gerenciar peças"
  ON pecas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem gerenciar orçamentos"
  ON orcamentos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem gerenciar ordens de serviço"
  ON ordens_servico FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Inserir dados iniciais de serviços
INSERT INTO servicos (nome, preco, categoria, tempo_estimado) VALUES
  ('Troca de Óleo', 45.00, 'oleo', 30),
  ('Revisão Geral', 120.00, 'revisao', 180),
  ('Troca de Pneu', 25.00, 'pneus', 45),
  ('Regulagem de Freios', 80.00, 'mecanica', 90),
  ('Troca de Bateria', 35.00, 'eletrica', 20),
  ('Limpeza de Carburador', 95.00, 'mecanica', 120)
ON CONFLICT DO NOTHING;

-- Inserir dados iniciais de peças
INSERT INTO pecas (nome, codigo, preco, categoria, estoque) VALUES
  ('Óleo Motor 20W50', 'OL001', 28.50, 'Lubrificantes', 15),
  ('Filtro de Óleo', 'FO001', 12.90, 'Filtros', 25),
  ('Vela de Ignição NGK', 'VE001', 18.00, 'Ignição', 30),
  ('Pastilha de Freio Dianteira', 'PF001', 45.00, 'Freios', 12),
  ('Cabo de Acelerador', 'CA001', 35.00, 'Cabos', 8),
  ('Corrente 428H', 'CO001', 65.00, 'Transmissão', 5)
ON CONFLICT DO NOTHING;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_motos_updated_at BEFORE UPDATE ON motos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON servicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pecas_updated_at BEFORE UPDATE ON pecas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orcamentos_updated_at BEFORE UPDATE ON orcamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ordens_servico_updated_at BEFORE UPDATE ON ordens_servico FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();