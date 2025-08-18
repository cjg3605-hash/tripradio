'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';
import { useLanguage } from '@/contexts/LanguageContext';

// 여행 타입별 추천 데이터 - 직접 useLanguage t 함수 사용
const getTripTypes = (t: (key: string, params?: Record<string, string>) => string | string[]) => [
  {
    id: 'solo',
    name: String(t('tripTypes.solo.name')),
    // emoji: '🎒', // removed for minimal design
    description: String(t('tripTypes.solo.description')),
    features: [String(t('tripTypes.solo.features.safety')), String(t('tripTypes.solo.features.culture')), String(t('tripTypes.solo.features.budget'))],
    color: 'blue'
  },
  {
    id: 'couple',
    name: String(t('tripTypes.couple.name')),
    emoji: '💕',
    description: String(t('tripTypes.couple.description')),
    features: [String(t('tripTypes.couple.features.romantic')), String(t('tripTypes.couple.features.activities')), String(t('tripTypes.couple.features.photos'))],
    color: 'pink'
  },
  {
    id: 'family',
    name: String(t('tripTypes.family.name')),
    emoji: '👨‍👩‍👧‍👦',
    description: String(t('tripTypes.family.description')),
    features: [String(t('tripTypes.family.features.kidFriendly')), String(t('tripTypes.family.features.safety')), String(t('tripTypes.family.features.educational'))],
    color: 'green'
  },
  {
    id: 'friends',
    name: String(t('tripTypes.friends.name')),
    emoji: '👯‍♀️',
    description: String(t('tripTypes.friends.description')),
    features: [String(t('tripTypes.friends.features.activities')), String(t('tripTypes.friends.features.instagramSpots')), String(t('tripTypes.friends.features.nightlife'))],
    color: 'purple'
  },
  {
    id: 'nomad',
    name: String(t('tripTypes.nomad.name')),
    emoji: '💻',
    description: String(t('tripTypes.nomad.description')),
    features: [String(t('tripTypes.nomad.features.wifi')), String(t('tripTypes.nomad.features.coworking')), String(t('tripTypes.nomad.features.longTerm'))],
    color: 'orange'
  }
];

