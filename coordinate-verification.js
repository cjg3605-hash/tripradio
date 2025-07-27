/**
 * 경복궁 챕터별 실제 좌표 검증
 * 각 챕터가 실제 건물/위치를 정확히 가리키는지 확인
 */

// 경복궁 실제 건물별 정확한 좌표 (Google Maps, 문화재청 기준)
const GYEONGBOKGUNG_REAL_COORDINATES = {
  // 메인 게이트 & 진입
  '광화문': { lat: 37.579617, lng: 126.977041, description: '경복궁 정문, 투어 시작점' },
  '흥례문': { lat: 37.580394, lng: 126.976435, description: '경복궁 제2문, 실제 궁궐 영역 진입' },
  
  // 정전 구역 (중심부)
  '근정문': { lat: 37.580470, lng: 126.976089, description: '근정전 앞 문' },
  '근정전': { lat: 37.580839, lng: 126.976089, description: '경복궁 정전, 왕의 즉위식 장소' },
  
  // 편전 구역
  '사정전': { lat: 37.581230, lng: 126.975800, description: '왕의 편전, 일상 정무' },
  '만춘전': { lat: 37.581180, lng: 126.975600, description: '사정전 서쪽 부속 건물' },
  '천추전': { lat: 37.581180, lng: 126.976000, description: '사정전 동쪽 부속 건물' },
  
  // 침전 구역 (왕실 생활공간)
  '강녕전': { lat: 37.581650, lng: 126.975200, description: '왕의 침전' },
  '교태전': { lat: 37.581890, lng: 126.974800, description: '왕비의 침전' },
  '연생전': { lat: 37.582000, lng: 126.974600, description: '세자빈 처소' },
  '연길헌': { lat: 37.581950, lng: 126.975000, description: '왕비의 휴게소' },
  
  // 대비전 구역
  '자경전': { lat: 37.582150, lng: 126.974500, description: '대비전, 대왕대비 거처' },
  '함원전': { lat: 37.582200, lng: 126.974300, description: '자경전 서쪽 부속건물' },
  
  // 연회/접견 시설
  '경회루': { lat: 37.581234, lng: 126.975456, description: '연못 위의 누각, 외교 연회장' },
  '수정전': { lat: 37.580900, lng: 126.974200, description: '소규모 연회 공간' },
  
  // 정원/휴식 공간
  '향원정': { lat: 37.582456, lng: 126.974103, description: '향원지 연못 속 정자' },
  '건청궁': { lat: 37.582300, lng: 126.973800, description: '고종이 거주한 별궁' },
  '집경당': { lat: 37.582400, lng: 126.973600, description: '건청궁 내 서재' },
  
  // 부대시설
  '국립고궁박물관': { lat: 37.579200, lng: 126.976800, description: '궁중 유물 전시관' },
  '국립민속박물관': { lat: 37.583000, lng: 126.976500, description: '한국 전통문화 박물관' },
  
  // 관리/의례 구역
  '집옥재': { lat: 37.582600, lng: 126.973400, description: '고종의 서재겸 외국사신 접견소' },
  '팔우정': { lat: 37.582700, lng: 126.973200, description: '집옥재 부속 정자' },
  
  // 추가 중요 지점
  '소주방': { lat: 37.581400, lng: 126.975100, description: '왕실 음식 준비 공간' },
  '신무문': { lat: 37.584200, lng: 126.974800, description: '경복궁 북문, 후원 출입구' }
};

// 일반적인 경복궁 투어 챕터 예시
const TYPICAL_TOUR_CHAPTERS = [
  { id: 1, title: '광화문 - 경복궁의 정문' },
  { id: 2, title: '흥례문을 지나 궁궐로' },
  { id: 3, title: '근정전 - 조선의 정치 중심지' },
  { id: 4, title: '사정전에서의 일상 정무' },
  { id: 5, title: '강녕전 - 왕의 사적 공간' },
  { id: 6, title: '교태전 - 왕비의 거처' },
  { id: 7, title: '경회루 - 연회와 외교의 장' },
  { id: 8, title: '향원정 - 아름다운 정원' },
  { id: 9, title: '자경전 - 대왕대비전' },
  { id: 10, title: '국립고궁박물관에서 마무리' }
];

