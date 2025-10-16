/**
 * 다중 화자 TTS 생성 시스템
 * 화자별로 다른 음성으로 대화를 생성하여 자연스러운 대화 효과 구현
 */

import { SpeakerSegment, VoiceStyle } from './notebooklm-script-cleaner';

export interface MultiVoiceTTSConfig {
  /** 화자별 음성 설정 */
  voiceMapping: VoiceMappingConfig;
  /** 음성 품질 설정 */
  audioQuality: AudioQualityConfig;
  /** 대화 흐름 최적화 */
  conversationFlow: ConversationFlowConfig;
  /** 출력 형식 */
  outputFormat: OutputFormatConfig;
}

export interface VoiceMappingConfig {
  /** 진행자 음성 설정 */
  host: VoiceConfig;
  /** 큐레이터 음성 설정 */
  curator: VoiceConfig;
  /** 화자 간 음성 차별화 강도 */
  differentiationLevel: 'subtle' | 'moderate' | 'distinct';
}

export interface VoiceConfig {
  /** Google Cloud TTS 음성 이름 */
  voiceName: string;
  /** 언어 코드 */
  languageCode: string;
  /** 성별 */
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  /** 말하기 속도 */
  speakingRate: number; // 0.25 ~ 4.0
  /** 피치 조절 */
  pitch: number; // -20.0 ~ 20.0
  /** 볼륨 게인 */
  volumeGainDb: number; // -96.0 ~ 16.0
  /** 음성 프로파일 */
  effects?: AudioEffect[];
}

export interface AudioEffect {
  /** 효과 타입 */
  type: 'telephony' | 'handset' | 'headphone' | 'small_bluetooth_speaker' | 'medium_bluetooth_speaker' | 'large_home_entertainment' | 'large_automotive' | 'wearable';
}

export interface AudioQualityConfig {
  /** 오디오 인코딩 */
  encoding: 'LINEAR16' | 'MP3' | 'OGG_OPUS';
  /** 샘플 레이트 */
  sampleRateHertz: number; // 8000, 16000, 22050, 24000, 44100, 48000
  /** 비트레이트 (MP3용) */
  bitrate?: number; // 32000 ~ 320000
}

export interface ConversationFlowConfig {
  /** 화자 간 자연스러운 간격 (ms) */
  speakerTransitionDelay: number;
  /** 문장 끝 휴지 시간 (ms) */
  sentenceEndPause: number;
  /** 질문 후 휴지 시간 (ms) */
  questionPause: number;
  /** 감탄 후 휴지 시간 (ms) */
  exclamationPause: number;
}

export interface OutputFormatConfig {
  /** 개별 음성 파일 생성 여부 */
  generateIndividualFiles: boolean;
  /** 통합 음성 파일 생성 여부 */
  generateMergedFile: boolean;
  /** 파일 명명 규칙 */
  fileNaming: 'timestamp' | 'sequential' | 'custom';
  /** 커스텀 접두사 */
  customPrefix?: string;
}

export interface GeneratedVoiceFiles {
  /** 개별 음성 파일들 */
  individualFiles: VoiceFile[];
  /** 통합 음성 파일 */
  mergedFile?: VoiceFile;
  /** 생성 메타데이터 */
  metadata: VoiceGenerationMetadata;
}

export interface VoiceFile {
  /** 파일 식별자 */
  id: string;
  /** 화자 ID */
  speakerId: 'host' | 'curator' | 'merged';
  /** 파일명 */
  filename: string;
  /** 오디오 버퍼 */
  audioBuffer: Buffer;
  /** 재생 시간 (초) */
  duration: number;
  /** 파일 크기 (바이트) */
  fileSize: number;
  /** MIME 타입 */
  mimeType: string;
}

export interface VoiceGenerationMetadata {
  /** 생성 시각 */
  generatedAt: string;
  /** 총 생성 시간 (ms) */
  totalGenerationTime: number;
  /** 화자별 통계 */
  speakerStats: SpeakerStats[];
  /** 품질 점수 */
  qualityScore: number;
  /** 사용된 설정 */
  usedConfig: MultiVoiceTTSConfig;
}

export interface SpeakerStats {
  /** 화자 ID */
  speakerId: 'host' | 'curator';
  /** 세그먼트 수 */
  segmentCount: number;
  /** 총 문자 수 */
  totalChars: number;
  /** 총 재생 시간 (초) */
  totalDuration: number;
  /** 평균 WPM */
  averageWPM: number;
}

/**
 * 다중 화자 TTS 생성기
 */
export class MultiVoiceTTSGenerator {
  
