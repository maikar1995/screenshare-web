import { Ref, ref } from 'vue';

interface ScreenShareOptions {
    video: boolean;
    audio: boolean;
}

export class ScreenShareService {
    private stream: MediaStream | null = null;
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D | null;
    private intervalId: number | null = null;

    constructor() {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
    }

    async startCapture(options: ScreenShareOptions): Promise<void> {
        try {
            this.stream = await navigator.mediaDevices.getDisplayMedia({
                video: options.video,
                audio: options.audio,
            });
        } catch (error) {
            console.error('Error starting screen capture:', error);
            throw error;
        }
    }

    stopCapture(): void {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    getCurrentStream(): MediaStream | null {
        return this.stream;
    }

    startSnapshots(intervalMs: number, quality: number, targetResolution: { width: number; height: number }, onFrame: (frame: Blob) => void): void {
        if (!this.stream || !this.context) {
            throw new Error('Stream is not active or context is not available');
        }

        this.canvas.width = targetResolution.width;
        this.canvas.height = targetResolution.height;

        this.intervalId = window.setInterval(() => {
            this.context.drawImage(this.stream, 0, 0, this.canvas.width, this.canvas.height);
            this.canvas.toBlob((blob) => {
                if (blob) {
                    onFrame(blob);
                }
            }, 'image/jpeg', quality);
        }, intervalMs);
    }

    stopSnapshots(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}