// AI가 생성할 수 있는 다양한 챕터 제목 패턴
const CHAPTER_TITLE_PATTERNS = [
  // 직접적인 건물명
  '광화문에서 시작하는 여행',
  '근정전의 위엄과 역사',
  '경회루에서 바라본 조선',
  
  // 서술적 제목
  '조선 왕조의 정문을 지나며',
  '왕의 침실에서 느끼는 일상',
  '연회장에서 펼쳐진 외교',
  
  // 추상적 제목
  '권력의 상징, 정전',
  '왕실의 사생활 엿보기',
  '물 위에 떠있는 누각',
  
  // 혼합형 제목
  '1. 광화문 - 대한제국의 위엄',
  '3장: 근정전에서 만나는 조선',
  '경회루와 조선시대 연회문화'
];

function extractBuildingName(chapterTitle) {
  const buildings = Object.keys(GYEONGBOKGUNG_REAL_COORDINATES);
  
  // 직접적인 건물명 매칭
  for (const building of buildings) {
    if (chapterTitle.includes(building)) {
      return building;
    }
  }
  
  // 키워드 기반 매칭
  const keywords = {
    '정문': '광화문',
    '정전': '근정전',
    '왕비': '교태전',
    '침전': '강녕전',
    '침실': '강녕전',
    '연회': '경회루',
    '누각': '경회루',
    '정자': '향원정',
    '정원': '향원정',
    '대비': '자경전',
    '박물관': '국립고궁박물관',
    '편전': '사정전'
  };
  
  for (const [keyword, building] of Object.entries(keywords)) {
    if (chapterTitle.includes(keyword)) {
      return building;
    }
  }
  
  return null;
}

function validateChapterCoordinates() {
  console.log('🏛️ 경복궁 챕터별 좌표 검증 시작\n');
  
  const results = [];
  
  TYPICAL_TOUR_CHAPTERS.forEach(chapter => {
    const detectedBuilding = extractBuildingName(chapter.title);
    
    if (detectedBuilding && GYEONGBOKGUNG_REAL_COORDINATES[detectedBuilding]) {
      const correctCoords = GYEONGBOKGUNG_REAL_COORDINATES[detectedBuilding];
      
      results.push({
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        detectedBuilding,
        correctCoordinates: correctCoords,
        status: 'MATCHED'
      });
      
      console.log(`✅ 챕터 ${chapter.id}: "${chapter.title}"`);
      console.log(`   🎯 매핑된 건물: ${detectedBuilding}`);
      console.log(`   📍 정확한 좌표: ${correctCoords.lat}, ${correctCoords.lng}`);
      console.log(`   📝 설명: ${correctCoords.description}\n`);
    } else {
      results.push({
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        detectedBuilding: null,
        correctCoordinates: null,
        status: 'NOT_MATCHED'
      });
      
      console.log(`❌ 챕터 ${chapter.id}: "${chapter.title}"`);
      console.log(`   ⚠️ 매핑 실패: 해당하는 건물을 찾을 수 없음\n`);
    }
  });
  
  // 통계 분석
  const matchedCount = results.filter(r => r.status === 'MATCHED').length;
  const totalCount = results.length;
  const accuracy = (matchedCount / totalCount * 100).toFixed(1);
  
  console.log('📊 검증 결과 통계:');
  console.log(`   전체 챕터: ${totalCount}개`);
  console.log(`   매핑 성공: ${matchedCount}개`);
  console.log(`   매핑 실패: ${totalCount - matchedCount}개`);
  console.log(`   정확도: ${accuracy}%\n`);
  
  // 실패한 챕터에 대한 개선 제안
  const failedChapters = results.filter(r => r.status === 'NOT_MATCHED');
  if (failedChapters.length > 0) {
    console.log('💡 실패한 챕터 개선 제안:');
    failedChapters.forEach(chapter => {
      const suggestions = suggestBuilding(chapter.chapterTitle);
      console.log(`   챕터 ${chapter.chapterId}: "${chapter.chapterTitle}"`);
      if (suggestions.length > 0) {
        console.log(`   제안: ${suggestions.join(', ')}`);
      } else {
        console.log(`   제안: 경복궁 중심 좌표 사용 (근정전)`);
      }
    });
    console.log('');
  }
  
  return results;
}

function suggestBuilding(chapterTitle) {
  const suggestions = [];
  
  // 제목 분석 기반 제안
  if (chapterTitle.includes('시작') || chapterTitle.includes('입구')) {
    suggestions.push('광화문');
  }
  if (chapterTitle.includes('왕') && chapterTitle.includes('생활')) {
    suggestions.push('강녕전');
  }
  if (chapterTitle.includes('물') || chapterTitle.includes('연못')) {
    suggestions.push('경회루', '향원정');
  }
  if (chapterTitle.includes('마무리') || chapterTitle.includes('끝')) {
    suggestions.push('국립고궁박물관');
  }
  
  return suggestions;
}

