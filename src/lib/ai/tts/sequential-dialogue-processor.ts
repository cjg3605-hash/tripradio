/**
 * 순차 재생용 대화 스크립트 분할 처리기
 * 문장별로 화자를 번갈아가며 배정하여 순차 재생 가능한 세그먼트로 분할
 */

export interface DialogueSegment {
  sequenceNumber: number;
  speakerType: 'male' | 'female';
  textContent: string;
  estimatedDuration: number; // 초 단위 예상 재생 시간
  chapterIndex?: number; // 챕터 번호
}

export interface ProcessedDialogue {
  segments: DialogueSegment[];
  totalSegments: number;
  totalEstimatedDuration: number;
  maleSegments: number;
  femaleSegments: number;
}

export class SequentialDialogueProcessor {
  
  /**
   * 대화 스크립트를 순차 재생용 세그먼트로 분할
   */
  static processDialogue(rawScript: string): ProcessedDialogue {
    console.log('🔄 순차 재생용 대화 스크립트 분할 시작');
    
    // 1. 화자별로 대사 추출 및 그룹핑
    const speakerSections = this.extractSpeakerSections(rawScript);
    
    console.log(`📝 총 ${speakerSections.length}개 화자 섹션 추출`);
    
    // 2. 각 화자별 섹션을 세그먼트로 변환
    const segments: DialogueSegment[] = [];
    let maleCount = 0;
    let femaleCount = 0;
    
    speakerSections.forEach((section, index) => {
      const speakerType: 'male' | 'female' = section.speaker === 'host' ? 'male' : 'female';
      
      if (speakerType === 'male') maleCount++;
      else femaleCount++;
      
      const estimatedDuration = this.estimateDuration(section.content);
      
      segments.push({
        sequenceNumber: index + 1,
        speakerType,
        textContent: section.content,
        estimatedDuration
      });
    });
    
    const totalEstimatedDuration = segments.reduce((sum, seg) => sum + seg.estimatedDuration, 0);
    
    console.log('✅ 대화 분할 완료:', {
      totalSegments: segments.length,
      maleSegments: maleCount,
      femaleSegments: femaleCount,
      totalDuration: `${Math.round(totalEstimatedDuration)}초`,
      avgSegmentDuration: `${Math.round(totalEstimatedDuration / segments.length)}초`
    });
    
    return {
      segments,
      totalSegments: segments.length,
      totalEstimatedDuration,
      maleSegments: maleCount,
      femaleSegments: femaleCount
    };
  }
  
