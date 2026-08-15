import { useState, useEffect } from 'react';
import { Database, WifiOff } from 'lucide-react';

export function DatabaseStatus() {
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const apiUrl = window.location.hostname === 'localhost'
          ? 'http://localhost:9001/api/clientes'
          : `http://${window.location.hostname}:9001/api/clientes`;
        const response = await fetch(apiUrl);
        setIsOnline(response.ok);
      } catch (error) {
        setIsOnline(false);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Verifica a cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-yellow-500 text-sm">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>Conectando...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${isOnline ? 'text-green-600' : 'text-amber-600'}`}>
      {isOnline ? (
        <>
          <Database size={16} />
          <span>Banco conectado</span>
        </>
      ) : (
        <>
          <WifiOff size={16} />
          <span>Modo offline</span>
        </>
      )}
    </div>
  );
}
