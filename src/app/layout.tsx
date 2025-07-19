'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext';
import { Globe, User, ChevronDown, LogIn, LogOut, Menu, X } from 'lucide-react';

export default function Header({ onSidebarToggle }: { onSidebarToggle?: () => void }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { currentLanguage, currentConfig, setLanguage, t } = useLanguage();
  
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 로고 */}
          <div className="flex items-center">
            <button
              onClick={() => router.push('/')}
              className="text-2xl font-bold text-black hover:text-gray-800 transition-colors"
            >
              {t.header.title}
            </button>
          </div>
 
          {/* 데스크톱 네비게이션 */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-black transition-colors font-medium"
              >
                {t.navigation.home}
              </button>
              <button
                onClick={() => router.push('/guides')}
                className="text-gray-600 hover:text-black transition-colors font-medium"
              >
                {t.navigation.guides}
              </button>
              <button
                onClick={onSidebarToggle}
                className="text-gray-600 hover:text-black transition-colors font-medium"
              >
                {t.header.history}
              </button>
              <button
                onClick={() => router.push('/about')}
                className="text-gray-600 hover:text-black transition-colors font-medium"
              >
                {t.navigation.about}
              </button>
            </nav>
          </div>
 
          {/* 우측 메뉴 */}
          <div className="flex items-center gap-4">
            
            {/* 언어 선택기 */}
            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="text-lg">{currentConfig.flag}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
 
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3 transition-colors ${
                        currentLanguage === lang.code ? 'bg-gray-50 text-black' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
 
            {/* 사용자 메뉴 */}
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : session?.user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {session.user.image ? (
                    <img 
                      src={session.user.image} 
                      alt="Profile" 
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <ChevronDown className="w-3 h-3" />
                </button>
 
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                      {session.user.email}
                    </div>
                    <button
                      onClick={() => {
                        router.push('/mypage');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                    >
                      <User className="w-4 h-4" />
                      {t.profile.mypage}
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.header.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => router.push('/auth/signin')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm font-medium whitespace-nowrap">{t.header.login}</span>
              </button>
            )}
 
            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
 
        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <button
                onClick={() => {
                  router.push('/');
                  setIsMobileMenuOpen(false);
                }}
                className="text-left text-gray-600 hover:text-black transition-colors font-medium"
              >
                {t.navigation.home}
              </button>
              <button
                onClick={() => {
                  router.push('/guides');
                  setIsMobileMenuOpen(false);
                }}
                className="text-left text-gray-600 hover:text-black transition-colors font-medium"
              >
                {t.navigation.guides}
              </button>
              <button
                onClick={() => {
                  router.push('/about');
                  setIsMobileMenuOpen(false);
                }}
                className="text-left text-gray-600 hover:text-black transition-colors font-medium"
              >
                {t.navigation.about}
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}