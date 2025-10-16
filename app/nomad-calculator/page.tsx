'use client';

import Link from 'next/link';
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronDown, Calculator, Globe, MapPin, Wifi, DollarSign, Coffee, Home, Plane, Users, TrendingUp, History, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

// UI Components needed for the new design
interface ButtonProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'default', size = 'md', className = '', onClick, children }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors';
  const variants = {
    default: 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-300',
    ghost: 'text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300',
    outline: 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300'
  };
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3'
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

interface CardProps {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className = '', onClick, children }) => {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm dark:shadow-xl transition-colors duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface BadgeProps {
  variant?: 'secondary';
  className?: string;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ variant = 'secondary', className = '', children }) => {
  const baseStyles = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';
  const variants = {
    secondary: 'bg-neutral-100 text-neutral-800'
  };
  
  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  max: number;
  min: number;
  step: number;
  className?: string;
}

const Slider: React.FC<SliderProps> = ({ value, onValueChange, max, min, step, className }) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange([parseInt(e.target.value)])}
      className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-custom ${className}`}
    />
  );
};
// TripRadio.AI 노마드 계산기 도시 데이터
interface CityData {
  id: string;
  name: string;
  country: string;
  nameKo: string;
  countryKo: string;
  nameJa?: string;
  countryJa?: string;
  nameZh?: string;
  countryZh?: string;
  nameEs?: string;
  countryEs?: string;
  accommodation: number;
  food: number;
  coworking: number;
  transport: number;
  entertainment: number;
  nomadScore: number;
  wifiSpeed: number;
  coworkingSpaces: number;
  visaFreeStay: number;
  costRange: string;
  highlights: string[];
  emoji: string;
}

const cities: CityData[] = [
  {
    id: 'lisbon',
    name: 'Lisbon',
    country: 'Portugal',
    nameKo: '리스본',
    countryKo: '포르투갈',
    nameJa: 'リスボン',
    countryJa: 'ポルトガル',
    nameZh: '里斯本',
    countryZh: '葡萄牙',
    nameEs: 'Lisboa',
    countryEs: 'Portugal',
    accommodation: 600,
    food: 525,
    coworking: 68,
    transport: 40,
    entertainment: 200,
    nomadScore: 9.2,
    wifiSpeed: 95,
    coworkingSpaces: 45,
    visaFreeStay: 90,
    costRange: '€1200-2000',
    highlights: [],
    emoji: '🏛️'
  },
  {
    id: 'berlin',
    name: 'Berlin',
    country: 'Germany',
    nameKo: '베르린',
    countryKo: '독일',
    nameJa: 'ベルリン',
    countryJa: 'ドイツ',
    nameZh: '柏林',
    countryZh: '德国',
    nameEs: 'Berlín',
    countryEs: 'Alemania',
    accommodation: 700,
    food: 550,
    coworking: 75,
    transport: 45,
    entertainment: 230,
    nomadScore: 9.0,
    wifiSpeed: 88,
    coworkingSpaces: 62,
    visaFreeStay: 90,
    costRange: '€1500-2500',
    highlights: [],
    emoji: '🍺'
  },
  {
    id: 'canggu',
    name: 'Canggu',
    country: 'Indonesia',
    nameKo: '창구',
    countryKo: '인도네시아',
    nameJa: 'チャングー',
    countryJa: 'インドネシア',
    nameZh: '昌古',
    countryZh: '印度尼西亚',
    nameEs: 'Canggu',
    countryEs: 'Indonesia',
    accommodation: 400,
    food: 200,
    coworking: 45,
    transport: 25,
    entertainment: 130,
    nomadScore: 8.8,
    wifiSpeed: 50,
    coworkingSpaces: 28,
    visaFreeStay: 30,
    costRange: '$800-1500',
    highlights: [],
    emoji: '🏄‍♂️'
  },
  {
    id: 'chiang-mai',
    name: 'Chiang Mai',
    country: 'Thailand',
    nameKo: '치앙마이',
    countryKo: '태국',
    nameJa: 'チェンマイ',
    countryJa: 'タイ',
    nameZh: '清迈',
    countryZh: '泰国',
    nameEs: 'Chiang Mai',
    countryEs: 'Tailandia',
    accommodation: 350,
    food: 180,
    coworking: 35,
    transport: 20,
    entertainment: 115,
    nomadScore: 8.5,
    wifiSpeed: 45,
    coworkingSpaces: 22,
    visaFreeStay: 30,
    costRange: '$600-1200',
    highlights: [],
    emoji: '🛺'
  },
  {
    id: 'ho-chi-minh',
    name: 'Ho Chi Minh',
    country: 'Vietnam',
    nameKo: '호치민',
    countryKo: '베트남',
    nameJa: 'ホーチミン市',
    countryJa: 'ベトナム',
    nameZh: '胡志明市',
    countryZh: '越南',
    nameEs: 'Ciudad Ho Chi Minh',
    countryEs: 'Vietnam',
    accommodation: 380,
    food: 220,
    coworking: 40,
    transport: 25,
    entertainment: 135,
    nomadScore: 8.3,
    wifiSpeed: 55,
    coworkingSpaces: 18,
    visaFreeStay: 15,
    costRange: '$700-1300',
    highlights: [],
    emoji: '🍜'
  },
  {
    id: 'mexico-city',
    name: 'Mexico City',
    country: 'Mexico',
    nameKo: '멕시코시티',
    countryKo: '멕시코',
    nameJa: 'メキシコシティ',
    countryJa: 'メキシコ',
    nameZh: '墨西哥城',
    countryZh: '墨西哥',
    nameEs: 'Ciudad de México',
    countryEs: 'México',
    accommodation: 450,
    food: 280,
    coworking: 55,
    transport: 30,
    entertainment: 185,
    nomadScore: 8.4,
    wifiSpeed: 65,
    coworkingSpaces: 35,
    visaFreeStay: 180,
    costRange: '$900-1600',
    highlights: [],
    emoji: '🌮'
  }
];

export default function NomadCalculatorPage() {
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { data: session } = useSession();
  const router = useRouter();
  
  const [selectedCity, setSelectedCity] = useState<CityData>(cities[0]);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState<boolean>(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const [workingDays, setWorkingDays] = useState<number[]>([22]);
  const [coworkingUsage, setCoworkingUsage] = useState<number[]>([10]);
  const [accommodationType, setAccommodationType] = useState<string>('apartment');
  const [diningOut, setDiningOut] = useState<number[]>([15]);
  const [entertainmentLevel, setEntertainmentLevel] = useState<number[]>([50]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const accommodationMultiplier = accommodationType === 'apartment' ? 1 : 
                                  accommodationType === 'shared' ? 0.6 : 
                                  accommodationType === 'hotel' ? 1.4 : 1;

  const calculateTotal = () => {
    const accommodation = selectedCity.accommodation * accommodationMultiplier;
    const food = selectedCity.food * (diningOut[0] / 15);
    const coworking = (selectedCity.coworking / 10) * coworkingUsage[0];
    const transport = selectedCity.transport;
    const entertainment = selectedCity.entertainment * (entertainmentLevel[0] / 50);

    return Math.round(accommodation + food + coworking + transport + entertainment);
  };

  const totalCost = calculateTotal();

  const tips = [
    {
      icon: Calculator
    },
    {
      icon: Users
    },
    {
      icon: Plane
    }
  ];

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <>
      <KeywordPageSchema 
        keyword={t('tools.nomadCalculator.meta.keyword') as string}
        pagePath="/nomad-calculator"
        title={t('tools.nomadCalculator.meta.title') as string}
        description={t('tools.nomadCalculator.meta.description') as string}
        features={Array.isArray(t('tools.nomadCalculator.meta.features')) ? t('tools.nomadCalculator.meta.features') as string[] : []}
      />
      
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
        {/* Custom Slider Styles */}
        <style jsx global>{`
          .slider-custom::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #0a0a0a;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .slider-custom::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #0a0a0a;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .glass-effect {
            backdrop-filter: blur(20px);
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(229, 231, 235, 0.2);
          }
        `}</style>
        {/* Header */}
        <header className="sticky top-0 z-50 w-full glass-effect">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center space-x-2 text-gray-400 hover:text-black" 
                onClick={handleBackToHome}
              >
                <ArrowLeft size={16} />
                <span className="text-sm">{t('tools.nomadCalculator.header.goBack')}</span>
              </Button>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <h1 className="text-xl font-bold text-black hidden sm:block">TripRadio.AI</h1>
              </div>

              <div className="flex items-center space-x-4">
                {/* 다국어 드롭다운 */}
                <div className="relative" ref={languageDropdownRef}>
                  <button 
                    onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-black"
                  >
                    <Globe size={16} />
                    <span>
                      {currentLanguage === 'ko' && '한국어'}
                      {currentLanguage === 'en' && 'English'}
                      {currentLanguage === 'ja' && '日本語'}
                      {currentLanguage === 'zh' && '中文'}
                      {currentLanguage === 'es' && 'Español'}
                    </span>
                    <ChevronDown size={12} />
                  </button>
                  {showLanguageDropdown && (
                    <div className="absolute right-0 mt-2 py-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setShowLanguageDropdown(false);
                          }}
                          className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-50 ${
                            currentLanguage === lang.code ? 'text-blue-600 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {lang.nativeName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 히스토리 버튼 */}
                <button 
                  onClick={() => router.push('/history')}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-black"
                >
                  <History size={16} />
                  <span>{t('tools.nomadCalculator.header.history')}</span>
                </button>

                {/* 로그인/로그아웃 버튼 */}
                {session ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {session.user?.name || session.user?.email}
                    </span>
                    <button 
                      onClick={() => signOut()}
                      className="text-sm text-gray-600 hover:text-black"
                    >
                      {t('tools.nomadCalculator.header.signOut')}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => signIn()}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-black"
                  >
                    <User size={16} />
                    <span>{t('tools.nomadCalculator.header.signIn')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge variant="secondary" className="mb-6 bg-neutral-100 text-neutral-800">
              {t('tools.nomadCalculator.badgeText')}
            </Badge>
            
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-6">
              {t('tools.nomadCalculator.mainTitle')}
            </h1>
            
            <p className="text-sm text-neutral-600 max-w-2xl mx-auto">
              {t('tools.nomadCalculator.subtitle')}
            </p>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Settings Panel */}
              <Card className="p-8 bg-white border-gray-200">
                <h2 className="text-2xl font-semibold text-black mb-6">{t('tools.nomadCalculator.settingsTitle')}</h2>
                
                <div className="space-y-6">
                  {/* City Selection */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">{t('tools.nomadCalculator.selectCity')}</label>
                    <div className="relative">
                      <select
                        value={selectedCity.id}
                        onChange={(e) => setSelectedCity(cities.find(c => c.id === e.target.value) || cities[0])}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white"
                      >
                        {cities.map((city) => {
                          let cityName = city.name;
                          let countryName = city.country;
                          
                          switch(currentLanguage) {
                            case 'ko':
                              cityName = city.nameKo;
                              countryName = city.countryKo;
                              break;
                            case 'ja':
                              cityName = city.nameJa || city.name;
                              countryName = city.countryJa || city.country;
                              break;
                            case 'zh':
                              cityName = city.nameZh || city.name;
                              countryName = city.countryZh || city.country;
                              break;
                            case 'es':
                              cityName = city.nameEs || city.name;
                              countryName = city.countryEs || city.country;
                              break;
                            default:
                              cityName = city.name;
                              countryName = city.country;
                          }
                          
                          return (
                            <option key={city.id} value={city.id}>
                              {cityName}, {countryName}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* Working Days */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {t('tools.nomadCalculator.workingDays')} ({workingDays[0]}{t('tools.nomadCalculator.daysMonth')})
                    </label>
                    <Slider
                      value={workingDays}
                      onValueChange={setWorkingDays}
                      max={30}
                      min={10}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Coworking Usage */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {t('tools.nomadCalculator.coworkingUsage')} ({coworkingUsage[0]}{t('tools.nomadCalculator.daysMonth')})
                    </label>
                    <Slider
                      value={coworkingUsage}
                      onValueChange={setCoworkingUsage}
                      max={25}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Accommodation Type */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">{t('tools.nomadCalculator.accommodationType')}</label>
                    <div className="relative">
                      <select
                        value={accommodationType}
                        onChange={(e) => setAccommodationType(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white"
                      >
                        <option value="apartment">{t('tools.nomadCalculator.apartment')}</option>
                        <option value="shared">{t('tools.nomadCalculator.shared')}</option>
                        <option value="hotel">{t('tools.nomadCalculator.hotel')}</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* Dining Out */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {t('tools.nomadCalculator.diningOut')} ({diningOut[0]}{t('tools.nomadCalculator.timesWeek')})
                    </label>
                    <Slider
                      value={diningOut}
                      onValueChange={setDiningOut}
                      max={21}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Entertainment Level */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {t('tools.nomadCalculator.entertainmentLevel')} ({entertainmentLevel[0]}%)
                    </label>
                    <Slider
                      value={entertainmentLevel}
                      onValueChange={setEntertainmentLevel}
                      max={100}
                      min={0}
                      step={10}
                      className="w-full"
                    />
                  </div>
                </div>
              </Card>

              {/* Results Panel */}
              <Card className="p-8 bg-white border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-black">{t('tools.nomadCalculator.resultsTitle')}</h2>
                  <div className="text-right">
                    <p className="text-sm text-neutral-500">
                      {(() => {
                        switch(currentLanguage) {
                          case 'ko':
                            return `${selectedCity.nameKo}, ${selectedCity.countryKo}`;
                          case 'ja':
                            return `${selectedCity.nameJa || selectedCity.name}, ${selectedCity.countryJa || selectedCity.country}`;
                          case 'zh':
                            return `${selectedCity.nameZh || selectedCity.name}, ${selectedCity.countryZh || selectedCity.country}`;
                          case 'es':
                            return `${selectedCity.nameEs || selectedCity.name}, ${selectedCity.countryEs || selectedCity.country}`;
                          default:
                            return `${selectedCity.name}, ${selectedCity.country}`;
                        }
                      })()}
                    </p>
                    <p className="text-3xl font-bold text-black">${totalCost}/month</p>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-neutral-600">{t('tools.nomadCalculator.accommodation')}</span>
                    <span className="font-medium text-black">${Math.round(selectedCity.accommodation * accommodationMultiplier)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-neutral-600">{t('tools.nomadCalculator.food')}</span>
                    <span className="font-medium text-black">${Math.round(selectedCity.food * (diningOut[0] / 15))}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-neutral-600">{t('tools.nomadCalculator.coworking')}</span>
                    <span className="font-medium text-black">${Math.round((selectedCity.coworking / 10) * coworkingUsage[0])}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-neutral-600">{t('tools.nomadCalculator.transport')}</span>
                    <span className="font-medium text-black">${selectedCity.transport}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-neutral-600">{t('tools.nomadCalculator.entertainment')}</span>
                    <span className="font-medium text-black">${Math.round(selectedCity.entertainment * (entertainmentLevel[0] / 50))}</span>
                  </div>
                </div>

                {/* City Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-black mb-4">{t('tools.nomadCalculator.cityInfo')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-500">{t('tools.nomadCalculator.nomadScore')}</p>
                      <p className="font-medium text-black">{selectedCity.nomadScore}/10</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">{t('tools.nomadCalculator.wifiSpeed')}</p>
                      <p className="font-medium text-black">{selectedCity.wifiSpeed}Mbps</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">{t('tools.nomadCalculator.coworkingSpaces')}</p>
                      <p className="font-medium text-black">{selectedCity.coworkingSpaces} {t('tools.nomadCalculator.locationsUnit')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">{t('tools.nomadCalculator.visaFreeStay')}</p>
                      <p className="font-medium text-black">{selectedCity.visaFreeStay} {t('tools.nomadCalculator.daysUnit')}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Popular Cities Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-black mb-4">{t('tools.nomadCalculator.citiesTitle')}</h2>
              <p className="text-xl text-neutral-600">{t('tools.nomadCalculator.citiesSubtitle')}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city) => {
                let cityName = city.name;
                let countryName = city.country;
                
                switch(currentLanguage) {
                  case 'ko':
                    cityName = city.nameKo;
                    countryName = city.countryKo;
                    break;
                  case 'ja':
                    cityName = city.nameJa || city.name;
                    countryName = city.countryJa || city.country;
                    break;
                  case 'zh':
                    cityName = city.nameZh || city.name;
                    countryName = city.countryZh || city.country;
                    break;
                  case 'es':
                    cityName = city.nameEs || city.name;
                    countryName = city.countryEs || city.country;
                    break;
                  default:
                    cityName = city.name;
                    countryName = city.country;
                    break;
                }
                
                return (
                <Card 
                  key={city.id} 
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    selectedCity.id === city.id ? 'ring-2 ring-black' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedCity(city)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-black flex items-center space-x-2">
                        <span className="text-2xl">{city.emoji}</span>
                        <span>{cityName}</span>
                      </h3>
                      <p className="text-sm text-neutral-600">{countryName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neutral-500">{t('tools.nomadCalculator.monthlyCost')}</p>
                      <p className="font-bold text-black">{city.costRange}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {[1, 2, 3].map((index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-neutral-400 rounded-full"></div>
                        <span className="text-sm text-neutral-600">
                          {t(`tools.nomadCalculator.cities.${city.id}.highlight${index}` as any)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">{t('tools.nomadCalculator.nomadScore')}: {city.nomadScore}/10</span>
                      <span className="text-neutral-500">{t('tools.nomadCalculator.wifiAverage')}: {city.wifiSpeed}Mbps</span>
                    </div>
                  </div>
                </Card>
              )})}
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-black mb-4">{t('tools.nomadCalculator.tipsTitle')}</h2>
              <p className="text-xl text-neutral-600">{t('tools.nomadCalculator.tipsSubtitle')}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {tips.map((tip, index) => (
                <Card key={index} className="p-8 bg-white border-gray-200 text-center">
                  <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <tip.icon className="w-6 h-6 text-neutral-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-4">{t(`tools.nomadCalculator.tip${index + 1}Title`)}</h3>
                  <p className="text-neutral-600 leading-relaxed">{t(`tools.nomadCalculator.tip${index + 1}Description`)}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-black text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('tools.nomadCalculator.ctaTitle')}
            </h2>
            
            <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
              {t('tools.nomadCalculator.ctaSubtitle')}
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-black" />
                </div>
                <h3 className="font-medium text-white mb-2">{t('tools.nomadCalculator.feature1Title')}</h3>
                <p className="text-sm text-neutral-300">
                  {t('tools.nomadCalculator.feature1Description')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-black" />
                </div>
                <h3 className="font-medium text-white mb-2">{t('tools.nomadCalculator.feature2Title')}</h3>
                <p className="text-sm text-neutral-300">
                  {t('tools.nomadCalculator.feature2Description')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-black" />
                </div>
                <h3 className="font-medium text-white mb-2">{t('tools.nomadCalculator.feature3Title')}</h3>
                <p className="text-sm text-neutral-300">
                  {t('tools.nomadCalculator.feature3Description')}
                </p>
              </div>
            </div>

            <Button
              onClick={handleBackToHome}
              className="bg-white text-black px-8 py-3 rounded-full text-lg font-medium hover:bg-gray-100 transition-colors"
            >
              {t('tools.nomadCalculator.ctaButton')}
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}