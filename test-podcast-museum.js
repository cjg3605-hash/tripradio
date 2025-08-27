// 🎙️ TripRadio.AI 팟캐스트 형식 박물관 가이드 생성기
// Google NotebookLM 스타일의 대화형 오디오 가이드

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
 * 🎙️ 1단계: 박물관 구조 조사 및 큐레이터 콘텐츠 생성
 */
function createCuratorContentPrompt(museumName) {
  return `
# 📚 ${museumName} 큐레이터 전문 콘텐츠 생성

## 당신의 역할
${museumName}의 수석 큐레이터로서 팟캐스트를 위한 전문 콘텐츠를 준비합니다.

## 필수 조사 및 생성 항목

### 1. 박물관 전체 정보
- 박물관의 역사와 설립 배경
- 전체 소장품 규모와 특징
- 세계적으로 유명한 대표 소장품들
- 전시관 구성과 관람 동선

### 2. 전시관별 핵심 정보
각 전시관마다:
- 전시관명과 위치 (층수)
- 주요 테마와 시대
- 대표 작품 3-5점 상세 정보
- 흥미로운 에피소드나 최신 연구 성과
- 다음 전시관으로의 이동 경로

### 3. 팟캐스트용 토킹 포인트
- 일반인도 흥미를 느낄 만한 이야기
- 작품에 얽힌 역사적 사건이나 인물
- 최근 발견된 새로운 사실들
- 관람 팁과 숨은 명작들

### JSON 출력 형식
\`\`\`json
{
  "museum_name": "${museumName}",
  "overview_summary": "전시관1 (작품1, 작품2, 작품3)\\n전시관2 (작품1, 작품2, 작품3)\\n...",
  "museum_intro": {
    "history": "박물관의 역사와 설립 배경 (500자)",
    "significance": "문화적 중요성과 세계적 위상 (300자)",
    "highlights": ["대표 소장품1", "대표 소장품2", "대표 소장품3"],
    "visitor_tips": "관람 팁과 추천 코스"
  },
  "exhibitions": [
    {
      "id": 1,
      "name": "전시관명",
      "floor": "위치",
      "theme": "주제",
      "talking_points": {
        "main_topic": "이 전시관의 핵심 이야기",
        "interesting_facts": ["흥미로운 사실1", "흥미로운 사실2"],
        "must_see": ["꼭 봐야 할 작품1", "꼭 봐야 할 작품2"],
        "curator_insight": "큐레이터만 아는 특별한 정보"
      },
      "artworks": [
        {
          "name": "작품명",
          "basic_info": "크기, 재료, 연도 등",
          "story": "작품에 얽힌 이야기",
          "significance": "왜 중요한가"
        }
      ],
      "next_direction": "다음 전시관으로 가는 구체적 경로"
    }
  ],
  "podcast_themes": {
    "opening_hook": "팟캐스트 시작을 위한 흥미로운 질문이나 사실",
    "conversation_topics": ["대화 주제1", "대화 주제2", "대화 주제3"],
    "closing_message": "마무리 메시지"
  }
}
\`\`\`

**모든 정보는 팩트 기반으로 정확하게 조사하여 제공하세요!**
`;
}

/**
 * 🎤 2단계: NotebookLM 스타일 팟캐스트 대화 스크립트 생성
 */
