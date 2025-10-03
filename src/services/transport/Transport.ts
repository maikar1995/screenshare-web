export interface Transport {
    sendFrame(frame: Blob | ArrayBuffer): Promise<void>;
}