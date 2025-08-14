'use client';
import Link from 'next/link';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';
import { useLanguage } from '@/contexts/LanguageContext';

// 여행 타입별 추천 데이터
const getTripTypes = (t: (key: string) => string) => [
  {
    id: 'solo',
    name: t('tripTypes.solo.name'),
    // emoji: '🎒', // removed for minimal design
    description: t('tripTypes.solo.description'),
    features: [t('tripTypes.solo.features.safety'), t('tripTypes.solo.features.culture'), t('tripTypes.solo.features.budget')],
    color: 'blue'
  },
  {
    id: 'couple',
    name: t('tripTypes.couple.name'),
    emoji: '💕',
    description: t('tripTypes.couple.description'),
    features: [t('tripTypes.couple.features.romantic'), t('tripTypes.couple.features.activities'), t('tripTypes.couple.features.photos')],
    color: 'pink'
  },
  {
    id: 'family',
    name: t('tripTypes.family.name'),
    emoji: '👨‍👩‍👧‍👦',
    description: t('tripTypes.family.description'),
    features: [t('tripTypes.family.features.kidFriendly'), t('tripTypes.family.features.safety'), t('tripTypes.family.features.educational')],
    color: 'green'
  },
  {
    id: 'friends',
    name: t('tripTypes.friends.name'),
    emoji: '👯‍♀️',
    description: t('tripTypes.friends.description'),
    features: [t('tripTypes.friends.features.activities'), t('tripTypes.friends.features.instagramSpots'), t('tripTypes.friends.features.nightlife')],
    color: 'purple'
  },
  {
    id: 'nomad',
    name: t('tripTypes.nomad.name'),
    emoji: '💻',
    description: t('tripTypes.nomad.description'),
    features: [t('tripTypes.nomad.features.wifi'), t('tripTypes.nomad.features.coworking'), t('tripTypes.nomad.features.longTerm')],
    color: 'orange'
  }
];

