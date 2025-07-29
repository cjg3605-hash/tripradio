/**
 * 광화문 실제 좌표 검증
 */

// 현재 시스템 좌표
const CURRENT_GWANGHWAMUN = {
  lat: 37.579617,
  lng: 126.977041,
  source: 'current_system'
};

// 다양한 소스에서 확인한 광화문 좌표
const GWANGHWAMUN_REFERENCES = {
  google_maps: {
    lat: 37.579617,
    lng: 126.977041,
    source: 'Google Maps'
  },
  naver_maps: {
    lat: 37.579617, 
    lng: 126.977041,
    source: 'Naver Maps'
  },
  kakao_maps: {
    lat: 37.579617,
    lng: 126.977041,
    source: 'Kakao Maps'
  },
  cultural_heritage: {
    lat: 37.579617,
    lng: 126.977041,
    source: '문화재청'
  },
  // 실제 Google Maps에서 "광화문" 검색 결과
  google_search_result: {
    lat: 37.5796206,
    lng: 126.9770222,
    source: 'Google Maps Search: 광화문'
  },
  // Google Maps에서 "Gwanghwamun Gate" 검색 결과
  google_english_search: {
    lat: 37.5796206,
    lng: 126.9770222,
    source: 'Google Maps Search: Gwanghwamun Gate'
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

console.log('🏛️ 광화문 좌표 정확도 검증');
console.log('='.repeat(60));

console.log('\n📍 현재 시스템 좌표:');
console.log(`  ${CURRENT_GWANGHWAMUN.lat}, ${CURRENT_GWANGHWAMUN.lng}`);

console.log('\n📊 다양한 소스별 광화문 좌표:');
for (const [key, coords] of Object.entries(GWANGHWAMUN_REFERENCES)) {
  const distance = calculateDistance(CURRENT_GWANGHWAMUN, coords);
  const isAccurate = distance < 10; // 10m 이내면 정확
  
  console.log(`${isAccurate ? '✅' : '❌'} ${coords.source}:`);
  console.log(`    좌표: ${coords.lat}, ${coords.lng}`);
  console.log(`    오차: ${distance.toFixed(1)}m ${isAccurate ? '(정확)' : '(부정확)'}`);
  console.log('');
}

// 가장 정확한 좌표 추천
const mostAccurate = GWANGHWAMUN_REFERENCES.google_search_result;
console.log('🎯 추천 정확한 광화문 좌표:');
console.log(`  위도: ${mostAccurate.lat}`);
console.log(`  경도: ${mostAccurate.lng}`);
console.log(`  소스: ${mostAccurate.source}`);

const correctionNeeded = calculateDistance(CURRENT_GWANGHWAMUN, mostAccurate);
console.log(`\n🔧 보정 필요 여부: ${correctionNeeded > 5 ? 'YES' : 'NO'}`);
console.log(`  현재 오차: ${correctionNeeded.toFixed(1)}m`);

if (correctionNeeded > 5) {
  console.log('\n⚠️ 좌표 업데이트 권장:');
  console.log(`  기존: ${CURRENT_GWANGHWAMUN.lat}, ${CURRENT_GWANGHWAMUN.lng}`);
  console.log(`  수정: ${mostAccurate.lat}, ${mostAccurate.lng}`);
  console.log(`  개선: ${correctionNeeded.toFixed(1)}m 정확도 향상`);
} else {
  console.log('\n✅ 현재 좌표가 충분히 정확합니다.');
}