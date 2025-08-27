/**
 * 이중 스크립트 생성 시스템
 * 1. 사용자용 챕터 스크립트 (깔끔한 자막/대본)
 * 2. TTS용 음성 스크립트 (SSML 태그 및 발음 가이드 포함)
 */

export interface DualScript {
  userScript: UserChapterScript;
  ttsScript: TTSAudioScript;
  metadata: ScriptMetadata;
}

export interface UserChapterScript {
  title: string;
  duration: string;
  speakers: string[];
  dialogue: DialogueLine[];
  readingMode: 'subtitle' | 'transcript';
  formatting: {
    speakerStyle: 'bold' | 'colored' | 'icon';
    lineBreaks: 'natural' | 'sentences' | 'paragraphs';
    timestamps: boolean;
  };
}

export interface TTSAudioScript {
  title: string;
  audioMetadata: AudioMetadata;
  voiceInstructions: VoiceInstruction[];
  ssmlContent: string;
  pronunciation: PronunciationGuide[];
  hostScript?: string; // 진행자 스크립트 (선택적)
  curatorScript?: string; // 큐레이터 스크립트 (선택적)
  combinedScript?: string; // 결합된 스크립트 (선택적)
  systemPrompt?: string; // 시스템 프롬프트 (선택적)
}

export interface DialogueLine {
  id: number;
  speaker: 'host' | 'curator';
  speakerName: string;
  content: string;
  timestamp?: string;
  emotions?: string[];
  emphasis?: string[];
}

export interface VoiceInstruction {
  speaker: 'host' | 'curator';
  voiceProfile: {
    gender: 'male' | 'female';
    age: 'young' | 'middle' | 'mature';
    tone: 'friendly' | 'professional' | 'enthusiastic' | 'curious';
    speed: 'slow' | 'normal' | 'fast';
    pitch: 'low' | 'normal' | 'high';
  };
  characteristics: string[];
}

export interface AudioMetadata {
  totalDuration: number;
  segmentCount: number;
  averageWPM: number;
  pauseInstructions: PauseInstruction[];
  backgroundMusic?: string;
}

export interface PauseInstruction {
  afterLine: number;
  duration: number; // milliseconds
  type: 'natural' | 'dramatic' | 'transition';
}

export interface PronunciationGuide {
  term: string;
  pronunciation: string;
  language: 'ko' | 'en' | 'mixed';
  context: string;
}

export interface ScriptMetadata {
  generatedAt: string;
  chapterIndex: number;
  museumName: string;
  qualityScore: number;
  wordCount: {
    user: number;
    tts: number;
  };
  estimatedReadingTime: number;
  estimatedListeningTime: number;
}

/**
 * 이중 스크립트 생성기 메인 클래스
 */
export class DualScriptGenerator {
  
  /**
   * NotebookLM 스타일 원본 스크립트를 이중 스크립트로 변환 (복수형 - conversational-tts-generator에서 사용)
   */
  async generateDualScripts(
    rawContent: string,
    chapterTitle: string,
    chapterIndex: number,
    location: string,
    language: string
  ): Promise<{ userScript: UserChapterScript; ttsScript: TTSAudioScript }> {
    const chapterInfo = {
      title: chapterTitle,
      chapterIndex,
      museumName: location
    };
    
    const dualScript = this.generateDualScript(rawContent, chapterInfo);
    
    // hostScript, curatorScript, combinedScript 추가
    const hostLines = dualScript.userScript.dialogue.filter(line => line.speaker === 'host');
    const curatorLines = dualScript.userScript.dialogue.filter(line => line.speaker === 'curator');
    
    const enhancedTtsScript: TTSAudioScript = {
      ...dualScript.ttsScript,
      hostScript: hostLines.map(line => line.content).join('\n\n'),
      curatorScript: curatorLines.map(line => line.content).join('\n\n'),
      combinedScript: dualScript.userScript.dialogue.map(line => 
        `**${line.speakerName}:** ${line.content}`
      ).join('\n\n')
    };
    
    return {
      userScript: dualScript.userScript,
      ttsScript: enhancedTtsScript
    };
  }
  
