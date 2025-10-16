// 대화형 TTS 생성기 - NotebookLM 스타일 구현
// 이중 스크립트 + 전문가 페르소나 + Google Cloud TTS 통합

import { TTSExpertPersona, TTSExpertPersonaSelector, TTSScriptOptimizer } from '../personas/tts-expert-persona';
import { DualScriptGenerator, UserChapterScript, TTSAudioScript } from '../scripts/dual-script-generator';

export interface ConversationalTTSConfig {
  location: string;
  language: string;
  culturalContext: string[];
  audienceLevel: 'beginner' | 'intermediate' | 'advanced';
  priority: 'engagement' | 'accuracy' | 'emotion';
  audioSettings: AudioGenerationSettings;
}

export interface AudioGenerationSettings {
  engine: 'google-cloud-tts' | 'azure-tts' | 'aws-polly';
  outputFormat: 'mp3' | 'wav' | 'ogg';
  quality: 'standard' | 'high' | 'premium';
  bitrate: string;
  enableProsodyOptimization: boolean;
  enableEmotionModulation: boolean;
}

export interface TTSGenerationResult {
  userScript: UserChapterScript;
  ttsScript: TTSAudioScript;
  audioFiles: GeneratedAudioFile[];
  metadata: TTSGenerationMetadata;
  qualityScore: number;
}

export interface GeneratedAudioFile {
  chapterIndex: number;
  speakerRole: 'primary' | 'secondary';
  audioUrl: string;
  duration: number;
  fileSize: number;
  voiceProfile: string;
}

export interface TTSGenerationMetadata {
  persona: TTSExpertPersona;
  generationTimestamp: string;
  processingTime: number;
  ssmlTagsUsed: string[];
  naturalBreakCount: number;
  emphasisCount: number;
  estimatedListeningTime: number;
}

// 🎙️ 대화형 TTS 생성기 메인 클래스
export class ConversationalTTSGenerator {
  private config: ConversationalTTSConfig;
  private persona: TTSExpertPersona;
  private dualScriptGenerator: DualScriptGenerator;

  constructor(config: ConversationalTTSConfig) {
    this.config = config;
    
    // 최적 페르소나 선택
    this.persona = TTSExpertPersonaSelector.selectOptimalPersona(
      this.detectContentType(config.location),
      config.audienceLevel,
      config.priority
    );

    // 장소별 페르소나 맞춤화
    this.persona = TTSExpertPersonaSelector.customizeForLocation(
      this.persona,
      config.location,
      config.culturalContext
    );

    this.dualScriptGenerator = new DualScriptGenerator();
  }

