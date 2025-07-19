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
  Eye
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
      safeDeleteFromStorage(id);
      setHistoryEntries(prev => prev.filter(entry => entry.id !== id));
      setLocalGuides(prev => prev.filter(guide => guide.id !== id));
    } catch (error) {
      console.error('삭제 중 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleClearAllHistory = (): void => {
    if (!confirm('모든 가이드 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

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
      return '날짜 정보 없음';
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">마이페이지</h1>
          <p className="text-gray-600">나만의 AI 가이드 기록을 확인하고 관리하세요</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className={`
          mb-8 transform transition-all duration-700 ease-out delay-200
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
                      <Play className="w-6 h-6 text-black" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-black">{savedGuides}</div>
                      <div className="text-sm text-gray-600 mt-1">저장된 가이드</div>
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
                  <h3 className="text-lg font-semibold text-gray-900">최근 가이드</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {isLoading ? (
                    <div className="p-6 text-center text-gray-500">로딩 중...</div>
                  ) : historyEntries.slice(0, 5).length === 0 ? (
                    <div className="p-6 text-center text-gray-500">생성된 가이드가 없습니다</div>
                  ) : (
                    historyEntries.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{entry.locationName}</div>
                              <div className="text-sm text-gray-500 flex items-center space-x-4">
                                <span>{formatDate(entry.createdAt)}</span>
                                {entry.tourDuration && (
                                  <span className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{entry.tourDuration}분</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => router.push(`/guide/${encodeURIComponent(entry.locationName)}/tour`)}
                              className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteHistory(entry.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
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
              {/* 가이드 목록 */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">전체 가이드</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {isLoading ? (
                    <div className="p-6 text-center text-gray-500">로딩 중...</div>
                  ) : [...historyEntries, ...localGuides].length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <div className="mb-4">
                        <Folder className="w-12 h-12 text-gray-300 mx-auto" />
                      </div>
                      <div className="text-gray-900 font-medium mb-2">생성된 가이드가 없습니다</div>
                      <div className="text-sm text-gray-500 mb-4">새로운 장소를 검색해서 나만의 가이드를 만들어보세요</div>
                      <button
                        onClick={() => router.push('/')}
                        className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors duration-200"
                      >
                        가이드 생성하기
                      </button>
                    </div>
                  ) : (
                    [...historyEntries, ...localGuides]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((entry) => (
                        <div key={entry.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {'locationName' in entry ? entry.locationName : entry.title}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center space-x-4">
                                  <span>{formatDate(entry.createdAt)}</span>
                                  {'tourDuration' in entry && entry.tourDuration && (
                                    <span className="flex items-center space-x-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{entry.tourDuration}분</span>
                                    </span>
                                  )}
                                  {'chapters' in entry && (
                                    <span className="flex items-center space-x-1">
                                      <Folder className="w-3 h-3" />
                                      <span>{entry.chapters}개 챕터</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  const locationName = 'locationName' in entry ? entry.locationName : entry.location;
                                  router.push(`/guide/${encodeURIComponent(locationName)}/tour`);
                                }}
                                className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors duration-200"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteHistory(entry.id)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
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
                  <h3 className="text-lg font-semibold text-gray-900">데이터 관리</h3>
                </div>
                <div className="p-6 space-y-4">
                  <button
                    onClick={handleClearAllHistory}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors duration-200">
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