  /**
   * NotebookLM 스타일 원본 스크립트를 이중 스크립트로 변환 (단수형 - 기존)
   */
  generateDualScript(
    originalScript: string,
    chapterInfo: {
      title: string;
      chapterIndex: number;
      museumName: string;
    }
  ): DualScript {
    
    // 1. 원본 스크립트 파싱
    const parsedDialogue = this.parseOriginalScript(originalScript);
    
    // 2. 사용자용 챕터 스크립트 생성
    const userScript = this.generateUserScript(parsedDialogue, chapterInfo);
    
    // 3. TTS용 오디오 스크립트 생성
    const ttsScript = this.generateTTSScript(parsedDialogue, chapterInfo);
    
    // 4. 메타데이터 생성
    const metadata = this.generateMetadata(originalScript, userScript, ttsScript, chapterInfo);
    
    return {
      userScript,
      ttsScript,
      metadata
    };
  }

  /**
   * 원본 스크립트 파싱 - 화자별 대사 분리
   */
  private parseOriginalScript(script: string): DialogueLine[] {
    const lines = script.split('\n').filter(line => line.trim());
    const dialogue: DialogueLine[] = [];
    let lineId = 1;
    
    let currentSpeaker: 'host' | 'curator' | null = null;
    let currentContent = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 화자 구분 패턴 감지
      const hostMatch = trimmedLine.match(/^\*\*진행자:\*\*\s*(.*)$/);
      const curatorMatch = trimmedLine.match(/^\*\*큐레이터:\*\*\s*(.*)$/);
      
      if (hostMatch) {
        // 이전 대사 저장
        if (currentSpeaker && currentContent.trim()) {
          dialogue.push({
            id: lineId++,
            speaker: currentSpeaker,
            speakerName: this.getSpeakerName(currentSpeaker),
            content: currentContent.trim(),
            emotions: this.extractEmotions(currentContent),
            emphasis: this.extractEmphasis(currentContent)
          });
        }
        
        currentSpeaker = 'host';
        currentContent = hostMatch[1] || '';
      } else if (curatorMatch) {
        // 이전 대사 저장
        if (currentSpeaker && currentContent.trim()) {
          dialogue.push({
            id: lineId++,
            speaker: currentSpeaker,
            speakerName: this.getSpeakerName(currentSpeaker),
            content: currentContent.trim(),
            emotions: this.extractEmotions(currentContent),
            emphasis: this.extractEmphasis(currentContent)
          });
        }
        
        currentSpeaker = 'curator';
        currentContent = curatorMatch[1] || '';
      } else if (currentSpeaker && trimmedLine) {
        // 현재 화자의 대사 계속
        currentContent += (currentContent ? ' ' : '') + trimmedLine;
      }
    }
    
    // 마지막 대사 저장
    if (currentSpeaker && currentContent.trim()) {
      dialogue.push({
        id: lineId++,
        speaker: currentSpeaker,
        speakerName: this.getSpeakerName(currentSpeaker),
        content: currentContent.trim(),
        emotions: this.extractEmotions(currentContent),
        emphasis: this.extractEmphasis(currentContent)
      });
    }
    
