import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Carregar preferência do localStorage - PADRÃO: dark mode ativado
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Se não houver preferência salva, ativar dark mode por padrão
    return true;
  });

  useEffect(() => {
    // Aplicar classe dark no elemento raiz IMEDIATAMENTE
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Salvar preferência
    localStorage.setItem('darkMode', JSON.stringify(isDark));
  }, [isDark]);

  // Aplicar no carregamento inicial
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    }
  }, []);

  const toggleDark = () => {
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggleDark}
      className="p-2.5 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all border border-gray-300 dark:border-gray-600"
      title={isDark ? 'Modo Claro' : 'Modo Escuro'}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-gray-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
}
