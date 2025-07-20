import React from 'react';
import { Button } from './ui/button';
import { Home, Search, BookOpen, User } from 'lucide-react';
import { useApp, useTranslation, Screen } from '../App';

const navigationItems = [
  {
    id: 'home' as Screen,
    icon: Home,
    labelKey: 'home',
    label: '홈'
  },
  {
    id: 'guide' as Screen,
    icon: BookOpen,
    labelKey: 'guide',
    label: '가이드'
  },
  {
    id: 'profile' as Screen,
    icon: User,
    labelKey: 'profile',
    label: '프로필'
  }
];

export default function BottomNavigation() {
  const { currentScreen, setCurrentScreen, currentGuide, isPlaying } = useApp();
  const { t, language } = useTranslation();

  const getLabel = (item: any) => {
    if (language === 'ko') {
      return item.label;
    }
    return t[item.labelKey as keyof typeof t];
  };

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur-sm safe-area-inset-bottom">
      <div className="flex items-center justify-around px-4 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          const isGuideDisabled = item.id === 'guide' && !currentGuide;
          
          return (
            <button
              key={item.id}
              className={`flex flex-col items-center gap-2 py-3 px-6 flex-1 transition-all duration-300 rounded-2xl ${
                isActive 
                  ? 'text-foreground bg-foreground/5' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
              } ${isGuideDisabled ? 'opacity-50' : ''}`}
              onClick={() => !isGuideDisabled && setCurrentScreen(item.id)}
              disabled={isGuideDisabled}
            >
              <div className="relative">
                {/* 기하학적 디자인 아이콘 컨테이너 */}
                <div className={`
                  w-8 h-8 border-2 rounded-lg flex items-center justify-center transition-all duration-300
                  ${isActive 
                    ? 'border-foreground bg-foreground text-background' 
                    : 'border-border hover:border-foreground'
                  }
                `}>
                  <Icon className="w-4 h-4" />
                </div>
                
                {/* 가이드 재생 상태 표시 */}
                {item.id === 'guide' && currentGuide && isPlaying && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-foreground rounded-full animate-pulse">
                    <div className="absolute inset-0.5 bg-background rounded-full" />
                  </div>
                )}
              </div>
              
              <span className={`text-xs leading-none transition-all duration-300 ${
                isActive ? 'text-foreground font-semibold' : 'font-medium'
              }`}>
                {getLabel(item)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}