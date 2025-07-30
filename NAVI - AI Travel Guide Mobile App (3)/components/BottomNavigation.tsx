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
    id: 'search' as Screen,
    icon: Search,
    labelKey: 'explore',
    label: '탐색'
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
    <div className="border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-around px-2 py-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          const isGuideDisabled = item.id === 'guide' && !currentGuide;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`flex flex-col items-center gap-1 h-auto py-3 px-4 flex-1 max-w-20 transition-all duration-200 ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              } ${isGuideDisabled ? 'opacity-50' : ''}`}
              onClick={() => !isGuideDisabled && setCurrentScreen(item.id)}
              disabled={isGuideDisabled}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : ''}`} />
                {item.id === 'guide' && currentGuide && isPlaying && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse">
                    <div className="absolute inset-0.5 bg-background rounded-full" />
                    <div className="absolute inset-1 bg-primary rounded-full animate-ping" />
                  </div>
                )}
              </div>
              <span className={`text-xs leading-none ${
                isActive ? 'text-primary font-medium' : ''
              }`}>
                {getLabel(item)}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}