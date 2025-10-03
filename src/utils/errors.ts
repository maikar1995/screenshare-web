export function handleError(error: Error): string {
    if (error instanceof DOMException) {
        switch (error.name) {
            case 'NotAllowedError':
                return 'Permission denied: Please allow screen sharing in your browser settings.';
            case 'NotFoundError':
                return 'No display media found: Please ensure you have a screen or window to share.';
            case 'NotReadableError':
                return 'Media is not readable: Please check your media devices.';
            default:
                return 'An unknown error occurred while trying to share the screen.';
        }
    }
    return 'An unexpected error occurred: ' + error.message;
}

export function logError(error: Error): void {
    console.error('Error:', error);
}