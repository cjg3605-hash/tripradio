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

// 🌍 가이드 생성 로직과 동일한 지역 정보 추출 함수 (동적)
async function extractRegionalInfoFromLocationName(locationName) {
  try {
    // 1. AI를 이용한 동적 지역정보 추출
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
Location name: "${locationName}"

Analyze this location name and extract regional information. Return ONLY valid JSON in this exact format:
{
  "location_region": "specific region/city name",
  "country_code": "3-letter ISO country code",
  "confidence": 0.9
}

Rules:
- For Korean locations: Use proper Korean administrative divisions (서울특별시, 부산광역시, etc.)
- For international locations: Use major city/region names
- Country codes must be 3-letter ISO 3166-1 alpha-3 (KOR, USA, JPN, CHN, FRA, etc.)
- If uncertain, set confidence < 0.7
- Return null for location_region if unable to determine specific region
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // JSON 추출 및 파싱
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extracted = JSON.parse(jsonMatch[0]);
      console.log(`🔍 동적 분석 결과 - ${locationName}:`, extracted);
      
      // 신뢰도가 낮으면 기본값 반환
      if (extracted.confidence < 0.7) {
        console.log(`⚠️ 신뢰도 낮음 (${extracted.confidence}) - 기본값 사용`);
        return { location_region: null, country_code: null };
      }
      
      return {
        location_region: extracted.location_region,
        country_code: extracted.country_code
      };
    }
    
    // JSON 파싱 실패시 기본값
    return { location_region: null, country_code: null };
    
  } catch (error) {
    console.error(`❌ 동적 분석 실패 - ${locationName}:`, error);
    return { location_region: null, country_code: null };
  }
}

/**
 * 🔍 현재 DB 상태 분석
 */
async function analyzeCurrentState() {
  console.log('\n🔍 현재 DB 국가 코드 분석 중...');
  
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('id, locationname, country_code, location_region')
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
 * 🗂️ 지역정보 업데이트 실행 (location_region, country_code 칼럼 채우기)
 */
async function updateRegionalInfo(dryRun = true) {
  console.log(`\n🗂️ 지역정보 업데이트 ${dryRun ? '(DRY RUN)' : '실행'} 시작...`);
  
  let updateCount = 0;
  let errorCount = 0;
  
  try {
    // 1단계: location_region 또는 country_code가 없는 레코드 조회
    const { data: incompleteRecords, error: selectError } = await supabase
      .from('guides')
      .select('id, locationname, location_region, country_code')
      .or('location_region.is.null,country_code.is.null');
    
    if (selectError) {
      throw selectError;
    }
    
    console.log(`📊 지역정보가 없는 레코드: ${incompleteRecords.length}개`);
    
    if (incompleteRecords.length === 0) {
      console.log('✅ 모든 레코드에 지역정보가 이미 있습니다.');
      return { updateCount: 0, errorCount: 0 };
    }
    
    // 2단계: 각 레코드에 대해 동적 분석 수행
    for (const record of incompleteRecords) {
      try {
        console.log(`\n📍 분석 중: ${record.locationname} (ID: ${record.id})`);
        
        const regionalInfo = await extractRegionalInfoFromLocationName(record.locationname);
        
        if (dryRun) {
          console.log(`🔍 DRY RUN - ${record.locationname}:`);
          console.log(`  현재: region=${record.location_region}, country=${record.country_code}`);
          console.log(`  분석: region=${regionalInfo.location_region}, country=${regionalInfo.country_code}`);
          updateCount++;
          continue;
        }
        
        // 실제 업데이트 (null인 필드만 업데이트)
        const updateData = {};
        if (!record.location_region && regionalInfo.location_region) {
          updateData.location_region = regionalInfo.location_region;
        }
        if (!record.country_code && regionalInfo.country_code) {
          updateData.country_code = regionalInfo.country_code;
        }
        
        if (Object.keys(updateData).length > 0) {
          updateData.updated_at = new Date().toISOString();
          
          const { error: updateError } = await supabase
            .from('guides')
            .update(updateData)
            .eq('id', record.id);
          
          if (updateError) {
            throw updateError;
          }
          
          console.log(`✅ 업데이트 완료: ${record.locationname}`);
          console.log(`  → region: ${updateData.location_region || '변경없음'}`);
          console.log(`  → country: ${updateData.country_code || '변경없음'}`);
          updateCount++;
        } else {
          console.log(`ℹ️ ${record.locationname}: 업데이트할 정보 없음`);
        }
        
        // API 호출 제한 방지 (1초 대기)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ ${record.locationname} 업데이트 실패:`, error);
        errorCount++;
      }
    }
    
  } catch (error) {
    console.error('❌ 지역정보 업데이트 중 오류:', error);
    errorCount++;
  }
  
  console.log(`\n📊 지역정보 업데이트 ${dryRun ? 'DRY RUN ' : ''}완료:`);
  console.log(`  ✅ 업데이트${dryRun ? ' 예정' : '됨'}: ${updateCount}개 레코드`);
  console.log(`  ❌ 실패: ${errorCount}개`);
  
  return { updateCount, errorCount };
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
  const updateRegional = args.includes('--update-regional');
  const migrateCountries = args.includes('--migrate-countries') || (!updateRegional && !args.includes('--update-regional'));
  
  console.log('🌍 DB 조직화 및 국가 코드 마이그레이션 도구');
  console.log('===============================================');
  
  if (dryRun) {
    console.log('ℹ️ DRY RUN 모드 - 실제 변경하지 않고 시뮬레이션만 실행');
    console.log('ℹ️ 실제 실행하려면 --execute 플래그 사용');
  } else {
    console.log('⚠️ 실제 DB 업데이트 모드');
  }
  
  console.log('\n📋 사용 가능한 옵션:');
  console.log('  --update-regional    : 지역정보 업데이트 (location_region, country_code 채우기)');
  console.log('  --migrate-countries  : 2글자 → 3글자 국가코드 마이그레이션');
  console.log('  --execute           : 실제 DB 업데이트 실행');
  
  try {
    if (updateRegional) {
      // 지역정보 업데이트 실행
      console.log('\n🗂️ 지역정보 업데이트 작업 시작...');
      const result = await updateRegionalInfo(dryRun);
      
      if (dryRun) {
        console.log('\n💡 실제 지역정보 업데이트를 실행하려면:');
        console.log('node scripts/migrate-country-codes-to-alpha3.js --update-regional --execute');
      }
      
    } else if (migrateCountries) {
      // 기존 국가코드 마이그레이션 실행
      console.log('\n🔄 국가 코드 마이그레이션 작업 시작...');
      
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
        console.log('node scripts/migrate-country-codes-to-alpha3.js --migrate-countries --execute');
      }
    }
    
  } catch (error) {
    console.error('\n❌ 작업 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { 
  analyzeCurrentState, 
  migrateCountryCodes, 
  verifyMigration,
  updateRegionalInfo,
  extractRegionalInfoFromLocationName
};