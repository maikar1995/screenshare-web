export function captureFrame(videoElement: HTMLVideoElement, quality: number): Promise<Blob | null> {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                if (blob) {
                    const jpegBlob = new Blob([blob], { type: 'image/jpeg' });
                    resolve(jpegBlob);
                } else {
                    resolve(null);
                }
            }, 'image/jpeg', quality);
        } else {
            resolve(null);
        }
    });
}

export function resizeCanvas(canvas: HTMLCanvasElement, width: number, height: number): void {
    const context = canvas.getContext('2d');
    if (context) {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = width;
        canvas.height = height;
        context.putImageData(imageData, 0, 0);
    }
}