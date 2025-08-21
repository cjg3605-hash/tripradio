'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Share2, 
  MoreVertical, 
  Globe,
  History,
  User,
  LogIn,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface GuideHeaderProps {
  locationName: string;
  onShare?: () => void;
  variant?: 'live' | 'main';
}

export function GuideHeader({ locationName, onShare, variant = 'main' }: GuideHeaderProps) {
  const router = useRouter();
  const { currentLanguage, setLanguage, t } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    if (onShare) {
      onShare();
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: `${locationName} - ${variant === 'live' ? '실시간 가이드' : '여행 가이드'}`,
          text: `${locationName}의 ${variant === 'live' ? '실시간 오디오 가이드' : '여행 가이드'}를 확인해보세요!`,
          url: window.location.href
        });
      } catch (error) {
        console.error('공유 실패:', error);
      }
    } else {
      // 폴백: URL 복사
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as any);
    setShowDropdown(false);
    // URL에서 언어 파라미터 변경
    const pathSegments = window.location.pathname.split('/');
    if (pathSegments[2]) {
      pathSegments[2] = lang;
      router.push(pathSegments.join('/'));
    }
  };

  const handleHistoryClick = () => {
    setShowDropdown(false);
    router.push('/my-guide');
  };

  const handleLoginClick = () => {
    setShowDropdown(false);
    router.push('/auth/login');
  };

  const languageOptions = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  return (
    <header className="sticky top-0 w-full glass" style={{ zIndex: 50 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* 뒤로가기 버튼 */}
          <Button 
            size="sm" 
            className="flex items-center space-x-2 bg-transparent hover:bg-gray-100 text-gray-700 touch-target" 
            onClick={handleBack}
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">뒤로</span>
          </Button>

          {/* 로고와 제목 */}
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push('/')}
          >
            <div className="w-8 h-8 bg-black flex items-center justify-center" style={{ borderRadius: '6px' }}>
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <div className="text-center">
              <h1 className="font-bold text-black hidden sm:block text-lg">TripRadio.AI</h1>
            </div>
          </div>

          {/* 우측 액션 버튼들 */}
          <div className="flex items-center space-x-2 relative">
            {/* 공유 버튼 */}
            <Button 
              size="sm" 
              className="hidden sm:flex bg-transparent hover:bg-gray-100 text-gray-700 touch-target" 
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            
            {/* 더보기 햄버거 메뉴 */}
            <div className="relative">
              <Button 
                size="sm" 
                className="bg-transparent hover:bg-gray-100 text-gray-700 touch-target"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {showDropdown ? (
                  <X className="w-4 h-4" />
                ) : (
                  <MoreVertical className="w-4 h-4" />
                )}
              </Button>

              {/* 드롭다운 메뉴 */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 py-2 shadow-xl rounded-xl" 
                     style={{ 
                       zIndex: 50 
                     }}>
                  {/* 모바일에서 공유 버튼 */}
                  <button
                    onClick={handleShare}
                    className="sm:hidden w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                  >
                    <Share2 className="w-4 h-4" />
                    공유하기
                  </button>
                  
                  {/* 언어 선택 */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                      <Globe className="w-3 h-3" />
                      언어 선택
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {languageOptions.map((option) => (
                        <button
                          key={option.code}
                          onClick={() => handleLanguageChange(option.code)}
                          className={`w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md flex items-center gap-3 text-sm transition-colors ${
                            currentLanguage === option.code 
                              ? 'bg-blue-50 text-blue-700 font-medium' 
                              : 'text-gray-700'
                          }`}
                        >
                          <span className="text-base">{option.flag}</span>
                          {option.name}
                          {currentLanguage === option.code && (
                            <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 히스토리 */}
                  <button
                    onClick={handleHistoryClick}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 border-b border-gray-100"
                  >
                    <History className="w-4 h-4" />
                    내 가이드 히스토리
                  </button>

                  {/* 로그인 */}
                  <button
                    onClick={handleLoginClick}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                  >
                    <LogIn className="w-4 h-4" />
                    로그인
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 드롭다운이 열려있을 때 배경 오버레이 */}
      {showDropdown && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
}