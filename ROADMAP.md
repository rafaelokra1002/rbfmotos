# 🗓️ ROADMAP - Sistema RBF Motos

## 📋 FASE 1 - PRIORIDADES URGENTES

### ✅ A) Sistema de Backup Automático
**Status:** 🔴 Pendente  
**Prioridade:** ⭐⭐⭐ Alta  
**Estimativa:** 2-3 dias

#### Funcionalidades:
- [ ] Backup automático diário do banco SQLite
- [ ] Exportação de dados em JSON/CSV
- [ ] Armazenamento local e nuvem (Google Drive/Dropbox)
- [ ] Restauração rápida de backup
- [ ] Histórico de backups (últimos 30 dias)
- [ ] Notificação em caso de falha no backup
- [ ] Interface para download manual de backup

#### Arquivos a criar/modificar:
```
src/lib/backup.ts          - Lógica de backup
src/components/Backup.tsx  - Interface de gerenciamento
server.ts                  - Endpoints de backup/restore
package.json               - Adicionar dependências (node-cron, archiver)
```

#### Dependências necessárias:
```bash
npm install node-cron archiver
npm install @types/node-cron @types/archiver --save-dev
```

#### Endpoints da API:
- `POST /api/backup/create` - Criar backup manual
- `GET /api/backup/list` - Listar backups disponíveis
- `GET /api/backup/download/:id` - Download de backup específico
- `POST /api/backup/restore/:id` - Restaurar backup
- `GET /api/backup/status` - Status do último backup

---

### ✅ B) WhatsApp Business API
**Status:** 🔴 Pendente  
**Prioridade:** ⭐⭐⭐ Alta  
**Estimativa:** 3-4 dias

#### Funcionalidades:
- [ ] Integração com WhatsApp Business API oficial
- [ ] Mensagens automáticas ao mudar status de OS
- [ ] Confirmação de leitura de mensagens
- [ ] Templates de mensagens aprovados
- [ ] Envio de fotos/PDFs via WhatsApp
- [ ] Histórico de mensagens enviadas
- [ ] Chatbot básico para consultas

#### Arquivos a criar/modificar:
```
src/lib/whatsappBusiness.ts     - Cliente WhatsApp Business API
src/components/WhatsAppLog.tsx  - Histórico de mensagens
server.ts                       - Webhooks WhatsApp
.env                            - Credenciais da API
```

#### Integrações possíveis:
1. **Twilio** (mais completo, pago)
2. **Evolution API** (auto-hospedado, gratuito)
3. **Baileys** (biblioteca Node.js, requer QR Code)

#### Dependências necessárias:
```bash
# Opção 1: Twilio
npm install twilio

# Opção 2: Evolution API (auto-hospedado)
# Requer servidor separado com Docker

# Opção 3: Baileys (mais simples)
npm install @whiskeysockets/baileys qrcode-terminal
```

#### Endpoints da API:
- `POST /api/whatsapp/send` - Enviar mensagem
- `POST /api/whatsapp/send-media` - Enviar mídia
- `GET /api/whatsapp/status` - Status da conexão
- `POST /api/whatsapp/webhook` - Receber mensagens (webhook)
- `GET /api/whatsapp/messages/:osId` - Histórico por OS

#### Templates de Mensagens:
```typescript
interface WhatsAppTemplate {
  id: string;
  nome: string;
  categoria: 'os_criada' | 'os_andamento' | 'os_pronta' | 'orcamento' | 'lembrete';
  template: string;
  parametros: string[];
  aprovado: boolean;
}
```

#### Automações:
- OS Criada → Enviar confirmação automática
- OS Em Andamento → Atualizar cliente
- OS Pronta → Notificar retirada
- Orçamento → Enviar PDF + link aprovação
- 24h antes agendamento → Lembrete

---

## 📊 DASHBOARD DE PROGRESSO

| Funcionalidade | Status | Progresso | Prazo Estimado |
|---|---|---|---|
| Backup Automático | 🔴 Pendente | 0% | - |
| WhatsApp Business API | 🔴 Pendente | 0% | - |

---

## 🔧 CONFIGURAÇÕES NECESSÁRIAS

### Para Backup:
```env
# .env
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 3 * * *"  # 3h da manhã todos os dias
BACKUP_RETENTION_DAYS=30
BACKUP_PATH=./backups
```

### Para WhatsApp:
```env
# .env
WHATSAPP_PROVIDER=evolution  # twilio | evolution | baileys
WHATSAPP_API_KEY=your_api_key
WHATSAPP_PHONE_NUMBER=5571992724383
WHATSAPP_WEBHOOK_URL=https://seudominio.com/api/whatsapp/webhook
```

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### Backup Automático:
1. Usar `node-cron` para agendar backups diários
2. Compactar banco SQLite + uploads em ZIP
3. Opção de enviar para Google Drive via API
4. Manter últimos 30 backups, deletar antigos
5. Adicionar página de configuração no painel

### WhatsApp Business:
1. Escolher provider baseado em necessidade:
   - **Twilio**: Melhor suporte, pago (~$0.005/msg)
   - **Evolution API**: Grátis, auto-hospedado
   - **Baileys**: Grátis, requer WhatsApp pessoal
2. Criar sistema de filas para mensagens
3. Implementar retry em caso de falha
4. Logs detalhados de todas as mensagens
5. Interface para visualizar histórico

---

## 🎯 PRÓXIMOS PASSOS

1. **Definir provider WhatsApp** (Twilio vs Evolution vs Baileys)
2. **Configurar ambiente de testes**
3. **Criar branch para desenvolvimento**
4. **Implementar Backup primeiro** (menos complexo)
5. **Depois implementar WhatsApp** (mais crítico para clientes)

---

## 📅 CRONOGRAMA SUGERIDO

**Semana 1-2:**
- Implementar Sistema de Backup
- Testes e ajustes
- Deploy em produção

**Semana 3-4:**
- Implementar WhatsApp Business API
- Criar templates de mensagens
- Testes com números reais
- Deploy em produção

**Total estimado:** 1 mês de desenvolvimento

---

## 🚀 QUANDO ESTIVER PRONTO PARA IMPLEMENTAR

Digite: **"implementar backup"** ou **"implementar whatsapp"**

Vou criar todos os arquivos, configurações e código necessários! 💪
