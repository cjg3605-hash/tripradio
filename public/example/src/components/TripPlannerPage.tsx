import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, ChevronDown, MapPin, Users, Heart, Briefcase, User, Thermometer, DollarSign, Clock, Star, Plane, Camera, Mountain, Utensils, ShoppingBag, Landmark, Waves, TreePine, Building2, Sun, Cloud, CloudRain, Snowflake, Sparkles, Zap, Target, TrendingUp, Award, Globe, Brain, Wand2 } from "lucide-react";
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
  gradient: string;
  matchPercentage?: number;
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
  matchScore?: number;
  imageUrl?: string;
}

interface TravelTemplate {
  id: string;
  title: string;
  duration: string;
  style: string;
  price: string;
  destinations: string[];
  imageUrl: string;
  popularity: number;
  rating: number;
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
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [planningProgress, setPlanningProgress] = useState<number>(0);
  const [showAiMatching, setShowAiMatching] = useState<boolean>(false);

  // Animation states
  const [animatedElements, setAnimatedElements] = useState<Set<string>>(new Set());

  const travelStyles: TravelStyle[] = [
    {
      id: 'solo',
      emoji: '🚶',
      title: 'Solo Travel',
      description: 'Your special time alone',
      icon: User,
      budget: '50-100만원',
      duration: '3-7일',
      focus: ['자유도', '개인 성장', '새로운 경험'],
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'couple',
      emoji: '💕',
      title: 'Couple Travel',
      description: 'Creating romantic memories',
      icon: Heart,
      budget: '100-200만원',
      duration: '3-5일',
      focus: ['로맨틱', '휴식', '추억 만들기'],
      gradient: 'from-rose-500 to-red-500'
    },
    {
      id: 'family',
      emoji: '👨‍👩‍👧‍👦',
      title: 'Family Travel',
      description: 'Together with the whole family',
      icon: Users,
      budget: '150-300만원',
      duration: '4-7일',
      focus: ['안전', '편의시설', '아이 친화적'],
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'friends',
      emoji: '👥',
      title: 'Friends Travel',
      description: 'Fun times with friends',
      icon: Users,
      budget: '80-150만원',
      duration: '3-5일',
      focus: ['액티비티', '나이트라이프', '그룹 할인'],
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'workation',
      emoji: '💻',
      title: 'Workation',
      description: 'Perfect balance of work and vacation',
      icon: Briefcase,
      budget: '100-200만원',
      duration: '7-30일',
      focus: ['WiFi', '카페', '업무 환경'],
      gradient: 'from-orange-500 to-yellow-500'
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
      },
      imageUrl: 'https://images.unsplash.com/photo-1754464160269-3be2da46233d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMG1vZGVybiUyMHRyYXZlbCUyMHVyYmFuJTIwZXhwbG9yYXRpb258ZW58MXx8fHwxNzU1ODcwMjk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
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
      },
      imageUrl: 'https://images.unsplash.com/photo-1557858832-b23c89645f0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMHZhY2F0aW9uJTIwYmVhY2glMjBwYXJhZGlzZSUyMHBhbG0lMjB0cmVlc3xlbnwxfHx8fDE3NTU4NzAyOTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
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
      },
      imageUrl: 'https://images.unsplash.com/photo-1503221043305-f7498f8b7888?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBwbGFubmluZyUyMG1hcCUyMHdvcmxkJTIwZGVzdGluYXRpb25zfGVufDF8fHx8MTc1NTg3MDI4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
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
      imageUrl: 'https://images.unsplash.com/photo-1754464160269-3be2da46233d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMG1vZGVybiUyMHRyYXZlbCUyMHVyYmFuJTIwZXhwbG9yYXRpb258ZW58MXx8fHwxNzU1ODcwMjk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      popularity: 95,
      rating: 4.8,
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
      imageUrl: 'https://images.unsplash.com/photo-1503221043305-f7498f8b7888?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBwbGFubmluZyUyMG1hcCUyMHdvcmxkJTIwZGVzdGluYXRpb25zfGVufDF8fHx8MTc1NTg3MDI4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      popularity: 88,
      rating: 4.7,
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
      imageUrl: 'https://images.unsplash.com/photo-1557858832-b23c89645f0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMHZhY2F0aW9uJTIwYmVhY2glMjBwYXJhZGlzZSUyMHBhbG0lMjB0cmVlc3xlbnwxfHx8fDE3NTU4NzAyOTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      popularity: 92,
      rating: 4.6,
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

  // AI suggestions based on user input
  const generateAISuggestions = () => {
    const suggestions = [
      '🎯 봄 시즌 벚꽃 명소 추천',
      '💡 현지인이 추천하는 숨은 맛집',
      '📱 필수 여행 앱 다운로드',
      '💰 현지 할인 쿠폰 정보',
      '🚗 렌터카 vs 대중교통 비교',
      '🏨 가성비 숙소 추천'
    ];
    setAiSuggestions(suggestions.slice(0, 3));
  };

  // Calculate AI matching scores
  const calculateMatchingScores = () => {
    const updatedStyles = travelStyles.map(style => ({
      ...style,
      matchPercentage: Math.floor(Math.random() * 30) + 70
    }));
    
    const updatedDestinations = destinations.map(dest => ({
      ...dest,
      matchScore: Math.floor(Math.random() * 30) + 70
    }));

    return { updatedStyles, updatedDestinations };
  };

  // Animation triggers
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedElements(new Set(['hero', 'styles', 'form']));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Update progress based on form completion
  useEffect(() => {
    let progress = 0;
    if (selectedTravelStyle) progress += 25;
    if (destination) progress += 25;
    if (startDate) progress += 25;
    if (interests.length > 0) progress += 25;
    setPlanningProgress(progress);

    if (progress > 50) {
      setShowAiMatching(true);
      generateAISuggestions();
    }
  }, [selectedTravelStyle, destination, startDate, interests]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass-effect border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-2 text-gray-600 hover:text-black" 
              onClick={onBackToHome}
            >
              <ArrowLeft size={16} />
              <span className="text-sm">Go Back</span>
            </Button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                TripRadio.AI
              </h1>
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
        <div className={`text-center mb-12 transform transition-all duration-1000 ${
          animatedElements.has('hero') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-3xl"></div>
            <Badge variant="secondary" className="relative mb-6 bg-white/50 backdrop-blur-sm text-gray-800 border border-white/20">
              <Brain className="w-3 h-3 mr-1" />
              Smart Trip Planner
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              AI가 만드는
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              완벽한 여행 계획
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            당신의 취향을 분석해서 맞춤형 여행 계획을 30초 만에 생성합니다
          </p>

          {/* AI Features */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">AI 맞춤 추천</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">30초 완성</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Target className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">98% 만족도</span>
            </div>
          </div>

          {/* Progress Indicator */}
          {planningProgress > 0 && (
            <div className="max-w-md mx-auto mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">계획 완성도</span>
                <span className="text-sm font-medium text-blue-600">{planningProgress}%</span>
              </div>
              <Progress value={planningProgress} className="h-2" />
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/50 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="planner" className="data-[state=active]:bg-white">
              <Wand2 className="w-4 h-4 mr-2" />
              계획 만들기
            </TabsTrigger>
            <TabsTrigger value="destinations" className="data-[state=active]:bg-white">
              <Globe className="w-4 h-4 mr-2" />
              여행지 탐색
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-white">
              <Award className="w-4 h-4 mr-2" />
              추천 일정
            </TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              여행 도구
            </TabsTrigger>
          </TabsList>

          {/* 계획 만들기 탭 */}
          <TabsContent value="planner" className="space-y-8">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Main Planning Form */}
              <div className="lg:col-span-3">
                <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">3분만에 여행 계획 완성</h2>
                    <p className="text-gray-600">AI가 당신의 취향을 분석해서 최적의 여행 계획을 만들어드립니다</p>
                  </div>

                  {/* Travel Style Selection */}
                  <div className={`mb-8 transform transition-all duration-1000 delay-300 ${
                    animatedElements.has('styles') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-red-500" />
                      여행 스타일 선택
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {travelStyles.map((style) => (
                        <Card 
                          key={style.id}
                          className={`relative p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 ${
                            selectedTravelStyle === style.id 
                              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg scale-105' 
                              : 'border-gray-200 hover:border-gray-300 bg-white/70'
                          }`}
                          onClick={() => setSelectedTravelStyle(style.id)}
                        >
                          {selectedTravelStyle === style.id && (
                            <div className="absolute top-2 right-2">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <Sparkles className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          )}
                          
                          <div className="text-center mb-4">
                            <div className="text-3xl mb-3">{style.emoji}</div>
                            <h4 className="font-semibold mb-2">{style.title}</h4>
                            <p className="text-sm text-gray-600 mb-3">
                              {style.description}
                            </p>
                          </div>
                          
                          <div className="space-y-2 text-xs text-gray-500">
                            <div className="flex justify-between">
                              <span>예산:</span>
                              <span className="font-medium">{style.budget}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>기간:</span>
                              <span className="font-medium">{style.duration}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {style.focus.slice(0, 2).map((focus, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {focus}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {showAiMatching && style.matchPercentage && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">AI 매칭도</span>
                                <span className="text-xs font-semibold text-blue-600">{style.matchPercentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all duration-1000"
                                  style={{ width: `${style.matchPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Destination and Duration */}
                  <div className={`grid md:grid-cols-2 gap-8 mb-8 transform transition-all duration-1000 delay-500 ${
                    animatedElements.has('form') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}>
                    {/* Left Column */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-green-500" />
                        목적지와 기간
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-700 font-medium flex items-center mb-2">
                            <Globe className="w-4 h-4 mr-1" />
                            목적지
                          </Label>
                          <Input
                            placeholder="어디로 가실 건가요? (예: 도쿄, 파리, 방콕)"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/70"
                          />
                        </div>

                        <div>
                          <Label className="text-gray-700 font-medium flex items-center mb-2">
                            <Calendar className="w-4 h-4 mr-1" />
                            출발일
                          </Label>
                          <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/70"
                          />
                        </div>

                        <div>
                          <Label className="text-gray-700 font-medium flex items-center mb-2">
                            <Clock className="w-4 h-4 mr-1" />
                            기간
                          </Label>
                          <div className="relative">
                            <select
                              value={duration}
                              onChange={(e) => setDuration(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white/70"
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
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-yellow-500" />
                        예산과 선호사항
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-700 font-medium flex items-center mb-2">
                            <DollarSign className="w-4 h-4 mr-1" />
                            예산
                          </Label>
                          <div className="relative">
                            <select
                              value={budget}
                              onChange={(e) => setBudget(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white/70"
                            >
                              {budgetOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <Label className="text-gray-700 font-medium mb-3 block">관심사 선택</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {interestOptions.map((interest) => (
                              <label 
                                key={interest.id} 
                                className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg transition-all ${
                                  interests.includes(interest.id) 
                                    ? 'bg-blue-100 border-2 border-blue-500 text-blue-700' 
                                    : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={interests.includes(interest.id)}
                                  onChange={() => toggleInterest(interest.id)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 hidden"
                                />
                                <interest.icon className={`w-4 h-4 ${
                                  interests.includes(interest.id) ? 'text-blue-600' : 'text-gray-600'
                                }`} />
                                <span className="text-sm font-medium">{interest.name}</span>
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
                      className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                        !destination || !selectedTravelStyle ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isGenerating ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>AI가 계획을 생성하고 있습니다...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-5 h-5" />
                          <span>AI 여행 계획 생성</span>
                        </div>
                      )}
                    </Button>
                    <p className="text-sm text-gray-500 mt-3">
                      🚀 평균 완성 시간: 30초 | ⭐ 만족도: 98%
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Suggestions Sidebar */}
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  {/* AI Tips */}
                  {showAiMatching && (
                    <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-purple-600" />
                        AI 추천 팁
                      </h3>
                      <div className="space-y-3">
                        {aiSuggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-start space-x-2 p-2 bg-white/50 rounded-lg">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                            <span className="text-sm text-gray-700">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Popular Destinations */}
                  <Card className="p-6 bg-white/70">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                      인기 급상승 여행지
                    </h3>
                    <div className="space-y-3">
                      {destinations.slice(0, 3).map((dest) => (
                        <div key={dest.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                          <span className="text-lg">{dest.emoji}</span>
                          <div>
                            <p className="font-medium text-sm">{dest.name}</p>
                            <p className="text-xs text-gray-500">{dest.budget}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 여행지 탐색 탭 */}
          <TabsContent value="destinations" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">인기 여행지 둘러보기</h2>
              <p className="text-gray-600 text-lg">전 세계 인기 여행지의 상세 정보를 확인하세요</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations.map((dest) => (
                <Card 
                  key={dest.id} 
                  className={`overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 ${
                    selectedDestination?.id === dest.id ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedDestination(selectedDestination?.id === dest.id ? null : dest)}
                >
                  {/* Destination Image */}
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={dest.imageUrl || 'https://images.unsplash.com/photo-1503221043305-f7498f8b7888'}
                      alt={dest.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <div className="flex items-center space-x-1">
                        {getWeatherIcon(dest.weather)}
                        <span className="text-sm font-medium">{dest.temp}</span>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-white font-bold text-xl flex items-center">
                        <span className="text-2xl mr-2">{dest.emoji}</span>
                        {dest.name}
                      </h3>
                      <p className="text-white/80 text-sm">{dest.country} • {dest.region}</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">예산:</span>
                          <span className="font-semibold">{dest.budget}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">기간:</span>
                          <span className="font-semibold">{dest.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">비행시간:</span>
                          <span className="font-semibold">{dest.flightTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">베스트시즌:</span>
                          <span className="font-semibold text-xs">{dest.bestTime}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 mb-2">주요 명소</p>
                        <p className="text-sm text-gray-700">{dest.highlights.join(', ')}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {dest.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {dest.matchScore && (
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">AI 추천도</span>
                            <span className="text-sm font-semibold text-blue-600">{dest.matchScore}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${dest.matchScore}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Selected Destination Details */}
            {selectedDestination && (
              <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      여행 정보
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">통화:</span>
                        <span className="font-medium">{selectedDestination.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">환율:</span>
                        <span className="font-medium">{selectedDestination.exchangeRate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">비자:</span>
                        <span className="font-medium">
                          {selectedDestination.visaRequired ? '필요' : '불필요'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">시차:</span>
                        <span className="font-medium">{selectedDestination.timeZone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Utensils className="w-5 h-5 mr-2 text-orange-600" />
                      특산 음식
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedDestination.foodSpecialty.map((food) => (
                        <Badge key={food} variant="outline" className="bg-white/50">
                          {food}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* 추천 일정 탭 */}
          <TabsContent value="templates" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">인기 여행 패키지</h2>
              <p className="text-gray-600 text-lg">검증된 베스트 여행 코스를 확인해보세요</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {travelTemplates.map((template) => (
                <Card 
                  key={template.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => setSelectedTemplate(selectedTemplate?.id === template.id ? null : template)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={template.imageUrl}
                      alt={template.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-yellow-500 text-yellow-900">
                        <Star className="w-3 h-3 mr-1" />
                        {template.rating}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-white font-bold text-lg">{template.title}</h3>
                      <p className="text-white/80 text-sm">{template.duration}</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">인기도 {template.popularity}%</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">{template.price}</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">여행지: </span>
                        <span className="text-sm font-medium">{template.destinations.join(' → ')}</span>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500">스타일: </span>
                        <Badge variant="outline" className="text-xs">
                          {template.style}
                        </Badge>
                      </div>
                    </div>

                    {selectedTemplate?.id === template.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-semibold mb-2">상세 일정</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {template.itinerary.slice(0, 3).map((day) => (
                            <div key={day.day} className="text-xs">
                              <span className="font-medium">Day {day.day} ({day.location}): </span>
                              <span className="text-gray-600">{day.activities.join(', ')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 여행 도구 탭 */}
          <TabsContent value="tools" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">스마트 여행 도구</h2>
              <p className="text-gray-600 text-lg">여행 계획부터 현지 정보까지 모든 것을 한 곳에서</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 환율 계산기 */}
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">실시간 환율</h3>
                  <p className="text-gray-600 text-sm mb-4">실시간 환율로 여행 예산을 계산하세요</p>
                  <Button variant="outline" className="w-full">
                    환율 확인
                  </Button>
                </div>
              </Card>

              {/* 날씨 정보 */}
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sun className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">날씨 예보</h3>
                  <p className="text-gray-600 text-sm mb-4">여행지의 상세한 날씨 정보를 확인하세요</p>
                  <Button variant="outline" className="w-full">
                    날씨 보기
                  </Button>
                </div>
              </Card>

              {/* 체크리스트 */}
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">여행 체크리스트</h3>
                  <p className="text-gray-600 text-sm mb-4">준비물부터 일정까지 체계적으로 관리하세요</p>
                  <Button variant="outline" className="w-full">
                    체크리스트
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}