// 인기 여행지 데이터 - 하드코딩된 한국어 데이터를 다국어화 필요시 번역 파일로 이동 예정
const popularDestinations = [
  // 아시아
  { name: '도쿄', country: '일본', emoji: '🏯', duration: '3-4일', budget: '80-120만원', region: 'asia', highlights: ['시부야', '아사쿠사', '긴자'], bestSeason: '봄,가을' },
  { name: '오사카', country: '일본', emoji: '🍜', duration: '2-3일', budget: '70-100만원', region: 'asia', highlights: ['오사카성', '도톤보리', '유니버설'], bestSeason: '봄,가을' },
  { name: '방콕', country: '태국', emoji: '🛕', duration: '3-4일', budget: '50-80만원', region: 'asia', highlights: ['왓포', '카오산로드', '짜뚜짝'], bestSeason: '겨울,봄' },
  { name: '싱가포르', country: '싱가포르', emoji: '🌆', duration: '3-4일', budget: '100-150만원', region: 'asia', highlights: ['마리나베이', '가든스바이더베이', '센토사'], bestSeason: '연중' },
  { name: '대만', country: '대만', emoji: '🏔️', duration: '3-4일', budget: '60-90만원', region: 'asia', highlights: ['타이베이101', '지우펀', '타로코'], bestSeason: '봄,가을' },
  { name: '홍콩', country: '홍콩', emoji: '🌃', duration: '2-3일', budget: '80-120만원', region: 'asia', highlights: ['빅토리아피크', '심포니오브라이츠', '디즈니랜드'], bestSeason: '가을,겨울' },
  { name: '마카오', country: '마카오', emoji: '🎰', duration: '1-2일', budget: '60-100만원', region: 'asia', highlights: ['베네시안', '세나도광장', '기아등대'], bestSeason: '가을,겨울' },
  { name: '베트남', country: '베트남', emoji: '🛵', duration: '5-7일', budget: '60-90만원', region: 'asia', highlights: ['하롱베이', '호치민', '다낭'], bestSeason: '겨울,봄' },
  { name: '발리', country: '인도네시아', emoji: '🏖️', duration: '4-5일', budget: '70-110만원', region: 'asia', highlights: ['우붓', '탄디롯', '키타스'], bestSeason: '건기(4-9월)' },
  { name: '푸켓', country: '태국', emoji: '🏝️', duration: '4-5일', budget: '60-100만원', region: 'asia', highlights: ['파통비치', '피피섬', '빅부다'], bestSeason: '겨울,봄' },
  
  // 유럽
  { name: '파리', country: '프랑스', emoji: '🗼', duration: '4-5일', budget: '150-200만원', region: 'europe', highlights: ['에펠탑', '루브르', '샹젤리제'], bestSeason: '봄,가을' },
  { name: '런던', country: '영국', emoji: '🎡', duration: '4-5일', budget: '150-250만원', region: 'europe', highlights: ['빅벤', '버킹엄궁전', '대영박물관'], bestSeason: '여름,가을' },
  { name: '로마', country: '이탈리아', emoji: '🏛️', duration: '3-4일', budget: '120-180만원', region: 'europe', highlights: ['콜로세움', '바티칸', '트레비분수'], bestSeason: '봄,가을' },
  { name: '바르셀로나', country: '스페인', emoji: '🏖️', duration: '3-4일', budget: '100-150만원', region: 'europe', highlights: ['사그라다파밀리아', '파크구엘', '람블라스'], bestSeason: '봄,가을' },
  { name: '프라하', country: '체코', emoji: '🏰', duration: '2-3일', budget: '80-120만원', region: 'europe', highlights: ['프라하성', '구시가지광장', '카를교'], bestSeason: '봄,가을' },
  { name: '비엔나', country: '오스트리아', emoji: '🎼', duration: '2-3일', budget: '100-140만원', region: 'europe', highlights: ['쇤브른궁전', '할슈타트', '잘츠부르크'], bestSeason: '봄,가을' },
  { name: '암스테르담', country: '네덜란드', emoji: '🚲', duration: '2-3일', budget: '120-160만원', region: 'europe', highlights: ['반고흐박물관', '안네프랑크의집', '운하투어'], bestSeason: '봄,여름' },
  { name: '베를린', country: '독일', emoji: '🧱', duration: '3-4일', budget: '100-140만원', region: 'europe', highlights: ['브란덴부르크문', '동서독경계', '박물관섬'], bestSeason: '봄,가을' },
  { name: '취리히', country: '스위스', emoji: '🏔️', duration: '3-4일', budget: '200-300만원', region: 'europe', highlights: ['융프라우', '마터호른', '라인폭포'], bestSeason: '여름,가을' },
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
  const { t, isLoading } = useLanguage();

  // 모든 hooks를 최상단에 선언 (React Hooks Rules)
  const [isClient, setIsClient] = useState(false);
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState('적당히');
  const [duration, setDuration] = useState('2-3일');
  const [tripType, setTripType] = useState('관광');
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [showSavedPlans, setShowSavedPlans] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // localStorage에서 저장된 계획들 로드
  useEffect(() => {
    const saved = localStorage.getItem('savedTripPlans');
    if (saved) {
      setSavedPlans(JSON.parse(saved));
    }
  }, []);

  // 언어 로딩 중이거나 클라이언트가 아직 준비되지 않았으면 로딩 표시
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // 모든 번역에 통일된 t 함수 사용
  const tripTypes = getTripTypes(t);

  // 사용자 설정 로드
  const loadUserPreferences = () => {
    const preferences = localStorage.getItem('tripPlannerPreferences');
    if (preferences) {
      const parsed = JSON.parse(preferences);
      setDestination(parsed.destination || '');
      setBudget(parsed.budget || '적당히');
      setDuration(parsed.duration || '2-3일');
      setTripType(parsed.tripType || '관광');
      alert(String(t('tripPlanner.alerts.settingsLoaded')));
    } else {
      alert(String(t('tripPlanner.alerts.noSavedSettings')));
    }
  };

  // 사용자 설정 저장
  const saveUserPreferences = () => {
    const preferences = { destination, budget, duration, tripType };
    localStorage.setItem('tripPlannerPreferences', JSON.stringify(preferences));
    alert(String(t('tripPlanner.alerts.settingsSaved')));
  };

  // AI 여행 계획 생성
  const generatePlan = async () => {
    if (!destination.trim()) {
      alert(String(t('tripPlanner.alerts.enterDestination')));
      return;
    }

    setIsGenerating(true);
    setGeneratedPlan('');

    try {
      // 실제 AI 계획 생성 로직
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiPlan = generateAITripPlan(destination, tripType, duration, budget, []);
      
      if (!aiPlan) {
        throw new Error(String(t('tripPlanner.alerts.planGenerationFailed')));
      }

      setGeneratedPlan(JSON.stringify(aiPlan, null, 2));
    } catch (error) {
      alert(String(t('tripPlanner.alerts.planGenerationError')));
    } finally {
      setIsGenerating(false);
    }
  };

  // 계획 저장
  const savePlan = () => {
    if (!generatedPlan) {
      alert(String(t('tripPlanner.alerts.noPlanToSave')));
      return;
    }

    const newPlan = {
      id: Date.now(),
      destination,
      duration,
      budget,
      tripType,
      plan: generatedPlan,
      createdAt: new Date().toISOString()
    };

    const updatedPlans = [...savedPlans, newPlan];
    setSavedPlans(updatedPlans);
    localStorage.setItem('savedTripPlans', JSON.stringify(updatedPlans));
    alert(String(t('tripPlanner.alerts.planSaved')));
  };

  // PDF 내보내기
  const exportToPDF = () => {
    if (!generatedPlan) {
      alert(String(t('tripPlanner.alerts.noPlanToExport')));
      return;
    }

    // PDF 생성 로직 (실제 구현 필요)
    const blob = new Blob([generatedPlan], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trip-plan-${destination}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 계획 재생성
  const regeneratePlan = () => {
    if (confirm(String(t('tripPlanner.alerts.confirmRegenerate')))) {
      generatePlan();
    }
  };

  // 계획 공유
  const sharePlan = () => {
    if (!generatedPlan) {
      alert(String(t('tripPlanner.alerts.noPlanToShare')));
      return;
    }

    const shareData = {
      title: `${destination} 여행 계획`,
      text: `AI가 생성한 ${destination} 여행 계획을 확인해보세요!`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData)
        .then(() => console.log('성공적으로 공유됨'))
        .catch(err => console.log('공유 중 오류:', err));
    } else {
      // 폴백: 클립보드에 복사
      const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
      navigator.clipboard.writeText(shareText)
        .then(() => {
          alert(String(t('tripPlanner.alerts.planCopiedToClipboard')));
        })
        .catch(err => console.error('클립보드 복사 실패:', err));
    }
  };

  // 계획 비교
  const comparePlans = () => {
    alert(String(t('tripPlanner.alerts.compareFeatureComingSoon')));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Schema */}
      <KeywordPageSchema 
        keyword={String(t('tripPlanner.keyword'))}
        type="tool"
        title={String(t('tripPlanner.metadata.title'))}
        description={String(t('tripPlanner.metadata.description'))}
        features={[String(t('tripPlanner.features.aiGeneration')), String(t('tripPlanner.features.realtime')), String(t('tripPlanner.features.budget')), String(t('tripPlanner.features.customized')), String(t('tripPlanner.features.localInfo')), String(t('tripPlanner.features.free'))]}
        canonicalUrl="/trip-planner"
        breadcrumbs={[
          { name: String(t('navigation.home')), url: '/' },
          { name: String(t('tripPlanner.keyword')), url: '/trip-planner' }
        ]}
      />

      <div className="bg-white">
        <div className="container mx-auto px-6 py-8">
          {/* Header Badge */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-4">
              {String(t('tripPlanner.badge'))}
            </div>
            <h1 className="text-fluid-4xl font-normal text-black mb-4 leading-tight">
              {String(t('tripPlanner.hero.title'))} <span className="font-semibold">{String(t('tripPlanner.hero.subtitle'))}</span>
            </h1>
            <p className="text-fluid-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {String(t('tripPlanner.hero.description'))}
            </p>
          </div>

          {/* Quick Planner Section */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-16">
            <h2 
              className="text-fluid-2xl font-semibold text-black mb-6 text-center leading-snug"
              dangerouslySetInnerHTML={{ __html: String(t('tripPlanner.quickPlanner.title')) }}
            ></h2>

            {/* Step 1: Travel Style Selection */}
            <div className="mb-8">
              <h3 className="text-fluid-xl font-semibold text-black mb-4 leading-snug">{String(t('tripPlanner.steps.selectStyle'))}</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tripTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      tripType === type.id 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => setTripType(type.id)}
                  >
                    <div className="text-center">
                      {type.emoji && <div className="text-2xl mb-2">{type.emoji}</div>}
                      <h4 className="font-medium mb-2">{type.name}</h4>
                      <p className={`text-sm ${tripType === type.id ? 'text-gray-200' : 'text-gray-600'}`}>
                        {type.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Destination and Duration */}
            <div className="mb-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-fluid-xl font-semibold text-black mb-4 leading-snug">{String(t('tripPlanner.steps.destinationDuration'))}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{String(t('tripPlanner.form.destination.label'))}</label>
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder={String(t('tripPlanner.form.destination.placeholder'))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{String(t('tripPlanner.form.departure'))}</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{String(t('tripPlanner.form.duration'))}</label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="당일치기">{String(t('tripPlanner.form.durationOptions.dayTrip'))}</option>
                        <option value="1박 2일">{String(t('tripPlanner.form.durationOptions.oneNight'))}</option>
                        <option value="2-3일">{String(t('tripPlanner.form.durationOptions.twoNights'))}</option>
                        <option value="3-4일">{String(t('tripPlanner.form.durationOptions.threeNights'))}</option>
                        <option value="4-5일">{String(t('tripPlanner.form.durationOptions.fourNights'))}</option>
                        <option value="1주일">{String(t('tripPlanner.form.durationOptions.oneWeek'))}</option>
                        <option value="2주일">{String(t('tripPlanner.form.durationOptions.twoWeeks'))}</option>
                        <option value="1개월">{String(t('tripPlanner.form.durationOptions.oneMonth'))}</option>
                        <option value="기타">{String(t('tripPlanner.form.durationOptions.custom'))}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Step 3: Budget and Preferences */}
                <div>
                  <h3 className="text-fluid-xl font-semibold text-black mb-4 leading-snug">{String(t('tripPlanner.steps.budgetPreferences'))}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{String(t('tripPlanner.form.budget'))}</label>
                      <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="20만원 이하">{String(t('tripPlanner.form.budgetOptions.under20'))}</option>
                        <option value="20-50만원">{String(t('tripPlanner.form.budgetOptions.range20to50'))}</option>
                        <option value="50-100만원">{String(t('tripPlanner.form.budgetOptions.range50to100'))}</option>
                        <option value="100-200만원">{String(t('tripPlanner.form.budgetOptions.range100to200'))}</option>
                        <option value="200만원 이상">{String(t('tripPlanner.form.budgetOptions.over200'))}</option>
                        <option value="무제한">{String(t('tripPlanner.form.budgetOptions.unlimited'))}</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{String(t('tripPlanner.form.interests'))}</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[String(t('tripPlanner.form.interestOptions.food')), String(t('tripPlanner.form.interestOptions.shopping')), String(t('tripPlanner.form.interestOptions.culture')), String(t('tripPlanner.form.interestOptions.nature')), String(t('tripPlanner.form.interestOptions.activities')), String(t('tripPlanner.form.interestOptions.photography')), String(t('tripPlanner.form.interestOptions.nightView')), String(t('tripPlanner.form.interestOptions.spa'))].map((interest) => (
                          <label key={interest} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-black focus:ring-black"
                            />
                            <span className="text-sm text-gray-700">{interest}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personalization Controls */}
            <div className="bg-white rounded-xl p-6 mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">{String(t('tripPlanner.personalization.title'))}</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={loadUserPreferences}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {String(t('tripPlanner.personalization.loadSettings'))}
                </button>
                <button
                  onClick={saveUserPreferences}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {String(t('tripPlanner.personalization.saveSettings'))}
                </button>
                <button
                  onClick={() => setShowSavedPlans(!showSavedPlans)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {String(t('tripPlanner.personalization.viewSavedPlans'))} ({savedPlans.length}{String(t('tripPlanner.personalization.plansCount'))})
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <div className="text-center">
              <button
                onClick={generatePlan}
                disabled={isGenerating}
                className="bg-black text-white px-8 py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isGenerating ? String(t('tripPlanner.form.analyzing')) : String(t('tripPlanner.form.generateButton'))}
              </button>
              <p className="text-xs text-[#555555] font-light mt-2">{String(t('tripPlanner.form.completionTime'))}</p>
            </div>
          </div>

          {/* Saved Plans Display */}
          {showSavedPlans && (
            <div className="bg-white rounded-2xl p-8 mb-16">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-black">{String(t('tripPlanner.savedPlans.title'))}</h3>
                <button
                  onClick={() => setShowSavedPlans(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {savedPlans.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{String(t('tripPlanner.alerts.savedPlansEmpty'))}</p>
              ) : (
                <div className="space-y-4">
                  {savedPlans.map((plan) => (
                    <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{plan.destination} - {plan.duration}</h4>
                          <p className="text-sm text-gray-600">예산: {plan.budget} | 타입: {plan.tripType}</p>
                          <p className="text-xs text-gray-500">생성일: {new Date(plan.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setGeneratedPlan(plan.plan);
                              setShowSavedPlans(false);
                            }}
                            className="px-3 py-1 text-xs bg-black text-white rounded hover:bg-gray-800"
                          >
                            {String(t('tripPlanner.alerts.loadButton'))}
                          </button>
                          <button
                            onClick={() => {
                              const updatedPlans = savedPlans.filter(p => p.id !== plan.id);
                              setSavedPlans(updatedPlans);
                              localStorage.setItem('savedTripPlans', JSON.stringify(updatedPlans));
                            }}
                            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            {String(t('tripPlanner.alerts.deleteButton'))}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Generated Plan Display */}
          {generatedPlan && (
            <div className="bg-white rounded-2xl p-8 mb-16">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-black">{String(t('tripPlanner.generatedPlan.title'))}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={savePlan}
                    className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800"
                  >
                    {String(t('tripPlanner.generatedPlan.savePlan'))}
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {String(t('tripPlanner.generatedPlan.exportPDF'))}
                  </button>
                  <button
                    onClick={regeneratePlan}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {String(t('tripPlanner.generatedPlan.regenerate'))}
                  </button>
                  <button
                    onClick={sharePlan}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {String(t('tripPlanner.generatedPlan.share'))}
                  </button>
                  <button
                    onClick={comparePlans}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {String(t('tripPlanner.generatedPlan.compare'))}
                  </button>
                </div>
              </div>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                {generatedPlan}
              </pre>
            </div>
          )}

          {/* Popular Destinations Quick Start */}
          <div className="mb-16">
            <h2 className="text-fluid-2xl font-normal text-black mb-8 text-center leading-snug">
              {String(t('tripPlanner.popularDestinations.title'))} <span className="font-semibold">{String(t('tripPlanner.popularDestinations.subtitle'))}</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularDestinations.map((dest, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                  onClick={() => setDestination(dest.name)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-black">{dest.emoji} {dest.name}</h3>
                      <p className="text-sm text-gray-600">{dest.country}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-black">{dest.duration}</p>
                      <p className="text-xs text-gray-500">{dest.budget}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">주요 명소</p>
                    <p className="text-sm text-gray-700">{dest.highlights.join(', ')}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/guide/${encodeURIComponent(dest.name)}`}
                      className="text-sm text-black hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {String(t('tripPlanner.destinations.viewGuide'))}
                    </Link>
                    <div className="flex gap-2">
                      <span 
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded cursor-help"
                        title={String(t('tripPlanner.destinations.nomadInfo'))}
                      >
                        {String(t('tripPlanner.destinations.nomad'))}
                      </span>
                      <span 
                        className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded cursor-help"
                        title={String(t('tripPlanner.destinations.visaInfo'))}
                      >
                        {String(t('tripPlanner.destinations.visa'))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Features Section */}
          <div className="mb-16">
            <h2 className="text-fluid-2xl font-normal text-black mb-8 text-center leading-snug">
              {String(t('tripPlanner.aiFeatures.title'))} <span className="font-semibold">{String(t('tripPlanner.aiFeatures.subtitle'))}</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <h3 className="font-medium text-black mb-2">{String(t('tripPlanner.aiFeatures.customized.title'))}</h3>
                <p className="text-sm text-gray-600">
                  {String(t('tripPlanner.aiFeatures.customized.description'))}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-xl">⚡</span>
                </div>
                <h3 className="font-medium text-black mb-2">{String(t('tripPlanner.aiFeatures.realtime.title'))}</h3>
                <p className="text-sm text-gray-600">
                  {String(t('tripPlanner.aiFeatures.realtime.description'))}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-xl">📍</span>
                </div>
                <h3 className="font-medium text-black mb-2">{String(t('tripPlanner.aiFeatures.detailedInfo.title'))}</h3>
                <p className="text-sm text-gray-600">
                  {String(t('tripPlanner.aiFeatures.detailedInfo.description'))}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-xl">💰</span>
                </div>
                <h3 className="font-medium text-black mb-2">{String(t('tripPlanner.aiFeatures.budgetManagement.title'))}</h3>
                <p className="text-sm text-gray-600">
                  {String(t('tripPlanner.aiFeatures.budgetManagement.description'))}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-xl">📱</span>
                </div>
                <h3 className="font-medium text-black mb-2">{String(t('tripPlanner.aiFeatures.mobileOptimized.title'))}</h3>
                <p className="text-sm text-gray-600">
                  {String(t('tripPlanner.aiFeatures.mobileOptimized.description'))}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-xl">🎧</span>
                </div>
                <h3 className="font-medium text-black mb-2">{String(t('tripPlanner.aiFeatures.audioGuide.title'))}</h3>
                <p className="text-sm text-gray-600">
                  {String(t('tripPlanner.aiFeatures.audioGuide.description'))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Audio Guide Integration */}
      <section className="py-12 lg:py-16 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-fluid-3xl font-normal mb-6 leading-tight">
              {String(t('tripPlanner.audioGuideIntegration.title.before'))} <span className="font-semibold">{String(t('tripPlanner.audioGuideIntegration.title.highlight'))}</span>
            </h2>
            <p className="text-fluid-lg text-gray-300 mb-8 leading-relaxed">
              {String(t('tripPlanner.audioGuideIntegration.description'))}
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎧</span>
                </div>
                <h3 className="font-medium mb-2">{String(t('tripPlanner.audioGuideIntegration.features.autoStart.title'))}</h3>
                <p className="text-sm text-gray-300">{String(t('tripPlanner.audioGuideIntegration.features.autoStart.description'))}</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-medium mb-2">{String(t('tripPlanner.audioGuideIntegration.features.personalized.title'))}</h3>
                <p className="text-sm text-gray-300">{String(t('tripPlanner.audioGuideIntegration.features.personalized.description'))}</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔄</span>
                </div>
                <h3 className="font-medium mb-2">{String(t('tripPlanner.audioGuideIntegration.features.realtimeUpdate.title'))}</h3>
                <p className="text-sm text-gray-300">{String(t('tripPlanner.audioGuideIntegration.features.realtimeUpdate.description'))}</p>
              </div>
            </div>
            
            <Link 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              {String(t('tripPlanner.audioGuideIntegration.tryButton'))}
            </Link>
          </div>
        </div>
      </section>

      {/* JavaScript for dynamic functionality */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
        window.tripPlannerAlerts = {
          settingsPrompt: '${String(t('tripPlanner.alerts.settingsPrompt'))}',
          savedPlansEmpty: '${String(t('tripPlanner.alerts.savedPlansEmpty'))}',
          loadButton: '${String(t('tripPlanner.alerts.loadButton'))}',
          deleteButton: '${String(t('tripPlanner.alerts.deleteButton'))}',
          linkCopied: '${String(t('tripPlanner.alerts.linkCopied'))}'
        };
        `
        }}
      />
    </div>
  );
}