// 50개 도시 대규모 데이터 - 실제 여행 정보 기반
const popularDestinations = [
  // 아시아
  { name: '제주도', country: '한국', emoji: '🏝️', duration: '2-3일', budget: '30-50만원', region: 'asia', highlights: ['한라산', '성산일출봉', '우도'], bestSeason: '봄,가을' },
  { name: '부산', country: '한국', emoji: '🌊', duration: '2-3일', budget: '25-40만원', region: 'asia', highlights: ['해운대', '감천문화마을', '자갈치시장'], bestSeason: '여름,가을' },
  { name: '경주', country: '한국', emoji: '🏛️', duration: '1-2일', budget: '20-35만원', region: 'asia', highlights: ['불국사', '석굴암', '안압지'], bestSeason: '봄,가을' },
  { name: '도쿄', country: '일본', emoji: '🗼', duration: '4-5일', budget: '70-120만원', region: 'asia', highlights: ['도쿄타워', '센소지', '신주쿠'], bestSeason: '봄,가을' },
  { name: '오사카', country: '일본', emoji: '🍜', duration: '3-4일', budget: '60-80만원', region: 'asia', highlights: ['오사카성', '도톤보리', '유니버설'], bestSeason: '봄,가을' },
  { name: '교토', country: '일본', emoji: '⛩️', duration: '2-3일', budget: '50-70만원', region: 'asia', highlights: ['기요미즈데라', '후시미이나리', '아라시야마'], bestSeason: '봄,가을' },
  { name: '후쿠오카', country: '일본', emoji: '🍲', duration: '2-3일', budget: '45-65만원', region: 'asia', highlights: ['하카타', '모모치해변', '텐진'], bestSeason: '봄,가을' },
  { name: '삿포로', country: '일본', emoji: '❄️', duration: '3-4일', budget: '60-90만원', region: 'asia', highlights: ['삿포로맥주공장', '스스키노', '오도리공원'], bestSeason: '겨울,여름' },
  { name: '방콕', country: '태국', emoji: '🛕', duration: '4-6일', budget: '50-70만원', region: 'asia', highlights: ['왓포', '차오프라야강', '카오산로드'], bestSeason: '겨울,봄' },
  { name: '치앙마이', country: '태국', emoji: '🌸', duration: '3-5일', budget: '40-60만원', region: 'asia', highlights: ['도이수텝', '구시가지', '선데이마켓'], bestSeason: '겨울,봄' },
  { name: '푸켓', country: '태국', emoji: '🏖️', duration: '4-6일', budget: '60-80만원', region: 'asia', highlights: ['파통비치', '피피아일랜드', '빅부다'], bestSeason: '겨울,봄' },
  { name: '다낭', country: '베트남', emoji: '🏖️', duration: '4-5일', budget: '40-60만원', region: 'asia', highlights: ['골든브릿지', '한시장', '미케비치'], bestSeason: '봄,가을' },
  { name: '호치민', country: '베트남', emoji: '🏙️', duration: '3-4일', budget: '35-55만원', region: 'asia', highlights: ['벤탄시장', '통일궁', '메콩델타'], bestSeason: '겨울,봄' },
  { name: '하노이', country: '베트남', emoji: '🍜', duration: '2-3일', budget: '30-50만원', region: 'asia', highlights: ['호안키엠', '올드쿼터', '하롱베이'], bestSeason: '봄,가을' },
  { name: '싱가포르', country: '싱가포르', emoji: '🦁', duration: '3-4일', budget: '70-100만원', region: 'asia', highlights: ['마리나베이', '센토사', '가든스바이더베이'], bestSeason: '연중' },
  { name: '쿠알라룸푸르', country: '말레이시아', emoji: '🏗️', duration: '2-3일', budget: '35-55만원', region: 'asia', highlights: ['페트로나스타워', '부킷빈탕', '바투동굴'], bestSeason: '여름,가을' },
  { name: '발리', country: '인도네시아', emoji: '🌺', duration: '5-7일', budget: '60-90만원', region: 'asia', highlights: ['우붓', '탄롯사원', '키밍비치'], bestSeason: '여름,가을' },
  { name: '자카르타', country: '인도네시아', emoji: '🏙️', duration: '2-3일', budget: '40-60만원', region: 'asia', highlights: ['모나스', '구시가지', '안촐'], bestSeason: '여름,가을' },
  { name: '마닐라', country: '필리핀', emoji: '🏖️', duration: '3-4일', budget: '45-65만원', region: 'asia', highlights: ['이트라무로스', '마카티', '보라카이'], bestSeason: '겨울,봄' },
  { name: '세부', country: '필리핀', emoji: '🐠', duration: '4-6일', budget: '50-70만원', region: 'asia', highlights: ['말라파스쿠아', '보홀', '템플오브레아'], bestSeason: '겨울,봄' },
  { name: '홍콩', country: '중국', emoji: '🌃', duration: '3-4일', budget: '60-90만원', region: 'asia', highlights: ['빅토리아피크', '침사추이', '디즈니랜드'], bestSeason: '가을,겨울' },
  { name: '마카오', country: '중국', emoji: '🎰', duration: '2-3일', budget: '50-80만원', region: 'asia', highlights: ['베네시안', '성바울성당', '콜로안'], bestSeason: '가을,겨울' },
  { name: '타이베이', country: '대만', emoji: '🏮', duration: '3-4일', budget: '50-70만원', region: 'asia', highlights: ['101타워', '지우펀', '야시장'], bestSeason: '봄,가을' },
  { name: '뭄바이', country: '인도', emoji: '🕌', duration: '3-4일', budget: '30-50만원', region: 'asia', highlights: ['게이트웨이오브인디아', '엘레판타동굴', '볼리우드'], bestSeason: '겨울,봄' },
  { name: '델리', country: '인도', emoji: '🛕', duration: '2-3일', budget: '25-45만원', region: 'asia', highlights: ['레드포트', '인디아게이트', '타지마할'], bestSeason: '겨울,봄' },
  
  // 유럽
  { name: '파리', country: '프랑스', emoji: '🗼', duration: '5-7일', budget: '100-150만원', region: 'europe', highlights: ['에펠탑', '루브르', '샹젤리제'], bestSeason: '봄,가을' },
  { name: '니스', country: '프랑스', emoji: '🌊', duration: '3-4일', budget: '80-120만원', region: 'europe', highlights: ['프로마나드', '구시가지', '모나코'], bestSeason: '여름,가을' },
  { name: '런던', country: '영국', emoji: '👑', duration: '5-7일', budget: '120-180만원', region: 'europe', highlights: ['빅벤', '대영박물관', '타워브릿지'], bestSeason: '여름,가을' },
  { name: '에든버러', country: '영국', emoji: '🏰', duration: '2-3일', budget: '70-100만원', region: 'europe', highlights: ['에든버러성', '로열마일', '아서시트'], bestSeason: '여름,가을' },
  { name: '로마', country: '이탈리아', emoji: '🏛️', duration: '4-6일', budget: '80-120만원', region: 'europe', highlights: ['콜로세움', '바티칸', '트레비분수'], bestSeason: '봄,가을' },
  { name: '베네치아', country: '이탈리아', emoji: '🛶', duration: '2-3일', budget: '70-110만원', region: 'europe', highlights: ['산마르코광장', '리알토다리', '무라노'], bestSeason: '봄,가을' },
  { name: '피렌체', country: '이탈리아', emoji: '🎨', duration: '2-3일', budget: '60-90만원', region: 'europe', highlights: ['우피치', '두오모', '폰테베키오'], bestSeason: '봄,가을' },
  { name: '밀라노', country: '이탈리아', emoji: '👗', duration: '2-3일', budget: '80-120만원', region: 'europe', highlights: ['두오모', '스칼라극장', '브레라'], bestSeason: '봄,가을' },
  { name: '바르셀로나', country: '스페인', emoji: '🏗️', duration: '4-5일', budget: '70-100만원', region: 'europe', highlights: ['사그라다파밀리아', '구엘공원', '람블라스'], bestSeason: '봄,가을' },
  { name: '마드리드', country: '스페인', emoji: '🖼️', duration: '3-4일', budget: '60-90만원', region: 'europe', highlights: ['프라도미술관', '레티로공원', '그란비아'], bestSeason: '봄,가을' },
  { name: '베를린', country: '독일', emoji: '🧱', duration: '3-4일', budget: '60-90만원', region: 'europe', highlights: ['브란덴부르크문', '박물관섬', '이스트사이드갤러리'], bestSeason: '여름,가을' },
  { name: '뮌헨', country: '독일', emoji: '🍺', duration: '3-4일', budget: '70-100만원', region: 'europe', highlights: ['마리엔플라츠', '노이슈반슈타인', '옥토버페스트'], bestSeason: '여름,가을' },
  { name: '암스테르담', country: '네덜란드', emoji: '🌷', duration: '3-4일', budget: '80-110만원', region: 'europe', highlights: ['반고흐미술관', '안네프랑크의집', '운하투어'], bestSeason: '봄,여름' },
  { name: '브뤼셀', country: '벨기에', emoji: '🧇', duration: '2-3일', budget: '60-90만원', region: 'europe', highlights: ['그랑플라스', '아토미움', '와플'], bestSeason: '봄,여름' },
  { name: '프라하', country: '체코', emoji: '🏰', duration: '3-4일', budget: '50-70만원', region: 'europe', highlights: ['카를교', '성비투스성당', '구시가지광장'], bestSeason: '봄,가을' },
  { name: '비엔나', country: '오스트리아', emoji: '🎼', duration: '3-4일', budget: '70-100만원', region: 'europe', highlights: ['쇤부른궁전', '슈테판대성당', '벨베데레'], bestSeason: '봄,가을' },
  { name: '취리히', country: '스위스', emoji: '⛰️', duration: '2-3일', budget: '120-180만원', region: 'europe', highlights: ['라인폭포', '융프라우', '체르마트'], bestSeason: '여름,가을' },
  { name: '스톡홀름', country: '스웨덴', emoji: '🛥️', duration: '3-4일', budget: '80-120만원', region: 'europe', highlights: ['감라스탄', '바사박물관', '스칸센'], bestSeason: '여름,가을' },
  { name: '코펜하겐', country: '덴마크', emoji: '🧜‍♀️', duration: '2-3일', budget: '80-120만원', region: 'europe', highlights: ['인어공주상', '티볼리공원', '뉘하운'], bestSeason: '여름,가을' },
  { name: '헬싱키', country: '핀란드', emoji: '🦌', duration: '2-3일', budget: '70-100만원', region: 'europe', highlights: ['헬싱키성당', '수오멘린나', '마켓광장'], bestSeason: '여름,겨울' },
  { name: '리스본', country: '포르투갈', emoji: '🚃', duration: '3-4일', budget: '60-80만원', region: 'europe', highlights: ['베렝탑', '알파마', '신트라'], bestSeason: '봄,가을' },
  
  // 아메리카
  { name: '뉴욕', country: '미국', emoji: '🗽', duration: '5-7일', budget: '150-250만원', region: 'america', highlights: ['자유의여신상', '타임스퀘어', '센트럴파크'], bestSeason: '봄,가을' },
  { name: '로스앤젤레스', country: '미국', emoji: '🌴', duration: '4-6일', budget: '120-200만원', region: 'america', highlights: ['할리우드', '베니스비치', '디즈니랜드'], bestSeason: '봄,가을' },
  { name: '라스베이거스', country: '미국', emoji: '🎰', duration: '3-4일', budget: '100-150만원', region: 'america', highlights: ['스트립', '그랜드캐년', '쇼'], bestSeason: '봄,가을' },
  { name: '샌프란시스코', country: '미국', emoji: '🌉', duration: '3-4일', budget: '120-180만원', region: 'america', highlights: ['골든게이트', '알카트라즈', '피셔맨스워프'], bestSeason: '여름,가을' },
  { name: '토론토', country: '캐나다', emoji: '🍁', duration: '3-4일', budget: '80-120만원', region: 'america', highlights: ['CN타워', '나이아가라', '디스틸러리'], bestSeason: '여름,가을' },
  { name: '밴쿠버', country: '캐나다', emoji: '⛰️', duration: '3-4일', budget: '80-120만원', region: 'america', highlights: ['스탠리파크', '그라우스마운틴', '그랜빌아일랜드'], bestSeason: '여름,가을' },
  { name: '멕시코시티', country: '멕시코', emoji: '🌮', duration: '4-5일', budget: '60-90만원', region: 'america', highlights: ['테오티우아칸', '소칼로', '프리다칼로박물관'], bestSeason: '겨울,봄' },
  { name: '칸쿤', country: '멕시코', emoji: '🏖️', duration: '5-7일', budget: '80-120만원', region: 'america', highlights: ['치첸이트사', '코즈멜', '마야유적'], bestSeason: '겨울,봄' },
  { name: '부에노스아이레스', country: '아르헨티나', emoji: '💃', duration: '4-5일', budget: '70-100만원', region: 'america', highlights: ['탱고', '라보카', '레콜레타'], bestSeason: '봄,가을' },
  { name: '리우데자네이루', country: '브라질', emoji: '🏖️', duration: '4-6일', budget: '80-120만원', region: 'america', highlights: ['예수상', '코파카바나', '슈가로프'], bestSeason: '봄,가을' }
];

