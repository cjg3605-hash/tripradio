'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';
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
  Heart
} from 'lucide-react';
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

type TabType = 'history' | 'favorites' | 'offline' | 'settings';

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
  
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [localGuides, setLocalGuides] = useState<LocalGuideEntry[]>([]);
  const [fileGuides, setFileGuides] = useState<FileGuideEntry[]>([]);
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
    router.push('/auth/signin');
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
    const confirmMessage = typeof t('common.confirmDelete') === 'string' ? String(t('common.confirmDelete')) : '이 가이드를 삭제하시겠습니까?';
    if (confirm(confirmMessage)) {
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
    router.push(`/guide/${currentLanguage}/${encodeURIComponent(guide.location)}`);
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
      return `${hours}${t('common.hours') || '시간'} ${mins}${t('common.minutes') || '분'}`;
    }
    return `${mins}${t('common.minutes') || '분'}`;
  };

  // 탭 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'history':
        return (
          <div className="max-w-4xl">
            {/* 히스토리 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-black">{t('mypage.historyTitle') || '나의 가이드'}</h2>
                <p className="text-gray-500 text-sm">{t('mypage.historyDescription') || '조회했던 가이드들의 히스토리입니다'}</p>
              </div>
              <div className="text-sm text-gray-500">
                {t('mypage.totalCount', { count: filteredGuides.length.toString() }) || `총 ${filteredGuides.length}개`} {t('mypage.guides') || '가이드'}
              </div>
            </div>

            {/* 검색 및 필터 */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={String(t('mypage.searchPlaceholder') || '가이드 검색...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">{t('mypage.allLanguages') || '모든 언어'}</option>
                <option value="ko">{t('languages.korean') || '한국어'}</option>
                <option value="en">{t('languages.english') || 'English'}</option>
                <option value="ja">{t('languages.japanese') || '日本語'}</option>
                <option value="zh">{t('languages.chinese') || '中文'}</option>
                <option value="es">{t('languages.spanish') || 'Español'}</option>
              </select>
            </div>

            {/* 가이드 목록 */}
            <div className="space-y-4">
              {filteredGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    updateLastAccessed(guide.id);
                    router.push(`/guide/${currentLanguage}/${encodeURIComponent(guide.location)}`);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-black mb-1">{guide.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">📍 {guide.location}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>🗓 {formatDate(guide.createdAt)}</span>
                        <span>📚 {guide.chapters}{t('mypage.chapters') || '개 챕터'}</span>
                        <span>🌐 {guide.language.toUpperCase()}</span>
                        {guide.lastAccessed && (
                          <span>👁 {formatDate(guide.lastAccessed)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(guide.id);
                          const updatedGuides = getAllLocalGuides();
                          setLocalGuides(updatedGuides);
                        }}
                        className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                      >
                        <Star 
                          className={`h-4 w-4 ${guide.isFavorite ? 'fill-current text-yellow-500' : ''}`} 
                        />
                      </button>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredGuides.length === 0 && (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-black mb-2">{t('mypage.noHistoryTitle') || '가이드 히스토리가 없습니다'}</h3>
                <p className="text-gray-500 mb-4">{t('mypage.noHistoryDescription') || '새로운 장소를 검색하여 가이드를 생성해보세요!'}</p>
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  {t('mypage.createGuideButton') || '가이드 생성하기'}
                </button>
              </div>
            )}
          </div>
        );


      case 'favorites': {
        const favoriteGuides = filteredGuides.filter(guide => guide.isFavorite);
        
        return (
          <div className="max-w-4xl">
            {/* 즐겨찾기 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-black">{t('mypage.favoritesTitle') || '즐겨찾기 가이드'}</h2>
                <p className="text-gray-500 text-sm">{t('mypage.favoritesDescription') || '실시간 가이드에서 즐겨찾기한 가이드들입니다'}</p>
              </div>
              <div className="text-sm text-gray-500">
                {t('mypage.favoritesCount', { count: favoriteGuides.length.toString() }) || `${favoriteGuides.length}개`} {t('mypage.favoritesShort') || '즐겨찾기'}
              </div>
            </div>

            {/* 즐겨찾기 가이드 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    updateLastAccessed(guide.id);
                    router.push(`/guide/${currentLanguage}/${encodeURIComponent(guide.location)}`);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-black mb-1 line-clamp-2">{guide.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">📍 {guide.location}</p>
                    </div>
                    <div className="ml-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>📚 {guide.chapters}개 챕터</span>
                      <span>🌐 {guide.language.toUpperCase()}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>

            {favoriteGuides.length === 0 && (
              <div className="text-center py-12">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-black mb-2">{t('mypage.noFavoritesTitle') || '즐겨찾기한 가이드가 없습니다'}</h3>
                <p className="text-gray-500 mb-4">{t('mypage.noFavoritesDescription') || '실시간 가이드를 보며 별표 버튼을 클릭하여 즐겨찾기를 추가해보세요!'}</p>
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  {t('mypage.createGuideButton') || '가이드 생성하기'}
                </button>
              </div>
            )}
          </div>
        );
      }

      case 'offline': {
        // 오프라인 다운로드된 가이드들 (향후 구현을 위한 mock 데이터)
        const offlineGuides: LocalGuideEntry[] = [];
        
        return (
          <div className="max-w-4xl">
            {/* 오프라인 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-black">{t('mypage.offlineTitle') || '오프라인 다운로드'}</h2>
                <p className="text-gray-500 text-sm">{t('mypage.offlineDescription') || '오프라인에서도 이용할 수 있도록 다운로드한 가이드들입니다'}</p>
              </div>
              <div className="text-sm text-gray-500">
                {t('mypage.downloadsCount', { count: offlineGuides.length.toString() }) || `${offlineGuides.length}개`} {t('common.downloads') || '다운로드'}
              </div>
            </div>

            {/* 오프라인 가이드 목록 */}
            <div className="space-y-4">
              {offlineGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-black">{guide.title}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {t('mypage.offlineAvailable') || '오프라인 사용 가능'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">📍 {guide.location}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>📚 {guide.chapters}{t('mypage.chapters') || '개 챕터'}</span>
                        <span>🌐 {guide.language.toUpperCase()}</span>
                        <span>💾 {t('mypage.downloaded') || '다운로드됨'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title={String(t('mypage.offlinePlay') || '오프라인 재생')}
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={String(t('mypage.deleteOffline') || '오프라인 파일 삭제')}
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {offlineGuides.length === 0 && (
              <div className="text-center py-12">
                <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-black mb-2">{t('mypage.noOfflineTitle') || '오프라인 다운로드된 가이드가 없습니다'}</h3>
                <p className="text-gray-500 mb-4">
                  {t('mypage.noOfflineDescription') || '실시간 가이드를 보며 다운로드 버튼을 클릭하여 오프라인에서도 이용할 수 있도록 저장해보세요!'}
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Download className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium text-blue-900 mb-1">{t('mypage.offlineInfoTitle') || '오프라인 기능 안내'}</h4>
                      <p className="text-sm text-blue-700">
                        • {t('mypage.offlineFeature1') || '인터넷 연결 없이도 가이드 이용 가능'}<br />
                        • {t('mypage.offlineFeature2') || '오디오 파일까지 함께 저장'}<br />
                        • {t('mypage.offlineFeature3') || '모바일 저장 공간에 안전하게 보관'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'settings':
        return (
          <div className="max-w-4xl space-y-6">

            {/* 계정 설정 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-black mb-4">{t('mypage.accountSettings') || '계정 설정'}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">{t('mypage.nameLabel') || '이름'}</label>
                  <input
                    type="text"
                    value={session?.user?.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder={String(t('mypage.namePlaceholder') || '이름을 입력하세요')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">{t('mypage.emailLabel') || '이메일'}</label>
                  <input
                    type="email"
                    value={session?.user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">{t('mypage.emailNotEditableNote') || '이메일은 변경할 수 없습니다'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">{t('mypage.defaultLanguage') || '기본 언어'}</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent">
                    <option value="ko">{t('languages.korean') || '한국어'}</option>
                    <option value="en">{t('languages.english') || 'English'}</option>
                    <option value="ja">{t('languages.japanese') || '日本語'}</option>
                    <option value="zh">{t('languages.chinese') || '中文'}</option>
                    <option value="es">{t('languages.spanish') || 'Español'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 알림 설정 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-black mb-4">{t('mypage.notificationSettings') || '알림 설정'}</h3>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" defaultChecked />
                  <span className="ml-3 text-sm text-gray-700">{t('mypage.newFeatureNotifications') || '새로운 기능 알림'}</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" defaultChecked />
                  <span className="ml-3 text-sm text-gray-700">{t('mypage.guideCompleteNotifications') || '가이드 생성 완료 알림'}</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" />
                  <span className="ml-3 text-sm text-gray-700">{t('mypage.marketingEmails') || '마케팅 이메일 수신'}</span>
                </label>
              </div>
            </div>

            {/* 데이터 관리 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-black mb-4">{t('mypage.dataManagement') || '데이터 관리'}</h3>
              
              <div className="space-y-3">
                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-black mb-1">{t('mypage.exportData') || '데이터 내보내기'}</div>
                      <div className="text-sm text-gray-500">{t('mypage.exportDescription') || '모든 가이드 데이터를 JSON 형태로 다운로드'}</div>
                    </div>
                    <Download className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
                
                <button className="w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium mb-1">{t('mypage.deleteAllData') || '모든 데이터 삭제'}</div>
                      <div className="text-sm text-red-400">{t('mypage.deleteAllDescription') || '저장된 모든 가이드와 설정을 삭제합니다'}</div>
                    </div>
                    <Trash className="h-5 w-5" />
                  </div>
                </button>
              </div>
            </div>

            {/* 로그아웃 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <button
                onClick={async () => {
                  try {
                    console.log('🔥 강화된 로그아웃 프로세스 시작...');
                    
                    // 1. 클라이언트 측 정리 (localStorage, sessionStorage)
                    console.log('🧹 클라이언트 데이터 정리 중...');
                    localStorage.clear();
                    sessionStorage.clear();
                    
                    // 2. 서버 측 강제 로그아웃 API 호출
                    try {
                      console.log('🔥 서버 강제 로그아웃 호출 중...');
                      await fetch('/api/auth/force-logout', {
                        method: 'POST',
                        credentials: 'include'
                      });
                      console.log('✅ 서버 강제 로그아웃 완료');
                    } catch (apiError) {
                      console.warn('⚠️ 서버 강제 로그아웃 실패:', apiError);
                    }
                    
                    // 3. NextAuth signOut 호출 (자동 리다이렉트 활성화)
                    console.log('🔄 NextAuth signOut 호출 중...');
                    await signOut({ 
                      callbackUrl: '/',
                      redirect: true  // 자동 리다이렉트 활성화
                    });
                    
                  } catch (error) {
                    console.error('❌ 로그아웃 중 오류 발생:', error);
                    // 에러 발생시에도 기본 정리 및 리다이렉트
                    try {
                      await fetch('/api/auth/force-logout', { method: 'POST', credentials: 'include' });
                    } catch (cleanupError) {
                      console.error('정리 프로세스 실패:', cleanupError);
                    }
                    // 강제 리다이렉트 (NextAuth 실패시 백업)
                    window.location.href = '/';
                  }
                }}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg hover:bg-black transition-colors font-medium flex items-center justify-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('auth.logout') || '로그아웃'}
              </button>
            </div>

            {/* 계정 관리 */}
            <div className="bg-white rounded-lg border border-gray-200 mt-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-black">{t('profile.account') || '계정 관리'}</h3>
              </div>
              
              <div className="p-6">
                <button
                  onClick={async () => {
                    console.log('🚀 마이페이지 로그아웃 시작...');
                    try {
                      // 1. 클라이언트 정리 (쿠키, 스토리지, 간단한 캐시)
                      const { performCompleteLogout, simpleCacheInvalidation } = await import('@/lib/auth-utils');
                      await performCompleteLogout();
                      await simpleCacheInvalidation();
                      
                      // 2. 서버 사이드 강제 로그아웃 API 호출
                      try {
                        console.log('🔥 서버 강제 로그아웃 호출 중...');
                        await fetch('/api/auth/force-logout', {
                          method: 'POST',
                          credentials: 'include'
                        });
                        console.log('✅ 서버 강제 로그아웃 완료');
                      } catch (apiError) {
                        console.warn('⚠️ 서버 강제 로그아웃 실패:', apiError);
                      }
                      
                      // 3. NextAuth signOut 호출 (자동 리다이렉트 활성화)
                      console.log('🔄 NextAuth signOut 호출 중...');
                      await signOut({ 
                        callbackUrl: '/',
                        redirect: true  // 자동 리다이렉트 활성화
                      });
                      
                      // NextAuth가 자동으로 홈페이지로 리다이렉트하므로 추가 로직 불필요
                      
                    } catch (error) {
                      console.error('❌ 로그아웃 중 오류 발생:', error);
                      
                      // 에러 발생시에도 기본 정리 및 리다이렉트
                      try {
                        await fetch('/api/auth/force-logout', { method: 'POST', credentials: 'include' });
                      } catch (cleanupError) {
                        console.error('정리 프로세스 실패:', cleanupError);
                      }
                      
                      // 강제 리다이렉트 (NextAuth 실패시 백업)
                      window.location.href = '/';
                    }
                  }}
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
              <h1 className="text-lg md:text-xl font-semibold text-black whitespace-nowrap">{t('mypage.title') || '마이페이지'}</h1>
            </div>
            
            <div className="flex items-center"
                 style={{ gap: 'var(--space-4)' }}>
              {/* 관리자 대시보드 버튼 */}
              {/* @ts-ignore - NextAuth 타입 확장 */}
              {session?.user?.isAdmin && (
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="px-3 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  관리자 대시보드
                </button>
              )}
              
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
                  {/* @ts-ignore - NextAuth 타입 확장 */}
                  {session?.user?.isAdmin && (
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      관리자
                    </span>
                  )}
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
        <div className="border-b border-gray-200 mb-8">
          <div className="overflow-x-auto scrollbar-hide">
            <nav className="-mb-px flex gap-2 md:gap-8 min-w-max pb-px">
              {[
                { 
                  id: 'history', 
                  label: t('mypage.history') || '나의 가이드', 
                  shortLabel: t('mypage.historyShort') || '가이드',
                  icon: Folder 
                },
                { 
                  id: 'favorites', 
                  label: t('mypage.favoriteGuides') || '즐겨찾기 가이드', 
                  shortLabel: t('mypage.favoritesShort') || '즐겨찾기',
                  icon: Heart 
                },
                { 
                  id: 'offline', 
                  label: t('mypage.offline') || '오프라인 다운로드', 
                  shortLabel: t('mypage.offlineShort') || '오프라인',
                  icon: Download 
                },
                { 
                  id: 'settings', 
                  label: t('mypage.settings') || '세팅', 
                  shortLabel: t('mypage.settingsShort') || '세팅',
                  icon: Settings 
                }
              ].map(({ id, label, shortLabel, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as TabType)}
                  className={`btn-base border-b-2 font-medium text-sm md:text-base flex items-center bg-transparent transition-colors min-h-[48px] px-3 py-2 md:px-4 md:py-3 flex-shrink-0 ${
                    activeTab === id
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 md:h-4 md:w-4 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    <span className="hidden sm:inline">{label}</span>
                    <span className="inline sm:hidden">{shortLabel}</span>
                  </span>
                </button>
              ))}
            </nav>
          </div>
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

    </div>
  );
}