import React, { useState } from 'react';

interface ControlsProps {
    isSharing: boolean;
    onStart: () => void;
    onStop: () => void;
    onIntervalChange: (interval: number) => void;
    onQualityChange: (quality: number) => void;
    onResolutionChange: (resolution: string) => void;
}

const Controls: React.FC<ControlsProps> = ({ isSharing, onStart, onStop, onIntervalChange, onQualityChange, onResolutionChange }) => {
    const [interval, setInterval] = useState(1000);
    const [quality, setQuality] = useState(0.8);
    const [resolution, setResolution] = useState('Auto');

    const handleStartStop = () => {
        if (isSharing) {
            onStop();
        } else {
            onStart();
        }
    };

    const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newInterval = parseInt(e.target.value, 10);
        setInterval(newInterval);
        onIntervalChange(newInterval);
    };

    const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuality = parseFloat(e.target.value);
        setQuality(newQuality);
        onQualityChange(newQuality);
    };

    const handleResolutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newResolution = e.target.value;
        setResolution(newResolution);
        onResolutionChange(newResolution);
    };

    return (
        <div className="controls">
            <button onClick={handleStartStop}>
                {isSharing ? 'Detener Compartición' : 'Compartir Pantalla'}
            </button>
            <div>
                <label>
                    Intervalo de Captura (ms):
                    <input type="number" value={interval} onChange={handleIntervalChange} />
                </label>
            </div>
            <div>
                <label>
                    Calidad JPEG (0-1):
                    <input type="number" step="0.1" min="0" max="1" value={quality} onChange={handleQualityChange} />
                </label>
            </div>
            <div>
                <label>
                    Resolución:
                    <select value={resolution} onChange={handleResolutionChange}>
                        <option value="Auto">Auto</option>
                        <option value="1280x720">1280x720</option>
                        <option value="1920x1080">1920x1080</option>
                    </select>
                </label>
            </div>
        </div>
    );
};

export default Controls;