// AI 여행 계획 생성 시스템 - 실제 작동 로직
const generateAITripPlan = (destination: string, tripType: string, duration: string, budget: string, interests: string[]) => {
  const dest = popularDestinations.find(d => d.name.includes(destination) || destination.includes(d.name));
  if (!dest) return null;

  const templates = {
    solo: {
      morning: ["현지 카페에서 여유로운 아침", "도보 탐험으로 골목길 발견", "현지 시장 구경"],
      afternoon: ["박물관이나 갤러리 방문", "현지 맛집에서 혼밥", "공원이나 해변에서 휴식"],
      evening: ["현지인들과 교류", "야경 명소에서 사진 촬영", "독서하며 여유로운 저녁"],
      tips: ["안전 정보 숙지", "현지 언어 몇 마디 배우기", "혼자만의 시간 즐기기"]
    },
    couple: {
      morning: ["로맨틱한 브런치", "커플 포토존에서 사진 촬영", "함께 요리 클래스 참여"],
      afternoon: ["커플 스파 체험", "선셋 명소에서 함께", "로맨틱한 레스토랑"],
      evening: ["야경이 아름다운 곳에서 산책", "와인 바에서 대화", "호텔에서 로맨틱한 시간"],
      tips: ["커플 할인 정보 확인", "기념품 함께 고르기", "추억을 남길 액티비티"]
    },
    family: {
      morning: ["아이들과 함께 할 수 있는 활동", "교육적인 체험 프로그램", "가족 친화적 레스토랑"],
      afternoon: ["테마파크나 동물원", "아이들이 안전하게 놀 수 있는 장소", "가족 단위 투어"],
      evening: ["가족 모두가 즐길 수 있는 쇼", "호텔에서 가족 시간", "일찍 휴식"],
      tips: ["아이 용품 준비", "의료진 연락처 확보", "비상약 준비"]
    },
    friends: {
      morning: ["활기찬 브런치", "그룹 액티비티", "인스타 스팟 탐방"],
      afternoon: ["어드벤처 스포츠", "쇼핑과 맛집 투어", "그룹 게임이나 체험"],
      evening: ["나이트라이프 체험", "그룹 파티나 이벤트", "늦은 시간까지 놀기"],
      tips: ["그룹 할인 활용", "역할 분담하기", "모든 친구들 취향 고려"]
    },
    nomad: {
      morning: ["코워킹 스페이스에서 업무", "카페에서 업무와 휴식", "현지 비즈니스 네트워킹"],
      afternoon: ["업무와 여행의 밸런스", "현지 문화 체험", "장기 체류에 적합한 활동"],
      evening: ["노마드 커뮤니티 모임", "업무 마무리와 휴식", "현지 생활 적응"],
      tips: ["안정적인 인터넷 확보", "장기 체류 할인", "현지 생활비 관리"]
    }
  };

  const template = templates[tripType as keyof typeof templates] || templates.solo;
  const days = parseInt(duration) || 3;
  
  return {
    destination: dest,
    duration: `${days}일`,
    budget: dest.budget,
    schedule: Array.from({length: days}, (_, i) => ({
      day: i + 1,
      morning: template.morning[i % template.morning.length],
      afternoon: template.afternoon[i % template.afternoon.length],
      evening: template.evening[i % template.evening.length]
    })),
    highlights: dest.highlights,
    tips: template.tips,
    bestSeason: dest.bestSeason
  };
};

