import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const mountApp = () => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error("MacroPlan Fatal: Elemento #root não encontrado.");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("MacroPlan: Renderização iniciada com sucesso.");
  } catch (error) {
    console.error("MacroPlan: Erro crítico na montagem:", error);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: sans-serif; color: #ef4444;">
        <h1 style="font-weight: 900; font-size: 24px;">Erro ao carregar o App</h1>
        <p style="color: #6b7280; margin-top: 8px;">Ocorreu uma falha na inicialização do MacroPlan.</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #2563eb; color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer;">
          Tentar Novamente
        </button>
      </div>
    `;
  }
};

// Garante que o DOM esteja pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}