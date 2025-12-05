import React, { useState } from 'react';
import { AppState, VoiceState } from '../../types';

interface HeaderProps {
  appState: AppState;
  onPromptUpdate: (prompt: string) => void;
  onClearChat: () => void;
  voiceControl: {
    isEnabled: boolean;
    voiceState: VoiceState;
    recordingDuration: number;
  };
  onVoiceToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  appState,
  onPromptUpdate,
  onClearChat,
  voiceControl,
  onVoiceToggle
}) => {
  
  const getVoiceStatusText = (voiceState: VoiceState, recordingDuration: number): string => {
    switch (voiceState) {
      case 'idle':
        return 'Activando...';
      case 'listening':
        return 'Escuchando';
      case 'recording':
        return `Grabando (${Math.floor(recordingDuration / 1000)}s)`;
      case 'sending':
        return 'Enviando...';
      case 'error':
        return 'Error';
      default:
        return 'Listo';
    }
  };
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
          {/* Integrated voice control */}
          <button 
            className={`btn voice-control-btn ${voiceControl.isEnabled ? 'voice-active' : 'voice-inactive'}`}
            onClick={onVoiceToggle}
            title={voiceControl.isEnabled ? 'Desactivar audio + pantalla' : 'Activar audio + pantalla'}
          >
            {voiceControl.isEnabled ? '🛑' : '▶️'}
            <span className="voice-status-text">
              {voiceControl.isEnabled ? getVoiceStatusText(voiceControl.voiceState, voiceControl.recordingDuration) : 'Iniciar'}
            </span>
          </button>
          
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