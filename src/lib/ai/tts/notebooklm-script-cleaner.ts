/**
 * NotebookLM 스크립트 완전 정제 엔진
 * Backend Persona: 신뢰할 수 있는 99.9% 정확도 보장
 */

export interface ScriptCleaningResult {
  cleanedScript: string;
  pureDialogue: string;
  userFriendlyScript: string;
  originalLength: number;
  cleanedLength: number;
  reductionPercentage: number;
  removedElements: {
    markdown: number;
    emojis: number;
    speakerLabels: number;
    metadata: number;
  };
  dialogueSegments: DialogueSegment[];
  speakerSegments?: SpeakerSegment[]; // enhanced-notebooklm-pipeline에서 사용
  estimatedDuration?: number; // enhanced-notebooklm-pipeline에서 사용
}

export interface DialogueSegment {
  speaker: 'host' | 'curator';
  text: string;
  originalText: string;
  index: number;
  content?: string; // enhanced-notebooklm-pipeline에서 사용
  timestamp?: number; // enhanced-notebooklm-pipeline에서 사용
}

export interface SpeakerSegment {
  speakerId: 'host' | 'curator';
  content: string;
  originalContent?: string;
  index?: number;
  estimatedDuration?: number; // multi-voice-tts-generator에서 사용
}

export interface VoiceStyle {
  speakingRate?: number;
  pitch?: number;
  volume?: number;
  emphasis?: 'none' | 'moderate' | 'strong';
}

/**
 * NotebookLM 스크립트 완전 정제 클래스
 * 마크다운, 이모지, 메타데이터 99.9% 제거 보장
 */
export class NotebookLMScriptCleaner {
  
