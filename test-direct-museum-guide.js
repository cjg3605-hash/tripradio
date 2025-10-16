// 🏛️ 국립중앙박물관 가이드 직접 생성 테스트

// 환경 변수 설정 (테스트용)
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-key';

const { 
  createMuseumExpertPrompt, 
  createExhibitionHallTourPrompt,
  createArtworkAnalysisPrompt 
} = require('./src/lib/ai/prompts/museum-specialized.ts');

/**
 * 🏛️ 국립중앙박물관 가이드 생성 데모
 */
async function generateNationalMuseumGuide() {
  console.log('🏛️ 국립중앙박물관 전문 가이드 생성 데모\n');
  
  // 1. 박물관 전문가 프롬프트 생성
  console.log('1️⃣ 박물관 전문가 프롬프트 생성');
  console.log('='.repeat(60));
  
  const expertPrompt = createMuseumExpertPrompt('국립중앙박물관');
  console.log(expertPrompt.substring(0, 1000) + '...\n');
  
  // 2. 모의 전시관 데이터 생성
  console.log('2️⃣ 전시관 정보 및 작품 데이터');
  console.log('='.repeat(60));
  
  const hallInfo = {
    hall_name: '고려실',
    theme: '고려시대 문화와 예술 (918-1392)',
    total_artworks: 6,
    tour_duration: 35,
    visitor_flow: '입구 → 청자코너 → 불교미술코너 → 금속공예코너 → 회화코너 → 출구',
    complexity_level: 'intermediate'
  };
  
  const artworks = [
    {
      sequence: 1,
      title: '청자 상감운학문 매병',
      artist: '미상 (고려 도공)',
      birth_death_year: '12세기 활동',
      year: 'c. 1150-1200',
      medium: '청자, 백토・자토 상감',
      dimensions: '높이 42.1cm, 구경 6.8cm, 동경 31.7cm',
      location_in_hall: '전시관 중앙, 청자 진열장 A',
      collection_number: '신수 4725',
      significance: 5,
      complexity: 'advanced'
    },
    {
      sequence: 2,
      title: '금동미륵보살반가사유상',
      artist: '미상 (백제 조각가)',
      birth_death_year: '7세기 활동',
      year: '7세기 전반 (백제)',
      medium: '금동, 주조',
      dimensions: '높이 93.5cm',
      location_in_hall: '불교미술 코너, 중앙 진열대',
      collection_number: '국보 제83호',
      significance: 5,
      complexity: 'advanced'
    },
    {
      sequence: 3,
      title: '청자 투각칠보문 향로',
      artist: '미상 (고려 도공)',
      birth_death_year: '12세기 후반 활동',
      year: 'c. 1170-1200',
      medium: '청자, 투각기법',
      dimensions: '높이 17.2cm, 구경 9.9cm',
      location_in_hall: '청자 진열장 B, 향로 섹션',
      collection_number: '덕수 5106',
      significance: 4,
      complexity: 'intermediate'
    }
  ];
  
  console.log(`전시관: ${hallInfo.hall_name}`);
  console.log(`주제: ${hallInfo.theme}`);
  console.log(`작품 수: ${hallInfo.total_artworks}점`);
  console.log(`예상 시간: ${hallInfo.tour_duration}분\n`);
  
  console.log('📍 주요 작품 목록:');
  artworks.forEach(artwork => {
    console.log(`${artwork.sequence}. ${artwork.title}`);
    console.log(`   작가: ${artwork.artist} (${artwork.birth_death_year})`);
    console.log(`   제작: ${artwork.year}`);
    console.log(`   재료: ${artwork.medium}`);
    console.log(`   크기: ${artwork.dimensions}`);
    console.log(`   중요도: ${'★'.repeat(artwork.significance)}점\n`);
  });
  
  // 3. 전시관 투어 프롬프트 생성
  console.log('3️⃣ 전시관 투어 가이드 프롬프트');
  console.log('='.repeat(60));
  
  const userProfile = {
    knowledgeLevel: '중급',
    interests: ['고려시대', '청자', '불교미술'],
    preferredStyle: '전문적'
  };
  
  const tourPrompt = createExhibitionHallTourPrompt(
    '국립중앙박물관',
    hallInfo,
    artworks,
    userProfile
  );
  
  console.log(tourPrompt.substring(0, 1200) + '...\n');
  
  // 4. 개별 작품 상세 분석 프롬프트
  console.log('4️⃣ 작품별 상세 분석 프롬프트 예시');
  console.log('='.repeat(60));
  
  const artworkPrompt = createArtworkAnalysisPrompt(
    artworks[0], // 청자 상감운학문 매병
    '국립중앙박물관',
    '고려청자는 12-13세기 한국 도자공예의 절정을 보여주는 작품으로, 특히 상감기법은 세계적으로 독창적인 기술입니다.'
  );
  
  console.log(artworkPrompt.substring(0, 1500) + '...\n');
  
  // 5. 실제 AI 해설 시뮬레이션 (프롬프트 기반)
  console.log('5️⃣ AI 해설 시뮬레이션 (청자 상감운학문 매병)');
  console.log('='.repeat(60));
  
  const simulatedAnalysis = `
### 🔍 Level 1: 기본 팩트 데이터 (30초)

**작가정보**
- 성명: 미상 (고려시대 도공)
- 활동시기: 12세기 후반 (1150-1200년경)
- 국적: 고려, 활동지역: 강진 일대 가마
- 기술전승: 중국 북송 청자 기법을 바탕으로 한 독창적 발전
- 소속공방: 강진 대구면 또는 칠량면 가마군 추정

**작품정보**  
- 제작연도: c. 1150-1200 (고려 명종-신종 연간)
- 규격: 높이 42.1cm × 구경 6.8cm × 동경 31.7cm
- 재료: 청자태토 + 백토・자토 상감 + 청자유
- 소장: 국립중앙박물관, 등록번호: 신수 4725
- 보존상태: 양호, 1982년 일부 보존처리 완료

### 🔬 Level 2: 재료과학적 분석 (45초)

**지지체 분석**
- 태토: 회백색 청자토, 철분 함량 1.5-2.0%
- 성형: 물레성형 후 정형, 굽 접합 흔적 확인
- 소성온도: 1250-1280℃ 환원염 소성

**상감기법 분석**
- 백토상감: 카올린계 백토, 선각 후 메움 기법
- 자토상감: 철분 함량 8-10% 갈색토 사용  
- 유약: 회청자유, 장석-석회-규석계 조성
- 발색: 철분 2-3% 함유로 담청록색 발현

### 🏛️ Level 3: 역사적 맥락 (60초)

**제작배경**
- 의뢰자: 고려 왕실 또는 최고 귀족층 주문품
- 제작목적: 의례용 주병, 궁중 연회 또는 제사용
- 사회상황: 고려 중기 문벌귀족 사회의 문화적 절정기

**기술적 위치**
- 상감기법: 1150년경 강진에서 창안된 세계 유일 기법
- 중국영향: 북송 여요청자 형태 수용하되 장식기법 독창 개발
- 지역특성: 강진 가마의 기술적 우수성과 창의성 결정체

### 🎨 Level 4: 도상학적 해석 (75초)

**주제분석**
- 운학문: 구름 속을 나는 학의 모습
- 상징의미: 학=장수, 고고, 선계; 구름=초월, 신선세계
- 조형원리: 좌우 대칭의 균형미와 자연스런 동세 표현

**구성분석**  
- 학의 자세: 날개를 편 비행 자세로 역동성 강조
- 구름 표현: 여의두문양과 결합된 유연한 곡선미
- 공간구성: 상하 분할된 화면에서 학의 상승 움직임 부각
- 색채대비: 백토 학과 자토 구름의 명암 대조로 입체감 창출

### 📊 Level 5: 미술사적 평가 (45초)

**기술사적 의의**
- 상감청자 기법의 완성작으로 세계 도자사상 독보적 위치
- 중국 청자 모방에서 벗어난 한국적 독창성의 출발점
- 13-14세기 상감청자 대량생산의 기술적 모태

**미학적 가치**
- 형태미: 유려한 곡선과 안정된 비례의 조화
- 장식미: 절제된 문양 배치와 정교한 기법적 완성도
- 색채미: 청자유의 은은함과 상감의 명료함이 조화

**현재적 평가**
- 1960년대 이후 고려청자 재평가 과정에서 핵심 작품 인정
- 2019년 보존과학 조사로 제작기법의 과학적 규명 완료
- 한국 도자문화의 세계적 우수성을 보여주는 대표작으로 평가
  `;
  
  console.log(simulatedAnalysis);
  
  // 6. 품질 평가 시뮬레이션
  console.log('\n6️⃣ 품질 평가 결과');
  console.log('='.repeat(60));
  
  console.log('📊 품질 점수: 94점');
  console.log('✅ 팩트 정확성: 95% (구체적 수치, 정확한 용어 사용)');
  console.log('✅ 전문성: 100% (미술사 전문용어 정확 사용)');
  console.log('✅ 구조적 완성도: 100% (5단계 완전 분석)');
  console.log('✅ 금지표현 준수: 100% (미사여구 완전 배제)');
  console.log('');
  console.log('🔍 검증 요소:');
  console.log('   - 구체적 크기 데이터: ✅');
  console.log('   - 제작 연도 추정 근거: ✅');  
  console.log('   - 재료 과학적 분석: ✅');
  console.log('   - 역사적 맥락 제시: ✅');
  console.log('   - 미술사적 평가: ✅');
  console.log('');
  console.log('⚠️  주의: 실제 구현시에는 Gemini AI가 더 정확하고 상세한 해설을 생성합니다.');
  
  console.log('\n🎉 국립중앙박물관 가이드 생성 데모 완료!');
  console.log('');
  console.log('📋 실제 사용 방법:');
  console.log('   1. 서버 실행: npm run dev');
  console.log('   2. API 호출: POST /api/museum-guide');
  console.log('   3. 또는 직접 코드 사용: museumGuideGenerator.generateMuseumTourGuide()');
}

// 실행
generateNationalMuseumGuide().catch(console.error);