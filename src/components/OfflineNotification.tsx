import { useEffect, useState } from 'react';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';

export function OfflineNotification() {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [backendOffline, setBackendOffline] = useState(false);

  useEffect(() => {
    // Detectar se browser está offline
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detectar se backend está offline (através dos logs)
    const checkBackendErrors = () => {
      // Verificar se há muitos timeouts recentes
      const errorCount = document.querySelectorAll('[data-error-timeout]').length;
      if (errorCount > 3) {
        setBackendOffline(true);
      }
    };

    const interval = setInterval(checkBackendErrors, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (!showNotification && isOnline && !backendOffline) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-fade-in">
      {!isOnline && (
        <div className="bg-red-500 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 max-w-md">
          <WifiOff size={24} />
          <div>
            <p className="font-bold">Sem conexão com a internet</p>
            <p className="text-sm">Trabalhando offline com dados em cache</p>
          </div>
        </div>
      )}

      {isOnline && showNotification && (
        <div className="bg-green-500 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 max-w-md">
          <Wifi size={24} />
          <div>
            <p className="font-bold">Conexão restaurada!</p>
            <p className="text-sm">Sincronizando dados...</p>
          </div>
        </div>
      )}

      {backendOffline && (
        <div className="bg-orange-500 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 max-w-md">
          <AlertTriangle size={24} />
          <div>
            <p className="font-bold">Servidor offline</p>
            <p className="text-sm">Inicie o backend com: npm run server</p>
          </div>
        </div>
      )}
    </div>
  );
}
