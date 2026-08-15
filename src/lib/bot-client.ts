/**
 * 🤖 CLIENTE DO BOT WHATSAPP
 * 
 * Cliente HTTP para comunicação com o bot WhatsApp
 * que está rodando em http://localhost:3030
 */

import axios, { AxiosInstance } from 'axios';
import { BOT_WHATSAPP_URL, BOT_CONFIG } from '../config/bot-config';

class BotWhatsAppClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BOT_WHATSAPP_URL,
      timeout: BOT_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Envia mensagem via WhatsApp
   */
  async enviarMensagem(numero: string, mensagem: string): Promise<boolean> {
    try {
      const response = await this.client.post('/send-message', {
        number: numero,
        message: mensagem,
      });

      return response.status === 200;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem WhatsApp:', error);
      return false;
    }
  }

  /**
   * Envia mensagem com botões
   */
  async enviarMensagemComBotoes(
    numero: string,
    mensagem: string,
    botoes: Array<{ id: string; text: string }>
  ): Promise<boolean> {
    try {
      const response = await this.client.post('/send-buttons', {
        number: numero,
        message: mensagem,
        buttons: botoes,
      });

      return response.status === 200;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem com botões:', error);
      return false;
    }
  }

  /**
   * Envia arquivo via WhatsApp
   */
  async enviarArquivo(
    numero: string,
    caminhoArquivo: string,
    legenda?: string
  ): Promise<boolean> {
    try {
      const response = await this.client.post('/send-file', {
        number: numero,
        filePath: caminhoArquivo,
        caption: legenda,
      });

      return response.status === 200;
    } catch (error) {
      console.error('❌ Erro ao enviar arquivo:', error);
      return false;
    }
  }

  /**
   * Verifica status do bot
   */
  async verificarStatus(): Promise<{
    ativo: boolean;
    estado: string;
  }> {
    try {
      const response = await this.client.get('/status');

      return {
        ativo: response.status === 200,
        estado: response.data.state || 'UNKNOWN',
      };
    } catch (error) {
      return {
        ativo: false,
        estado: 'OFFLINE',
      };
    }
  }
}

// Singleton
export const botWhatsApp = new BotWhatsAppClient();
