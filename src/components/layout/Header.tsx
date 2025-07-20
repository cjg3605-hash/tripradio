'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext';
import { Volume2, Globe, User, ChevronDown, LogIn, LogOut } from 'lucide-react';

interface HeaderProps {
  onHistoryOpen?: () => void;
}

export default function Header({ onHistoryOpen }: HeaderProps) {
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
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
        <div className="flex items-center gap-3">
          {/* 스피커 아이콘을 원형 테두리로 감싸기 */}
          <div className="w-10 h-10 border-2 border-gray-300 rounded-full flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-black" />
          </div>
          <button 
            onClick={() => router.push('/')}
            className="text-lg font-bold text-black"
          >
            NAVI : GUIDE
          </button>
        </div>

        {/* 데스크톱 네비게이션 */}
        <div className="hidden md:flex items-center gap-1">
          {/* 언어 선택 */}
          <div className="relative" ref={languageMenuRef}>
            <button
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Globe className="w-4 h-4" />
              <span>{currentConfig?.flag || '🇰🇷'}</span>
              <span>{currentConfig?.name || '한국어'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isLanguageMenuOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-32 z-50">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 히스토리 버튼 */}
          <button
            onClick={onHistoryOpen}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{t?.header?.history || '히스토리'}</span>
          </button>

          {/* 로그인 상태 */}
          {status === 'loading' ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          ) : session?.user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {session.user.image ? (
                  <img 
                    src={session.user.image} 
                    alt="프로필" 
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span>{session.user.name || session.user.email}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-40 z-50">
                  <button
                    onClick={() => {
                      router.push('/mypage');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t?.profile?.mypage || '마이페이지'}
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t?.auth?.signout || '로그아웃'}
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
              <span>{t?.auth?.signin || '로그인'}</span>
            </button>
          )}
        </div>

        {/* 모바일 네비게이션 */}
        <div className="md:hidden flex items-center gap-1">
          {/* 언어 선택 */}
          <div className="relative" ref={languageMenuRef}>
            <button
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 text-xs text-gray-700"
            >
              <Globe className="w-3 h-3" />
              <span>{currentConfig?.flag || '🇰🇷'}</span>
            </button>

            {isLanguageMenuOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-24 z-50">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className="w-full text-left px-2 py-1 hover:bg-gray-100 flex items-center gap-1 text-xs"
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 히스토리 버튼 */}
          <button
            onClick={onHistoryOpen}
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 text-xs text-gray-700"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">{t?.header?.history || '히스토리'}</span>
          </button>

          {/* 로그인 상태 */}
          {session?.user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 text-xs text-gray-700"
              >
                {session.user.image ? (
                  <img 
                    src={session.user.image} 
                    alt="프로필" 
                    className="w-4 h-4 rounded-full"
                  />
                ) : (
                  <User className="w-3 h-3" />
                )}
                <span className="hidden sm:inline">{session.user.name || session.user.email}</span>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-32 z-50">
                  <button
                    onClick={() => {
                      router.push('/mypage');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                  >
                    {t?.profile?.mypage || '마이페이지'}
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                  >
                    {t?.auth?.signout || '로그아웃'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push('/auth/signin')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 text-xs text-gray-700"
            >
              <LogIn className="w-3 h-3" />
              <span className="hidden sm:inline">{t?.auth?.signin || '로그인'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}