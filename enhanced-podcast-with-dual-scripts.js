// 🎙️ 최종 통합: NotebookLM 스타일 + 이중 스크립트 시스템
// 사용자용 자막 스크립트와 TTS용 오디오 스크립트 분리 생성

const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

require('dotenv').config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const supabaseUrl = 'https://fajiwgztfwoiisgnnams.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y';

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 이중 스크립트 생성기 (통합 버전)
 */
class DualScriptGenerator {
  
  generateDualScript(originalScript, chapterInfo) {
    const parsedDialogue = this.parseOriginalScript(originalScript);
    const userScript = this.generateUserScript(parsedDialogue, chapterInfo);
    const ttsScript = this.generateTTSScript(parsedDialogue, chapterInfo);
    const metadata = this.generateMetadata(originalScript, userScript, ttsScript, chapterInfo);
    
    return { userScript, ttsScript, metadata };
  }

  parseOriginalScript(script) {
    const lines = script.split('\n').filter(line => line.trim());
    const dialogue = [];
    let lineId = 1;
    let currentSpeaker = null;
    let currentContent = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      const hostMatch = trimmedLine.match(/^\*\*진행자:\*\*\s*(.*)$/);
      const curatorMatch = trimmedLine.match(/^\*\*큐레이터:\*\*\s*(.*)$/);
      
      if (hostMatch || curatorMatch) {
        if (currentSpeaker && currentContent.trim()) {
          dialogue.push({
            id: lineId++,
            speaker: currentSpeaker,
            speakerName: this.getSpeakerName(currentSpeaker),
            content: currentContent.trim()
          });
        }
        
        currentSpeaker = hostMatch ? 'host' : 'curator';
        currentContent = (hostMatch ? hostMatch[1] : curatorMatch[1]) || '';
      } else if (currentSpeaker && trimmedLine) {
        currentContent += (currentContent ? ' ' : '') + trimmedLine;
      }
    }
    
    if (currentSpeaker && currentContent.trim()) {
      dialogue.push({
        id: lineId++,
        speaker: currentSpeaker,
        speakerName: this.getSpeakerName(currentSpeaker),
        content: currentContent.trim()
      });
    }
    
    return dialogue;
  }

  generateUserScript(dialogue, chapterInfo) {
    const cleanedDialogue = dialogue.map(line => ({
      ...line,
      content: this.cleanForUserDisplay(line.content)
    }));
    
    const totalChars = cleanedDialogue.reduce((sum, line) => sum + line.content.length, 0);
    
    return {
      title: chapterInfo.title,
      duration: `약 ${Math.ceil(totalChars / 300)}분`,
      dialogue: cleanedDialogue,
      formatting: { speakerStyle: 'bold', lineBreaks: 'natural' }
    };
  }

  generateTTSScript(dialogue, chapterInfo) {
    const ssmlContent = this.generateSSMLContent(dialogue);
    const pronunciation = this.generatePronunciationGuide(dialogue);
    const audioMetadata = this.calculateAudioMetadata(dialogue);
    
    return {
      title: `${chapterInfo.title} (Audio)`,
      ssmlContent,
      pronunciation,
      audioMetadata
    };
  }

  cleanForUserDisplay(content) {
    return content
      .replace(/\b(와|우와|헉|어|음)\s*[!]*\s*/g, '$1 ')
      .replace(/\s{2,}/g, ' ')
      .replace(/([.!?])\s*([.!?])/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .trim();
  }

  generateSSMLContent(dialogue) {
    let ssml = '<speak>\n';
    
    dialogue.forEach((line, index) => {
      const voiceName = line.speaker === 'host' ? 'ko-KR-Standard-C' : 'ko-KR-Standard-A';
      const processedContent = this.addSSMLTags(line.content);
      
      ssml += `  <voice name="${voiceName}">\n    ${processedContent}\n  </voice>\n`;
      
      if (index < dialogue.length - 1 && dialogue[index + 1].speaker !== line.speaker) {
        ssml += '  <break time="800ms"/>\n';
      }
    });
    
    ssml += '</speak>';
    return ssml;
  }

  addSSMLTags(content) {
    return content
      .replace(/\b(와|우와|헉)\b[!]*/g, '<emphasis level="strong">$1</emphasis><break time="300ms"/>')
      .replace(/([^.!?]*\?)/g, '<prosody pitch="+10%">$1</prosody>')
      .replace(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*(cm|kg|년|세기|층|명|개|호)/g, '<emphasis level="moderate">$1$2</emphasis>')
      .replace(/([.!])\s*/g, '$1<break time="500ms"/>');
  }

  generatePronunciationGuide(dialogue) {
    const terms = { '황남대총': '황남대총', '곡옥': '고곡', '국보': '국보', '신라': '실라' };
    const fullText = dialogue.map(d => d.content).join(' ');
    
    return Object.entries(terms)
      .filter(([term]) => fullText.includes(term))
      .map(([term, pronunciation]) => ({ term, pronunciation, language: 'ko' }));
  }

  calculateAudioMetadata(dialogue) {
    const totalChars = dialogue.reduce((sum, line) => sum + line.content.length, 0);
    const estimatedSeconds = Math.ceil((totalChars / 200) * 60 + (dialogue.length * 1.3));
    
    return {
      totalDuration: estimatedSeconds,
      segmentCount: dialogue.length,
      pauseInstructions: dialogue
        .filter(line => line.content.includes('?') || /[와헉!]/.test(line.content))
        .map(line => ({ afterLine: line.id, duration: 600, type: 'natural' }))
    };
  }

  getSpeakerName(speaker) {
    return speaker === 'host' ? '진행자' : '큐레이터';
  }

  generateMetadata(original, user, tts, info) {
    return {
      generatedAt: new Date().toISOString(),
      chapterIndex: info.chapterIndex,
      museumName: info.museumName,
      wordCount: { user: user.dialogue.reduce((s, l) => s + l.content.length, 0), tts: original.length },
      estimatedReadingTime: Math.ceil(user.dialogue.reduce((s, l) => s + l.content.length, 0) / 300),
      estimatedListeningTime: tts.audioMetadata.totalDuration
    };
  }
}

