// 🎙️ 이중 스크립트 시스템 테스트
// 사용자용 챕터 스크립트 vs TTS용 오디오 스크립트 분리

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * 이중 스크립트 생성기 (JavaScript 버전)
 */
class DualScriptGenerator {
  
  /**
   * 원본 스크립트를 이중 스크립트로 변환
   */
  generateDualScript(originalScript, chapterInfo) {
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
  parseOriginalScript(script) {
    const lines = script.split('\n').filter(line => line.trim());
    const dialogue = [];
    let lineId = 1;
    
    let currentSpeaker = null;
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
  generateUserScript(dialogue, chapterInfo) {
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
  generateTTSScript(dialogue, chapterInfo) {
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
  cleanForUserDisplay(content) {
    let cleaned = content;
    
    // 과도한 감탄사 정리
    cleaned = cleaned.replace(/\b(와|우와|헉|어|음)\s*[!]*\s*/g, '$1 ');
    
    // 중복 공백 제거
    cleaned = cleaned.replace(/\s{2,}/g, ' ');
    
    // 문장 부호 정리
    cleaned = cleaned.replace(/([.!?])\s*([.!?])/g, '$1');
    
    // 마크다운 스타일 굵게 표시를 일반 텍스트로
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
    
    // 불필요한 기호 정리
    cleaned = cleaned.replace(/[…]+/g, '...');
    
    return cleaned.trim();
  }

  /**
   * 음성 지시사항 생성
   */
  generateVoiceInstructions() {
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
  generateSSMLContent(dialogue) {
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
  addSSMLTags(content, emotions, emphasis) {
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
   * 발음 가이드 생성
   */
  generatePronunciationGuide(dialogue) {
    const pronunciationMap = {
      '황남대총': '황남대총',
      '곡옥': '고곡',
      '세계수': '세계수',
      '국보': '국보',
      '큐레이터': '큐레이터',
      '신라': '실라'
    };
    
    const guides = [];
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
  calculateAudioMetadata(dialogue) {
    const totalChars = dialogue.reduce((sum, line) => sum + line.content.length, 0);
    
    // 한국어 TTS 기준: 분당 약 180-220자 (자연스러운 속도)
    const avgCharsPerMinute = 200;
    const estimatedMinutes = totalChars / avgCharsPerMinute;
    
    // 휴지 시간 계산 (화자 변경, 문장 끝 등)
    const pauseTime = dialogue.length * 0.8 + (dialogue.length * 0.5); // 초 단위
    
    const totalDuration = Math.ceil((estimatedMinutes * 60) + pauseTime);
    
    // 자연스러운 휴지 지점 생성
    const pauseInstructions = [];
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
      averageWPM: Math.round(totalChars / estimatedMinutes / 5),
      pauseInstructions
    };
  }

  /**
   * 헬퍼 메소드들
   */
  extractEmotions(content) {
    const emotions = [];
    
    if (/[와우헉]/.test(content)) emotions.push('surprise');
    if (/\?/.test(content)) emotions.push('curiosity');
    if (/정말|진짜|놀라운/.test(content)) emotions.push('amazement');
    if (/그런데|하지만/.test(content)) emotions.push('transition');
    if (/청취자|여러분/.test(content)) emotions.push('engagement');
    
    return emotions;
  }

  extractEmphasis(content) {
    const emphasis = [];
    
    if (/\d+(?:,\d{3})*(?:\.\d+)?\s*(cm|kg|년|세기|층|명|개|호)/.test(content)) {
      emphasis.push('numbers');
    }
    
    if (/(국보|세계수|황남대총|곡옥|신라)/.test(content)) {
      emphasis.push('technical_terms');
    }
    
    if (/[!]{2,}/.test(content)) {
      emphasis.push('exclamation');
    }
    
    return emphasis;
  }

  getSpeakerName(speaker) {
    return speaker === 'host' ? '진행자' : '큐레이터';
  }

  generateMetadata(originalScript, userScript, ttsScript, chapterInfo) {
    return {
      generatedAt: new Date().toISOString(),
      chapterIndex: chapterInfo.chapterIndex,
      museumName: chapterInfo.museumName,
      qualityScore: 0,
      wordCount: {
        user: userScript.dialogue.reduce((sum, line) => sum + line.content.length, 0),
        tts: originalScript.length
      },
      estimatedReadingTime: Math.ceil(userScript.dialogue.reduce((sum, line) => sum + line.content.length, 0) / 300),
      estimatedListeningTime: ttsScript.audioMetadata.totalDuration
    };
  }

  /**
   * 사용자 스크립트를 HTML로 포맷팅 (자막 표시용)
   */
  formatUserScriptAsHTML(userScript) {
    const dialogueHTML = userScript.dialogue.map(line => `
      <div class="dialogue-line" data-speaker="${line.speaker}">
        <div class="speaker-name speaker-${line.speaker}"><strong>${line.speakerName}</strong></div>
        <div class="speaker-content">${line.content}</div>
      </div>
    `).join('\n');

    return `
      <div class="podcast-script">
        <div class="script-header">
          <h3>${userScript.title}</h3>
          <div class="script-meta">
            <span class="duration">📖 ${userScript.duration}</span>
            <span class="speakers">🎙️ ${userScript.speakers.join(' & ')}</span>
          </div>
        </div>
        <div class="dialogue-container">
          ${dialogueHTML}
        </div>
      </div>
    `;
  }

  /**
   * TTS 스크립트 요약 (개발자용)
   */
  formatTTSScriptSummary(ttsScript) {
    const voiceSummary = ttsScript.voiceInstructions.map(v => 
      `${v.speaker}: ${v.voiceProfile.gender}, ${v.voiceProfile.tone}`
    ).join(' / ');
    
    const pronunciationSummary = ttsScript.pronunciation.map(p => 
      `${p.term} → ${p.pronunciation}`
    ).join(', ');

    return `
TTS 스크립트 요약:
📊 총 길이: ${Math.floor(ttsScript.audioMetadata.totalDuration / 60)}분 ${ttsScript.audioMetadata.totalDuration % 60}초
🎤 음성 설정: ${voiceSummary}
📝 발음 가이드: ${pronunciationSummary || '없음'}
⏸️ 휴지 지점: ${ttsScript.audioMetadata.pauseInstructions.length}개
🔊 SSML 길이: ${ttsScript.ssmlContent.length}자
    `;
  }
}

/**
 * 테스트 실행
 */
async function testDualScriptSystem() {
  console.log('🎙️ ════════════════════════════════════════════════════════');
  console.log('     이중 스크립트 시스템 테스트');
  console.log('     사용자용 챕터 스크립트 vs TTS용 오디오 스크립트');
  console.log('════════════════════════════════════════════════════════\n');

  // 1. 샘플 NotebookLM 스크립트 생성
  console.log('🎤 샘플 NotebookLM 스크립트 생성 중...');
  
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-pro',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    }
  });

  const samplePrompt = `
국립중앙박물관의 신라 금관에 대한 NotebookLM 스타일 짧은 대화를 만드세요.

**진행자:** 와, 이 금관 정말 화려하네요! 높이가 얼마나 되는 건가요?

**큐레이터:** 높이 27.5cm, 무게는 1kg입니다. 1973년 황남대총에서 발굴된 국보 191호죠.

이런 식으로 4-5번의 대화 교환을 만들어주세요. 구체적 사실과 자연스러운 감탄사를 포함해서요.
`;

  const result = await model.generateContent(samplePrompt);
  const sampleScript = result.response.text();
  
  console.log('✅ 샘플 스크립트 생성 완료');

  // 2. 이중 스크립트 생성
  console.log('\n🔧 이중 스크립트 변환 중...');
  
  const generator = new DualScriptGenerator();
  const dualScript = generator.generateDualScript(sampleScript, {
    title: '신라 금관의 비밀',
    chapterIndex: 1,
    museumName: '국립중앙박물관'
  });

  console.log('✅ 이중 스크립트 생성 완료');

  // 3. 결과 분석 및 출력
  console.log('\n📋 === 이중 스크립트 분석 결과 ===');
  
  console.log(`📊 원본 스크립트: ${sampleScript.length}자`);
  console.log(`👤 사용자 스크립트: ${dualScript.metadata.wordCount.user}자`);
  console.log(`🎤 TTS 스크립트: ${dualScript.metadata.wordCount.tts}자`);
  console.log(`📖 예상 읽기 시간: ${dualScript.metadata.estimatedReadingTime}분`);
  console.log(`🎧 예상 듣기 시간: ${Math.floor(dualScript.metadata.estimatedListeningTime / 60)}분 ${dualScript.metadata.estimatedListeningTime % 60}초`);

  // 4. 사용자 스크립트 표시 (자막/대본용)
  console.log('\n👥 === 사용자용 챕터 스크립트 (자막/대본) ===');
  const userHTML = generator.formatUserScriptAsHTML(dualScript.userScript);
  
  // HTML을 콘솔용으로 간단히 변환
  const userDisplay = dualScript.userScript.dialogue.map(line => 
    `**${line.speakerName}:** ${line.content}`
  ).join('\n\n');
  
  console.log(`제목: ${dualScript.userScript.title}`);
  console.log(`길이: ${dualScript.userScript.duration}`);
  console.log('---');
  console.log(userDisplay.substring(0, 800) + (userDisplay.length > 800 ? '\n... (중략) ...' : ''));

  // 5. TTS 스크립트 요약 (개발자용)
  console.log('\n🎤 === TTS용 오디오 스크립트 요약 ===');
  const ttsSummary = generator.formatTTSScriptSummary(dualScript.ttsScript);
  console.log(ttsSummary);

  // 6. SSML 샘플
  console.log('\n🔊 === SSML 스크립트 샘플 ===');
  const ssmlPreview = dualScript.ttsScript.ssmlContent.substring(0, 500);
  console.log(ssmlPreview + (dualScript.ttsScript.ssmlContent.length > 500 ? '\n... (중략) ...' : ''));

  // 7. 차이점 분석
  console.log('\n🔍 === 사용자 vs TTS 스크립트 차이점 ===');
  
  const userText = dualScript.userScript.dialogue.map(d => d.content).join(' ');
  const originalText = sampleScript;
  
  console.log('📝 사용자 스크립트 특징:');
  console.log('   • 마크다운 굵기 표시 제거');
  console.log('   • 과도한 감탄사 정리');
  console.log('   • 깔끔한 문장 부호');
  console.log('   • 읽기 편한 포맷');
  
  console.log('🎙️ TTS 스크립트 특징:');
  console.log('   • SSML 태그 추가');
  console.log('   • 음성 감정 지시');
  console.log('   • 발음 가이드 포함');
  console.log('   • 휴지 시간 계산');

  // 8. 실용성 검증
  console.log('\n✅ === 실용성 검증 결과 ===');
  
  const userFriendly = userText.length < originalText.length * 0.9; // 10% 이상 간결해짐
  const ttsOptimized = dualScript.ttsScript.ssmlContent.includes('<emphasis>') || 
                       dualScript.ttsScript.ssmlContent.includes('<break>');
  const pronunciationReady = dualScript.ttsScript.pronunciation.length > 0;
  
  console.log(`📱 사용자 친화성: ${userFriendly ? '✅ 개선됨' : '❌ 개선 필요'}`);
  console.log(`🎤 TTS 최적화: ${ttsOptimized ? '✅ SSML 적용됨' : '❌ 추가 작업 필요'}`);
  console.log(`📚 발음 가이드: ${pronunciationReady ? '✅ ' + dualScript.ttsScript.pronunciation.length + '개 용어' : '❌ 없음'}`);

  console.log('\n🎯 === 결론 ===');
  if (userFriendly && ttsOptimized) {
    console.log('✅ 이중 스크립트 시스템이 성공적으로 작동합니다!');
    console.log('   • 사용자는 깔끔한 자막/대본을 볼 수 있습니다');
    console.log('   • TTS는 음성 최적화된 스크립트를 사용할 수 있습니다');
    console.log('   • 각각의 목적에 맞게 최적화되었습니다');
  } else {
    console.log('⚠️ 시스템 개선이 필요합니다');
    if (!userFriendly) console.log('   • 사용자 친화성 개선 필요');
    if (!ttsOptimized) console.log('   • TTS 최적화 개선 필요');
  }
}

if (require.main === module) {
  testDualScriptSystem()
    .then(() => {
      console.log('\n✨ 이중 스크립트 시스템 테스트 완료!\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 테스트 오류:', error);
      process.exit(1);
    });
}