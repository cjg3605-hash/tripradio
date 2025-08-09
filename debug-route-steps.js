// 서울 route.steps 구조 상세 확인
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugRouteSteps() {
  try {
    console.log('🔍 서울 route.steps 구조 분석...\n');
    
    const { data: seoulGuide, error } = await supabase
      .from('guides')
      .select('content')
      .eq('locationname', '서울')
      .eq('language', 'ko')
      .single();
    
    if (error || !seoulGuide?.content) {
      console.error('❌ 데이터 없음:', error?.message);
      return;
    }
    
    const content = seoulGuide.content.content || seoulGuide.content;
    
    console.log('📍 route.steps 상세 분석:');
    if (content.route && content.route.steps) {
      console.log('Steps 개수:', content.route.steps.length);
      
      content.route.steps.forEach((step, index) => {
        console.log(`\n=== Step ${index + 1} ===`);
        console.log('전체 구조:', Object.keys(step));
        console.log('title:', step.title);
        console.log('location:', step.location);
        console.log('coordinates:', step.coordinates);
        console.log('description:', step.description);
      });
    }
    
    console.log('\n📖 realTimeGuide.chapters와 비교:');
    if (content.realTimeGuide && content.realTimeGuide.chapters) {
      console.log('Chapters 개수:', content.realTimeGuide.chapters.length);
      
      content.realTimeGuide.chapters.forEach((chapter, index) => {
        console.log(`\n=== Chapter ${index + 1} ===`);
        console.log('id:', chapter.id);
        console.log('title:', chapter.title);
        console.log('coordinates:', chapter.coordinates);
        console.log('narrative 시작:', chapter.narrative?.substring(0, 50) + '...');
      });
    }
    
  } catch (error) {
    console.error('💥 오류:', error);
  }
}

debugRouteSteps();