  /**
   * 화자별 대사 섹션 추출
   * 진행자와 큐레이터의 대사를 각각 긴 블록으로 묶어서 반환
   */
  private static extractSpeakerSections(rawScript: string): Array<{speaker: 'host' | 'curator', content: string}> {
    const sections: Array<{speaker: 'host' | 'curator', content: string}> = [];
    
    // 1. 화자 라벨 기준으로 대사 분할
    const lines = rawScript
      .replace(/\*\*(.*?)\*\*/g, '$1') // 마크다운 제거
      .replace(/[🎯🎙️📍✨🏛️]/g, '') // 이모지 제거
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    let currentSpeaker: 'host' | 'curator' | null = null;
    let currentContent: string[] = [];
    
    lines.forEach(line => {
      // 화자 라벨 감지 - 기존 형식과 새로운 **male:**/**female:** 형식 모두 지원
      if (line.match(/^(진행자[AB]?|호스트):\s*/) || line.match(/\*\*male:\*\*\s*/)) {
        // 이전 화자의 내용이 있으면 저장
        if (currentSpeaker && currentContent.length > 0) {
          sections.push({
            speaker: currentSpeaker,
            content: currentContent.join(' ').trim()
          });
        }
        // 새로운 화자 시작
        currentSpeaker = 'host';
        // **male:** 형식과 기존 형식 모두 처리
        const content = line.replace(/^(진행자[AB]?|호스트):\s*/, '').replace(/\*\*male:\*\*\s*/, '');
        currentContent = content.length > 0 ? [content] : [];
        
      } else if (line.match(/^(큐레이터|가이드):\s*/) || line.match(/\*\*female:\*\*\s*/)) {
        // 이전 화자의 내용이 있으면 저장
        if (currentSpeaker && currentContent.length > 0) {
          sections.push({
            speaker: currentSpeaker,
            content: currentContent.join(' ').trim()
          });
        }
        // 새로운 화자 시작
        currentSpeaker = 'curator';
        // **female:** 형식과 기존 형식 모두 처리
        const content = line.replace(/^(큐레이터|가이드):\s*/, '').replace(/\*\*female:\*\*\s*/, '');
        currentContent = content.length > 0 ? [content] : [];
        
      } else if (currentSpeaker && line.length > 0) {
        // 현재 화자의 대사 계속
        currentContent.push(line);
      }
    });
    
    // 마지막 화자의 내용 저장
    if (currentSpeaker && currentContent.length > 0) {
      sections.push({
        speaker: currentSpeaker,
        content: currentContent.join(' ').trim()
      });
    }
    
    // 각 화자별로 연속된 대사들을 하나로 합치기
    const consolidatedSections: Array<{speaker: 'host' | 'curator', content: string}> = [];
    let lastSpeaker: 'host' | 'curator' | null = null;
    let accumulatedContent: string[] = [];
    
    sections.forEach(section => {
      if (section.speaker === lastSpeaker) {
        // 같은 화자가 연속으로 나오면 내용 합치기
        accumulatedContent.push(section.content);
      } else {
        // 다른 화자가 나오면 이전 내용 저장하고 새로 시작
        if (lastSpeaker && accumulatedContent.length > 0) {
          consolidatedSections.push({
            speaker: lastSpeaker,
            content: accumulatedContent.join(' ').trim()
          });
        }
        lastSpeaker = section.speaker;
        accumulatedContent = [section.content];
      }
    });
    
    // 마지막 화자 내용 저장
    if (lastSpeaker && accumulatedContent.length > 0) {
      consolidatedSections.push({
        speaker: lastSpeaker,
        content: accumulatedContent.join(' ').trim()
      });
    }
    
    console.log(`📦 화자별 섹션 추출 완료:`, consolidatedSections.map((section, index) => ({
      순서: index + 1,
      화자: section.speaker === 'host' ? '진행자(남성)' : '큐레이터(여성)',
      길이: section.content.length + '자',
      내용미리보기: section.content.substring(0, 50) + '...'
    })));
    
    return consolidatedSections;
  }

  /**
   * 스크립트 정리 및 정규화 (사용되지 않음 - 하위 호환성을 위해 유지)
   */
  private static cleanAndNormalizeScript(rawScript: string): string {
    return rawScript
      // 기존 화자 라벨 제거
      .replace(/^(진행자[AB]?|큐레이터):\s*/gm, '')
      .replace(/^(호스트|진행자|큐레이터|남성|여성):\s*/gm, '')
      
      // 마크다운 제거
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      
      // 불필요한 문자 제거
      .replace(/[🎯🎙️📍✨🏛️]/g, '')
      
      // 공백 정리
      .replace(/\n\s*\n\s*/g, '\n')
      .trim();
  }
  
  /**
   * 문장 단위로 분할
   */
  private static splitIntoSentences(text: string): string[] {
    // 한국어 문장 분할 규칙
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .filter(sentence => sentence.trim().length > 0)
      .map(sentence => sentence.trim());
    
    // 너무 긴 문장은 추가로 분할 (쉼표 기준)
    const refinedSentences: string[] = [];
    
    sentences.forEach(sentence => {
      if (sentence.length > 150) {
        // 150자 이상인 경우 쉼표로 분할 시도
        const parts = sentence.split(/,\s+/);
        if (parts.length > 1) {
          parts.forEach((part, index) => {
            if (index < parts.length - 1) {
              refinedSentences.push(part.trim() + ',');
            } else {
              refinedSentences.push(part.trim());
            }
          });
        } else {
          refinedSentences.push(sentence);
        }
      } else {
        refinedSentences.push(sentence);
      }
    });
    
    return refinedSentences.filter(s => s.length > 10); // 너무 짧은 문장 제거
  }
  
