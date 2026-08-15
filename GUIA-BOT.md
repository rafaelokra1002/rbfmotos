# 🤖 GUIA RÁPIDO - BOT WHATSAPP + CAIXA RBF MOTOS

## ✅ SEU BOT JÁ ESTÁ RODANDO!

```
✅ HTTP API do bot ativa em http://localhost:3030
✅ Prisma Client conectado!
✅ Admin 5571992724383 configurado!
✅ Bot pronto!
```

---

## 🚀 COMO USAR (3 PASSOS)

### 1️⃣ **Certifique-se de que o servidor do sistema está rodando**

```bash
cd c:\Users\Administrador.WIN-NJLHBG4DOBP\Desktop\SistemaRbf
npm run dev
```

Deve aparecer:
```
Server running on http://localhost:9001
```

---

### 2️⃣ **Em outro terminal, inicie o integrador**

```bash
cd c:\Users\Administrador.WIN-NJLHBG4DOBP\Desktop\SistemaRbf
node bot-integrator.js
```

Deve aparecer:
```
🚀 INTEGRADOR BOT WHATSAPP + RBF MOTOS
✅ Sistema de caixa conectado!
✅ Bot WhatsApp está conectado!
📱 Admin: 5571992724383
✅ Integrador rodando!
```

---

### 3️⃣ **Envie comandos via WhatsApp**

Envie mensagens para o número do bot usando os comandos abaixo:

---

## 📱 COMANDOS DO BOT

### 💰 Registrar Receita

```
/receita 150.50 servico pix Troca de óleo
```

**Categorias:** `servico`, `peca`, `cliente`, `outros`

---

### 💸 Registrar Despesa

```
/despesa 500 pecas pix Compra de peças
```

**Categorias:** `pecas`, `salarios`, `aluguel`, `energia`, `agua`, `internet`, `manutencao`, `impostos`, `marketing`, `outros`

---

### 💵 Ver Saldo

```
/saldo
```

---

### 📋 Ver Movimentações de Hoje

```
/hoje
```

---

### ❓ Ver Ajuda

```
/ajuda
```

---

## 🔧 FORMAS DE PAGAMENTO

Use estes valores no comando:

- `dinheiro` - Dinheiro
- `pix` - PIX
- `debito` - Cartão de Débito
- `credito` - Cartão de Crédito
- `transferencia` - Transferência

---

## 📊 EXEMPLOS PRÁTICOS

### Exemplo 1: Cliente pagou serviço

```
/receita 185 servico pix Troca de óleo João Silva
```

Bot responde:
```
✅ Receita registrada com sucesso!

💰 Valor: R$ 185,00
📊 Categoria: Venda de Serviço
💳 Pagamento: pix
📝 Descrição: Troca de óleo João Silva
🕐 Data: 22/12/2025 15:30
```

---

### Exemplo 2: Comprou peças

```
/despesa 420 pecas credito Pastilhas freio Auto Peças
```

---

### Exemplo 3: Ver saldo atual

```
/saldo
```

Bot responde:
```
💰 SALDO DO CAIXA

📈 Entradas: R$ 3.450,00
📉 Saídas: R$ 1.820,00
━━━━━━━━━━━━━━━
💵 Saldo: R$ 1.630,00
```

---

## ⚙️ CONFIGURAÇÃO

### Adicionar mais números autorizados

Edite o arquivo `bot-integrator.js`:

```javascript
const NUMEROS_AUTORIZADOS = [
  '5571992724383', // Admin
  '5571999999999', // Adicione aqui
  '5571988888888', // E aqui
];
```

---

### Alterar token de segurança

Edite o arquivo `bot-integrator.js`:

```javascript
const BOT_TOKEN = 'seu_token_super_secreto_aqui';
```

E também em `.env`:

```
BOT_WHATSAPP_TOKEN=seu_token_super_secreto_aqui
```

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### Bot não responde

**Verifique:**
1. Bot WhatsApp rodando? (localhost:3030)
2. Servidor do sistema rodando? (localhost:9001)
3. Integrador rodando? (node bot-integrator.js)

---

### "Você não tem permissão"

**Solução:** Adicione seu número na lista de autorizados em `bot-integrator.js`

---

### Comando não funciona

**Verifique o formato:**
- Deve começar com `/`
- Valor deve ser número (use ponto para decimal)
- Categoria e pagamento devem ser válidos

---

## 📂 ESTRUTURA DE ARQUIVOS

```
SistemaRbf/
├── bot-integrator.js          ← Integrador (rode este!)
├── server.ts                  ← Servidor do sistema
├── src/
│   ├── api/
│   │   └── bot-whatsapp.ts   ← API do bot
│   ├── config/
│   │   └── bot-config.ts     ← Configurações
│   └── lib/
│       └── bot-client.ts     ← Cliente HTTP
└── GUIA-BOT.md               ← Este arquivo
```

---

## ✅ CHECKLIST RÁPIDO

- [ ] Bot WhatsApp rodando (localhost:3030)
- [ ] Servidor sistema rodando (localhost:9001)
- [ ] Integrador rodando (node bot-integrator.js)
- [ ] Testei comando `/ajuda`
- [ ] Testei comando `/saldo`
- [ ] Registrei uma receita de teste
- [ ] Registrei uma despesa de teste

---

## 🎉 PRONTO!

Agora você pode gerenciar o caixa da RBF Motos direto do WhatsApp!

**Desenvolvido com 💛**
**Data:** 22 de Dezembro de 2025
