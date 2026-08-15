import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface CompartilharPortalProps {
  numeroOS: string;
}

export function CompartilharPortal({ numeroOS }: CompartilharPortalProps) {
  const [copied, setCopied] = useState(false);

  const portalUrl = `${window.location.origin}?portal=cliente&os=${encodeURIComponent(numeroOS)}`;
  const mensagemWhatsApp = `Olá! Você pode acompanhar seu serviço em tempo real através do nosso Portal do Cliente.\n\n🔐 Código de Acesso: OS-${numeroOS}\n\n🌐 Link de Acesso:\n${portalUrl}\n\n✨ O código já está preenchido! Basta clicar no link e depois em "Entrar" para ver todos os detalhes do seu serviço!`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(mensagemWhatsApp);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleOpenPortal = () => {
    window.open(portalUrl, '_blank');
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleOpenPortal}
        className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/20 rounded-lg transition-colors"
        title="Abrir Portal do Cliente"
      >
        <ExternalLink size={16} />
      </button>
      
      <button
        onClick={handleCopyLink}
        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-lg transition-colors"
        title="Copiar link do portal"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>

      <button
        onClick={handleWhatsApp}
        className="px-3 py-1 bg-green-600 dark:bg-green-700 text-white text-xs rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
        title="Enviar link via WhatsApp"
      >
        Portal
      </button>
    </div>
  );
}