  /**
   * 문장들을 자연스러운 대화 블록으로 그룹핑
   * 각 블록이 3-5 문장으로 구성되어 실제 대화처럼 들리도록 함
   */
  private static groupIntoDialogueBlocks(sentences: string[]): string[][] {
    const blocks: string[][] = [];
    let currentBlock: string[] = [];
    let currentBlockLength = 0;
    
    // 목표: 각 블록이 300-800자 정도가 되도록 조정 (대화 1회분)
    const minBlockLength = 300;  // 최소 글자 수
    const maxBlockLength = 800;  // 최대 글자 수
    const idealBlockLength = 500; // 이상적인 글자 수
    
    sentences.forEach((sentence, index) => {
      const sentenceLength = sentence.length;
      
      // 현재 블록에 문장 추가
      currentBlock.push(sentence);
      currentBlockLength += sentenceLength;
      
      // 블록 완성 조건 판단
      const shouldCompleteBlock = 
        // 이상적인 길이에 도달했거나
        currentBlockLength >= idealBlockLength ||
        // 최소 길이를 넘고 다음 문장이 길어서 최대 길이를 초과할 것 같거나
        (currentBlockLength >= minBlockLength && 
         index < sentences.length - 1 && 
         currentBlockLength + sentences[index + 1].length > maxBlockLength) ||
        // 마지막 문장이거나
        index === sentences.length - 1;
      
      if (shouldCompleteBlock) {
        // 현재 블록이 너무 짧으면 다음 문장까지 포함 시도
        if (currentBlockLength < minBlockLength && index < sentences.length - 1) {
          // 다음 문장을 추가해도 최대 길이를 넘지 않으면 추가
          const nextSentence = sentences[index + 1];
          if (currentBlockLength + nextSentence.length <= maxBlockLength) {
            return; // 블록을 완성하지 않고 계속
          }
        }
        
        // 블록 완성
        blocks.push([...currentBlock]);
        currentBlock = [];
        currentBlockLength = 0;
        
        console.log(`📦 대화 블록 ${blocks.length} 생성: ${blocks[blocks.length - 1].join(' ').length}자`);
      }
    });
    
    // 마지막에 남은 블록이 있으면 추가
    if (currentBlock.length > 0) {
      if (blocks.length > 0 && currentBlockLength < minBlockLength) {
        // 너무 짧으면 마지막 블록과 합치기
        blocks[blocks.length - 1] = blocks[blocks.length - 1].concat(currentBlock);
        console.log(`🔄 마지막 블록과 합침: ${blocks[blocks.length - 1].join(' ').length}자`);
      } else {
        blocks.push(currentBlock);
        console.log(`📦 대화 블록 ${blocks.length} 생성: ${currentBlock.join(' ').length}자`);
      }
    }
    
    console.log(`✅ 총 ${blocks.length}개 대화 블록 생성 (평균 ${Math.round(blocks.reduce((sum, block) => sum + block.join(' ').length, 0) / blocks.length)}자/블록)`);
    
    return blocks;
  }
  
  /**
   * 텍스트 길이 기반 재생 시간 예상
   */
  private static estimateDuration(text: string): number {
    // 한국어 TTS 기준: 약 3-4자/초 (보통 속도)
    // 여유를 둬서 3자/초로 계산
    const charactersPerSecond = 3;
    const baseDuration = Math.ceil(text.length / charactersPerSecond);
    
    // 대화 블록의 경우 더 긴 재생 시간 허용
    // 최소 5초, 최대 90초로 제한 (자연스러운 대화를 위해)
    return Math.max(5, Math.min(90, baseDuration));
  }
  
  /**
   * 세그먼트 유효성 검증
   */
  static validateSegments(segments: DialogueSegment[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // 순서 번호 연속성 확인
    segments.forEach((segment, index) => {
      if (segment.sequenceNumber !== index + 1) {
        errors.push(`순서 번호 불일치: ${segment.sequenceNumber} (예상: ${index + 1})`);
      }
      
      // 텍스트 내용 확인
      if (!segment.textContent || segment.textContent.trim().length < 5) {
        errors.push(`세그먼트 ${segment.sequenceNumber}: 텍스트 내용이 너무 짧음`);
      }
      
      // 화자 타입 확인
      if (!['male', 'female'].includes(segment.speakerType)) {
        errors.push(`세그먼트 ${segment.sequenceNumber}: 잘못된 화자 타입 ${segment.speakerType}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * 세그먼트 정보 요약
   */
  static summarizeSegments(segments: DialogueSegment[]): string {
    const maleCount = segments.filter(s => s.speakerType === 'male').length;
    const femaleCount = segments.filter(s => s.speakerType === 'female').length;
    const totalDuration = segments.reduce((sum, s) => sum + s.estimatedDuration, 0);
    
    return [
      `총 ${segments.length}개 세그먼트`,
      `남성: ${maleCount}개, 여성: ${femaleCount}개`,
      `예상 총 재생 시간: ${Math.round(totalDuration)}초`,
      `평균 세그먼트 길이: ${Math.round(totalDuration / segments.length)}초`
    ].join(' | ');
  }
}

export default SequentialDialogueProcessor;