import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Folder, 
  Settings, 
  Play, 
  Clock, 
  MapPin, 
  Trash, 
  User,
  LogOut,
  Download,
  Eye,
  ChevronRight,
  Star,
  Globe,
  Calendar,
  Archive,
  FileText,
  Upload,
  Heart,
  ArrowLeft
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';

// 타입 정의
interface GuideHistoryEntry {
  id: string;
  locationName: string;
  createdAt: string;
  language: string;
  tourDuration?: number;
  status?: 'completed' | 'in-progress' | 'saved';
  chapters?: number;
  lastVisited?: string;
}

interface LocalGuideEntry {
  id: string;
  title: string;
  location: string;
  createdAt: string;
  chapters: number;
  language: string;
  lastAccessed?: string;
  isFavorite?: boolean;
}

interface UserStats {
  totalGuides: number;
  completedTours: number;
  favoriteLocations: number;
  totalDuration: number;
  languagesUsed: string[];
  mostVisitedType: string;
}

type TabType = 'history' | 'favorites' | 'offline' | 'settings';

interface MyPageProps {
  onBackToHome: () => void;
}

// 로컬 가이드 조회 함수
const getAllLocalGuides = (): LocalGuideEntry[] => {
  try {
    const keys = Object.keys(localStorage);
    const guideKeys = keys.filter(key => 
      key.startsWith('ai_guide_') || 
      key.startsWith('guide-cache:') || 
      key.startsWith('multilang-guide:') ||
      key.startsWith('tripradio_guide_')
    );
    
    return guideKeys.map(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        const metadata = data.metadata || {};
        const overview = data.overview || {};
        const realTimeGuide = data.realTimeGuide || {};
        
        return {
          id: key,
          title: overview.title || metadata.originalLocationName || data.title || 'Unknown Guide',
          location: metadata.originalLocationName || data.location || 'Unknown Location',
          language: metadata.language || data.language || 'ko',
          createdAt: metadata.generatedAt || data.createdAt || new Date().toISOString(),
          chapters: realTimeGuide.chapters?.length || data.chapters || 0,
          lastAccessed: localStorage.getItem(`${key}_last_accessed`) || undefined,
          isFavorite: localStorage.getItem(`${key}_favorite`) === 'true'
        };
      } catch {
        return null;
      }
    }).filter(Boolean) as LocalGuideEntry[];
  } catch {
    return [];
  }
};

