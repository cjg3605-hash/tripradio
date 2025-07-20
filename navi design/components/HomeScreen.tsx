import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  Play,
  TrendingUp,
  Compass,
  Headphones,
  ChevronRight,
  Volume2,
  Bookmark
} from 'lucide-react';
import { useApp, useTranslation } from '../App';

const featuredDestinations = [
  {
    id: '1',
    name: '경복궁',
    location: '서울, 대한민국',
    duration: '90분',
    rating: 4.8,
    tags: ['역사', '건축'],
    description: '조선왕조의 법궁, 웅장한 건축미',
    pattern: 'palace'
  },
  {
    id: '2',
    name: '센소지 사원',
    location: '도쿄, 일본',
    duration: '75분',
    rating: 4.9,
    tags: ['종교', '문화'],
    description: '도쿄에서 가장 오래된 사원',
    pattern: 'temple'
  },
  {
    id: '3',
    name: '루브르 박물관',
    location: '파리, 프랑스',
    duration: '120분',
    rating: 4.7,
    tags: ['예술', '역사'],
    description: '세계 최대 규모의 미술관',
    pattern: 'museum'
  }
];

const recentGuides = [
  {
    id: '6',
    name: '루브르 박물관',
    location: '파리, 프랑스',
    lastPlayed: '2일 전',
    progress: 75,
    pattern: 'museum'
  }
];

// 패턴 컴포넌트들
const PatternIcon = ({ pattern, className = "w-full h-full" }: { pattern: string; className?: string }) => {
  switch (pattern) {
    case 'palace':
      return (
        <div className={`${className} relative flex items-center justify-center`}>
          <div className="w-16 h-16 border-2 border-foreground rounded-sm relative">
            <div className="absolute inset-2 border border-foreground"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-8 h-3 bg-foreground"></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-foreground"></div>
          </div>
        </div>
      );
    case 'temple':
      return (
        <div className={`${className} relative flex items-center justify-center`}>
          <div className="relative">
            <div className="w-12 h-12 border-2 border-foreground rounded-full"></div>
            <div className="absolute top-2 left-2 w-8 h-8 border border-foreground rounded-full"></div>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-6 border-2 border-foreground rounded-t-full"></div>
          </div>
        </div>
      );
    case 'museum':
      return (
        <div className={`${className} relative flex items-center justify-center`}>
          <div className="relative">
            <div className="w-16 h-12 border-2 border-foreground"></div>
            <div className="absolute -top-2 -left-1 w-18 h-2 bg-foreground"></div>
            <div className="absolute top-2 left-2 w-3 h-8 border border-foreground"></div>
            <div className="absolute top-2 right-2 w-3 h-8 border border-foreground"></div>
          </div>
        </div>
      );
    default:
      return (
        <div className={`${className} flex items-center justify-center`}>
          <div className="w-12 h-12 border-2 border-foreground rounded-full flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
        </div>
      );
  }
};

