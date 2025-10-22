// Audio format utilities for Remixense platform

// Supported audio formats with MIME types and extensions
export const SUPPORTED_AUDIO_FORMATS = {
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/x-wav': ['.wav'],
  'audio/wave': ['.wav'],
  'audio/mp4': ['.m4a', '.aac'],
  'audio/aac': ['.aac'],
  'audio/x-m4a': ['.m4a'],
  'audio/flac': ['.flac'],
  'audio/x-flac': ['.flac'],
  'audio/aiff': ['.aiff', '.aif'],
  'audio/x-aiff': ['.aiff', '.aif'],
  'audio/ogg': ['.ogg'],
  'audio/vorbis': ['.ogg'],
  'audio/webm': ['.webm'],
  'audio/x-ms-wma': ['.wma'],
  'application/ogg': ['.ogg']
};

// Get all supported extensions
export const getAllSupportedExtensions = (): string[] => {
  return Object.values(SUPPORTED_AUDIO_FORMATS).flat();
};

// Check if file is supported audio format
export const isValidAudioFile = (file: File): boolean => {
  // First check MIME type
  if (file.type && Object.keys(SUPPORTED_AUDIO_FORMATS).includes(file.type)) {
    return true;
  }
  
  // Fallback: check by file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  return getAllSupportedExtensions().includes(extension);
};

// Get audio format info
export const getAudioFormatInfo = (file: File) => {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const mimeType = file.type;
  
  // Determine format based on MIME type or extension
  let format = 'unknown';
  if (mimeType && Object.keys(SUPPORTED_AUDIO_FORMATS).includes(mimeType)) {
    format = mimeType.split('/')[1];
  } else if (extension) {
    for (const [mime, exts] of Object.entries(SUPPORTED_AUDIO_FORMATS)) {
      if (exts.includes(extension)) {
        format = mime.split('/')[1];
        break;
      }
    }
  }
  
  return {
    format,
    extension,
    mimeType: mimeType || 'audio/' + format,
    isSupported: isValidAudioFile(file)
  };
};

// Convert audio file to Remixense standard WAV format (44.1kHz, 16-bit, stereo)
export const convertToRemixenseWav = async (file: File): Promise<{
  blob: Blob;
  metadata: {
    duration: number;
    sampleRate: number;
    channels: number;
    bitDepth: number;
  };
}> => {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 44100 // Force 44.1kHz sample rate
    });
    
    const fileReader = new FileReader();
    
    fileReader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Ensure stereo output
        const channels = 2;
        const sampleRate = 44100;
        const length = audioBuffer.length;
        
        // Create offline context for rendering
        const offlineContext = new OfflineAudioContext(channels, length, sampleRate);
        
        // Create buffer source
        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;
        
        // Connect to destination
        source.connect(offlineContext.destination);
        source.start(0);
        
        // Render the audio
        const renderedBuffer = await offlineContext.startRendering();
        
        // Convert to WAV format
        const wavBlob = audioBufferToWav(renderedBuffer);
        
        resolve({
          blob: wavBlob,
          metadata: {
            duration: renderedBuffer.duration,
            sampleRate: renderedBuffer.sampleRate,
            channels: renderedBuffer.numberOfChannels,
            bitDepth: 16
          }
        });
        
      } catch (error) {
        console.error('Audio conversion error:', error);
        reject(new Error('Falha na conversão do áudio. Formato pode não ser suportado.'));
      }
    };
    
    fileReader.onerror = () => {
      reject(new Error('Falha ao ler o arquivo de áudio'));
    };
    
    fileReader.readAsArrayBuffer(file);
  });
};

// Convert AudioBuffer to WAV blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const length = buffer.length;
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numberOfChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const bufferSize = 44 + dataSize;
  
  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);
  
  // WAV file header
  let pos = 0;
  
  // RIFF chunk descriptor
  writeString(view, pos, 'RIFF'); pos += 4;
  view.setUint32(pos, bufferSize - 8, true); pos += 4;
  writeString(view, pos, 'WAVE'); pos += 4;
  
  // FMT sub-chunk
  writeString(view, pos, 'fmt '); pos += 4;
  view.setUint32(pos, 16, true); pos += 4; // Sub-chunk size
  view.setUint16(pos, 1, true); pos += 2; // Audio format (PCM)
  view.setUint16(pos, numberOfChannels, true); pos += 2;
  view.setUint32(pos, sampleRate, true); pos += 4;
  view.setUint32(pos, byteRate, true); pos += 4;
  view.setUint16(pos, blockAlign, true); pos += 2;
  view.setUint16(pos, bitsPerSample, true); pos += 2;
  
  // Data sub-chunk
  writeString(view, pos, 'data'); pos += 4;
  view.setUint32(pos, dataSize, true); pos += 4;
  
  // Write audio data
  const channels = [];
  for (let i = 0; i < numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }
  
  let offset = pos;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Extract enhanced metadata from converted audio
