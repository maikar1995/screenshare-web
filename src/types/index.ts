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
  type: 'screenshot' | 'chat_response' | 'error' | 'status' | 'prompt_update' | 'voice_command';
  data?: any;
  audio_base64?: string;
  audio_mime?: string;
  image_base64?: string;
  image_mime?: string;
  client_timestamp?: string;
  id?: string;
  timestamp?: number;
}

export type VoiceState = 'idle' | 'listening' | 'recording' | 'sending' | 'error';

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