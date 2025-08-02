#!/usr/bin/env node

// 가이드 로딩 무한로딩 디버깅 스크립트

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

// .env.local 파일 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugGuideLoading() {
  console.log('🔍 가이드 로딩 무한로딩 디버깅 시작...\n');
  
  try {
    // 1. 최근 생성된 가이드 확인
    console.log('1️⃣ 최근 생성된 가이드 확인');
    const { data: recentGuides, error: recentError } = await supabase
      .from('guides')
      .select('locationname, language, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5);
    
    if (recentError) {
      console.error('❌ 최근 가이드 조회 실패:', recentError.message);
      return;
    }
    
    console.log('📋 최근 가이드 목록:');
    recentGuides?.forEach((guide, index) => {
      console.log(`  ${index + 1}. ${guide.locationname} (${guide.language}) - ${guide.updated_at}`);
    });
    
    if (!recentGuides || recentGuides.length === 0) {
      console.log('⚠️ 생성된 가이드가 없습니다.');
      return;
    }
    
    // 2. 첫 번째 가이드의 데이터 구조 확인
    const testGuide = recentGuides[0];
    console.log(`\n2️⃣ 가이드 데이터 구조 확인: ${testGuide.locationname} (${testGuide.language})`);
    
    const { data: guideData, error: guideError } = await supabase
      .from('guides')
      .select('content')
      .eq('locationname', testGuide.locationname)
      .eq('language', testGuide.language)
      .single();
    
    if (guideError) {
      console.error('❌ 가이드 데이터 조회 실패:', guideError.message);
      return;
    }
    
    if (!guideData || !guideData.content) {
      console.log('❌ 가이드 content가 없습니다.');
      return;
    }
    
    console.log('✅ 가이드 content 존재');
    console.log('📊 Content 최상위 키:', Object.keys(guideData.content));
    
    // content 내부 구조 확인
    if (guideData.content.content) {
      console.log('📊 content.content 키:', Object.keys(guideData.content.content));
      
      if (guideData.content.content.realTimeGuide) {
        const rtGuide = guideData.content.content.realTimeGuide;
        console.log('✅ realTimeGuide 존재');
        console.log('📊 realTimeGuide 키:', Object.keys(rtGuide));
        
        if (rtGuide.chapters) {
          console.log(`📚 챕터 수: ${rtGuide.chapters.length}개`);
          if (rtGuide.chapters.length > 0) {
            console.log('📖 첫 번째 챕터 키:', Object.keys(rtGuide.chapters[0]));
          }
        } else {
          console.log('❌ chapters가 없습니다.');
        }
      } else {
        console.log('❌ realTimeGuide가 없습니다.');
      }
    } else if (guideData.content.realTimeGuide) {
      console.log('✅ 직접 realTimeGuide 구조');
      const rtGuide = guideData.content.realTimeGuide;
      console.log('📊 realTimeGuide 키:', Object.keys(rtGuide));
      
      if (rtGuide.chapters) {
        console.log(`📚 챕터 수: ${rtGuide.chapters.length}개`);
      }
    } else {
      console.log('❌ realTimeGuide를 찾을 수 없습니다.');
      console.log('📊 content 구조:', JSON.stringify(guideData.content, null, 2).substring(0, 500) + '...');
    }
    
    // 3. 정규화 함수 테스트
    console.log('\n3️⃣ 정규화 함수 테스트');
    try {
      const normalizeGuideData = (data, locationName) => {
        if (!data) {
          throw new Error('가이드 데이터가 없습니다.');
        }

        let sourceData = data;
        
        if (data.content && typeof data.content === 'object') {
          sourceData = data.content;
          console.log('📦 content 필드에서 데이터 추출');
        } else if (data.overview || data.route || data.realTimeGuide) {
          sourceData = data;
          console.log('📦 직접 구조에서 데이터 추출');
        } else {
          console.error('❌ 올바른 가이드 구조를 찾을 수 없음:', Object.keys(data));
          throw new Error('올바른 가이드 데이터 구조가 아닙니다.');
        }

        // realTimeGuide 확인
        if (sourceData.realTimeGuide) {
          console.log('✅ 정규화 성공 - realTimeGuide 존재');
          return { success: true, chapters: sourceData.realTimeGuide.chapters?.length || 0 };
        } else if (sourceData.content && sourceData.content.realTimeGuide) {
          console.log('✅ 정규화 성공 - 중첩된 realTimeGuide 존재');
          return { success: true, chapters: sourceData.content.realTimeGuide.chapters?.length || 0 };
        } else {
          console.log('❌ 정규화 실패 - realTimeGuide 없음');
          return { success: false };
        }
      };
      
      const result = normalizeGuideData(guideData, testGuide.locationname);
      console.log('📊 정규화 결과:', result);
      
    } catch (error) {
      console.error('❌ 정규화 함수 오류:', error.message);
    }
    
    console.log('\n🎉 디버깅 완료!');
    
  } catch (error) {
    console.error('❌ 디버깅 중 오류:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  debugGuideLoading().catch(console.error);
}