'use client';

import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext';
import { useLocationTranslation } from '@/hooks/useLocationTranslation';
import { Volume2, Globe, User, ChevronDown, LogIn, LogOut, Menu, X } from 'lucide-react';

interface HeaderProps {
  onHistoryOpen?: () => void;
}

// 공통 네비게이션 버튼 컴포넌트
interface NavigationButtonProps {
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  children: React.ReactNode;
  isMobile?: boolean;
}

const NavigationButton = ({ onClick, className = '', children, isMobile = false }: NavigationButtonProps) => {
  const baseClass = isMobile 
    ? 'flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors duration-150'
    : 'flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-150';
  
  return (
    <button
      onClick={onClick}
      className={`${baseClass} ${className}`}
    >
      {children}
    </button>
  );
};

const Header = memo(function Header({ onHistoryOpen }: HeaderProps) {
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedLanguageIndex, setSelectedLanguageIndex] = useState(0);
  
  const { data: session, status } = useSession();
  const { currentLanguage, currentConfig, setLanguage, t } = useLanguage();
  const { changeLanguageWithLocationTranslation } = useLocationTranslation();
  const router = useRouter();
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const languageButtonRef = useRef<HTMLButtonElement>(null);

  // 현재 언어의 인덱스 찾기
  useEffect(() => {
    const currentIndex = SUPPORTED_LANGUAGES.findIndex(lang => lang.code === currentLanguage);
    setSelectedLanguageIndex(currentIndex >= 0 ? currentIndex : 0);
  }, [currentLanguage]);

  const handleLanguageChange = useCallback(async (langCode: string) => {
    console.log('🔥 Language changing to:', langCode);
    
    if (langCode === currentLanguage) {
      console.log('✅ Same language selected, closing menu');
      setIsLanguageMenuOpen(false);
      return;
    }
    
    try {
      // 1. 먼저 쿠키와 localStorage 직접 업데이트
      document.cookie = `language=${langCode}; path=/; max-age=31536000`;
      localStorage.setItem('preferred-language', langCode);
      
      // 2. 언어 컨텍스트 업데이트 (새로고침 없이)
      await setLanguage(langCode as any);
      setIsLanguageMenuOpen(false);
      
      console.log('✅ Language changed successfully without reload');
      
    } catch (error) {
      console.error('❌ Language change failed:', error);
      // 에러 발생시에만 새로고침으로 복구
      console.warn('🔄 Falling back to page reload');
      window.location.reload();
    }
  }, [setLanguage, currentLanguage]);

  // 키보드 네비게이션 및 외부 클릭 처리
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isLanguageMenuOpen) {
        // 언어 버튼에 포커스가 있을 때 Enter/Space로 메뉴 열기
        if ((event.key === 'Enter' || event.key === ' ') && 
            document.activeElement === languageButtonRef.current) {
          event.preventDefault();
          setIsLanguageMenuOpen(true);
          return;
        }
        return;
      }

      // 메뉴가 열려있을 때의 키보드 네비게이션
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedLanguageIndex(prev => 
            prev < SUPPORTED_LANGUAGES.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedLanguageIndex(prev => 
            prev > 0 ? prev - 1 : SUPPORTED_LANGUAGES.length - 1
          );
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          handleLanguageChange(SUPPORTED_LANGUAGES[selectedLanguageIndex].code);
          break;
        case 'Escape':
          event.preventDefault();
          setIsLanguageMenuOpen(false);
          languageButtonRef.current?.focus();
          break;
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      console.log('🎯 Outside click detected:', event.target);
      
      // Check if click is on a dropdown item - if so, don't close
      const clickedElement = event.target as Element;
      if (clickedElement.closest('.dropdown-item')) {
        console.log('🎯 Click was on dropdown item, not closing menu');
        return;
      }
      
      // Check if click is inside search autocomplete area - if so, don't interfere
      if (clickedElement.closest('input[type="text"]') || 
          clickedElement.closest('[class*="suggestion"]') ||
          clickedElement.closest('[class*="autocomplete"]')) {
        console.log('🎯 Click was on search area, not closing menu');
        return;
      }
      
      // Check if click is inside any dropdown menu
      if (languageMenuRef.current?.contains(event.target as Node) || 
          profileMenuRef.current?.contains(event.target as Node)) {
        console.log('🎯 Click was inside dropdown menu, not closing');
        return;
      }
      
      // Close menus if click is outside
      if (isLanguageMenuOpen) {
        console.log('🔒 Closing language menu due to outside click');
        setIsLanguageMenuOpen(false);
      }
      if (isProfileMenuOpen) {
        console.log('🔒 Closing profile menu due to outside click');
        setIsProfileMenuOpen(false);
      }
      if (isMobileMenuOpen) {
        console.log('🔒 Closing mobile menu due to outside click');
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isLanguageMenuOpen, selectedLanguageIndex, handleLanguageChange, isProfileMenuOpen, isMobileMenuOpen]);

  const handleSignOut = async () => {
    console.log('🚀 로그아웃 시작...');
    try {
      setIsProfileMenuOpen(false);
      
      // 1. 클라이언트 정리 (쿠키, 스토리지, 간단한 캐시)
      const { performCompleteLogout, simpleCacheInvalidation } = await import('@/lib/auth-utils');
      await performCompleteLogout();
      await simpleCacheInvalidation();
      
      // 2. 서버 사이드 강제 로그아웃 API 호출
      try {
        console.log('🔥 서버 강제 로그아웃 호출 중...');
        await fetch('/api/auth/force-logout', {
          method: 'POST',
          credentials: 'include'
        });
        console.log('✅ 서버 강제 로그아웃 완료');
      } catch (apiError) {
        console.warn('⚠️ 서버 강제 로그아웃 실패:', apiError);
      }
      
      // 3. NextAuth signOut 호출 (리다이렉트 비활성화로 제어권 확보)
      console.log('🔄 NextAuth signOut 호출 중...');
      await signOut({ 
        callbackUrl: '/',
        redirect: false  // 수동 리다이렉트로 변경
      });
      
      // 4. 수동 리다이렉트 (확실한 제어)
      console.log('🏠 홈페이지로 리다이렉트...');
      window.location.href = '/';
      
      // NextAuth가 자동으로 홈페이지로 리다이렉트하므로 추가 로직 불필요
      
    } catch (error) {
      console.error('❌ 로그아웃 중 오류 발생:', error);
      
      // 에러 발생시에도 기본 정리 및 리다이렉트
      try {
        await fetch('/api/auth/force-logout', { method: 'POST', credentials: 'include' });
      } catch (cleanupError) {
        console.error('정리 프로세스 실패:', cleanupError);
      }
      
      // 강제 리다이렉트 (NextAuth 실패시 백업)
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* 로고 */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black flex items-center justify-center" style={{ borderRadius: '10px' }}>
                <span className="text-white text-xs sm:text-sm font-bold">T</span>
              </div>
              <Link 
                href="/"
                className="text-lg sm:text-xl font-bold text-black hover:text-gray-700 transition-colors duration-200"
              >
                {t('home.brandTitle')}
              </Link>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
          {/* 언어 선택 */}
          <div 
            className="relative" 
            ref={languageMenuRef}
          >
            <button
              ref={languageButtonRef}
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsLanguageMenuOpen(!isLanguageMenuOpen);
                }
              }}
              className={`hidden sm:flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg hover:bg-gray-50 transition-colors ${isLanguageMenuOpen ? 'bg-gray-50' : ''}`}
              aria-label={`${String(t('header.language'))}: ${currentConfig?.name}. ${String(t('search.pressEnterToSearch'))}`}
              aria-expanded={isLanguageMenuOpen}
              aria-haspopup="listbox"
            >
              <Globe size={14} className="sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">{currentConfig?.name || t('languages.ko')}</span>
            </button>


            {/* 언어 드롭다운 메뉴 */}
            {isLanguageMenuOpen && (
              <div 
                className="absolute top-full right-0 bg-white border border-gray-200 shadow-dropdown z-50"
                style={{
                  marginTop: 'var(--space-1)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-1) 0',
                  minWidth: '8rem'
                }}
                role="listbox"
                aria-label={String(t('header.selectLanguage'))}
              >
                {SUPPORTED_LANGUAGES.map((lang, index) => (
                  <a
                    key={lang.code}
                    href={`?lang=${lang.code}`}
                    onClick={(e) => {
                      console.log('🖱️ Desktop dropdown option clicked:', lang.code);
                      e.preventDefault();
                      e.stopPropagation();
                      handleLanguageChange(lang.code);
                    }}
                    className={`
                      dropdown-item w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors duration-150
                      focus:outline-none focus:ring-2 focus:ring-black focus:ring-inset
                      ${index === selectedLanguageIndex 
                        ? 'bg-gray-50 text-gray-900' 
                        : 'hover:bg-gray-50 hover:text-gray-900 text-gray-700'
                      }
                      ${lang.code === currentLanguage 
                        ? 'font-medium bg-gray-50' 
                        : ''
                      }
                    `}
                    role="option"
                    aria-selected={lang.code === currentLanguage}
                    aria-label={String(t('header.changeToLanguage', { language: lang.name }))}
                  >
                    <span role="img" aria-label={String(t('header.flagAltText', { language: lang.name }))}>
                      {lang.flag}
                    </span>
                    <span>{lang.name}</span>
                    {lang.code === currentLanguage && (
                      <span className="ml-auto text-sm text-gray-500" aria-label={String(t('header.currentSelectedLanguage'))}>
                        ✓
                      </span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

            {/* History */}
            <button 
              onClick={(e) => {
                console.log('🖱️ Desktop history button clicked');
                e.preventDefault();
                e.stopPropagation();
                if (onHistoryOpen) onHistoryOpen();
              }}
              className="hidden sm:flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

          {/* 로그인 상태 */}
          {status === 'loading' ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          ) : session?.user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={(e) => {
                  console.log('🖱️ Desktop profile button clicked, current state:', isProfileMenuOpen);
                  e.preventDefault();
                  e.stopPropagation();
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                }}
                className="hidden sm:flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm hover:bg-gray-50 rounded-lg transition-colors"
              >
                {session.user.image ? (
                  <Image 
                    src={session.user.image} 
                    alt={String(t('header.profileAlt'))} 
                    width={16}
                    height={16}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
                  />
                ) : (
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                <span className="truncate max-w-16 sm:max-w-24 text-xs sm:text-sm">{session.user.name || session.user.email}</span>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-dropdown border border-gray-200 py-1 min-w-40 z-50">
                  <a
                    onClick={(e) => {
                      console.log('🖱️ Desktop mypage option clicked');
                      e.preventDefault();
                      e.stopPropagation();
                      router.push('/mypage');
                      setIsProfileMenuOpen(false);
                    }}
                    href="/mypage"
                    className="dropdown-item w-full text-left px-3 py-2 text-sm text-gray-700 transition-colors duration-150"
                  >
                    {t('profile.mypage')}
                  </a>
                  <button
                    onClick={(e) => {
                      console.log('🖱️ Desktop logout option clicked');
                      e.preventDefault();
                      e.stopPropagation();
                      handleSignOut();
                    }}
                    className="dropdown-item w-full text-left px-3 py-2 text-sm text-gray-700 transition-colors duration-150"
                  >
                    {t('auth.signout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a 
              href="/auth/signin"
              className="hidden sm:flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              <User size={14} className="sm:w-4 sm:h-4" />
              <span>{t('auth.signin')}</span>
            </a>
          )}

            {/* Mobile menu button */}
            <button
              className="md:hidden flex items-center px-2 py-1 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-2">
            <button 
              className="w-full justify-start flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
            >
              <Globe size={16} />
              {t('header.language')}: {currentConfig?.name || t('languages.ko')}
            </button>
            
            <button 
              onClick={(e) => {
                e.preventDefault();
                if (onHistoryOpen) onHistoryOpen();
                setIsMobileMenuOpen(false);
              }}
              className="w-full justify-start flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('header.history')}
            </button>
            
            {session?.user ? (
              <>
                <a
                  href="/mypage"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push('/mypage');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <User size={16} />
                  {t('profile.mypage')}
                </a>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  {t('auth.signout')}
                </button>
              </>
            ) : (
              <a 
                href="/auth/signin"
                className="w-full justify-start flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <User size={16} />
                {t('auth.signin')}
              </a>
            )}
          </div>
          
          {/* Mobile Language Menu */}
          {isLanguageMenuOpen && (
            <div className="border-t border-gray-200 px-4 py-2">
              <div className="space-y-1">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleLanguageChange(lang.code);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 text-sm rounded-lg transition-colors ${
                      lang.code === currentLanguage 
                        ? 'bg-gray-50 text-gray-900 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span role="img" aria-label={String(t('header.flagAltText', { language: lang.name }))}>
                      {lang.flag}
                    </span>
                    <span>{lang.name}</span>
                    {lang.code === currentLanguage && (
                      <span className="ml-auto text-sm text-gray-500">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </header>
  );
});

export default Header;