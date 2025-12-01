import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppLayout } from './components/AppLayout';
import './styles/main.css';
import './styles/layout.css';
import './styles/chat.css';

const rootElement = document.getElementById('root');

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