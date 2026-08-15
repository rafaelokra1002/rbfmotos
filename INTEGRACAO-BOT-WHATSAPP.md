# 🤖 INTEGRAÇÃO BOT WHATSAPP + CAIXA RBF MOTOS

## 📋 VISÃO GERAL

Este documento explica como integrar seu bot do WhatsApp com o sistema de controle de caixa da RBF Motos. Com essa integração, você poderá:

- ✅ Registrar receitas via WhatsApp
- ✅ Registrar despesas via WhatsApp
- ✅ Consultar saldo do caixa em tempo real
- ✅ Listar movimentações do dia
- ✅ Tudo com comandos simples e rápidos

---

## 🔐 CONFIGURAÇÃO INICIAL

### 1. Token de Autenticação

Para segurança, o bot usa um token de autenticação. Configure no seu servidor:

```bash
# Adicione ao arquivo .env ou variável de ambiente
BOT_WHATSAPP_TOKEN=seu_token_secreto_aqui_2025
```

**⚠️ IMPORTANTE:** Troque `seu_token_secreto_aqui_2025` por um token único e seguro!

### 2. Endpoint do Servidor

O servidor já está configurado com as rotas:

- **Webhook:** `POST http://177.54.148.12:9001/api/bot/webhook`
- **Status:** `GET http://177.54.148.12:9001/api/bot/status`

---

## 🎯 COMANDOS DISPONÍVEIS

### 1️⃣ **Registrar Receita**

**Comando:**
```
/receita <valor> <categoria> <pagamento> [descrição]
```

**Exemplos:**
```
/receita 150.50 servico pix Troca de óleo
/receita 200 peca dinheiro Venda de corrente
/receita 350.00 cliente pix Pagamento de OS #1234
/receita 89.90 servico debito Revisão 5000km
```

**Categorias disponíveis:**
- `servico` - Venda de Serviço
- `peca` - Venda de Peça
- `cliente` - Recebimento de Cliente
- `outros` - Outras Entradas

**Formas de pagamento:**
- `dinheiro` - Dinheiro
- `pix` - PIX
- `debito` - Cartão de Débito
- `credito` - Cartão de Crédito
- `transferencia` - Transferência Bancária

**Resposta do bot:**
```
✅ Receita registrada com sucesso!

💰 Valor: R$ 150,50
📊 Categoria: Venda de Serviço
💳 Pagamento: pix
📝 Descrição: Troca de óleo
🕐 Data: 22/12/2025 14:30
```

---

### 2️⃣ **Registrar Despesa**

**Comando:**
```
/despesa <valor> <categoria> <pagamento> [descrição]
```

**Exemplos:**
```
/despesa 500 pecas pix Compra de peças
/despesa 2000 salarios transferencia Salário João
/despesa 450.00 aluguel pix Aluguel dezembro
/despesa 120 energia dinheiro Conta de luz
```

**Categorias disponíveis:**
- `pecas` - Compra de Peças
- `salarios` - Salários
- `aluguel` - Aluguel
- `energia` - Energia Elétrica
- `agua` - Água
- `internet` - Internet
- `manutencao` - Manutenção
- `impostos` - Impostos
- `marketing` - Marketing
- `outros` - Outras Despesas

**Formas de pagamento:** (mesmas da receita)

**Resposta do bot:**
```
✅ Despesa registrada com sucesso!

💸 Valor: R$ 500,00
📊 Categoria: Compra de Peças
💳 Pagamento: pix
📝 Descrição: Compra de peças
🕐 Data: 22/12/2025 14:35
```

---

### 3️⃣ **Consultar Saldo**

**Comando:**
```
/saldo
```

**Resposta do bot:**
```
💰 SALDO DO CAIXA

📈 Entradas: R$ 3.450,00
📉 Saídas: R$ 1.820,00
━━━━━━━━━━━━━━━
💵 Saldo: R$ 1.630,00
```

---

### 4️⃣ **Ver Movimentações de Hoje**

**Comando:**
```
/hoje
```

**Resposta do bot:**
```
📋 MOVIMENTAÇÕES DE HOJE
Total: 5 movimentações

📈 Venda de Serviço
   R$ 150,50 - Troca de óleo
   pix | 22/12/2025 14:30

📉 Compra de Peças
   R$ 500,00 - Compra de peças
   pix | 22/12/2025 14:35

━━━━━━━━━━━━━━━
📈 Total Entradas: R$ 850,00
📉 Total Saídas: R$ 500,00
```

---

### 5️⃣ **Ajuda**

**Comando:**
```
/ajuda
```
ou
```
/help
```

**Resposta:** Menu completo com todos os comandos disponíveis.

---

## 🔌 INTEGRAÇÃO COM SEU BOT

### Opção 1: Bot Node.js (Baileys, Venom, etc.)

