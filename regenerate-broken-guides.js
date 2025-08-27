#!/usr/bin/env node
// 잘못된 구조 가이드들을 삭제하고 원래 프로젝트 로직으로 재생성

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// broken-guides-list.json 로드
const brokenGuidesList = JSON.parse(fs.readFileSync('broken-guides-list.json', 'utf8'));

// API 호출 헬퍼 (원래 프로젝트 로직과 동일)
async function callAPI(endpoint, data) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text.substring(0, 200)}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`❌ API 호출 실패 (${endpoint}):`, error.message);
    return { success: false, error: error.message };
  }
}

// 기존 가이드 삭제
async function deleteGuide(guideId, locationname, language) {
  try {
    console.log(`   🗑️ 삭제 중: ${locationname} (${language}) - ID: ${guideId}`);
    
    const { error } = await supabase
      .from('guides')
      .delete()
      .eq('id', guideId);
    
    if (error) throw error;
    
    console.log(`   ✅ 삭제 완료: ${locationname} (${language})`);
    return true;
  } catch (error) {
    console.error(`   ❌ 삭제 실패: ${locationname} (${language})`, error);
    return false;
  }
}

// 원래 프로젝트 로직으로 가이드 재생성
async function regenerateGuide(guideInfo) {
  const { locationname, language } = guideInfo;
  
  console.log(`   🔄 재생성 중: ${locationname} (${language})`);
  
  // 원래 검색어 박스 로직과 동일하게 호출
  try {
    // 1. 먼저 장소 검증 및 정보 추출 (disambiguate API)
    const disambiguateResult = await callAPI('/locations/disambiguate', {
      query: locationname,
      language: language
    });
    
    if (!disambiguateResult.success) {
      console.log(`   ⚠️ 장소 검증 실패, 직접 생성 시도: ${locationname}`);
    }
    
    // 2. 가이드 생성 API 호출 (원래 검색박스 로직과 동일)
    const generateResult = await callAPI('/ai/generate-guide-with-gemini', {
      locationName: locationname,
      language: language,
      userProfile: {
        interests: ['history', 'culture', 'architecture'],
        ageGroup: '30s',
        knowledgeLevel: 'intermediate',
        companions: 'couple',
        tourDuration: 120,
        preferredStyle: 'immersive'
      }
    });
    
    if (generateResult.success) {
      console.log(`   ✅ 재생성 완료: ${locationname} (${language})`);
      console.log(`   🆔 새 가이드 ID: ${generateResult.guideId}`);
      return { 
        success: true, 
        guideId: generateResult.guideId,
        oldId: guideInfo.id
      };
    } else {
      console.error(`   ❌ 재생성 실패: ${locationname} (${language})`, generateResult.error);
      return { 
        success: false, 
        error: generateResult.error,
        oldId: guideInfo.id
      };
    }
    
  } catch (error) {
    console.error(`   ❌ 재생성 과정 오류: ${locationname} (${language})`, error.message);
    return { 
      success: false, 
      error: error.message,
      oldId: guideInfo.id
    };
  }
}

// 재생성된 가이드 구조 검증
async function verifyGuideStructure(guideId, locationname, language) {
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('content')
      .eq('id', guideId)
      .single();
    
    if (error) throw error;
    
    const content = data.content;
    let isValid = true;
    let issues = [];
    
    // 구조 검증
    if (!content || !content.content) {
      isValid = false;
      issues.push('content.content 구조 없음');
    } else {
      const mainContent = content.content;
      
      if (!mainContent.realTimeGuide) {
        isValid = false;
        issues.push('realTimeGuide 없음');
      } else if (Array.isArray(mainContent.realTimeGuide)) {
        isValid = false;
        issues.push('realTimeGuide가 여전히 배열 구조');
      } else if (typeof mainContent.realTimeGuide === 'object') {
        if (!mainContent.realTimeGuide.chapters || !Array.isArray(mainContent.realTimeGuide.chapters)) {
          isValid = false;
          issues.push('chapters 배열 없음');
        } else if (mainContent.realTimeGuide.chapters.length < 1) {
          isValid = false;
          issues.push('챕터 수 부족');
        }
      }
    }
    
    console.log(`   🔍 구조 검증: ${locationname} (${language}) - ${isValid ? '✅ 정상' : '❌ 문제'}`);
    if (!isValid && issues.length > 0) {
      console.log(`   📋 문제점: ${issues.join(', ')}`);
    }
    
    return { isValid, issues };
    
  } catch (error) {
    console.error(`   ❌ 구조 검증 실패: ${locationname} (${language})`, error);
    return { isValid: false, issues: ['검증 실패'] };
  }
}

