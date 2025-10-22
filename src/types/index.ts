
export interface User {
  id: string;
  email: string | null;
  user_metadata: {
    dj_name?: string;
    avatar_url?: string;
  };
}

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  plan: string;
  subscription_plan: string;
  credits_remaining: number;
}

export interface Post {
  id: string;
  created_at: string;
  title: string;
  content: string;
  user_id: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration?: string;
  bpm?: number;
  energy_level?: number;
  key_signature?: string;
  musical_key?: string;
  genre?: string;
  type?: 'track' | 'remix' | 'sample';
  file_url?: string;
  file_path?: string;
  file_size?: number;
  original_filename?: string;
  waveform_data?: any;
  user_id: string;
  created_at: string;
  is_liked?: boolean;
  is_featured?: boolean;
  upload_status?: 'uploading' | 'processing' | 'completed' | 'error';
  deleted_at?: string | null;
  // Add missing properties that other components expect
  name?: string;
  url?: string;
}

// Add missing TrackForMix interface
export interface TrackForMix {
  id: string;
  title: string;
  artist: string;
  bpm?: number;
  key?: string;
  duration?: number;
  url?: string;
  file_path?: string;
}
