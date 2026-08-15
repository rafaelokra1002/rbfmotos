import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { canInstall, promptInstall } from '../lib/pwa';

interface InstallPWAButtonProps {
  variant?: 'header' | 'full';
  className?: string;
}

// Botão que só aparece quando o navegador sinaliza que o app pode ser instalado.
export function InstallPWAButton({ variant = 'header', className = '' }: InstallPWAButtonProps) {
  const [installable, setInstallable] = useState(canInstall());

  useEffect(() => {
    const onInstallable = () => setInstallable(true);
    const onInstalled = () => setInstallable(false);
    window.addEventListener('pwa:installable', onInstallable);
    window.addEventListener('pwa:installed', onInstalled);
    return () => {
      window.removeEventListener('pwa:installable', onInstallable);
      window.removeEventListener('pwa:installed', onInstalled);
    };
  }, []);

  if (!installable) return null;

  const handleClick = async () => {
    const accepted = await promptInstall();
    if (accepted) setInstallable(false);
  };

  if (variant === 'full') {
    return (
      <button
        onClick={handleClick}
        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm font-medium ${className}`}
      >
        <Download size={16} />
        Instalar app no celular
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 py-1.5 px-3 rounded-lg bg-slate-700 dark:bg-slate-600 text-white hover:bg-slate-800 dark:hover:bg-slate-500 transition-all text-sm font-medium ${className}`}
      title="Instalar aplicativo"
    >
      <Download size={16} />
      <span className="hidden sm:inline">Instalar app</span>
    </button>
  );
}