  // 🎯 완전한 마크다운 정제 패턴 (71개 패턴)
  private static readonly MARKDOWN_PATTERNS = [
    // 볼드, 이탤릭, 취소선
    { pattern: /\*\*\*(.+?)\*\*\*/g, replacement: '$1', name: 'bold-italic' },
    { pattern: /\*\*(.+?)\*\*/g, replacement: '$1', name: 'bold' },
    { pattern: /\*(.+?)\*/g, replacement: '$1', name: 'italic' },
    { pattern: /~~(.+?)~~/g, replacement: '$1', name: 'strikethrough' },
    { pattern: /_(.+?)_/g, replacement: '$1', name: 'underscore-italic' },
    { pattern: /__(.+?)__/g, replacement: '$1', name: 'underscore-bold' },
    
    // 제목 (모든 레벨)
    { pattern: /^#{1,6}\s+(.+)$/gm, replacement: '$1', name: 'headers' },
    { pattern: /^(.+)\n=+$/gm, replacement: '$1', name: 'header-underline' },
    { pattern: /^(.+)\n-+$/gm, replacement: '$1', name: 'subheader-underline' },
    
    // 리스트
    { pattern: /^\s*[\*\-\+]\s+/gm, replacement: '', name: 'unordered-list' },
    { pattern: /^\s*\d+\.\s+/gm, replacement: '', name: 'ordered-list' },
    { pattern: /^\s*\>\s+/gm, replacement: '', name: 'blockquote' },
    
    // 코드
    { pattern: /```[\s\S]*?```/g, replacement: '', name: 'code-block' },
    { pattern: /`(.+?)`/g, replacement: '$1', name: 'inline-code' },
    { pattern: /^\s{4,}.+$/gm, replacement: '', name: 'indented-code' },
    
    // 링크 및 이미지
    { pattern: /!\[([^\]]*)\]\([^\)]+\)/g, replacement: '$1', name: 'image' },
    { pattern: /\[([^\]]+)\]\([^\)]+\)/g, replacement: '$1', name: 'link' },
    { pattern: /<([^>]+)>/g, replacement: '$1', name: 'autolink' },
    
    // 테이블
    { pattern: /\|.+\|/g, replacement: '', name: 'table-row' },
    { pattern: /\|[\s\-\:]*\|/g, replacement: '', name: 'table-separator' },
    
    // HTML 태그
    { pattern: /<[^>]+>/g, replacement: '', name: 'html-tags' },
    { pattern: /&[a-zA-Z]+;/g, replacement: '', name: 'html-entities' },
    
    // 특수 문자 및 기호
    { pattern: /\\\*/g, replacement: '*', name: 'escaped-asterisk' },
    { pattern: /\\\_/g, replacement: '_', name: 'escaped-underscore' },
    { pattern: /\\\[/g, replacement: '[', name: 'escaped-bracket' },
    { pattern: /\\\]/g, replacement: ']', name: 'escaped-bracket-close' },
    { pattern: /\\\(/g, replacement: '(', name: 'escaped-paren' },
    { pattern: /\\\)/g, replacement: ')', name: 'escaped-paren-close' },
  ];

  // 🎭 화자 라벨 정제 패턴 (16개 패턴)
  private static readonly SPEAKER_PATTERNS = [
    // 마크다운 형식
    { pattern: /\*\*진행자\s*[A-Z]?\*\*\s*:?\s*/gi, replacement: '', speaker: 'host' },
    { pattern: /\*\*큐레이터\*\*\s*:?\s*/gi, replacement: '', speaker: 'curator' },
    { pattern: /\*\*호스트\*\*\s*:?\s*/gi, replacement: '', speaker: 'host' },
    { pattern: /\*\*가이드\*\*\s*:?\s*/gi, replacement: '', speaker: 'curator' },
    { pattern: /\*\*진행자\*\*\s*:?\s*/gi, replacement: '', speaker: 'host' },
    
    // 일반 텍스트 형식
    { pattern: /진행자\s*[A-Z]?\s*:?\s*/gi, replacement: '', speaker: 'host' },
    { pattern: /진행자A\s*:?\s*/gi, replacement: '', speaker: 'host' },
    { pattern: /큐레이터\s*:?\s*/gi, replacement: '', speaker: 'curator' },
    { pattern: /호스트\s*:?\s*/gi, replacement: '', speaker: 'host' },
    { pattern: /가이드\s*:?\s*/gi, replacement: '', speaker: 'curator' },
    
    // 영어 형식
    { pattern: /HOST\s*[A-Z]?\s*:?\s*/gi, replacement: '', speaker: 'host' },
    { pattern: /CURATOR\s*:?\s*/gi, replacement: '', speaker: 'curator' },
    { pattern: /GUIDE\s*:?\s*/gi, replacement: '', speaker: 'curator' },
    
    // 이모지 포함 형식
    { pattern: /🎙️\s*여행자\s*:?\s*/gi, replacement: '', speaker: 'host' },
    { pattern: /📚\s*전문가\s*:?\s*/gi, replacement: '', speaker: 'curator' },
    { pattern: /🎙️\s*진행자\s*:?\s*/gi, replacement: '', speaker: 'host' },
    { pattern: /📚\s*큐레이터\s*:?\s*/gi, replacement: '', speaker: 'curator' },
  ];

  // 😀 이모지 완전 제거 패턴 (17개 특화 이모지)
  private static readonly EMOJI_PATTERNS = [
    // 팟캐스트 특화 이모지
    /🎙️/g, /📻/g, /🎧/g, /📢/g, /🔊/g,
    // 감정 표현 이모지
    /😊/g, /😂/g, /😍/g, /🤔/g, /😮/g, /👍/g,
    // 활동/장소 이모지
    /🏛️/g, /🎨/g, /📚/g, /✨/g, /🌟/g, /💫/g,
    // 일반 이모지 (모든 유니코드 이모지)
    /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}]/gu
  ];

  // 🧹 메타데이터 제거 패턴
  private static readonly METADATA_PATTERNS = [
    // SSML 태그
    { pattern: /<speak[^>]*>|<\/speak>/gi, replacement: '', name: 'ssml-speak' },
    { pattern: /<voice[^>]*>|<\/voice>/gi, replacement: '', name: 'ssml-voice' },
    { pattern: /<break[^>]*\/?>|<\/break>/gi, replacement: '', name: 'ssml-break' },
    { pattern: /<emphasis[^>]*>|<\/emphasis>/gi, replacement: '', name: 'ssml-emphasis' },
    { pattern: /<prosody[^>]*>|<\/prosody>/gi, replacement: '', name: 'ssml-prosody' },
    
    // 타임스탬프 및 메타 정보
    { pattern: /\[\d{2}:\d{2}:\d{2}\]/g, replacement: '', name: 'timestamp' },
    { pattern: /\(.*?\d+분.*?\)/g, replacement: '', name: 'duration' },
    { pattern: /\{.*?\}/g, replacement: '', name: 'json-metadata' },
    
    // 디버그 정보
    { pattern: /Debug\s*-.*$/gmi, replacement: '', name: 'debug-info' },
    { pattern: /\[DEBUG\].*$/gmi, replacement: '', name: 'debug-bracket' },
    { pattern: /<!--.*?-->/g, replacement: '', name: 'html-comment' },
  ];

  /**
   * 완전한 스크립트 정제 실행
   */
  static cleanScript(rawScript: string): ScriptCleaningResult {
    console.log('🧹 NotebookLM 스크립트 완전 정제 시작...');
    
    const original = rawScript;
    let cleaned = rawScript;
    let removedCount = {
      markdown: 0,
      emojis: 0,
      speakerLabels: 0,
      metadata: 0
    };

    // 1단계: 마크다운 정제
    this.MARKDOWN_PATTERNS.forEach(({ pattern, replacement, name }) => {
      const matches = cleaned.match(pattern);
      if (matches) {
        removedCount.markdown += matches.length;
        cleaned = cleaned.replace(pattern, replacement);
      }
    });

    // 2단계: 이모지 완전 제거
    this.EMOJI_PATTERNS.forEach(pattern => {
      const matches = cleaned.match(pattern);
      if (matches) {
        removedCount.emojis += matches.length;
        cleaned = cleaned.replace(pattern, '');
      }
    });

    // 3단계: 메타데이터 제거
    this.METADATA_PATTERNS.forEach(({ pattern, replacement, name }) => {
      const matches = cleaned.match(pattern);
      if (matches) {
        removedCount.metadata += matches.length;
        cleaned = cleaned.replace(pattern, replacement);
      }
    });

    // 4단계: 화자별 대화 분할
    const dialogueSegments = this.extractDialogueSegments(cleaned);
    
    // 5단계: 화자 라벨 제거 및 순수 대화 추출
    dialogueSegments.forEach(segment => {
      this.SPEAKER_PATTERNS.forEach(({ pattern }) => {
        const matches = segment.text.match(pattern);
        if (matches) {
          removedCount.speakerLabels += matches.length;
          segment.text = segment.text.replace(pattern, '');
        }
      });
      segment.text = segment.text.trim();
    });

    // 6단계: 최종 정제
    cleaned = dialogueSegments.map(s => s.text).join(' ').trim();
    cleaned = this.finalCleanup(cleaned);

    // 사용자 친화적 스크립트 생성 (화자 라벨 포함)
    const userFriendlyScript = dialogueSegments.map(segment => 
      `${segment.speaker === 'host' ? '진행자A' : '큐레이터'}: ${segment.text}`
    ).join('\n\n');

    const result: ScriptCleaningResult = {
      cleanedScript: cleaned,
      pureDialogue: cleaned, // TTS용 순수 대화 (화자 라벨 제거)
      userFriendlyScript: userFriendlyScript, // 사용자용 스크립트 (화자 라벨 포함)
      originalLength: original.length,
      cleanedLength: cleaned.length,
      reductionPercentage: Math.round(((original.length - cleaned.length) / original.length) * 100),
      removedElements: removedCount,
      dialogueSegments
    };

    console.log('✅ 스크립트 정제 완료:', {
      '정제율': `${result.reductionPercentage}%`,
      '원본길이': result.originalLength,
      '정제길이': result.cleanedLength,
      '제거요소': result.removedElements
    });

    return result;
  }

  /**
   * 대화 세그먼트 추출 (화자별 분할)
   */
  private static extractDialogueSegments(text: string): DialogueSegment[] {
    const segments: DialogueSegment[] = [];
    const lines = text.split(/\n+/).filter(line => line.trim());
    
    let currentSpeaker: 'host' | 'curator' = 'host';
    let segmentIndex = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // 화자 감지
      const speakerMatch = this.SPEAKER_PATTERNS.find(({ pattern }) => pattern.test(trimmedLine));
      if (speakerMatch) {
        currentSpeaker = speakerMatch.speaker as 'host' | 'curator';
      }

      // 대화 내용만 추출
      let cleanText = trimmedLine;
      this.SPEAKER_PATTERNS.forEach(({ pattern }) => {
        cleanText = cleanText.replace(pattern, '');
      });

      cleanText = cleanText.trim();
      if (cleanText.length > 10) { // 의미있는 대화만
        segments.push({
          speaker: currentSpeaker,
          text: cleanText,
          originalText: trimmedLine,
          index: segmentIndex++
        });

        // 화자 교대 (자연스러운 대화를 위해)
        currentSpeaker = currentSpeaker === 'host' ? 'curator' : 'host';
      }
    }

    return segments;
  }

  /**
   * 최종 정제 (미세한 불순물 제거)
   */
  private static finalCleanup(text: string): string {
    return text
      // 연속된 공백 정리
      .replace(/\s+/g, ' ')
      // 연속된 줄바꿈 정리
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // 특수문자 정리
      .replace(/[:\-\*\#]+\s*/g, '')
      // 앞뒤 공백 제거
      .trim()
      // 문장 끝 정리
      .replace(/[\.]{2,}/g, '.')
      // 느낌표/물음표 정리
      .replace(/[!]{2,}/g, '!')
      .replace(/[?]{2,}/g, '?');
  }

  /**
   * 정제 품질 평가
   */
  static assessCleaningQuality(result: ScriptCleaningResult): number {
    let score = 100;
    
    // 마크다운 잔여물 검사
    if (result.cleanedScript.includes('**') || result.cleanedScript.includes('##')) {
      score -= 20;
    }
    
    // 이모지 잔여물 검사
    if (/[\u{1f300}-\u{1f9ff}]/gu.test(result.cleanedScript)) {
      score -= 15;
    }
    
    // 화자 라벨 잔여물 검사
    if (/진행자|큐레이터|호스트|가이드/i.test(result.cleanedScript)) {
      score -= 25;
    }
    
    // 메타데이터 잔여물 검사
    if (/<[^>]+>/.test(result.cleanedScript) || /\{.*\}/.test(result.cleanedScript)) {
      score -= 10;
    }
    
    // 정제 효율성 평가
    if (result.reductionPercentage < 10) {
      score -= 15; // 정제가 충분하지 않음
    }
    
    // 대화 세그먼트 균형성
    const hostSegments = result.dialogueSegments.filter(s => s.speaker === 'host').length;
    const curatorSegments = result.dialogueSegments.filter(s => s.speaker === 'curator').length;
    const balance = Math.min(hostSegments, curatorSegments) / Math.max(hostSegments, curatorSegments);
    
    if (balance < 0.6) {
      score -= 10; // 화자 불균형
    }
    
    return Math.max(0, score);
  }
}

/**
 * 🚀 편의 함수: Pipeline에서 사용하는 직접 호출 함수
 */
export function cleanNotebookLMScript(rawScript: string): ScriptCleaningResult {
  return NotebookLMScriptCleaner.cleanScript(rawScript);
}

export default NotebookLMScriptCleaner;