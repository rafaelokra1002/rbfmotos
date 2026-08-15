// Base central da API.
// Em produção o próprio Express serve o site e a API na mesma origem,
// então usamos o caminho relativo "/api". Em desenvolvimento, o Vite faz
// proxy de "/api" para o backend (ver vite.config.ts).
// Pode ser sobrescrito no build com a variável VITE_API_URL.
export const API_URL: string =
  ((import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '')) || '/api';