export const extractRemixenseMetadata = async (audioBuffer: AudioBuffer, originalFile: File) => {
  const duration = audioBuffer.duration;
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  
  // Generate waveform data from audio buffer
  const waveformData = generateWaveformData(audioBuffer);
  
  // Enhanced BPM detection (simplified for now, can be improved with actual DSP)
  const estimatedBPM = estimateBPM(audioBuffer);
  
  // Key detection (simplified)
  const estimatedKey = estimateKey(audioBuffer);
  
  // Energy level analysis
  const energyLevel = analyzeEnergyLevel(audioBuffer);
  
  return {
    duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
    durationSeconds: duration,
    bpm: estimatedBPM,
    key: estimatedKey,
    energy: energyLevel,
    waveformData,
    sampleRate: audioBuffer.sampleRate,
    channels: audioBuffer.numberOfChannels,
    originalFormat: getAudioFormatInfo(originalFile).format
  };
};

// Generate waveform visualization data
function generateWaveformData(audioBuffer: AudioBuffer, samples: number = 200): number[] {
  const channelData = audioBuffer.getChannelData(0); // Use first channel
  const blockSize = Math.floor(channelData.length / samples);
  const waveform = [];
  
  for (let i = 0; i < samples; i++) {
    const start = i * blockSize;
    const end = start + blockSize;
    let sum = 0;
    
    for (let j = start; j < end && j < channelData.length; j++) {
      sum += Math.abs(channelData[j]);
    }
    
    waveform.push(sum / blockSize);
  }
  
  return waveform;
}

// Simple BPM estimation (can be enhanced with more sophisticated algorithms)
function estimateBPM(audioBuffer: AudioBuffer): number {
  // This is a simplified implementation
  // In production, you'd use more sophisticated beat detection algorithms
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  
  // Simple autocorrelation-based tempo detection
  const minBPM = 60;
  const maxBPM = 200;
  const minPeriod = Math.floor(60 * sampleRate / maxBPM);
  const maxPeriod = Math.floor(60 * sampleRate / minBPM);
  
  let bestCorrelation = 0;
  let bestPeriod = minPeriod;
  
  for (let period = minPeriod; period < maxPeriod; period += 100) {
    let correlation = 0;
    const samples = Math.min(sampleRate * 10, channelData.length - period); // Analyze first 10 seconds
    
    for (let i = 0; i < samples; i++) {
      correlation += channelData[i] * channelData[i + period];
    }
    
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestPeriod = period;
    }
  }
  
  const bpm = Math.round(60 * sampleRate / bestPeriod);
  return Math.max(minBPM, Math.min(maxBPM, bpm));
}

// Simple key estimation
function estimateKey(audioBuffer: AudioBuffer): string {
  // This is a placeholder implementation
  // In production, you'd use chromagram analysis and key detection algorithms
  const keys = [
    'C maj', 'G maj', 'D maj', 'A maj', 'E maj', 'B maj', 'F# maj',
    'C# maj', 'Ab maj', 'Eb maj', 'Bb maj', 'F maj',
    'A min', 'E min', 'B min', 'F# min', 'C# min', 'G# min',
    'D# min', 'Bb min', 'F min', 'C min', 'G min', 'D min'
  ];
  
  // For now, return a deterministic key based on audio characteristics
  const channelData = audioBuffer.getChannelData(0);
  const sum = channelData.reduce((acc, val) => acc + Math.abs(val), 0);
  const keyIndex = Math.floor((sum * 1000) % keys.length);
  
  return keys[keyIndex];
}

// Analyze energy level from audio buffer
function analyzeEnergyLevel(audioBuffer: AudioBuffer): number {
  const channelData = audioBuffer.getChannelData(0);
  let sum = 0;
  
  for (let i = 0; i < channelData.length; i++) {
    sum += channelData[i] * channelData[i]; // RMS calculation
  }
  
  const rms = Math.sqrt(sum / channelData.length);
  // Convert RMS to energy scale 1-10
  const energy = Math.round(Math.max(1, Math.min(10, rms * 50)));
  
  return energy;
}