import React, { useState, useEffect, useCallback } from 'react';
import { AppState, ChatMessage, CaptureSettings } from '../types';
import { WebSocketService } from '../services/websocketService';
import { useAutoCapture } from '../hooks/useAutoCapture';
import { useVoiceControl } from '../hooks/useVoiceControl';
import { Header } from './Layout/Header';
import { ChatPanel } from './Chat/ChatPanel';
import { StatusBar } from './Layout/StatusBar';
import { PromptSection } from './Layout/PromptSection';
import { VoiceOverlay } from './VoiceControl/VoiceOverlay';

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

  const [isConnected, setIsConnected] = useState(false);

  const [captureSettings] = useState<CaptureSettings>(DEFAULT_CAPTURE_SETTINGS);
  const [wsService] = useState(() => new WebSocketService());

  // Voice control hook
  const voiceControl = useVoiceControl();

  // Set up WebSocket service for voice control - run once on mount
  useEffect(() => {
    console.log('🔧 Setting up WebSocket service for voice control');
    voiceControl.setWebSocketService(wsService);
    console.log('✅ Voice control configured with WebSocket service');
  }, []);  // Empty dependency array to run only once

  const handleVoiceToggle = useCallback(async () => {
    const willEnable = !voiceControl.isEnabled;
    console.log('🎤 Toggle voice control:', willEnable);
    
    if (willEnable) {
      // Connecting WebSocket and enabling voice control
      if (!isConnected) {
        console.log('🔗 Auto-connecting WebSocket for voice control...');
        setAppState(prev => ({ ...prev, connectionStatus: 'connecting' }));
        
        try {
          await wsService.connect('ws://localhost:8000/ws');
          setIsConnected(true);
          setAppState(prev => ({ ...prev, connectionStatus: 'connected' }));
          console.log('✅ WebSocket connected for voice control');
          
        } catch (error) {
          console.error('Failed to connect WebSocket:', error);
          const errorMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'error',
            content: '❌ No se pudo conectar al servidor para control de voz. Asegúrate de que el backend esté funcionando.',
            timestamp: new Date()
          };
          setAppState(prev => ({
            ...prev,
            chatMessages: [...prev.chatMessages, errorMessage],
            connectionStatus: 'error'
          }));
          return; // Don't enable voice control if connection failed
        }
      }
      
      // Ensure WebSocket service is set before enabling
      voiceControl.setWebSocketService(wsService);
      
      // Enable voice control
      voiceControl.updateSettings({ enabled: true });
      
      // Add activation message
      const activationMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: '🎤 Sistema de voz activado. Solicitando permisos...',
        timestamp: new Date()
      };
      setAppState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, activationMessage]
      }));
      
    } else {
      // Disable voice control
      voiceControl.updateSettings({ enabled: false });
      
      // Disconnect WebSocket
      wsService.disconnect();
      setIsConnected(false);
      setAppState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
      
      // Add deactivation message
      const deactivationMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: '⏸️ Sistema de voz desactivado.',
        timestamp: new Date()
      };
      setAppState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, deactivationMessage]
      }));
    }
  }, [voiceControl, isConnected, wsService, setAppState]);

  // All capture functionality is now handled by voice control system
  // which requests both audio and screen permissions upfront
  
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
      
      // Update isConnected state
      setIsConnected(status === 'connected');
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

    // No conectar automáticamente, solo cuando el usuario inicie
    return () => {
      wsService.disconnect();
    };
  }, [wsService]);

  // Voice control will handle all capture functionality now

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
        onPromptUpdate={handlePromptUpdate}
        onClearChat={handleClearChat}
        voiceControl={{
          isEnabled: voiceControl.isEnabled,
          voiceState: voiceControl.voiceState,
          recordingDuration: voiceControl.recordingDuration
        }}
        onVoiceToggle={handleVoiceToggle}
      />
      
      <div className="prompt-row">
        <PromptSection 
          systemPrompt={appState.systemPrompt}
          onPromptUpdate={handlePromptUpdate}
        />
      </div>
      
      <div className="main-content">
        <ChatPanel 
          messages={appState.chatMessages}
          connectionStatus={appState.connectionStatus}
          isAnalyzing={appState.isAnalyzing}
        />
      </div>
      
      <StatusBar appState={appState} />
      
      {/* Voice confirmation popup - keep only the popup */}
      {voiceControl.showSentConfirmation && (
        <div className="voice-confirmation">
          <div className="voice-confirmation-content">
            <span className="voice-confirmation-icon">✅</span>
            <span className="voice-confirmation-text">Comando enviado</span>
          </div>
        </div>
      )}
    </div>
  );
};