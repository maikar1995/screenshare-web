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
  type: 'screenshot' | 'chat_response' | 'error' | 'status' | 'prompt_update';
  data: any;
  id?: string;
  timestamp?: number;
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