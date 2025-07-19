'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext';
import { Volume2, Globe, User, ChevronDown, LogIn, LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  onHistoryOpen?: () => void;
}

export default function Header({ onHistoryOpen }: HeaderProps) {
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { data: session, status } = useSession();
  const { currentLanguage, currentConfig, setLanguage, t } = useLanguage();
  const router = useRouter();
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = async (langCode: string) => {
    await setLanguage(langCode as any);
    setIsLanguageMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* 로고 */}
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-black" />
          <button 
            onClick={() => router.push('/')}
            className="text-lg font-bold text-black"
          >
            NAVI GUIDE
          </button>
        </div>

        {/* 데스크톱 네비게이션 */}
        <div className="hidden md:flex items-center gap-1">
          {/* 언어 선택 */}
          <div className="relative" ref={languageMenuRef}>
            <button
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700"
            >
              <Globe className="w-4 h-4" />
              <span>{currentConfig?.flag || '🇰🇷'}</span>
              <span>KR</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isLanguageMenuOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-32 z-50">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 로그인 상태 */}
          {session?.user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700"
              >
                {session.user.image ? (
                  <img 
                    src={session.user.image} 
                    alt="Profile" 
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <ChevronDown className="w-3 h-3" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-3 py-2 text-sm text-gray-500 border-b border-gray-100">
                    <div className="font-medium text-gray-900">
                      {session.user.name || 'User'}
                    </div>
                    <div className="text-xs truncate">
                      {session.user.email}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      router.push('/mypage');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    마이페이지
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push('/auth/signin')}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <LogIn className="w-4 h-4" />
              <span>로그인</span>
            </button>
          )}
        </div>

        {/* 모바일 메뉴 버튼 */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {/* 모바일 언어 선택 */}
            <div className="text-sm font-medium text-gray-500 mb-2">언어 선택</div>
            <div className="space-y-1">
              {SUPPORTED_LANGUAGES.map((config) => (
                <button
                  key={config.code}
                  onClick={() => {
                    handleLanguageChange(config.code);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2 hover:bg-gray-100 rounded-lg flex items-center gap-2 text-sm"
                >
                  <span>{config.flag}</span>
                  <span>{config.name}</span>
                </button>
              ))}
            </div>

            {/* 모바일 사용자 메뉴 */}
            <div className="pt-3 border-t border-gray-200">
              {session?.user ? (
                <div className="space-y-1">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900">
                      {session.user.name || 'User'}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {session.user.email}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      router.push('/mypage');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    마이페이지
                  </button>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    router.push('/auth/signin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full p-2 bg-black text-white rounded-lg text-sm font-medium"
                >
                  로그인
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}