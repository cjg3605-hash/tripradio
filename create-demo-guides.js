const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수 없음');
  console.error('필요한 환경변수:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 데모 가이드 데이터 (최소 20개)
const demoGuides = [
  {
    location_slug: 'eiffel-tower',
    location_input: 'Eiffel Tower',
    location_names: { ko: '에펠탑', en: 'Eiffel Tower', ja: 'エッフェル塔', zh: '埃菲尔铁塔', es: 'Torre Eiffel' },
    language: 'ko',
    title: '에펠탑 가이드',
    user_script: '에펠탑은 1889년 파리 만국박람회를 위해 지스타브 에펠이 설계한 철제 격자 탑입니다. 높이 330미터로 파리의 상징이자 세계에서 가장 유명한 건축물 중 하나입니다. 에펠탑은 3층으로 이루어져 있으며, 각 층에서 파리의 아름다운 전망을 감상할 수 있습니다. 밤에는 화려한 조명이 켜져 더욱 아름다운 모습을 보여줍니다.',
    duration_seconds: 180,
    chapter_type: 'landmark',
    quality_score: 85
  },
  {
    location_slug: 'colosseum',
    location_input: 'Colosseum',
    location_names: { ko: '콜로세움', en: 'Colosseum', ja: 'コロッセオ', zh: '竞技场', es: 'Coliseo' },
    language: 'ko',
    title: '콜로세움 가이드',
    user_script: '콜로세움은 로마 제국의 상징으로, 약 2,000년 전 건설된 거대한 원형경기장입니다. 5만명 이상을 수용할 수 있었던 이 건축물은 당시 최고의 건축 기술을 보여줍니다. 콜로세움은 검투사들의 경기장으로 사용되었으며, 현재는 로마의 가장 인기 있는 관광지 중 하나입니다.',
    duration_seconds: 200,
    chapter_type: 'landmark',
    quality_score: 87
  },
  {
    location_slug: 'gyeongbokgung',
    location_input: 'Gyeongbokgung',
    location_names: { ko: '경복궁', en: 'Gyeongbokgung Palace', ja: '景福宮', zh: '景福宫', es: 'Palacio Gyeongbokgung' },
    language: 'ko',
    title: '경복궁 가이드',
    user_script: '경복궁은 조선시대 태조 이성계가 창건한 조선의 정궁입니다. 대칭적이고 웅장한 구조로 설계되었으며, 궁궐 안에는 근정전, 강녕전, 교태전 등 주요 건축물들이 있습니다. 경복궁은 한국 전통 건축의 아름다움을 대표하는 유산으로, 현재 국립고궁박물관이 설치되어 있습니다.',
    duration_seconds: 220,
    chapter_type: 'landmark',
    quality_score: 86
  },
  {
    location_slug: 'taj-mahal',
    location_input: 'Taj Mahal',
    location_names: { ko: '타지마할', en: 'Taj Mahal', ja: 'タージ・マハル', zh: '泰姬陵', es: 'Taj Mahal' },
    language: 'ko',
    title: '타지마할 가이드',
    user_script: '타지마할은 인도의 아그라에 위치한 하얀 대리석 건축물로, 무굴 제국의 5대 황제 샤자한이 사랑하는 아내 뭄타즈 마할을 위해 지었습니다. 1632년부터 약 20년에 걸쳐 건설된 이 건축물은 사랑의 기념비로 여겨지며, 대칭적인 설계와 정교한 장식으로 유명합니다.',
    duration_seconds: 210,
    chapter_type: 'landmark',
    quality_score: 88
  }
];

async function createDemoGuides() {
  console.log('📝 데모 가이드 생성 시작...\n');

  for (const guide of demoGuides) {
    try {
      const { data, error } = await supabase
        .from('podcast_episodes')
        .insert([guide])
        .select();

      if (error) {
        console.error(`❌ ${guide.location_slug} 생성 실패:`, error);
      } else {
        console.log(`✅ ${guide.location_slug} 생성 성공`);
      }
    } catch (err) {
      console.error(`❌ ${guide.location_slug} 오류:`, err.message);
    }
  }

  console.log('\n✅ 데모 가이드 생성 완료!');
}

createDemoGuides();
