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
  const [selectedLanguageIndex, setSelectedLanguageIndex] = useState(0);
  
  const { data: session, status } = useSession();
  const { currentLanguage, currentConfig, setLanguage, t } = useLanguage();
  const router = useRouter();
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const languageButtonRef = useRef<HTMLButtonElement>(null);

  // 현재 언어의 인덱스 찾기
  useEffect(() => {
    const currentIndex = SUPPORTED_LANGUAGES.findIndex(lang => lang.code === currentLanguage);
    setSelectedLanguageIndex(currentIndex >= 0 ? currentIndex : 0);
  }, [currentLanguage]);

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
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLanguageMenuOpen, selectedLanguageIndex]);


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
      <div className="max-w-6xl mx-auto flex items-center justify-between"
           style={{
             padding: 'var(--space-3) var(--space-4)'
           }}>
        {/* 로고 */}
        <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
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
            className="btn-base text-fluid-lg font-bold text-black bg-transparent hover:bg-gray-50 transition-all duration-200"
            style={{
              padding: 'var(--space-2) var(--space-1)'
            }}
          >
            NAVI : GUIDE
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
              aria-label={`${t('header.language') || '언어'}: ${currentConfig?.name || '한국어'}. ${t('common.pressEnterToOpen') || 'Enter키를 눌러 언어 메뉴를 열 수 있습니다.'}`}
              aria-expanded={isLanguageMenuOpen}
              aria-haspopup="listbox"
            >
              <Globe className="w-4 h-4" />
              <span role="img" aria-label={`${currentConfig?.name || '한국어'} 국기`}>
                {currentConfig?.flag || '🇰🇷'}
              </span>
              <span>{currentConfig?.name || '한국어'}</span>
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
                aria-label={t('header.selectLanguage') || '언어 선택'}
              >
                {SUPPORTED_LANGUAGES.map((lang, index) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
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
                    aria-label={`${lang.name} 언어로 변경`}
                  >
                    <span role="img" aria-label={`${lang.name} 국기`}>
                      {lang.flag}
                    </span>
                    <span>{lang.name}</span>
                    {lang.code === currentLanguage && (
                      <span className="ml-auto text-xs text-gray-500" aria-label="현재 선택된 언어">
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
            onClick={onHistoryOpen}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{t('header.history') || '히스토리'}</span>
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
                  <User className="w-5 h-5" />
                )}
                <span>{session.user.name || session.user.email}</span>
                <ChevronDown className="w-4 h-4" />
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
                    {t('profile.mypage') || '마이페이지'}
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t('auth.signout') || '로그아웃'}
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
              <span>{t('auth.signin') || '로그인'}</span>
            </button>
          )}
        </div>

        {/* 모바일 네비게이션 */}
        <div className="md:hidden flex items-center gap-1">
          {/* 언어 선택 */}
          <div className="relative" ref={languageMenuRef}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Mobile language button clicked, current state:', isLanguageMenuOpen);
                setIsLanguageMenuOpen(!isLanguageMenuOpen);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  console.log('Mobile language button key pressed:', e.key);
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
              aria-label={`${t('header.language') || '언어'}: ${currentConfig?.name || '한국어'}`}
              aria-expanded={isLanguageMenuOpen}
              aria-haspopup="listbox"
            >
              <Globe className="w-3 h-3" />
              <span role="img" aria-label={`${currentConfig?.name || '한국어'} 국기`}>
                {currentConfig?.flag || '🇰🇷'}
              </span>
              <ChevronDown className={`w-2 h-2 transition-transform duration-200 ${
                isLanguageMenuOpen ? 'rotate-180' : ''
              }`} />
            </button>

            {isLanguageMenuOpen && (
              <div 
                className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-24 z-50"
                role="listbox"
                aria-label={t('header.selectLanguage') || '언어 선택'}
              >
                {SUPPORTED_LANGUAGES.map((lang, index) => (
                  <button
                    key={lang.code}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Mobile dropdown item clicked:', lang.code);
                      handleLanguageChange(lang.code);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
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
                    aria-label={`${lang.name} 언어로 변경`}
                  >
                    <span role="img" aria-label={`${lang.name} 국기`}>
                      {lang.flag}
                    </span>
                    <span>{lang.name}</span>
                    {lang.code === currentLanguage && (
                      <span className="ml-auto text-xs text-gray-500" aria-label="현재 선택된 언어">
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
            onClick={onHistoryOpen}
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 text-xs text-gray-700"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">{t('header.history') || '히스토리'}</span>
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
                    {t('profile.mypage') || '마이페이지'}
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                  >
                    {t('auth.signout') || '로그아웃'}
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
              <span className="hidden sm:inline">{t('auth.signin') || '로그인'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}