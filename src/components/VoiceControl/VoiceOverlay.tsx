import React from 'react';
import { VoiceState } from '../../types';
import '../../styles/voice.css';

interface VoiceOverlayProps {
  voiceState: VoiceState;
  error?: string | null;
  recordingDuration?: number;
  isEnabled: boolean;
  onToggle: () => void;
  onTest?: () => void;
  showSentConfirmation?: boolean;
}

export function VoiceOverlay({ 
  voiceState, 
  error, 
  recordingDuration = 0, 
  isEnabled,
  onToggle,
  onTest,
  showSentConfirmation = false
}: VoiceOverlayProps) {
  const getStateText = (): string => {
    if (!isEnabled) {
      return 'Haz clic para activar audio + pantalla';
    }
    
    switch (voiceState) {
      case 'idle':
        return 'Activando permisos...';
      case 'listening':
        return 'Escuchando... 🎤📺';
      case 'recording':
        return `Grabando... (${Math.floor(recordingDuration / 1000)}s) 🎙️📸`;
      case 'sending':
        return 'Enviando audio + imagen...';
      case 'error':
        return error || 'Error en control de voz';
      default:
        return 'Control unificado';
    }
  };

  const getStateIcon = (): string => {
    if (!isEnabled) {
      return '🎤';
    }
    
    switch (voiceState) {
      case 'idle':
        return '🎤';
      case 'listening':
        return '👂';
      case 'recording':
        return '🎙️';
      case 'sending':
        return '⏳';
      case 'error':
        return '❌';
      default:
        return '🎤';
    }
  };

  const getStateClass = (): string => {
    const baseClass = 'voice-overlay';
    
    if (!isEnabled) {
      return `${baseClass} voice-idle`;
    }
    
    switch (voiceState) {
      case 'listening':
        return `${baseClass} voice-listening`;
      case 'recording':
        return `${baseClass} voice-recording`;
      case 'sending':
        return `${baseClass} voice-sending`;
      case 'error':
        return `${baseClass} voice-error`;
      default:
        return `${baseClass} voice-idle`;
    }
  };

  return (
    <div className={getStateClass()}>
      <div className="voice-content">
        <span className="voice-icon">{getStateIcon()}</span>
        <span className="voice-text">{getStateText()}</span>
        <div className="voice-controls">
          <button 
            className="voice-toggle" 
            onClick={onToggle}
            aria-label={isEnabled ? 'Desactivar control de voz' : 'Activar control de voz'}
          >
            {isEnabled ? '🔇' : '🔊'}
          </button>
          {isEnabled && voiceState === 'listening' && onTest && (
            <button 
              className="voice-test" 
              onClick={onTest}
              aria-label="Test manual de grabación"
              title="Test 3s de grabación"
            >
              🧪
            </button>
          )}
        </div>
      </div>
      
      {voiceState === 'recording' && (
        <div className="voice-progress">
          <div 
            className="voice-progress-bar"
            style={{ 
              width: `${Math.min((recordingDuration / 60000) * 100, 100)}%` 
            }}
          />
        </div>
      )}
      
      {error && voiceState === 'error' && (
        <div className="voice-error-details">
          {error}
        </div>
      )}
      
      {/* Confirmation popup when command is sent */}
      {showSentConfirmation && (
        <div className="voice-confirmation">
          <div className="voice-confirmation-content">
            <span className="voice-confirmation-icon">✅</span>
            <span className="voice-confirmation-text">Comando enviado</span>
          </div>
        </div>
      )}
    </div>
  );
}