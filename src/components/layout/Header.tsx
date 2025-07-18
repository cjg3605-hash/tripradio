'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Globe, 
  LogIn, 
  LogOut, 
  User, 
  History, 
  ChevronDown,
  Volume2
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage, type SupportedLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
  onSidebarToggle?: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '중문', flag: '🇨🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' }
];

export default function Header({ onSidebarToggle }: HeaderProps) {
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { currentLanguage, setLanguage } = useLanguage();
  
  // NextAuth 세션 사용
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status || 'loading';

  // Scroll detection for header blur effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
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

  const handleLanguageSelect = async (langCode: SupportedLanguage) => {
    await setLanguage(langCode);
    setIsLanguageMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: '/',
        redirect: false 
      });
      router.push('/');
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const currentLangConfig = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <header className={`
      sticky top-0 z-50 w-full border-b border-gray-200 shadow-sm transition-all duration-300
      ${scrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-md' 
        : 'bg-white'
      }
    `}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and title */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-md">
              <Volume2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              NAVI
            </span>
          </Link>

          {/* Right side - Language selector, History, Auth */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Language Selector */}
            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:block">
                  {currentLangConfig.nativeName}
                </span>
                <span className="text-lg sm:hidden">{currentLangConfig.flag}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code as SupportedLanguage)}
                      className={`
                        w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3 transition-colors
                        ${currentLanguage === lang.code ? 'bg-gray-50 text-blue-600' : 'text-gray-700'}
                      `}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-medium">{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* History Button */}
            <button
              onClick={onSidebarToggle}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <History className="w-4 h-4" />
              <span className="text-sm font-medium whitespace-nowrap hidden sm:block">기록</span>
            </button>

            {/* Authentication */}
            {status === 'loading' ? (
              // 로딩 중
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : session?.user ? (
              // 로그인된 사용자
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
                      마이페이지
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" />
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // 로그인 안된 사용자
              <button
                onClick={() => router.push('/auth/signin')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm font-medium whitespace-nowrap">로그인</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}