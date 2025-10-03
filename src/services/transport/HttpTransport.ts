import Transport from './Transport';

class HttpTransport implements Transport {
    private apiUrl: string;

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
    }

    async sendFrame(frame: Blob): Promise<void> {
        const formData = new FormData();
        formData.append('frame', frame, 'snapshot.jpg');

        const response = await fetch(`${this.apiUrl}/upload-frame`, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to send frame: ${response.statusText}`);
        }
    }
}

export default HttpTransport;