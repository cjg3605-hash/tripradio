'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext';
// Public 폴더의 이미지는 직접 경로로 접근
const logoImage = '/navi.png';
import { 
  LogIn, 
  LogOut, 
  User, 
  ChevronDown, 
  Languages, 
  Menu, 
  X,
  History
} from 'lucide-react';

interface HeaderProps {
  onSidebarToggle?: () => void;
}

export function Header({ onSidebarToggle }: HeaderProps) {
  const { data: session, status } = useSession();
  const { currentLanguage, setLanguage, t, isLoading } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  // 현재 언어 정보 가져오기
  const getCurrentLanguageInfo = () => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  };

  const handleLanguageChange = async (languageCode: string) => {
    setIsLanguageMenuOpen(false);
    if (languageCode !== currentLanguage) {
      await setLanguage(languageCode as any);
    }
  };

  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };
  
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  // 모바일에서 메뉴 열렸을 때 스크롤 방지
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const currentLangInfo = getCurrentLanguageInfo();

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-0" onClick={() => setIsMenuOpen(false)}>
                <Image
                  src={logoImage}
                  alt="NAVI 로고"
                  width={50}
                  height={50}
                  className="object-contain -mr-1"
                  priority
                  onError={(e) => {
                    console.error('이미지 로드 실패:', e);
                    console.log('이미지 경로:', e.currentTarget.src);
                  }}
                />
                <span className="text-2xl font-bold">
                  <span className="text-indigo-600">N</span>
                  <span 
                    className="text-indigo-600 text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text font-extrabold"
                    style={{
                      textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      filter: 'drop-shadow(0 1px 2px rgba(139, 92, 246, 0.3))'
                    }}
                  >
                    A
                  </span>
                  <span className="text-indigo-600">V</span>
                  <span 
                    className="text-indigo-600 text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text font-extrabold"
                    style={{
                      textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      filter: 'drop-shadow(0 1px 2px rgba(139, 92, 246, 0.3))'
                    }}
                  >
                    I
                  </span>
                  <span className="text-gray-400">-</span>
                  <span className="text-indigo-600">GUIDE</span>
                </span>
              </Link>
            </div>
            
            {/* 데스크톱 메뉴 */}
            <div className="hidden md:flex items-center space-x-4">
              {/* 다국어 버튼 */}
              <div className="relative">
                <button
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-50"
                  disabled={isLoading}
                >
                  <Languages className="w-5 h-5" />
                  <span className="flex items-center gap-1">
                    <span>{currentLangInfo.flag}</span>
                    <span>{currentLangInfo.nativeName}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isLanguageMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isLanguageMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 ${
                          currentLanguage === lang.code ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 로그인/프로필 */}
              {status === 'loading' ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
              ) : session ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50"
                  >
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User profile'}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-600" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">{session.user?.name}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                      <Link 
                        href="/mypage" 
                        className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50" 
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" /> 마이페이지
                      </Link>
                      <button 
                        onClick={handleSignOut} 
                        className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" /> {t.header.logout}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t.header.login}</span>
                </button>
              )}
            </div>

            {/* 모바일 메뉴 */}
            <div className="md:hidden flex items-center space-x-2">
              {/* 다국어 버튼 (모바일) */}
              <div className="relative">
                <button
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  disabled={isLoading}
                >
                  <span className="text-lg">{currentLangInfo.flag}</span>
                </button>
                
                {isLanguageMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm ${
                          currentLanguage === lang.code ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 로그인/프로필 (모바일) */}
              {status === 'loading' ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
              ) : session ? (
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="p-1 rounded-lg hover:bg-gray-50"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User profile'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                >
                  <LogIn className="w-5 h-5" />
                </button>
              )}

              {/* 히스토리 사이드바 버튼 */}
              <button
                onClick={onSidebarToggle}
                className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <History className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* 모바일 프로필 메뉴 */}
        {isProfileMenuOpen && session && (
          <div className="md:hidden bg-white border-t border-gray-200 py-3 px-4">
            <div className="flex items-center gap-3 mb-4">
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User profile'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{session.user?.name}</p>
                <p className="text-sm text-gray-500">{session.user?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Link 
                href="/mypage" 
                className="flex items-center w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg" 
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <User className="w-4 h-4 mr-3" /> 마이페이지
              </Link>
              <button 
                onClick={handleSignOut} 
                className="flex items-center w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <LogOut className="w-4 h-4 mr-3" /> {t.header.logout}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 오버레이 */}
      {(isLanguageMenuOpen || isProfileMenuOpen) && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-20"
          onClick={() => {
            setIsLanguageMenuOpen(false);
            setIsProfileMenuOpen(false);
          }}
        />
      )}
    </>
  );
} 