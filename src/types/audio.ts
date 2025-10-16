export interface AudioBookmark {
  id: string;
  chapterId: number;
  timestamp: number;
  title: string;
  note?: string;
  createdAt: Date;
}

export interface PlaylistState {
  currentChapter: number;
  isPlaying: boolean;
  playbackRate: number;
  volume: number;
  repeatMode: 'none' | 'one' | 'all';
  shuffleMode: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
}

export interface AudioChapter {
  id: string | number; // 🔧 chapter.id 타입 호환성 수정
  title: string;
  audioUrl?: string;
  duration?: number;
  text: string;
  isGeneratingTTS?: boolean;
  ttsError?: string;
  personality?: string;
  language?: string;
}

export interface AudioPlayerSettings {
  volume: number;
  playbackRate: number;
  autoPlay: boolean;
  skipSilence: boolean;
  showSubtitles: boolean;
}

export interface AudioCacheEntry {
  id: string;
  url: string;
  blob: Blob;
  timestamp: number;
  lastAccessed: number;
  size: number;
}

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';
export type RepeatMode = 'none' | 'one' | 'all';
export type PlaybackRate = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;