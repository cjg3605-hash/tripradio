/**
 * 광화문 좌표 수정 분석
 */

// 현재 잘못된 좌표
const CURRENT_WRONG = {
  lat: 37.579617,
  lng: 126.977041,
  name: '현재 시스템 (잘못됨)'
};

// 실제 정확한 광화문 좌표들
const CORRECT_GWANGHWAMUN = [
  {
    lat: 37.575843,
    lng: 126.977380,
    source: '블로그 데이터',
    priority: 1
  },
  {
    lat: 37.574515,
    lng: 126.976930,
    source: '일반적인 광화문 지역',
    priority: 2
  },
  {
    lat: 37.571619,
    lng: 126.976436,
    source: 'Google Patents 정확한 데이터',
    priority: 3
  }
];

// 경복궁 내 다른 건물들 (비교용)
const GYEONGBOKGUNG_BUILDINGS = {
  heungnyemun: { lat: 37.580394, lng: 126.976435, name: '흥례문' },
  geunjeongjeon: { lat: 37.580839, lng: 126.976089, name: '근정전' },
  geunjeongmun: { lat: 37.580470, lng: 126.976089, name: '근정문' }
};

function calculateDistance(point1, point2) {
  const R = 6371000;
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

console.log('🔍 광화문 좌표 오류 분석');
console.log('='.repeat(60));

console.log('\n❌ 현재 시스템의 잘못된 좌표:');
console.log(`  ${CURRENT_WRONG.lat}, ${CURRENT_WRONG.lng}`);

console.log('\n✅ 실제 광화문 정확한 좌표들:');
CORRECT_GWANGHWAMUN.forEach((coord, index) => {
  const distance = calculateDistance(CURRENT_WRONG, coord);
  console.log(`  ${index + 1}. ${coord.lat}, ${coord.lng}`);
  console.log(`     소스: ${coord.source}`);
  console.log(`     현재 좌표와 오차: ${distance.toFixed(0)}m`);
  console.log('');
});

console.log('🏛️ 현재 좌표가 실제로 가리키는 곳:');
Object.entries(GYEONGBOKGUNG_BUILDINGS).forEach(([key, building]) => {
  const distance = calculateDistance(CURRENT_WRONG, building);
  console.log(`  ${building.name}과의 거리: ${distance.toFixed(0)}m`);
});

// 가장 가까운 경복궁 건물 찾기
let closestBuilding = null;
let closestDistance = Infinity;

Object.entries(GYEONGBOKGUNG_BUILDINGS).forEach(([key, building]) => {
  const distance = calculateDistance(CURRENT_WRONG, building);
  if (distance < closestDistance) {
    closestDistance = distance;
    closestBuilding = building;
  }
});

console.log(`\n🎯 현재 좌표는 실제로는 "${closestBuilding.name}" 근처(${closestDistance.toFixed(0)}m)를 가리킵니다!`);

// 추천하는 정확한 광화문 좌표
const recommendedCoord = CORRECT_GWANGHWAMUN[0]; // 가장 신뢰할 만한 좌표
console.log('\n🔧 수정 권장사항:');
console.log(`  기존: ${CURRENT_WRONG.lat}, ${CURRENT_WRONG.lng}`);
console.log(`  수정: ${recommendedCoord.lat}, ${recommendedCoord.lng}`);
console.log(`  소스: ${recommendedCoord.source}`);

const improvement = calculateDistance(CURRENT_WRONG, recommendedCoord);
console.log(`  개선: ${improvement.toFixed(0)}m 정확도 향상`);

console.log('\n💡 왜 이런 일이 발생했나?');
console.log('1. 데이터 수집 시 광화문이 아닌 다른 지점을 참조');
console.log('2. 경복궁 내부 좌표와 광화문 좌표 혼동');
console.log('3. 부정확한 지도 API 데이터 사용');
console.log('4. 좌표 복사/붙여넣기 과정에서 실수');