// 사용자 통계 계산
const calculateUserStats = (guides: LocalGuideEntry[]): UserStats => {
  const languagesUsed = [...new Set(guides.map(g => g.language))];
  const totalChapters = guides.reduce((sum, g) => sum + g.chapters, 0);
  const favoriteCount = guides.filter(g => g.isFavorite).length;
  
  // 가장 많이 사용된 언어
  const languageCounts = guides.reduce((acc, guide) => {
    acc[guide.language] = (acc[guide.language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostUsedLanguage = Object.entries(languageCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'ko';

  return {
    totalGuides: guides.length,
    completedTours: guides.filter(g => g.lastAccessed).length,
    favoriteLocations: favoriteCount,
    totalDuration: totalChapters * 8, // 챕터당 평균 8분 가정
    languagesUsed,
    mostVisitedType: mostUsedLanguage
  };
};

// 안전한 localStorage 삭제 함수
const safeDeleteFromStorage = (id: string): void => {
  try {
    localStorage.removeItem(id);
    localStorage.removeItem(`${id}_last_accessed`);
    localStorage.removeItem(`${id}_favorite`);
    console.log('가이드 삭제 완료:', id);
  } catch (error) {
    console.error('가이드 삭제 실패:', error);
  }
};

// 즐겨찾기 토글
const toggleFavorite = (id: string): void => {
  try {
    const currentFavorite = localStorage.getItem(`${id}_favorite`) === 'true';
    localStorage.setItem(`${id}_favorite`, (!currentFavorite).toString());
  } catch (error) {
    console.error('즐겨찾기 토글 실패:', error);
  }
};

// 마지막 접근 시간 업데이트
const updateLastAccessed = (id: string): void => {
  try {
    localStorage.setItem(`${id}_last_accessed`, new Date().toISOString());
  } catch (error) {
    console.error('접근 시간 업데이트 실패:', error);
  }
};

export function MyPage({ onBackToHome }: MyPageProps) {
  const { user, logout, isLoading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [localGuides, setLocalGuides] = useState<LocalGuideEntry[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'chapters'>('date');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const guides = getAllLocalGuides();
        const stats = calculateUserStats(guides);
        
        setLocalGuides(guides);
        setUserStats(stats);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 인증 확인
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="p-8 max-w-md w-full mx-4 text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-black mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-6">마이페이지를 이용하려면 먼저 로그인해주세요.</p>
          <Button 
            onClick={onBackToHome}
            className="w-full bg-black text-white hover:bg-gray-800"
          >
            홈으로 돌아가기
          </Button>
        </Card>
      </div>
    );
  }

  // 필터링 및 정렬
  const filteredGuides = localGuides
    .filter(guide => {
      const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           guide.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLanguage = filterLanguage === 'all' || guide.language === filterLanguage;
      return matchesSearch && matchesLanguage;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'chapters':
          return b.chapters - a.chapters;
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const favoriteGuides = filteredGuides.filter(guide => guide.isFavorite);

  // 가이드 삭제 핸들러
  const handleDeleteGuide = (id: string) => {
    if (confirm('이 가이드를 삭제하시겠습니까?')) {
      safeDeleteFromStorage(id);
      setLocalGuides(prev => prev.filter(guide => guide.id !== id));
      
      // 통계 업데이트
      const updatedGuides = localGuides.filter(guide => guide.id !== id);
      setUserStats(calculateUserStats(updatedGuides));
    }
  };

  // 즐겨찾기 토글 핸들러
  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
    setLocalGuides(prev => 
      prev.map(guide => 
        guide.id === id 
          ? { ...guide, isFavorite: !guide.isFavorite }
          : guide
      )
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '오늘';
    if (diffDays === 2) return '어제';
    if (diffDays <= 7) return `${diffDays}일 전`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}주 전`;
    
    return date.toLocaleDateString('ko-KR');
  };

  // 탭 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'history':
        return (
          <div className="max-w-4xl space-y-6">
            {/* 통계 카드 */}
            {userStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gray-50">
                  <div className="text-2xl font-bold text-black">{userStats.totalGuides}</div>
                  <div className="text-sm text-gray-600">총 가이드</div>
                </Card>
                <Card className="p-4 bg-gray-50">
                  <div className="text-2xl font-bold text-black">{userStats.completedTours}</div>
                  <div className="text-sm text-gray-600">완료한 투어</div>
                </Card>
                <Card className="p-4 bg-gray-50">
                  <div className="text-2xl font-bold text-black">{userStats.favoriteLocations}</div>
                  <div className="text-sm text-gray-600">즐겨찾기</div>
                </Card>
                <Card className="p-4 bg-gray-50">
                  <div className="text-2xl font-bold text-black">{Math.round(userStats.totalDuration / 60)}h</div>
                  <div className="text-sm text-gray-600">총 시간</div>
                </Card>
              </div>
            )}

            {/* 검색 및 필터 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="가이드 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-full border-gray-300 focus:border-black focus:ring-black"
                />
              </div>
              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">모든 언어</option>
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="zh">中文</option>
                <option value="es">Español</option>
              </select>
            </div>

            {/* 가이드 목록 */}
            <div className="space-y-4">
              {filteredGuides.map((guide) => (
                <Card
                  key={guide.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-black mb-1">{guide.title}</h3>
                      <p className="text-sm text-gray-500 mb-2 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {guide.location}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(guide.createdAt)}
                        </span>
                        <span className="flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          {guide.chapters}개 챕터
                        </span>
                        <span className="flex items-center">
                          <Globe className="w-3 h-3 mr-1" />
                          {guide.language.toUpperCase()}
                        </span>
                        {guide.lastAccessed && (
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {formatDate(guide.lastAccessed)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(guide.id);
                        }}
                        className="p-2 h-8 w-8"
                      >
                        <Star 
                          className={`h-4 w-4 ${guide.isFavorite ? 'fill-current text-yellow-500' : 'text-gray-400'}`} 
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGuide(guide.id);
                        }}
                        className="p-2 h-8 w-8 text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredGuides.length === 0 && (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-black mb-2">가이드 히스토리가 없습니다</h3>
                <p className="text-gray-500 mb-4">새로운 장소를 검색하여 가이드를 생성해보세요!</p>
                <Button
                  onClick={onBackToHome}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  가이드 생성하기
                </Button>
              </div>
            )}
          </div>
        );

      case 'favorites':
        return (
          <div className="max-w-4xl space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-black mb-2">즐겨찾기 가이드</h2>
              <p className="text-gray-500 text-sm">자주 찾는 가이드들을 모아놨습니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteGuides.map((guide) => (
                <Card
                  key={guide.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-black mb-1 line-clamp-2">{guide.title}</h3>
                      <p className="text-sm text-gray-500 mb-2 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {guide.location}
                      </p>
                    </div>
                    <Star className="h-5 w-5 text-yellow-500 fill-current ml-2" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center">
                        <FileText className="w-3 h-3 mr-1" />
                        {guide.chapters}개 챕터
                      </span>
                      <span className="flex items-center">
                        <Globe className="w-3 h-3 mr-1" />
                        {guide.language.toUpperCase()}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Card>
              ))}
            </div>

            {favoriteGuides.length === 0 && (
              <div className="text-center py-12">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-black mb-2">즐겨찾기한 가이드가 없습니다</h3>
                <p className="text-gray-500 mb-4">가이드를 보며 별표 버튼을 클릭하여 즐겨찾기를 추가해보세요!</p>
                <Button
                  onClick={onBackToHome}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  가이드 생성하기
                </Button>
              </div>
            )}
          </div>
        );

      case 'offline':
        return (
          <div className="max-w-4xl space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-black mb-2">오프라인 다운로드</h2>
              <p className="text-gray-500 text-sm">오프라인에서도 이용할 수 있도록 다운로드한 가이드들입니다.</p>
            </div>

            <div className="text-center py-12">
              <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-black mb-2">오프라인 다운로드된 가이드가 없습니다</h3>
              <p className="text-gray-500 mb-4">
                가이드를 보며 다운로드 버튼을 클릭하여 오프라인에서도 이용할 수 있도록 저장해보세요!
              </p>
              <Card className="bg-blue-50 border border-blue-200 p-6 mt-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Download className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">오프라인 기능 안내</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• 인터넷 연결 없이도 가이드 이용 가능</p>
                      <p>• 오디오 파일까지 함께 저장</p>
                      <p>• 모바일 저장 공간에 안전하게 보관</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="max-w-4xl space-y-6">
            {/* 계정 설정 */}
            <Card className="p-6 border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-4">계정 설정</h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-black font-medium">이름</Label>
                  <Input
                    type="text"
                    value={user?.name || ''}
                    className="mt-1 rounded-full border-gray-300 focus:border-black focus:ring-black"
                    placeholder="이름을 입력하세요"
                  />
                </div>
                
                <div>
                  <Label className="text-black font-medium">이메일</Label>
                  <Input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="mt-1 rounded-full border-gray-300 bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">이메일은 변경할 수 없습니다</p>
                </div>
                
                <div>
                  <Label className="text-black font-medium">기본 언어</Label>
                  <select className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-transparent">
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                    <option value="zh">中文</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* 알림 설정 */}
            <Card className="p-6 border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-4">알림 설정</h3>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" defaultChecked />
                  <span className="ml-3 text-sm text-gray-700">새로운 기능 알림</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" defaultChecked />
                  <span className="ml-3 text-sm text-gray-700">가이드 생성 완료 알림</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" />
                  <span className="ml-3 text-sm text-gray-700">마케팅 이메일 수신</span>
                </label>
              </div>
            </Card>

            {/* 데이터 관리 */}
            <Card className="p-6 border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-4">데이터 관리</h3>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-between border-gray-200 hover:bg-gray-50"
                >
                  <div className="text-left">
                    <div className="font-medium text-black">데이터 내보내기</div>
                    <div className="text-sm text-gray-500">모든 가이드 데이터를 JSON 형태로 다운로드</div>
                  </div>
                  <Download className="h-5 w-5 text-gray-400" />
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-between border-red-200 hover:bg-red-50 text-red-600"
                >
                  <div className="text-left">
                    <div className="font-medium">모든 데이터 삭제</div>
                    <div className="text-sm text-red-400">저장된 모든 가이드와 설정을 삭제합니다</div>
                  </div>
                  <Trash className="h-5 w-5" />
                </Button>
              </div>
            </Card>

            {/* 로그아웃 */}
            <Card className="p-6 border-gray-200">
              <Button
                onClick={() => {
                  if (confirm('로그아웃 하시겠습니까?')) {
                    logout();
                    onBackToHome();
                  }
                }}
                className="w-full bg-gray-800 text-white hover:bg-black font-medium"
              >
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 w-full glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToHome}
                className="text-gray-500 hover:text-black"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로
              </Button>
              <h1 className="text-xl font-semibold text-black">마이페이지</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>
              <span className="font-medium text-black">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'history', label: '나의 가이드', icon: Folder },
              { id: 'favorites', label: '즐겨찾기', icon: Heart },
              { id: 'offline', label: '오프라인', icon: Download },
              { id: 'settings', label: '설정', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <span className="ml-2 text-gray-500">로딩 중...</span>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
}