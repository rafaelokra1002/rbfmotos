import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/design-tokens.css'; // ✨ Design Tokens Premium (IMPORTAR PRIMEIRO)
import './index.css';
import './responsive.css';
import { initPWA } from './lib/pwa';

initPWA();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