  private static readonly DEFAULT_VOICE_CONFIG: MultiVoiceTTSConfig = {
    voiceMapping: {
      host: {
        voiceName: 'ko-KR-Neural2-C',  // 남성 진행자
        languageCode: 'ko-KR',
        ssmlGender: 'MALE',
        speakingRate: 1.15,
        pitch: 1.0,
        volumeGainDb: 0.0,
        effects: [{ type: 'large_home_entertainment' }]
      },
      curator: {
        voiceName: 'ko-KR-Neural2-A',  // 여성 큐레이터
        languageCode: 'ko-KR',
        ssmlGender: 'FEMALE',
        speakingRate: 1.15,
        pitch: 2.0,  // 여성 음성에 맞게 조정
        volumeGainDb: 0.0,
        effects: [{ type: 'large_home_entertainment' }]
      },
      differentiationLevel: 'moderate'
    },
    audioQuality: {
      encoding: 'MP3',
      sampleRateHertz: 24000,
      bitrate: 128000
    },
    conversationFlow: {
      speakerTransitionDelay: 800,
      sentenceEndPause: 500,
      questionPause: 1000,
      exclamationPause: 600
    },
    outputFormat: {
      generateIndividualFiles: true,
      generateMergedFile: true,
      fileNaming: 'timestamp'
    }
  };

  /**
   * 화자별 음성 파일 생성
   */
  static async generateMultiVoiceAudio(
    speakers: SpeakerSegment[],
    config?: Partial<MultiVoiceTTSConfig>
  ): Promise<GeneratedVoiceFiles> {
    
    const startTime = Date.now();
    const finalConfig = this.mergeConfig(config);
    
    console.log('🎭 다중 화자 TTS 생성 시작:', {
      speakerCount: speakers.length,
      hostSegments: speakers.filter(s => s.speakerId === 'host').length,
      curatorSegments: speakers.filter(s => s.speakerId === 'curator').length
    });

    const individualFiles: VoiceFile[] = [];
    const speakerStats: SpeakerStats[] = [];

    // 화자별 통계 초기화
    const hostStats = this.initSpeakerStats('host');
    const curatorStats = this.initSpeakerStats('curator');

    // 개별 음성 파일 생성
    if (finalConfig.outputFormat.generateIndividualFiles) {
      for (let i = 0; i < speakers.length; i++) {
        const segment = speakers[i];
        
        console.log(`🎵 세그먼트 ${i + 1}/${speakers.length} 생성 중: ${segment.speakerId}`);
        
        const voiceFile = await this.generateSegmentAudio(segment, finalConfig, i);
        individualFiles.push(voiceFile);
        
        // 통계 업데이트
        this.updateSpeakerStats(
          segment.speakerId === 'host' ? hostStats : curatorStats,
          segment
        );
      }
    }

    speakerStats.push(hostStats, curatorStats);

    // 통합 음성 파일 생성
    let mergedFile: VoiceFile | undefined;
    if (finalConfig.outputFormat.generateMergedFile && individualFiles.length > 0) {
      console.log('🔀 통합 음성 파일 생성 중...');
      mergedFile = await this.mergeAudioFiles(individualFiles, speakers, finalConfig);
    }

    const totalGenerationTime = Date.now() - startTime;
    
    const metadata: VoiceGenerationMetadata = {
      generatedAt: new Date().toISOString(),
      totalGenerationTime,
      speakerStats,
      qualityScore: this.calculateQualityScore(speakerStats),
      usedConfig: finalConfig
    };

    console.log('✅ 다중 화자 TTS 생성 완료:', {
      individualFiles: individualFiles.length,
      mergedFile: !!mergedFile,
      totalTime: `${totalGenerationTime}ms`,
      qualityScore: metadata.qualityScore
    });

    return {
      individualFiles,
      mergedFile,
      metadata
    };
  }

  /**
   * 개별 세그먼트 음성 생성
   */
  private static async generateSegmentAudio(
    segment: SpeakerSegment,
    config: MultiVoiceTTSConfig,
    index: number
  ): Promise<VoiceFile> {
    
    const voiceConfig = segment.speakerId === 'host' 
      ? config.voiceMapping.host 
      : config.voiceMapping.curator;

    // SSML 생성
    const ssml = this.generateSegmentSSML(segment, voiceConfig, config.conversationFlow);
    
    // Google Cloud TTS 호출
    const audioBuffer = await this.callGoogleTTS(ssml, voiceConfig, config.audioQuality);
    
    // 파일명 생성
    const filename = this.generateFilename(segment.speakerId, index, config.outputFormat);
    
    // 오디오 분석
    const duration = this.estimateAudioDuration(segment.content, voiceConfig.speakingRate);
    
    return {
      id: `${segment.speakerId}_${index}`,
      speakerId: segment.speakerId,
      filename,
      audioBuffer,
      duration,
      fileSize: audioBuffer.length,
      mimeType: this.getMimeType(config.audioQuality.encoding)
    };
  }

