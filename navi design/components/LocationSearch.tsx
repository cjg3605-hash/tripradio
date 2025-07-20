import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Search, 
  MapPin, 
  Clock, 
  Star,
  ArrowLeft,
  Sparkles,
  Download,
  Play,
  Mic,
  X,
  TrendingUp
} from 'lucide-react';
import { useApp, Guide } from '../App';

const popularSearches = [
  '경복궁, 서울',
  '마추픽추, 페루', 
  '만리장성, 중국',
  '자유의 여신상, 뉴욕',
  '콜로세움, 로마',
  '타지마할, 인도',
  '페트라, 요르단',
  '에펠탑, 파리'
];

const searchResults = [
  {
    id: '1',
    name: '루브르 박물관',
    location: '파리, 프랑스',
    rating: 4.8,
    duration: '2-3시간',
    tags: ['예술', '역사', '문화'],
    description: '세계 최대 규모의 미술관이자 파리의 역사적 명소',
    pattern: 'museum'
  },
  {
    id: '2',
    name: '노트르담 대성당',
    location: '파리, 프랑스',
    rating: 4.7,
    duration: '1-2시간',
    tags: ['건축', '역사', '종교'],
    description: '고딕 건축의 걸작이자 문화적 아이콘',
    pattern: 'cathedral'
  },
  {
    id: '3',
    name: '에펠탑',
    location: '파리, 프랑스',
    rating: 4.6,
    duration: '1시간',
    tags: ['건축', '랜드마크'],
    description: '파리의 상징적인 철탑 건축물',
    pattern: 'tower'
  }
];

