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

    async startCapture(options: ScreenShareOptions = { video: true, audio: false }): Promise<MediaStream> {
        try {
            this.stream = await navigator.mediaDevices.getDisplayMedia({
                video: options.video,
                audio: options.audio,
            });
            return this.stream;
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

    startSnapshots(intervalMs: number, quality: number, resolution: string | { width: number; height: number }, onFrame: (frame: Blob) => void): void {
        if (!this.stream || !this.context) {
            throw new Error('Stream is not active or context is not available');
        }

        // Handle resolution parameter
        let targetResolution = { width: 1920, height: 1080 };
        if (typeof resolution === 'object') {
            targetResolution = resolution;
        } else if (resolution === '720p') {
            targetResolution = { width: 1280, height: 720 };
        } else if (resolution === '480p') {
            targetResolution = { width: 854, height: 480 };
        }

        this.canvas.width = targetResolution.width;
        this.canvas.height = targetResolution.height;

        // Get video element from stream
        const video = document.createElement('video');
        video.srcObject = this.stream;
        video.play();

        this.intervalId = window.setInterval(() => {
            if (this.context && video.videoWidth > 0) {
                this.context.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
                this.canvas.toBlob((blob) => {
                    if (blob) {
                        onFrame(blob);
                    }
                }, 'image/jpeg', quality);
            }
        }, intervalMs);
    }

    stopSnapshots(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}

// Create a singleton instance
const screenShareService = new ScreenShareService();
export default screenShareService;