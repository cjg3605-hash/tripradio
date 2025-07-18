'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Settings, 
  TrendingUp, 
  Folder, 
  LogOut,
  MapPin,
  Calendar,
  Eye,
  CheckCircle,
  Trash,
  ChevronRight,
  Star,
  Loader
} from 'lucide-react';

interface FileGuideEntry {
  id: string;
  locationName: string;
  guideData: any;
  userProfile?: any;
  createdAt: string;
  expiresAt: string;
  viewedPages: string[];
  completed: boolean;
}

interface GuideHistoryEntry {
  id: string;
  locationName: string;
  guideData: any;
  userProfile?: any;
  createdAt: string;
  viewedPages: string[];
  completed: boolean;
}

interface LocalGuideEntry {
  key: string;
  locationName: string;
  createdAt: string;
  data: any;
}

type TabType = 'overview' | 'guides' | 'settings';

// localStorage의 guide-cache:* 및 ai_guide_* 기반 가이드 목록 추출 함수
const getAllLocalGuides = (): LocalGuideEntry[] => {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  const guides: LocalGuideEntry[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (key.startsWith('guide-cache:') || key.startsWith('ai_guide_')) {
      try {
        const value = localStorage.getItem(key);
        if (!value) continue;
        const parsed = JSON.parse(value);
        if (parsed && (parsed.content?.realTimeGuide || parsed.content || parsed.chapters)) {
          guides.push({
            key,
            locationName: parsed.locationName || parsed.content?.overview?.title || parsed.content?.locationName || parsed.metadata?.originalLocationName || '알 수 없음',
            createdAt: parsed.createdAt || parsed.timestamp || parsed.content?.createdAt || new Date().toISOString(),
            data: parsed
          });
        }
      } catch (e) {
        // 파싱 실패 무시
      }
    }
  }
  return guides.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
  const { data: session, status } = useSession();
  const router = useRouter();
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
    if (!confirm('정말 이 가이드를 삭제하시겠습니까?')) return;
    try {
      // 모든 상태에서 제거
      setHistoryEntries(prev => prev.filter(h => h.id !== id));
      setOfflineGuides(prev => prev.filter(g => g.id !== id));
      setLocalGuides(prev => prev.filter(g => g.key !== id));
      
      // localStorage에서 삭제
      safeDeleteFromStorage(id);
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleClearAllHistory = (): void => {
    if (!confirm('모든 가이드 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    try {
      // 상태 초기화
      setHistoryEntries([]);
      setOfflineGuides([]);
      setLocalGuides([]);
      
      // localStorage 완전 정리
      localStorage.removeItem('myGuides');
      localStorage.removeItem('guide_history');
      
      // guide-cache:* 및 ai_guide_* 키들도 삭제
      const keysToDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('guide-cache:') || key.startsWith('ai_guide_'))) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => localStorage.removeItem(key));
      
      alert('모든 기록이 삭제되었습니다.');
    } catch (error) {
      console.error('Clear all error:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = async (): Promise<void> => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await signOut({ callbackUrl: '/' });
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const goToGuide = (locationName: string): void => {
    const encodedLocation = encodeURIComponent(locationName);
    router.push(`/guide/${encodedLocation}?name=${encodeURIComponent(locationName)}`);
  };

  const getProgressPercentage = (viewedPages: string[]): number => {
    const totalPages = 3; // overview, route, realtime
    return Math.round((viewedPages.length / totalPages) * 100);
  };

  // 통계 계산
  const totalGuides = historyEntries.length + offlineGuides.length + localGuides.length;
  const completedGuides = historyEntries.filter(h => h.completed).length + 
                         offlineGuides.filter(g => g.completed).length +
                         localGuides.filter(g => g.data?.completed).length;
  const completionRate = totalGuides > 0 ? Math.round((completedGuides / totalGuides) * 100) : 0;

  // 모든 가이드를 하나의 배열로 통합
  const allGuides = [
    ...historyEntries.map(h => ({
      ...h,
      type: 'history' as const,
      progress: h.viewedPages ? getProgressPercentage(h.viewedPages) : 0
    })),
    ...offlineGuides.map(g => ({
      ...g,
      type: 'offline' as const,
      progress: g.viewedPages ? getProgressPercentage(g.viewedPages) : 0
    })),
    ...localGuides.map(g => ({
      id: g.key,
      locationName: g.locationName,
      createdAt: g.createdAt,
      type: 'local' as const,
      completed: g.data?.completed || false,
      progress: g.data?.viewedPages ? getProgressPercentage(g.data.viewedPages) : 0,
      viewedPages: g.data?.viewedPages || []
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="w-6 h-6 animate-spin text-black" />
          <span className="text-gray-600 font-medium">로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className={`
        bg-white border-b border-gray-100 transition-all duration-700 ease-out
        ${isAnimated ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}
      `}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg">
                {session.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt="프로필" 
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {session.user?.name || '여행자'}님
                </h1>
                <p className="text-gray-500 text-sm">{session.user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">로그아웃</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 탭 네비게이션 */}
        <div className={`
          mb-8 transition-all duration-700 ease-out delay-200
          ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          <div className="flex bg-white rounded-2xl p-2 shadow-sm">
            {([
              { id: 'overview' as const, label: '대시보드', icon: TrendingUp },
              { id: 'guides' as const, label: '나의 가이드', icon: Folder },
              { id: 'settings' as const, label: '설정', icon: Settings }
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
                      <div className="text-sm text-gray-600 mt-1">생성한 가이드</div>
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
                      <div className="text-sm text-gray-600 mt-1">완료한 투어</div>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-black" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-black">{completionRate}%</div>
                      <div className="text-sm text-gray-600 mt-1">완주율</div>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-black" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 최근 가이드 */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">최근 가이드</h3>
                    <button
                      onClick={() => setActiveTab('guides')}
                      className="text-black hover:text-gray-700 text-sm font-medium flex items-center space-x-1"
                    >
                      <span>전체보기</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {allGuides.slice(0, 5).map((guide, index) => (
                    <div 
                      key={guide.id || `guide-${index}`}
                      className="p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                      onClick={() => goToGuide(guide.locationName)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{guide.locationName}</div>
                            <div className="text-sm text-gray-500">{formatDate(guide.createdAt)}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {guide.completed ? (
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-black" />
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-black transition-all duration-500"
                                  style={{ width: `${guide.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">{guide.progress}%</span>
                            </div>
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {allGuides.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      아직 생성한 가이드가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guides' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">나의 가이드 ({totalGuides})</h3>
                </div>
                {isLoading ? (
                  <div className="p-8 text-center">
                    <Loader className="w-6 h-6 animate-spin text-black mx-auto mb-3" />
                    <p className="text-gray-600">가이드를 불러오는 중...</p>
                  </div>
                ) : totalGuides === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Folder className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">아직 생성한 가이드가 없습니다</h4>
                    <p className="text-gray-600 mb-6">새로운 여행지의 가이드를 생성해보세요</p>
                    <button
                      onClick={() => router.push('/')}
                      className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                    >
                      가이드 생성하기
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {allGuides.map((guide, index) => (
                      <div 
                        key={guide.id || `guide-${index}`}
                        className="p-4 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div 
                            className="flex items-center space-x-4 cursor-pointer flex-1"
                            onClick={() => goToGuide(guide.locationName)}
                          >
                            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                              <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{guide.locationName}</div>
                              <div className="text-sm text-gray-500 flex items-center space-x-3 mt-1">
                                <span className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatDate(guide.createdAt)}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Eye className="w-3 h-3" />
                                  <span>진행률 {guide.progress}%</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {guide.completed && (
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-black" />
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteHistory(guide.id || `guide-${index}`);
                              }}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                            <div className="w-8 h-8 flex items-center justify-center text-gray-400">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">계정 정보</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">이메일</span>
                    <span className="font-medium text-gray-900">{session.user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">이름</span>
                    <span className="font-medium text-gray-900">{session.user?.name || '설정 안됨'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-600">가입일</span>
                    <span className="font-medium text-gray-900">2024년 12월</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">데이터 관리</h3>
                </div>
                <div className="p-6 space-y-4">
                  <button
                    onClick={handleClearAllHistory}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors duration-200"
                  >
                    <Trash className="w-4 h-4" />
                    <span className="font-medium">모든 가이드 기록 삭제</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">계정</h3>
                </div>
                <div className="p-6">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">로그아웃</span>
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