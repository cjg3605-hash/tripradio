import { useState } from "react";
import { ArrowLeft, Calendar, ChevronDown, MapPin, Users, Heart, Briefcase, User, Thermometer, DollarSign, Clock, Star, Plane, Camera, Mountain, Utensils, ShoppingBag, Landmark, Waves, TreePine, Building2, Sun, Cloud, CloudRain, Snowflake } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface TripPlannerPageProps {
  onBackToHome: () => void;
}

interface TravelStyle {
  id: string;
  emoji: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  budget: string;
  duration: string;
  focus: string[];
}

interface Destination {
  id: string;
  emoji: string;
  name: string;
  country: string;
  region: string;
  budget: string;
  bestTime: string;
  duration: string;
  highlights: string[];
  tags: string[];
  weather: string;
  temp: string;
  currency: string;
  exchangeRate: string;
  visaRequired: boolean;
  visaDays: number;
  flightTime: string;
  timeZone: string;
  language: string;
  mustSee: string[];
  foodSpecialty: string[];
  activities: string[];
  transportation: string[];
  tips: string[];
  budgetBreakdown: {
    accommodation: string;
    food: string;
    transport: string;
    activities: string;
  };
}

interface TravelTemplate {
  id: string;
  title: string;
  duration: string;
  style: string;
  price: string;
  destinations: string[];
  itinerary: {
    day: number;
    location: string;
    activities: string[];
  }[];
}