```javascript
const axios = require('axios');

const BOT_TOKEN = 'seu_token_secreto_aqui_2025';
const API_URL = 'http://177.54.148.12:9001/api/bot/webhook';

// Quando receber mensagem no WhatsApp
async function processarMensagem(mensagem, remetenteNumero, remetenteNome) {
  try {
    const response = await axios.post(
      API_URL,
      {
        mensagem: mensagem,
        remetenteNumero: remetenteNumero,
        remetenteNome: remetenteNome
      },
      {
        headers: {
          'Authorization': `Bearer ${BOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.sucesso) {
      // Enviar resposta ao usuário no WhatsApp
      return response.data.resposta;
    }
  } catch (error) {
    console.error('Erro ao processar comando:', error);
    return 'Erro ao processar comando. Tente novamente.';
  }
}

// Exemplo de uso com Baileys/Venom
bot.on('message', async (msg) => {
  const mensagem = msg.body;
  const numero = msg.from;
  const nome = msg.pushName;

  if (mensagem.startsWith('/')) {
    const resposta = await processarMensagem(mensagem, numero, nome);
    await bot.sendText(numero, resposta);
  }
});
```

---

### Opção 2: Bot Python (WhatsApp-Web.py, etc.)

```python
import requests

BOT_TOKEN = 'seu_token_secreto_aqui_2025'
API_URL = 'http://177.54.148.12:9001/api/bot/webhook'

def processar_mensagem(mensagem, remetente_numero, remetente_nome):
    try:
        headers = {
            'Authorization': f'Bearer {BOT_TOKEN}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'mensagem': mensagem,
            'remetenteNumero': remetente_numero,
            'remetenteNome': remetente_nome
        }
        
        response = requests.post(API_URL, json=payload, headers=headers)
        data = response.json()
        
        if data.get('sucesso'):
            return data.get('resposta')
    except Exception as e:
        print(f'Erro ao processar comando: {e}')
        return 'Erro ao processar comando. Tente novamente.'

# Exemplo de uso
@bot.message_handler(func=lambda msg: msg.text.startswith('/'))
def handle_command(msg):
    mensagem = msg.text
    numero = msg.from_user.phone
    nome = msg.from_user.name
    
    resposta = processar_mensagem(mensagem, numero, nome)
    bot.reply_to(msg, resposta)
```

---

### Opção 3: Zapier/Make/N8N (Low-Code)

**Configuração no Zapier/Make:**

1. **Trigger:** Webhook quando receber mensagem no WhatsApp
2. **Filter:** Mensagem começa com "/"
3. **Action:** HTTP Request
   - **Method:** POST
   - **URL:** `http://177.54.148.12:9001/api/bot/webhook`
   - **Headers:**
     - `Authorization`: `Bearer seu_token_secreto_aqui_2025`
     - `Content-Type`: `application/json`
   - **Body (JSON):**
     ```json
     {
       "mensagem": "{{mensagem}}",
       "remetenteNumero": "{{numero}}",
       "remetenteNome": "{{nome}}"
     }
     ```
4. **Action:** Enviar resposta no WhatsApp com `{{resposta}}`

---

## 🔒 SEGURANÇA

### Boas Práticas

1. **Token Seguro:**
   - Use um token forte (mínimo 32 caracteres)
   - Nunca compartilhe o token publicamente
   - Troque o token periodicamente

2. **Lista de Números Autorizados:**
   - Configure apenas números confiáveis (dono, gerente)
   - Adicione validação no seu bot antes de enviar ao webhook

3. **Rate Limiting:**
   - Implemente limite de requisições (ex: 10 por minuto)
   - Evite spam e uso indevido

4. **Logs:**
   - Monitore o uso do bot
   - Todos os comandos são registrados no console do servidor

---

## 🧪 TESTANDO A INTEGRAÇÃO

### 1. Testar o endpoint manualmente

```bash
curl -X POST http://177.54.148.12:9001/api/bot/webhook \
  -H "Authorization: Bearer seu_token_secreto_aqui_2025" \
  -H "Content-Type: application/json" \
  -d '{
    "mensagem": "/saldo",
    "remetenteNumero": "5511999999999",
    "remetenteNome": "Teste"
  }'
```

### 2. Verificar status do bot

```bash
curl -X GET http://177.54.148.12:9001/api/bot/status \
  -H "Authorization: Bearer seu_token_secreto_aqui_2025"
```

**Resposta esperada:**
```json
{
  "status": "online",
  "totalMovimentacoes": 45,
  "ultimaMovimentacao": {
    "tipo": "entrada",
    "valor": 150.5,
    "data": "2025-12-22T17:30:00.000Z"
  }
}
```

---

## 📊 EXEMPLOS DE USO REAL

### Cenário 1: Mecânico finalizou um serviço

```
Cliente: João da Silva
Serviço: Troca de óleo + filtro
Valor: R$ 185,00
Pagamento: PIX
```