/**
 * 통합 NotebookLM 스타일 팟캐스트 생성기
 */
class IntegratedNotebookLMPodcastGenerator {
  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-pro',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 32768,
      }
    });
    this.dualScriptGenerator = new DualScriptGenerator();
  }

  /**
   * 향상된 NotebookLM 스타일 프롬프트
   */
  createNotebookStylePrompt(museumName, curatorContent, chapterIndex, exhibition = null) {
    const isIntro = chapterIndex === 0;
    const chapterName = isIntro ? '인트로' : exhibition?.name;
    
    return `
# 🎙️ TripRadio NotebookLM 스타일 팟캐스트 생성

## 핵심 미션
Google NotebookLM Audio Overview의 실제 대화 패턴을 완벽 재현하여 
자연스럽고 매력적인 ${chapterName} 에피소드를 제작하세요.

## NotebookLM 핵심 특성

### 1. 높은 정보 밀도와 구체성
- 한 턴당 2-3개 구체적 사실 필수 포함
- 숫자의 체감화: "42만 점이면... 하루에 하나씩 봐도 1,150년"
- 비교와 연결: "축구장 18개 크기" / "여의도 공원 절반"

### 2. 자연스러운 대화 흐름
- 상호 완성: 한 사람이 말을 시작하면 다른 사람이 자연스럽게 완성
- 예상 가능한 인터럽션: "아, 그거..." / "맞아요, 그리고..."
- 정보 계층화: 기본 정보 → 흥미로운 디테일 → 놀라운 사실 순서

### 3. 청취자 중심 의식
- 메타 인식: "지금 청취자분들이 궁금해하실 텐데..."
- 참여 유도: "여러분도 상상해보세요..."
- 명확한 안내: "정리하면..." / "쉽게 말하면..."

## 품질 기준
- 길이: 4,000-5,000자
- 구체적 사실: 20-30개
- 청취자 언급: 5-7회
- 자연스러운 감탄사: 적절히 포함

## 필수 출력 형식
**진행자:** (대사)

**큐레이터:** (대사)

**진행자:** (대사)

**큐레이터:** (대사)

**지금 바로 NotebookLM 스타일 ${chapterName} 에피소드를 제작하세요!**
`;
  }

  /**
   * 큐레이터 콘텐츠 생성
   */
  async generateCuratorContent(museumName) {
    console.log('📚 큐레이터 전문 콘텐츠 준비 중...');
    
    const prompt = `
${museumName}의 수석 큐레이터로서 팟캐스트를 위한 전문 콘텐츠를 준비하세요.

다음 JSON 형식으로 출력하세요:

\`\`\`json
{
  "museum_name": "${museumName}",
  "overview_summary": "전시관1 (작품1, 작품2, 작품3)\\n전시관2 (작품1, 작품2, 작품3)",
  "exhibitions": [
    {
      "id": 1,
      "name": "전시관명",
      "floor": "위치",
      "theme": "주제",
      "artworks": [
        {
          "name": "작품명",
          "basic_info": "크기, 재료, 연도 등",
          "story": "작품에 얽힌 이야기"
        }
      ],
      "next_direction": "다음 전시관으로 가는 구체적 경로"
    }
  ]
}
\`\`\`
`;
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      
      if (jsonMatch) {
        const content = JSON.parse(jsonMatch[1]);
        console.log(`   ✅ ${content.exhibitions?.length || 0}개 전시관 정보 준비 완료`);
        return content;
      } else {
        throw new Error('JSON 형식을 찾을 수 없음');
      }
    } catch (error) {
      console.log('   ⚠️ 기본 구조 사용...');
      return this.getDefaultCuratorContent(museumName);
    }
  }

  /**
   * 이중 스크립트 포함 에피소드 생성
   */
  async generateDualScriptEpisode(curatorContent, chapterIndex, exhibition = null) {
    const chapterName = chapterIndex === 0 ? '인트로' : exhibition?.name;
    console.log(`   🎤 ${chapterName} 이중 스크립트 생성 중...`);
    
    // 1. NotebookLM 스타일 원본 스크립트 생성
    const prompt = this.createNotebookStylePrompt(curatorContent.museum_name, curatorContent, chapterIndex, exhibition);
    const result = await this.model.generateContent(prompt);
    const originalScript = result.response.text();
    
    // 2. 포맷팅 적용
    const formattedScript = this.enhancedFormatPodcastScript(originalScript);
    
    // 3. 이중 스크립트 생성
    const dualScript = this.dualScriptGenerator.generateDualScript(formattedScript, {
      title: chapterName,
      chapterIndex,
      museumName: curatorContent.museum_name
    });
    
    // 4. 품질 검증
    const validation = this.validateNotebookStyle(formattedScript);
    
    console.log(`   ✅ ${chapterName} 완료 (원본: ${originalScript.length}자, 사용자: ${dualScript.metadata.wordCount.user}자)`);
    console.log(`   📊 품질 점수: ${validation.score}/100`);
    
    return {
      originalScript: formattedScript,
      userScript: dualScript.userScript,
      ttsScript: dualScript.ttsScript,
      metadata: dualScript.metadata,
      validation: validation,
      duration: Math.round(formattedScript.length / 300 * 60)
    };
  }

  /**
   * 전체 팟캐스트 생성 (이중 스크립트 포함)
   */
  async generateIntegratedPodcast(museumName) {
    const startTime = Date.now();
    
    try {
      console.log('\n🎙️ === TripRadio 통합 NotebookLM 팟캐스트 제작 ===\n');
      
      // 1. 큐레이터 콘텐츠 준비
      const curatorContent = await this.generateCuratorContent(museumName);
      
      // 2. 이중 스크립트 에피소드 생성
      console.log('\n🎤 이중 스크립트 에피소드 제작 중...');
      const episodes = [];
      const validationResults = [];
      
      // 인트로 에피소드
      const introEpisode = await this.generateDualScriptEpisode(curatorContent, 0);
      episodes.push({
        id: 0,
        title: `${museumName} 여행 시작`,
        type: 'podcast_intro',
        userScript: introEpisode.userScript,
        ttsScript: introEpisode.ttsScript,
        originalNarrative: introEpisode.originalScript, // 기존 호환성
        narrative: this.formatUserScriptAsText(introEpisode.userScript), // 사용자용
        duration: introEpisode.duration,
        qualityScore: introEpisode.validation.score,
        dualScriptMetadata: introEpisode.metadata
      });
      validationResults.push(introEpisode.validation);
      
      // 전시관별 에피소드 (최대 2개)
      for (let i = 0; i < Math.min(curatorContent.exhibitions?.length || 0, 2); i++) {
        const exhibition = curatorContent.exhibitions[i];
        const episodeResult = await this.generateDualScriptEpisode(curatorContent, i + 1, exhibition);
        
        episodes.push({
          id: i + 1,
          title: exhibition.name,
          type: 'podcast_episode',
          content: `${exhibition.name}: ${exhibition.artworks?.map(a => a.name).slice(0, 3).join(', ') || exhibition.theme}`,
          userScript: episodeResult.userScript,
          ttsScript: episodeResult.ttsScript,
          originalNarrative: episodeResult.originalScript,
          narrative: this.formatUserScriptAsText(episodeResult.userScript),
          duration: episodeResult.duration,
          exhibition_data: exhibition,
          qualityScore: episodeResult.validation.score,
          dualScriptMetadata: episodeResult.metadata
        });
        validationResults.push(episodeResult.validation);
        
        // API 호출 간격
        if (i < Math.min(curatorContent.exhibitions.length - 1, 1)) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // 품질 분석
      const avgQualityScore = Math.round(
        validationResults.reduce((sum, v) => sum + v.score, 0) / validationResults.length
      );
      
      const totalOriginalChars = episodes.reduce((sum, ep) => sum + ep.originalNarrative.length, 0);
      const totalUserChars = episodes.reduce((sum, ep) => sum + (ep.dualScriptMetadata?.wordCount.user || 0), 0);
      const generationTime = Date.now() - startTime;
      
      console.log('\n📊 === 통합 NotebookLM 팟캐스트 제작 완료 ===');
      console.log(`   🎙️ 총 에피소드: ${episodes.length}개`);
      console.log(`   📝 원본 스크립트: ${totalOriginalChars.toLocaleString()}자`);
      console.log(`   👤 사용자 스크립트: ${totalUserChars.toLocaleString()}자 (${Math.round((1 - totalUserChars/totalOriginalChars) * 100)}% 간소화)`);
      console.log(`   🏆 평균 품질 점수: ${avgQualityScore}/100`);
      console.log(`   ⏱️ 제작 시간: ${Math.round(generationTime/1000)}초`);
      
      return {
        success: true,
        podcastData: {
          museum_name: museumName,
          overview_summary: curatorContent.overview_summary,
          episodes: episodes,
          total_characters: {
            original: totalOriginalChars,
            user: totalUserChars
          },
          podcast_info: {
            title: `TripRadio ${museumName} NotebookLM 이중 스크립트`,
            hosts: ['진행자', `${museumName} 수석 큐레이터`],
            format: '대화형 팟캐스트 (이중 스크립트)',
            style: 'Google NotebookLM 스타일',
            features: ['사용자용 자막 스크립트', 'TTS용 오디오 스크립트', '품질 자동 검증']
          },
          quality_metrics: {
            average_score: avgQualityScore,
            individual_scores: validationResults.map(v => v.score),
            total_issues: validationResults.reduce((sum, v) => sum + v.issues.length, 0),
            passes_standard: avgQualityScore >= 75
          },
          dual_script_benefits: {
            user_friendliness: Math.round((1 - totalUserChars/totalOriginalChars) * 100) + '% 간소화',
            tts_optimization: 'SSML 태그 및 발음 가이드 포함',
            separate_purposes: '자막용 vs 음성용 최적화'
          }
        }
      };
      
    } catch (error) {
      console.error('❌ 통합 팟캐스트 생성 실패:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 사용자 스크립트를 일반 텍스트로 변환 (기존 호환성)
   */
  formatUserScriptAsText(userScript) {
    return userScript.dialogue.map(line => 
      `**${line.speakerName}:** ${line.content}`
    ).join('\n\n');
  }

  /**
   * 강화된 포맷팅 (기존 함수 유지)
   */
  enhancedFormatPodcastScript(rawScript) {
    let formatted = rawScript;
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    formatted = formatted.replace(/^\s+|\s+$/g, '');
    formatted = formatted.replace(/\*\*HOST:\*\*/g, '\n**진행자:**');
    formatted = formatted.replace(/\*\*CURATOR:\*\*/g, '\n**큐레이터:**');
    formatted = formatted.replace(/HOST:/g, '\n**진행자:**');
    formatted = formatted.replace(/CURATOR:/g, '\n**큐레이터:**');
    formatted = formatted.replace(/(\*\*[^*]+\*\*)/g, '\n$1\n');
    formatted = formatted.replace(/\n\*\*진행자:\*\*/g, '\n\n**진행자:**');
    formatted = formatted.replace(/\n\*\*큐레이터:\*\*/g, '\n\n**큐레이터:**');
    return formatted;
  }

  /**
   * 품질 검증 (기존 함수 유지)
   */
  validateNotebookStyle(script) {
    const issues = [];
    const scores = {};
    
    if (!script.includes('**진행자:**') || !script.includes('**큐레이터:**')) {
      issues.push('화자 구분 누락');
    }
    
    const factPatterns = [
      /\d+(?:,\d{3})*(cm|kg|년|세기|층|점|명|개)/g,
      /국보\s*\d+호/g,
      /\d{4}년/g
    ];
    
    const factCount = factPatterns.reduce((count, pattern) => 
      count + (script.match(pattern) || []).length, 0
    );
    
    scores.informationDensity = Math.min(100, (factCount / (script.length / 1000 * 8)) * 100);
    
    if (factCount < 8) issues.push(`구체적 사실 부족 (${factCount}/8)`);
    
    const engagementCount = ['청취자', '여러분'].reduce((count, pattern) => 
      count + (script.match(new RegExp(pattern, 'g')) || []).length, 0
    );
    
    scores.audienceEngagement = Math.min(100, (engagementCount / 5) * 100);
    if (engagementCount < 5) issues.push(`청취자 참여 부족 (${engagementCount}/5)`);
    
    const naturalCount = ['와', '헉', '정말', '아'].reduce((count, pattern) => 
      count + (script.match(new RegExp(pattern, 'g')) || []).length, 0
    );
    
    scores.naturalness = Math.min(100, (naturalCount / 8) * 100);
    if (naturalCount < 8) issues.push(`자연스러운 표현 부족 (${naturalCount}/8)`);
    
    const overallScore = Math.round(
      (scores.informationDensity + scores.audienceEngagement + scores.naturalness) / 3
    );
    
    return {
      isValid: issues.length === 0 && overallScore >= 75,
      score: overallScore,
      issues,
      scores: Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, Math.round(v)]))
    };
  }

  /**
   * 기본 큐레이터 콘텐츠 (폴백)
   */
  getDefaultCuratorContent(museumName) {
    return {
      museum_name: museumName,
      overview_summary: '선사·고대관 (금관, 토기, 청동기)\n역사관 (조선왕조실록, 백자, 인장)',
      exhibitions: [
        {
          id: 1,
          name: '선사·고대관',
          floor: '1층',
          theme: '구석기부터 통일신라까지',
          artworks: [{ name: '금관', basic_info: '높이 27.5cm, 5세기', story: '신라 왕족의 권위를 상징' }],
          next_direction: '전시관을 나와 복도를 따라 다음 전시관으로'
        }
      ]
    };
  }
}