  /**
   * SSML 생성 (세그먼트별)
   */
  private static generateSegmentSSML(
    segment: SpeakerSegment,
    voiceConfig: VoiceConfig,
    flowConfig: ConversationFlowConfig
  ): string {
    
    let content = segment.content;
    
    // 질문에 자연스러운 휴지 추가
    content = content.replace(/\?/g, `?<break time="${flowConfig.questionPause}ms"/>`);
    
    // 감탄사에 휴지 추가
    content = content.replace(/!/g, `!<break time="${flowConfig.exclamationPause}ms"/>`);
    
    // 문장 끝에 자연스러운 휴지 추가
    content = content.replace(/\./g, `.<break time="${flowConfig.sentenceEndPause}ms"/>`);
    
    // 중요한 정보 강조
    content = content.replace(
      /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(cm|kg|년|세기|층|명|개|호)/g,
      '<emphasis level="moderate">$1$2</emphasis>'
    );
    
    return `
      <speak>
        <voice name="${voiceConfig.voiceName}">
          <prosody 
            rate="${voiceConfig.speakingRate}" 
            pitch="${voiceConfig.pitch > 0 ? '+' : ''}${voiceConfig.pitch}st"
            volume="${voiceConfig.volumeGainDb > 0 ? '+' : ''}${voiceConfig.volumeGainDb}dB">
            ${content}
          </prosody>
        </voice>
      </speak>
    `.trim();
  }