function createPodcastScriptPrompt(curatorContent, chapterIndex, exhibition) {
  return `
# 🎙️ TripRadio 팟캐스트 - NotebookLM 스타일 대화 생성

## 설정
**팟캐스트**: TripRadio ${curatorContent.museum_name} 특별편
**출연진**: 
- 진행자(HOST): 호기심 많고 적극적인 진행자, 리스너 관점에서 날카로운 질문
- 큐레이터(CURATOR): ${curatorContent.museum_name} 수석 큐레이터, 깊이 있는 지식을 친근하게 전달

## NotebookLM 스타일 대화 특징

### 핵심 패턴
1. **높은 정보 밀도**: 한 대화 턴에 2-3개의 구체적 정보 포함
2. **자연스러운 인터럽션**: "아, 그거..." / "맞아요, 그리고..."
3. **상호 보완**: 서로의 말을 받아서 정보 추가 "그 얘기 나온 김에..."
4. **놀라움 공유**: "와 진짜요?" / "저도 이거 준비하면서 처음 알았는데..."
5. **메타 코멘트**: "청취자분들이 지금 궁금해하실 것 같은데..."

### 에피소드 정보
${chapterIndex === 0 ? `
**[인트로 에피소드]**
- 박물관 소개와 오늘의 여정 안내
- 첫 전시관으로 이동하며 기대감 조성
` : `
**[${exhibition.name} 에피소드]**
- 주제: ${exhibition.theme}
- 위치: ${exhibition.floor}
- 핵심 작품: ${exhibition.artworks?.map(a => a.name).join(', ')}
`}

## 스크립트 구조 (4,000-5,000자 - 정보 밀도 높게)

### 1. 오프닝 (500-600자)
${chapterIndex === 0 ? 
`HOST: "여러분 안녕하세요! TripRadio입니다. 오늘은 정말 특별한 곳, ${curatorContent.museum_name}에 와있는데요. 와... 일단 규모부터가..."
CURATOR: "안녕하세요, 큐레이터 김민수입니다. 네, 여기가 세계 6위 규모거든요. 연면적만 13만 제곱미터..."
HOST: "13만 제곱미터면 감이 안 오는데..."
CURATOR: "축구장 18개? 여의도 공원 절반 정도?"
HOST: "헉! 그 정도로 크다고요? 그럼 소장품은..."
CURATOR: "42만 점이 넘죠. 그 중에서 전시되는 건 1만 5천 점 정도고..."
HOST: "잠깐, 그럼 나머지는?"
CURATOR: "수장고에 있죠. 주기적으로 교체하면서 전시하고... 아, 그리고 이 건물 자체도 2005년에 용산으로 이전하면서..."` :
`HOST: "자, 이제 ${exhibition.name}으로 들어왔습니다. 어? 근데 여기 조명이..."
CURATOR: "아, 잘 보셨네요! ${exhibition.name}은 작품 보호를 위해서 조도를 50룩스 이하로..."
HOST: "50룩스면 얼마나 어두운 거예요?"
CURATOR: "일반 사무실이 500룩스 정도니까 1/10? 그래서 처음엔 어둡게 느껴지는데, 눈이 적응되면..."
HOST: "아~ 그래서 입구에서 잠깐 기다리라고... 근데 벌써 뭔가 반짝이는 게 보이는데요?"
CURATOR: "네, 바로 ${exhibition.artworks?.[0]?.name || '대표 작품'}이죠. 이게..."`
}

### 2. 메인 대화 (3,000-3,500자) - NotebookLM 스타일 고밀도 정보

**[작품 1 - 깊이 있는 대화]**
HOST: "오케이, 그럼 이제 본격적으로... 어? 저기 금빛으로 번쩍이는 게..."
CURATOR: "아, 네! 바로 그거예요. 국보 191호 황남대총 금관입니다."
HOST: "황남대총이요? 그게 어디..."
CURATOR: "경주요. 1973년에 발굴됐는데, 사실 이게 도굴되지 않은 무덤에서 나온 거라서..."
HOST: "아! 그래서 이렇게 완벽한 상태로..."
CURATOR: "맞아요. 높이 27.5센티미터, 지름 19센티미터... 근데 무게가 겨우 1킬로그램이에요."
HOST: "1킬로? 생각보다 가볍네요?"
CURATOR: "그죠? 실제로 착용하려고 만든 거니까. 근데 이 나뭇가지 모양 장식 보이시죠?"
HOST: "네네, 이게 뭔가 의미가..."
CURATOR: "세계수예요. 신라인들이 믿었던 우주관에서... 하늘과 땅을 연결하는 신성한 나무."
HOST: "오... 그래서 왕이 쓰는 거구나. 근데 이 비취색 구슬들은?"
CURATOR: "곡옥이라고 하는데, 이게 또 재밌는 게... 일본에서 수입한 거예요."
HOST: "엥? 그 시대에도 수입을?"
CURATOR: "5세기에 이미 활발한 국제 무역이... 실크로드를 통해서 로마 유리도 들어왔고..."

**[정보 보충 패턴]**
HOST: "잠깐, 그러면 이 금관이 실제로..."
CURATOR: "네, 실제로 썼어요. 근데 평상시가 아니라 특별한 의식 때만."
HOST: "아~ 그래서 이렇게 화려하게..."
CURATOR: "그리고 이거 알아요? 신라 금관이 지금까지 6개밖에 안 발견됐어요."
HOST: "6개뿐이에요?"
CURATOR: "네. 그 중에서도 이게 가장 화려하고... 아, 그리고 최근에 성분 분석을 했더니..."
HOST: "뭐가 나왔는데요?"
CURATOR: "순도 87%의 금에, 은이 10%, 구리가 3%... 이렇게 합금을 한 이유가..."
HOST: "강도 때문에?"
CURATOR: "정확해요! 순금은 너무 무르거든요. 그래서..."

**[에피소드 + 정보 융합]**
CURATOR: "아, 그리고 이거 발굴할 때 에피소드가 있는데..."
HOST: "오, 뭔데요?"
CURATOR: "황남대총이 사실 쌍분... 그러니까 무덤 두 개가 붙어있는 건데..."
HOST: "아, 부부 합장묘?"
CURATOR: "그렇게 생각했는데, 북쪽 무덤에서는 남자 유물, 남쪽에서는 여자 유물이 나왔어요."
HOST: "그럼 부부 맞네요?"
CURATOR: "그런데! 남쪽 무덤이 더 크고 부장품도 더 화려해요."
HOST: "어? 그럼 여자가 더 높은 신분이었다는..."
CURATOR: "그래서 일부 학자들은 이게 여왕의 무덤일 수도... 신라에는 선덕여왕, 진덕여왕도 있었잖아요."
HOST: "와, 그럼 이 금관을 여왕이 썼을 수도 있다는 거네요!"

### 3. 다음 이동 안내 (400-500자)
${exhibition?.next_direction ? 
`HOST: "시간이 벌써 이렇게! 다음은 어디로 가나요?"
CURATOR: "${exhibition.next_direction}. 거기서는..."
HOST: "오, 기대되는데요! 청취자분들, 우리 같이 이동해볼까요?"` :
`HOST: "와, 오늘 정말 많은 걸 배웠네요!"
CURATOR: "저도 즐거웠습니다. 청취자분들도 꼭 직접 오셔서..."
HOST: "TripRadio와 함께한 ${curatorContent.museum_name} 여행, 어떠셨나요?"`
}

## NotebookLM 스타일 특별 지침

### 정보 전달 방식
1. **단계적 놀라움**: "근데 이거 알아요? 더 놀라운 건..." 
2. **숫자의 체감화**: "42만 점이면... 하루에 하나씩 봐도 1,150년"
3. **연결과 확장**: "그 얘기가 나온 김에..." / "아, 그러고 보니..."
4. **청취자 참여**: "여러분도 상상해보세요..." / "지금 듣고 계신 분들 중에..."

### 자연스러운 대화 패턴  
- **인터럽션**: "아, 그거..." / "잠깐만요, 그럼..."
- **확인과 반복**: "그러니까 정리하면..." / "네네, 맞아요"
- **놀라움 공유**: "와, 저도 이번에 처음 알았는데..." 
- **메타 인식**: "아, 지금 청취자분들이 헷갈리실 수도..."

### 품질 기준
- **정보 밀도**: 4,000-5,000자에 20-30개 구체적 사실
- **대화 리듬**: 평균 1-2문장 교환, 긴 설명은 3-4문장 최대
- **청취자 언급**: 에피소드당 5-7회
- **감탄사/추임새**: 자연스럽게 포함하되 과하지 않게

### 실제 실행 지침
${chapterIndex === 0 ? `
**[인트로 미션]**: 
- 박물관 규모감을 체감할 수 있게 (축구장 비교 등)
- 오늘 여정의 기대감 조성
- 큐레이터의 전문성 어필
- 첫 전시관으로의 자연스러운 전환
` : `
**[${exhibition?.name || '전시관'} 미션]**:
- 전시관 특징을 첫 30초 안에 어필
- 대표작품 2-3개를 깊이 있게 다뤄라
- 각 작품마다 3-4개의 구체적 사실 포함
- 다음 전시관과의 연결점 제시
`}

## 출력 형식 (필수)
**화자별 구분을 명확하게 해주세요:**

**HOST:** (진행자 대사)

**CURATOR:** (큐레이터 대사)

**HOST:** (진행자 대사)

**CURATOR:** (큐레이터 대사)

**예시:**
**HOST:** "여러분 안녕하세요! TripRadio입니다."

**CURATOR:** "안녕하세요, 큐레이터 김민수입니다."

**HOST:** "와, 여기 정말 크네요?"

**CURATOR:** "네, 여기가 세계 6위 규모거든요."

**지금 ${chapterIndex === 0 ? 'NotebookLM 스타일 인트로' : 'NotebookLM 스타일 ' + (exhibition?.name || '전시관') + ' 에피소드'}를 **HOST:**와 **CURATOR:** 구분으로 제작하세요!**
`;
}

