// 서울 가이드 세부 구조 확인
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugSeoulDetail() {
  try {
    console.log('🔍 서울 한국어 가이드 세부 구조 분석...\n');
    
    const { data: seoulGuide, error } = await supabase
      .from('guides')
      .select('content')
      .eq('locationname', '서울')
      .eq('language', 'ko')
      .single();
    
    if (error) {
      console.error('❌ 오류:', error.message);
      return;
    }
    
    if (!seoulGuide || !seoulGuide.content) {
      console.error('❌ 서울 가이드 없음');
      return;
    }
    
    const content = seoulGuide.content.content || seoulGuide.content;
    
    console.log('📋 content 최상위 구조:');
    console.log(Object.keys(content));
    
    console.log('\n📖 overview 구조:');
    if (content.overview) {
      console.log('Overview keys:', Object.keys(content.overview));
      console.log('Title:', content.overview.title);
      console.log('Location:', content.overview.location);
      console.log('Background:', content.overview.background?.substring(0, 100) + '...');
      console.log('KeyFeatures:', content.overview.keyFeatures?.substring(0, 100) + '...');
      
      if (content.overview.keyFacts) {
        console.log('\n🔑 keyFacts 구조:');
        console.log('keyFacts type:', typeof content.overview.keyFacts);
        console.log('keyFacts isArray:', Array.isArray(content.overview.keyFacts));
        if (Array.isArray(content.overview.keyFacts)) {
          content.overview.keyFacts.forEach((fact, index) => {
            console.log(`${index + 1}.`, typeof fact, fact);
          });
        } else {
          console.log('keyFacts content:', content.overview.keyFacts);
        }
      }
      
      if (content.overview.visitInfo) {
        console.log('\n📍 visitInfo 구조:');
        console.log(content.overview.visitInfo);
      }
    }
    
    console.log('\n🗺️ realTimeGuide 구조:');
    if (content.realTimeGuide && content.realTimeGuide.chapters) {
      console.log('Chapters 개수:', content.realTimeGuide.chapters.length);
      content.realTimeGuide.chapters.slice(0, 2).forEach((chapter, index) => {
        console.log(`\n챕터 ${index + 1}:`, {
          title: chapter.title,
          hasCoordinates: !!chapter.coordinates,
          coordinates: chapter.coordinates,
          hasNarrative: !!chapter.narrative
        });
      });
    }
    
    console.log('\n📍 route 구조:');
    if (content.route && content.route.steps) {
      console.log('Steps 개수:', content.route.steps.length);
      content.route.steps.slice(0, 2).forEach((step, index) => {
        console.log(`\n스텝 ${index + 1}:`, {
          title: step.title,
          location: step.location,
          hasCoordinates: !!step.coordinates
        });
      });
    }
    
    // 주요 특징에 사용할 수 있는 데이터 찾기
    console.log('\n🔍 주요 특징 데이터 후보들:');
    if (content.overview?.keyFacts) {
      console.log('1. overview.keyFacts 사용 가능');
    }
    if (content.overview?.keyFeatures) {
      console.log('2. overview.keyFeatures 텍스트에서 추출 가능');
    }
    if (content.overview?.background) {
      console.log('3. overview.background 텍스트에서 추출 가능');
    }
    
  } catch (error) {
    console.error('💥 오류:', error);
  }
}

debugSeoulDetail();