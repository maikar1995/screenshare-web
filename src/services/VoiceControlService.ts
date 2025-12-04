import { VoiceState, VoiceSettings, VoiceControlCallbacks } from '../types';

export class VoiceControlService {
  private audioContext?: AudioContext;
  private mediaStream?: MediaStream;
  private mediaRecorder?: MediaRecorder;
  private analyser?: AnalyserNode;
  private sourceNode?: MediaStreamAudioSourceNode;
  
  private state: VoiceState = 'idle';
  private callbacks: VoiceControlCallbacks;
  private settings: VoiceSettings;
  
  private lastVoiceTimestamp = 0;
  private recordingStartTime = 0;
  private animationFrameId?: number;
  private audioChunks: Blob[] = [];
  private voiceStartTime = 0;
  private isVoiceActive = false;
  
  constructor(callbacks: VoiceControlCallbacks, settings: VoiceSettings) {
    this.callbacks = callbacks;
    this.settings = settings;
  }

  async initialize(): Promise<void> {
    try {
      // Get microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });

      // Setup audio context and analysis
      this.audioContext = new AudioContext();
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.3;
      
      this.sourceNode.connect(this.analyser);
      
      this.setState('listening');
      this.startVADLoop();
      
    } catch (error) {
      this.handleError(`Error accessing microphone: ${error}`);
    }
  }

  private setState(newState: VoiceState): void {
    this.state = newState;
    this.callbacks.onStateChange(newState);
  }

  private handleError(message: string): void {
    this.setState('error');
    this.callbacks.onError(message);
  }

  private startVADLoop(): void {
    console.log('🎤 VAD loop started with settings:', this.settings);
    
    const processAudio = () => {
      if (this.state === 'idle' || this.state === 'error') {
        return;
      }

      const now = Date.now();
      const volume = this.getAudioLevel();
      
      // Debug log every second
      if (now % 1000 < 50) {
        const silenceTime = this.state === 'recording' ? now - this.lastVoiceTimestamp : 0;
        console.log(`🔊 Volume: ${volume.toFixed(4)}, Threshold: ${this.settings.volumeThreshold}, State: ${this.state}, Silence: ${silenceTime}ms`);
      }
      
      // Voice activity detected
      if (volume > this.settings.volumeThreshold) {
        if (!this.isVoiceActive) {
          console.log(`🎵 VOICE START! Volume: ${volume.toFixed(4)}`);
          this.voiceStartTime = now;
          this.isVoiceActive = true;
        }
        this.lastVoiceTimestamp = now; // Critical: Update timestamp when voice is detected
        
        // Start recording if we've been listening and have sustained voice
        if (this.state === 'listening') {
          const voiceDuration = now - this.voiceStartTime;
          if (voiceDuration >= this.settings.minVoiceMs) {
            console.log(`🎙️ RECORDING START after ${voiceDuration}ms of voice`);
            this.startRecording();
          }
        }
      } else {
        // NO voice detected
        if (this.isVoiceActive) {
          console.log(`🔇 VOICE STOP! Volume dropped to: ${volume.toFixed(4)}`);
          this.isVoiceActive = false;
        }
        // Note: lastVoiceTimestamp is NOT updated here - that's the key for silence detection
      }
      
      // Handle recording state
      if (this.state === 'recording') {
        const silenceDuration = now - this.lastVoiceTimestamp;
        const recordingDuration = now - this.recordingStartTime;
        
        // More frequent silence logging for debugging
        if (silenceDuration % 500 < 50 && silenceDuration > 0) { // Log every 500ms
          console.log(`🤫 Silence: ${silenceDuration}ms / ${this.settings.silenceTimeoutMs}ms (${((silenceDuration/this.settings.silenceTimeoutMs)*100).toFixed(1)}%)`);
        }
        
        // Stop recording due to silence timeout
        if (silenceDuration >= this.settings.silenceTimeoutMs) {
          console.log(`⏹️ STOPPING: ${silenceDuration}ms of silence reached threshold`);
          this.stopRecording();
        }
        // Stop recording due to max duration
        else if (recordingDuration >= this.settings.maxRecordingMs) {
          console.log(`⏹️ STOPPING: Max duration (${recordingDuration}ms) reached`);
          this.stopRecording();
        }
      }
      
      this.animationFrameId = requestAnimationFrame(processAudio);
    };
    
    processAudio();
  }

  private getAudioLevel(): number {
    if (!this.analyser) return 0;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(dataArray); // Use time domain for better voice detection
    
    // Calculate RMS of the waveform
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const sample = (dataArray[i] - 128) / 128.0; // Convert to -1 to 1 range
      sum += sample * sample;
    }
    
    const rms = Math.sqrt(sum / bufferLength);
    return rms;
  }

  private startRecording(): void {
    if (!this.mediaStream) {
      console.error('❌ No media stream available for recording');
      return;
    }
    
    try {
      console.log('🎙️ Starting MediaRecorder...');
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: 'audio/webm'
      });
      
      this.mediaRecorder.ondataavailable = (event) => {
        console.log(`📦 Audio chunk received: ${event.data.size} bytes`);
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.onstop = () => {
        console.log('🛑 MediaRecorder stopped, processing recording...');
        this.handleRecordingComplete();
      };
      
      this.mediaRecorder.start();
      this.recordingStartTime = Date.now();
      this.setState('recording');
      console.log('✅ Recording started successfully');
      
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      this.handleError(`Error starting recording: ${error}`);
    }
  }

  private stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  private async handleRecordingComplete(): Promise<void> {
    this.setState('sending');
    
    try {
      // Create audio blob
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      console.log(`🎵 Audio blob created: ${audioBlob.size} bytes`);
      
      // Validate minimum recording duration
      const recordingDuration = Date.now() - this.recordingStartTime;
      console.log(`⏱️ Recording duration: ${recordingDuration}ms`);
      
      if (recordingDuration < 500) { // Less than 0.5 seconds
        console.log('⚠️ Recording too short, returning to listening');
        this.setState('listening');
        return;
      }
      
      // Capture current screen
      console.log('📸 Capturing screen...');
      const imageBlob = await this.getCurrentImageBlob();
      console.log(`🖼️ Screen captured: ${imageBlob.size} bytes`);
      
      // Send to callback
      console.log('📤 Sending voice command...');
      this.callbacks.onVoiceCommand(audioBlob, imageBlob);
      
      // Return to listening state
      console.log('👂 Returning to listening state');
      this.setState('listening');
      
    } catch (error) {
      console.error('❌ Error processing recording:', error);
      this.handleError(`Error processing recording: ${error}`);
    }
  }

  private async getCurrentImageBlob(): Promise<Blob> {
    // Create a simple 1x1 transparent PNG as placeholder
    // The real screen capture should be handled by the existing system
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Create transparent pixel
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 1, 1);
    
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Could not create image blob'));
        }
      }, 'image/png', 1.0);
    });
  }

  updateSettings(newSettings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  stop(): void {
    this.setState('idle');
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }

  getCurrentState(): VoiceState {
    return this.state;
  }

  isRecording(): boolean {
    return this.state === 'recording';
  }

  getRecordingDuration(): number {
    if (this.state === 'recording') {
      return Date.now() - this.recordingStartTime;
    }
    return 0;
  }

  // Test method to manually trigger recording
  testRecording(): void {
    console.log('🧪 Manual test recording triggered');
    if (this.state === 'listening') {
      this.startRecording();
      // Auto stop after 3 seconds for testing
      setTimeout(() => {
        if (this.state === 'recording') {
          console.log('🧪 Auto-stopping test recording');
          this.stopRecording();
        }
      }, 3000);
    }
  }
}