export function TripPlannerPage({ onBackToHome }: TripPlannerPageProps) {
  const [selectedTravelStyle, setSelectedTravelStyle] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [duration, setDuration] = useState<string>('당일치기');
  const [budget, setBudget] = useState<string>('20만원 이하');
  const [interests, setInterests] = useState<string[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TravelTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>('planner');

  const travelStyles: TravelStyle[] = [
    {
      id: 'solo',
      emoji: '🚶',
      title: 'Solo Travel',
      description: 'Your special time alone',
      icon: User,
      budget: '50-100만원',
      duration: '3-7일',
      focus: ['자유도', '개인 성장', '새로운 경험']
    },
    {
      id: 'couple',
      emoji: '💕',
      title: 'Couple Travel',
      description: 'Creating romantic memories',
      icon: Heart,
      budget: '100-200만원',
      duration: '3-5일',
      focus: ['로맨틱', '휴식', '추억 만들기']
    },
    {
      id: 'family',
      emoji: '👨‍👩‍👧‍👦',
      title: 'Family Travel',
      description: 'Together with the whole family',
      icon: Users,
      budget: '150-300만원',
      duration: '4-7일',
      focus: ['안전', '편의시설', '아이 친화적']
    },
    {
      id: 'friends',
      emoji: '👥',
      title: 'Friends Travel',
      description: 'Fun times with friends',
      icon: Users,
      budget: '80-150만원',
      duration: '3-5일',
      focus: ['액티비티', '나이트라이프', '그룹 할인']
    },
    {
      id: 'workation',
      emoji: '💻',
      title: 'Workation',
      description: 'Perfect balance of work and vacation',
      icon: Briefcase,
      budget: '100-200만원',
      duration: '7-30일',
      focus: ['WiFi', '카페', '업무 환경']
    }
  ];

  const destinations: Destination[] = [
    {
      id: 'tokyo',
      emoji: '🏯',
      name: '도쿄',
      country: '일본',
      region: '동아시아',
      budget: '80-120만원',
      bestTime: '3-5월, 9-11월',
      duration: '3-4일',
      highlights: ['시부야', '아사쿠사', '긴자', '하라주쿠'],
      tags: ['문화', '쇼핑', '음식', '현대'],
      weather: '맑음',
      temp: '18°C',
      currency: 'JPY',
      exchangeRate: '1,000원 = 74엔',
      visaRequired: false,
      visaDays: 90,
      flightTime: '2시간 30분',
      timeZone: 'GMT+9',
      language: '일본어',
      mustSee: ['센소지 절', '도쿄 스카이트리', '메이지 신궁', '츠키지 시장'],
      foodSpecialty: ['스시', '라멘', '우동', '텐푸라', '야키토리'],
      activities: ['온센', '카라오케', '쇼핑', '사진촬영', '푸드투어'],
      transportation: ['JR패스', '지하철', '택시', '도보'],
      tips: [
        'JR패스 미리 구매하면 교통비 절약',
        '현금 사용이 일반적이니 충분히 준비',
        '팁 문화가 없으니 주의',
        '지진 대비 앱 다운로드 권장'
      ],
      budgetBreakdown: {
        accommodation: '50,000원/일',
        food: '30,000원/일',
        transport: '15,000원/일',
        activities: '25,000원/일'
      }
    },
    {
      id: 'seoul',
      emoji: '🏢',
      name: '서울',
      country: '한국',
      region: '동아시아',
      budget: '60-100만원',
      bestTime: '4-6월, 9-11월',
      duration: '2-3일',
      highlights: ['명동', '강남', '홍대', '인사동'],
      tags: ['K-pop', '쇼핑', '음식', '역사'],
      weather: '구름',
      temp: '15°C',
      currency: 'KRW',
      exchangeRate: '기준 통화',
      visaRequired: false,
      visaDays: 0,
      flightTime: '국내',
      timeZone: 'GMT+9',
      language: '한국어',
      mustSee: ['경복궁', '남산타워', '동대문', '청계천'],
      foodSpecialty: ['김치', '불고기', '비빔밥', '삼겹살', '치킨'],
      activities: ['한복 체험', 'K-pop 콘서트', '쇼핑', '한강 공원'],
      transportation: ['지하철', '버스', '택시', '따릉이'],
      tips: [
        'T-money카드로 교통비 절약',
        '24시간 운영하는 곳이 많아 야간 활동 추천',
        '무료 WiFi가 잘 되어 있음',
        '팁 문화 없음'
      ],
      budgetBreakdown: {
        accommodation: '40,000원/일',
        food: '25,000원/일',
        transport: '10,000원/일',
        activities: '20,000원/일'
      }
    },
    {
      id: 'bangkok',
      emoji: '🛕',
      name: '방콕',
      country: '태국',
      region: '동남아시아',
      budget: '50-80만원',
      bestTime: '11-3월',
      duration: '3-4일',
      highlights: ['왓포', '카오산로드', '짜뚜짝'],
      tags: ['문화', '음식', '마사지', '시장'],
      weather: '더움',
      temp: '32°C',
      currency: 'THB',
      exchangeRate: '1,000원 = 24바트',
      visaRequired: false,
      visaDays: 30,
      flightTime: '6시간',
      timeZone: 'GMT+7',
      language: '태국어',
      mustSee: ['왓 아룬', '그랜드 팰리스', '수상시장', '룸피니 공원'],
      foodSpecialty: ['팟타이', '똠얌꿍', '솜땀', '망고 스티키 라이스'],
      activities: ['태국 마사지', '수상시장 투어', '사원 관람', '루프탑 바'],
      transportation: ['툭툭', 'BTS', 'MRT', '보트'],
      tips: [
        '더위 대비 충분한 수분 섭취',
        '왕궁 방문 시 단정한 복장 필수',
        '거스름돈 확인 철저히',
        '길거리 음식도 안전한 편'
      ],
      budgetBreakdown: {
        accommodation: '25,000원/일',
        food: '15,000원/일',
        transport: '8,000원/일',
        activities: '12,000원/일'
      }
    },
    {
      id: 'paris',
      emoji: '🗼',
      name: '파리',
      country: '프랑스',
      region: '유럽',
      budget: '150-250만원',
      bestTime: '4-6월, 9-10월',
      duration: '4-5일',
      highlights: ['에펠탑', '루브르', '샹젤리제'],
      tags: ['예술', '패션', '음식', '로맨틱'],
      weather: '구름',
      temp: '12°C',
      currency: 'EUR',
      exchangeRate: '1,000원 = 0.68유로',
      visaRequired: false,
      visaDays: 90,
      flightTime: '12시간',
      timeZone: 'GMT+1',
      language: '프랑스어',
      mustSee: ['노트르담', '몽마르트', '베르사유 궁전', '오르세 미술관'],
      foodSpecialty: ['크루아상', '마카롱', '에스카르고', '코코뱅'],
      activities: ['미술관 투어', '세느강 크루즈', '쇼핑', '카페 문화'],
      transportation: ['메트로', '버스', '택시', '도보'],
      tips: [
        '박물관 패스 구매 시 대기시간 단축',
        '일요일엔 많은 상점이 문 닫음',
        '팁은 10% 정도가 적당',
        '소매치기 주의'
      ],
      budgetBreakdown: {
        accommodation: '100,000원/일',
        food: '60,000원/일',
        transport: '20,000원/일',
        activities: '40,000원/일'
      }
    },
    {
      id: 'newyork',
      emoji: '🗽',
      name: '뉴욕',
      country: '미국',
      region: '북미',
      budget: '200-350만원',
      bestTime: '4-6월, 9-11월',
      duration: '5-7일',
      highlights: ['타임스퀘어', '센트럴파크', '브루클린 브릿지'],
      tags: ['도시', '문화', '쇼핑', '브로드웨이'],
      weather: '맑음',
      temp: '16°C',
      currency: 'USD',
      exchangeRate: '1,000원 = 0.74달러',
      visaRequired: true,
      visaDays: 90,
      flightTime: '14시간',
      timeZone: 'GMT-5',
      language: '영어',
      mustSee: ['자유의 여신상', '엠파이어 스테이트', '9/11 메모리얼', 'High Line'],
      foodSpecialty: ['핫도그', '베이글', '치즈케이크', '스테이크'],
      activities: ['브로드웨이 뮤지컬', '미술관 투어', '쇼핑', '루프탑 바'],
      transportation: ['지하철', '택시', '우버', '도보'],
      tips: [
        'MetroCard로 교통비 절약',
        '팁은 필수 (18-20%)',
        '안전을 위해 늦은 시간 지하철 피하기',
        'ESTA 사전 신청 필수'
      ],
      budgetBreakdown: {
        accommodation: '150,000원/일',
        food: '80,000원/일',
        transport: '25,000원/일',
        activities: '60,000원/일'
      }
    },
    {
      id: 'sydney',
      emoji: '🏄‍♂️',
      name: '시드니',
      country: '호주',
      region: '오세아니아',
      budget: '180-280만원',
      bestTime: '9-11월, 3-5월',
      duration: '5-7일',
      highlights: ['오페라 하우스', '하버 브릿지', '본다이 비치'],
      tags: ['해변', '자연', '도시', '액티비티'],
      weather: '맑음',
      temp: '22°C',
      currency: 'AUD',
      exchangeRate: '1,000원 = 1.1호주달러',
      visaRequired: true,
      visaDays: 90,
      flightTime: '10시간',
      timeZone: 'GMT+10',
      language: '영어',
      mustSee: ['달링 하버', '록스', '타롱가 동물원', '블루 마운틴'],
      foodSpecialty: ['미트 파이', '베지마이트', '바베큐', '플랫 화이트'],
      activities: ['서핑', '하버 크루즈', '국립공원 하이킹', '와이너리 투어'],
      transportation: ['기차', '버스', '페리', '렌터카'],
      tips: [
        'Opal 카드로 대중교통 이용',
        '자외선 차단제 필수',
        '팁 문화 없음',
        '계절이 반대임을 고려'
      ],
      budgetBreakdown: {
        accommodation: '120,000원/일',
        food: '70,000원/일',
        transport: '30,000원/일',
        activities: '50,000원/일'
      }
    }
  ];

  const travelTemplates: TravelTemplate[] = [
    {
      id: 'japan-golden',
      title: '일본 골든루트 5일',
      duration: '4박 5일',
      style: 'family',
      price: '120만원',
      destinations: ['도쿄', '교토', '오사카'],
      itinerary: [
        { day: 1, location: '도쿄', activities: ['아사쿠사 센소지', '스카이트리', '긴자 쇼핑'] },
        { day: 2, location: '도쿄', activities: ['시부야 크로싱', '메이지신궁', '하라주쿠'] },
        { day: 3, location: '교토', activities: ['후시미 이나리', '기요미즈데라', '기온 거리'] },
        { day: 4, location: '오사카', activities: ['오사카성', '도톤보리', '쿠로몬 시장'] },
        { day: 5, location: '오사카', activities: ['유니버설 스튜디오', '쇼핑', '출국'] }
      ]
    },
    {
      id: 'europe-classic',
      title: '유럽 클래식 7일',
      duration: '6박 7일',
      style: 'couple',
      price: '250만원',
      destinations: ['파리', '런던', '암스테르담'],
      itinerary: [
        { day: 1, location: '파리', activities: ['에펠탑', '세느강 크루즈', '몽마르트'] },
        { day: 2, location: '파리', activities: ['루브르 박물관', '샹젤리제', '베르사유'] },
        { day: 3, location: '런던', activities: ['빅벤', '타워 브릿지', '대영박물관'] },
        { day: 4, location: '런던', activities: ['버킹엄궁전', '템즈강 크루즈', '코벤트가든'] },
        { day: 5, location: '암스테르담', activities: ['반고흐 박물관', '안네 프랑크의 집'] },
        { day: 6, location: '암스테르담', activities: ['운하 크루즈', '자전거 투어'] },
        { day: 7, location: '암스테르담', activities: ['자유시간', '출국'] }
      ]
    },
    {
      id: 'southeast-backpack',
      title: '동남아 배낭여행 10일',
      duration: '9박 10일',
      style: 'friends',
      price: '80만원',
      destinations: ['방콕', '치앙마이', '푸켓'],
      itinerary: [
        { day: 1, location: '방콕', activities: ['왓포', '그랜드 팰리스', '카오산로드'] },
        { day: 2, location: '방콕', activities: ['수상시장', '짜뚜짝 마켓', '루프탑 바'] },
        { day: 3, location: '치앙마이', activities: ['도이수텝', '나이트 바자', '태국 마사지'] },
        { day: 4, location: '치앙마이', activities: ['코끼리 캠프', '지프라인', '선데이 마켓'] },
        { day: 5, location: '치앙마이', activities: ['쿠킹클래스', '사원 투어'] },
        { day: 6, location: '푸켓', activities: ['파통 비치', '방글라 로드'] },
        { day: 7, location: '푸켓', activities: ['피피섬 투어', '스노클링'] },
        { day: 8, location: '푸켓', activities: ['빅 부다', '쇼핑', '해변'] },
        { day: 9, location: '푸켓', activities: ['스파', '자유시간'] },
        { day: 10, location: '푸켓', activities: ['출국'] }
      ]
    }
  ];

  const interestOptions = [
    { id: 'food', name: '맛집 탐방', icon: Utensils },
    { id: 'shopping', name: '쇼핑', icon: ShoppingBag },
    { id: 'history', name: '역사/문화', icon: Landmark },
    { id: 'nature', name: '자연/힐링', icon: TreePine },
    { id: 'activity', name: '액티비티', icon: Mountain },
    { id: 'photo', name: '사진촬영', icon: Camera },
    { id: 'nightlife', name: '야경/나이트라이프', icon: Building2 },
    { id: 'beach', name: '해변/바다', icon: Waves }
  ];

  const budgetOptions = [
    '20만원 이하', '20-50만원', '50-100만원', '100-200만원', '200만원 이상'
  ];

  const durationOptions = [
    '당일치기', '1박 2일', '2박 3일', '3박 4일', '4박 5일', '1주일', '2주일', '1개월 이상'
  ];

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onBackToHome();
    }, 3000);
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case '맑음': return <Sun className="w-4 h-4 text-yellow-500" />;
      case '구름': return <Cloud className="w-4 h-4 text-gray-500" />;
      case '비': return <CloudRain className="w-4 h-4 text-blue-500" />;
      case '눈': return <Snowflake className="w-4 h-4 text-blue-300" />;
      case '더움': return <Thermometer className="w-4 h-4 text-red-500" />;
      default: return <Sun className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-2 text-gray-400 hover:text-black" 
              onClick={onBackToHome}
            >
              <ArrowLeft size={16} />
              <span className="text-sm">Go Back</span>
            </Button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <h1 className="text-xl font-bold text-black hidden sm:block">TripRadio.AI</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-sm">English</Button>
              <Button variant="ghost" size="sm" className="text-sm">History</Button>
              <Button variant="ghost" size="sm" className="text-sm">Sign In</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-6 bg-neutral-100 text-neutral-800">
            Smart Trip Planner
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            <span className="font-normal">AI가 만드는 </span>
            <span className="font-semibold">완벽한 여행 계획</span>
          </h1>
          
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            당신의 취향에 맞춘 완벽한 여행 계획
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="planner">계획 만들기</TabsTrigger>
            <TabsTrigger value="destinations">여행지 탐색</TabsTrigger>
            <TabsTrigger value="templates">추천 일정</TabsTrigger>
            <TabsTrigger value="tools">여행 도구</TabsTrigger>
          </TabsList>

          {/* 계획 만들기 탭 */}
          <TabsContent value="planner" className="space-y-8">
            {/* Planning Form */}
            <div className="bg-neutral-50 rounded-3xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-black mb-2">3분만에 여행 계획 완성</h2>
              </div>

              {/* Travel Style Selection */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-black mb-4">여행 스타일 선택</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {travelStyles.map((style) => (
                    <Card 
                      key={style.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedTravelStyle === style.id 
                          ? 'ring-2 ring-black bg-black text-white' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTravelStyle(style.id)}
                    >
                      <div className="text-center mb-4">
                        <div className="text-2xl mb-2">{style.emoji}</div>
                        <h4 className="font-medium mb-1">{style.title}</h4>
                        <p className={`text-sm mb-2 ${
                          selectedTravelStyle === style.id ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {style.description}
                        </p>
                      </div>
                      <div className={`space-y-2 text-xs ${
                        selectedTravelStyle === style.id ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        <div>예산: {style.budget}</div>
                        <div>기간: {style.duration}</div>
                        <div className="flex flex-wrap gap-1">
                          {style.focus.slice(0, 2).map((focus, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {focus}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Destination and Duration */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Left Column */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-black">목적지와 기간</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-neutral-700 font-medium">목적지</Label>
                      <Input
                        placeholder="어디로 가실 건가요?"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="mt-1 rounded-full border-gray-300 focus:border-black focus:ring-black"
                      />
                    </div>

                    <div>
                      <Label className="text-neutral-700 font-medium">출발일</Label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="mt-1 pl-10 rounded-full border-gray-300 focus:border-black focus:ring-black"
                        />
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <Label className="text-neutral-700 font-medium">기간</Label>
                      <div className="relative">
                        <select
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white"
                        >
                          {durationOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-black">예산과 선호사항</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-neutral-700 font-medium">예산</Label>
                      <div className="relative">
                        <select
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white"
                        >
                          {budgetOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <Label className="text-neutral-700 font-medium">관심사</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {interestOptions.map((interest) => (
                          <label key={interest.id} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={interests.includes(interest.id)}
                              onChange={() => toggleInterest(interest.id)}
                              className="rounded border-gray-300 text-black focus:ring-black"
                            />
                            <interest.icon className="w-4 h-4" />
                            <span className="text-sm text-neutral-700">{interest.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <Button
                  onClick={handleGeneratePlan}
                  disabled={!destination || !selectedTravelStyle || isGenerating}
                  className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  {isGenerating ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>계획 생성 중...</span>
                    </div>
                  ) : (
                    '계획 생성'
                  )}
                </Button>
                <p className="text-sm text-gray-500 mt-2">완성 시간: 약 30초</p>
              </div>
            </div>
          </TabsContent>

          {/* 여행지 탐색 탭 */}
          <TabsContent value="destinations" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-black mb-2">인기 여행지 둘러보기</h2>
              <p className="text-neutral-600">전 세계 인기 여행지의 상세 정보를 확인하세요</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((dest) => (
                <Card 
                  key={dest.id} 
                  className={`p-6 hover:shadow-lg transition-all cursor-pointer ${
                    selectedDestination?.id === dest.id ? 'ring-2 ring-black' : ''
                  }`}
                  onClick={() => setSelectedDestination(selectedDestination?.id === dest.id ? null : dest)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-black flex items-center space-x-2">
                        <span className="text-2xl">{dest.emoji}</span>
                        <span>{dest.name}</span>
                      </h3>
                      <p className="text-sm text-gray-600">{dest.country} • {dest.region}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        {getWeatherIcon(dest.weather)}
                        <span className="text-sm">{dest.temp}</span>
                      </div>
                      <p className="text-xs text-gray-500">{dest.bestTime}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">예산:</span>
                      <span className="font-medium">{dest.budget}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">추천 기간:</span>
                      <span className="font-medium">{dest.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">비행시간:</span>
                      <span className="font-medium">{dest.flightTime}</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-500">주요 명소</p>
                    <p className="text-sm text-gray-700">{dest.highlights.join(', ')}</p>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-4">
                    {dest.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {dest.visaRequired === false && (
                      <Badge className="text-xs bg-green-100 text-green-800">
                        무비자
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* 선택된 여행지 상세 정보 */}
            {selectedDestination && (
              <Card className="p-8 mt-8 bg-gray-50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl">{selectedDestination.emoji}</span>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedDestination.name}</h2>
                      <p className="text-gray-600">{selectedDestination.country}</p>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedDestination(null)}>
                    ✕
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-black">기본 정보</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">통화:</span>
                        <span>{selectedDestination.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">환율:</span>
                        <span className="text-xs">{selectedDestination.exchangeRate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">언어:</span>
                        <span>{selectedDestination.language}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">시차:</span>
                        <span>{selectedDestination.timeZone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">비자:</span>
                        <span>{selectedDestination.visaRequired ? 'Required' : `무비자 ${selectedDestination.visaDays}일`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-black">예산 분석</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">숙박:</span>
                        <span>{selectedDestination.budgetBreakdown.accommodation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">식비:</span>
                        <span>{selectedDestination.budgetBreakdown.food}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">교통:</span>
                        <span>{selectedDestination.budgetBreakdown.transport}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">액티비티:</span>
                        <span>{selectedDestination.budgetBreakdown.activities}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-black">교통수단</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedDestination.transportation.map((transport, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {transport}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-black mb-3">꼭 가봐야 할 곳</h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {selectedDestination.mustSee.map((place, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <MapPin className="w-3 h-3" />
                          <span>{place}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-black mb-3">현지 음식</h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {selectedDestination.foodSpecialty.map((food, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Utensils className="w-3 h-3" />
                          <span>{food}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-black">여행 팁</h3>
                  <ul className="space-y-2">
                    {selectedDestination.tips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                        <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* 추천 일정 탭 */}
          <TabsContent value="templates" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-black mb-2">추천 여행 일정</h2>
              <p className="text-neutral-600">검증된 여행 일정으로 완벽한 여행을 계획하세요</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {travelTemplates.map((template) => (
                <Card 
                  key={template.id} 
                  className={`p-6 hover:shadow-lg transition-all cursor-pointer ${
                    selectedTemplate?.id === template.id ? 'ring-2 ring-black' : ''
                  }`}
                  onClick={() => setSelectedTemplate(selectedTemplate?.id === template.id ? null : template)}
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-black mb-2">{template.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span>{template.duration}</span>
                      <span className="font-semibold text-black">{template.price}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.destinations.map((dest, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {dest}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">일정 미리보기</p>
                    {template.itinerary.slice(0, 3).map((day) => (
                      <div key={day.day} className="text-xs text-gray-600">
                        <span className="font-medium">Day {day.day}</span> {day.location}: {day.activities[0]}
                        {day.activities.length > 1 && '...'}
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full mt-4" size="sm">
                    상세 일정 보기
                  </Button>
                </Card>
              ))}
            </div>

            {/* 선택된 템플릿 상세 정보 */}
            {selectedTemplate && (
              <Card className="p-8 mt-8 bg-gray-50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTemplate.title}</h2>
                    <p className="text-gray-600">{selectedTemplate.duration} • {selectedTemplate.price}</p>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedTemplate(null)}>
                    ✕
                  </Button>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-black">상세 일정</h3>
                  {selectedTemplate.itinerary.map((day) => (
                    <div key={day.day} className="border-l-4 border-black pl-4 pb-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {day.day}
                        </div>
                        <h4 className="font-semibold text-lg">{day.location}</h4>
                      </div>
                      <ul className="space-y-1 ml-11">
                        {day.activities.map((activity, index) => (
                          <li key={index} className="text-gray-700 flex items-center space-x-2">
                            <Clock className="w-3 h-3" />
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex space-x-4">
                  <Button className="bg-black text-white">
                    이 일정으로 계획 시작
                  </Button>
                  <Button variant="outline">
                    일정 커스터마이즈
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* 여행 도구 탭 */}
          <TabsContent value="tools" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-black mb-2">유용한 여행 도구</h2>
              <p className="text-neutral-600">여행 계획에 도움이 되는 다양한 도구들</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 환율 계산기 */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">환율 계산기</h3>
                    <p className="text-sm text-gray-600">실시간 환율 확인</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input placeholder="금액" type="number" />
                    <select className="px-3 py-2 border rounded-lg">
                      <option>KRW</option>
                      <option>USD</option>
                      <option>EUR</option>
                      <option>JPY</option>
                    </select>
                  </div>
                  <div className="text-center">→</div>
                  <div className="text-center p-3 bg-gray-100 rounded-lg">
                    <span className="text-lg font-bold">계산 결과</span>
                  </div>
                </div>
              </Card>

              {/* 날씨 정보 */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Sun className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">날씨 정보</h3>
                    <p className="text-sm text-gray-600">목적지 날씨 확인</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Input placeholder="도시명 입력" />
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                      <span className="text-sm">오늘</span>
                      <div className="flex items-center space-x-2">
                        <Sun className="w-4 h-4" />
                        <span>22°C</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                      <span className="text-sm">내일</span>
                      <div className="flex items-center space-x-2">
                        <Cloud className="w-4 h-4" />
                        <span>18°C</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 여행 체크리스트 */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">여행 체크리스트</h3>
                    <p className="text-sm text-gray-600">필수 준비물 확인</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {['여권/신분증', '항공권', '숙소 예약', '여행자 보험', '현지 통화'].map((item, index) => (
                    <label key={index} className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  전체 체크리스트 보기
                </Button>
              </Card>

              {/* 비자 정보 */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <Plane className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">비자 정보</h3>
                    <p className="text-sm text-gray-600">입국 요건 확인</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>국가 선택</option>
                    <option>일본</option>
                    <option>미국</option>
                    <option>유럽</option>
                    <option>동남아시아</option>
                  </select>
                  <div className="p-3 bg-gray-100 rounded-lg text-sm">
                    <p className="font-medium">일본 (선택 시)</p>
                    <p>• 무비자 90일 체류 가능</p>
                    <p>• 여권 유효기간 6개월 이상</p>
                    <p>• 왕복 항공권 필요</p>
                  </div>
                </div>
              </Card>

              {/* 시차 계산기 */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">시차 계산기</h3>
                    <p className="text-sm text-gray-600">현지 시간 확인</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>목적지 선택</option>
                    <option>도쿄 (+0시간)</option>
                    <option>파리 (-8시간)</option>
                    <option>뉴욕 (-14시간)</option>
                  </select>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2 bg-gray-100 rounded">
                      <p className="text-xs text-gray-500">한국 시간</p>
                      <p className="font-bold">오후 3:00</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded">
                      <p className="text-xs text-blue-600">현지 시간</p>
                      <p className="font-bold">오후 3:00</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 번역 도구 */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-teal-100 p-3 rounded-full">
                    <Building2 className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">여행 회화</h3>
                    <p className="text-sm text-gray-600">필수 표현 모음</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { ko: '안녕하세요', en: 'Hello' },
                    { ko: '감사합니다', en: 'Thank you' },
                    { ko: '얼마예요?', en: 'How much?' },
                    { ko: '화장실이 어디예요?', en: 'Where is the bathroom?' }
                  ].map((phrase, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                      <div className="font-medium">{phrase.ko}</div>
                      <div className="text-gray-600">{phrase.en}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* CTA Section */}
      <section className="bg-black text-white py-16 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            계획부터 여행까지, 모든 것을 한 곳에서
          </h2>
          
          <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
            AI 여행 계획부터 실시간 여행 가이드까지, TripRadio.AI와 함께 완벽한 여행을 준비하세요
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-medium text-white mb-2">맞춤형 계획</h3>
              <p className="text-sm text-neutral-300">
                당신의 취향과 예산에 맞는 완벽한 여행 계획을 AI가 생성합니다
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-medium text-white mb-2">실시간 가이드</h3>
              <p className="text-sm text-neutral-300">
                현지에서 실시간 AI 오디오 가이드로 더 깊이 있는 여행을 경험하세요
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-medium text-white mb-2">통합 도구</h3>
              <p className="text-sm text-neutral-300">
                환율, 날씨, 비자 정보까지 여행에 필요한 모든 정보를 제공합니다
              </p>
            </div>
          </div>

          <Button
            onClick={onBackToHome}
            className="bg-white text-black px-8 py-3 rounded-full text-lg font-medium hover:bg-gray-100 transition-colors"
          >
            통합 여행 서비스 체험하기
          </Button>
        </div>
      </section>
    </div>
  );
}