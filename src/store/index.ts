import create from 'zustand';

interface ScreenShareState {
  isSharing: boolean;
  captureInterval: number;
  jpegQuality: number;
  targetResolution: string;
  setIsSharing: (isSharing: boolean) => void;
  setCaptureInterval: (interval: number) => void;
  setJpegQuality: (quality: number) => void;
  setTargetResolution: (resolution: string) => void;
}

export const useScreenShareStore = create<ScreenShareState>((set) => ({
  isSharing: false,
  captureInterval: 1000,
  jpegQuality: 0.8,
  targetResolution: 'Auto',
  setIsSharing: (isSharing) => set({ isSharing }),
  setCaptureInterval: (interval) => set({ captureInterval: interval }),
  setJpegQuality: (quality) => set({ jpegQuality: quality }),
  setTargetResolution: (resolution) => set({ targetResolution: resolution }),
}));