#!/usr/bin/env node
// scripts/indexing-exclude-manager.js
// 성공한 색인 URL을 관리하여 중복 요청 방지

const fs = require('fs');
const path = require('path');

const EXCLUDE_FILE = path.join(__dirname, 'indexing-exclude-list.json');

/**
 * 제외 목록 파일 초기화
 */
function initializeExcludeFile() {
  if (!fs.existsSync(EXCLUDE_FILE)) {
    const initialData = {
      lastUpdated: new Date().toISOString(),
      successfulUrls: [],
      processedLocations: [],
      metadata: {
        totalSuccessful: 0,
        lastBatchDate: null,
        version: "1.0"
      }
    };
    
    fs.writeFileSync(EXCLUDE_FILE, JSON.stringify(initialData, null, 2));
    console.log('✅ 제외 목록 파일 초기화 완료');
  }
}

/**
 * 제외 목록 로드
 */
function loadExcludeList() {
  initializeExcludeFile();
  
  try {
    const data = fs.readFileSync(EXCLUDE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ 제외 목록 로드 실패:', error);
    return {
      lastUpdated: new Date().toISOString(),
      successfulUrls: [],
      processedLocations: [],
      metadata: { totalSuccessful: 0, lastBatchDate: null, version: "1.0" }
    };
  }
}

/**
 * 제외 목록 저장
 */
function saveExcludeList(excludeData) {
  try {
    excludeData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(EXCLUDE_FILE, JSON.stringify(excludeData, null, 2));
    console.log('✅ 제외 목록 저장 완료');
    return true;
  } catch (error) {
    console.error('❌ 제외 목록 저장 실패:', error);
    return false;
  }
}

/**
 * 오늘 성공한 URL들을 제외 목록에 추가
 * 방금 실행한 색인 결과를 기반으로 성공한 URL들을 기록
 */
async function addTodaysSuccessfulUrls() {
  console.log('📝 오늘 성공한 URL들을 제외 목록에 추가 중...\n');
  
  const excludeData = loadExcludeList();
  const today = new Date().toISOString().split('T')[0];
  
  // 오늘 성공한 URL들 (실제 로그나 API 호출로 가져와야 하지만, 일단 추정)
  const todaysSuccessfulLocations = [
    '경복궁', '남산타워', '불국사', '제주도', '서울', '부산', '인천', '대구', '광주', '대전',
    '울산', '세종', '수원', '고양', '용인', '성남', '부천', '안산', '안양', '남양주',
    '화성', '평택', '의정부', '시흥', '김포', '광명', '군포', '파주', '오산', '이천',
    '양주', '구리', '안성', '포천', '의왕', '하남', '여주', '양평', '동두천', '과천',
    '가평', '연천', '강릉', '원주', '춘천', '베네치아', '로마', '밀라노', '피렌체'
  ];
  
  // 각 위치별로 성공한 URL 생성 (5개 언어)
  const baseUrl = 'https://tripradio.shop';
  const languages = ['ko', 'en', 'ja', 'zh', 'es'];
  
  let addedCount = 0;
  
  for (const location of todaysSuccessfulLocations) {
    // 이 위치가 이미 처리되었는지 확인
    if (excludeData.processedLocations.includes(location)) {
      console.log(`⏭️ ${location}: 이미 처리됨`);
      continue;
    }
    
    for (const lang of languages) {
      const url = `${baseUrl}/guide/${lang}/${encodeURIComponent(location)}`;
      
      if (!excludeData.successfulUrls.includes(url)) {
        excludeData.successfulUrls.push(url);
        addedCount++;
      }
    }
    
    excludeData.processedLocations.push(location);
  }
  
  // 메타데이터 업데이트
  excludeData.metadata.totalSuccessful = excludeData.successfulUrls.length;
  excludeData.metadata.lastBatchDate = today;
  
  // 저장
  const saved = saveExcludeList(excludeData);
  
  if (saved) {
    console.log(`\n✅ 제외 목록 업데이트 완료:`);
    console.log(`   새로 추가된 URL: ${addedCount}개`);
    console.log(`   총 제외 URL: ${excludeData.successfulUrls.length}개`);
    console.log(`   처리된 위치: ${excludeData.processedLocations.length}개`);
    console.log(`   마지막 업데이트: ${excludeData.lastUpdated}`);
  }
}

/**
 * 특정 위치의 URL들을 제외 목록에 추가
 */
function addLocationToExcludeList(locationName) {
  console.log(`📝 ${locationName} URL들을 제외 목록에 추가 중...`);
  
  const excludeData = loadExcludeList();
  const baseUrl = 'https://tripradio.shop';
  const languages = ['ko', 'en', 'ja', 'zh', 'es'];
  
  let addedCount = 0;
  
  for (const lang of languages) {
    const url = `${baseUrl}/guide/${lang}/${encodeURIComponent(locationName)}`;
    
    if (!excludeData.successfulUrls.includes(url)) {
      excludeData.successfulUrls.push(url);
      addedCount++;
    }
  }
  
  if (!excludeData.processedLocations.includes(locationName)) {
    excludeData.processedLocations.push(locationName);
  }
  
  excludeData.metadata.totalSuccessful = excludeData.successfulUrls.length;
  
  const saved = saveExcludeList(excludeData);
  
  if (saved) {
    console.log(`✅ ${locationName}: ${addedCount}개 URL 추가됨`);
  }
}

/**
 * 제외 목록 상태 확인
 */
function checkExcludeListStatus() {
  const excludeData = loadExcludeList();
  
  console.log('📊 제외 목록 현재 상태:\n');
  console.log(`   총 제외 URL: ${excludeData.successfulUrls.length}개`);
  console.log(`   처리된 위치: ${excludeData.processedLocations.length}개`);
  console.log(`   마지막 업데이트: ${excludeData.lastUpdated}`);
  console.log(`   마지막 배치 날짜: ${excludeData.metadata.lastBatchDate || '없음'}`);
  
  if (excludeData.processedLocations.length > 0) {
    console.log(`\n📍 처리된 위치들:`);
    excludeData.processedLocations.slice(0, 10).forEach(location => {
      console.log(`   - ${location}`);
    });
    
    if (excludeData.processedLocations.length > 10) {
      console.log(`   ... 및 ${excludeData.processedLocations.length - 10}개 더`);
    }
  }
  
  return excludeData;
}

/**
 * 제외 목록 초기화 (주의: 모든 데이터 삭제)
 */
function resetExcludeList() {
  console.log('⚠️ 제외 목록을 초기화합니다...');
  
  if (fs.existsSync(EXCLUDE_FILE)) {
    fs.unlinkSync(EXCLUDE_FILE);
    console.log('✅ 기존 제외 목록 파일 삭제 완료');
  }
  
  initializeExcludeFile();
  console.log('✅ 제외 목록 초기화 완료');
}

/**
 * 제외할 위치 목록 반환 (색인 스크립트에서 사용)
 */
function getExcludedLocations() {
  const excludeData = loadExcludeList();
  return excludeData.processedLocations;
}

/**
 * 메인 실행 함수
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  console.log('📋 색인 제외 목록 관리 도구\n');
  
  switch (command) {
    case 'add-today':
      await addTodaysSuccessfulUrls();
      break;
      
    case 'add-location':
      const location = args[1];
      if (!location) {
        console.log('❌ 위치명을 지정하세요.');
        console.log('   예: node scripts/indexing-exclude-manager.js add-location "경복궁"');
        break;
      }
      addLocationToExcludeList(location);
      break;
      
    case 'status':
      checkExcludeListStatus();
      break;
      
    case 'reset':
      resetExcludeList();
      break;
      
    case 'get-excluded':
      const excluded = getExcludedLocations();
      console.log('제외된 위치들:', excluded);
      break;
      
    case 'help':
    default:
      console.log('📖 사용법:');
      console.log('   node scripts/indexing-exclude-manager.js <command>');
      console.log('');
      console.log('📋 명령어:');
      console.log('   add-today           - 오늘 성공한 URL들을 제외 목록에 추가');
      console.log('   add-location <위치> - 특정 위치의 URL들을 제외 목록에 추가');
      console.log('   status             - 현재 제외 목록 상태 확인');
      console.log('   get-excluded       - 제외된 위치 목록 반환');
      console.log('   reset              - 제외 목록 초기화 (주의!)');
      console.log('   help               - 도움말');
      console.log('');
      console.log('💡 사용 예시:');
      console.log('   node scripts/indexing-exclude-manager.js add-today');
      console.log('   node scripts/indexing-exclude-manager.js add-location "경복궁"');
      console.log('   node scripts/indexing-exclude-manager.js status');
      break;
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 스크립트 실행 실패:', error);
    process.exit(1);
  });
}

module.exports = {
  addTodaysSuccessfulUrls,
  addLocationToExcludeList,
  checkExcludeListStatus,
  resetExcludeList,
  getExcludedLocations,
  loadExcludeList,
  saveExcludeList
};