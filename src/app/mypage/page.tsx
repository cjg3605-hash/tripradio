'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  TrendingUp, 
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
  Brain,
  Sparkles
} from 'lucide-react';
import PersonalityDiagnosisModal from '@/components/personality/PersonalityDiagnosisModal';
import { ResponsiveContainer, PageHeader, Card, Grid, Stack, Flex, EmptyState } from '@/components/layout/ResponsiveContainer';
import { Button } from '@/components/ui/button';

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

interface FileGuideEntry {
  id: string;
  fileName: string;
  uploadedAt: string;
  fileSize: number;
  type: 'pdf' | 'text' | 'docx';
  status: 'processing' | 'ready' | 'error';
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

type TabType = 'overview' | 'guides' | 'favorites' | 'files' | 'settings';

// 로컬 가이드 조회 함수 (개선)
const getAllLocalGuides = (): LocalGuideEntry[] => {
  try {
    const keys = Object.keys(localStorage);
    const guideKeys = keys.filter(key => 
      key.startsWith('ai_guide_') || 
      key.startsWith('guide-cache:') || 
      key.startsWith('multilang-guide:')
    );
    
    return guideKeys.map(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        const metadata = data.metadata || {};
        const overview = data.overview || {};
        const realTimeGuide = data.realTimeGuide || {};
        
        return {
          id: key,
          title: overview.title || metadata.originalLocationName || 'Unknown Guide',
          location: metadata.originalLocationName || 'Unknown Location',
          language: metadata.language || 'ko',
          createdAt: metadata.generatedAt || new Date().toISOString(),
          chapters: realTimeGuide.chapters?.length || 0,
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
    if (id.startsWith('guide-cache:') || id.startsWith('ai_guide_') || id.startsWith('multilang-guide:')) {
      localStorage.removeItem(id);
      localStorage.removeItem(`${id}_last_accessed`);
      localStorage.removeItem(`${id}_favorite`);
      console.log('가이드 삭제 완료:', id);
    }
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

export default function MyPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { currentLanguage, t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [localGuides, setLocalGuides] = useState<LocalGuideEntry[]>([]);
  const [fileGuides, setFileGuides] = useState<FileGuideEntry[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPersonalityModal, setShowPersonalityModal] = useState(false);
  const [personalityResults, setPersonalityResults] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'chapters'>('date');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');

  // 개인화 진단 결과 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem('personalityDiagnosis');
      if (saved) {
        setPersonalityResults(JSON.parse(saved));
      }
    } catch (error) {
      console.error('개인화 진단 결과 로드 실패:', error);
    }
  }, []);

  // 개인화 진단 완료 핸들러
  const handlePersonalityComplete = (results: any) => {
    setPersonalityResults(results);
  };

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const guides = getAllLocalGuides();
        const stats = calculateUserStats(guides);
        
        setLocalGuides(guides);
        setUserStats(stats);
        
        // 파일 가이드는 향후 구현
        setFileGuides([]);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 인증 확인
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
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
    if (confirm(t('common.confirmDelete') || '이 가이드를 삭제하시겠습니까?')) {
      safeDeleteFromStorage(id);
      setLocalGuides(prev => prev.filter(guide => guide.id !== id));
      
      // 통계 업데이트
      const updatedGuides = localGuides.filter(guide => guide.id !== id);
      setUserStats(calculateUserStats(updatedGuides));
    }
  };

  // 가이드 보기 핸들러
  const handleViewGuide = (guide: LocalGuideEntry) => {
    updateLastAccessed(guide.id);
    router.push(`/guide/${encodeURIComponent(guide.location)}`);
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
    
    if (diffDays === 1) return t('date.today') || '오늘';
    if (diffDays === 2) return t('date.yesterday') || '어제';
    if (diffDays <= 7) return `${diffDays}${t('common.daysAgo') || '일 전'}`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}${t('common.weeksAgo') || '주 전'}`;
    
    return date.toLocaleDateString('ko-KR');
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  };

  // 탭 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Stack>
            <Grid cols={4} gap="lg">
            {/* 통계 카드들 */}
            <Card hover className="text-center">
              <Flex direction="col" align="center" gap="md">
                <div className="p-3 bg-black rounded-full">
                  <Folder className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('mypage.totalGuides') || '총 가이드'}</p>
                  <p className="text-fluid-2xl font-bold text-black">{userStats?.totalGuides || 0}</p>
                </div>
                <p className="text-xs text-gray-400">
                  {userStats?.languagesUsed.length || 0}{t('common.languagesGenerated') || '개 언어로 생성'}
                </p>
              </Flex>
            </Card>

            <Card hover className="text-center">
              <Flex direction="col" align="center" gap="md">
                <div className="p-3 bg-black rounded-full">
                  <Play className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('mypage.completedTours') || '완료한 투어'}</p>
                  <p className="text-fluid-2xl font-bold text-black">{userStats?.completedTours || 0}</p>
                </div>
                <p className="text-xs text-gray-400">
                  {t('common.total') || '총'} {formatDuration(userStats?.totalDuration || 0)}
                </p>
              </Flex>
            </Card>

            <Card hover className="text-center">
              <Flex direction="col" align="center" gap="md">
                <div className="p-3 bg-black rounded-full">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('mypage.favoriteGuides') || '즐겨찾기'}</p>
                  <p className="text-fluid-2xl font-bold text-black">{userStats?.favoriteLocations || 0}</p>
                </div>
                <p className="text-xs text-gray-400">
                  {t('mypage.frequentPlaces') || '자주 방문하는 장소들'}
                </p>
              </Flex>
            </Card>

            <Card hover className="text-center">
              <Flex direction="col" align="center" gap="md">
                <div className="p-3 bg-black rounded-full">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('mypage.primaryLanguage') || '주 사용 언어'}</p>
                  <p className="text-fluid-2xl font-bold text-black">
                    {userStats?.mostVisitedType?.toUpperCase() || 'KO'}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  {userStats?.languagesUsed.join(', ') || t('common.none') || '없음'}
                </p>
              </Flex>
            </Card>
          </Grid>

          {/* 개인화 진단 섹션 */}
          <Card variant="elevated" className="bg-gradient-to-r from-purple-50 to-blue-50">
              <Flex justify="between" align="start">
                <div className="flex-1">
                  <Flex align="center" gap="sm" className="mb-3">
                    <Brain className="w-6 h-6 text-purple-600 mr-2" />
                    <h3 className="text-fluid-lg font-semibold text-black">
                      {t('mypage.personalizedDiagnosis') || '개인화 가이드 맞춤 진단'}
                    </h3>
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </Flex>
                  
                  {personalityResults ? (
                    <div className="space-y-3">
                      <p className="text-gray-600">
                        {t('mypage.diagnosisComplete') || '진단 완료! 당신의 주도적 성격은'} <span className="font-semibold text-black">
                          {personalityResults.dominantTrait === 'openness' ? '개방성' :
                           personalityResults.dominantTrait === 'conscientiousness' ? '성실성' :
                           personalityResults.dominantTrait === 'extraversion' ? '외향성' :
                           personalityResults.dominantTrait === 'agreeableness' ? '친화성' : '안정성'}
                        </span>{t('mypage.diagnosisResult') || '입니다'}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <div className="flex items-center mr-4">
                          <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                          {t('mypage.reliability') || '신뢰도'} {(personalityResults.confidence * 100).toFixed(1)}%
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                          {new Date(personalityResults.completedAt).toLocaleDateString(currentLanguage === 'ko' ? 'ko-KR' : 'en-US')} {t('mypage.diagnosed') || '진단'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="bg-gray-50 rounded px-3 py-2">
                          <div className="font-medium text-black">{t('mypage.contentDepth') || '설명 깊이'}</div>
                          <div className="text-gray-600">
                            {personalityResults.personalizedSettings.contentDepth === 'comprehensive' ? '매우 상세' :
                             personalityResults.personalizedSettings.contentDepth === 'detailed' ? '상세함' :
                             personalityResults.personalizedSettings.contentDepth === 'moderate' ? '적당함' : '간단함'}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded px-3 py-2">
                          <div className="font-medium text-black">{t('mypage.guideStyle') || '가이드 스타일'}</div>
                          <div className="text-gray-600">
                            {personalityResults.personalizedSettings.narrativeStyle === 'storytelling' ? '스토리텔링' :
                             personalityResults.personalizedSettings.narrativeStyle === 'academic' ? '학술적' :
                             personalityResults.personalizedSettings.narrativeStyle === 'conversational' ? '대화형' : '사실적'}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded px-3 py-2">
                          <div className="font-medium text-black">{t('mypage.interaction') || '상호작용'}</div>
                          <div className="text-gray-600">
                            {personalityResults.personalizedSettings.interactionLevel === 'highly_interactive' ? '매우 활발' :
                             personalityResults.personalizedSettings.interactionLevel === 'interactive' ? '활발함' :
                             personalityResults.personalizedSettings.interactionLevel === 'moderate' ? '적당함' : '차분함'}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded px-3 py-2">
                          <div className="font-medium text-black">{t('mypage.emotionalTone') || '감정 톤'}</div>
                          <div className="text-gray-600">
                            {personalityResults.personalizedSettings.emotionalTone === 'enthusiastic' ? '열정적' :
                             personalityResults.personalizedSettings.emotionalTone === 'warm' ? '따뜻함' :
                             personalityResults.personalizedSettings.emotionalTone === 'professional' ? '전문적' : '중성적'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-3">
                        {t('mypage.aiSimulationInfo') || '100만명 AI 시뮬레이션으로 검증된 5문항 진단으로'} 
                        <span className="font-semibold text-black"> 84.96% {t('mypage.accuracy') || '정확도'}</span>{t('mypage.personalizedGuideProvided') || '의 개인화 가이드를 제공합니다'}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <div className="flex items-center mr-4">
                          <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                          {t('mypage.timeRequired') || '소요시간'} 3{t('common.minutes') || '분'}
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                          20{t('mypage.countriesVerification') || '개국 문화적 공정성 검증'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="ml-6">
                  <Button
                    onClick={() => setShowPersonalityModal(true)}
                    variant="default"
                    size="lg"
                  >
                    {personalityResults ? t('mypage.retakeDiagnosis') || '다시 진단하기' : t('mypage.startDiagnosis') || '진단 시작하기'}
                  </Button>
                </div>
              </Flex>
              
              {personalityResults && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 flex items-center">
                    <Sparkles className="w-4 h-4 text-gray-400 mr-2" />
                    {t('mypage.personalizedGuideActive') || '이제 모든 가이드가 당신의 성격에 맞게 자동으로 개인화됩니다!'}
                  </p>
                </div>
              )}
            </Card>
          </Stack>
        );

      case 'guides':
        return (
          <div>
            {/* 검색 및 필터 */}
            <div className="mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={t('search.placeholder') || '가이드 검색...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
              >
                <option value="date">{t('common.sortLatest') || '최신순'}</option>
                <option value="name">{t('common.sortName') || '이름순'}</option>
                <option value="chapters">{t('common.sortChapters') || '챕터순'}</option>
              </select>
              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
              >
                <option value="all">{t('common.allLanguages') || '모든 언어'}</option>
                <option value="ko">{t('languages.ko') || '한국어'}</option>
                <option value="en">{t('languages.en') || 'English'}</option>
                <option value="ja">{t('languages.ja') || '日本語'}</option>
                <option value="zh">{t('languages.zh') || '中文'}</option>
                <option value="es">{t('languages.es') || 'Español'}</option>
              </select>
            </div>

            {/* 가이드 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide) => (
                <div key={guide.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{guide.title}</h3>
                      <button
                        onClick={() => handleToggleFavorite(guide.id)}
                        className={`p-1 rounded-full transition-colors ${
                          guide.isFavorite 
                            ? 'text-black hover:text-gray-600' 
                            : 'text-gray-400 hover:text-black'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${guide.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {guide.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {guide.chapters}{t('common.chapters') || '개 챕터'} • {formatDuration(guide.chapters * 8)}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(guide.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        {guide.language.toUpperCase()}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewGuide(guide)}
                        className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center justify-center"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t('buttons.viewDetails') || '보기'}
                      </button>
                      <button
                        onClick={() => handleDeleteGuide(guide.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredGuides.length === 0 && (
              <div className="text-center py-12">
                <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-black mb-2">{t('guide.noGuides') || '가이드가 없습니다'}</h3>
                <p className="text-gray-500 mb-4">{t('guide.createNewGuide') || '새로운 가이드를 생성해보세요!'}</p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {t('buttons.createGuide') || '가이드 생성하기'}
                </button>
              </div>
            )}
          </div>
        );

      case 'favorites':
        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteGuides.map((guide) => (
                <div key={guide.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-black line-clamp-2">{guide.title}</h3>
                      <Star className="h-5 w-5 text-black fill-current" />
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {guide.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {guide.chapters}{t('common.chapters') || '개 챕터'}
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewGuide(guide)}
                      className="w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center justify-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t('buttons.viewDetails') || '보기'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {favoriteGuides.length === 0 && (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-black mb-2">{t('mypage.noFavoriteGuides') || '즐겨찾기한 가이드가 없습니다'}</h3>
                <p className="text-gray-500">{t('mypage.addFavoriteGuides') || '마음에 드는 가이드를 즐겨찾기로 추가해보세요!'}</p>
              </div>
            )}
          </div>
        );

      case 'files':
        return (
          <div>
            {/* 파일 업로드 영역 */}
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">{t('mypage.createGuideFromFile') || '파일에서 가이드 생성'}</h3>
              <p className="text-gray-500 mb-4">{t('mypage.uploadFileDescription') || 'PDF, Word, 텍스트 파일을 업로드하여 가이드를 생성할 수 있습니다'}</p>
              <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                {t('buttons.selectFile') || '파일 선택'}
              </button>
              <p className="text-xs text-gray-400 mt-2">{t('mypage.supportedFormats') || '지원 형식: PDF, DOCX, TXT (최대 10MB)'}</p>
            </div>

            {/* 파일 가이드 목록 */}
            <div className="space-y-4">
              {fileGuides.map((file) => (
                <div key={file.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FileText className="h-6 w-6 text-black" />
                      </div>
                      <div>
                        <h3 className="font-medium text-black">{file.fileName}</h3>
                        <p className="text-sm text-gray-500">
                          {(file.fileSize / 1024 / 1024).toFixed(2)}MB • {formatDate(file.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        file.status === 'ready' ? 'bg-gray-100 text-black' :
                        file.status === 'processing' ? 'bg-gray-100 text-gray-600' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {file.status === 'ready' ? t('common.completed') || '완료' :
                         file.status === 'processing' ? t('common.processing') || '처리중' : t('common.error') || '오류'}
                      </span>
                      {file.status === 'ready' && (
                        <button className="p-2 text-black hover:bg-gray-50 rounded-lg">
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {fileGuides.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-black mb-2">{t('mypage.noUploadedFiles') || '업로드된 파일이 없습니다'}</h3>
                <p className="text-gray-500">{t('mypage.uploadFirstFile') || '첫 번째 파일을 업로드해보세요!'}</p>
              </div>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="max-w-2xl">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-black">{t('profile.account') || '계정 설정'}</h3>
                <p className="text-sm text-gray-500">{t('profile.manageProfile') || '프로필 정보를 관리하세요'}</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* 프로필 정보 */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">{t('profile.name') || '이름'}</label>
                  <input
                    type="text"
                    value={session?.user?.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder={t('profile.enterName') || '이름을 입력하세요'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">{t('profile.email') || '이메일'}</label>
                  <input
                    type="email"
                    value={session?.user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">{t('profile.emailNotEditable') || '이메일은 변경할 수 없습니다'}</p>
                </div>

                {/* 언어 설정 */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">{t('profile.language') || '기본 언어'}</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black">
                    <option value="ko">{t('languages.ko') || '한국어'}</option>
                    <option value="en">{t('languages.en') || 'English'}</option>
                    <option value="ja">{t('languages.ja') || '日本語'}</option>
                    <option value="zh">{t('languages.zh') || '中文'}</option>
                    <option value="es">{t('languages.es') || 'Español'}</option>
                  </select>
                </div>

                {/* 알림 설정 */}
                <div>
                  <label className="block text-sm font-medium text-black mb-3">{t('profile.notifications') || '알림 설정'}</label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" defaultChecked />
                      <span className="ml-2 text-sm text-gray-600">{t('profile.newFeatureNotifications') || '새로운 기능 알림'}</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" defaultChecked />
                      <span className="ml-2 text-sm text-gray-600">{t('profile.guideCompleteNotifications') || '가이드 생성 완료 알림'}</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" />
                      <span className="ml-2 text-sm text-gray-600">{t('profile.marketingEmails') || '마케팅 이메일 수신'}</span>
                    </label>
                  </div>
                </div>

                {/* 데이터 관리 */}
                <div className="border-t border-gray-200 pt-6">
                  <label className="block text-sm font-medium text-black mb-3">{t('profile.dataManagement') || '데이터 관리'}</label>
                  <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-black">{t('profile.exportData') || '데이터 내보내기'}</div>
                          <div className="text-sm text-gray-500">{t('profile.exportDescription') || '모든 가이드 데이터를 JSON 형태로 다운로드'}</div>
                        </div>
                        <Download className="h-5 w-5 text-gray-400" />
                      </div>
                    </button>
                    
                    <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{t('profile.deleteAllData') || '모든 데이터 삭제'}</div>
                          <div className="text-sm text-gray-400">{t('profile.deleteDescription') || '저장된 모든 가이드와 설정을 삭제합니다'}</div>
                        </div>
                        <Trash className="h-5 w-5" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* 저장 버튼 */}
                <div className="flex space-x-3 pt-6">
                  <button className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium">
                    {t('buttons.save') || '변경사항 저장'}
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-50 transition-colors">
                    {t('buttons.cancel') || '취소'}
                  </button>
                </div>
              </div>
            </div>

            {/* 계정 관리 */}
            <div className="bg-white rounded-lg border border-gray-200 mt-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-black">{t('profile.account') || '계정 관리'}</h3>
              </div>
              
              <div className="p-6">
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors font-medium flex items-center justify-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('auth.logout') || '로그아웃'}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto"
             style={{
               padding: '0 var(--space-4)',
               paddingLeft: 'clamp(var(--space-4), 4vw, var(--space-6))',
               paddingRight: 'clamp(var(--space-4), 4vw, var(--space-8))'
             }}>
          <div className="flex items-center justify-between"
               style={{ height: 'var(--space-16)' }}>
            <div className="flex items-center"
                 style={{ gap: 'var(--space-4)' }}>
              <button
                onClick={() => router.push('/')}
                className="btn-base text-gray-500 hover:text-black bg-transparent hover:bg-gray-50 transition-colors"
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                ← {t('buttons.goBack') || '홈으로'}
              </button>
              <h1 className="text-fluid-xl font-semibold text-black">{t('mypage.title') || '마이페이지'}</h1>
            </div>
            
            <div className="flex items-center"
                 style={{ gap: 'var(--space-4)' }}>
              <div className="flex items-center"
                   style={{ gap: 'var(--space-2)' }}>
                <div className="bg-black rounded-full flex items-center justify-center touch-target"
                     style={{
                       width: 'var(--space-8)',
                       height: 'var(--space-8)'
                     }}>
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-fluid-sm font-medium text-black">
                  {session?.user?.name || t('profile.user') || '사용자'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto"
           style={{
             padding: 'var(--space-8) var(--space-4)',
             paddingLeft: 'clamp(var(--space-4), 4vw, var(--space-6))',
             paddingRight: 'clamp(var(--space-4), 4vw, var(--space-8))'
           }}>
        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200"
             style={{ marginBottom: 'var(--space-8)' }}>
          <nav className="-mb-px flex"
               style={{ gap: 'var(--space-8)' }}>
            {[
              { id: 'overview', label: t('mypage.overview') || '개요', icon: TrendingUp },
              { id: 'guides', label: t('mypage.guides') || '내 가이드', icon: Folder },
              { id: 'favorites', label: t('mypage.favoriteGuides') || '즐겨찾기', icon: Heart },
              { id: 'files', label: t('mypage.fileGuides') || '파일 가이드', icon: Upload },
              { id: 'settings', label: t('mypage.settings') || '설정', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={`btn-base border-b-2 font-medium text-fluid-sm flex items-center bg-transparent transition-colors ${
                  activeTab === id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
                }`}
                style={{
                  padding: 'var(--space-2) var(--space-1)',
                  gap: 'var(--space-2)'
                }}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <span className="ml-2 text-gray-500">{t('common.loading') || '로딩 중...'}</span>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>

      {/* 개인화 진단 모달 */}
      <PersonalityDiagnosisModal
        isOpen={showPersonalityModal}
        onClose={() => setShowPersonalityModal(false)}
        onComplete={handlePersonalityComplete}
      />
    </div>
  );
}