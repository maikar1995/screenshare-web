import React from 'react';
import { AppState } from '../../types';

interface StatusBarProps {
  appState: AppState;
}

export const StatusBar: React.FC<StatusBarProps> = ({ appState }) => {
  const formatInterval = (ms: number): string => {
    return `${ms / 1000}s`;
  };

  const getAnalysisStatus = (): string => {
    if (appState.isAnalyzing) {
      return '🔄 Analizando imagen...';
    }
    if (appState.isCapturing) {
      return `⏰ Próxima captura en ${formatInterval(appState.captureInterval)}`;
    }
    return '⏸️ Análisis pausado';
  };

  const getMessageCount = (): string => {
    const total = appState.chatMessages.length;
    const aiMessages = appState.chatMessages.filter(msg => msg.type === 'assistant').length;
    return `💬 ${aiMessages}/${total} mensajes`;
  };

  return (
    <footer className="status-bar">
      <div className="status-section">
        <span className="analysis-status">{getAnalysisStatus()}</span>
      </div>
      
      <div className="status-section">
        <span className="message-count">{getMessageCount()}</span>
      </div>
      
      <div className="status-section">
        <span className="capture-settings">
          📐 {formatInterval(appState.captureInterval)} intervalos
        </span>
      </div>
      
      <div className="status-section">
        <span className="app-version">
          v1.0.0-dev
        </span>
      </div>
    </footer>
  );
};