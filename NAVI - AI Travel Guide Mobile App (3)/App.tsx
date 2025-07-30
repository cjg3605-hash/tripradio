import React, { useState, createContext, useContext } from 'react';
import OnboardingFlow from './components/OnboardingFlow';
import HomeScreen from './components/HomeScreen';
import LocationSearch from './components/LocationSearch';
import GuideViewer from './components/GuideViewer';
import AudioPlayer from './components/AudioPlayer';
import ProfileSettings from './components/ProfileSettings';
import BottomNavigation from './components/BottomNavigation';

export type Language = 'en' | 'ko' | 'ja' | 'zh' | 'es';
export type Screen = 'onboarding' | 'home' | 'search' | 'guide' | 'audio' | 'profile';

export interface UserPreferences {
  interests: string[];
  ageGroup: string;
  knowledgeLevel: string;
  tourDuration: string;
  tourStyle: string;
  language: Language;
}

export interface Guide {
  id: string;
  location: string;
  overview: {
    title: string;
    description: string;
    highlights: string[];
    duration: string;
    difficulty: string;
  };
  notice: {
    visitingHours: string;
    admissionFee: string;
    tips: string[];
    warnings: string[];
  };
  route: {
    waypoints: Array<{
      name: string;
      description: string;
      coordinates: [number, number];
      estimatedTime: string;
    }>;
  };
  audioChapters: Array<{
    id: string;
    title: string;
    duration: string;
    transcript: string;
  }>;
}

interface AppContextType {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  userPreferences: UserPreferences | null;
  setUserPreferences: (preferences: UserPreferences) => void;
  currentGuide: Guide | null;
  setCurrentGuide: (guide: Guide | null) => void;
  isOnboarded: boolean;
  setIsOnboarded: (onboarded: boolean) => void;
  currentAudioChapter: number;
  setCurrentAudioChapter: (chapter: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

const translations = {
  en: {
    appName: 'NAVI',
    home: 'Home',
    explore: 'Explore',
    guide: 'Guide',
    profile: 'Profile'
  },
  ko: {
    appName: 'NAVI',
    home: '홈',
    explore: '탐색',
    guide: '가이드',
    profile: '프로필'
  },
  ja: {
    appName: 'NAVI',
    home: 'ホーム',
    explore: '探索',
    guide: 'ガイド',
    profile: 'プロフィール'
  },
  zh: {
    appName: 'NAVI',
    home: '首页',
    explore: '探索',
    guide: '导游',
    profile: '个人资料'
  },
  es: {
    appName: 'NAVI',
    home: 'Inicio',
    explore: 'Explorar',
    guide: 'Guía',
    profile: 'Perfil'
  }
};

export const useTranslation = () => {
  const { userPreferences } = useApp();
  const language = userPreferences?.language || 'en';
  return {
    t: translations[language],
    language
  };
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [currentGuide, setCurrentGuide] = useState<Guide | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [currentAudioChapter, setCurrentAudioChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const contextValue: AppContextType = {
    currentScreen,
    setCurrentScreen,
    userPreferences,
    setUserPreferences,
    currentGuide,
    setCurrentGuide,
    isOnboarded,
    setIsOnboarded,
    currentAudioChapter,
    setCurrentAudioChapter,
    isPlaying,
    setIsPlaying
  };

  const renderScreen = () => {
    if (!isOnboarded) {
      return <OnboardingFlow />;
    }

    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'search':
        return <LocationSearch />;
      case 'guide':
        return <GuideViewer />;
      case 'audio':
        return <AudioPlayer />;
      case 'profile':
        return <ProfileSettings />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        <main className="flex-1 overflow-hidden">
          {renderScreen()}
        </main>
        {isOnboarded && <BottomNavigation />}
      </div>
    </AppContext.Provider>
  );
}