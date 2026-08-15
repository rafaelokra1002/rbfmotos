// ============================================
// CÓDIGO PARA INTEGRAR SEU BOT AO SISTEMA RBF
// ============================================

const axios = require('axios');

// CONFIGURAÇÕES - AJUSTE CONFORME SEU SETUP
const SISTEMA_API_URL = 'http://localhost:9001';
const BOT_TOKEN = 'rbfmotos_2025_secure_token';
const NUMEROS_AUTORIZADOS = [
  '5571992724383',
  '557192724383',
  '71992724383',
  '7192724383'
];

// ============================================
// FUNÇÃO PRINCIPAL - ADICIONE NO SEU BOT
// ============================================

async function processarMensagemRBF(mensagem, numero, nome) {
  try {
    console.log(`📱 Enviando para RBF: ${mensagem}`);
    
    // Fazer requisição para o sistema RBF
    const response = await axios.post(
      `${SISTEMA_API_URL}/api/bot/webhook`,  // IMPORTANTE: /api/bot/webhook
      {
        mensagem: mensagem,
        remetenteNumero: numero,
        remetenteNome: nome
      },
      {
        headers: {
          'Authorization': 'Bearer rbfmotos_2025_secure_token',  // Token exato
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log('✅ Sistema RBF respondeu:', response.data);
    
    // Retornar resposta do sistema
    if (response.data && response.data.sucesso) {
      return response.data.resposta;
    } else {
      return '❌ Erro ao processar comando.';
    }
    
  } catch (error) {
    if (error.response) {
      // Servidor respondeu com erro
      console.error(`❌ Erro ${error.response.status}:`, error.response.data);
      
      if (error.response.status === 401) {
        console.error('❌ ERRO DE AUTENTICAÇÃO! Verifique o token.');
        return '❌ Erro de autenticação. Contate o administrador.';
      }
    } else if (error.request) {
      // Requisição foi feita mas sem resposta
      console.error('❌ Sistema RBF não respondeu:', error.message);
      return '❌ Sistema RBF offline. Tente novamente mais tarde.';
    } else {
      // Erro na configuração da requisição
      console.error('❌ Erro ao configurar requisição:', error.message);
      return '❌ Erro interno. Contate o administrador.';
    }
  }
}

// ============================================
// EXEMPLO DE USO NO SEU BOT
// ============================================

// Quando receber mensagem do WhatsApp
// (Adapte para sua biblioteca específica)

/*
client.onMessage(async (message) => {
  // Extrair dados da mensagem
  const numero = message.from.replace('@c.us', '');
  const nome = message.notifyName || 'Cliente';
  const texto = message.body;
  
  // Verificar se é autorizado
  if (!NUMEROS_AUTORIZADOS.some(n => numero.includes(n.slice(-10)))) {
    await client.sendText(message.from, '❌ Não autorizado.');
    return;
  }
  
  // Processar no sistema RBF
  const resposta = await processarMensagemRBF(texto, numero, nome);
  
  // Enviar resposta
  await client.sendText(message.from, resposta);
});
*/

// ============================================
// TESTE DIRETO (sem WhatsApp)
// ============================================

// Descomente para testar diretamente:
/*
(async () => {
  const resposta = await processarMensagemRBF(
    'gastei 50 teste',
    '557192724383',
    'Admin'
  );
  console.log('Resposta:', resposta);
})();
*/

module.exports = { processarMensagemRBF };
