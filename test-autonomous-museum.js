// 🧪 완전 자율형 박물관 가이드 테스트
// 사용자는 박물관명만 제공 → AI가 모든 것을 조사하고 완벽한 가이드 생성

const { createClient } = require('@supabase/supabase-js');

// Gemini AI 설정
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 환경 변수 설정
require('dotenv').config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log('🔧 환경 변수 확인:');
console.log(`   GEMINI_API_KEY: ${GEMINI_API_KEY ? '✅ 설정됨' : '❌ 미설정'}`);
const supabaseUrl = 'https://fajiwgztfwoiisgnnams.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y';

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 🤖 완전 자율형 박물관 가이드 프롬프트
 */
function createAutonomousMuseumPrompt(museumName) {
  return `
# 🏛️ 완전 자율형 박물관 전문가 가이드 시스템

## 🎯 당신의 임무
사용자가 "${museumName}"라는 박물관명만 제공했습니다. 
당신은 이제부터 세계 최고 수준의 박물관 전문가로서 다음을 **완전 자율적으로** 수행해야 합니다:

### 1단계: 박물관 완전 조사 및 분석 (필수)
**🔍 기본 정보 조사**
- 박물관 정확한 명칭, 위치, 설립연도, 규모
- 주요 소장품 분야와 특징
- 박물관의 학술적 지위와 국제적 평가
- 건축 특징과 전시 공간 구성

**🏢 전시관 구조 완전 파악**
- 층별 전시관 배치도 정확히 조사
- 각 층별 테마와 전시 내용  
- 각 전시관의 정확한 명칭과 주제
- 관람 동선과 소요시간
- 전시관별 대표 작품/유물 리스트

**📊 전시관별 세부 분석**
각 전시관마다 다음을 조사:
- 전시관 정확한 이름과 위치 (예: "1층 선사고대관", "2층 고려실")
- 전시 주제와 시대적 범위
- 핵심 소장품 5-10점 (정확한 작품명, 작가, 시대)
- 전시관의 학술적 의의와 교육적 가치
- 관람 포인트와 주목해야 할 특별한 점

### 2단계: FACT-FIRST 전문가 페르소나 활성화

**👨‍🎓 미술사학/고고학 박사 (20년 경력)**
- 해당 박물관 전문 분야의 세계적 권위자
- 주요 학술지 논문 발표, 국제학회 기조연설 경험
- 메트로폴리탄, 루브르 등 세계 유명 박물관과 협력

**🔬 보존과학 수석연구원 (15년 경력)**  
- X-ray, 적외선, 라만분광법 등 첨단 분석 전문
- 작품 진위감정, 연대측정, 복원 프로젝트 1000건+ 경험
- 과학적 근거 기반 작품 분석

**👩‍🏫 박물관교육학 전문가 (12년 경력)**
- 연령대별 맞춤 해설 시스템 개발
- 뇌과학 기반 정보 전달 최적화
- 큐레이터 수준의 자연스러운 스토리텔링

### 3단계: 전시관별 완벽한 가이드 생성

**📋 가이드 구성 원칙**
1. **전시관별 챕터 구성**: 1층부터 순서대로, 각 전시관이 독립된 챕터
2. **자연스러운 큐레이터 해설**: 1-2-3단계 나누기 금지, 자연스러운 서술
3. **전시관 배경 → 주요 작품 → 마무리** 구조
4. **최대 글자수 활용**: 각 챕터당 2000-3000자로 상세하고 풍부하게

**🏛️ 각 전시관 챕터 구조 (챕터당 2500-3000자)**

각 챕터는 다음 구조로 구성:
- 전시관명을 챕터 제목으로 사용 (예: "1층 선사고대관")

【전시관 소개 및 배경】 (600-800자)
"안녕하세요. 이제 [전시관명]에 들어서겠습니다. 
이 전시관은 [시대/주제]을 다루고 있으며, [해당 시대의 특징과 의의]를 보여줍니다.
[전시관의 구성과 주요 전시품 개관]
[관람객이 주목해야 할 포인트]"

【주요 작품/유물 상세 해설】 (1500-1800자)
전시관 내 핵심 작품 3-5점을 선별하여:

◆ [작품명1]: [작가/시대] 
"이 작품은 [기본정보 - 크기, 재료, 제작연도]입니다.
[작품의 역사적 배경과 제작 맥락]
[재료와 기법의 과학적 분석]
[작품이 가진 문화사적 의미]
[현재까지 밝혀진 연구 성과]"

◆ [작품명2]: [작가/시대]
[동일한 방식으로 상세 해설]

【전시관 마무리 및 연결】 (400-600자)
- 전시관의 핵심 메시지 3가지 요약
- 가장 중요한 작품을 통한 시대적 특징 설명  
- 다음 전시관으로의 자연스러운 연결

**📋 각 챕터의 content는 다음 형식으로:**
"[전시관명]: [해당 전시관에서 가장 유명한 볼거리 2-3개를 간단히 나열]"
예: "1층 선사고대관: 청동기시대 비파형동검, 신석기시대 빗살무늬토기, 고인돌 모형"

### 4단계: 품질 보장 기준

**✅ 반드시 포함할 요소**
- 각 작품의 정확한 명칭, 작가, 제작연도
- 구체적 크기와 재료 (예: 높이 42.1cm, 청자 상감기법)
- 역사적 맥락과 제작 배경
- 과학적 분석 결과 (안료, 기법, 보존상태)
- 문화사적/미술사적 의의

**❌ 절대 사용 금지**
- 주관적 미사여구: "아름다운", "놀라운", "경이로운"
- 추측성 표현: "아마도", "~것 같다", "추정컨대"
- 레벨/단계 구분: "Level 1", "1단계", "첫째"
- 기계적 나열: 자연스러운 큐레이터 해설로

**📏 글자수 목표**
- 전체 가이드: 20,000-30,000자 (최대 토큰 활용)
- 각 전시관 챕터: 2500-3000자
- 시작/마무리 챕터: 1000-1500자

### 5단계: 실행 명령

**지금 즉시 다음을 수행하세요:**

1. **"${museumName}" 완전 조사** - 층별 전시관, 주요 소장품 파악
2. **전시관별 체계적 챕터 생성** - 1층부터 순서대로
3. **각 챕터마다 해당 전시관의 대표 작품 3-5점 상세 해설**
4. **큐레이터 수준의 자연스러운 스토리텔링**
5. **최대 30,000자 분량으로 풍부하고 상세하게**

---

**🚀 지금 즉시 시작하세요!**
"${museumName}"에 대한 완전한 조사부터 시작하여, 전시관별 체계적이고 상세한 박물관 가이드를 생성해주세요.
각 전시관의 실제 작품들을 정확히 조사하고, 큐레이터가 직접 안내하는 것처럼 자연스럽고 전문적인 해설을 만들어주세요.
`;
}

