# ---- RBF Motos: imagem única (frontend + API) ----
FROM node:20-slim

# Prisma precisa do openssl no Debian slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instala dependências (inclui devDependencies: prisma, tsx, vite)
# Feito antes de definir NODE_ENV=production para não pular as devDependencies.
COPY package.json package-lock.json ./
RUN npm ci

# Copia o restante do código
COPY . .

# Gera o Prisma Client e builda o frontend (dist/)
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Ao subir o container:
# 1) sincroniza o schema no PostgreSQL (cria as tabelas se não existirem)
# 2) inicia o servidor Express (serve o site + a API na mesma porta)
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm run server"]
