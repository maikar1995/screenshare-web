import { Transport } from './Transport';

export class WebSocketTransport implements Transport {
    private socket: WebSocket | null = null;
    private reconnectInterval: number = 1000; // Initial reconnect interval
    private isConnected: boolean = false;
    private messageQueue: Blob[] = [];

    constructor(private url: string) {}

    public connect(): void {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            this.isConnected = true;
            this.flushQueue();
        };

        this.socket.onclose = () => {
            this.isConnected = false;
            this.reconnect();
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.socket?.close();
        };
    }

    public sendFrame(frame: Blob | ArrayBuffer): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isConnected && this.socket) {
                this.socket.send(frame);
                resolve();
            } else {
                this.messageQueue.push(frame as Blob);
                reject(new Error('WebSocket not connected, frame queued.'));
            }
        });
    }

    private flushQueue(): void {
        while (this.messageQueue.length > 0) {
            const frame = this.messageQueue.shift();
            if (frame) {
                this.sendFrame(frame).catch(() => {
                    // Handle send failure if needed
                });
            }
        }
    }

    private reconnect(): void {
        setTimeout(() => {
            console.log('Reconnecting to WebSocket...');
            this.connect();
        }, this.reconnectInterval);
        this.reconnectInterval = Math.min(this.reconnectInterval * 2, 30000); // Exponential backoff
    }

    public close(): void {
        this.socket?.close();
    }
}