**Comando WhatsApp:**
```
/receita 185 servico pix Troca de óleo João Silva
```

---

### Cenário 2: Comprou peças no fornecedor

```
Fornecedor: Auto Peças ABC
Itens: Pastilhas de freio
Valor: R$ 420,00
Pagamento: Cartão de Crédito
```

**Comando WhatsApp:**
```
/despesa 420 pecas credito Pastilhas freio Auto Peças ABC
```

---

### Cenário 3: Consulta rápida do dia

**Você:**
```
/hoje
```

**Bot:**
```
📋 MOVIMENTAÇÕES DE HOJE
Total: 8 movimentações

📈 Venda de Serviço - R$ 185,00
📈 Venda de Peça - R$ 220,00
📉 Compra de Peças - R$ 420,00
...

━━━━━━━━━━━━━━━
📈 Total Entradas: R$ 1.350,00
📉 Total Saídas: R$ 820,00
```

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### Erro: "Token inválido"

**Causa:** Token de autenticação incorreto

**Solução:**
1. Verifique se o token no `.env` é o mesmo do bot
2. Certifique-se de enviar no header: `Authorization: Bearer SEU_TOKEN`

---

### Erro: "Formato inválido"

**Causa:** Comando enviado com parâmetros incorretos

**Solução:**
- Revise o formato do comando
- Use `/ajuda` para ver exemplos
- Valor deve ser numérico (use ponto para decimal)

---

### Bot não responde

**Causa:** Servidor offline ou bot não conectado

**Solução:**
1. Verifique se o servidor está rodando: `GET /api/bot/status`
2. Confira os logs do servidor
3. Teste com curl antes de integrar

---

## 🚀 PRÓXIMOS PASSOS

### Funcionalidades Futuras

1. **Relatórios Automáticos**
   - Enviar resumo diário automático
   - Alertas de metas

2. **Comandos Avançados**
   - `/relatorio mes` - Relatório mensal
   - `/meta 5000` - Definir meta de faturamento
   - `/gastos categoria pecas` - Gastos por categoria

3. **Integração com OS**
   - Finalizar ordem de serviço via WhatsApp
   - Notificar cliente quando serviço ficar pronto

4. **Dashboard no Bot**
   - Gráficos enviados como imagem
   - Comparativo mês a mês

---

## 📞 SUPORTE

Dúvidas ou problemas? Entre em contato:

- **Desenvolvedor:** Sistema RBF Motos
- **Documentação:** INTEGRACAO-BOT-WHATSAPP.md
- **Logs:** Verifique console do servidor

---

## 🎉 EXEMPLO COMPLETO DE INTEGRAÇÃO

```javascript
// bot-whatsapp-rbf.js
const { create } = require('venom-bot');
const axios = require('axios');

const BOT_TOKEN = process.env.BOT_WHATSAPP_TOKEN;
const API_URL = 'http://177.54.148.12:9001/api/bot/webhook';

// Números autorizados (dono, gerente, etc.)
const NUMEROS_AUTORIZADOS = [
  '5511999999999@c.us', // Troque pelos números reais
  '5511988888888@c.us'
];

create('rbf-motos-bot')
  .then((client) => {
    console.log('✅ Bot WhatsApp RBF Motos iniciado!');

    client.onMessage(async (message) => {
      // Ignorar mensagens de grupos
      if (message.isGroupMsg) return;

      // Verificar autorização
      if (!NUMEROS_AUTORIZADOS.includes(message.from)) {
        await client.sendText(
          message.from,
          '❌ Você não tem permissão para usar este bot.'
        );
        return;
      }

      const texto = message.body.trim();

      // Processar apenas comandos (começam com /)
      if (!texto.startsWith('/')) return;

      console.log(`📱 Comando recebido: ${texto.substring(0, 50)}...`);

      try {
        // Enviar para API do sistema
        const response = await axios.post(
          API_URL,
          {
            mensagem: texto,
            remetenteNumero: message.from,
            remetenteNome: message.notifyName || 'Usuário'
          },
          {
            headers: {
              'Authorization': `Bearer ${BOT_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.sucesso) {
          // Enviar resposta do sistema para o usuário
          await client.sendText(message.from, response.data.resposta);
        } else {
          await client.sendText(
            message.from,
            '❌ Erro ao processar comando. Tente novamente.'
          );
        }
      } catch (error) {
        console.error('Erro ao processar comando:', error);
        await client.sendText(
          message.from,
          '❌ Erro ao processar comando. Verifique o formato e tente novamente.\n\nDigite /ajuda para ver os comandos disponíveis.'
        );
      }
    });
  })
  .catch((error) => {
    console.error('Erro ao iniciar bot:', error);
  });
```

---

**Desenvolvido com 💛 para RBF Motos**
**Data:** 22 de Dezembro de 2025
