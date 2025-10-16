'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  enableSystem = true
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || defaultTheme;
    }
    return defaultTheme;
  });
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  // 시스템 테마 감지
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // 테마 해결 (system -> light/dark)
  const resolveTheme = (theme: Theme): ResolvedTheme => {
    if (theme === 'system') {
      return getSystemTheme();
    }
    return theme;
  };

  // DOM에 테마 클래스 적용
  const applyTheme = (resolved: ResolvedTheme) => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      
      // 기존 테마 클래스 제거
      root.classList.remove('light', 'dark');
      
      // 새 테마 클래스 추가
      root.classList.add(resolved);
      
      // CSS 변수 설정 (선택사항)
      root.style.setProperty('--theme', resolved);
      
      setResolvedTheme(resolved);
    }
  };

  // 테마 설정 함수
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // 로컬스토리지에 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
    
    // 테마 적용
    const resolved = resolveTheme(newTheme);
    applyTheme(resolved);
  };

  // 테마 토글 함수 (light → dark → system → light)
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  // 초기 테마 적용 및 시스템 테마 변경 감지
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const resolved = resolveTheme(theme);
    applyTheme(resolved);

    // 시스템 테마 변경 감지 (system 모드일 때만)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        const newResolved = getSystemTheme();
        applyTheme(newResolved);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    setMounted(true);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);


  // 하이드레이션 불일치 방지
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // 기본값 반환 (클라이언트 사이드에서도 안전하게 처리)
    return {
      theme: 'system' as Theme,
      resolvedTheme: 'light' as ResolvedTheme,
      setTheme: () => {},
      toggleTheme: () => {}
    };
  }
  return context;
}

// 편의 함수들
export const getThemeFromStorage = (): Theme => {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem('theme') as Theme) || 'system';
};

export const isSystemDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};