/**
 * GuideData 변환 (이중 스크립트 지원)
 */
function convertToGuideData(podcastData) {
  return {
    overview: {
      title: podcastData.podcast_info.title,
      location: podcastData.museum_name,
      summary: `${podcastData.museum_name}을 진행자와 큐레이터가 NotebookLM 스타일로 소개하는 이중 스크립트 팟캐스트`,
      keyFeatures: podcastData.overview_summary,
      background: `TripRadio 이중 스크립트 시스템: 사용자는 깔끔한 자막을, TTS는 최적화된 음성 스크립트를 활용합니다.`,
      narrativeTheme: 'NotebookLM 스타일 대화 + 이중 스크립트 시스템',
      visitInfo: {
        duration: `${Math.round(podcastData.episodes.reduce((sum, ep) => sum + ep.duration, 0) / 60)}분`,
        format: 'NotebookLM 스타일 이중 스크립트 팟캐스트',
        qualityScore: `${podcastData.quality_metrics?.average_score || 0}/100`,
        dualScriptInfo: podcastData.dual_script_benefits
      }
    },
    route: {
      steps: podcastData.episodes.map((episode, index) => ({
        stepNumber: index + 1,
        title: episode.title,
        description: episode.content || `${episode.title} 에피소드`,
        duration: `${Math.round(episode.duration / 60)}분`,
        format: episode.type === 'podcast_intro' ? 'NotebookLM 인트로' : 'NotebookLM 대화',
        dualScript: {
          userVersion: `${episode.dualScriptMetadata?.wordCount.user || 0}자 (자막용)`,
          ttsVersion: `SSML 포함 (음성용)`
        }
      }))
    },
    realTimeGuide: { 
      chapters: podcastData.episodes.map(ep => ({
        ...ep,
        nextDirection: ep.exhibition_data?.next_direction || '다음 에피소드로 계속',
        location: {
          lat: 37.5240 + (Math.random() - 0.5) * 0.002,
          lng: 126.9800 + (Math.random() - 0.5) * 0.002
        },
        dualScriptEnabled: true,
        userScript: ep.userScript,
        ttsScript: ep.ttsScript
      }))
    },
    metadata: {
      originalLocationName: podcastData.museum_name,
      generatedAt: new Date().toISOString(),
      version: '3.0-dual-script',
      language: 'ko',
      guideId: `dual-script-${podcastData.museum_name.replace(/\s+/g, '-')}-${Date.now()}`,
      format: 'podcast',
      style: 'NotebookLM + Dual Script',
      dualScriptMetrics: {
        originalChars: podcastData.total_characters.original,
        userChars: podcastData.total_characters.user,
        compressionRate: Math.round((1 - podcastData.total_characters.user / podcastData.total_characters.original) * 100) + '%'
      }
    }
  };
}

