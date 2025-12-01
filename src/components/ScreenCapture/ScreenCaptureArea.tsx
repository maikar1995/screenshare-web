import React, { useState } from 'react';

interface ScreenCaptureAreaProps {
  isCapturing: boolean;
  isAnalyzing: boolean;
  systemPrompt: string;
  onPromptUpdate: (prompt: string) => void;
}

export const ScreenCaptureArea: React.FC<ScreenCaptureAreaProps> = ({
  isCapturing,
  isAnalyzing,
  systemPrompt,
  onPromptUpdate
}) => {
  const [isPromptEditing, setIsPromptEditing] = useState(false);
  const [tempPrompt, setTempPrompt] = useState(systemPrompt);

  const handlePromptSave = () => {
    onPromptUpdate(tempPrompt);
    setIsPromptEditing(false);
  };

  const handlePromptCancel = () => {
    setTempPrompt(systemPrompt);
    setIsPromptEditing(false);
  };
  const getStatusMessage = () => {
    if (isAnalyzing) {
      return '🔄 Procesando imagen con AI...';
    }
    if (isCapturing) {
      return '📹 Capturando pantalla automáticamente cada 30 segundos';
    }
    return '⏸️ Captura pausada. Haz clic en "Iniciar" para comenzar el análisis.';
  };

  const getStatusClass = () => {
    if (isAnalyzing) return 'analyzing';
    if (isCapturing) return 'capturing';
    return 'paused';
  };

  return (
    <div className={`capture-area ${getStatusClass()}`}>
      <div className="capture-content">
        <div className="capture-icon">
          {isAnalyzing ? '🔄' : isCapturing ? '📹' : '📺'}
        </div>
        
        <h2 className="capture-title">Análisis de Pantalla AI</h2>
        
        <p className="capture-status">
          {getStatusMessage()}
        </p>
        
        {isCapturing && (
          <div className="capture-indicators">
            <div className="indicator recording">
              <span className="indicator-dot"></span>
              <span>En vivo</span>
            </div>
            
            <div className="capture-info">
              <p>
                📸 Las imágenes se capturan cada 30 segundos<br/>
                🤖 El AI analiza automáticamente el contenido<br/>
                💬 Las respuestas aparecen en el chat lateral
              </p>
            </div>
          </div>
        )}
        
        {!isCapturing && (
          <div className="capture-help">
            <h3>¿Cómo funciona?</h3>
            <ol>
              <li>Haz clic en <strong>"Iniciar"</strong> para comenzar</li>
              <li>Comparte tu pantalla cuando se solicite</li>
              <li>El AI analizará automáticamente lo que ve</li>
              <li>Las respuestas aparecerán en el chat lateral</li>
            </ol>
            
            <div className="privacy-notice">
              <p>
                🔒 <strong>Privacidad:</strong> Las imágenes se procesan solo mientras 
                la aplicación está activa y no se almacenan permanentemente.
              </p>
            </div>
            
            <div className="prompt-section-body">
              <h4>Instrucciones para el AI:</h4>
              {isPromptEditing ? (
                <div className="prompt-editing">
                  <textarea
                    className="prompt-textarea"
                    value={tempPrompt}
                    onChange={(e) => setTempPrompt(e.target.value)}
                    placeholder="Escribe las instrucciones para el AI..."
                    rows={4}
                  />
                  <div className="prompt-buttons">
                    <button 
                      className="btn btn-save"
                      onClick={handlePromptSave}
                    >
                      ✅ Guardar
                    </button>
                    <button 
                      className="btn btn-cancel"
                      onClick={handlePromptCancel}
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prompt-display">
                  <p className="prompt-text">{systemPrompt}</p>
                  <button 
                    className="btn btn-edit"
                    onClick={() => setIsPromptEditing(true)}
                  >
                    ✏️ Editar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {isAnalyzing && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};