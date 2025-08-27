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

// 타입 정의
interface LocalGuideEntry {
  id: string;
  title: string;
  location: string;
  language: string;
  createdAt: string;
  lastAccessed?: string;
  chapters: number;
  duration: number;
  isFavorite: boolean;
}

interface UserStats {
  totalGuides: number;
  totalChapters: number;
  totalDuration: number;
  languagesUsed: string[];
}

type TabType = 'history' | 'favorites' | 'offline' | 'settings';

// 로컬 가이드 데이터 가져오기
const getAllLocalGuides = (): LocalGuideEntry[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const keys = Object.keys(localStorage);
    const guideKeys = keys.filter(key => 
      key.startsWith('guide_') || key.startsWith('location_')
    );
    
    const guides = guideKeys.map(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        const metadata = data.metadata || {};
        const overview = data.overview || {};
        const realTimeGuide = data.realTimeGuide || {};
        
        return {
          id: key,
          title: overview.title || metadata.title || realTimeGuide.title || data.title || '제목 없음',
          location: overview.location || metadata.location || realTimeGuide.location || data.location || '위치 없음',
          language: overview.language || metadata.language || realTimeGuide.language || data.language || 'ko',
          createdAt: metadata.createdAt || data.createdAt || new Date().toISOString(),
          lastAccessed: localStorage.getItem(`${key}_lastAccessed`) || undefined,
          chapters: realTimeGuide.chapters?.length || data.chapters?.length || 0,
          duration: realTimeGuide.estimatedDuration || data.estimatedDuration || 0,
          isFavorite: localStorage.getItem(`${key}_favorite`) === 'true'
        };
      } catch {
        return null;
      }
    }).filter(Boolean) as LocalGuideEntry[];
    
    return guides;
  } catch {
    return [];
  }
};

// 사용자 통계 계산
const calculateUserStats = (guides: LocalGuideEntry[]): UserStats => {
  const languagesUsed = [...new Set(guides.map(g => g.language))];
  const totalChapters = guides.reduce((sum, g) => sum + g.chapters, 0);
  const totalDuration = guides.reduce((sum, g) => sum + g.duration, 0);

  return {
    totalGuides: guides.length,
    totalChapters,
    totalDuration,
    languagesUsed
  };
};