// 메인 실행 함수
async function main() {
  console.log('🔧 잘못된 구조 가이드 재생성 시작');
  console.log(`📍 대상: ${brokenGuidesList.length}개 가이드`);
  console.log('═'.repeat(60));
  
  let deleteSuccessCount = 0;
  let deleteFailCount = 0;
  let regenerateSuccessCount = 0;
  let regenerateFailCount = 0;
  let verificationPassCount = 0;
  
  const results = [];
  
  for (let i = 0; i < brokenGuidesList.length; i++) {
    const guideInfo = brokenGuidesList[i];
    
    console.log(`\n[${i + 1}/${brokenGuidesList.length}] 처리 중...`);
    console.log(`${'─'.repeat(50)}`);
    console.log(`📍 ${guideInfo.locationname} (${guideInfo.language})`);
    console.log(`🔍 문제: ${guideInfo.issues}`);
    
    try {
      // 1단계: 기존 가이드 삭제
      const deleted = await deleteGuide(guideInfo.id, guideInfo.locationname, guideInfo.language);
      
      if (deleted) {
        deleteSuccessCount++;
        
        // 2단계: 원래 로직으로 재생성
        const regenerateResult = await regenerateGuide(guideInfo);
        
        if (regenerateResult.success) {
          regenerateSuccessCount++;
          
          // 3단계: 구조 검증
          const verification = await verifyGuideStructure(
            regenerateResult.guideId, 
            guideInfo.locationname, 
            guideInfo.language
          );
          
          if (verification.isValid) {
            verificationPassCount++;
          }
          
          results.push({
            guide: `${guideInfo.locationname} (${guideInfo.language})`,
            oldId: regenerateResult.oldId,
            newId: regenerateResult.guideId,
            status: 'success',
            structureValid: verification.isValid,
            issues: verification.issues
          });
        } else {
          regenerateFailCount++;
          results.push({
            guide: `${guideInfo.locationname} (${guideInfo.language})`,
            oldId: regenerateResult.oldId,
            status: 'regenerate_failed',
            error: regenerateResult.error
          });
        }
      } else {
        deleteFailCount++;
        results.push({
          guide: `${guideInfo.locationname} (${guideInfo.language})`,
          oldId: guideInfo.id,
          status: 'delete_failed'
        });
      }
      
      // API 과부하 방지를 위한 대기 (마지막 제외)
      if (i < brokenGuidesList.length - 1) {
        console.log('   ⏳ 5초 대기 중...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
    } catch (error) {
      console.error(`❌ ${guideInfo.locationname} (${guideInfo.language}) 처리 중 오류:`, error);
      results.push({
        guide: `${guideInfo.locationname} (${guideInfo.language})`,
        oldId: guideInfo.id,
        status: 'error',
        error: error.message
      });
    }
  }
  
  // 최종 결과
  console.log('\n' + '═'.repeat(60));
  console.log('🏁 가이드 재생성 완료');
  console.log('═'.repeat(60));
  console.log(`🗑️ 삭제 성공: ${deleteSuccessCount}개`);
  console.log(`❌ 삭제 실패: ${deleteFailCount}개`);
  console.log(`✅ 재생성 성공: ${regenerateSuccessCount}개`);
  console.log(`❌ 재생성 실패: ${regenerateFailCount}개`);
  console.log(`🔍 구조 검증 통과: ${verificationPassCount}개`);
  
  console.log('\n📊 상세 결과:');
  results.forEach((item, index) => {
    console.log(`\n${index + 1}. ${item.guide}`);
    
    if (item.status === 'success') {
      console.log(`   ✅ 성공: ${item.oldId} → ${item.newId}`);
      console.log(`   🔍 구조: ${item.structureValid ? '정상' : '문제'}`);
      if (!item.structureValid && item.issues) {
        console.log(`   📋 이슈: ${item.issues.join(', ')}`);
      }
    } else if (item.status === 'delete_failed') {
      console.log(`   ❌ 삭제 실패`);
    } else if (item.status === 'regenerate_failed') {
      console.log(`   ❌ 재생성 실패: ${item.error}`);
    } else {
      console.log(`   ❌ 처리 실패: ${item.error}`);
    }
  });
  
  if (verificationPassCount === regenerateSuccessCount) {
    console.log('\n🎉 모든 재생성된 가이드가 올바른 구조를 가지고 있습니다!');
  } else {
    console.log(`\n⚠️ ${regenerateSuccessCount - verificationPassCount}개 가이드에서 구조 문제가 여전히 남아있습니다.`);
  }
  
  console.log('\n💡 재생성이 완료되었습니다. 품질검사를 다시 실행해보세요.');
}

// 스크립트 실행
main().catch(error => {
  console.error('💥 스크립트 실행 실패:', error);
  process.exit(1);
});