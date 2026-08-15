/**
 * 🤖 CONFIGURAÇÃO DO BOT WHATSAPP - RBF MOTOS
 * 
 * Este arquivo configura a integração entre o bot WhatsApp
 * (rodando em http://localhost:3030) e o sistema de caixa
 */

// URL do bot WhatsApp
export const BOT_WHATSAPP_URL = 'http://localhost:3030';

// Admin configurado
export const ADMIN_NUMBER = '5571992724383';

// Token de segurança (troque por algo seguro!)
export const BOT_TOKEN = process.env.BOT_WHATSAPP_TOKEN || 'rbfmotos_2025_secure_token';

// Configurações do bot
export const BOT_CONFIG = {
  // Timeout para requisições (ms)
  timeout: 10000,
  
  // Tentar novamente em caso de erro
  retryAttempts: 3,
  
  // Delay entre tentativas (ms)
  retryDelay: 1000,
  
  // Números autorizados (além do admin)
  numerosAutorizados: [
    '5571992724383',  // Admin principal (71) 99272-4383
    '557192724383',   // Variação sem o 9 extra
    '71992724383',    // Sem código do país
    '7192724383',     // Apenas DDD + número
  ],
  
  // Prefixo dos comandos
  comandoPrefixo: '/',
  
  // Respostas automáticas
  respostasAutomaticas: {
    naoAutorizado: '❌ Você não tem permissão para usar este bot.\n\nContate o administrador.',
    erroDesconhecido: '❌ Erro ao processar comando. Tente novamente.',
    comandoInvalido: '❓ Comando não reconhecido.\n\nDigite /ajuda para ver os comandos disponíveis.',
  },
};

// Mapear categorias curtas para nomes completos
export const CATEGORIAS_RECEITA = {
  'servico': 'Venda de Serviço',
  'peca': 'Venda de Peça',
  'cliente': 'Recebimento de Cliente',
  'outros': 'Outras Entradas',
};

export const CATEGORIAS_DESPESA = {
  'pecas': 'Compra de Peças',
  'salarios': 'Salários',
  'salario': 'Salários',
  'aluguel': 'Aluguel',
  'energia': 'Energia Elétrica',
  'agua': 'Água',
  'internet': 'Internet',
  'manutencao': 'Manutenção',
  'impostos': 'Impostos',
  'marketing': 'Marketing',
  'outros': 'Outras Despesas',
};

export const FORMAS_PAGAMENTO = {
  'dinheiro': 'dinheiro',
  'pix': 'pix',
  'debito': 'cartao_debito',
  'credito': 'cartao_credito',
  'transferencia': 'transferencia',
};
