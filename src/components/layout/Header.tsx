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
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useLanguage, type SupportedLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
  onSidebarToggle?: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' }
];

export default function Header({ onSidebarToggle }: HeaderProps) {
  const [user, setUser] = useState<SupabaseUser | null | undefined>(undefined);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { currentLanguage, setLanguage } = useLanguage();

  // Scroll detection for header blur effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load user data
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
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

  const handleLanguageChange = (langCode: string) => {
    // SupportedLanguage 타입인지 검증
    if (['ko', 'en', 'ja', 'zh', 'es'].includes(langCode)) {
      setLanguage(langCode as SupportedLanguage);
      setIsLanguageMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsProfileMenuOpen(false);
    router.push('/');
  };

  const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <header className={`
      sticky top-0 z-50 transition-all duration-300
      ${scrolled 
        ? 'bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm' 
        : 'bg-white border-b border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 좌측: 로고와 NAVI GUIDE */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
              
              {/* NAVI GUIDE - 스피커에 70% 더 가깝게, 단어 간격 반으로 축소 */}
              <h1 className="text-xl font-bold text-gray-900 ml-3" style={{ letterSpacing: '-0.5px' }}>
                NAVI<span className="ml-1">GUIDE</span>
              </h1>
            </Link>
          </div>

          {/* 우측: 네비게이션 버튼들 */}
          <div className="flex items-center gap-1 -mr-2">
            {/* 언어 선택 */}
            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">{currentLang.flag}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3 ${
                        currentLanguage === lang.code ? 'bg-gray-50 text-indigo-600' : 'text-gray-700'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 검색 기록 */}
            <button
              onClick={onSidebarToggle}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <History className="w-4 h-4" />
            </button>

            {/* 로그인/프로필 */}
            {user === undefined ? (
              // 로딩 중
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              // 로그인된 사용자
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
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
                      {user.email}
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
                onClick={() => router.push('/login')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm font-medium">로그인</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}