import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Check, Globe, Users, Clock, BookOpen, MapPin, Heart } from 'lucide-react';
import { useApp, Language, UserPreferences } from '../App';

const languages = [
  { code: 'ko' as Language, name: '한국어', nativeName: '한국어', symbol: 'KO' },
  { code: 'en' as Language, name: 'English', nativeName: 'English', symbol: 'EN' },
  { code: 'ja' as Language, name: '日本語', nativeName: '日本語', symbol: 'JP' },
  { code: 'zh' as Language, name: '中文', nativeName: '中文', symbol: 'CN' },
  { code: 'es' as Language, name: 'Español', nativeName: 'Español', symbol: 'ES' }
];

const interests = [
  { name: '역사 & 문화', symbol: '⚱', value: 'history' },
  { name: '건축', symbol: '🏗', value: 'architecture' },
  { name: '음식 & 요리', symbol: '🍽', value: 'food' },
  { name: '자연 & 공원', symbol: '🌿', value: 'nature' },
  { name: '박물관', symbol: '🏛', value: 'museums' },
  { name: '종교 유적', symbol: '⛪', value: 'religious' },
  { name: '전통 시장', symbol: '🏪', value: 'markets' },
  { name: '스트리트 아트', symbol: '🎨', value: 'streetart' },
  { name: '사진 촬영', symbol: '📷', value: 'photography' },
  { name: '쇼핑', symbol: '🛍', value: 'shopping' }
];

const tourStyles = [
  { 
    value: 'storytelling', 
    title: '스토리텔링', 
    description: '흥미진진한 이야기로 들려주는 가이드',
    symbol: '📖',
    duration: '느긋하게'
  },
  { 
    value: 'facts', 
    title: '정보 중심', 
    description: '핵심 정보와 데이터 위주의 가이드',
    symbol: '📊',
    duration: '효율적으로'
  },
  { 
    value: 'interactive', 
    title: '인터랙티브', 
    description: '퀴즈와 활동이 포함된 참여형 가이드',
    symbol: '🎯',
    duration: '즐겁게'
  }
];

export default function OnboardingFlow() {
  const { setUserPreferences, setIsOnboarded, setCurrentScreen } = useApp();
  const [step, setStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('ko');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedTourStyle, setSelectedTourStyle] = useState('');

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      const preferences: UserPreferences = {
        language: selectedLanguage,
        interests: selectedInterests,
        ageGroup: 'adult',
        knowledgeLevel: 'intermediate',
        tourDuration: 'medium',
        tourStyle: selectedTourStyle
      };
      setUserPreferences(preferences);
      setIsOnboarded(true);
      setCurrentScreen('home');
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true;
      case 1: return selectedLanguage !== '';
      case 2: return selectedInterests.length > 0;
      case 3: return selectedTourStyle !== '';
      default: return false;
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest].slice(0, 5)
    );
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <div className="w-32 h-32 border-4 border-foreground rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-16 h-16" />
              </div>
              <div>
                <h1 className="text-3xl font-medium mb-3">NAVI에 오신 것을 환영합니다</h1>
                <p className="text-muted-foreground text-lg">
                  AI가 만드는 개인 맞춤형 오디오 여행 가이드
                </p>
                <div className="w-16 h-1 bg-foreground rounded-full mx-auto mt-4"></div>
              </div>
            </div>
            <div className="space-y-4 border border-border rounded-2xl p-6">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 border-2 border-foreground rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium">다국어 지원</p>
                  <p className="text-sm text-muted-foreground">5개 언어로 이용 가능</p>
                </div>
              </div>
              <div className="h-px bg-border"></div>
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 border-2 border-foreground rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium">AI 맞춤 생성</p>
                  <p className="text-sm text-muted-foreground">당신만의 개인화된 콘텐츠</p>
                </div>
              </div>
              <div className="h-px bg-border"></div>
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 border-2 border-foreground rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium">오프라인 이용</p>
                  <p className="text-sm text-muted-foreground">인터넷 없이도 청취 가능</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 border-2 border-foreground rounded-full flex items-center justify-center mx-auto">
                <Globe className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-medium">언어를 선택하세요</h2>
              <p className="text-muted-foreground">앱에서 사용할 언어를 선택해주세요</p>
            </div>
            <div className="space-y-3">
              {languages.map((lang) => (
                <Card
                  key={lang.code}
                  className={`cursor-pointer transition-all duration-200 border-2 ${
                    selectedLanguage === lang.code
                      ? 'border-foreground bg-muted/50'
                      : 'border-border hover:border-foreground'
                  }`}
                  onClick={() => setSelectedLanguage(lang.code)}
                >
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 border-2 border-border rounded-full flex items-center justify-center">
                        <span className="text-sm font-mono font-medium">{lang.symbol}</span>
                      </div>
                      <div>
                        <p className="font-medium text-lg">{lang.nativeName}</p>
                        <p className="text-sm text-muted-foreground">{lang.name}</p>
                      </div>
                    </div>
                    {selectedLanguage === lang.code && (
                      <div className="w-6 h-6 bg-foreground rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-background" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 border-2 border-foreground rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-medium">관심사를 선택하세요</h2>
              <p className="text-muted-foreground">어떤 주제에 관심이 있으신가요? (최대 5개)</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {interests.map((interest) => (
                <Card
                  key={interest.value}
                  className={`cursor-pointer transition-all duration-200 border-2 ${
                    selectedInterests.includes(interest.value)
                      ? 'border-foreground bg-muted/50'
                      : 'border-border hover:border-foreground'
                  }`}
                  onClick={() => toggleInterest(interest.value)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 border-2 border-border rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">{interest.symbol}</span>
                    </div>
                    <p className="font-medium text-sm">{interest.name}</p>
                    {selectedInterests.includes(interest.value) && (
                      <div className="w-5 h-5 bg-foreground rounded-full flex items-center justify-center mx-auto mt-2">
                        <Check className="w-3 h-3 text-background" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                선택된 관심사: {selectedInterests.length}/5
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 border-2 border-foreground rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-medium">가이드 스타일을 선택하세요</h2>
              <p className="text-muted-foreground">어떤 방식의 가이드를 선호하시나요?</p>
            </div>
            <div className="space-y-4">
              {tourStyles.map((style) => (
                <Card
                  key={style.value}
                  className={`cursor-pointer transition-all duration-200 border-2 ${
                    selectedTourStyle === style.value
                      ? 'border-foreground bg-muted/50'
                      : 'border-border hover:border-foreground'
                  }`}
                  onClick={() => setSelectedTourStyle(style.value)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 border-2 border-border rounded-full flex items-center justify-center">
                          <span className="text-3xl">{style.symbol}</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{style.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{style.description}</p>
                          <Badge variant="outline" className="text-xs border-border">
                            {style.duration}
                          </Badge>
                        </div>
                      </div>
                      {selectedTourStyle === style.value && (
                        <div className="w-6 h-6 bg-foreground rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-background" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Progress Bar */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">
            {step + 1} / {totalSteps}
          </span>
          <span className="text-sm font-medium">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full">
          <div 
            className="h-full bg-foreground rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6">
        <div className="max-w-md mx-auto">
          {renderStep()}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 border-t border-border">
        <div className="flex gap-3 max-w-md mx-auto">
          {step > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setStep(step - 1)}
              className="flex-1 py-6 border-border"
              size="lg"
            >
              이전
            </Button>
          )}
          <Button 
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 py-6 bg-foreground text-background hover:bg-foreground/90"
            size="lg"
          >
            {step === totalSteps - 1 ? '시작하기' : '다음'}
          </Button>
        </div>
      </div>
    </div>
  );
}