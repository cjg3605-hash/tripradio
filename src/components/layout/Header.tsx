'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext';
import { useLocationTranslation } from '@/hooks/useLocationTranslation';
import { Volume2, Globe, User, ChevronDown, LogIn, LogOut } from 'lucide-react';

interface HeaderProps {
  onHistoryOpen?: () => void;
}

export default function Header({ onHistoryOpen }: HeaderProps) {
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
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
    try {
      // 1. 장소명 번역과 URL 업데이트 시도 (비동기)
      const wasTranslated = await changeLanguageWithLocationTranslation(
        langCode as any, 
        currentLanguage
      );
      
      // 2. 언어 컨텍스트 업데이트
      await setLanguage(langCode as any);
      setIsLanguageMenuOpen(false);
      
      console.log('✅ Language changed successfully:', { 
        newLanguage: langCode, 
        locationTranslated: wasTranslated 
      });
    } catch (error) {
      console.error('❌ Language change failed:', error);
    }
  }, [setLanguage, changeLanguageWithLocationTranslation, currentLanguage]);

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
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isLanguageMenuOpen, selectedLanguageIndex, handleLanguageChange, isProfileMenuOpen]);

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
    <header className="bg-white border-b border-gray-200 relative z-20">
      <div className="max-w-6xl mx-auto flex items-center justify-between"
           style={{
             padding: 'var(--space-3) var(--space-4)'
           }}>
        {/* 로고 */}
        <div className="flex items-center" style={{ gap: 'var(--space-1-5)' }}>
          {/* 스피커 아이콘을 원형 테두리로 감싸기 */}
          <div className="border-2 border-gray-300 rounded-full flex items-center justify-center touch-target"
               style={{
                 width: 'var(--touch-target-min)',
                 height: 'var(--touch-target-min)'
               }}>
            <Volume2 className="w-5 h-5 text-black" />
          </div>
          <button 
            onClick={() => router.push('/')}
            className="btn-base text-fluid-xl font-bold text-black bg-transparent hover:bg-gray-50 transition-all duration-200 relative"
            style={{
              padding: 'var(--space-2) var(--space-1)'
            }}
          >
            {currentLanguage === 'ko' ? (
              <>
                트립라디오
                <span className="text-xs font-normal absolute -top-1 ml-1 text-gray-600">
                  AI
                </span>
              </>
            ) : (
              <>
                TRIPRADIO
                <span className="text-xs font-normal absolute -top-1 ml-1 text-gray-600">
                  .AI
                </span>
              </>
            )}
          </button>
        </div>

        {/* 데스크톱 네비게이션 */}
        <div className="hidden md:flex items-center" style={{ gap: 'var(--space-1)' }}>
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
              className={`
                btn-base flex items-center text-fluid-sm transition-all duration-200 ease-out
                ${isLanguageMenuOpen 
                  ? 'bg-gray-100 text-gray-900 shadow-button' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 bg-transparent'
                }
              `}
              style={{
                gap: 'var(--space-1)',
                padding: 'var(--space-3) var(--space-3)',
                borderRadius: 'var(--radius-md)'
              }}
              aria-label={`${String(t('header.language'))}: ${currentConfig?.name}. ${String(t('search.pressEnterToSearch'))}`}
              aria-expanded={isLanguageMenuOpen}
              aria-haspopup="listbox"
            >
              <Globe className="w-4 h-4" />
              <span role="img" aria-label={`${currentConfig?.name || '한국어'} 국기`}>
                {currentConfig?.flag}
              </span>
              <span>{currentConfig?.name}</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                isLanguageMenuOpen ? 'rotate-180' : ''
              }`} />
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
                  <button
                    key={lang.code}
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
                        ? 'bg-gray-100 text-gray-900' 
                        : 'hover:bg-gray-50 hover:text-gray-900 text-gray-700'
                      }
                      ${lang.code === currentLanguage 
                        ? 'font-medium bg-gray-50' 
                        : ''
                      }
                    `}
                    role="option"
                    aria-selected={lang.code === currentLanguage}
                    aria-label={`${lang.name}로 변경`}
                  >
                    <span role="img" aria-label={`${lang.name} 국기`}>
                      {lang.flag}
                    </span>
                    <span>{lang.name}</span>
                    {lang.code === currentLanguage && (
                      <span className="ml-auto text-xs text-gray-500" aria-label={String(t('header.currentSelectedLanguage'))}>
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 히스토리 버튼 */}
          <button
            onClick={(e) => {
              console.log('🖱️ Desktop history button clicked');
              e.preventDefault();
              e.stopPropagation();
              if (onHistoryOpen) onHistoryOpen();
            }}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{t('header.history')}</span>
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
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {session.user.image ? (
                  <Image 
                    src={session.user.image} 
                    alt={String(t('header.profileAlt'))} 
                    width={20}
                    height={20}
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
                <span>{session.user.name || session.user.email}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-dropdown border border-gray-200 py-1 min-w-40 z-50">
                  <button
                    onClick={(e) => {
                      console.log('🖱️ Desktop mypage option clicked');
                      e.preventDefault();
                      e.stopPropagation();
                      router.push('/mypage');
                      setIsProfileMenuOpen(false);
                    }}
                    className="dropdown-item w-full text-left px-3 py-2 text-sm text-gray-700 transition-colors duration-150"
                  >
                    {t('profile.mypage')}
                  </button>
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
            <button
              onClick={(e) => {
                console.log('🖱️ Desktop login button clicked');
                e.preventDefault();
                e.stopPropagation();
                router.push('/auth/signin');
              }}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150"
            >
              <LogIn className="w-4 h-4" />
              <span>{t('auth.signin')}</span>
            </button>
          )}
        </div>

        {/* 모바일 네비게이션 */}
        <div className="md:hidden flex items-center gap-1">
          {/* 언어 선택 */}
          <div className="relative" ref={languageMenuRef}>
            <button
              onClick={(e) => {
                console.log('🖱️ Mobile language button clicked, current state:', isLanguageMenuOpen);
                e.preventDefault();
                e.stopPropagation();
                setIsLanguageMenuOpen(!isLanguageMenuOpen);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsLanguageMenuOpen(!isLanguageMenuOpen);
                }
              }}
              className={`
                flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1
                ${isLanguageMenuOpen 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              aria-label={`${String(t('header.language'))}: ${currentConfig?.name}`}
              aria-expanded={isLanguageMenuOpen}
              aria-haspopup="listbox"
            >
              <Globe className="w-3 h-3" />
              <span role="img" aria-label={`${currentConfig?.name || '한국어'} 국기`}>
                {currentConfig?.flag}
              </span>
              <ChevronDown className={`w-2 h-2 transition-transform duration-200 ${
                isLanguageMenuOpen ? 'rotate-180' : ''
              }`} />
            </button>

            {isLanguageMenuOpen && (
              <div 
                className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-dropdown border border-gray-200 py-1 min-w-24 z-50"
                role="listbox"
                aria-label={String(t('header.selectLanguage'))}
              >
                {SUPPORTED_LANGUAGES.map((lang, index) => (
                  <button
                    key={lang.code}
                    onClick={(e) => {
                      console.log('🖱️ Mobile dropdown item clicked:', lang.code);
                      e.preventDefault();
                      e.stopPropagation();
                      handleLanguageChange(lang.code);
                    }}
                    className={`
                      dropdown-item w-full text-left px-2 py-1 flex items-center gap-1 text-xs transition-colors duration-150
                      focus:outline-none focus:ring-2 focus:ring-black focus:ring-inset
                      ${index === selectedLanguageIndex 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'hover:bg-gray-50 hover:text-gray-900 text-gray-700'
                      }
                      ${lang.code === currentLanguage 
                        ? 'font-medium bg-gray-50' 
                        : ''
                      }
                    `}
                    role="option"
                    aria-selected={lang.code === currentLanguage}
                    aria-label={`${lang.name}로 변경`}
                  >
                    <span role="img" aria-label={`${lang.name} 국기`}>
                      {lang.flag}
                    </span>
                    <span>{lang.name}</span>
                    {lang.code === currentLanguage && (
                      <span className="ml-auto text-xs text-gray-500" aria-label={String(t('header.currentSelectedLanguage'))}>
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 히스토리 버튼 */}
          <button
            onClick={(e) => {
              console.log('🖱️ Mobile history button clicked');
              e.preventDefault();
              e.stopPropagation();
              if (onHistoryOpen) onHistoryOpen();
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 text-xs text-gray-700 transition-colors duration-150"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">{t('header.history')}</span>
          </button>

          {/* 로그인 상태 */}
          {session?.user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={(e) => {
                  console.log('🖱️ Mobile profile button clicked, current state:', isProfileMenuOpen);
                  e.preventDefault();
                  e.stopPropagation();
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 text-xs text-gray-700 transition-colors duration-150"
              >
                {session.user.image ? (
                  <Image 
                    src={session.user.image} 
                    alt={String(t('header.profileAlt'))} 
                    width={16}
                    height={16}
                    className="w-4 h-4 rounded-full"
                  />
                ) : (
                  <User className="w-3 h-3" />
                )}
                <span className="hidden sm:inline">{session.user.name || session.user.email}</span>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-dropdown border border-gray-200 py-1 min-w-32 z-50">
                  <button
                    onClick={(e) => {
                      console.log('🖱️ Mobile mypage option clicked');
                      e.preventDefault();
                      e.stopPropagation();
                      router.push('/mypage');
                      setIsProfileMenuOpen(false);
                    }}
                    className="dropdown-item w-full text-left px-2 py-1 text-xs text-gray-700 transition-colors duration-150"
                  >
                    {t('profile.mypage')}
                  </button>
                  <button
                    onClick={(e) => {
                      console.log('🖱️ Mobile logout option clicked');
                      e.preventDefault();
                      e.stopPropagation();
                      handleSignOut();
                    }}
                    className="dropdown-item w-full text-left px-2 py-1 text-xs text-gray-700 transition-colors duration-150"
                  >
                    {t('auth.signout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={(e) => {
                console.log('🖱️ Mobile login button clicked');
                e.preventDefault();
                e.stopPropagation();
                router.push('/auth/signin');
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 text-xs text-gray-700 transition-colors duration-150"
            >
              <LogIn className="w-3 h-3" />
              <span className="hidden sm:inline">{t('auth.signin')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}