/**
 * DB 저장 (이중 스크립트 지원)
 */
async function saveToDatabase(guideData) {
  const dbRecord = {
    locationname: guideData.metadata.originalLocationName,
    language: 'ko',
    data: guideData,
    content: guideData,
    coordinates: guideData.realTimeGuide.chapters.map(ch => ({
      chapterId: ch.id,
      title: ch.title,
      latitude: ch.location?.lat || 37.5240,
      longitude: ch.location?.lng || 126.9800,
      accuracy: 0.95,
      dualScriptEnabled: true
    })),
    metadata: guideData.metadata,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('guides')
    .insert([dbRecord])
    .select('*');

  if (error) throw error;
  return data[0];
}

/**
 * 메인 실행
 */
async function main() {
  console.log('🎙️ ══════════════════════════════════════════════════════════════════');
  console.log('     TripRadio.AI 최종 통합 시스템');
  console.log('     NotebookLM 스타일 + 이중 스크립트 (사용자/TTS 분리)');
  console.log('══════════════════════════════════════════════════════════════════\n');

  const generator = new IntegratedNotebookLMPodcastGenerator();
  
  // 통합 팟캐스트 생성
  const result = await generator.generateIntegratedPodcast('국립중앙박물관');
  
  if (!result.success) {
    console.error('❌ 생성 실패:', result.error);
    return;
  }

  // GuideData 변환
  const guideData = convertToGuideData(result.podcastData);
  
  console.log('\n💾 데이터베이스 저장 중...');
  
  try {
    const savedGuide = await saveToDatabase(guideData);
    
    console.log('\n✅ === 최종 통합 팟캐스트 저장 완료! ===');
    console.log(`   📻 Guide ID: ${savedGuide.id}`);
    
    const guideUrl = `http://localhost:3000/guide/ko/${encodeURIComponent(savedGuide.locationname)}`;
    console.log(`\n🌐 통합 팟캐스트 URL:`);
    console.log(`   ${guideUrl}`);
    
    console.log('\n🎧 최종 시스템 특징:');
    console.log(`   🎙️ 스타일: ${result.podcastData.podcast_info.style}`);
    console.log(`   📱 이중 스크립트: ${result.podcastData.dual_script_benefits.user_friendliness} + TTS 최적화`);
    console.log(`   🏆 품질: ${result.podcastData.quality_metrics.average_score}/100`);
    console.log(`   📊 에피소드: ${result.podcastData.episodes.length}개`);
    console.log(`   ⏱️ 총 재생시간: 약 ${Math.round(result.podcastData.episodes.reduce((sum, ep) => sum + ep.duration, 0) / 60)}분`);

    console.log('\n🎯 이중 스크립트 혜택:');
    console.log(`   👤 사용자: ${result.podcastData.dual_script_benefits.user_friendliness} 더 읽기 쉬운 자막`);
    console.log(`   🎤 TTS: ${result.podcastData.dual_script_benefits.tts_optimization}`);
    console.log(`   🎨 목적별 최적화: ${result.podcastData.dual_script_benefits.separate_purposes}`);

  } catch (error) {
    console.error('❌ DB 저장 실패:', error);
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🎉 최종 통합 시스템 완료!');
      console.log('   ✅ NotebookLM 스타일 대화 생성');
      console.log('   ✅ 사용자용 자막 스크립트 (간소화됨)');
      console.log('   ✅ TTS용 오디오 스크립트 (SSML 최적화)');
      console.log('   ✅ 자동 품질 검증 시스템');
      console.log('   ✅ 완전한 DB 통합');
      console.log('\n   이제 사용자는 깔끔한 자막을 보면서');
      console.log('   최적화된 음성으로 박물관을 경험할 수 있습니다! 🎧🏛️\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 실행 오류:', error);
      process.exit(1);
    });
}