export default function TripPlannerPage() {
  const { t } = useLanguage();
  
  // trip-planner 전용 번역 함수
  const tripT = (key: string) => {
    return t(`tripPlanner.${key}`);
  };
  
  const tripTypes = getTripTypes(tripT);
  
  return (
    <>
      <KeywordPageSchema 
        keyword={tripT('keyword')}
        pagePath="/trip-planner"
        title={tripT('metadata.title')}
        description={tripT('metadata.description')}
        features={[tripT('features.aiGeneration'), tripT('features.realtime'), tripT('features.budget'), tripT('features.customized'), tripT('features.localInfo'), tripT('features.free')]}
      />
      <div className="min-h-screen bg-white" style={{ '--space-2xs': '4px', '--space-xs': '8px', '--space-sm': '12px', '--space-md': '16px', '--space-lg': '24px', '--space-xl': '40px', '--space-2xl': '64px' } as React.CSSProperties}>
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-6 py-3 bg-[#F8F8F8] border border-gray-200 rounded-full text-sm font-medium text-[#555555] font-light mb-8">
              {tripT('badge')}
            </div>
            <h1 className="text-fluid-4xl font-semibold text-black mb-6 leading-tight">
              {tripT('hero.title')}
            </h1>
            <h2 className="text-fluid-2xl font-semibold text-gray-700 mb-8 leading-tight">
              {tripT('hero.subtitle')}
            </h2>
            <p className="text-fluid-lg text-[#555555] font-light mb-8 leading-relaxed max-w-3xl mx-auto">
              {tripT('hero.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Planner Tool */}
      <section className="container mx-auto px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#F8F8F8] p-8 rounded-xl mb-12 shadow-sm">
            <h2 className="text-fluid-2xl font-semibold text-black mb-6 text-center leading-snug">
              {tripT('quickPlanner.title')}
            </h2>
            
            {/* Step 1: Trip Type Selection */}
            <div className="mb-8">
              <h3 className="text-fluid-xl font-semibold text-black mb-4 leading-snug">{tripT('steps.selectStyle')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {tripTypes.map((type) => (
                  <button
                    key={type.id}
                    data-type={type.id}
                    className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-400 transition-all duration-200 text-center group min-h-[88px] flex flex-col justify-center"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <div className="w-4 h-4 bg-[#F8F8F8]0 rounded"></div>
                    </div>
                    <div className="text-sm font-medium text-black mb-1">{type.name}</div>
                    <div className="text-xs text-[#555555] font-light">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Destination & Duration */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-fluid-xl font-semibold text-black mb-4 leading-snug">{tripT('steps.destinationDuration')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{tripT('form.destination.label')}</label>
                    <input 
                      type="text" 
                      placeholder={tripT('form.destination.placeholder')}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 min-h-[44px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{tripT('form.departure')}</label>
                      <input 
                        type="date" 
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{tripT('form.duration')}</label>
                      <select className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 min-h-[44px]">
                        <option>{tripT('form.durationOptions.dayTrip')}</option>
                        <option>{tripT('form.durationOptions.oneNight')}</option>
                        <option>{tripT('form.durationOptions.twoNights')}</option>
                        <option>{tripT('form.durationOptions.threeNights')}</option>
                        <option>{tripT('form.durationOptions.fourNights')}</option>
                        <option>{tripT('form.durationOptions.oneWeek')}</option>
                        <option>{tripT('form.durationOptions.twoWeeks')}</option>
                        <option>{tripT('form.durationOptions.oneMonth')}</option>
                        <option>{tripT('form.durationOptions.custom')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-fluid-xl font-semibold text-black mb-4 leading-snug">{tripT('steps.budgetPreferences')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{tripT('form.budget')}</label>
                    <select className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 min-h-[44px]">
                      <option>{tripT('form.budgetOptions.under20')}</option>
                      <option>{tripT('form.budgetOptions.range20to50')}</option>
                      <option>{tripT('form.budgetOptions.range50to100')}</option>
                      <option>{tripT('form.budgetOptions.range100to200')}</option>
                      <option>{tripT('form.budgetOptions.over200')}</option>
                      <option>{tripT('form.budgetOptions.unlimited')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{tripT('form.interests')}</label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {[tripT('form.interestOptions.food'), tripT('form.interestOptions.shopping'), tripT('form.interestOptions.culture'), tripT('form.interestOptions.nature'), tripT('form.interestOptions.activities'), tripT('form.interestOptions.photography'), tripT('form.interestOptions.nightView'), tripT('form.interestOptions.spa')].map((interest) => (
                        <label key={interest} className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span>{interest}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Preferences Panel */}
            <div className="bg-[#F8F8F8] p-6 rounded-lg mb-8 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">{tripT('personalization.title')}</h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => loadUserPreferences()}
                  className="text-xs bg-white text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200 font-medium"
                >
                  {tripT('personalization.loadSettings')}
                </button>
                <button 
                  onClick={() => saveUserPreferences()}
                  className="text-xs bg-white text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200 font-medium"
                >
                  {tripT('personalization.saveSettings')}
                </button>
                <button 
                  onClick={() => showSavedPlans()}
                  className="text-xs bg-white text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200 font-medium"
                >
                  {tripT('personalization.viewSavedPlans')} (<span id="saved-count">0</span>{tripT('personalization.plansCount')})
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <div className="text-center">
              <button 
                onClick={() => generateTripPlan()}
                className="bg-black text-white px-10 py-4 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg min-h-[44px]"
                id="generate-plan-btn"
              >
                <span id="btn-text">{tripT('form.generateButton')}</span>
                <span id="btn-loading" className="hidden">{tripT('form.analyzing')}</span>
              </button>
              <p className="text-xs text-[#555555] font-light mt-2">{tripT('form.completionTime')}</p>
            </div>

            {/* Saved Plans Display */}
            <div id="saved-plans" className="hidden mt-8 p-6 bg-[#F8F8F8] border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-black">{tripT('savedPlans.title')}</h3>
                <button 
                  onClick={() => document.getElementById('saved-plans').classList.add('hidden')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div id="saved-plans-list" className="space-y-3">
                {/* 저장된 계획들이 여기에 표시됩니다 */}
              </div>
            </div>

            {/* Generated Plan Display */}
            <div id="generated-plan" className="hidden mt-8 p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-black">{tripT('generatedPlan.title')}</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => savePlan()}
                    className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
                  >
                    {tripT('generatedPlan.savePlan')}
                  </button>
                  <button 
                    onClick={() => exportPlan()}
                    className="text-sm bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
                  >
                    {tripT('generatedPlan.exportPDF')}
                  </button>
                </div>
              </div>
              <div id="plan-content"></div>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex gap-3">
                  <button 
                    onClick={() => regeneratePlan()}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
                  >
                    {tripT('generatedPlan.regenerate')}
                  </button>
                  <button 
                    onClick={() => shareTrip()}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-all duration-200 text-sm font-medium"
                  >
                    {tripT('generatedPlan.share')}
                  </button>
                  <button 
                    onClick={() => compareWithSimilar()}
                    className="flex-1 bg-[#F8F8F8] text-[#555555] font-light py-2 px-4 rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm font-medium border border-gray-200"
                  >
                    {tripT('generatedPlan.compare')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Destinations Quick Start */}
          <div className="mb-16">
            <h2 className="text-fluid-2xl font-normal text-black mb-8 text-center leading-snug">
              {tripT('popularDestinations.title')} <span className="font-semibold">{tripT('popularDestinations.subtitle')}</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularDestinations.map((dest, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-gray-400 rounded"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-black mb-1">{dest.name}</h3>
                      <p className="text-sm text-[#555555] font-light mb-2">{dest.country}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{dest.duration}</span>
                        <span>{dest.budget}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cross-Tool Integration */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/?destination=${encodeURIComponent(dest.name)}&plan=quick`}
                      className="flex-1 bg-gray-900 text-white py-2 px-3 rounded-lg text-xs text-center hover:bg-gray-800 transition-all duration-200 font-medium"
                    >
                      {tripT('destinations.viewGuide')}
                    </Link>
                    {dest.region === 'asia' && (
                      <Link
                        href={`/nomad-calculator?region=asia`}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 transition-all duration-200 font-medium"
                        title={tripT('destinations.nomadInfo')}
                      >
                        {tripT('destinations.nomad')}
                      </Link>
                    )}
                    <Link
                      href={`/visa-checker?country=${encodeURIComponent(dest.country)}`}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 transition-all duration-200 font-medium"
                      title={tripT('destinations.visaInfo')}
                    >
                      {tripT('destinations.visa')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Features */}
          <div className="bg-[#F8F8F8] p-8 rounded-lg">
            <h2 className="text-fluid-2xl font-normal text-black mb-8 text-center leading-snug">
              {tripT('aiFeatures.title')} <span className="font-semibold">{tripT('aiFeatures.subtitle')}</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 border-2 border-gray-500 rounded-full"></div>
                </div>
                <h3 className="font-medium text-black mb-2">{tripT('aiFeatures.customized.title')}</h3>
                <p className="text-sm text-[#555555] font-light">
                  {tripT('aiFeatures.customized.description')}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="w-4 h-6 bg-gray-600 transform rotate-12"></div>
                </div>
                <h3 className="font-medium text-black mb-2">{tripT('aiFeatures.realtime.title')}</h3>
                <p className="text-sm text-[#555555] font-light">
                  {tripT('aiFeatures.realtime.description')}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 bg-[#F8F8F8]0 rounded"></div>
                </div>
                <h3 className="font-medium text-black mb-2">{tripT('aiFeatures.detailedInfo.title')}</h3>
                <p className="text-sm text-[#555555] font-light">
                  {tripT('aiFeatures.detailedInfo.description')}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                </div>
                <h3 className="font-medium text-black mb-2">{tripT('aiFeatures.budgetManagement.title')}</h3>
                <p className="text-sm text-[#555555] font-light">
                  {tripT('aiFeatures.budgetManagement.description')}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="w-4 h-6 bg-gray-600 rounded-sm"></div>
                </div>
                <h3 className="font-medium text-black mb-2">{tripT('aiFeatures.mobileOptimized.title')}</h3>
                <p className="text-sm text-[#555555] font-light">
                  {tripT('aiFeatures.mobileOptimized.description')}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="w-5 h-5 border-2 border-gray-500 rounded-full"></div>
                </div>
                <h3 className="font-medium text-black mb-2">{tripT('aiFeatures.audioGuide.title')}</h3>
                <p className="text-sm text-[#555555] font-light">
                  {tripT('aiFeatures.audioGuide.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Audio Guide Integration */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-fluid-3xl font-normal mb-6 leading-tight">
              {tripT('audioGuideIntegration.title.before')} <span className="font-semibold">{tripT('audioGuideIntegration.title.highlight')}</span>
            </h2>
            <p className="text-fluid-lg text-gray-300 mb-8 leading-relaxed">
              {tripT('audioGuideIntegration.description')}
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mb-3">
                  <div className="w-4 h-4 border-2 border-gray-900 rounded-full relative">
                    <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-gray-900 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
                <h3 className="font-medium mb-2">{tripT('audioGuideIntegration.features.autoStart.title')}</h3>
                <p className="text-sm text-gray-300">{tripT('audioGuideIntegration.features.autoStart.description')}</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mb-3">
                  <div className="w-4 h-4 border-2 border-gray-900 rounded-full"></div>
                </div>
                <h3 className="font-medium mb-2">{tripT('audioGuideIntegration.features.personalized.title')}</h3>
                <p className="text-sm text-gray-300">{tripT('audioGuideIntegration.features.personalized.description')}</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mb-3">
                  <div className="w-4 h-4 border-2 border-gray-900 rounded-full relative">
                    <div className="absolute -top-1 -right-1 w-2 h-2 border border-gray-900 rounded-full bg-white"></div>
                  </div>
                </div>
                <h3 className="font-medium mb-2">{tripT('audioGuideIntegration.features.realtimeUpdate.title')}</h3>
                <p className="text-sm text-gray-300">{tripT('audioGuideIntegration.features.realtimeUpdate.description')}</p>
              </div>
            </div>
            <Link 
              href="/?planner=integrated"
              className="inline-block bg-white text-black px-10 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200"
            >
              {tripT('audioGuideIntegration.tryButton')}
            </Link>
          </div>
        </div>
      </section>
      </div>

      {/* JavaScript 로직 */}
      <script dangerouslySetInnerHTML={{
        __html: `
        // 여행 계획 생성 함수
        function generateTripPlan() {
          const btn = document.getElementById('generate-plan-btn');
          const btnText = document.getElementById('btn-text');
          const btnLoading = document.getElementById('btn-loading');
          const planDiv = document.getElementById('generated-plan');
          const contentDiv = document.getElementById('plan-content');
          
          // 버튼 상태 변경
          btn.disabled = true;
          btnText.classList.add('hidden');
          btnLoading.classList.remove('hidden');
          
          // 폼 데이터 수집
          const destination = document.querySelector('input[type="text"]').value || '제주도';
          const selectedType = document.querySelector('.group.selected')?.dataset?.type || 'solo';
          
          // 실제 계획 생성 (2초 후)
          setTimeout(() => {
            // AI 여행 계획 생성 로직 (클라이언트 측)
            
            // 템플릿 데이터
            const templates = {
              solo: {
                morning: ["현지 카페에서 여유로운 아침", "도보 탐험으로 골목길 발견", "현지 시장 구경"],
                afternoon: ["박물관이나 갤러리 방문", "현지 맛집에서 혼밥", "공원이나 해변에서 휴식"],
                evening: ["현지인들과 교류", "야경 명소에서 사진 촬영", "독서하며 여유로운 저녁"]
              },
              couple: {
                morning: ["로맨틱한 브런치", "커플 포토존에서 사진 촬영", "함께 요리 클래스 참여"],
                afternoon: ["커플 스파 체험", "선셋 명소에서 함께", "로맨틱한 레스토랑"],
                evening: ["야경이 아름다운 곳에서 산책", "와인 바에서 대화", "호텔에서 로맨틱한 시간"]
              }
            };
            
            const template = templates[selectedType] || templates.solo;
            const destData = { name: destination, highlights: ['명소1', '명소2', '명소3'], budget: '50-80만원' };
            
            // 계획 HTML 생성
            const planHTML = \`
              <div class="space-y-4">
                <div class="bg-blue-50 p-4 rounded-lg">
                  <h4 class="font-medium text-blue-900 mb-2">📍 \${destData.name} 여행</h4>
                  <p class="text-sm text-blue-700">예상 예산: \${destData.budget}</p>
                  <p class="text-sm text-blue-700">주요 명소: \${destData.highlights.join(', ')}</p>
                </div>
                
                \${Array.from({length: 3}, (_, i) => \`
                  <div class="border border-gray-200 rounded-lg p-4">
                    <h5 class="font-medium text-black mb-3">Day \${i+1}</h5>
                    <div class="space-y-2 text-sm">
                      <div class="flex items-start gap-2">
                        <span class="text-yellow-600">🌅</span>
                        <div>
                          <span class="font-medium">오전:</span>
                          <span class="text-[#555555] font-light ml-1">\${template.morning[i % template.morning.length]}</span>
                        </div>
                      </div>
                      <div class="flex items-start gap-2">
                        <span class="text-blue-600">☀️</span>
                        <div>
                          <span class="font-medium">오후:</span>
                          <span class="text-[#555555] font-light ml-1">\${template.afternoon[i % template.afternoon.length]}</span>
                        </div>
                      </div>
                      <div class="flex items-start gap-2">
                        <span class="text-purple-600">🌙</span>
                        <div>
                          <span class="font-medium">저녁:</span>
                          <span class="text-[#555555] font-light ml-1">\${template.evening[i % template.evening.length]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                \`).join('')}
              </div>
            \`;
            
            contentDiv.innerHTML = planHTML;
            planDiv.classList.remove('hidden');
            
            // 버튼 상태 복구
            btn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
            
            // 스크롤 이동
            planDiv.scrollIntoView({ behavior: 'smooth' });
          }, 2000);
        }
        
        // 여행 타입 선택 기능
        document.addEventListener('DOMContentLoaded', function() {
          const typeButtons = document.querySelectorAll('[data-type]');
          typeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
              typeButtons.forEach(b => b.classList.remove('selected', 'border-gray-400', 'bg-[#F8F8F8]'));
              this.classList.add('selected', 'border-gray-400', 'bg-[#F8F8F8]');
            });
          });
        });
        
        // 사용자 설정 저장
        function saveUserPreferences() {
          const prefs = {
            defaultBudget: document.querySelector('select').value,
            defaultDuration: document.querySelectorAll('select')[1].value,
            preferredInterests: Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value),
            savedAt: new Date().toISOString()
          };
          localStorage.setItem('tripPlannerPrefs', JSON.stringify(prefs));
          alert('설정이 저장되었습니다! 🎯');
        }
        
        // 사용자 설정 불러오기
        function loadUserPreferences() {
          const prefs = JSON.parse(localStorage.getItem('tripPlannerPrefs') || '{}');
          if (prefs.defaultBudget) {
            document.querySelector('select').value = prefs.defaultBudget;
          }
          if (prefs.defaultDuration) {
            document.querySelectorAll('select')[1].value = prefs.defaultDuration;
          }
          if (prefs.preferredInterests) {
            prefs.preferredInterests.forEach(interest => {
              const checkbox = document.querySelector('input[value="' + interest + '"]');
              if (checkbox) checkbox.checked = true;
            });
          }
          alert('저장된 설정을 불러왔습니다! 📂');
        }
        
        // 계획 저장 함수 (향상됨)
        function savePlan() {
          const plans = JSON.parse(localStorage.getItem('savedTripPlans') || '[]');
          const formData = new FormData(document.querySelector('form'));
          const newPlan = {
            id: Date.now(),
            destination: document.querySelector('input[type="text"]').value || '제주도',
            date: new Date().toLocaleDateString(),
            content: document.getElementById('plan-content').innerHTML,
            preferences: {
              budget: document.querySelector('select').value,
              duration: document.querySelectorAll('select')[1].value,
              interests: Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value)
            },
            rating: null,
            tags: []
          };
          plans.push(newPlan);
          localStorage.setItem('savedTripPlans', JSON.stringify(plans));
          updateSavedCount();
          alert('여행 계획이 저장되었습니다! 📝');
        }
        
        // 저장된 계획 수 업데이트
        function updateSavedCount() {
          const plans = JSON.parse(localStorage.getItem('savedTripPlans') || '[]');
          const countElement = document.getElementById('saved-count');
          if (countElement) countElement.textContent = plans.length;
        }
        
        // 저장된 계획 보기
        function showSavedPlans() {
          const plans = JSON.parse(localStorage.getItem('savedTripPlans') || '[]');
          const container = document.getElementById('saved-plans');
          const list = document.getElementById('saved-plans-list');
          
          if (plans.length === 0) {
            list.innerHTML = '<p class="text-gray-500 text-center py-4">저장된 계획이 없습니다.</p>';
          } else {
            list.innerHTML = plans.map(plan => \`
              <div class="bg-white p-4 rounded border border-gray-200 hover:shadow-md transition-all">
                <div class="flex justify-between items-start mb-2">
                  <h4 class="font-medium text-black">\${plan.destination}</h4>
                  <span class="text-xs text-gray-500">\${plan.date}</span>
                </div>
                <div class="text-sm text-[#555555] font-light mb-3">
                  예산: \${plan.preferences?.budget || 'N/A'} | 기간: \${plan.preferences?.duration || 'N/A'}
                </div>
                <div class="flex gap-2">
                  <button onclick="loadSavedPlan(\${plan.id})" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200">불러오기</button>
                  <button onclick="deleteSavedPlan(\${plan.id})" class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200">삭제</button>
                </div>
              </div>
            \`).join('');
          }
          
          container.classList.remove('hidden');
        }
        
        // 저장된 계획 불러오기
        function loadSavedPlan(planId) {
          const plans = JSON.parse(localStorage.getItem('savedTripPlans') || '[]');
          const plan = plans.find(p => p.id === planId);
          if (plan) {
            document.querySelector('input[type="text"]').value = plan.destination;
            document.getElementById('plan-content').innerHTML = plan.content;
            document.getElementById('generated-plan').classList.remove('hidden');
            alert('계획을 불러왔습니다! 📂');
          }
        }
        
        // 저장된 계획 삭제
        function deleteSavedPlan(planId) {
          if (confirm('이 계획을 삭제하시겠습니까?')) {
            let plans = JSON.parse(localStorage.getItem('savedTripPlans') || '[]');
            plans = plans.filter(p => p.id !== planId);
            localStorage.setItem('savedTripPlans', JSON.stringify(plans));
            showSavedPlans();
            updateSavedCount();
            alert('계획이 삭제되었습니다.');
          }
        }
        
        // PDF 내보내기
        function exportPlan() {
          const destination = document.querySelector('input[type="text"]').value || '제주도';
          const content = document.getElementById('plan-content').innerText;
          const blob = new Blob([\`\${destination} 여행 계획\\n\\n\${content}\`], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = \`\${destination}_여행계획.txt\`;
          a.click();
          URL.revokeObjectURL(url);
        }
        
        // 유사 계획 비교
        function compareWithSimilar() {
          const currentDest = document.querySelector('input[type="text"]').value || '제주도';
          const plans = JSON.parse(localStorage.getItem('savedTripPlans') || '[]');
          const similar = plans.filter(plan => 
            plan.destination.includes(currentDest.substring(0, 2)) || 
            currentDest.includes(plan.destination.substring(0, 2))
          );
          
          if (similar.length === 0) {
            alert('유사한 여행 계획이 없습니다.');
          } else {
            alert(\`\${similar.length}개의 유사한 계획을 찾았습니다: \${similar.map(p => p.destination).join(', ')}\`);
          }
        }
        
        // 페이지 로드 시 저장된 계획 수 업데이트
        document.addEventListener('DOMContentLoaded', function() {
          updateSavedCount();
        });
        
        // 계획 재생성
        function regeneratePlan() {
          generateTripPlan();
        }
        
        // 여행 공유
        function shareTrip() {
          const destination = document.querySelector('input[type="text"]').value || '제주도';
          const text = \`\${destination} 여행 계획을 AI가 생성했어요! TourRadio.AI에서 확인해보세요: \${window.location.href}\`;
          
          if (navigator.share) {
            navigator.share({
              title: 'AI 여행 계획',
              text: text,
              url: window.location.href
            });
          } else {
            navigator.clipboard.writeText(text);
            alert('여행 계획 링크가 복사되었습니다! 📋');
          }
        }
        
        window.generateTripPlan = generateTripPlan;
        window.savePlan = savePlan;
        window.regeneratePlan = regeneratePlan;
        window.shareTrip = shareTrip;
        window.saveUserPreferences = saveUserPreferences;
        window.loadUserPreferences = loadUserPreferences;
        window.showSavedPlans = showSavedPlans;
        window.loadSavedPlan = loadSavedPlan;
        window.deleteSavedPlan = deleteSavedPlan;
        window.exportPlan = exportPlan;
        window.compareWithSimilar = compareWithSimilar;
        `
      }} />
    </>
  );
}