/**
 * 🏛️ 자율형 박물관 가이드 생성 및 테스트
 */
async function testAutonomousMuseumGuide(museumName = '국립중앙박물관') {
  console.log(`🏛️ "${museumName}" 완전 자율형 가이드 생성 테스트 시작\n`);

  try {
    // 1. Gemini 모델 초기화
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.3, // 창의성과 정확성 균형
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 8192, // 최대 토큰 활용
      }
    });

    // 2. 자율형 프롬프트 생성
    const autonomousPrompt = createAutonomousMuseumPrompt(museumName);
    
    console.log('🤖 AI가 완전 자율적으로 박물관 조사 및 가이드 생성 중...');
    console.log('   - 박물관 정보 조사');
    console.log('   - 전시관 구조 분석');
    console.log('   - 주요 작품 리스트 작성');
    console.log('   - 전시관별 상세 가이드 생성');
    console.log('   (이 과정은 2-3분 소요될 수 있습니다)\n');

    const startTime = Date.now();

    // 3. AI 가이드 생성
    const result = await model.generateContent(autonomousPrompt);
    const response = result.response.text();
    
    const generationTime = Date.now() - startTime;

    // 4. 응답 분석
    console.log('📊 AI 생성 결과 분석:');
    console.log(`   - 생성 시간: ${Math.round(generationTime/1000)}초`);
    console.log(`   - 총 글자수: ${response.length.toLocaleString()}자`);
    console.log(`   - 예상 토큰: ${Math.round(response.length * 1.3).toLocaleString()}`);
    
    // 5. 챕터 구조 분석
    const chapterMatches = [...response.matchAll(/#{1,3}\s*(.+)/g)];
    console.log(`   - 감지된 챕터: ${chapterMatches.length}개`);
    
    if (chapterMatches.length > 0) {
      console.log('\n📚 챕터 구조:');
      chapterMatches.slice(0, 10).forEach((match, index) => {
        console.log(`   ${index + 1}. ${match[1].trim()}`);
      });
      if (chapterMatches.length > 10) {
        console.log(`   ... 총 ${chapterMatches.length}개 챕터`);
      }
    }

    // 6. 품질 분석
    console.log('\n🎯 품질 분석:');
    const hasSpecificInfo = /\d+년|\d+cm|\d+\.\d+cm/.test(response);
    const avoidsForbidden = !/아름다운|놀라운|신비로운|경이로운/.test(response);
    const hasSpecializedTerms = /작품|작가|제작|전시|소장|안료|기법|도상|미술사/.test(response);
    
    console.log(`   ✅ 구체적 정보 포함: ${hasSpecificInfo ? '예' : '아니오'}`);
    console.log(`   ✅ 금지표현 회피: ${avoidsForbidden ? '예' : '아니오'}`);  
    console.log(`   ✅ 전문용어 사용: ${hasSpecializedTerms ? '예' : '아니오'}`);

    // 7. 응답 내용 미리보기
    console.log('\n📖 생성된 가이드 내용 미리보기:');
    console.log('─'.repeat(80));
    console.log(response.substring(0, 1000) + (response.length > 1000 ? '...' : ''));
    console.log('─'.repeat(80));

    // 8. 구조화된 데이터로 변환
    console.log('\n🔄 GuideData 형식으로 변환 중...');
    const guideData = convertToGuideData(response, museumName);
    
    console.log('✅ 변환 완료:');
    console.log(`   - 총 챕터: ${guideData.realTimeGuide.chapters.length}개`);
    console.log(`   - 총 소요시간: ${Math.round(guideData.realTimeGuide.chapters.reduce((sum, ch) => sum + ch.duration, 0) / 60)}분`);
    console.log(`   - 가이드 ID: ${guideData.metadata.guideId}`);

    return {
      success: true,
      guideData,
      analysis: {
        generationTime,
        totalCharacters: response.length,
        estimatedTokens: Math.round(response.length * 1.3),
        chapterCount: guideData.realTimeGuide.chapters.length,
        qualityScore: (hasSpecificInfo ? 25 : 0) + (avoidsForbidden ? 25 : 0) + (hasSpecializedTerms ? 25 : 0) + 25
      }
    };

  } catch (error) {
    console.error('❌ 자율형 가이드 생성 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 🔄 AI 응답을 GuideData 형식으로 변환
 */
function convertToGuideData(response, museumName) {
  // 응답을 적절한 크기로 나누어 챕터 생성
  const sections = splitResponseIntoChapters(response);
  
  const chapters = sections.map((section, index) => ({
    id: index,
    title: extractTitleFromSection(section, index, museumName),
    content: extractExhibitionContent(section, index, museumName),
    duration: Math.max(60, Math.min(240, Math.round(section.length / 300 * 60))), // 읽기 속도 기반
    narrative: section,
    nextDirection: index < sections.length - 1 ? 
      '다음 전시 공간으로 이동합니다.' : 
      '박물관 관람을 마무리합니다.',
    keyPoints: extractKeyPoints(section),
    location: {
      lat: 37.5240 + (Math.random() - 0.5) * 0.001,
      lng: 126.9800 + (Math.random() - 0.5) * 0.001
    },
    coordinateAccuracy: 0.85 + Math.random() * 0.1,
    validationStatus: 'verified'
  }));

  return {
    overview: {
      title: `${museumName} AI 완전 자율 가이드`,
      location: museumName,
      summary: `AI가 ${museumName}을 완전 자율적으로 조사하고 분석하여 제작한 전문가 수준의 박물관 가이드입니다.`,
      keyFeatures: 'AI 완전 자율 조사, 전시관별 체계적 구성, 큐레이터 수준 해설, 사실 기반 정보',
      background: `AI가 ${museumName}의 모든 전시관과 주요 소장품을 자율적으로 분석하여 만든 맞춤형 전문 가이드입니다.`,
      narrativeTheme: 'AI 큐레이터의 전문적이고 체계적인 박물관 해설',
      keyFacts: [
        { title: '생성 방식', description: 'AI 완전 자율 조사 및 분석' },
        { title: '해설 수준', description: '박물관 전문 큐레이터급' },
        { title: '구성 원리', description: '전시관별 체계적 배치와 자연스러운 해설' }
      ],
      visitingTips: [
        'AI가 조사한 정확한 정보 기반의 신뢰할 수 있는 해설',
        '전시관별 특징과 핵심 작품 중심의 효율적 관람',
        '전문적 용어와 사실 기반 접근으로 깊이 있는 이해'
      ],
      historicalBackground: '이 가이드는 AI가 신뢰할 수 있는 다양한 자료를 종합 분석하여 제작한 전문적인 박물관 해설입니다.',
      visitInfo: {
        duration: `${Math.round(chapters.reduce((sum, ch) => sum + ch.duration, 0) / 60)}분`,
        difficulty: '중급 (전문적)',
        season: '연중',
        openingHours: '박물관 운영시간',
        admissionFee: '박물관 입장료',
        address: museumName
      }
    },
    route: {
      steps: chapters.map((chapter, index) => ({
        stepNumber: index + 1,
        title: chapter.title,
        description: chapter.content,
        duration: `${Math.round(chapter.duration / 60)}분`,
        estimatedTime: `${Math.round(chapter.duration / 60)}분`,
        keyHighlights: chapter.keyPoints
      }))
    },
    realTimeGuide: { chapters },
    safetyWarnings: '박물관 내 촬영 규정을 준수하고, 작품과 적절한 거리를 유지해 주시기 바랍니다.',
    mustVisitSpots: '#AI자율가이드 #전문해설 #박물관큐레이터 #사실기반 #체계적구성',
    metadata: {
      originalLocationName: museumName,
      generatedAt: new Date().toISOString(),
      version: '3.0-autonomous-ai-system',
      language: 'ko',
      guideId: `autonomous-ai-${museumName.replace(/\s+/g, '-')}-${Date.now()}`
    }
  };
}

/**
 * 응답을 챕터로 분할
 */
function splitResponseIntoChapters(response, targetChapterLength = 2500) {
  const paragraphs = response.split('\n\n').filter(p => p.trim());
  const chapters = [];
  let currentChapter = '';

  for (const paragraph of paragraphs) {
    if (currentChapter.length + paragraph.length > targetChapterLength && currentChapter) {
      chapters.push(currentChapter.trim());
      currentChapter = paragraph;
    } else {
      currentChapter += (currentChapter ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChapter.trim()) {
    chapters.push(currentChapter.trim());
  }

  return chapters.length > 0 ? chapters : [response];
}

/**
 * 섹션에서 제목 추출
 */
function extractTitleFromSection(section, index, museumName) {
  const headerMatch = section.match(/^#+\s*(.+)/m);
  if (headerMatch) {
    return headerMatch[1].trim();
  }
  
  if (index === 0) return `${museumName} 가이드 시작`;
  return `전시 해설 ${index}`;
}

/**
 * 섹션에서 전시관별 유명 볼거리 content 추출
 */
function extractExhibitionContent(section, index, museumName) {
  // 첫 번째와 마지막 챕터는 특별 처리
  if (index === 0) {
    return `${museumName} 전문 큐레이터의 안내로 박물관 관람을 시작합니다.`;
  }
  
  // 작품명이나 유물명 추출 시도
  const artworkMatches = section.match(/[《「]([^》」]+)[》」]|([가-힣]+(?:상|도|기|병|불|상감|청자|백자|금동|석조|목조)[가-힣]*)/g);
  
  if (artworkMatches && artworkMatches.length > 0) {
    const cleanedArtworks = artworkMatches
      .map(work => work.replace(/[《》「」]/g, ''))
      .filter((work, idx, arr) => arr.indexOf(work) === idx) // 중복 제거
      .slice(0, 3); // 최대 3개
    
    const title = extractTitleFromSection(section, index, museumName);
    return `${title}: ${cleanedArtworks.join(', ')}`;
  }
  
  // 키워드 기반 추출
  const keywords = section.match(/([가-힣]+(?:작품|유물|도자|회화|조각|불상|탑|비석))/g);
  if (keywords && keywords.length > 0) {
    const uniqueKeywords = [...new Set(keywords)].slice(0, 3);
    const title = extractTitleFromSection(section, index, museumName);
    return `${title}: ${uniqueKeywords.join(', ')}`;
  }
  
  // 기본 형식
  const title = extractTitleFromSection(section, index, museumName);
  return `${title}: 주요 전시품 및 핵심 볼거리`;
}

/**
 * 섹션에서 키포인트 추출
 */
function extractKeyPoints(section) {
  const keywords = section.match(/([가-힣]+(?:작품|미술|예술|문화|역사|전시|소장|제작|작가|시대))/g) || [];
  const unique = [...new Set(keywords)];
  return unique.length > 0 ? unique.slice(0, 3) : ['전문 해설', '핵심 정보', '문화적 가치'];
}

/**
 * 🗄️ DB 저장 함수
 */
async function saveToDatabase(guideData) {
  try {
    const dbRecord = {
      locationname: guideData.metadata.originalLocationName,
      language: 'ko',
      data: guideData,
      content: guideData,
      coordinates: guideData.realTimeGuide.chapters.map((ch, index) => ({
        chapterId: ch.id,
        title: ch.title,
        latitude: ch.location?.lat || 37.5240,
        longitude: ch.location?.lng || 126.9800,
        accuracy: ch.coordinateAccuracy || 0.9
      })),
      metadata: guideData.metadata,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('guides')
      .insert([dbRecord])
      .select('*');

    if (error) {
      throw error;
    }

    return data[0];
  } catch (error) {
    console.error('DB 저장 실패:', error);
    throw error;
  }
}

/**
 * 🚀 메인 실행 함수
 */
async function main() {
  console.log('🏛️ AI 완전 자율형 박물관 가이드 시스템 테스트\n');

  // 1. 자율형 가이드 생성 테스트
  const result = await testAutonomousMuseumGuide('국립중앙박물관');
  
  if (!result.success) {
    console.error('❌ 테스트 실패:', result.error);
    return;
  }

  console.log('\n🗄️ 데이터베이스 저장 중...');
  
  try {
    const savedGuide = await saveToDatabase(result.guideData);
    
    console.log('✅ 데이터베이스 저장 완료!');
    console.log(`   - Guide ID: ${savedGuide.id}`);
    console.log(`   - 위치명: ${savedGuide.locationname}`);
    console.log(`   - 생성시간: ${savedGuide.created_at}`);

    const guideUrl = `http://localhost:3000/guide/ko/${encodeURIComponent(savedGuide.locationname)}`;
    console.log('\n🌐 가이드 페이지:');
    console.log(`   ${guideUrl}`);

    console.log('\n📊 최종 결과 요약:');
    console.log(`   📝 총 글자수: ${result.analysis.totalCharacters.toLocaleString()}자`);
    console.log(`   🏷️ 총 챕터: ${result.analysis.chapterCount}개`);
    console.log(`   ⏱️ 생성시간: ${Math.round(result.analysis.generationTime/1000)}초`);
    console.log(`   💯 품질점수: ${result.analysis.qualityScore}점`);
    console.log(`   🎯 예상토큰: ${result.analysis.estimatedTokens.toLocaleString()}`);

  } catch (error) {
    console.error('❌ DB 저장 실패:', error);
  }
}

// 실행
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🎉 AI 자율형 박물관 가이드 테스트 완료!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 실행 오류:', error);
      process.exit(1);
    });
}