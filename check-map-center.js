/**
 * 경복궁 지도 중심점과 광화문 위치 관계 분석
 */

// 현재 시스템 설정
const GYEONGBOKGUNG_CENTER = {
  lat: 37.580839,
  lng: 126.976089,
  name: '근정전(경복궁 중심)'
};

const GWANGHWAMUN_POI = {
  lat: 37.579617,
  lng: 126.977041,
  name: '광화문'
};

// 실제 위치들
const ACTUAL_LOCATIONS = {
  gwanghwamun: {
    lat: 37.5796206,
    lng: 126.9770222,
    name: '광화문 (실제)',
    description: '경복궁 정문, 투어 시작점'
  },
  geunjeongjeon: {
    lat: 37.580839,
    lng: 126.976089,
    name: '근정전 (실제)',
    description: '경복궁 중심 건물'
  },
  heungnyemun: {
    lat: 37.580394,
    lng: 126.976435,
    name: '흥례문 (실제)',
    description: '경복궁 제2문, 궁궐 진입구'
  }
};

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

function calculateBearing(point1, point2) {
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const lat1 = point1.lat * Math.PI / 180;
  const lat2 = point2.lat * Math.PI / 180;
  
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  
  const bearing = Math.atan2(y, x) * 180 / Math.PI;
  return (bearing + 360) % 360;
}

console.log('🗺️ 경복궁 지도 중심점과 POI 위치 관계 분석');
console.log('='.repeat(60));

console.log('\n📍 현재 시스템 설정:');
console.log(`  지도 중심: ${GYEONGBOKGUNG_CENTER.lat}, ${GYEONGBOKGUNG_CENTER.lng} (${GYEONGBOKGUNG_CENTER.name})`);
console.log(`  광화문 POI: ${GWANGHWAMUN_POI.lat}, ${GWANGHWAMUN_POI.lng} (${GWANGHWAMUN_POI.name})`);

const centerToGwanghwamun = calculateDistance(GYEONGBOKGUNG_CENTER, GWANGHWAMUN_POI);
const bearing = calculateBearing(GYEONGBOKGUNG_CENTER, GWANGHWAMUN_POI);

console.log(`\n📏 중심점에서 광화문까지:');
console.log(`  거리: ${centerToGwanghwamun.toFixed(1)}m`);
console.log(`  방향: ${bearing.toFixed(0)}° (${getDirection(bearing)})`);

console.log('\n🏛️ 실제 경복궁 건물 간 거리:');
const gwanghwamunToHeungnyemun = calculateDistance(ACTUAL_LOCATIONS.gwanghwamun, ACTUAL_LOCATIONS.heungnyemun);
const heungnyemunToGeunjeongjeon = calculateDistance(ACTUAL_LOCATIONS.heungnyemun, ACTUAL_LOCATIONS.geunjeongjeon);
const gwanghwamunToGeunjeongjeon = calculateDistance(ACTUAL_LOCATIONS.gwanghwamun, ACTUAL_LOCATIONS.geunjeongjeon);

console.log(`  광화문 → 흥례문: ${gwanghwamunToHeungnyemun.toFixed(1)}m`);
console.log(`  흥례문 → 근정전: ${heungnyemunToGeunjeongjeon.toFixed(1)}m`);
console.log(`  광화문 → 근정전: ${gwanghwamunToGeunjeongjeon.toFixed(1)}m`);

console.log('\n🎯 문제 분석:');
if (centerToGwanghwamun > 200) {
  console.log('❌ 지도 중심점이 광화문에서 너무 멀리 떨어져 있습니다.');
  console.log('   → 광화문이 투어 시작점인데 지도 중심이 근정전이면 혼란을 야기합니다.');
} else {
  console.log('✅ 지도 중심점과 광화문 거리가 적절합니다.');
}

console.log('\n💡 개선 제안:');
console.log('1. 투어 시작점을 고려한 지도 중심점 조정');
console.log('   - 현재: 근정전 중심 (경복궁 내부 중앙)');
console.log('   - 제안: 흥례문 중심 (투어 경로 고려)');

const suggestedCenter = ACTUAL_LOCATIONS.heungnyemun;
console.log(`\n🔧 제안하는 새로운 중심점:`);
console.log(`  위도: ${suggestedCenter.lat}`);
console.log(`  경도: ${suggestedCenter.lng}`);
console.log(`  설명: ${suggestedCenter.description}`);

const newCenterToGwanghwamun = calculateDistance(suggestedCenter, ACTUAL_LOCATIONS.gwanghwamun);
const newCenterToGeunjeongjeon = calculateDistance(suggestedCenter, ACTUAL_LOCATIONS.geunjeongjeon);

console.log(`\n📊 새 중심점 기준 거리:`);
console.log(`  흥례문 → 광화문: ${newCenterToGwanghwamun.toFixed(1)}m`);
console.log(`  흥례문 → 근정전: ${newCenterToGeunjeongjeon.toFixed(1)}m`);
console.log(`  → 투어 시작과 중심부 모두 균형있게 표시됩니다.`);

function getDirection(bearing) {
  const directions = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}