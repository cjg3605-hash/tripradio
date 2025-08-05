// 🔍 번역된 명소 이름으로 실제 DB에 저장된 가이드 현황 확인

const axios = require('axios');

// 실제 DB에서 확인된 번역 패턴
const translationPatterns = {
  // 한국 명소들
  '경복궁': {
    ko: '경복궁',
    en: '경복궁', // 번역 안 됨
    ja: '景福宮',
    zh: '景福宫',
    es: '경복궁' // 추정
  },
  '남산타워': {
    ko: '남산타워',
    en: '남산타워', // 번역 안 됨  
    ja: '南山タワー',
    zh: '南山塔',
    es: '남산타워' // 추정
  },
  '명동': {
    ko: '명동',
    en: '명동',
    ja: '명동',
    zh: '명동',
    es: '명동'
  },
  '해운대해수욕장': {
    ko: '해운대해수욕장',
    en: '해운대해수욕장', // 번역 안 됨
    ja: '海云台海水浴場', // 추정
    zh: '海云台海水浴场',
    es: '해운대해수욕장' // 추정
  }
};

// 해외 명소 예시 (실제 확인된 것들)
const overseasExamples = {
  'Eiffel Tower': {
    ko: '에펠탑',
    en: 'Eiffel Tower',
    ja: 'エッフェル塔',
    zh: '埃菲尔铁塔',
    es: 'Torre Eiffel'
  },
  'Louvre Museum': {
    ko: 'museo del louvre', // DB에서 확인됨
    en: 'museo del louvre',
    ja: 'museo del louvre',
    zh: 'Louvre Museum',
    es: 'museo del louvre'
  },
  'Colosseum': {
    ko: 'Colosseum',
    en: 'Colosseum', 
    ja: 'コロッセオ',
    zh: 'Colosseum',
    es: 'Colosseum'
  }
};

async function checkAllTranslatedGuides() {
    console.log('🔍 번역된 명소 이름으로 실제 가이드 현황 확인');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
        // 모든 가이드 조회
        const response = await axios.get('https://fajiwgztfwoiisgnnams.supabase.co/rest/v1/guides', {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y',
                'Content-Type': 'application/json'
            },
            params: {
                select: 'locationname,language,created_at',
                order: 'created_at.desc'
            }
        });
        
        const allGuides = response.data || [];
        console.log(`📊 전체 가이드 개수: ${allGuides.length}개`);
        
        // 언어별 통계
        const languageStats = {};
        const locationsByLanguage = {};
        
        allGuides.forEach(guide => {
            const lang = guide.language;
            const location = guide.locationname;
            
            if (!languageStats[lang]) {
                languageStats[lang] = 0;
                locationsByLanguage[lang] = new Set();
            }
            
            languageStats[lang]++;
            locationsByLanguage[lang].add(location);
        });
        
        console.log('\n📈 언어별 가이드 통계:');
        Object.entries(languageStats).forEach(([lang, count]) => {
            const uniqueLocations = locationsByLanguage[lang].size;
            console.log(`  ${lang}: ${count}개 가이드 (${uniqueLocations}개 고유 명소)`);
        });
        
        console.log('\n📍 언어별 고유 명소 목록:');
        Object.entries(locationsByLanguage).forEach(([lang, locations]) => {
            console.log(`\n${lang} (${locations.size}개):`);
            Array.from(locations).sort().forEach(location => {
                console.log(`  - ${location}`);
            });
        });
        
        // 한국 명소 번역 패턴 분석
        console.log('\n🔍 한국 명소 번역 패턴 분석:');
        const koreanAttractions = ['경복궁', '남산타워', '명동', '해운대해수욕장', '감천문화마을', '자갈치시장', '한라산', '성산일출봉', '중문관광단지', '불국사', '석굴암', '첨성대'];
        
        koreanAttractions.forEach(attraction => {
            console.log(`\n📍 ${attraction}:`);
            const languages = ['ko', 'en', 'ja', 'zh', 'es'];
            
            languages.forEach(lang => {
                const found = allGuides.find(guide => 
                    guide.language === lang && 
                    (guide.locationname === attraction || 
                     guide.locationname.includes(attraction) ||
                     attraction.includes(guide.locationname))
                );
                
                if (found) {
                    console.log(`  ✅ ${lang}: "${found.locationname}"`);
                } else {
                    console.log(`  ❌ ${lang}: 없음`);
                }
            });
        });
        
        // 실제 부족한 가이드 계산
        console.log('\n🎯 실제 부족한 가이드 분석:');
        const targetTotal = 57 * 5; // 285개
        const currentTotal = allGuides.length;
        const shortage = Math.max(0, targetTotal - currentTotal);
        
        console.log(`전체 목표: ${targetTotal}개`);
        console.log(`현재 보유: ${currentTotal}개`);
        console.log(`부족한 가이드: ${shortage}개`);
        
        if (shortage > 0) {
            console.log('\n🔍 부족한 가이드 상세 분석이 필요합니다.');
            console.log('실제로는 번역된 이름으로 저장되어 있을 수 있습니다.');
        } else {
            console.log('\n🎉 목표 가이드 수가 이미 달성되었을 수 있습니다!');
        }
        
        return {
            total: currentTotal,
            target: targetTotal,
            shortage: shortage,
            byLanguage: languageStats,
            allGuides: allGuides
        };
        
    } catch (error) {
        console.error('❌ 가이드 현황 확인 실패:', error);
        return null;
    }
}

if (require.main === module) {
    checkAllTranslatedGuides().catch(console.error);
}

module.exports = { checkAllTranslatedGuides };