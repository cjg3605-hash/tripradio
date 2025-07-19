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
  ChevronRight
} from 'lucide-react';

// 타입 정의
interface GuideHistoryEntry {
  id: string;
  locationName: string;
  createdAt: string;
  language: string;
  tourDuration?: number;
  status?: 'completed' | 'in-progress' | 'saved';
}

interface FileGuideEntry {
  id: string;
  fileName: string;
  uploadedAt: string;
  fileSize: number;
  type: 'pdf' | 'text' | 'docx';
}

interface LocalGuideEntry {
  id: string;
  title: string;
  location: string;
  createdAt: string;
  chapters: number;
}

type TabType = 'overview' | 'guides' | 'settings';

// 로컬 가이드 조회 함수
const getAllLocalGuides = (): LocalGuideEntry[] => {
  try {
    const keys = Object.keys(localStorage);
    const guideKeys = keys.filter(key => key.startsWith('ai_guide_') || key.startsWith('guide-cache:'));
    
    return guideKeys.map(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        return {
          id: key,
          title: data.overview?.title || data.metadata?.originalLocationName || 'Unknown Guide',
          location: data.metadata?.originalLocationName || 'Unknown Location',
          createdAt: data.metadata?.generatedAt || new Date().toISOString(),
          chapters: data.realTimeGuide?.chapters?.length || 0
        };
      } catch {
        return null;
      }
    }).filter(Boolean) as LocalGuideEntry[];
  } catch {
    return [];
  }
};

// 안전한 localStorage 삭제 함수
const safeDeleteFromStorage = (id: string): void => {
  try {
    if (id.startsWith('guide-cache:') || id.startsWith('ai_guide_')) {
      localStorage.removeItem(id);
    } else {
      // guideHistory 관련 삭제는 직접 localStorage에서 처리
      const historyKey = 'guide_history';
      const existingHistory = localStorage.getItem(historyKey);
      if (existingHistory) {
        const parsed = JSON.parse(existingHistory);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((item: any) => item.id !== id);
          localStorage.setItem(historyKey, JSON.stringify(filtered));
        }
      }
    }
  } catch (error) {
    console.error('Storage deletion error:', error);
  }
};

