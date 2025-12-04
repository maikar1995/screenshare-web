import { ChatMessage, WebSocketMessage } from '../types';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private onMessageCallback?: (message: ChatMessage) => void;
  private onStatusCallback?: (status: string) => void;
  private onErrorCallback?: (error: string) => void;
  
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private url = '';
  private isMockMode = false; // Cambiado a backend real

  async connect(url: string): Promise<void> {
    this.url = url;
    
    if (this.isMockMode) {
      return this.connectMock();
    }
    
    return new Promise((resolve, reject) => {
      try {
        this.onStatusCallback?.('connecting');
        this.ws = new WebSocket(url);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.onStatusCallback?.('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.onStatusCallback?.('disconnected');
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.onErrorCallback?.('Connection error');
          reject(error);
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }

  // Mock implementation para desarrollo
  private async connectMock(): Promise<void> {
    console.log('🔧 Using mock WebSocket service');
    this.onStatusCallback?.('connecting');
    
    // Simular conexión
    setTimeout(() => {
      this.onStatusCallback?.('connected');
    }, 1000);
  }

  private scheduleReconnect(): void {
    setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      this.connect(this.url).catch(() => {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.onErrorCallback?.('Max reconnection attempts reached');
        }
      });
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  sendScreenshot(imageData: string, prompt?: string): void {
    if (this.isMockMode) {
      this.sendScreenshotMock(imageData, prompt);
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'screenshot',
        data: {
          image: imageData,
          prompt: prompt,
          timestamp: Date.now()
        }
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send screenshot');
    }
  }

  sendVoiceCommand(audioBase64: string, imageBase64?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'voice_command',
        audio_base64: audioBase64,
        audio_mime: 'audio/webm',
        image_base64: imageBase64 || '', // Optional image
        image_mime: 'image/png',
        client_timestamp: new Date().toISOString()
      };
      console.log('📤 Sending voice command via WebSocket');
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send voice command');
    }
  }

  // Mock implementation para simular respuesta del LLM
  private sendScreenshotMock(imageData: string, prompt?: string): void {
    console.log('📸 Mock: Screenshot captured and sent');
    
    // Simular procesamiento del LLM
    setTimeout(() => {
      const responses = [
        "Puedo ver una pantalla con código en un editor. Parece que estás trabajando en un proyecto React con TypeScript.",
        "Veo una interfaz de desarrollo. Hay varios archivos abiertos y código JavaScript/TypeScript visible.",
        "La pantalla muestra un editor de código con estructura de proyecto. Parece un desarrollo web frontend.",
        "Observo una aplicación de desarrollo con archivos de código. El proyecto parece estar relacionado con React.",
        "En la pantalla hay un IDE con código fuente. Se ve un proyecto de desarrollo web con archivos TypeScript."
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const mockMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: randomResponse,
        timestamp: new Date()
      };

      this.onMessageCallback?.(mockMessage);
    }, 2000 + Math.random() * 1000); // Simular latencia variable
  }

  sendPromptUpdate(prompt: string): void {
    if (this.isMockMode) {
      console.log('🔧 Mock: Prompt updated to:', prompt);
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'prompt_update',
        data: { prompt }
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  private handleMessage(data: WebSocketMessage): void {
    switch (data.type) {
      case 'chat_response':
        const message: ChatMessage = {
          id: data.id || Date.now().toString(),
          type: 'assistant',
          content: data.data.content,
          timestamp: new Date(data.timestamp || Date.now())
        };
        this.onMessageCallback?.(message);
        break;
        
      case 'error':
        this.onErrorCallback?.(data.data.message);
        break;
        
      case 'status':
        this.onStatusCallback?.(data.data.status);
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  onMessage(callback: (message: ChatMessage) => void): void {
    this.onMessageCallback = callback;
  }

  onStatusChange(callback: (status: string) => void): void {
    this.onStatusCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  disconnect(): void {
    if (this.isMockMode) {
      console.log('🔧 Mock: WebSocket disconnected');
      this.onStatusCallback?.('disconnected');
      return;
    }

    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }
  }

  isConnected(): boolean {
    if (this.isMockMode) {
      return true; // En modo mock siempre está "conectado"
    }
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Método para cambiar entre mock y real
  setMockMode(enabled: boolean): void {
    this.isMockMode = enabled;
    console.log(`WebSocket service ${enabled ? 'mock' : 'real'} mode enabled`);
  }
}