'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  UserIcon, 
  SettingsIcon, 
  HistoryIcon, 
  HeartIcon, 
  LogOutIcon,
  ClockIcon,
  MapPinIcon,
  TrashIcon,
  ExternalLinkIcon,
  ChevronRightIcon,
  LoaderIcon,
  CheckCircleIcon,
  EyeIcon,
  FolderIcon,
  ArchiveXIcon
} from 'lucide-react';
import { guideHistory } from '@/lib/cache/localStorage';
import { fetchGuideHistoryFromSupabase } from '@/lib/supabaseGuideHistory';
import { useTranslation } from 'next-i18next';

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

// === 추가: localStorage의 guide-cache:* 및 ai_guide_* 기반 가이드 목록 추출 함수 ===
const getAllLocalGuides = () => {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  const guides = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (key.startsWith('guide-cache:') || key.startsWith('ai_guide_')) {
      try {
        const value = localStorage.getItem(key);
        if (!value) continue;
        const parsed = JSON.parse(value);
        // guide-cache: 구조와 ai_guide_ 구조 모두 지원
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
  // 최신순 정렬
  return guides.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [historyEntries, setHistoryEntries] = useState<GuideHistoryEntry[]>([]);
  const [fileHistoryEntries, setFileHistoryEntries] = useState<FileGuideEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'settings'>('profile');
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [useFileStorage, setUseFileStorage] = useState(true); // 파일 저장소 우선 사용
  const [offlineGuides, setOfflineGuides] = useState<any[]>([]);
  const [localGuides, setLocalGuides] = useState<any[]>([]);
  const { t } = useTranslation('common');

  useEffect(() => {
    console.log('session:', session, 'status:', status);
  }, [session, status]);

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  // 가이드 히스토리 조회 (Supabase/localStorage 병행)
  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      try {
        if (session?.user?.id) {
          // 로그인: Supabase에서 불러오기
          const data = await fetchGuideHistoryFromSupabase(session.user);
          setHistoryEntries(data || []);
        } else {
          // 비로그인: localStorage에서 불러오기
          const history = guideHistory.getHistory();
          const sortedHistory = history.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setHistoryEntries(sortedHistory);
        }
      } catch (error) {
        setHistoryEntries([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, [session]);

  useEffect(() => {
    // 오프라인 가이드함 불러오기
    const guides = JSON.parse(localStorage.getItem('myGuides') || '[]');
    setOfflineGuides(guides);
  }, [session]);

  useEffect(() => {
    setLocalGuides(getAllLocalGuides());
  }, [session]);

  const handleDeleteHistory = (id: string) => {
    if (!confirm(t('delete_history_confirmation'))) return;
    try {
      guideHistory.deleteHistory(id);
      setHistoryEntries(prev => prev.filter(h => h.id !== id));
    } catch (error) {
      alert(t('delete_history_error'));
    }
  };

  const handleClearAllHistory = () => {
    if (!confirm(t('clear_all_history_confirmation'))) return;
    try {
      guideHistory.clearHistory();
      setHistoryEntries([]);
    } catch (error) {
      alert(t('clear_all_history_error'));
    }
  };

  const handleLogout = async () => {
    if (confirm(t('logout_confirmation'))) {
      await signOut({ callbackUrl: '/' });
    }
  };

  const formatDate = (dateString: string) => {
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

  const formatDetailedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const goToGuide = (locationName: string) => {
    const encodedLocation = encodeURIComponent(locationName);
    router.push(`/guide/${encodedLocation}?name=${encodeURIComponent(locationName)}`);
  };

  const getProgressPercentage = (viewedPages: string[]) => {
    const totalPages = 3; // overview, route, realtime
    return Math.round((viewedPages.length / totalPages) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  // 로딩 중일 때
  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <LoaderIcon className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-gray-600">{t('loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* 프로필 헤더 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              {session.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt={t('profile')} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-10 h-10 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {session.user?.name || t('traveler')}{t('suffix_nim')}
              </h1>
              <p className="text-gray-600">{session.user?.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <HistoryIcon className="w-4 h-4" />
                  <span>{t('guide_count', { count: useFileStorage ? fileHistoryEntries.length : historyEntries.length })}</span>
                </div>
                {useFileStorage && storageInfo && (
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <FolderIcon className="w-4 h-4" />
                    <span>{storageInfo.totalSize} • {storageInfo.locations.length}{t('places')}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>{t('completed_guide', { count: historyEntries.filter(h => h.completed).length })}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOutIcon className="w-5 h-5" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('my_profile')}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('guide_history', { count: useFileStorage ? fileHistoryEntries.length : historyEntries.length })}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('settings')}
            </button>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('account_info')}</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">{t('email')}</span>
                      <span className="font-medium">{session.user?.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">{t('name')}</span>
                      <span className="font-medium">{session.user?.name || t('not_set')}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600">{t('signup_date')}</span>
                      <span className="font-medium">2024년 12월</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('usage_stats')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-indigo-600">
                        {useFileStorage ? fileHistoryEntries.length : historyEntries.length}
                      </div>
                      <div className="text-sm text-indigo-600">{t('created_guides')}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">
                        {useFileStorage 
                          ? fileHistoryEntries.filter(h => h.completed).length
                          : historyEntries.filter(h => h.completed).length
                        }
                      </div>
                      <div className="text-sm text-green-600">{t('completed_guides')}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600">
                        {useFileStorage 
                          ? new Set(fileHistoryEntries.map(h => h.locationName)).size
                          : new Set(historyEntries.map(h => h.locationName)).size
                        }
                      </div>
                      <div className="text-sm text-purple-600">{t('visited_places')}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">{t('guide_history')}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{useFileStorage ? fileHistoryEntries.length : historyEntries.length}{t('count_unit')}</span>
                    {useFileStorage && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">📁 {t('file_storage')}</span>
                    )}
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-12">
                    <LoaderIcon className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
                    <p className="text-gray-500">{t('loading_history')}</p>
                  </div>
                ) : (useFileStorage ? fileHistoryEntries.length : historyEntries.length) === 0 ? (
                  <div className="text-center py-12">
                    <HistoryIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">{t('no_guides')}</p>
                    <button
                      onClick={() => router.push('/')}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      {t('create_first_guide')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(useFileStorage ? fileHistoryEntries : historyEntries).map((history) => (
                      <div
                        key={history.id}
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPinIcon className="w-5 h-5 text-indigo-600" />
                              <h4 className="font-semibold text-gray-900">{history.locationName}</h4>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                              <div className="flex items-center space-x-1">
                                <ClockIcon className="w-4 h-4" />
                                <span>{formatDate(history.createdAt)}</span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center space-x-1">
                                <EyeIcon className="w-4 h-4" />
                                <span>{t('view_count', { count: history.viewedPages.length })}</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 mb-3">
                              {t('created_at')}: {formatDetailedDate(history.createdAt)}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => goToGuide(history.locationName)}
                                className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                              >
                                <span>{t('view_guide')}</span>
                                <ExternalLinkIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDeleteHistory(history.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={t('delete')}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => goToGuide(history.locationName)}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title={t('view')}
                            >
                              <ChevronRightIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 오프라인 가이드함 */}
                <div className="mt-10">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('offline_guides')}</h3>
                  {offlineGuides.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">{t('no_offline_guides')}</div>
                  ) : (
                    <div className="space-y-4">
                      {offlineGuides.map((guide) => (
                        <div key={guide.metadata?.originalLocationName} className="border border-yellow-200 rounded-xl p-4 bg-yellow-50 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-yellow-900">{guide.metadata?.originalLocationName}</div>
                            <div className="text-xs text-gray-500">{t('saved_at')}: {guide.savedAt ? new Date(guide.savedAt).toLocaleString('ko-KR') : '-'}</div>
                          </div>
                          <button
                            onClick={() => router.push(`/my-guide/${encodeURIComponent(guide.metadata?.originalLocationName)}`)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium"
                            aria-label={t('open_offline_guide')}
                          >
                            {t('open_offline_guide')}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* === 히스토리 탭에 localGuides 목록 추가 === */}
                <div className="mt-8">
                  <h2 className="text-lg font-bold mb-4">{t('browser_guide_history')}</h2>
                  {localGuides.length === 0 ? (
                    <div className="text-gray-500">{t('no_guides')}</div>
                  ) : (
                    <ul className="space-y-4">
                      {localGuides.map((g, idx) => (
                        <li key={g.key} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">{g.locationName}</div>
                            <div className="text-xs text-gray-500">{g.createdAt ? new Date(g.createdAt).toLocaleString('ko-KR') : ''}</div>
                          </div>
                          <button
                            className="mt-2 md:mt-0 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                            onClick={() => {
                              const encoded = encodeURIComponent(g.locationName);
                              window.location.href = `/guide/${encoded}/tour`;
                            }}
                            aria-label={t('open_guide')}
                          >
                            {t('open_guide')}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('settings')}</h3>
                  <p className="text-gray-500">{t('settings_coming_soon')}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('data_management')}</h3>
                  <div className="space-y-4">
                    <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <p className="font-medium text-gray-900">{t('delete_all_history')}</p>
                      <p className="text-sm text-gray-500">{t('delete_all_history_description')}</p>
                    </button>
                    <button className="w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600">
                      <p className="font-medium">{t('delete_account')}</p>
                      <p className="text-sm text-red-500">{t('delete_account_description')}</p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 