import { useState, useCallback, useRef, useEffect } from 'react';
import { VoiceState, VoiceSettings } from '../types';
import { VoiceControlService } from '../services/VoiceControlService';
import { WebSocketService } from '../services/websocketService';

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  silenceTimeoutMs: 2000,  // 2s for better testing
  maxRecordingMs: 30000,   // 30s
  volumeThreshold: 0.01,   // Less sensitive to avoid background noise
  minVoiceMs: 300,         // 300ms minimum voice (faster start)
  enabled: false
};

export function useVoiceControl() {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
  const [error, setError] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [showSentConfirmation, setShowSentConfirmation] = useState<boolean>(false);
  
  const serviceRef = useRef<VoiceControlService | null>(null);
  const durationIntervalRef = useRef<number | null>(null);
  const wsServiceRef = useRef<WebSocketService | null>(null);

  const handleStateChange = useCallback((newState: VoiceState) => {
    setVoiceState(newState);
    
    // Start/stop duration tracking
    if (newState === 'recording') {
      durationIntervalRef.current = setInterval(() => {
        if (serviceRef.current) {
          setRecordingDuration(serviceRef.current.getRecordingDuration());
        }
      }, 100);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      setRecordingDuration(0);
    }
    
    // Clear error when returning to listening
    if (newState === 'listening') {
      setError(null);
    }
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    console.error('Voice control error:', errorMessage);
  }, []);

  const handleVoiceCommand = useCallback(async (audioBlob: Blob, imageBlob: Blob) => {
    console.log('📤 handleVoiceCommand called');
    console.log('🔧 wsServiceRef.current exists:', !!wsServiceRef.current);
    console.log('🔗 WebSocket connected:', wsServiceRef.current?.isConnected());
    
    try {
      // Convert audio and image to base64
      const [audioBase64, imageBase64] = await Promise.all([
        blobToBase64(audioBlob),
        blobToBase64(imageBlob)
      ]);
      
      console.log('🎵 Audio converted to base64:', audioBase64.length, 'characters');
      console.log('🖼️ Image converted to base64:', imageBase64.length, 'characters');
      
      // Send both audio and image via WebSocket
      if (wsServiceRef.current && wsServiceRef.current.isConnected()) {
        console.log('🚀 Sending voice command...');
        wsServiceRef.current.sendVoiceCommand(audioBase64, imageBase64);
        console.log('✅ Voice command with image sent successfully');
        
        // Show confirmation popup
        setShowSentConfirmation(true);
        setTimeout(() => {
          setShowSentConfirmation(false);
        }, 2000); // Hide after 2 seconds
        
      } else {
        const errorMsg = wsServiceRef.current ? 'WebSocket no está conectado' : 'WebSocket service no configurado';
        console.error('❌ WebSocket error:', errorMsg);
        handleError(errorMsg);
      }
      
    } catch (error) {
      console.error('❌ Voice command error:', error);
      handleError(`Failed to send voice command: ${error}`);
    }
  }, [handleError]);

  const startVoiceControl = useCallback(async () => {
    if (serviceRef.current || !settings.enabled) {
      return;
    }

    try {
      serviceRef.current = new VoiceControlService(
        {
          onStateChange: handleStateChange,
          onError: handleError,
          onVoiceCommand: handleVoiceCommand
        },
        settings
      );

      await serviceRef.current.initialize();
    } catch (error) {
      handleError(`Failed to start voice control: ${error}`);
    }
  }, [settings, handleStateChange, handleError, handleVoiceCommand]);

  const stopVoiceControl = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.stop();
      serviceRef.current = null;
    }
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    setVoiceState('idle');
    setError(null);
    setRecordingDuration(0);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    if (serviceRef.current) {
      serviceRef.current.updateSettings({ ...settings, ...newSettings });
    }
  }, [settings]);

  // Set up WebSocket service reference
  const setWebSocketService = useCallback((wsService: WebSocketService) => {
    console.log('🔧 Setting WebSocket service in voice control hook');
    wsServiceRef.current = wsService;
    console.log('✅ WebSocket service set, connected:', wsService.isConnected());
  }, []);

  // Auto start/stop when enabled changes
  useEffect(() => {
    if (settings.enabled && voiceState === 'idle' && !serviceRef.current) {
      startVoiceControl();
    } else if (!settings.enabled && serviceRef.current) {
      stopVoiceControl();
    }
  }, [settings.enabled, voiceState, startVoiceControl, stopVoiceControl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVoiceControl();
    };
  }, [stopVoiceControl]);

  const testRecording = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.testRecording();
    }
  }, []);

  // Test WebSocket connection and voice commands
  const testWebSocketConnection = useCallback(async () => {
    if (wsServiceRef.current) {
      await wsServiceRef.current.testConnection('DEV_SHARED_SECRET', 'WRONG_TOKEN');
    }
  }, []);
  
  const testVoiceCommand = useCallback(async () => {
    if (wsServiceRef.current) {
      await wsServiceRef.current.testVoiceCommand();
    }
  }, []);

  return {
    voiceState,
    settings,
    error,
    recordingDuration,
    showSentConfirmation,
    isEnabled: settings.enabled,
    isListening: voiceState === 'listening',
    isRecording: voiceState === 'recording',
    isSending: voiceState === 'sending',
    hasError: voiceState === 'error' || error !== null,
    startVoiceControl,
    stopVoiceControl,
    updateSettings,
    setWebSocketService,
    testRecording,
    testWebSocketConnection,
    testVoiceCommand
  };
}

// Helper function to convert Blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix (data:audio/webm;base64,)
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}