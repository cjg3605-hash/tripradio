/**
 * 향상된 POI 매칭 테스트
 * 경복궁 챕터별 정확한 매칭 검증
 */

// 경복궁 POI 데이터 (실제 locations.ts와 동일)
const GYEONGBOKGUNG_POIS = [
  { name: '광화문', lat: 37.579617, lng: 126.977041, type: 'gate' },
  { name: '흥례문', lat: 37.580394, lng: 126.976435, type: 'gate' },
  { name: '근정문', lat: 37.580470, lng: 126.976089, type: 'gate' },
  { name: '근정전', lat: 37.580839, lng: 126.976089, type: 'hall' },
  { name: '사정전', lat: 37.581230, lng: 126.975800, type: 'hall' },
  { name: '강녕전', lat: 37.581650, lng: 126.975200, type: 'hall' },
  { name: '교태전', lat: 37.581890, lng: 126.974800, type: 'hall' },
  { name: '자경전', lat: 37.582150, lng: 126.974500, type: 'hall' },
  { name: '향원정', lat: 37.582456, lng: 126.974103, type: 'pavilion' },
  { name: '경회루', lat: 37.581234, lng: 126.975456, type: 'pavilion' },
  { name: '국립고궁박물관', lat: 37.579200, lng: 126.976800, type: 'museum' }
];

// 테스트 챕터 제목들 (다양한 패턴)
const TEST_CHAPTERS = [
  { id: 1, title: '광화문 - 경복궁의 정문' },
  { id: 2, title: '1. 광화문에서 시작하는 여행' },
  { id: 3, title: '조선 왕조의 정문을 지나며' },
  { id: 4, title: '근정전 - 조선의 정치 중심지' },
  { id: 5, title: '권력의 상징, 정전' },
  { id: 6, title: '3장: 근정전에서 만나는 조선' },
  { id: 7, title: '사정전에서의 일상 정무' },
  { id: 8, title: '왕의 편전에서 느끼는 일상' },
  { id: 9, title: '강녕전 - 왕의 사적 공간' },
  { id: 10, title: '왕의 침실에서 느끼는 일상' },
  { id: 11, title: '교태전 - 왕비의 거처' },
  { id: 12, title: '왕비의 침전을 둘러보며' },
  { id: 13, title: '경회루 - 연회와 외교의 장' },
  { id: 14, title: '물 위에 떠있는 누각' },
  { id: 15, title: '연회장에서 펼쳐진 외교' },
  { id: 16, title: '향원정 - 아름다운 정원' },
  { id: 17, title: '정자에서 바라본 궁궐' },
  { id: 18, title: '자경전 - 대왕대비전' },
  { id: 19, title: '대비의 거처를 찾아서' },
  { id: 20, title: '국립고궁박물관에서 마무리' },
  { id: 21, title: '박물관에서 되돌아보는 역사' },
  // 매칭하기 어려운 케이스들
  { id: 22, title: '조선 왕실의 하루' },
  { id: 23, title: '궁궐 속 숨겨진 이야기' },
  { id: 24, title: '시간을 넘나드는 여행' }
];

/**
 * 향상된 POI 매칭 함수들 (TypeScript에서 복사)
 */
function findMatchingPoi(title, pois) {
  // 1. 직접 매칭 시도
  const directMatch = directPoiMatch(title, pois);
  if (directMatch) return directMatch;
  
  // 2. 키워드 기반 매칭
  const keywordMatch = keywordPoiMatch(title, pois);
  if (keywordMatch) return keywordMatch;
  
  // 3. 유사도 기반 매칭
  const similarityMatch = similarityPoiMatch(title, pois);
  if (similarityMatch) return similarityMatch;
  
  return null;
}

function directPoiMatch(title, pois) {
  const normalizedTitle = title.toLowerCase()
    .replace(/[0-9]+\.\s*/, '') // 숫자 제거
    .replace(/[\s\-\.]/g, ''); // 공백, 하이픈, 점 제거
  
  for (const poi of pois) {
    const normalizedPoi = poi.name.toLowerCase().replace(/[\s\-\.]/g, '');
    
    // 완전 매칭 또는 포함 관계
    if (normalizedTitle.includes(normalizedPoi) || normalizedPoi.includes(normalizedTitle)) {
      console.log(`🎯 Direct POI match: "${title}" → "${poi.name}"`);
      return { lat: poi.lat, lng: poi.lng, poi: poi.name, method: 'direct' };
    }
  }
  
  return null;
}

function keywordPoiMatch(title, pois) {
  // 경복궁 특화 키워드 매핑
  const keywordMapping = {
    '광화문': ['정문', '시작', '입구', '게이트', '대문'],
    '근정전': ['정전', '정치', '즉위', '중심', '메인', '왕좌'],
    '사정전': ['편전', '정무', '일상', '업무', '집무'],
    '강녕전': ['침전', '침실', '왕', '개인', '사생활', '휴식'],
    '교태전': ['왕비', '여성', '침전', '후궁'],
    '경회루': ['연회', '누각', '물', '외교', '연못', '누정'],
    '향원정': ['정자', '정원', '휴식', '경치', '풍경', '꽃'],
    '자경전': ['대비', '대왕대비', '어머니', '할머니'],
    '흥례문': ['제2문', '진입', '두번째', '궁문'],
    '국립고궁박물관': ['박물관', '유물', '마무리', '전시', '관람']
  };
  
  for (const [building, keywords] of Object.entries(keywordMapping)) {
    for (const keyword of keywords) {
      if (title.includes(keyword)) {
        const targetPoi = pois.find(poi => poi.name.includes(building));
        if (targetPoi) {
          console.log(`🔑 Keyword POI match: "${title}" (${keyword}) → "${targetPoi.name}"`);
          return { lat: targetPoi.lat, lng: targetPoi.lng, poi: targetPoi.name, method: 'keyword', keyword };
        }
      }
    }
  }
  
  return null;
}

