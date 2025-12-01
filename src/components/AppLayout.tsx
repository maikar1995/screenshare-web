import React, { useState, useEffect, useCallback } from 'react';
import { AppState, ChatMessage, CaptureSettings } from '../types';
import { WebSocketService } from '../services/websocketService';
import { useAutoCapture } from '../hooks/useAutoCapture';
import { Header } from './Layout/Header';
import { ChatPanel } from './Chat/ChatPanel';
import { StatusBar } from './Layout/StatusBar';
import { ScreenCaptureArea } from './ScreenCapture/ScreenCaptureArea';

const DEFAULT_CAPTURE_SETTINGS: CaptureSettings = {
  interval: 30000, // 30 segundos
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080
};

export const AppLayout: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    isCapturing: false,
    isAnalyzing: false,
    chatMessages: [],
    systemPrompt: "Analiza las capturas de pantalla que recibas y describe detalladamente lo que ves. Presta especial atención a texto, interfaces de usuario, código, y cualquier elemento relevante en la pantalla.",
    captureInterval: DEFAULT_CAPTURE_SETTINGS.interval,
    connectionStatus: 'disconnected'
  });

  const [captureSettings] = useState<CaptureSettings>(DEFAULT_CAPTURE_SETTINGS);
  const [wsService] = useState(() => new WebSocketService());

  // Callbacks para manejar capturas de pantalla
  const handleScreenCapture = useCallback((imageData: string) => {
    console.log('📸 Screen captured, sending to backend...');
    setAppState(prev => ({ ...prev, isAnalyzing: true }));
    wsService.sendScreenshot(imageData, appState.systemPrompt);
  }, [wsService, appState.systemPrompt]);

  const handleCaptureError = useCallback((error: string) => {
    console.error('Capture error:', error);
    const errorMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'error',
      content: `Error de captura: ${error}`,
      timestamp: new Date()
    };
    
    setAppState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, errorMessage],
      isCapturing: false,
      isAnalyzing: false
    }));
  }, []);

  // Hook para captura automática
  const { stopCapture } = useAutoCapture(
    appState.isCapturing,
    captureSettings,
    handleScreenCapture,
    handleCaptureError
  );

  // Configurar WebSocket callbacks
  useEffect(() => {
    wsService.onMessage((message: ChatMessage) => {
      console.log('💬 Received message from backend:', message.content.slice(0, 100) + '...');
      setAppState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, message],
        isAnalyzing: false
      }));
    });

    wsService.onStatusChange((status: string) => {
      console.log('🔗 Connection status changed:', status);
      setAppState(prev => ({
        ...prev,
        connectionStatus: status as AppState['connectionStatus']
      }));
    });

    wsService.onError((error: string) => {
      console.error('🔥 WebSocket error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'error',
        content: `Error de conexión: ${error}`,
        timestamp: new Date()
      };
      
      setAppState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, errorMessage],
        connectionStatus: 'error',
        isAnalyzing: false
      }));
    });

    // Conectar al WebSocket (usando modo mock inicialmente)
    wsService.connect('ws://localhost:8000/ws').catch(error => {
      console.error('Failed to connect to WebSocket:', error);
    });

    return () => {
      wsService.disconnect();
    };
  }, [wsService]);

  // Handlers para los controles
  const handleStartCapture = useCallback(() => {
    console.log('🚀 Starting capture session');
    setAppState(prev => ({ ...prev, isCapturing: true }));
    
    // Agregar mensaje de inicio
    const startMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: '🎯 Iniciando análisis automático de pantalla cada 30 segundos...',
      timestamp: new Date()
    };
    
    setAppState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, startMessage]
    }));
  }, []);

  const handleStopCapture = useCallback(() => {
    console.log('⏹️ Stopping capture session');
    stopCapture();
    setAppState(prev => ({ 
      ...prev, 
      isCapturing: false, 
      isAnalyzing: false 
    }));
    
    // Agregar mensaje de parada
    const stopMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: '⏸️ Análisis automático pausado.',
      timestamp: new Date()
    };
    
    setAppState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, stopMessage]
    }));
  }, [stopCapture]);

  const handlePromptUpdate = useCallback((newPrompt: string) => {
    console.log('📝 Updating system prompt');
    setAppState(prev => ({ ...prev, systemPrompt: newPrompt }));
    wsService.sendPromptUpdate(newPrompt);
  }, [wsService]);

  const handleClearChat = useCallback(() => {
    console.log('🧹 Clearing chat history');
    setAppState(prev => ({ ...prev, chatMessages: [] }));
  }, []);

  return (
    <div className="app-layout">
      <Header 
        appState={appState}
        onStartCapture={handleStartCapture}
        onStopCapture={handleStopCapture}
        onPromptUpdate={handlePromptUpdate}
        onClearChat={handleClearChat}
      />
      
      <div className="main-content">
        <div className="capture-section">
          <ScreenCaptureArea 
            isCapturing={appState.isCapturing}
            isAnalyzing={appState.isAnalyzing}
            systemPrompt={appState.systemPrompt}
            onPromptUpdate={handlePromptUpdate}
          />
        </div>
        
        <div className="chat-section">
          <ChatPanel 
            messages={appState.chatMessages}
            connectionStatus={appState.connectionStatus}
            isAnalyzing={appState.isAnalyzing}
          />
        </div>
      </div>
      
      <StatusBar appState={appState} />
    </div>
  );
};