export default function MyPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { currentLanguage, setLanguage, t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [localGuides, setLocalGuides] = useState<LocalGuideEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(true);

  // 인증 체크
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    setIsLoading(false);
  }, [session, status, router]);

  // 로컬 가이드 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const guides = getAllLocalGuides();
      setLocalGuides(guides);
    }
  }, []);

  // 사용자 통계
  const userStats = calculateUserStats(localGuides);

  // 필터링 및 정렬된 가이드
  const filteredGuides = localGuides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = !languageFilter || guide.language === languageFilter;
    return matchesSearch && matchesLanguage;
  }).sort((a, b) => {
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

  // 즐겨찾기 토글
  const toggleFavorite = (guideId: string) => {
    const isFavorite = localStorage.getItem(`${guideId}_favorite`) === 'true';
    localStorage.setItem(`${guideId}_favorite`, (!isFavorite).toString());
    
    const updatedGuides = getAllLocalGuides();
    setLocalGuides(updatedGuides);
  };

  // 마지막 접근 시간 업데이트
  const updateLastAccessed = (guideId: string) => {
    localStorage.setItem(`${guideId}_lastAccessed`, new Date().toISOString());
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // 시간 포맷팅
  const formatDuration = (minutes: number) => {
    const minutesResult = t('common.minutes');
    const minutesText = Array.isArray(minutesResult) ? (minutesResult[0] || '분') : (minutesResult || '분');
    const hoursResult = t('common.hours');
    const hoursText = Array.isArray(hoursResult) ? (hoursResult[0] || '시간') : (hoursResult || '시간');
    
    if (minutes < 60) {
      return minutes + minutesText;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return hours + hoursText + " " + mins + minutesText;
    }
    return mins + minutesText;
  };

  // 히스토리 탭 렌더링
  const renderHistoryTab = () => (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-black dark:text-white transition-colors duration-300">
            {t('mypage.historyTitle') || '나의 가이드'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
            {t('mypage.historyDescription') || '조회했던 가이드들의 히스토리입니다'}
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
          {t('mypage.totalCount', { count: filteredGuides.length.toString() }) || ("총 " + filteredGuides.length + "개")} {t('mypage.guides') || '가이드'}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder={String(t('mypage.searchPlaceholder') || '가이드 검색...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors duration-300"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors duration-300"
          >
            <option value="">{t('mypage.allLanguages') || '모든 언어'}</option>
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
            <option value="es">Español</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors duration-300"
          >
            <option value="date">{t('mypage.sortByDate') || '날짜순'}</option>
            <option value="name">{t('mypage.sortByName') || '이름순'}</option>
            <option value="chapters">{t('mypage.sortByChapters') || '챕터순'}</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredGuides.map((guide) => (
          <div
            key={guide.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => {
              updateLastAccessed(guide.id);
              router.push("/guide/" + currentLanguage + "/" + encodeURIComponent(guide.location));
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-black dark:text-white mb-1 transition-colors duration-300">
                  {guide.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 transition-colors duration-300">
                  📍 {guide.location}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 transition-colors duration-300">
                  <span>🗓 {formatDate(guide.createdAt)}</span>
                  <span>📚 {guide.chapters} {t('mypage.chapters') || '개 챕터'}</span>
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
                  }}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
                >
                  <Star 
                    className={`h-4 w-4 ${guide.isFavorite ? "fill-current text-yellow-500" : ""}`} 
                  />
                </button>
                <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredGuides.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4 transition-colors duration-300" />
          <h3 className="text-lg font-medium text-black dark:text-white mb-2 transition-colors duration-300">
            {t('mypage.noHistoryTitle') || '가이드 히스토리가 없습니다'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">
            {t('mypage.noHistoryDescription') || '새로운 장소를 검색하여 가이드를 생성해보세요!'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-300"
          >
            {t('mypage.createGuideButton') || '가이드 생성하기'}
          </button>
        </div>
      )}
    </div>
  );

  // 즐겨찾기 탭 렌더링
  const renderFavoritesTab = () => {
    const favoriteGuides = filteredGuides.filter(guide => guide.isFavorite);
    
    return (
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-black dark:text-white transition-colors duration-300">
              {t('mypage.favoritesTitle') || '즐겨찾기 가이드'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
              {t('mypage.favoritesDescription') || '실시간 가이드에서 즐겨찾기한 가이드들입니다'}
            </p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
            {favoriteGuides.length}개 즐겨찾기
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favoriteGuides.map((guide) => (
            <div
              key={guide.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => {
                updateLastAccessed(guide.id);
                router.push("/guide/" + currentLanguage + "/" + encodeURIComponent(guide.location));
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-black dark:text-white mb-1 line-clamp-2 transition-colors duration-300">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 transition-colors duration-300">
                    📍 {guide.location}
                  </p>
                </div>
                <div className="ml-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 transition-colors duration-300">
                  <span>📚 {guide.chapters}개 챕터</span>
                  <span>🌐 {guide.language.toUpperCase()}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
              </div>
            </div>
          ))}
        </div>

        {favoriteGuides.length === 0 && (
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4 transition-colors duration-300" />
            <h3 className="text-lg font-medium text-black dark:text-white mb-2 transition-colors duration-300">
              {t('mypage.noFavoritesTitle') || '즐겨찾기한 가이드가 없습니다'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">
              {t('mypage.noFavoritesDescription') || '실시간 가이드를 보며 별표 버튼을 클릭하여 즐겨찾기를 추가해보세요!'}
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-300"
            >
              {t('mypage.createGuideButton') || '가이드 생성하기'}
            </button>
          </div>
        )}
      </div>
    );
  };

  // 설정 탭 렌더링
  const renderSettingsTab = () => (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
          {t('mypage.accountSettings') || '계정 설정'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('auth.email') || '이메일'}
            </label>
            <input
              type="email"
              value={session?.user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('auth.name') || '이름'}
            </label>
            <input
              type="text"
              value={session?.user?.name || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
          {t('mypage.languageSettings') || '언어 설정'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('mypage.defaultLanguage') || '기본 언어'}
            </label>
            <select
              value={currentLanguage}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-700 text-black dark:text-white"
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
              <option value="es">Español</option>
            </select>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('mypage.languageHint') || '가이드 생성 시 기본으로 사용할 언어를 선택하세요'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
          {t('mypage.usageStats') || '사용 통계'}
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-black dark:text-white">{userStats.totalGuides}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('mypage.totalGuides') || '총 가이드'}</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-black dark:text-white">{userStats.totalChapters}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('mypage.totalChapters') || '총 챕터'}</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-black dark:text-white">{userStats.languagesUsed.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('mypage.languagesUsed') || '사용 언어'}</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-black dark:text-white">{formatDuration(userStats.totalDuration)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('mypage.totalDuration') || '총 시간'}</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-black dark:text-white">{t('mypage.signOut') || '로그아웃'}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('mypage.signOutDescription') || '계정에서 안전하게 로그아웃합니다'}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t('auth.logout') || '로그아웃'}
          </button>
        </div>
      </div>
    </div>
  );

  // 탭 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'history':
        return renderHistoryTab();
      case 'favorites':
        return renderFavoritesTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-black dark:text-white transition-colors duration-300">
              마이페이지
            </h1>
          </div>
          
          <nav className="flex space-x-8">
            {[
              { id: 'history' as TabType, label: t('mypage.history') || '히스토리', icon: Clock },
              { id: 'favorites' as TabType, label: t('mypage.favorites') || '즐겨찾기', icon: Heart },
              { id: 'settings' as TabType, label: t('mypage.settings') || '설정', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 pb-4 border-b-2 transition-colors duration-300 ${
                  activeTab === id
                    ? 'border-black dark:border-white text-black dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
}