/**
 * 🤖 INTEGRADOR BOT WHATSAPP + SISTEMA RBF MOTOS
 * 
 * Este script conecta o bot WhatsApp (que roda em localhost:3030)
 * com o sistema de caixa (que roda em localhost:9001)
 * 
 * Como funciona:
 * 1. Bot WhatsApp recebe mensagem do usuário
 * 2. Este script captura a mensagem
 * 3. Envia para API do sistema (/api/bot/webhook)
 * 4. Recebe resposta da API
 * 5. Envia resposta de volta ao usuário via WhatsApp
 */

const axios = require('axios');

// ============================================
// CONFIGURAÇÕES
// ============================================

const BOT_WHATSAPP_URL = 'http://localhost:3030';
const SISTEMA_API_URL = 'http://localhost:9001';
const BOT_TOKEN = 'rbfmotos_2025_secure_token'; // Mesmo token do sistema

// Admin e números autorizados
const NUMEROS_AUTORIZADOS = [
  '5571992724383', // Admin principal (71) 99272-4383
  '557192724383',  // Variação sem o 9 extra
  '71992724383',   // Sem código do país
  '7192724383',    // Apenas DDD + número
];

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Envia mensagem via bot WhatsApp
 */
async function enviarMensagemWhatsApp(numero, mensagem) {
  try {
    await axios.post(`${BOT_WHATSAPP_URL}/send-message`, {
      number: numero,
      message: mensagem,
    });
    console.log(`✅ Mensagem enviada para ${numero}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao enviar mensagem:`, error.message);
    return false;
  }
}

/**
 * Processa comando no sistema de caixa
 */
async function processarComando(mensagem, remetenteNumero, remetenteNome) {
  try {
    const response = await axios.post(
      `${SISTEMA_API_URL}/api/bot/webhook`,
      {
        mensagem,
        remetenteNumero,
        remetenteNome,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.sucesso) {
      return response.data.resposta;
    } else {
      return '❌ Erro ao processar comando.';
    }
  } catch (error) {
    console.error('❌ Erro ao processar comando:', error.message);
    return '❌ Erro ao conectar com o sistema. Tente novamente.';
  }
}

/**
 * Verifica se número está autorizado
 */
function isNumeroAutorizado(numero) {
  // Remove @c.us se existir
  const numeroLimpo = numero.replace('@c.us', '');
  return NUMEROS_AUTORIZADOS.some(n => numeroLimpo.includes(n) || n.includes(numeroLimpo));
}

/**
 * Registra webhook no bot WhatsApp para receber mensagens
 */
async function registrarWebhook() {
  try {
    // Verificar se o bot está online
    const statusResponse = await axios.get(`${BOT_WHATSAPP_URL}/status`);
    
    if (statusResponse.data.state !== 'CONNECTED') {
      console.error('❌ Bot WhatsApp não está conectado!');
      return false;
    }

    console.log('✅ Bot WhatsApp está conectado!');
    console.log('✅ Integrador pronto para receber mensagens!');
    console.log(`📱 Admin: ${NUMEROS_AUTORIZADOS[0]}`);
    console.log(`🔗 Sistema API: ${SISTEMA_API_URL}`);
    console.log(`🔗 Bot WhatsApp: ${BOT_WHATSAPP_URL}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com bot WhatsApp:', error.message);
    return false;
  }
}

/**
 * Polling para verificar novas mensagens
 * (Como o bot está em localhost:3030, vamos fazer polling)
 */
async function iniciarMonitoramento() {
  console.log('🔄 Iniciando monitoramento de mensagens...');
  
  let ultimoTimestamp = Date.now();
  
  setInterval(async () => {
    try {
      // Buscar mensagens novas
      const response = await axios.get(`${BOT_WHATSAPP_URL}/messages`, {
        params: {
          since: ultimoTimestamp,
        },
      });
      
      const mensagens = response.data || [];
      
      for (const msg of mensagens) {
        // Atualizar timestamp
        if (msg.timestamp > ultimoTimestamp) {
          ultimoTimestamp = msg.timestamp;
        }
        
        // Ignorar mensagens de grupos
        if (msg.isGroup) continue;
        
        // Extrair número
        const numero = msg.from.replace('@c.us', '');
        
        // Verificar autorização
        if (!isNumeroAutorizado(numero)) {
          await enviarMensagemWhatsApp(
            msg.from,
            '❌ Você não tem permissão para usar este bot.\n\nContate o administrador: 71 99272-4383'
          );
          continue;
        }
        
        // Processar apenas comandos
        const texto = msg.body.trim();
        if (!texto.startsWith('/')) continue;
        
        console.log(`📱 Comando recebido de ${msg.pushName || numero}: ${texto.substring(0, 50)}...`);
        
        // Processar comando no sistema
        const resposta = await processarComando(
          texto,
          numero,
          msg.pushName || 'Usuário'
        );
        
        // Enviar resposta
        await enviarMensagemWhatsApp(msg.from, resposta);
      }
    } catch (error) {
      // Silencioso - evitar poluir console se o bot não tiver novas mensagens
      if (error.response?.status !== 404) {
        console.error('❌ Erro no monitoramento:', error.message);
      }
    }
  }, 2000); // Verificar a cada 2 segundos
}

// ============================================
// INICIALIZAÇÃO
// ============================================

async function iniciar() {
  console.log('🚀 INTEGRADOR BOT WHATSAPP + RBF MOTOS');
  console.log('======================================');
  
  // Verificar conexão com sistema
  try {
    await axios.get(`${SISTEMA_API_URL}/api/bot/status`, {
      headers: {
        'Authorization': `Bearer ${BOT_TOKEN}`,
      },
    });
    console.log('✅ Sistema de caixa conectado!');
  } catch (error) {
    console.error('❌ Não foi possível conectar com o sistema de caixa!');
    console.error('   Certifique-se de que o servidor está rodando em', SISTEMA_API_URL);
    process.exit(1);
  }
  
  // Registrar webhook e iniciar monitoramento
  const sucesso = await registrarWebhook();
  
  if (sucesso) {
    // Se o bot suporta webhook, registrar
    // Caso contrário, usar polling
    try {
      await axios.post(`${BOT_WHATSAPP_URL}/webhook`, {
        url: `${SISTEMA_API_URL}/api/bot/webhook-messages`,
      });
      console.log('✅ Webhook registrado no bot!');
    } catch (error) {
      console.log('ℹ️  Webhook não suportado, usando polling...');
      iniciarMonitoramento();
    }
  } else {
    console.error('❌ Falha ao iniciar integrador!');
    process.exit(1);
  }
  
  console.log('\n📱 COMANDOS DISPONÍVEIS:');
  console.log('   /receita <valor> <categoria> <pagamento> [descrição]');
  console.log('   /despesa <valor> <categoria> <pagamento> [descrição]');
  console.log('   /saldo');
  console.log('   /hoje');
  console.log('   /ajuda');
  console.log('\n✅ Integrador rodando! Use Ctrl+C para parar.\n');
}

// Iniciar
iniciar().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

// Tratamento de erros
process.on('unhandledRejection', (error) => {
  console.error('❌ Erro não tratado:', error);
});

process.on('SIGINT', () => {
  console.log('\n\n👋 Encerrando integrador...');
  process.exit(0);
});
