import { MessageCircle } from 'lucide-react';
import { sendWhatsAppMessage, whatsappTemplates, formatItensParaWhatsApp, formatDateForWhatsApp } from '../lib/whatsapp';
import { OrdemServico, Cliente, Moto, Orcamento } from '../types';

interface WhatsAppButtonProps {
  ordem?: OrdemServico;
  orcamento?: Orcamento;
  cliente: Cliente;
  moto: Moto;
  tipo: 'criada' | 'em_andamento' | 'pronta' | 'orcamento' | 'ordem_completa';
  className?: string;
  variant?: 'button' | 'icon';
}

export function WhatsAppButton({ ordem, orcamento, cliente, moto, tipo, className = '', variant = 'button' }: WhatsAppButtonProps) {
  const handleSendMessage = () => {
    let message = '';
    const motoInfo = `${moto.marca} ${moto.modelo} - ${moto.placa}`;

    if (tipo === 'orcamento' && orcamento) {
      const itensFormatados = formatItensParaWhatsApp(orcamento.itens);
      const validade = orcamento.validadeAte ? formatDateForWhatsApp(orcamento.validadeAte) : undefined;
      
      message = whatsappTemplates.orcamento(
        orcamento.numero,
        cliente.nome,
        motoInfo,
        orcamento.valorTotal,
        itensFormatados,
        validade
      );
    } else if (tipo === 'ordem_completa' && ordem) {
      const itensFormatados = formatItensParaWhatsApp(ordem.itens);
      
      message = whatsappTemplates.ordemServico(
        ordem.numero,
        cliente.nome,
        motoInfo,
        ordem.status,
        ordem.valorTotal,
        itensFormatados,
        ordem.observacoes
      );
    } else if (ordem) {
      switch (tipo) {
        case 'criada':
          message = whatsappTemplates.ordemCriada(
            ordem.numero,
            cliente.nome,
            motoInfo,
            ordem.descricaoProblema
          );
          break;
        case 'em_andamento':
          message = whatsappTemplates.ordemEmAndamento(
            ordem.numero,
            cliente.nome,
            ordem.diagnostico
          );
          break;
        case 'pronta':
          message = whatsappTemplates.ordemPronta(
            ordem.numero,
            cliente.nome,
            ordem.valorTotal,
            ordem.observacoes
          );
          break;
      }
    }

    sendWhatsAppMessage(cliente.telefone, message);
  };

  const getButtonText = () => {
    switch (tipo) {
      case 'criada':
        return 'Notificar';
      case 'em_andamento':
        return 'Andamento';
      case 'pronta':
        return 'Conclusão';
      case 'orcamento':
        return 'Orçamento';
      case 'ordem_completa':
        return 'Detalhes';
      default:
        return 'WhatsApp';
    }
  };

  const getButtonColor = () => {
    switch (tipo) {
      case 'criada':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'em_andamento':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'pronta':
        return 'bg-green-600 hover:bg-green-700';
      case 'orcamento':
        return 'bg-purple-600 hover:bg-purple-700';
      case 'ordem_completa':
        return 'bg-indigo-600 hover:bg-indigo-700';
      default:
        return 'bg-green-600 hover:bg-green-700';
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleSendMessage}
        className={`p-1.5 text-white rounded-lg transition-colors ${getButtonColor()} ${className}`}
        title={`Enviar via WhatsApp para ${cliente.nome}`}
      >
        <MessageCircle size={16} />
      </button>
    );
  }

  return (
    <button
      onClick={handleSendMessage}
      className={`flex items-center gap-1.5 px-2 py-1.5 text-white rounded-lg transition-colors ${getButtonColor()} ${className}`}
      title={`Enviar mensagem via WhatsApp para ${cliente.nome}`}
    >
      <MessageCircle size={14} />
      <span className="text-xs">{getButtonText()}</span>
    </button>
  );
}