export default function MyPage() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status || 'loading';
  const router = useRouter();
  const { t } = useLanguage(); // 번역 훅 추가
  
  const [historyEntries, setHistoryEntries] = useState<GuideHistoryEntry[]>([]);
  const [fileHistoryEntries, setFileHistoryEntries] = useState<FileGuideEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [offlineGuides, setOfflineGuides] = useState<any[]>([]);
  const [localGuides, setLocalGuides] = useState<LocalGuideEntry[]>([]);
  const [isAnimated, setIsAnimated] = useState(false);

  // 페이지 로드 애니메이션
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // 인증 체크
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  // 데이터 로딩
  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      try {
        // localStorage에서 직접 로드
        const historyKey = 'guide_history';
        const existingHistory = localStorage.getItem(historyKey);
        if (existingHistory) {
          const parsed = JSON.parse(existingHistory);
          if (Array.isArray(parsed)) {
            const sortedHistory = parsed.sort((a, b) => {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            setHistoryEntries(sortedHistory);
          }
        }
      } catch (error) {
        console.error('History loading error:', error);
        setHistoryEntries([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, [session]);

  useEffect(() => {
    const guides = JSON.parse(localStorage.getItem('myGuides') || '[]');
    setOfflineGuides(guides);
    setLocalGuides(getAllLocalGuides());
  }, [session]);

  const handleDeleteHistory = (id: string): void => {
    if (!confirm(t.mypage.clearAllHistory + '?')) return;

    try {
      safeDeleteFromStorage(id);
      setHistoryEntries(prev => prev.filter(entry => entry.id !== id));
      setLocalGuides(prev => prev.filter(guide => guide.id !== id));
    } catch (error) {
      console.error('삭제 중 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleClearAllHistory = (): void => {
    if (!confirm(t.mypage.clearAllHistory + '? 이 작업은 되돌릴 수 없습니다.')) return;

    try {
      // 모든 관련 localStorage 항목 삭제
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('ai_guide_') || key.startsWith('guide-cache:') || key === 'guide_history') {
          localStorage.removeItem(key);
        }
      });

      setHistoryEntries([]);
      setLocalGuides([]);
      setOfflineGuides([]);
      alert('모든 가이드 기록이 삭제되었습니다.');
    } catch (error) {
      console.error('전체 삭제 중 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return t.date.invalidDate;
    }
  };

  const totalGuides = historyEntries.length + localGuides.length;
  const completedGuides = historyEntries.filter(entry => entry.status === 'completed').length;
  const savedGuides = localGuides.length;

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 헤더 */}
        <div className={`
          mb-8 transform transition-all duration-700 ease-out delay-100
          ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{t.mypage.title}</h1>
          <p className="text-gray-600">{t.mypage.description}</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className={`
          mb-8 transform transition-all duration-700 ease-out delay-200
          ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          <div className="flex bg-white rounded-2xl p-2 shadow-sm">
            {([
              { id: 'overview' as const, label: t.profile.dashboard, icon: TrendingUp },
              { id: 'guides' as const, label: t.profile.guides, icon: Folder },
              { id: 'settings' as const, label: t.profile.settings, icon: Settings }
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl
                  transition-all duration-300 ease-out
                  ${activeTab === id 
                    ? 'bg-black text-white shadow-lg transform scale-[1.02]' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className={`
          transition-all duration-700 ease-out delay-300
          ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
        `}>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 통계 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-black">{totalGuides}</div>
                      <div className="text-sm text-gray-600 mt-1">{t.mypage.totalGuides}</div>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Folder className="w-6 h-6 text-black" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-black">{completedGuides}</div>
                      <div className="text-sm text-gray-600 mt-1">{t.mypage.completedTours}</div>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Play className="w-6 h-6 text-black" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-black">{savedGuides}</div>
                      <div className="text-sm text-gray-600 mt-1">{t.mypage.savedGuides}</div>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Download className="w-6 h-6 text-black" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 최근 가이드 */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">{t.mypage.recentGuides}</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {isLoading ? (
                    <div className="p-6 text-center text-gray-500">{t.common.loading}</div>
                  ) : historyEntries.slice(0, 5).length === 0 ? (
                    <div className="p-6 text-center text-gray-500">{t.mypage.noGuides}</div>
                  ) : (
                    historyEntries.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{entry.locationName}</h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(entry.createdAt)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{entry.language}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDeleteHistory(entry.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                            <div className="w-8 h-8 flex items-center justify-center text-gray-400">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guides' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">{t.mypage.savedGuides}</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {localGuides.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">{t.mypage.noGuides}</div>
                  ) : (
                    localGuides.map((guide) => (
                      <div key={guide.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{guide.title}</h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(guide.createdAt)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Eye className="w-3 h-3" />
                                <span>{guide.chapters} chapters</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDeleteHistory(guide.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                            <div className="w-8 h-8 flex items-center justify-center text-gray-400">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">{t.mypage.accountInfo}</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">{t.auth.email}</span>
                    <span className="font-medium text-gray-900">{session?.user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">{t.auth.name}</span>
                    <span className="font-medium text-gray-900">{session?.user?.name || '설정 안됨'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-600">{t.mypage.joinDate}</span>
                    <span className="font-medium text-gray-900">2024년 12월</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">{t.mypage.dataManagement}</h3>
                </div>
                <div className="p-6 space-y-4">
                  <button
                    onClick={handleClearAllHistory}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors duration-200"
                  >
                    <Trash className="w-4 h-4" />
                    <span className="font-medium">{t.mypage.clearAllHistory}</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">{t.profile.account}</h3>
                </div>
                <div className="p-6">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">{t.header.logout}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}