// 패턴 컴포넌트
const LocationPattern = ({ pattern, className = "w-full h-full" }: { pattern: string; className?: string }) => {
  switch (pattern) {
    case 'museum':
      return (
        <div className={`${className} flex items-center justify-center`}>
          <div className="relative">
            <div className="w-16 h-12 border-2 border-foreground"></div>
            <div className="absolute -top-2 -left-1 w-18 h-2 bg-foreground"></div>
            <div className="absolute top-2 left-2 w-3 h-8 border border-foreground"></div>
            <div className="absolute top-2 right-2 w-3 h-8 border border-foreground"></div>
          </div>
        </div>
      );
    case 'cathedral':
      return (
        <div className={`${className} flex items-center justify-center`}>
          <div className="relative">
            <div className="w-12 h-16 border-2 border-foreground"></div>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-6 border-2 border-foreground border-b-0"></div>
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-4 h-4 border-2 border-foreground border-b-0"></div>
            <div className="absolute top-2 left-1 w-2 h-12 border-l-2 border-foreground"></div>
            <div className="absolute top-2 right-1 w-2 h-12 border-r-2 border-foreground"></div>
          </div>
        </div>
      );
    case 'tower':
      return (
        <div className={`${className} flex items-center justify-center`}>
          <div className="relative">
            <div className="w-2 h-16 bg-foreground mx-auto"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-4 border-2 border-foreground border-b-0"></div>
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-6 h-4 border-l-2 border-r-2 border-foreground"></div>
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-10 h-4 border-l-2 border-r-2 border-foreground"></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-foreground"></div>
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

export default function LocationSearch() {
  const { setCurrentScreen, setCurrentGuide, userPreferences } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const generateGuide = async (location: any) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    const stages = [
      { text: '위치 정보를 분석하고 있어요...', progress: 20 },
      { text: '역사적 정보를 수집하고 있어요...', progress: 40 },
      { text: '맞춤형 콘텐츠를 만들고 있어요...', progress: 60 },
      { text: '오디오 챕터를 생성하고 있어요...', progress: 80 },
      { text: '가이드를 완성하고 있어요...', progress: 100 }
    ];

    for (const stage of stages) {
      setGenerationStage(stage.text);
      setGenerationProgress(stage.progress);
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    const mockGuide: Guide = {
      id: location.id,
      location: location.name,
      overview: {
        title: location.name,
        description: location.description,
        highlights: [
          '세계적으로 유명한 예술 컬렉션',
          '모나리자와 밀로의 비너스',
          '역사적인 궁전 건축',
          '이집트 고고학 유물'
        ],
        duration: location.duration,
        difficulty: '쉬움'
      },
      notice: {
        visitingHours: '화-일 09:00-18:00 (월요일 휴관)',
        admissionFee: '성인 17유로, 청소년 무료',
        tips: [
          '온라인 사전 예약 필수',
          '수요일 18시 이후 무료 관람',
          '큰 가방은 입구에서 보관',
          '오디오 가이드 대여 가능'
        ],
        warnings: [
          '플래시 촬영 금지',
          '음식물 반입 금지',
          '마지막 입장 17:30'
        ]
      },
      route: {
        waypoints: [
          {
            name: '메인 입구',
            description: '상징적인 유리 피라미드에서 여행을 시작하세요',
            coordinates: [48.8606, 2.3376],
            estimatedTime: '5분'
          },
          {
            name: '모나리자 갤러리',
            description: '세계에서 가장 유명한 그림을 감상하세요',
            coordinates: [48.8608, 2.3378],
            estimatedTime: '30분'
          },
          {
            name: '이집트관',
            description: '고대 이집트 유물들을 탐험하세요',
            coordinates: [48.8610, 2.3380],
            estimatedTime: '45분'
          }
        ]
      },
      audioChapters: [
        {
          id: '1',
          title: '루브르 박물관 소개',
          duration: '8분',
          transcript: '세계 최대의 미술관인 루브르 박물관에 오신 것을 환영합니다...'
        },
        {
          id: '2',
          title: '모나리자와 이탈리아 회화',
          duration: '12분',
          transcript: '레오나르도 다빈치의 걸작품은 수세기 동안 방문객들을 매혹시켜왔습니다...'
        },
        {
          id: '3',
          title: '고대 이집트 컬렉션',
          duration: '15분',
          transcript: '이집트 컬렉션은 50,000점 이상의 유물을 소장하고 있습니다...'
        },
        {
          id: '4',
          title: '그리스 로마 조각',
          duration: '10분',
          transcript: '고전 고대 조각품들이 보여주는 예술의 완성도를 감상해보세요...'
        }
      ]
    };

    setCurrentGuide(mockGuide);
    setIsGenerating(false);
    setCurrentScreen('guide');
  };

  if (isGenerating) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsGenerating(false)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-medium">AI 가이드 생성 중</h1>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-sm mx-auto text-center space-y-8">
            <div className="w-32 h-32 border-4 border-border rounded-full flex items-center justify-center mx-auto relative">
              <Sparkles className="w-16 h-16 text-foreground animate-pulse" />
              <div className="absolute inset-0 border-4 border-foreground/20 rounded-full animate-ping"></div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-medium">당신만의 개인 가이드를 만들고 있어요</h2>
              <p className="text-muted-foreground text-lg">{generationStage}</p>
            </div>

            <div className="space-y-3">
              <Progress value={generationProgress} className="h-3" />
              <p className="text-sm text-muted-foreground font-medium">{generationProgress}% 완료</p>
            </div>

            <div className="space-y-3 text-left border border-border rounded-lg p-4">
              <p className="text-sm font-medium">당신의 취향에 맞춰 맞춤화 중:</p>
              <div className="flex flex-wrap gap-2">
                {(userPreferences?.interests ?? []).slice(0, 3).map((interest) => (
                  <Badge key={interest} variant="outline" className="text-xs border-border">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCurrentScreen('home')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-medium">여행지 탐색</h1>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="장소, 명소, 도시를 검색하세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-20 py-6 text-lg rounded-xl border-2 border-border focus:border-foreground"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={clearSearch}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 border border-border"
            >
              <Mic className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Popular Searches */}
        {!searchQuery && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 border-2 border-foreground rounded flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h2 className="font-medium text-lg">인기 여행지</h2>
            </div>
            <div className="space-y-3">
              {popularSearches.map((suggestion) => (
                <Card 
                  key={suggestion}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 border border-border hover:border-foreground"
                  onClick={() => handleSearch(suggestion)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 border-2 border-border rounded-full flex items-center justify-center">
                      <Search className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium">{suggestion}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchQuery && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-medium text-lg">검색 결과</h2>
              <span className="text-sm text-muted-foreground">
                {searchResults.length}개 결과
              </span>
            </div>
            
            <div className="space-y-6">
              {searchResults.map((result) => (
                <Card key={result.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 border border-border hover:border-foreground">
                  <CardContent className="p-0">
                    {/* 기하학적 헤더 */}
                    <div className="h-32 relative bg-muted border-b border-border flex items-center justify-center">
                      <LocationPattern pattern={result.pattern} className="w-20 h-20" />
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 border border-border">
                        <Star className="w-3 h-3 text-foreground" />
                        <span className="text-xs font-medium">{result.rating}</span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium mb-1">{result.name}</h3>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{result.location}</span>
                          </div>
                        </div>

                        <p className="text-muted-foreground">
                          {result.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{result.duration}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {result.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="border-border">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button 
                            className="flex-1 py-6 bg-foreground text-background hover:bg-foreground/90"
                            onClick={() => generateGuide(result)}
                          >
                            <Sparkles className="w-5 h-5 mr-2" />
                            AI 가이드 생성
                          </Button>
                          <Button variant="outline" size="icon" className="w-12 h-12 border-border">
                            <Download className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Bottom spacing */}
        <div className="h-24" />
      </div>
    </div>
  );
}