    return dialogue;
  }

  /**
   * 사용자용 챕터 스크립트 생성 (깔끔한 자막/대본용)
   */
  private generateUserScript(dialogue: DialogueLine[], chapterInfo: any): UserChapterScript {
    // 사용자 친화적 정리
    const cleanedDialogue = dialogue.map(line => ({
      ...line,
      content: this.cleanForUserDisplay(line.content)
    }));
    
    // 예상 읽기 시간 계산 (한국어 기준: 분당 300자)
    const totalChars = cleanedDialogue.reduce((sum, line) => sum + line.content.length, 0);
    const readingMinutes = Math.ceil(totalChars / 300);
    
    return {
      title: chapterInfo.title,
      duration: `약 ${readingMinutes}분`,
      speakers: ['진행자', '큐레이터'],
      dialogue: cleanedDialogue,
      readingMode: 'subtitle',
      formatting: {
        speakerStyle: 'bold',
        lineBreaks: 'natural',
        timestamps: false
      }
    };
  }

  /**
   * TTS용 오디오 스크립트 생성 (음성 합성 최적화)
   */
  private generateTTSScript(dialogue: DialogueLine[], chapterInfo: any): TTSAudioScript {
    // 음성 지시사항 생성
    const voiceInstructions = this.generateVoiceInstructions();
    
    // SSML 콘텐츠 생성
    const ssmlContent = this.generateSSMLContent(dialogue);
    
    // 발음 가이드 생성
    const pronunciation = this.generatePronunciationGuide(dialogue);
    
    // 오디오 메타데이터 계산
    const audioMetadata = this.calculateAudioMetadata(dialogue);
    
    return {
      title: `${chapterInfo.title} (Audio)`,
      audioMetadata,
      voiceInstructions,
      ssmlContent,
      pronunciation
    };
  }

  /**
   * 사용자 표시용 텍스트 정리
   */
  private cleanForUserDisplay(content: string): string {
    let cleaned = content;
    
    // 과도한 감탄사 정리
    cleaned = cleaned.replace(/\b(와|우와|헉|어|음)\s*[!]*\s*/g, '$1 ');
    
    // 중복 공백 제거
    cleaned = cleaned.replace(/\s{2,}/g, ' ');
    
    // 문장 부호 정리
    cleaned = cleaned.replace(/([.!?])\s*([.!?])/g, '$1');
    
    // 마크다운 스타일 굵게 표시 정리
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
    
    return cleaned.trim();
  }

  /**
   * 음성 지시사항 생성
   */
  private generateVoiceInstructions(): VoiceInstruction[] {
    return [
      {
        speaker: 'host',
        voiceProfile: {
          gender: 'male',
          age: 'young',
          tone: 'curious',
          speed: 'normal',
          pitch: 'normal'
        },
        characteristics: [
          '호기심 많은 톤',
          '질문할 때 상승 억양',
          '놀랄 때 자연스러운 감탄',
          '친근하고 편안한 말투'
        ]
      },
      {
        speaker: 'curator',
        voiceProfile: {
          gender: 'female',
          age: 'middle',
          tone: 'professional',
          speed: 'normal',
          pitch: 'normal'
        },
        characteristics: [
          '전문가답지만 친근한 톤',
          '설명할 때 명확한 발음',
          '중요한 정보 강조',
          '차분하고 신뢰감 있는 목소리'
        ]
      }
    ];
  }

  /**
   * SSML 콘텐츠 생성 (Google Cloud TTS 최적화)
   */
  private generateSSMLContent(dialogue: DialogueLine[]): string {
    let ssml = `<speak>\n`;
    
    dialogue.forEach((line, index) => {
      const voiceName = line.speaker === 'host' ? 'ko-KR-Standard-C' : 'ko-KR-Standard-A';
      
      ssml += `  <voice name="${voiceName}">\n`;
      
      // 감정과 강조에 따른 SSML 태그 추가
      let processedContent = this.addSSMLTags(line.content, line.emotions || [], line.emphasis || []);
      
      ssml += `    ${processedContent}\n`;
      ssml += `  </voice>\n`;
      
      // 화자 변경 시 자연스러운 휴지
      if (index < dialogue.length - 1 && dialogue[index + 1].speaker !== line.speaker) {
        ssml += `  <break time="800ms"/>\n`;
      }
    });
    
    ssml += `</speak>`;
    
    return ssml;
  }

  /**
   * SSML 태그 추가 (감정과 강조 기반)
   */
  private addSSMLTags(content: string, emotions: string[], emphasis: string[]): string {
    let tagged = content;
    
    // 강조 표시된 숫자나 중요 정보
    tagged = tagged.replace(/\*\*([^*]+)\*\*/g, '<emphasis level="moderate">$1</emphasis>');
    
    // 감탄사에 자연스러운 억양
    tagged = tagged.replace(/\b(와|우와|헉)\b[!]*/g, '<emphasis level="strong">$1</emphasis><break time="300ms"/>');
    
    // 질문에 상승 억양
    tagged = tagged.replace(/([^.!?]*\?)/g, '<prosody pitch="+10%">$1</prosody>');
    
    // 중요한 숫자 정보 강조
    tagged = tagged.replace(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*(cm|kg|년|세기|층|명|개|호)/g, 
      '<emphasis level="moderate">$1$2</emphasis>');
    
    // 문장 끝 자연스러운 휴지
    tagged = tagged.replace(/([.!])\s*/g, '$1<break time="500ms"/>');
    
    return tagged;
  }

  /**
   * 발음 가이드 생성 (어려운 한자어, 전문용어)
   */
  private generatePronunciationGuide(dialogue: DialogueLine[]): PronunciationGuide[] {
    const pronunciationMap = {
      '황남대총': '황남대총',
      '곡옥': '고곡',
      '세계수': '세계수',
      '국보': '국보',
      '큐레이터': '큐레이터',
      '신라': '실라',
      '백제': '백제',
      '통일신라': '통일실라'
    };
    
    const guides: PronunciationGuide[] = [];
    const fullText = dialogue.map(d => d.content).join(' ');
    
    Object.entries(pronunciationMap).forEach(([term, pronunciation]) => {
      if (fullText.includes(term)) {
        guides.push({
          term,
          pronunciation,
          language: 'ko',
          context: `박물관 전문용어 - ${term}`
        });
      }
    });
    
    return guides;
  }

  /**
   * 오디오 메타데이터 계산
   */
  private calculateAudioMetadata(dialogue: DialogueLine[]): AudioMetadata {
    const totalChars = dialogue.reduce((sum, line) => sum + line.content.length, 0);
    
    // 한국어 TTS 기준: 분당 약 180-220자 (자연스러운 속도)
    const avgCharsPerMinute = 200;
    const estimatedMinutes = totalChars / avgCharsPerMinute;
    
    // 휴지 시간 계산 (화자 변경, 문장 끝 등)
    const pauseTime = dialogue.length * 0.8 + (dialogue.length * 0.5); // 초 단위
    
    const totalDuration = Math.ceil((estimatedMinutes * 60) + pauseTime);
    
    // 자연스러운 휴지 지점 생성
    const pauseInstructions: PauseInstruction[] = [];
    dialogue.forEach((line, index) => {
      if (line.content.includes('?')) {
        pauseInstructions.push({
          afterLine: line.id,
          duration: 800,
          type: 'natural'
        });
      }
      
      if (line.content.includes('!') || line.content.includes('헉') || line.content.includes('와')) {
        pauseInstructions.push({
          afterLine: line.id,
          duration: 600,
          type: 'dramatic'
        });
      }
    });
    
    return {
      totalDuration,
      segmentCount: dialogue.length,
      averageWPM: Math.round(totalChars / estimatedMinutes / 5), // 단어 기준 추정
      pauseInstructions
    };
  }

  /**
   * 감정 추출 (텍스트에서 감정 단서 파악)
   */
  private extractEmotions(content: string): string[] {
    const emotions: string[] = [];
    
    if (/[와우헉]/.test(content)) emotions.push('surprise');
    if (/\?/.test(content)) emotions.push('curiosity');
    if (/정말|진짜|놀라운/.test(content)) emotions.push('amazement');
    if (/그런데|하지만/.test(content)) emotions.push('transition');
    if (/청취자|여러분/.test(content)) emotions.push('engagement');
    
    return emotions;
  }

  /**
   * 강조 요소 추출
   */
  private extractEmphasis(content: string): string[] {
    const emphasis: string[] = [];
    
    // 숫자 정보
    if (/\d+(?:,\d{3})*(?:\.\d+)?\s*(cm|kg|년|세기|층|명|개|호)/.test(content)) {
      emphasis.push('numbers');
    }
    
    // 전문 용어
    if (/(국보|세계수|황남대총|곡옥|신라)/.test(content)) {
      emphasis.push('technical_terms');
    }
    
    // 감탄 표현
    if (/[!]{2,}/.test(content)) {
      emphasis.push('exclamation');
    }
    
    return emphasis;
  }

  /**
   * 화자 이름 매핑
   */
  private getSpeakerName(speaker: 'host' | 'curator'): string {
    return speaker === 'host' ? '진행자' : '큐레이터';
  }

  /**
   * 메타데이터 생성
   */
  private generateMetadata(
    originalScript: string,
    userScript: UserChapterScript,
    ttsScript: TTSAudioScript,
    chapterInfo: any
  ): ScriptMetadata {
    return {
      generatedAt: new Date().toISOString(),
      chapterIndex: chapterInfo.chapterIndex,
      museumName: chapterInfo.museumName,
      qualityScore: 0, // 외부에서 설정
      wordCount: {
        user: userScript.dialogue.reduce((sum, line) => sum + line.content.length, 0),
        tts: originalScript.length
      },
      estimatedReadingTime: Math.ceil(userScript.dialogue.reduce((sum, line) => sum + line.content.length, 0) / 300),
      estimatedListeningTime: ttsScript.audioMetadata.totalDuration
    };
  }

  /**
   * 사용자 스크립트를 HTML/마크다운으로 포맷팅
   */
  formatUserScriptForDisplay(userScript: UserChapterScript, format: 'html' | 'markdown' = 'html'): string {
    if (format === 'html') {
      return this.formatAsHTML(userScript);
    } else {
      return this.formatAsMarkdown(userScript);
    }
  }

  private formatAsHTML(userScript: UserChapterScript): string {
    const dialogueHTML = userScript.dialogue.map(line => `
      <div class="dialogue-line" data-speaker="${line.speaker}">
        <div class="speaker-name ${line.speaker}">${line.speakerName}</div>
        <div class="speaker-content">${line.content}</div>
      </div>
    `).join('\n');

    return `
      <div class="podcast-script">
        <div class="script-header">
          <h2>${userScript.title}</h2>
          <div class="script-meta">
            <span class="duration">${userScript.duration}</span>
            <span class="speakers">${userScript.speakers.join(' & ')}</span>
          </div>
        </div>
        <div class="dialogue-container">
          ${dialogueHTML}
        </div>
      </div>
    `;
  }

  private formatAsMarkdown(userScript: UserChapterScript): string {
    const dialogueMarkdown = userScript.dialogue.map(line => 
      `**${line.speakerName}:** ${line.content}`
    ).join('\n\n');

    return `
# ${userScript.title}

*${userScript.duration} | ${userScript.speakers.join(' & ')}*

---

${dialogueMarkdown}
    `.trim();
  }
}

/**
 * 편의 함수들
 */
export function createDualScript(originalScript: string, chapterInfo: any): DualScript {
  const generator = new DualScriptGenerator();
  return generator.generateDualScript(originalScript, chapterInfo);
}

export function formatForUser(userScript: UserChapterScript, format: 'html' | 'markdown' = 'html'): string {
  const generator = new DualScriptGenerator();
  return generator.formatUserScriptForDisplay(userScript, format);
}

export default {
  DualScriptGenerator,
  createDualScript,
  formatForUser
};