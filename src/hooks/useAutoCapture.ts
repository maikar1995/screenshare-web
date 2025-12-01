import { useEffect, useRef, useCallback } from 'react';
import { CaptureSettings } from '../types';

export const useAutoCapture = (
  isActive: boolean,
  settings: CaptureSettings,
  onCapture: (imageData: string) => void,
  onError: (error: string) => void
) => {
  const intervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const captureScreen = useCallback(async () => {
    try {
      // Si ya tenemos un stream, lo reutilizamos
      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: settings.maxWidth },
            height: { ideal: settings.maxHeight }
          }
        });

        // Manejar cuando el usuario deja de compartir
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.addEventListener('ended', () => {
            console.log('Screen sharing ended by user');
            stopCapture();
          });
        }
      }

      const video = document.createElement('video');
      video.srcObject = streamRef.current;
      video.muted = true; // Evitar audio feedback
      
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = reject;
        video.play().catch(reject);
      });

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        // Optimizar tamaño si es necesario
        let finalCanvas = canvas;
        if (video.videoWidth > settings.maxWidth || video.videoHeight > settings.maxHeight) {
          finalCanvas = document.createElement('canvas');
          const ratio = Math.min(
            settings.maxWidth / video.videoWidth,
            settings.maxHeight / video.videoHeight
          );
          
          finalCanvas.width = video.videoWidth * ratio;
          finalCanvas.height = video.videoHeight * ratio;
          
          const finalCtx = finalCanvas.getContext('2d');
          if (finalCtx) {
            finalCtx.drawImage(video, 0, 0, finalCanvas.width, finalCanvas.height);
          }
        }
        
        const imageData = finalCanvas.toDataURL('image/jpeg', settings.quality);
        onCapture(imageData);
      }
      
    } catch (error) {
      console.error('Error capturing screen:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onError(`Error capturing screen: ${errorMessage}`);
      
      // Si hay error de permisos o similar, detener captura
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowed')) {
        stopCapture();
      }
    }
  }, [settings, onCapture, onError]);

  const stopCapture = useCallback(() => {
    console.log('Stopping auto capture');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Track stopped:', track.kind);
      });
      streamRef.current = null;
    }
  }, []);

  const startCapture = useCallback(async () => {
    try {
      console.log('Starting auto capture with interval:', settings.interval);
      
      // Captura inicial inmediata
      await captureScreen();
      
      // Configurar intervalo para capturas periódicas
      intervalRef.current = setInterval(captureScreen, settings.interval);
    } catch (error) {
      console.error('Error starting capture:', error);
      onError('Failed to start screen capture');
    }
  }, [captureScreen, settings.interval, onError]);

  useEffect(() => {
    if (isActive) {
      startCapture();
    } else {
      stopCapture();
    }

    return stopCapture;
  }, [isActive, startCapture, stopCapture]);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, [stopCapture]);

  return { 
    stopCapture, 
    startCapture,
    isCapturing: !!intervalRef.current 
  };
};