import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppLayout } from './components/AppLayout';
import './styles/main.css';
import './styles/layout.css';
import './styles/chat.css';

console.log('🚀 Main.tsx executing');
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_WS_URL:', import.meta.env.VITE_WS_URL);
console.log('DOM ready:', document.readyState);

window.addEventListener('load', () => {
  console.log('Window loaded');
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM content loaded');
});

const rootElement = document.getElementById('root');
console.log('Root element found:', !!rootElement);

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AppLayout />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}