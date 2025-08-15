/**
 * 🌍 국가 코드 마이그레이션: ISO 3166-1 alpha-2 → alpha-3
 * 
 * 기존 DB의 2글자 국가 코드를 3글자 코드로 업데이트
 */

// 환경변수 로드
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  console.error('필요한 환경변수: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 2글자 → 3글자 코드 매핑
const countryCodeMapping = {
  'KR': 'KOR',
  'CN': 'CHN', 
  'JP': 'JPN',
  'US': 'USA',
  'FR': 'FRA',
  'IT': 'ITA',
  'ES': 'ESP',
  'DE': 'DEU',
  'GB': 'GBR',
  'AU': 'AUS',
  'CA': 'CAN',
  'IN': 'IND',
  'BR': 'BRA',
  'RU': 'RUS',
  'MX': 'MEX',
  'TH': 'THA',
  'VN': 'VNM',
  'ID': 'IDN',
  'MY': 'MYS',
  'SG': 'SGP',
  'PE': 'PER',  // 페루
  'AR': 'ARG',  // 아르헨티나
  'VA': 'VAT',  // 바티칸
  'ZA': 'ZAF'   // 남아프리카공화국
};

/**
 * 🔍 현재 DB 상태 분석
 */
async function analyzeCurrentState() {
  console.log('\n🔍 현재 DB 국가 코드 분석 중...');
  
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('id, locationname, country_code')
      .not('country_code', 'is', null);
    
    if (error) {
      throw error;
    }
    
    const countryStats = {};
    data.forEach(guide => {
      const code = guide.country_code;
      countryStats[code] = (countryStats[code] || 0) + 1;
    });
    
    console.log('\n📊 현재 국가 코드 통계:');
    Object.entries(countryStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([code, count]) => {
        const mapped = countryCodeMapping[code] || code;
        const status = countryCodeMapping[code] ? '→ ' + mapped : '(변경 없음)';
        console.log(`  ${code}: ${count}개 ${status}`);
      });
    
    const needsUpdate = Object.keys(countryStats).filter(code => countryCodeMapping[code]);
    const totalNeedsUpdate = needsUpdate.reduce((sum, code) => sum + countryStats[code], 0);
    
    console.log(`\n📋 업데이트 필요: ${totalNeedsUpdate}개 레코드 (${needsUpdate.length}개 국가 코드)`);
    
    return {
      totalRecords: data.length,
      countryStats,
      needsUpdate: totalNeedsUpdate
    };
    
  } catch (error) {
    console.error('❌ DB 분석 실패:', error);
    throw error;
  }
}

/**
 * 🔄 국가 코드 마이그레이션 실행
 */
async function migrateCountryCodes(dryRun = true) {
  console.log(`\n🔄 국가 코드 마이그레이션 ${dryRun ? '(DRY RUN)' : '실행'} 시작...`);
  
  let updateCount = 0;
  let errorCount = 0;
  
  for (const [oldCode, newCode] of Object.entries(countryCodeMapping)) {
    try {
      console.log(`\n📝 ${oldCode} → ${newCode} 업데이트 중...`);
      
      // 1단계: 대상 레코드 조회
      const { data: targetRecords, error: selectError } = await supabase
        .from('guides')
        .select('id, locationname, country_code')
        .eq('country_code', oldCode);
      
      if (selectError) {
        throw selectError;
      }
      
      if (targetRecords.length === 0) {
        console.log(`  ℹ️ ${oldCode} 코드를 사용하는 레코드 없음`);
        continue;
      }
      
      console.log(`  📊 ${targetRecords.length}개 레코드 발견`);
      
      if (dryRun) {
        console.log(`  🔍 DRY RUN: ${oldCode} → ${newCode} (${targetRecords.length}개)`);
        targetRecords.slice(0, 3).forEach(record => {
          console.log(`    - ${record.locationname} (ID: ${record.id})`);
        });
        if (targetRecords.length > 3) {
          console.log(`    ... 외 ${targetRecords.length - 3}개`);
        }
        updateCount += targetRecords.length;
        continue;
      }
      
      // 2단계: 실제 업데이트 실행
      const { error: updateError } = await supabase
        .from('guides')
        .update({ 
          country_code: newCode,
          updated_at: new Date().toISOString()
        })
        .eq('country_code', oldCode);
      
      if (updateError) {
        throw updateError;
      }
      
      console.log(`  ✅ ${targetRecords.length}개 레코드 업데이트 완료: ${oldCode} → ${newCode}`);
      updateCount += targetRecords.length;
      
      // API 호출 제한 방지
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`  ❌ ${oldCode} → ${newCode} 업데이트 실패:`, error);
      errorCount++;
    }
  }
  
  console.log(`\n📊 마이그레이션 ${dryRun ? 'DRY RUN ' : ''}완료:`);
  console.log(`  ✅ 업데이트${dryRun ? ' 예정' : '됨'}: ${updateCount}개 레코드`);
  console.log(`  ❌ 실패: ${errorCount}개`);
  
  return { updateCount, errorCount };
}

/**
 * 🔍 마이그레이션 결과 검증
 */
async function verifyMigration() {
  console.log('\n🔍 마이그레이션 결과 검증 중...');
  
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('country_code')
      .not('country_code', 'is', null);
    
    if (error) {
      throw error;
    }
    
    const countryStats = {};
    data.forEach(guide => {
      const code = guide.country_code;
      countryStats[code] = (countryStats[code] || 0) + 1;
    });
    
    console.log('\n📊 마이그레이션 후 국가 코드 분포:');
    Object.entries(countryStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([code, count]) => {
        const isThreeChar = code.length === 3;
        const status = isThreeChar ? '✅' : '⚠️';
        console.log(`  ${status} ${code}: ${count}개`);
      });
    
    const twoCharCodes = Object.keys(countryStats).filter(code => code.length === 2);
    
    if (twoCharCodes.length === 0) {
      console.log('\n✅ 모든 국가 코드가 3글자로 마이그레이션 완료!');
    } else {
      console.log(`\n⚠️ 아직 2글자 코드가 남아있음: ${twoCharCodes.join(', ')}`);
    }
    
    return twoCharCodes.length === 0;
    
  } catch (error) {
    console.error('❌ 검증 실패:', error);
    return false;
  }
}

/**
 * 🎯 메인 실행 함수
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');
  
  console.log('🌍 국가 코드 마이그레이션 도구');
  console.log('=====================================');
  
  if (dryRun) {
    console.log('ℹ️ DRY RUN 모드 - 실제 변경하지 않고 시뮬레이션만 실행');
    console.log('ℹ️ 실제 실행하려면 --execute 플래그 사용');
  } else {
    console.log('⚠️ 실제 DB 업데이트 모드');
  }
  
  try {
    // 1단계: 현재 상태 분석
    const analysis = await analyzeCurrentState();
    
    if (analysis.needsUpdate === 0) {
      console.log('\n✅ 업데이트가 필요한 레코드가 없습니다.');
      return;
    }
    
    // 2단계: 마이그레이션 실행
    const result = await migrateCountryCodes(dryRun);
    
    // 3단계: 실제 실행 후 검증
    if (!dryRun && result.updateCount > 0) {
      await verifyMigration();
    }
    
    if (dryRun) {
      console.log('\n💡 실제 마이그레이션을 실행하려면:');
      console.log('node scripts/migrate-country-codes-to-alpha3.js --execute');
    }
    
  } catch (error) {
    console.error('\n❌ 마이그레이션 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { analyzeCurrentState, migrateCountryCodes, verifyMigration };