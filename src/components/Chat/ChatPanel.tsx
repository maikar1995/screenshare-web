import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  connectionStatus: string;
  isAnalyzing: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  connectionStatus,
  isAnalyzing
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getMessageIcon = (type: ChatMessage['type']): string => {
    switch (type) {
      case 'assistant':
        return '🤖';
      case 'user':
        return '👤';
      case 'system':
        return '⚙️';
      case 'error':
        return '❌';
      default:
        return '💬';
    }
  };

  const getMessageClass = (type: ChatMessage['type']): string => {
    return `message message-${type}`;
  };

  return (
    <div className="chat-panel">


      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💭</div>
            <p className="empty-text">
              No hay mensajes aún.<br/>
              ¡Inicia la captura para comenzar el análisis!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={getMessageClass(message.type)}>
              <div className="message-header">
                <span className="message-icon">{getMessageIcon(message.type)}</span>
                <span className="message-time">{formatTime(message.timestamp)}</span>
              </div>
              <div className="message-content">
                {message.content}
              </div>
              {message.imageData && (
                <div className="message-image">
                  <img 
                    src={message.imageData} 
                    alt="Captura de pantalla" 
                    className="screenshot-thumb"
                  />
                </div>
              )}
            </div>
          ))
        )}
        
        {isAnalyzing && (
          <div className="message message-assistant analyzing">
            <div className="message-header">
              <span className="message-icon">🤖</span>
              <span className="message-time">{formatTime(new Date())}</span>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="analyzing-text">El AI está analizando la imagen...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>


    </div>
  );
};