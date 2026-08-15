# Sistema de Oficina de Motos

Sistema completo de gerenciamento para oficina de motos usando React + TypeScript + Prisma + SQLite.

## 🚀 Configuração Inicial

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Banco de Dados
O banco de dados SQLite já está configurado. As tabelas foram criadas automaticamente.

### 3. Iniciar o Projeto

#### Opção 1: Rodar Frontend e Backend Separadamente
```bash
# Terminal 1 - API Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

#### Opção 2: Rodar Tudo Junto
```bash
npm run dev:all
```

O frontend estará disponível em: `http://localhost:5173`  
A API backend estará disponível em: `http://localhost:3001`

## 📦 Tecnologias

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Express + TypeScript
- **Banco de Dados**: Prisma + SQLite
- **UI**: Lucide Icons

## 🗂️ Estrutura do Banco de Dados

### Tabelas:
- **clientes** - Cadastro de clientes
- **motos** - Motos dos clientes
- **orcamentos** - Orçamentos criados
- **ordens_servico** - Ordens de serviço
- **itens_orcamento** - Itens de orçamentos e OS
- **servicos** - Catálogo de serviços
- **pecas** - Catálogo de peças

## 🛠️ Comandos Úteis

### Prisma
```bash
# Gerar Prisma Client
npx prisma generate

# Criar nova migração
npx prisma migrate dev --name nome_da_migracao

# Abrir Prisma Studio (interface visual do banco)
npx prisma studio

# Resetar banco de dados
npx prisma migrate reset
```

### Development
```bash
# Rodar apenas frontend
npm run dev

# Rodar apenas backend
npm run server

# Build para produção
npm run build
```

## 📁 Estrutura de Pastas

```
project/
├── prisma/
│   ├── schema.prisma      # Schema do banco de dados
│   ├── dev.db            # Arquivo SQLite
│   └── migrations/       # Migrações do banco
├── src/
│   ├── components/       # Componentes React
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Configurações (Prisma)
│   └── types/           # TypeScript types
├── server.ts            # API Express
└── package.json
```

## 🔄 Migrando do Supabase para Prisma

O sistema foi atualizado de Supabase para Prisma local (SQLite). Vantagens:

✅ Banco de dados local (sem necessidade de internet)  
✅ Sem configurações complexas de credenciais  
✅ Desenvolvimento mais rápido  
✅ Totalmente gratuito  
✅ Fácil de fazer backup (apenas copiar o arquivo `dev.db`)

## 📝 Notas

- O banco de dados SQLite fica salvo em `prisma/dev.db`
- Para produção, pode-se migrar facilmente para PostgreSQL/MySQL alterando apenas o `schema.prisma`
- As migrations estão versionadas em `prisma/migrations/`
