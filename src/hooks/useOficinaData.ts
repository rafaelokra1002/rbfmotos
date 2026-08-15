import { useApiData } from './useApiData';

export function useOficinaData() {
  // Usar API para tudo
  const apiData = useApiData();

  return {
    ...apiData,
  };
}
