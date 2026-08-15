# Deploy no Coolify — RBF Motos

Este projeto foi preparado para rodar como **um único container** (o Express serve o
site e a API na mesma porta) usando um banco **PostgreSQL** gerenciado pelo Coolify.

## Visão geral

- **1 aplicação** (Dockerfile) → serve frontend (`dist/`) + API `/api`
- **1 banco PostgreSQL** (criado no Coolify)
- Frontend chama a API por caminho relativo `/api` (mesma origem) → funciona com HTTPS

---

## Passo 1 — Criar o banco PostgreSQL

1. No Coolify, entre no seu projeto → **+ New** → **Database** → **PostgreSQL**.
2. Crie e **inicie** o banco.
3. Copie a **Connection String interna** (algo como
   `postgres://postgres:SENHA@nome-do-servico:5432/postgres`).
   Use a URL **interna** (rede do Coolify), não a pública.

## Passo 2 — Criar a aplicação

1. **+ New** → **Application** → **Public Repository** (ou conecte o GitHub).
2. Repositório: `https://github.com/rafaelokra1002/rbfmotos` — branch **`main`**.
3. **Build Pack: Dockerfile** (o Coolify detecta o `Dockerfile` na raiz).

## Passo 3 — Variáveis de ambiente

Na aba **Environment Variables** da aplicação, adicione:

| Variável        | Valor                                                        |
|-----------------|--------------------------------------------------------------|
| `DATABASE_URL`  | a connection string interna do Postgres (Passo 1)            |
| `PORT`          | `3000`                                                        |

> Dica: no fim da `DATABASE_URL` você pode acrescentar `?schema=public`.

## Passo 4 — Porta e domínio

1. Em **Ports Exposes**, confirme **`3000`**.
2. Em **Domains**, defina seu domínio (ou use o gerado pelo Coolify). O HTTPS
   (Let's Encrypt) é configurado automaticamente.

## Passo 5 — Deploy

1. Clique em **Deploy**.
2. No primeiro deploy, o container roda `prisma db push`, que **cria as tabelas**
   no PostgreSQL automaticamente a partir do `schema.prisma`.
3. Acompanhe os logs; quando aparecer `Servidor rodando...`, acesse o domínio.

---

## Persistência dos dados

Os dados ficam no **PostgreSQL do Coolify** (não no container da aplicação), então
sobrevivem a novos deploys. Configure **backups** do banco no próprio Coolify.

## Observações importantes

- **Migrations:** usamos `prisma db push` (sincroniza o schema). As migrations antigas
  em `prisma/migrations` eram do SQLite e não são usadas no Postgres.
- **Segurança:** hoje a API **não tem autenticação** e o CORS é aberto (`*`). Em um
  domínio público, qualquer pessoa acessa os dados. Recomenda-se implementar login no
  backend e restringir o CORS antes de uso real. A senha de login atual está fixa no
  frontend (`src/App.tsx`) — troque-a.
- **Migrar dados do SQLite local (opcional):** se você já tem dados no `dev.db` e quer
  levá-los para o Postgres, isso exige um script de migração à parte (posso ajudar).

## Testar a imagem localmente (opcional)

```bash
# sobe um Postgres local
docker run -d --name pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16

# builda e roda a aplicação
docker build -t rbfmotos .
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/postgres?schema=public" \
  -e PORT=3000 \
  rbfmotos

# acesse http://localhost:3000
```
