export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp: Date;
  imageData?: string;
}

export interface AppState {
  isCapturing: boolean;
  isAnalyzing: boolean;
  chatMessages: ChatMessage[];
  systemPrompt: string;
  captureInterval: number;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
}

export interface CaptureSettings {
  interval: number;
  quality: number;
  maxWidth: number;
  maxHeight: number;
}

export interface WebSocketMessage {
  type: 'screenshot' | 'chat_response' | 'error' | 'status' | 'prompt_update' | 'voice_command' | 'voice_command_result' | 'voice_command_response';
  data?: any;
  audio_base64?: string;
  audio_mime?: string;
  image_base64?: string;
  image_mime?: string;
  client_timestamp?: string;
  id?: string;
  timestamp?: number;
  reply?: string;
  raw_transcript?: string;
  success?: boolean;
}

export type VoiceState = 'idle' | 'listening' | 'recording' | 'sending' | 'error';

// Vite environment variables types
declare global {
  interface ImportMeta {
    env: {
      VITE_WS_URL?: string;
      VITE_API_BASE_URL?: string;
      VITE_WS_API_URL?: string;
      DEV?: boolean;
      PROD?: boolean;
      MODE?: string;
    };
  }
}


export interface VoiceSettings {
  silenceTimeoutMs: number;
  maxRecordingMs: number;
  volumeThreshold: number;
  minVoiceMs: number;
  enabled: boolean;
}

export interface VoiceControlCallbacks {
  onStateChange: (state: VoiceState) => void;
  onError: (error: string) => void;
  onVoiceCommand: (audioBlob: Blob, imageBlob: Blob) => void;
}

export interface ScreenshotData {
  image: string;
  prompt?: string;
  timestamp: number;
}

export interface ConnectionConfig {
  wsUrl: string;
  apiUrl: string;
  reconnectAttempts: number;
  reconnectDelay: number;
}