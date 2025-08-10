#!/usr/bin/env node

/**
 * 가이드 구조 디버깅 스크립트
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// 환경변수 로드
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Supabase 클라이언트
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugGuideStructure() {
  console.log('🔍 자갈치시장 가이드 구조 분석\n');

  try {
    // 자갈치시장 가이드 조회
    const { data: guides, error } = await supabase
      .from('guides')
      .select('id, locationname, language, content')
      .ilike('locationname', '%자갈치%')
      .eq('language', 'ko');

    if (error) throw error;
    
    if (!guides || guides.length === 0) {
      console.log('❌ 자갈치시장 가이드를 찾을 수 없습니다');
      return;
    }

    const guide = guides[0];
    console.log('📋 가이드 기본 정보:');
    console.log('ID:', guide.id);
    console.log('위치명:', guide.locationname);
    console.log('언어:', guide.language);
    
    console.log('\n📖 Content 구조 분석:');
    if (guide.content) {
      console.log('content 최상위 키들:', Object.keys(guide.content));
      
      // content.content 구조 확인 
      if (guide.content.content && guide.content.content.realTimeGuide) {
        console.log('content.content.realTimeGuide 키들:', Object.keys(guide.content.content.realTimeGuide));
        
        if (guide.content.content.realTimeGuide.chapters) {
          console.log('chapters 길이:', guide.content.content.realTimeGuide.chapters.length);
          
          const chapter0 = guide.content.content.realTimeGuide.chapters[0];
          if (chapter0) {
            console.log('\n🎯 인트로 챕터 (chapters[0]) 구조:');
            console.log('키들:', Object.keys(chapter0));
            console.log('title:', chapter0.title);
            console.log('chapterNumber:', chapter0.chapterNumber);
            
            // 좌표 정보 확인
            console.log('\n📍 좌표 정보:');
            console.log('coordinate 존재:', chapter0.coordinate ? '있음' : '없음');
            console.log('coordinates 존재:', chapter0.coordinates ? '있음' : '없음');
            
            if (chapter0.coordinate) {
              console.log('coordinate 키들:', Object.keys(chapter0.coordinate));
              console.log('coordinate 내용:', chapter0.coordinate);
            }
            
            if (chapter0.coordinates) {
              console.log('coordinates 키들:', Object.keys(chapter0.coordinates));
              console.log('coordinates 내용:', chapter0.coordinates);
            }
          }
        }
      } else if (guide.content.realTimeGuide) {
        console.log('realTimeGuide 키들:', Object.keys(guide.content.realTimeGuide));
        
        if (guide.content.realTimeGuide.chapters) {
          console.log('chapters 길이:', guide.content.realTimeGuide.chapters.length);
          
          const chapter0 = guide.content.realTimeGuide.chapters[0];
          if (chapter0) {
            console.log('\n🎯 인트로 챕터 (chapters[0]) 구조:');
            console.log('키들:', Object.keys(chapter0));
            console.log('title:', chapter0.title);
            console.log('chapterNumber:', chapter0.chapterNumber);
            
            // 좌표 정보 확인
            console.log('\n📍 좌표 정보:');
            console.log('coordinate 존재:', chapter0.coordinate ? '있음' : '없음');
            console.log('coordinates 존재:', chapter0.coordinates ? '있음' : '없음');
            
            if (chapter0.coordinate) {
              console.log('coordinate 키들:', Object.keys(chapter0.coordinate));
              console.log('coordinate 내용:', chapter0.coordinate);
            }
            
            if (chapter0.coordinates) {
              console.log('coordinates 키들:', Object.keys(chapter0.coordinates));
              console.log('coordinates 내용:', chapter0.coordinates);
            }
          }
        }
      }
    } else {
      console.log('❌ content가 없습니다');
    }

  } catch (error) {
    console.error('❌ 구조 분석 실패:', error);
  }
}

// 실행
if (require.main === module) {
  debugGuideStructure();
}

module.exports = debugGuideStructure;