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
import { useLanguage } from '@/contexts/LanguageContext';

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

  // Click outside detection
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

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('로그인 오류:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsProfileMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <header className={`
      fixed top-0 w-full z-50 transition-all duration-500
      ${scrolled 
        ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-black/5' 
        : 'bg-white/95 backdrop-blur-sm'
      }
    `}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section - Enhanced */}
          <Link 
            href="/" 
            className="flex items-center gap-4 group transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              {/* Logo Icon */}
              <div className="w-12 h-12 bg-black rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:rotate-3">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-black rounded-2xl" />
                <div className="absolute inset-1 bg-white rounded-xl flex items-center justify-center">
                  <Volume2 className="w-6 h-6 text-black" />
                </div>
              </div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 w-12 h-12 bg-black/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
            
            {/* Brand Text */}
            <span className="text-2xl font-extralight text-black tracking-tight font-mono group-hover:tracking-wide transition-all duration-300">
            NAVI GUIDE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* Language Selector */}
            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:text-black rounded-xl hover:bg-gray-50 transition-all duration-200 group"
              >
                <Globe className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">{currentLang.flag} {currentLang.nativeName}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isLanguageMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Language Dropdown */}
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 py-2 z-50 animate-fadeIn">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setIsLanguageMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors duration-200 ${
                        currentLanguage === lang.code ? 'text-black bg-gray-100 font-medium' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile/Login */}
            {user === undefined ? (
              <div className="w-11 h-11 rounded-2xl bg-gray-200 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.user_metadata?.full_name || user.email}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="flex items-center gap-3 px-5 py-2.5 text-gray-600 hover:text-black bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium"
              >
                <LogIn className="w-5 h-5" />
                <span>로그인</span>
              </button>
            )}

            {/* History Sidebar Button */}
            {onSidebarToggle && (
              <button
                onClick={onSidebarToggle}
                className="p-2.5 text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl transition-all duration-200"
              >
                <History className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-3">
            
            {/* Language (Mobile) */}
            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="p-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-200"
              >
                <Globe className="w-5 h-5" />
              </button>

              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 py-2 z-50">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setIsLanguageMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-3 ${
                        currentLanguage === lang.code ? 'text-black bg-gray-100' : 'text-gray-700'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User (Mobile) */}
            {user === undefined ? (
              <div className="w-9 h-9 rounded-xl bg-gray-200 animate-pulse" />
            ) : user ? (
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="p-1.5 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                className="p-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors duration-200"
              >
                <LogIn className="w-5 h-5" />
              </button>
            )}

            {/* History (Mobile) */}
            {onSidebarToggle && (
              <button
                onClick={onSidebarToggle}
                className="p-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-200"
              >
                <History className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile Profile Menu */}
        {isProfileMenuOpen && user && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 animate-slideDown">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full text-left py-3 text-gray-700 flex items-center gap-3 hover:text-black transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        )}
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </header>
  );
}