import React, { useState } from 'react';

interface PromptSectionProps {
  systemPrompt: string;
  onPromptUpdate: (prompt: string) => void;
}

export const PromptSection: React.FC<PromptSectionProps> = ({
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

  return (
    <div className="prompt-section-full">
      <h3 className="prompt-title">Prompt:</h3>
      
      <div className="prompt-display-full">
        <p className="prompt-text-full">{systemPrompt}</p>
        <button 
          className="btn btn-edit"
          onClick={() => setIsPromptEditing(true)}
          title="Editar prompt"
        >
          ✏️
        </button>
      </div>
      
      {isPromptEditing && (
        <div className="prompt-modal-overlay" onClick={handlePromptCancel}>
          <div className="prompt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prompt-modal-header">
              <h3>Editar Instrucciones del AI</h3>
              <button 
                className="btn-close"
                onClick={handlePromptCancel}
                title="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="prompt-modal-body">
              <textarea
                className="prompt-modal-textarea"
                value={tempPrompt}
                onChange={(e) => setTempPrompt(e.target.value)}
                placeholder="Escribe las instrucciones detalladas para el AI..."
                rows={6}
                autoFocus
              />
            </div>
            <div className="prompt-modal-footer">
              <button 
                className="btn btn-cancel"
                onClick={handlePromptCancel}
              >
                ❌ Cancelar
              </button>
              <button 
                className="btn btn-save"
                onClick={handlePromptSave}
              >
                ✅ Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};