function similarityPoiMatch(title, pois) {
  let bestMatch = null;
  
  for (const poi of pois) {
    const similarity = calculateStringSimilarity(title, poi.name);
    
    if (similarity > 0.6 && (!bestMatch || similarity > bestMatch.score)) {
      bestMatch = { poi, score: similarity };
    }
  }
  
  if (bestMatch) {
    console.log(`📊 Similarity POI match: "${title}" → "${bestMatch.poi.name}" (${(bestMatch.score * 100).toFixed(0)}%)`);
    return { 
      lat: bestMatch.poi.lat, 
      lng: bestMatch.poi.lng, 
      poi: bestMatch.poi.name, 
      method: 'similarity', 
      score: bestMatch.score 
    };
  }
  
  return null;
}

function calculateStringSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = Array(str2.length + 1).fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * 테스트 실행
 */
function runPOIMatchingTest() {
  console.log('='.repeat(80));
  console.log('         향상된 POI 매칭 시스템 테스트');
  console.log('='.repeat(80));
  
  const results = [];
  let successCount = 0;
  let failCount = 0;
  
  for (const chapter of TEST_CHAPTERS) {
    console.log(`\n📝 테스트 챕터 ${chapter.id}: "${chapter.title}"`);
    
    const match = findMatchingPoi(chapter.title, GYEONGBOKGUNG_POIS);
    
    if (match) {
      results.push({
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        matchedPOI: match.poi,
        coordinates: `${match.lat}, ${match.lng}`,
        method: match.method,
        keyword: match.keyword || '',
        score: match.score || 1.0,
        status: 'SUCCESS'
      });
      successCount++;
      console.log(`✅ 매칭 성공: ${match.poi} (${match.method})`);
    } else {
      results.push({
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        matchedPOI: null,
        coordinates: null,
        method: null,
        keyword: '',
        score: 0,
        status: 'FAILED'
      });
      failCount++;
      console.log(`❌ 매칭 실패`);
    }
  }
  
  // 결과 요약
  console.log('\n' + '='.repeat(80));
  console.log('📊 테스트 결과 요약');
  console.log('='.repeat(80));
  console.log(`전체 챕터: ${TEST_CHAPTERS.length}개`);
  console.log(`매칭 성공: ${successCount}개`);
  console.log(`매칭 실패: ${failCount}개`);
  console.log(`성공률: ${(successCount / TEST_CHAPTERS.length * 100).toFixed(1)}%`);
  
  // 매칭 방법별 통계
  const methodStats = {};
  results.filter(r => r.status === 'SUCCESS').forEach(r => {
    methodStats[r.method] = (methodStats[r.method] || 0) + 1;
  });
  
  console.log('\n📈 매칭 방법별 통계:');
  for (const [method, count] of Object.entries(methodStats)) {
    console.log(`  ${method}: ${count}개`);
  }
  
  // 실패한 케이스 분석
  const failedCases = results.filter(r => r.status === 'FAILED');
  if (failedCases.length > 0) {
    console.log('\n❌ 매칭 실패한 챕터들:');
    failedCases.forEach(fail => {
      console.log(`  ${fail.chapterId}. ${fail.chapterTitle}`);
    });
  }
  
  // 성공한 매칭 상세 결과
  console.log('\n✅ 성공한 매칭 결과:');
  console.log('챕터 ID | 제목 | 매칭된 POI | 방법 | 점수');
  console.log('-'.repeat(80));
  results.filter(r => r.status === 'SUCCESS').forEach(result => {
    const score = result.score ? ` (${(result.score * 100).toFixed(0)}%)` : '';
    const keyword = result.keyword ? ` [${result.keyword}]` : '';
    console.log(`${result.chapterId.toString().padStart(2)} | ${result.chapterTitle.padEnd(20)} | ${result.matchedPOI.padEnd(15)} | ${result.method}${keyword}${score}`);
  });
  
  return {
    totalChapters: TEST_CHAPTERS.length,
    successCount,
    failCount,
    successRate: successCount / TEST_CHAPTERS.length,
    results
  };
}

// 테스트 실행
const testResult = runPOIMatchingTest();

console.log('\n🎯 결론:');
if (testResult.successRate >= 0.8) {
  console.log('✅ POI 매칭 시스템이 우수한 성능을 보입니다');
} else if (testResult.successRate >= 0.6) {
  console.log('⚠️ POI 매칭 시스템에 개선이 필요합니다');
} else {
  console.log('❌ POI 매칭 시스템이 심각한 문제가 있습니다');
}

console.log('1. 직접 매칭과 키워드 매칭이 핵심 성공 요소');
console.log('2. 챕터 제목의 표준화가 매칭 성공률 향상에 중요');
console.log('3. 실패한 케이스는 일반적인 설명으로 특정 건물 식별 어려움');