/**
 * 🎙️ TripRadio 팟캐스트 가이드 생성기
 */
class TripRadioPodcastGenerator {
  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-pro',
      generationConfig: {
        temperature: 0.7, // 대화를 더 자연스럽게
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 32768,
      }
    });
  }

  /**
   * 큐레이터 콘텐츠 생성
   */
  async generateCuratorContent(museumName) {
    console.log('📚 큐레이터 전문 콘텐츠 준비 중...');
    
    const prompt = createCuratorContentPrompt(museumName);
    const result = await this.model.generateContent(prompt);
    const response = result.response.text();

    // JSON 추출
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      console.log('   ⚠️ JSON 형식을 찾을 수 없습니다. 기본 구조 생성...');
      return this.getDefaultCuratorContent(museumName);
    }

    try {
      const content = JSON.parse(jsonMatch[1]);
      console.log(`   ✅ ${content.exhibitions?.length || 0}개 전시관 정보 준비 완료`);
      return content;
    } catch (error) {
      console.log('   ⚠️ JSON 파싱 실패. 기본 구조 사용...');
      return this.getDefaultCuratorContent(museumName);
    }
  }

  /**
   * 팟캐스트 스크립트 생성 및 화자별 포맷팅
   */
  async generatePodcastScript(curatorContent, chapterIndex, exhibition = null) {
    const chapterName = chapterIndex === 0 ? '인트로' : exhibition?.name;
    console.log(`   🎤 ${chapterName} 팟캐스트 스크립트 생성 중...`);
    
    const prompt = createPodcastScriptPrompt(curatorContent, chapterIndex, exhibition);
    const result = await this.model.generateContent(prompt);
    const rawScript = result.response.text();
    
    // 화자별 포맷팅 적용
    const formattedScript = this.formatPodcastScript(rawScript);
    
    console.log(`   ✅ ${chapterName} 완료 (${formattedScript.length.toLocaleString()}자)`);
    return formattedScript;
  }

  /**
   * 팟캐스트 스크립트를 화자별로 포맷팅
   */
  formatPodcastScript(rawScript) {
    let formatted = rawScript;
    
    // 기존 **HOST:** **CURATOR:** 패턴을 찾아서 포맷팅
    formatted = formatted.replace(/\*\*HOST:\*\*/g, '\n**진행자:**');
    formatted = formatted.replace(/\*\*CURATOR:\*\*/g, '\n**큐레이터:**');
    
    // 일반적인 HOST: CURATOR: 패턴도 포맷팅
    formatted = formatted.replace(/HOST:/g, '\n**진행자:**');
    formatted = formatted.replace(/CURATOR:/g, '\n**큐레이터:**');
    
    // 기타 포맷팅 정리
    formatted = formatted.replace(/\n{3,}/g, '\n\n'); // 과도한 줄바꿈 정리
    formatted = formatted.replace(/^\s+|\s+$/g, ''); // 앞뒤 공백 제거
    
    // 팟캐스트 자막 형식으로 시작 표시
    if (!formatted.includes('**진행자:**') && !formatted.includes('**큐레이터:**')) {
      formatted = '**진행자:** ' + formatted;
    }
    
    return formatted;
  }

  /**
   * 전체 팟캐스트 가이드 생성
   */
  async generateCompletePodcast(museumName) {
    const startTime = Date.now();
    
    try {
      // 1단계: 큐레이터 콘텐츠 준비
      console.log('\n🎙️ === TripRadio 팟캐스트 제작 시작 ===\n');
      const curatorContent = await this.generateCuratorContent(museumName);
      
      // 2단계: 팟캐스트 에피소드 생성
      console.log('\n🎤 팟캐스트 에피소드 녹음 중...');
      const episodes = [];
      
      // 인트로 에피소드
      const introScript = await this.generatePodcastScript(curatorContent, 0);
      episodes.push({
        id: 0,
        title: `${museumName} 여행 시작`,
        content: `TripRadio 팟캐스트: ${museumName} 특별편 인트로`,
        narrative: introScript,
        duration: Math.round(introScript.length / 300 * 60),
        type: 'podcast_intro'
      });
      
      // 전시관별 에피소드
      for (let i = 0; i < curatorContent.exhibitions?.length; i++) {
        const exhibition = curatorContent.exhibitions[i];
        const script = await this.generatePodcastScript(curatorContent, i + 1, exhibition);
        
        episodes.push({
          id: i + 1,
          title: exhibition.name,
          content: `${exhibition.name}: ${exhibition.artworks?.map(a => a.name).slice(0, 3).join(', ') || exhibition.theme}`,
          narrative: script,
          duration: Math.round(script.length / 300 * 60),
          type: 'podcast_episode',
          exhibition_data: exhibition
        });
        
        // API 호출 간격
        if (i < curatorContent.exhibitions.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      const totalCharacters = episodes.reduce((sum, ep) => sum + ep.narrative.length, 0);
      const generationTime = Date.now() - startTime;
      
      console.log('\n📊 === 팟캐스트 제작 완료 ===');
      console.log(`   🎙️ 총 에피소드: ${episodes.length}개`);
      console.log(`   📝 총 스크립트: ${totalCharacters.toLocaleString()}자`);
      console.log(`   ⏱️ 제작 시간: ${Math.round(generationTime/1000)}초`);
      
      return {
        success: true,
        podcastData: {
          museum_name: museumName,
          overview_summary: curatorContent.overview_summary,
          episodes: episodes,
          total_characters: totalCharacters,
          podcast_info: {
            title: `TripRadio ${museumName} 특별편`,
            hosts: ['진행자', `${museumName} 수석 큐레이터`],
            format: '대화형 팟캐스트',
            style: 'Google NotebookLM 스타일'
          }
        },
        analysis: {
          generationTime,
          totalCharacters,
          episodeCount: episodes.length
        }
      };
      
    } catch (error) {
      console.error('❌ 팟캐스트 생성 실패:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 기본 큐레이터 콘텐츠 (폴백)
   */
  getDefaultCuratorContent(museumName) {
    return {
      museum_name: museumName,
      overview_summary: '선사·고대관 (금관, 토기, 청동기)\n역사관 (조선왕조실록, 백자, 인장)',
      museum_intro: {
        history: `${museumName}은 우리나라를 대표하는 종합박물관입니다.`,
        significance: '5천년 역사의 정수를 보존하고 있습니다.',
        highlights: ['금관', '백자 달항아리', '반가사유상'],
        visitor_tips: '2-3시간 관람 추천'
      },
      exhibitions: [
        {
          id: 1,
          name: '선사·고대관',
          floor: '1층',
          theme: '구석기부터 통일신라까지',
          talking_points: {
            main_topic: '한반도 고대 문명의 발전',
            interesting_facts: ['세계에서 가장 정교한 금관', '5천년 전 빗살무늬토기'],
            must_see: ['신라 금관', '백제 금동대향로'],
            curator_insight: '금관의 나뭇가지 장식은 세계수를 상징합니다'
          },
          artworks: [
            {
              name: '금관',
              basic_info: '높이 27.5cm, 5세기',
              story: '신라 왕족의 권위를 상징',
              significance: '세계적인 금속공예 걸작'
            }
          ],
          next_direction: '전시관을 나와 복도를 따라 다음 전시관으로'
        }
      ],
      podcast_themes: {
        opening_hook: '1500년 전 신라 왕이 썼던 금관을 직접 볼 수 있다면?',
        conversation_topics: ['고대 한국의 금속 기술', '실크로드와 문화 교류', '최신 고고학 발견'],
        closing_message: '역사는 과거가 아니라 현재와 대화하는 것입니다'
      }
    };
  }
}

/**
 * GuideData 변환
 */
function convertToGuideData(podcastData) {
  return {
    overview: {
      title: podcastData.podcast_info.title,
      location: podcastData.museum_name,
      summary: `${podcastData.museum_name}을 진행자와 큐레이터가 함께 소개하는 특별한 팟캐스트 오디오 가이드`,
      keyFeatures: podcastData.overview_summary,
      background: `TripRadio가 제작한 ${podcastData.museum_name} 팟캐스트. Google NotebookLM 스타일의 자연스러운 대화로 박물관을 생생하게 경험하세요.`,
      narrativeTheme: '진행자와 큐레이터의 흥미진진한 박물관 투어',
      visitInfo: {
        duration: `${Math.round(podcastData.episodes.reduce((sum, ep) => sum + ep.duration, 0) / 60)}분`,
        difficulty: '쉬움 (팟캐스트 청취)',
        season: '연중',
        format: '대화형 팟캐스트'
      }
    },
    route: {
      steps: podcastData.episodes.map((episode, index) => ({
        stepNumber: index + 1,
        title: episode.title,
        description: episode.content,
        duration: `${Math.round(episode.duration / 60)}분`,
        format: episode.type === 'podcast_intro' ? '인트로' : '대화'
      }))
    },
    realTimeGuide: { 
      chapters: podcastData.episodes.map(ep => ({
        ...ep,
        nextDirection: ep.exhibition_data?.next_direction || '다음 에피소드로 계속',
        location: {
          lat: 37.5240 + (Math.random() - 0.5) * 0.002,
          lng: 126.9800 + (Math.random() - 0.5) * 0.002
        }
      }))
    },
    safetyWarnings: '팟캐스트를 들으며 관람하실 때는 주변을 잘 살피며 안전하게 이동하세요.',
    mustVisitSpots: '#TripRadio #팟캐스트가이드 #박물관토크 #큐레이터와함께',
    metadata: {
      originalLocationName: podcastData.museum_name,
      generatedAt: new Date().toISOString(),
      version: '1.0-podcast',
      language: 'ko',
      guideId: `podcast-${podcastData.museum_name.replace(/\s+/g, '-')}-${Date.now()}`,
      format: 'podcast',
      style: 'Google NotebookLM'
    }
  };
}

/**
 * DB 저장
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
      accuracy: 0.95
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
  console.log('🎙️ ═══════════════════════════════════════════════');
  console.log('     TripRadio.AI 팟캐스트 박물관 가이드 시스템');
  console.log('     Google NotebookLM 스타일 대화형 오디오 가이드');
  console.log('═══════════════════════════════════════════════════\n');

  const generator = new TripRadioPodcastGenerator();
  
  // 팟캐스트 생성
  const result = await generator.generateCompletePodcast('국립중앙박물관');
  
  if (!result.success) {
    console.error('❌ 생성 실패:', result.error);
    return;
  }

  // GuideData 변환
  const guideData = convertToGuideData(result.podcastData);
  
  console.log('\n💾 데이터베이스 저장 중...');
  
  try {
    const savedGuide = await saveToDatabase(guideData);
    
    console.log('\n✅ === TripRadio 팟캐스트 저장 완료! ===');
    console.log(`   📻 Guide ID: ${savedGuide.id}`);
    
    const guideUrl = `http://localhost:3000/guide/ko/${encodeURIComponent(savedGuide.locationname)}`;
    console.log(`\n🌐 팟캐스트 가이드 URL:`);
    console.log(`   ${guideUrl}`);
    
    console.log('\n🎧 팟캐스트 정보:');
    console.log(`   🎙️ 형식: ${result.podcastData.podcast_info.format}`);
    console.log(`   👥 출연: ${result.podcastData.podcast_info.hosts.join(' & ')}`);
    console.log(`   📻 스타일: ${result.podcastData.podcast_info.style}`);
    console.log(`   🎵 총 ${result.podcastData.episodes.length}개 에피소드`);
    console.log(`   ⏱️ 총 재생시간: 약 ${Math.round(result.podcastData.episodes.reduce((sum, ep) => sum + ep.duration, 0) / 60)}분`);

  } catch (error) {
    console.error('❌ DB 저장 실패:', error);
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🎉 TripRadio 팟캐스트 제작 완료!');
      console.log('   이제 진행자와 큐레이터의 생생한 대화로');
      console.log('   박물관을 즐겁게 경험할 수 있습니다! 🎧\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 실행 오류:', error);
      process.exit(1);
    });
}

module.exports = { TripRadioPodcastGenerator };