  // 🚀 메인 TTS 생성 프로세스
  async generateConversationalTTS(
    rawContent: string,
    chapterTitle: string,
    chapterIndex: number
  ): Promise<TTSGenerationResult> {
    
    const startTime = Date.now();
    
    try {
      // 1단계: 이중 스크립트 생성
      console.log('🎯 1단계: 이중 스크립트 생성 중...');
      const scripts = await this.generateDualScripts(rawContent, chapterTitle, chapterIndex);
      
      // 2단계: TTS 스크립트 페르소나 최적화
      console.log('🎭 2단계: TTS 스크립트 페르소나 최적화 중...');
      const optimizedTTSScript = this.optimizeTTSScript(scripts.ttsScript);
      
      // 3단계: 오디오 파일 생성
      console.log('🔊 3단계: 대화형 오디오 생성 중...');
      const audioFiles = await this.generateConversationalAudio(optimizedTTSScript);
      
      // 4단계: 품질 검증
      console.log('✅ 4단계: 품질 검증 중...');
      const qualityScore = this.evaluateQuality(optimizedTTSScript, audioFiles);
      
      // 5단계: 메타데이터 생성
      const metadata = this.generateMetadata(optimizedTTSScript, startTime);
      
      return {
        userScript: scripts.userScript,
        ttsScript: optimizedTTSScript,
        audioFiles,
        metadata,
        qualityScore
      };
      
    } catch (error) {
      console.error('❌ TTS 생성 실패:', error);
      throw new Error(`TTS 생성 실패: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 📝 이중 스크립트 생성
  private async generateDualScripts(
    rawContent: string,
    chapterTitle: string, 
    chapterIndex: number
  ): Promise<{ userScript: UserChapterScript; ttsScript: TTSAudioScript }> {
    
    const scripts = await this.dualScriptGenerator.generateDualScripts(
      rawContent,
      chapterTitle,
      chapterIndex,
      this.config.location,
      this.config.language
    );
    
    return scripts;
  }

  // 🎭 TTS 스크립트 페르소나 최적화
  private optimizeTTSScript(ttsScript: TTSAudioScript): TTSAudioScript {
    
    // 진행자 스크립트 최적화
    const optimizedHostScript = TTSScriptOptimizer.optimizeForPersona(
      ttsScript.hostScript || '',
      this.persona,
      'primary'
    );
    
    // 큐레이터 스크립트 최적화
    const optimizedCuratorScript = TTSScriptOptimizer.optimizeForPersona(
      ttsScript.curatorScript || '',
      this.persona,
      'secondary'
    );
    
    // 통합 스크립트 최적화
    const optimizedCombinedScript = this.optimizeCombinedScript(ttsScript.combinedScript || '');
    
    return {
      ...ttsScript,
      hostScript: optimizedHostScript,
      curatorScript: optimizedCuratorScript,
      combinedScript: optimizedCombinedScript,
      systemPrompt: TTSScriptOptimizer.generateSystemPrompt(this.persona, this.config.location)
    };
  }

  // 🎵 통합 스크립트 최적화 (NotebookLM 스타일)
  private optimizeCombinedScript(combinedScript: string): string {
    let optimized = combinedScript;
    
    // 1. NotebookLM 스타일 대화 흐름 최적화
    optimized = this.applyNotebookLMConversationFlow(optimized);
    
    // 2. 자연스러운 화자 전환 최적화
    optimized = this.optimizeSpeakerTransitions(optimized);
    
    // 3. 감정 다이내믹스 적용
    optimized = this.applyEmotionalDynamics(optimized);
    
    // 4. 발음 최적화 (외국어, 전문용어)
    optimized = this.optimizePronunciation(optimized);
    
    return optimized;
  }

  // 🗣️ NotebookLM 스타일 대화 흐름 적용
  private applyNotebookLMConversationFlow(script: string): string {
    let optimized = script;
    
    // NotebookLM의 자연스러운 끼어들기 패턴
    const interruptionPatterns = [
      '그런데 말이야',
      '아, 그거 정말 흥미로운 점이야',
      '잠깐, 이것도 재밌는데',
      '그래서 내가 말하고 싶은 건'
    ];
    
    // 정보 레이어링 적용 (기본 → 흥미로운 → 놀라운)
    const layeringCues = [
      { trigger: '기본적으로', replacement: '<prosody rate="1.0">기본적으로' },
      { trigger: '흥미롭게도', replacement: '<prosody rate="1.1" pitch="+1st">흥미롭게도' },
      { trigger: '놀랍게도', replacement: '<prosody rate="0.9" pitch="+2st" volume="loud">놀랍게도' }
    ];
    
    layeringCues.forEach(cue => {
      const regex = new RegExp(cue.trigger, 'gi');
      optimized = optimized.replace(regex, `${cue.replacement}</prosody>`);
    });
    
    // 자연스러운 반응과 감탄사 추가
    const reactionPatterns = [
      { after: '정말', add: '<break time="0.3s"/> 그러게 말이야 <break time="0.5s"/>' },
      { after: '대단한', add: '<break time="0.4s"/> 정말 놀라워 <break time="0.6s"/>' }
    ];
    
    return optimized;
  }

  // 🔄 자연스러운 화자 전환 최적화
  private optimizeSpeakerTransitions(script: string): string {
    let optimized = script;
    
    // 화자 전환 시 자연스러운 휴지와 전환 효과
    optimized = optimized.replace(
      /\*\*진행자:\*\*/g,
      '<break time="0.8s"/><prosody rate="1.05" pitch="+1st">**진행자:**</prosody>'
    );
    
    optimized = optimized.replace(
      /\*\*큐레이터:\*\*/g,
      '<break time="0.8s"/><prosody rate="0.95" pitch="-1st">**큐레이터:**</prosody>'
    );
    
    // 대화의 연결성을 높이는 전환 구문 추가
    const transitionPhrases = this.persona.voiceProfile.conversationFlow.transitionCues;
    
    return optimized;
  }

  // 💫 감정 다이내믹스 적용
  private applyEmotionalDynamics(script: string): string {
    let optimized = script;
    
    // 감정적 하이라이트 구간 식별 및 최적화
    const emotionalKeywords = {
      wonder: ['놀라운', '경이로운', '신비로운', '아름다운'],
      excitement: ['흥미진진한', '재밌는', '놀라운', '대단한'],
      reverence: ['경건한', '숭고한', '의미 있는', '깊은'],
      curiosity: ['궁금한', '흥미로운', '신기한', '이상한']
    };
    
    // 감정별 SSML 최적화 적용
    Object.entries(emotionalKeywords).forEach(([emotion, keywords]) => {
      keywords.forEach(keyword => {
        const emotionSSML = this.getEmotionSSML(emotion);
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        optimized = optimized.replace(regex, `${emotionSSML}${keyword}</prosody>`);
      });
    });
    
    return optimized;
  }

  // 🎵 감정별 SSML 태그 생성
  private getEmotionSSML(emotion: string): string {
    const emotionMap: { [key: string]: string } = {
      wonder: '<prosody rate="0.9" pitch="+2st" volume="medium">',
      excitement: '<prosody rate="1.2" pitch="+1st" volume="loud">',
      reverence: '<prosody rate="0.8" pitch="-1st" volume="soft">',
      curiosity: '<prosody rate="1.1" pitch="+1st" volume="medium">'
    };
    
    return emotionMap[emotion] || '<prosody>';
  }

  // 🗣️ 발음 최적화 (외국어, 전문용어)
  private optimizePronunciation(script: string): string {
    let optimized = script;
    
    // 외국어 발음 가이드 맵
    const pronunciationMap: { [key: string]: string } = {
      'Louvre': '<phoneme alphabet="ipa" ph="luːvrə">루브르</phoneme>',
      'Notre-Dame': '<phoneme alphabet="ipa" ph="nɔtrə dam">노트르담</phoneme>',
      'Versailles': '<phoneme alphabet="ipa" ph="vɛʁsaɪ">베르사유</phoneme>',
      'Renaissance': '<phoneme alphabet="ipa" ph="rənɛsɑ̃s">르네상스</phoneme>',
      'Baroque': '<phoneme alphabet="ipa" ph="bəˈroʊk">바로크</phoneme>'
    };
    
    // 발음 가이드 적용
    Object.entries(pronunciationMap).forEach(([original, phoneme]) => {
      const regex = new RegExp(original, 'gi');
      optimized = optimized.replace(regex, phoneme);
    });
    
    return optimized;
  }

  // 🔊 대화형 오디오 생성
  private async generateConversationalAudio(
    ttsScript: TTSAudioScript
  ): Promise<GeneratedAudioFile[]> {
    
    const audioFiles: GeneratedAudioFile[] = [];
    
    try {
      // Google Cloud TTS 클라이언트 설정
      const ttsClient = await this.initializeTTSClient();
      
      // 진행자 음성 생성
      const hostAudio = await this.generateSpeakerAudio(
        ttsScript.hostScript || '',
        this.persona.voiceProfile.primarySpeaker,
        'primary',
        ttsClient
      );
      
      if (hostAudio) audioFiles.push(hostAudio);
      
      // 큐레이터 음성 생성  
      const curatorAudio = await this.generateSpeakerAudio(
        ttsScript.curatorScript || '',
        this.persona.voiceProfile.secondarySpeaker,
        'secondary',
        ttsClient
      );
      
      if (curatorAudio) audioFiles.push(curatorAudio);
      
      // 통합 대화 음성 생성 (메인 파일)
      const combinedAudio = await this.generateCombinedConversation(
        ttsScript.combinedScript || '',
        ttsClient
      );
      
      if (combinedAudio) audioFiles.push(combinedAudio);
      
      return audioFiles;
      
    } catch (error) {
      console.error('❌ 오디오 생성 실패:', error);
      throw error;
    }
  }

  // 🎤 개별 화자 음성 생성
  private async generateSpeakerAudio(
    script: string,
    voiceConfig: any,
    role: 'primary' | 'secondary',
    ttsClient: any
  ): Promise<GeneratedAudioFile | null> {
    
    if (!script || script.trim().length === 0) {
      return null;
    }
    
    try {
      const request = {
        input: { ssml: script },
        voice: {
          languageCode: this.config.language,
          name: voiceConfig.voiceId,
          ssmlGender: role === 'primary' ? 'FEMALE' : 'MALE'
        },
        audioConfig: {
          audioEncoding: this.getAudioEncoding(),
          pitch: this.parsePitch(voiceConfig.pitch),
          speakingRate: parseFloat(voiceConfig.rate),
          volumeGainDb: this.parseVolume(voiceConfig.volume)
        }
      };
      
      const [response] = await ttsClient.synthesizeSpeech(request);
      
      // 오디오 파일 저장 및 URL 생성
      const audioUrl = await this.saveAudioFile(response.audioContent, role);
      const duration = this.estimateAudioDuration(script);
      
      return {
        chapterIndex: 0, // 실제 챕터 인덱스로 대체 필요
        speakerRole: role,
        audioUrl,
        duration,
        fileSize: response.audioContent.length,
        voiceProfile: voiceConfig.voiceId
      };
      
    } catch (error) {
      console.error(`❌ ${role} 화자 음성 생성 실패:`, error);
      return null;
    }
  }

  // 🎭 통합 대화 음성 생성 (NotebookLM 스타일)
  private async generateCombinedConversation(
    combinedScript: string,
    ttsClient: any
  ): Promise<GeneratedAudioFile | null> {
    
    try {
      // NotebookLM 스타일의 자연스러운 대화 흐름을 위한 특별 처리
      const conversationSSML = this.createConversationSSML(combinedScript);
      
      const request = {
        input: { ssml: conversationSSML },
        voice: {
          languageCode: this.config.language,
          name: this.persona.voiceProfile.primarySpeaker.voiceId
        },
        audioConfig: {
          audioEncoding: this.getAudioEncoding(),
          effectsProfileId: ['telephony-class-application'], // 대화 품질 향상
          pitch: 0,
          speakingRate: 1.0,
          volumeGainDb: 0
        }
      };
      
      const [response] = await ttsClient.synthesizeSpeech(request);
      
      const audioUrl = await this.saveAudioFile(response.audioContent, 'combined');
      const duration = this.estimateAudioDuration(combinedScript);
      
      return {
        chapterIndex: 0,
        speakerRole: 'primary',
        audioUrl,
        duration,
        fileSize: response.audioContent.length,
        voiceProfile: 'conversational'
      };
      
    } catch (error) {
      console.error('❌ 통합 대화 음성 생성 실패:', error);
      return null;
    }
  }

  // 🎵 대화용 SSML 생성 (화자 전환 최적화)
  private createConversationSSML(script: string): string {
    let ssml = `<speak>${script}</speak>`;
    
    // 화자별 음성 프로필 적용
    ssml = ssml.replace(
      /\*\*진행자:\*\*(.*?)(?=\*\*큐레이터:\*\*|$)/gs,
      (match, content) => {
        const hostVoice = this.persona.voiceProfile.primarySpeaker;
        return `<voice name="${hostVoice.voiceId}">
          <prosody rate="${hostVoice.rate}" pitch="${hostVoice.pitch}">
            **진행자:**${content}
          </prosody>
        </voice>`;
      }
    );
    
    ssml = ssml.replace(
      /\*\*큐레이터:\*\*(.*?)(?=\*\*진행자:\*\*|$)/gs,
      (match, content) => {
        const curatorVoice = this.persona.voiceProfile.secondarySpeaker;
        return `<voice name="${curatorVoice.voiceId}">
          <prosody rate="${curatorVoice.rate}" pitch="${curatorVoice.pitch}">
            **큐레이터:**${content}
          </prosody>
        </voice>`;
      }
    );
    
    return ssml;
  }

  // ⚙️ 헬퍼 메서드들
  private detectContentType(location: string): 'museum' | 'historical' | 'cultural' | 'technical' {
    if (location.includes('박물관') || location.includes('미술관')) return 'museum';
    if (location.includes('궁') || location.includes('성') || location.includes('유적')) return 'historical';
    if (location.includes('문화') || location.includes('전통')) return 'cultural';
    return 'museum';
  }

  private async initializeTTSClient(): Promise<any> {
    // Google Cloud TTS 클라이언트 초기화 로직
    // 실제 구현에서는 @google-cloud/text-to-speech 패키지 사용
    return {
      synthesizeSpeech: async (request: any) => {
        // TTS 생성 로직 (실제 구현 필요)
        return [{ audioContent: Buffer.from('mock audio data') }];
      }
    };
  }

  private getAudioEncoding(): string {
    const formatMap: { [key: string]: string } = {
      'mp3': 'MP3',
      'wav': 'LINEAR16', 
      'ogg': 'OGG_OPUS'
    };
    return formatMap[this.config.audioSettings.outputFormat] || 'MP3';
  }

  private parsePitch(pitch: string): number {
    if (pitch === 'default') return 0;
    const match = pitch.match(/([+-]?\d+)st/);
    return match ? parseInt(match[1]) * 2 : 0; // semitones to Hz conversion
  }

  private parseVolume(volume: string): number {
    const volumeMap: { [key: string]: number } = {
      'soft': -10,
      'medium': 0,
      'loud': 6
    };
    return volumeMap[volume] || 0;
  }

  private async saveAudioFile(audioContent: Buffer, type: string): Promise<string> {
    // 오디오 파일 저장 로직 (Supabase Storage 등)
    const filename = `tts-${type}-${Date.now()}.${this.config.audioSettings.outputFormat}`;
    // 실제 저장 로직 구현 필요
    return `https://storage.example.com/audio/${filename}`;
  }

  private estimateAudioDuration(script: string): number {
    // 스크립트 길이 기반 재생 시간 추정 (평균 150 WPM)
    const words = script.replace(/<[^>]+>/g, '').split(' ').length;
    return Math.round((words / 150) * 60); // seconds
  }

  private evaluateQuality(ttsScript: TTSAudioScript, audioFiles: GeneratedAudioFile[]): number {
    // TTS 품질 평가 로직
    let score = 0;
    
    // SSML 태그 사용도 평가 (30점)
    const ssmlCount = (ttsScript.combinedScript?.match(/<[^>]+>/g) || []).length;
    score += Math.min(30, ssmlCount * 2);
    
    // 오디오 파일 생성 성공률 (40점)
    const successRate = audioFiles.length / 3; // 예상 3개 파일
    score += successRate * 40;
    
    // 페르소나 특성 반영도 (30점)
    const hasPersonaElements = this.persona.characteristics.some(char =>
      ttsScript.combinedScript?.toLowerCase().includes(char.slice(0, 5).toLowerCase())
    );
    score += hasPersonaElements ? 30 : 15;
    
    return Math.min(100, score);
  }

  private generateMetadata(ttsScript: TTSAudioScript, startTime: number): TTSGenerationMetadata {
    const processingTime = Date.now() - startTime;
    const ssmlTags = (ttsScript.combinedScript?.match(/<[^>]+>/g) || []).map(tag => 
      tag.replace(/[<>]/g, '').split(' ')[0]
    );
    
    return {
      persona: this.persona,
      generationTimestamp: new Date().toISOString(),
      processingTime,
      ssmlTagsUsed: [...new Set(ssmlTags)],
      naturalBreakCount: (ttsScript.combinedScript?.match(/<break/g) || []).length,
      emphasisCount: (ttsScript.combinedScript?.match(/<emphasis/g) || []).length,
      estimatedListeningTime: this.estimateAudioDuration(ttsScript.combinedScript || '')
    };
  }
}

// 🏭 대화형 TTS 팩토리
export class ConversationalTTSFactory {
  
  static createGenerator(
    location: string,
    language: string = 'ko-KR',
    options: Partial<ConversationalTTSConfig> = {}
  ): ConversationalTTSGenerator {
    
    const defaultConfig: ConversationalTTSConfig = {
      location,
      language,
      culturalContext: [],
      audienceLevel: 'intermediate',
      priority: 'engagement',
      audioSettings: {
        engine: 'google-cloud-tts',
        outputFormat: 'mp3',
        quality: 'high',
        bitrate: '128kbps',
        enableProsodyOptimization: true,
        enableEmotionModulation: true
      }
    };
    
    const config = { ...defaultConfig, ...options };
    return new ConversationalTTSGenerator(config);
  }
  
  static createForMuseum(location: string): ConversationalTTSGenerator {
    return this.createGenerator(location, 'ko-KR', {
      culturalContext: ['educational', 'cultural', 'respectful'],
      priority: 'emotion',
      audienceLevel: 'intermediate'
    });
  }
  
  static createForHistoricalSite(location: string): ConversationalTTSGenerator {
    return this.createGenerator(location, 'ko-KR', {
      culturalContext: ['historical', 'reverent', 'educational'],
      priority: 'accuracy',
      audienceLevel: 'intermediate'
    });
  }
}

// 모든 클래스는 이미 위에서 export 되었으므로 여기서는 제거