import React, { useState, useEffect } from 'react';
import ScreenShareService from '../services/ScreenShareService';
import Controls from './Controls';
import VideoPreview from './VideoPreview';

const ScreenShare: React.FC = () => {
    const [isSharing, setIsSharing] = useState(false);
    const [captureInterval, setCaptureInterval] = useState(1000);
    const [jpegQuality, setJpegQuality] = useState(0.8);
    const [resolution, setResolution] = useState('Auto');
    const [stream, setStream] = useState<MediaStream | null>(null);

    const handleStartSharing = async () => {
        const mediaStream = await ScreenShareService.startCapture();
        setStream(mediaStream);
        setIsSharing(true);
    };

    const handleStopSharing = () => {
        ScreenShareService.stopCapture();
        setStream(null);
        setIsSharing(false);
    };

    useEffect(() => {
        if (isSharing) {
            ScreenShareService.startSnapshots(captureInterval, jpegQuality, resolution, (frame) => {
                // Handle frame processing here
            });
        } else {
            ScreenShareService.stopSnapshots();
        }

        return () => {
            if (isSharing) {
                handleStopSharing();
            }
        };
    }, [isSharing, captureInterval, jpegQuality, resolution]);

    return (
        <div>
            <Controls
                isSharing={isSharing}
                onStart={handleStartSharing}
                onStop={handleStopSharing}
                onIntervalChange={setCaptureInterval}
                onQualityChange={setJpegQuality}
                onResolutionChange={setResolution}
            />
            <VideoPreview stream={stream} />
        </div>
    );
};

export default ScreenShare;