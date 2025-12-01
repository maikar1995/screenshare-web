import React, { useState } from 'react';
import { AppState } from '../../types';

interface HeaderProps {
  appState: AppState;
  onStartCapture: () => void;
  onStopCapture: () => void;
  onPromptUpdate: (prompt: string) => void;
  onClearChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  appState,
  onStartCapture,
  onStopCapture,
  onPromptUpdate,
  onClearChat
}) => {
  const [isPromptEditing, setIsPromptEditing] = useState(false);
  const [tempPrompt, setTempPrompt] = useState(appState.systemPrompt);

  const handlePromptSave = () => {
    onPromptUpdate(tempPrompt);
    setIsPromptEditing(false);
  };

  const handlePromptCancel = () => {
    setTempPrompt(appState.systemPrompt);
    setIsPromptEditing(false);
  };

  const getConnectionStatusIcon = () => {
    switch (appState.connectionStatus) {
      case 'connected':
        return '🟢';
      case 'connecting':
        return '🟡';
      case 'error':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getConnectionStatusText = () => {
    switch (appState.connectionStatus) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Conectando...';
      case 'error':
        return 'Error de conexión';
      default:
        return 'Desconectado';
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">
          🤖 AI Screen
        </h1>
        <div className="connection-status">
          <span className="status-icon">{getConnectionStatusIcon()}</span>
          <span className="status-text">{getConnectionStatusText()}</span>
        </div>
      </div>



      <div className="header-right">
        <div className="control-buttons">
          {appState.isCapturing ? (
            <button 
              className="btn btn-stop"
              onClick={onStopCapture}
              title="Pausar análisis automático"
            >
              ⏸️ Pausar
            </button>
          ) : (
            <button 
              className="btn btn-start"
              onClick={onStartCapture}
              title="Iniciar análisis automático"
              disabled={false}
            >
              ▶️ Iniciar
            </button>
          )}
          
          <button 
            className="btn btn-clear"
            onClick={onClearChat}
            title="Limpiar historial de chat"
          >
            🧹 Limpiar
          </button>
        </div>
      </div>
    </header>
  );
};