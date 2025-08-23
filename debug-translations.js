const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('./public/locales/translations.json', 'utf8'));
  
  console.log('=== 한국어 섹션 구조 분석 ===');
  
  // ko 최상위 키들
  console.log('\nko 최상위 키들:');
  Object.keys(data.ko).forEach(key => {
    console.log('  - ' + key);
  });
  
  // tripPlanner 하위 키들  
  if (data.ko.tripPlanner) {
    console.log('\ntripPlanner 하위 키들:');
    Object.keys(data.ko.tripPlanner).forEach(key => {
      console.log('  - ' + key);
    });
  }
  
  // templates 위치 찾기
  console.log('\n=== templates 위치 탐색 ===');
  function findTemplates(obj, path = '') {
    if (typeof obj !== 'object' || obj === null) return;
    
    Object.keys(obj).forEach(key => {
      const newPath = path ? path + '.' + key : key;
      if (key === 'templates') {
        console.log('templates 발견:', newPath);
        if (obj[key] && typeof obj[key] === 'object') {
          console.log('  하위 키들:', Object.keys(obj[key]));
          if (obj[key].japanGoldenRoute) {
            console.log('  japanGoldenRoute 존재함 ✓');
            console.log('  제목:', obj[key].japanGoldenRoute.title);
          } else {
            console.log('  japanGoldenRoute 없음 ✗');
          }
        }
      }
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        findTemplates(obj[key], newPath);
      }
    });
  }
  
  findTemplates(data.ko, 'ko');
  
} catch (error) {
  console.error('오류:', error.message);
}