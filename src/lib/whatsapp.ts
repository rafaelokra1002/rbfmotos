// Utilitários para integração com WhatsApp
import { getConfiguracaoEmpresa } from './config';

export interface WhatsAppMessage {
  to: string;
  message: string;
}

// Função para formatar número de telefone para WhatsApp
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Se não começar com 55 (código do Brasil), adiciona
  if (!cleanPhone.startsWith('55')) {
    return '55' + cleanPhone;
  }
  
  return cleanPhone;
}

// Função para criar URL do WhatsApp Web
export function createWhatsAppURL(phone: string, message: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

// Função para obter rodapé com dados da empresa
function getRodapeEmpresa(): string {
  const config = getConfiguracaoEmpresa();
  let rodape = `\n*${config.nomeEmpresa}* 🏍️`;
  
  if (config.telefone) rodape += `\n📞 ${config.telefone}`;
  if (config.endereco) rodape += `\n📍 ${config.endereco}`;
  if (config.horarioFuncionamento) rodape += `\n🕐 ${config.horarioFuncionamento}`;
  
  return rodape;
}

// Função para abrir WhatsApp
export function sendWhatsAppMessage(phone: string, message: string): void {
  const url = createWhatsAppURL(phone, message);
  window.open(url, '_blank');
}

// Função para formatar itens de orçamento/OS
export function formatItensParaWhatsApp(itens: any[]): string {
  if (!itens || itens.length === 0) return 'Nenhum item';
  
  return itens.map((item, index) => {
    const subtotal = item.quantidade * item.precoUnitario;
    const desconto = item.desconto || 0;
    const total = subtotal - desconto;
    
    return `${index + 1}. ${item.nome}\n` +
      `   Qtd: ${item.quantidade} x R$ ${item.precoUnitario.toFixed(2)} = R$ ${total.toFixed(2)}` +
      (desconto > 0 ? ` (desc: R$ ${desconto.toFixed(2)})` : '');
  }).join('\n\n');
}

// Função para formatar data
export function formatDateForWhatsApp(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
}

// Templates de mensagens para ordem de serviço
export const whatsappTemplates = {
  ordemCriada: (numero: string, cliente: string, moto: string, problema: string) => 
    `🔧 *ORDEM DE SERVIÇO CRIADA*\n\n` +
    `📋 *Número:* ${numero}\n` +
    `👤 *Cliente:* ${cliente}\n` +
    `🏍️ *Moto:* ${moto}\n` +
    `⚠️ *Problema:* ${problema}\n\n` +
    `Sua moto foi recebida em nossa oficina. Entraremos em contato assim que tivermos mais informações sobre o reparo.` +
    getRodapeEmpresa(),

  ordemEmAndamento: (numero: string, cliente: string, diagnostico?: string) =>
    `🔧 *ORDEM DE SERVIÇO EM ANDAMENTO*\n\n` +
    `📋 *Número:* ${numero}\n` +
    `👤 *Cliente:* ${cliente}\n\n` +
    `✅ Iniciamos os trabalhos em sua moto!\n` +
    (diagnostico ? `🔍 *Diagnóstico:* ${diagnostico}\n\n` : '') +
    `Manteremos você informado sobre o progresso.` +
    getRodapeEmpresa(),

  ordemPronta: (numero: string, cliente: string, valor: number, observacoes?: string) =>
    `✅ *SUA MOTO ESTÁ PRONTA!*\n\n` +
    `📋 *Número:* ${numero}\n` +
    `👤 *Cliente:* ${cliente}\n` +
    `💰 *Valor Total:* R$ ${valor.toFixed(2)}\n\n` +
    `🎉 Sua moto está pronta para retirada!\n` +
    (observacoes ? `📝 *Observações:* ${observacoes}\n` : '') +
    getRodapeEmpresa(),

  orcamento: (numero: string, cliente: string, moto: string, valor: number, itens: string, validade?: string) =>
    `💰 *ORÇAMENTO DISPONÍVEL*\n\n` +
    `📋 *Número:* ${numero}\n` +
    `👤 *Cliente:* ${cliente}\n` +
    `🏍️ *Moto:* ${moto}\n\n` +
    `📝 *Serviços/Peças:*\n${itens}\n\n` +
    `💵 *Valor Total:* R$ ${valor.toFixed(2)}\n` +
    (validade ? `⏰ *Validade:* ${validade}\n\n` : '\n') +
    `Para aprovar o orçamento, entre em contato conosco.\n\n` +
    `⏳ *Aguardando autorização*` +
    getRodapeEmpresa(),

  ordemServico: (numero: string, cliente: string, moto: string, status: string, valor: number, itens: string, observacoes?: string) => {
    const statusEmoji: Record<string, string> = {
      'aberta': '🆕',
      'em_andamento': '🔧',
      'aguardando_peca': '⏳',
      'pronta': '✅',
      'entregue': '🎉',
      'cancelada': '❌'
    };
    
    const statusTexto: Record<string, string> = {
      'aberta': 'ABERTA',
      'em_andamento': 'EM ANDAMENTO',
      'aguardando_peca': 'AGUARDANDO PEÇA',
      'pronta': 'PRONTA',
      'entregue': 'ENTREGUE',
      'cancelada': 'CANCELADA'
    };

    return `${statusEmoji[status] || '📋'} *ORDEM DE SERVIÇO ${statusTexto[status] || status.toUpperCase()}*\n\n` +
      `📋 *Número:* ${numero}\n` +
      `👤 *Cliente:* ${cliente}\n` +
      `🏍️ *Moto:* ${moto}\n` +
      `📊 *Status:* ${statusTexto[status] || status}\n\n` +
      `📝 *Serviços/Peças:*\n${itens}\n\n` +
      `💵 *Valor Total:* R$ ${valor.toFixed(2)}` +
      (observacoes ? `\n\n📌 *Observações:* ${observacoes}` : '') +
      getRodapeEmpresa();
  }
};