export default function HomeScreen() {
  const { setCurrentScreen, userPreferences } = useApp();
  const { t } = useTranslation();

  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    const { language } = userPreferences || { language: 'ko' };
    
    const greetings = {
      ko: hour < 12 ? '좋은 아침이에요' : hour < 18 ? '안녕하세요' : '좋은 저녁이에요',
      en: hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening',
      ja: hour < 12 ? 'おはようございます' : hour < 18 ? 'こんにちは' : 'こんばんは',
      zh: hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好',
      es: hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'
    };
    
    return greetings[language] || greetings.ko;
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="mb-8">
          <p className="text-muted-foreground mb-2 text-sm">{getPersonalizedGreeting()}</p>
          <h1 className="text-2xl font-bold text-foreground mb-1">오늘 어디로 떠나볼까요?</h1>
          <div className="w-8 h-0.5 bg-foreground rounded-full mt-3"></div>
        </div>

        {/* Large Search Button */}
        <Card 
          className="cursor-pointer hover:shadow-xl transition-all duration-300 border border-border hover:border-foreground/50 rounded-3xl overflow-hidden"
          onClick={() => setCurrentScreen('search')}
        >
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-14 h-14 border-2 border-foreground rounded-2xl flex items-center justify-center bg-foreground/5">
              <Search className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-foreground">새로운 여행지 찾기</p>
              <p className="text-sm text-muted-foreground mt-1">AI가 맞춤 가이드를 만들어드려요</p>
            </div>
            <div className="w-10 h-10 border border-border rounded-xl flex items-center justify-center hover:border-foreground transition-colors">
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Listening */}
      {recentGuides.length > 0 && (
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-7 h-7 border-2 border-foreground rounded-xl flex items-center justify-center bg-foreground/5">
              <Headphones className="w-4 h-4 text-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">이어서 듣기</h2>
          </div>
          {recentGuides.map((guide) => (
            <Card key={guide.id} className="cursor-pointer hover:shadow-lg transition-all duration-300 border border-border hover:border-foreground/50 rounded-3xl overflow-hidden mb-4">
              <CardContent className="p-6">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 border-2 border-border rounded-2xl flex items-center justify-center relative bg-muted/30">
                    <PatternIcon pattern={guide.pattern} className="w-12 h-12" />
                    <div className="absolute inset-0 bg-foreground/5 rounded-2xl flex items-center justify-center">
                      <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
                        <Play className="w-4 h-4 text-background ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground mb-1">{guide.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{guide.location}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-foreground rounded-full transition-all duration-500"
                          style={{ width: `${guide.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-semibold">{guide.progress}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Featured Destinations */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 border-2 border-foreground rounded-xl flex items-center justify-center bg-foreground/5">
              <Star className="w-4 h-4 text-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">추천 여행지</h2>
          </div>
          <div className="w-8 h-8 border border-border rounded-xl flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-6">
          {featuredDestinations.map((destination, index) => (
            <Card 
              key={destination.id} 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border border-border hover:border-foreground/50 rounded-3xl"
              onClick={() => setCurrentScreen('search')}
            >
              <CardContent className="p-0">
                {/* 기하학적 헤더 */}
                <div className="h-40 relative bg-gradient-to-br from-muted/30 to-muted/10 border-b border-border flex items-center justify-center">
                  <PatternIcon pattern={destination.pattern} className="w-24 h-24" />
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-background/95 backdrop-blur-sm rounded-2xl px-3 py-1.5 border border-border/50">
                    <Star className="w-3.5 h-3.5 text-foreground fill-current" />
                    <span className="text-sm font-bold text-foreground">{destination.rating}</span>
                  </div>
                  <div className="absolute top-4 left-4">
                    <button className="w-10 h-10 bg-background/95 backdrop-blur-sm border border-border/50 rounded-2xl flex items-center justify-center hover:bg-background transition-colors">
                      <Bookmark className="w-4 h-4 text-foreground" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-foreground mb-2">{destination.name}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">{destination.location}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{destination.description}</p>
                  </div>

                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{destination.duration}</span>
                    </div>
                    <div className="flex gap-2">
                      {destination.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs border-border/50 bg-muted/20 font-medium px-3 py-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <button className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-2xl py-3 px-4 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
                    <Play className="w-4 h-4" />
                    가이드 시작하기
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-7 h-7 border-2 border-foreground rounded-xl flex items-center justify-center bg-foreground/5">
            <Compass className="w-4 h-4 text-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground">빠른 액션</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border border-border hover:border-foreground/50 rounded-3xl">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 border-2 border-border rounded-2xl flex items-center justify-center mx-auto mb-4 bg-muted/20 hover:border-foreground transition-colors">
                <MapPin className="w-7 h-7 text-foreground" />
              </div>
              <p className="font-bold mb-2 text-foreground">주변 명소</p>
              <p className="text-xs text-muted-foreground leading-relaxed">근처 관광지 찾기</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border border-border hover:border-foreground/50 rounded-3xl">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 border-2 border-border rounded-2xl flex items-center justify-center mx-auto mb-4 bg-muted/20 hover:border-foreground transition-colors">
                <Volume2 className="w-7 h-7 text-foreground" />
              </div>
              <p className="font-bold mb-2 text-foreground">오디오 투어</p>
              <p className="text-xs text-muted-foreground leading-relaxed">저장된 가이드</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="h-24" />
    </div>
  );
}