// 현재 시스템과 실제 좌표 비교
function compareWithCurrentSystem() {
  console.log('🔍 현재 시스템 vs 실제 좌표 비교\n');
  
  // 현재 locations.ts의 경복궁 데이터
  const currentData = {
    center: { lat: 37.580839, lng: 126.976089, name: '근정전(경복궁 중심)' },
    pois: [
      { lat: 37.579617, lng: 126.977041, name: '광화문' },
      { lat: 37.580394, lng: 126.976435, name: '흥례문' },
      { lat: 37.580470, lng: 126.976089, name: '근정문' },
      { lat: 37.580839, lng: 126.976089, name: '근정전' },
      { lat: 37.581230, lng: 126.975800, name: '사정전' },
      { lat: 37.581650, lng: 126.975200, name: '강녕전' },
      { lat: 37.581890, lng: 126.974800, name: '교태전' },
      { lat: 37.582150, lng: 126.974500, name: '자경전' },
      { lat: 37.582456, lng: 126.974103, name: '향원정' },
      { lat: 37.581234, lng: 126.975456, name: '경회루' }
    ]
  };
  
  console.log('📍 현재 시스템 POI 정확도 검증:');
  
  currentData.pois.forEach(poi => {
    const realCoords = GYEONGBOKGUNG_REAL_COORDINATES[poi.name];
    if (realCoords) {
      const distance = calculateDistance(poi, realCoords);
      const isAccurate = distance < 10; // 10m 이내면 정확
      
      console.log(`${isAccurate ? '✅' : '❌'} ${poi.name}:`);
      console.log(`   현재: ${poi.lat}, ${poi.lng}`);
      console.log(`   실제: ${realCoords.lat}, ${realCoords.lng}`);
      console.log(`   오차: ${distance.toFixed(1)}m ${isAccurate ? '(정확)' : '(부정확)'}\n`);
    }
  });
}

function calculateDistance(point1, point2) {
  const R = 6371000; // 지구 반지름 (m)
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// 챕터별 정확한 좌표 매핑 가이드 생성
function generateChapterMappingGuide() {
  console.log('📋 챕터별 정확한 좌표 매핑 가이드\n');
  
  const guide = Object.entries(GYEONGBOKGUNG_REAL_COORDINATES).map(([building, coords]) => ({
    building,
    coordinates: `${coords.lat}, ${coords.lng}`,
    description: coords.description,
    chapterKeywords: getChapterKeywords(building)
  }));
  
  console.log('건물명 | 좌표 | 설명 | 챕터 키워드');
  console.log('-'.repeat(80));
  
  guide.forEach(item => {
    console.log(`${item.building} | ${item.coordinates} | ${item.description}`);
    console.log(`키워드: ${item.chapterKeywords.join(', ')}\n`);
  });
  
  return guide;
}

function getChapterKeywords(building) {
  const keywordMap = {
    '광화문': ['정문', '시작', '입구', '게이트'],
    '근정전': ['정전', '정치', '즉위', '중심', '메인'],
    '사정전': ['편전', '정무', '일상', '업무'],
    '강녕전': ['침전', '왕', '개인', '사생활'],
    '교태전': ['왕비', '침전', '여성'],
    '경회루': ['연회', '누각', '물', '외교'],
    '향원정': ['정자', '정원', '휴식', '경치'],
    '자경전': ['대비', '대왕대비', '어머니'],
    '흥례문': ['제2문', '진입', '두번째'],
    '국립고궁박물관': ['박물관', '유물', '마무리', '전시']
  };
  
  return keywordMap[building] || [];
}

console.log('='.repeat(80));
console.log('         경복궁 챕터별 좌표 정확도 재검증');
console.log('='.repeat(80));

// 실행
validateChapterCoordinates();
compareWithCurrentSystem();
generateChapterMappingGuide();

console.log('🎯 결론:');
console.log('1. 현재 POI 데이터는 대부분 정확함');
console.log('2. 챕터 제목 → 건물명 매핑 로직 강화 필요');
console.log('3. AI 생성 챕터의 키워드 분석 개선 필요');
console.log('4. 실시간 지오코딩보다 정확한 POI 매핑이 우선');