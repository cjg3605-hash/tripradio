'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Trash2, 
  Search,
  History
} from 'lucide-react';
import { guideHistory } from '@/lib/cache/localStorage';
import { fetchGuideHistoryFromSupabase } from '@/lib/supabaseGuideHistory';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';

interface HistoryEntry {
  fileName: string;
  locationName: string;
  generatedAt: string;
  preview: string;
}

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HistorySidebar({ isOpen, onClose }: HistorySidebarProps) {
  const { t, currentLanguage } = useLanguage();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { data: session } = useSession();

  // 히스토리 로드 (Supabase/localStorage 병행)
  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      if (session?.user?.id) {
        // 로그인: Supabase에서 불러오기
        const data = await fetchGuideHistoryFromSupabase(session.user);
        setHistory(data || []);
      } else {
        // 비로그인: localStorage에서 불러오기
        const localHistory = guideHistory.getHistory();
        // GuideHistoryEntry를 HistoryEntry로 변환
        const convertedHistory: HistoryEntry[] = localHistory.map(entry => ({
          fileName: entry.id,
          locationName: entry.locationName,
          generatedAt: entry.createdAt,
          preview: entry.guideData?.overview?.summary || entry.guideData?.overview?.title || String(t('history.preview'))
        }));
        setHistory(convertedHistory);
      }
    } catch (error) {
      setHistory([]);
      console.error(t('history.loadFailed'), error);
    } finally {
      setIsLoading(false);
    }
  }, [session, t]);

  // 히스토리 삭제
  const deleteHistoryItem = (historyId: string) => {
    try {
      // localStorage에서 삭제
      const localHistory = guideHistory.getHistory().filter(item => item.id !== historyId);
      localStorage.setItem('navi_guide_history', JSON.stringify(localHistory));
      // GuideHistoryEntry를 HistoryEntry로 변환
      const convertedHistory: HistoryEntry[] = localHistory.map(entry => ({
        fileName: entry.id,
        locationName: entry.locationName,
        generatedAt: entry.createdAt,
        preview: entry.guideData?.overview?.summary || entry.guideData?.overview?.title || String(t('history.preview'))
      }));
      setHistory(convertedHistory);
    } catch (error) {
      console.error(t('history.deleteFailed'), error);
    }
  };

  // 가이드로 이동
  const goToGuide = (locationName: string) => {
    const encodedName = encodeURIComponent(locationName);
    // 🚀 새 URL 구조: /guide/[language]/[location]
    router.push(`/guide/${currentLanguage}/${encodedName}`);
    onClose();
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    if (!dateString) return t('history.invalidDate');
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t('history.invalidDate');
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return t('history.today');
    if (diffDays === 1) return t('history.yesterday');
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    return date.toLocaleDateString();
  };

  // 검색 필터링
  const filteredHistory = history.filter(item =>
    item.locationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, session, loadHistory]);

  // 사이드바 열렸을 때 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* 오버레이 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={onClose}
        />
      )}

      {/* 사이드바 */}
      <div className={`
        fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-xl z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">{t('header.history')}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 검색 */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={String(t('history.searchInHistory'))}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* 히스토리 목록 */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                <p className="text-gray-500">{t('common.loading')}</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="p-4 text-center">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">
                  {searchQuery ? t('history.noResults') : t('history.noHistory')}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {t('history.searchPlaces')}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredHistory.map((item, index) => (
                  <div key={item.fileName} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => goToGuide(item.locationName)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <h3 className="font-medium text-gray-900 truncate">
                            {item.locationName}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {item.preview}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(item.generatedAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => goToGuide(item.locationName)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title={String(t('history.view'))}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteHistoryItem(item.fileName)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={String(t('history.delete'))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 하단 액션 */}
          {filteredHistory.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <span className="text-xs text-gray-400 block text-center mt-4">
                총 {filteredHistory.length}개 가이드
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 