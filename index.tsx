import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("MacroPlan: Iniciando montagem do app...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("MacroPlan Error: Elemento #root não encontrado no DOM.");
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);