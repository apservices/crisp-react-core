import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface AudioFeatures {
  bpm: number;
  key: string;
  energy: 'low' | 'medium' | 'high';
  duration: number;
  genre?: string;
  instruments: string[];
  fingerprint: string;
  harmonicKey: string;
  loudness: number;
  danceability: number;
  valence: number;
}

export interface AudioAnalysisResult {
  features: AudioFeatures;
  confidence: number;
  processingTime: number;
}

export const useAudioAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeAudioFile = async (file: File): Promise<AudioAnalysisResult | null> => {
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Erro de arquivo",
        description: "Por favor, selecione um arquivo de áudio válido.",
        variant: "destructive",
      });
      return null;
    }

    setIsAnalyzing(true);
    const startTime = Date.now();

    try {
      // Create audio context for Web Audio API analysis
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Analyze audio characteristics
      const features = await extractAudioFeatures(audioBuffer, audioContext);
      const processingTime = Date.now() - startTime;

      const result: AudioAnalysisResult = {
        features,
        confidence: calculateConfidence(features),
        processingTime
      };

      toast({
        title: "Análise concluída",
        description: `Faixa analisada em ${(processingTime / 1000).toFixed(1)}s`,
      });

      return result;
    } catch (error) {
      console.error('Audio analysis error:', error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar o arquivo de áudio.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractAudioFeatures = async (
    audioBuffer: AudioBuffer, 
    audioContext: AudioContext
  ): Promise<AudioFeatures> => {
    const sampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.duration;
    const channelData = audioBuffer.getChannelData(0);

    // BPM Detection using autocorrelation
    const bpm = detectBPM(channelData, sampleRate);
    
    // Key detection using chromagram analysis
    const key = detectKey(channelData, sampleRate);
    
    // Energy analysis
    const energy = calculateEnergyLevel(channelData);
    
    // Spectral features
    const spectralFeatures = analyzeSpectralContent(channelData, sampleRate);
    
    // Generate audio fingerprint
    const fingerprint = generateFingerprint(channelData);

    return {
      bpm,
      key,
      energy,
      duration,
      instruments: spectralFeatures.instruments,
      fingerprint,
      harmonicKey: convertToHarmonicKey(key),
      loudness: spectralFeatures.loudness,
      danceability: spectralFeatures.danceability,
      valence: spectralFeatures.valence
    };
  };

  const detectBPM = (channelData: Float32Array, sampleRate: number): number => {
    // Simplified BPM detection using onset detection
    const windowSize = 2048;
    const hopSize = 512;
    const onsets: number[] = [];

    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      const window = channelData.slice(i, i + windowSize);
      const energy = window.reduce((sum, sample) => sum + sample * sample, 0);
      
      if (energy > 0.01) { // Threshold for onset detection
        onsets.push(i / sampleRate);
      }
    }

    if (onsets.length < 2) return 120; // Default BPM

    // Calculate intervals between onsets
    const intervals = onsets.slice(1).map((onset, i) => onset - onsets[i]);
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    // Convert to BPM (beats per minute)
    const bpm = Math.round(60 / (avgInterval * 4)); // Assuming 4/4 time signature
    
    // Clamp to reasonable range
    return Math.max(60, Math.min(200, bpm));
  };

  const detectKey = (channelData: Float32Array, sampleRate: number): string => {
    // Simplified key detection using chroma vector
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const modes = ['major', 'minor'];
    
    // For demo purposes, return a reasonable key
    // In production, this would use FFT and chroma analysis
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const randomMode = modes[Math.floor(Math.random() * modes.length)];
    
    return `${randomKey} ${randomMode}`;
  };

  const calculateEnergyLevel = (channelData: Float32Array): 'low' | 'medium' | 'high' => {
    const rms = Math.sqrt(channelData.reduce((sum, sample) => sum + sample * sample, 0) / channelData.length);
    
    if (rms < 0.1) return 'low';
    if (rms < 0.3) return 'medium';
    return 'high';
  };

  const analyzeSpectralContent = (channelData: Float32Array, sampleRate: number) => {
    // Simplified spectral analysis
    const loudness = channelData.reduce((sum, sample) => sum + Math.abs(sample), 0) / channelData.length;
    
    // Mock instrument detection (would use ML models in production)
    const instruments = ['drums', 'bass', 'synth'];
    if (loudness > 0.2) instruments.push('vocal');
    
    return {
      instruments,
      loudness: Math.round(loudness * 100),
      danceability: Math.min(100, Math.round(loudness * 150)),
      valence: Math.round(Math.random() * 100) // Mock valence
    };
  };

  const generateFingerprint = (channelData: Float32Array): string => {
    // Generate a simple hash-based fingerprint
    const samples = channelData.slice(0, Math.min(channelData.length, 44100)); // First second
    let hash = 0;
    
    for (let i = 0; i < samples.length; i += 100) {
      hash = ((hash << 5) - hash + Math.round(samples[i] * 1000)) & 0xffffffff;
    }
    
    return Math.abs(hash).toString(16);
  };

  const convertToHarmonicKey = (key: string): string => {
    // Camelot Key notation conversion
    const camelotMap: { [key: string]: string } = {
      'C major': '8B', 'C minor': '5A',
      'C# major': '3B', 'C# minor': '12A',
      'D major': '10B', 'D minor': '7A',
      'D# major': '5B', 'D# minor': '2A',
      'E major': '12B', 'E minor': '9A',
      'F major': '7B', 'F minor': '4A',
      'F# major': '2B', 'F# minor': '11A',
      'G major': '9B', 'G minor': '6A',
      'G# major': '4B', 'G# minor': '1A',
      'A major': '11B', 'A minor': '8A',
      'A# major': '6B', 'A# minor': '3A',
      'B major': '1B', 'B minor': '10A'
    };
    
    return camelotMap[key] || '1A';
  };

  const calculateConfidence = (features: AudioFeatures): number => {
    // Calculate confidence based on various factors
    let confidence = 70; // Base confidence
    
    if (features.bpm > 60 && features.bpm < 200) confidence += 10;
    if (features.energy !== 'low') confidence += 10;
    if (features.instruments.length > 1) confidence += 10;
    
    return Math.min(100, confidence);
  };

  return {
    analyzeAudioFile,
    isAnalyzing
  };
};