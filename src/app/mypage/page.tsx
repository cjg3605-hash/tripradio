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

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [historyEntries, setHistoryEntries] = useState<GuideHistoryEntry[]>([]);
  const [fileHistoryEntries, setFileHistoryEntries] = useState<FileGuideEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'settings'>('profile');
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [useFileStorage, setUseFileStorage] = useState(true); // 파일 저장소 우선 사용

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  // 가이드 히스토리 조회 (파일 시스템 우선)
  useEffect(() => {
    if (session?.user) {
      loadHistory();
    }
  }, [session]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      
      // 서버 파일 시스템에서 히스토리 로드
      const response = await fetch('/api/guide-history');
        
      if (response.ok) {
        const data = await response.json();
          
        if (data.success && data.guides) {
          setFileHistoryEntries(data.guides);
          console.log(`📁 파일 히스토리 로드: ${data.guides.length}개 항목`);
        } else {
          console.warn('가이드 데이터가 없습니다.');
          setFileHistoryEntries([]);
        }
      } else {
        throw new Error(`API 호출 실패: ${response.status}`);
      }
        
    } catch (error) {
      console.error('히스토리 로드 실패:', error);
      
      // 오류 시 localStorage 폴백
      console.log('📋 서버 오류로 localStorage로 폴백');
        const history = guideHistory.getHistory();
        const sortedHistory = history.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setHistoryEntries(sortedHistory);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistory = async (fileName: string) => {
    if (!confirm('이 가이드 파일을 삭제하시겠습니까?')) return;

    try {
        const response = await fetch('/api/guide-history', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify({ fileName }),
        });
        
        const result = await response.json();
        
        if (result.success) {
        // 현재 목록에서 제거
        const filteredHistory = fileHistoryEntries.filter(h => h.id !== fileName);
        setFileHistoryEntries(filteredHistory);
        console.log(`🗑️ 파일 삭제 완료: ${fileName}`);
      } else {
        alert(result.error || '파일 삭제에 실패했습니다.');
      }
      
    } catch (error) {
      console.error('파일 삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleClearAllHistory = () => {
    if (!confirm('모든 가이드 히스토리를 삭제하시겠습니까?')) return;

    try {
      guideHistory.clearHistory();
      setHistoryEntries([]);
      console.log('🧹 전체 히스토리 삭제 완료');
    } catch (error) {
      console.error('전체 히스토리 삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
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
          <span className="text-gray-600">로딩 중...</span>
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
                  alt="프로필" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-10 h-10 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {session.user?.name || '여행자'}님
              </h1>
              <p className="text-gray-600">{session.user?.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <HistoryIcon className="w-4 h-4" />
                  <span>가이드 {useFileStorage ? fileHistoryEntries.length : historyEntries.length}개</span>
                </div>
                {useFileStorage && storageInfo && (
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <FolderIcon className="w-4 h-4" />
                    <span>{storageInfo.totalSize} • {storageInfo.locations.length}개 장소</span>
                  </div>
                )}
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>완료 {historyEntries.filter(h => h.completed).length}개</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOutIcon className="w-5 h-5" />
              <span>로그아웃</span>
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
              내 정보
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              가이드 히스토리 ({useFileStorage ? fileHistoryEntries.length : historyEntries.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              설정
            </button>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">계정 정보</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">이메일</span>
                      <span className="font-medium">{session.user?.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">이름</span>
                      <span className="font-medium">{session.user?.name || '설정되지 않음'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600">가입일</span>
                      <span className="font-medium">2024년 12월</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">이용 통계</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-indigo-600">
                        {useFileStorage ? fileHistoryEntries.length : historyEntries.length}
                      </div>
                      <div className="text-sm text-indigo-600">생성한 가이드</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">
                        {useFileStorage 
                          ? fileHistoryEntries.filter(h => h.completed).length
                          : historyEntries.filter(h => h.completed).length
                        }
                      </div>
                      <div className="text-sm text-green-600">완료한 가이드</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600">
                        {useFileStorage 
                          ? new Set(fileHistoryEntries.map(h => h.locationName)).size
                          : new Set(historyEntries.map(h => h.locationName)).size
                        }
                      </div>
                      <div className="text-sm text-purple-600">방문한 명소</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">가이드 히스토리</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{useFileStorage ? fileHistoryEntries.length : historyEntries.length}개</span>
                    {useFileStorage && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        📁 파일 저장
                      </span>
                    )}
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-12">
                    <LoaderIcon className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
                    <p className="text-gray-500">히스토리를 불러오는 중...</p>
                  </div>
                ) : (useFileStorage ? fileHistoryEntries.length : historyEntries.length) === 0 ? (
                  <div className="text-center py-12">
                    <HistoryIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">아직 생성한 가이드가 없습니다</p>
                    <button
                      onClick={() => router.push('/')}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      첫 가이드 만들기
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
                                <span>조회 {history.viewedPages.length}회</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 mb-3">
                              생성일: {formatDetailedDate(history.createdAt)}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => goToGuide(history.locationName)}
                                className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                              >
                                <span>가이드 보기</span>
                                <ExternalLinkIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDeleteHistory(history.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="삭제"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => goToGuide(history.locationName)}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="보기"
                            >
                              <ChevronRightIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">알림 설정</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">이메일 알림</p>
                        <p className="text-sm text-gray-500">새로운 기능 및 업데이트 소식</p>
                      </div>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">가이드 저장 알림</p>
                        <p className="text-sm text-gray-500">새 가이드 생성 시 알림</p>
                      </div>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">데이터 관리</h3>
                  <div className="space-y-4">
                    <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <p className="font-medium text-gray-900">가이드 히스토리 전체 삭제</p>
                      <p className="text-sm text-gray-500">저장된 모든 가이드 히스토리를 삭제합니다</p>
                    </button>
                    <button className="w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600">
                      <p className="font-medium">계정 삭제</p>
                      <p className="text-sm text-red-500">계정과 모든 데이터가 영구적으로 삭제됩니다</p>
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