import { describe, it, expect, vi } from 'vitest';
import { ScreenShareService } from '../../src/services/ScreenShareService';

describe('ScreenShareService', () => {
    let service: ScreenShareService;
    let mockStream: MediaStream;

    beforeEach(() => {
        service = new ScreenShareService();
        mockStream = new MediaStream();
        vi.spyOn(navigator.mediaDevices, 'getDisplayMedia').mockResolvedValue(mockStream);
    });

    afterEach(() => {
        service.stopCapture();
        vi.restoreAllMocks();
    });

    it('should start capturing the screen', async () => {
        await service.startCapture({ video: true, audio: false });
        expect(service.getCurrentStream()).toBe(mockStream);
    });

    it('should stop capturing the screen', async () => {
        await service.startCapture({ video: true, audio: false });
        service.stopCapture();
        expect(service.getCurrentStream()).toBeNull();
    });

    it('should handle track.onended event', async () => {
        const onEndedSpy = vi.fn();
        mockStream.getVideoTracks()[0].onended = onEndedSpy;

        await service.startCapture({ video: true, audio: false });
        mockStream.getVideoTracks()[0].onended();
        
        expect(onEndedSpy).toHaveBeenCalled();
        expect(service.getCurrentStream()).toBeNull();
    });

    it('should start taking snapshots', async () => {
        const onFrame = vi.fn();
        await service.startCapture({ video: true, audio: false });
        service.startSnapshots(1000, 0.8, 'Auto', onFrame);

        // Simulate a frame being captured
        await new Promise(resolve => setTimeout(resolve, 1100));
        expect(onFrame).toHaveBeenCalled();
    });

    it('should stop taking snapshots', async () => {
        const onFrame = vi.fn();
        await service.startCapture({ video: true, audio: false });
        service.startSnapshots(1000, 0.8, 'Auto', onFrame);
        service.stopSnapshots();

        // Simulate a frame being captured
        await new Promise(resolve => setTimeout(resolve, 1100));
        expect(onFrame).not.toHaveBeenCalled();
    });
});