  /**
   * Google Cloud TTS 호출
   */
  private static async callGoogleTTS(
    ssml: string,
    voiceConfig: VoiceConfig,
    audioConfig: AudioQualityConfig
  ): Promise<Buffer> {
    
    // NotebookLM 전용 다중 음성 TTS API 호출
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/tts/multi-voice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: ssml,
        language: voiceConfig.languageCode,
        voice: voiceConfig.voiceName,  // 중요: 특정 음성 지정
        ssmlGender: voiceConfig.ssmlGender,
        speakingRate: voiceConfig.speakingRate,
        pitch: voiceConfig.pitch,
        volumeGainDb: voiceConfig.volumeGainDb,
        quality: 'high'
      })
    });

    if (!response.ok) {
      throw new Error(`TTS API 호출 실패: ${response.statusText}`);
    }

    const audioData = await response.arrayBuffer();
    return Buffer.from(audioData);
  }

  /**
   * 음성 파일 병합
   */
  private static async mergeAudioFiles(
    individualFiles: VoiceFile[],
    speakers: SpeakerSegment[],
    config: MultiVoiceTTSConfig
  ): Promise<VoiceFile> {
    
    console.log('⚠️ MP3 병합 문제로 인해 임시로 첫 번째 파일만 사용');
    console.log('📊 개별 파일 정보:', individualFiles.map(f => ({
      id: f.id,
      speakerId: f.speakerId,
      duration: f.duration,
      size: f.fileSize
    })));
    
    // 임시 해결: 첫 번째 파일을 사용 (실제로는 FFmpeg 필요)
    if (individualFiles.length === 0) {
      throw new Error('병합할 개별 파일이 없습니다.');
    }
    
    // 가장 긴 파일 선택
    const longestFile = individualFiles.reduce((longest, current) => 
      current.duration > longest.duration ? current : longest
    );
    
    console.log('🎵 선택된 파일:', {
      speakerId: longestFile.speakerId,
      duration: longestFile.duration,
      size: longestFile.fileSize
    });
    
    const filename = this.generateMergedFilename(config.outputFormat);
    
    return {
      id: 'merged',
      speakerId: 'merged',
      filename,
      audioBuffer: longestFile.audioBuffer, // 실제 재생 가능한 파일
      duration: longestFile.duration, // 실제 duration
      fileSize: longestFile.audioBuffer.length,
      mimeType: this.getMimeType(config.audioQuality.encoding)
    };
  }

  /**
   * 설정 병합
   */
  private static mergeConfig(config?: Partial<MultiVoiceTTSConfig>): MultiVoiceTTSConfig {
    if (!config) return this.DEFAULT_VOICE_CONFIG;
    
    return {
      ...this.DEFAULT_VOICE_CONFIG,
      ...config,
      voiceMapping: {
        ...this.DEFAULT_VOICE_CONFIG.voiceMapping,
        ...config.voiceMapping
      },
      audioQuality: {
        ...this.DEFAULT_VOICE_CONFIG.audioQuality,
        ...config.audioQuality
      },
      conversationFlow: {
        ...this.DEFAULT_VOICE_CONFIG.conversationFlow,
        ...config.conversationFlow
      },
      outputFormat: {
        ...this.DEFAULT_VOICE_CONFIG.outputFormat,
        ...config.outputFormat
      }
    };
  }

  /**
   * 파일명 생성
   */
  private static generateFilename(
    speakerId: 'host' | 'curator',
    index: number,
    format: OutputFormatConfig
  ): string {
    
    const speakerName = speakerId === 'host' ? 'host' : 'curator';
    const timestamp = Date.now();
    
    switch (format.fileNaming) {
      case 'timestamp':
        return `${speakerName}_${timestamp}_${index}.mp3`;
      case 'sequential':
        return `${speakerName}_${String(index + 1).padStart(3, '0')}.mp3`;
      case 'custom':
        return `${format.customPrefix || 'audio'}_${speakerName}_${index}.mp3`;
      default:
        return `${speakerName}_${index}.mp3`;
    }
  }

  /**
   * 통합 파일명 생성
   */
  private static generateMergedFilename(format: OutputFormatConfig): string {
    const timestamp = Date.now();
    
    switch (format.fileNaming) {
      case 'timestamp':
        return `podcast_merged_${timestamp}.mp3`;
      case 'sequential':
        return `podcast_merged_001.mp3`;
      case 'custom':
        return `${format.customPrefix || 'podcast'}_merged.mp3`;
      default:
        return `podcast_merged.mp3`;
    }
  }

  /**
   * MIME 타입 반환
   */
  private static getMimeType(encoding: string): string {
    const mimeTypes: { [key: string]: string } = {
      'MP3': 'audio/mpeg',
      'LINEAR16': 'audio/wav',
      'OGG_OPUS': 'audio/ogg'
    };
    return mimeTypes[encoding] || 'audio/mpeg';
  }

  /**
   * 오디오 재생 시간 추정
   */
  private static estimateAudioDuration(content: string, speakingRate: number): number {
    // 한국어 기준: 분당 200자, 속도 조절 적용
    const baseCharsPerMinute = 200;
    const adjustedCharsPerMinute = baseCharsPerMinute * speakingRate;
    return Math.ceil((content.length / adjustedCharsPerMinute) * 60);
  }

  /**
   * 화자 통계 초기화
   */
  private static initSpeakerStats(speakerId: 'host' | 'curator'): SpeakerStats {
    return {
      speakerId,
      segmentCount: 0,
      totalChars: 0,
      totalDuration: 0,
      averageWPM: 0
    };
  }

  /**
   * 화자 통계 업데이트
   */
  private static updateSpeakerStats(stats: SpeakerStats, segment: SpeakerSegment): void {
    stats.segmentCount++;
    stats.totalChars += segment.content.length;
    stats.totalDuration += segment.estimatedDuration || 0;
    stats.averageWPM = Math.round((stats.totalChars / 5) / (stats.totalDuration / 60));
  }

  /**
   * 품질 점수 계산
   */
  private static calculateQualityScore(speakerStats: SpeakerStats[]): number {
    let score = 100;
    
    const totalSegments = speakerStats.reduce((sum, stat) => sum + stat.segmentCount, 0);
    const hostSegments = speakerStats.find(s => s.speakerId === 'host')?.segmentCount || 0;
    const curatorSegments = speakerStats.find(s => s.speakerId === 'curator')?.segmentCount || 0;
    
    // 화자 균형 점수 (이상적: 50:50)
    const balance = Math.abs(hostSegments - curatorSegments) / totalSegments;
    score -= balance * 20;
    
    // 총 세그먼트 수 점수 (너무 적으면 감점)
    if (totalSegments < 4) score -= 15;
    
    // 각 화자의 최소 기여도 체크
    if (hostSegments === 0 || curatorSegments === 0) score -= 30;
    
    return Math.max(0, Math.min(100, score));
  }
}

/**
 * 편의 함수들
 */
export async function generateMultiVoicePodcast(
  speakers: SpeakerSegment[],
  config?: Partial<MultiVoiceTTSConfig>
): Promise<GeneratedVoiceFiles> {
  return MultiVoiceTTSGenerator.generateMultiVoiceAudio(speakers, config);
}

export function createVoiceConfig(
  speakerId: 'host' | 'curator',
  customization?: Partial<VoiceConfig>
): VoiceConfig {
  const base = speakerId === 'host' 
    ? MultiVoiceTTSGenerator['DEFAULT_VOICE_CONFIG'].voiceMapping.host
    : MultiVoiceTTSGenerator['DEFAULT_VOICE_CONFIG'].voiceMapping.curator;
    
  return { ...base, ...customization };
}

export default MultiVoiceTTSGenerator;