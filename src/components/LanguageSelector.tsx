// 🌍 Phase 2: 다국어 지원 언어 선택 컴포넌트

'use client';

import React, { useState, useEffect } from 'react';
import { LANGUAGE_CONFIGS, getLanguageConfig } from '@/lib/ai/prompts/index';
// import { getSupportedLanguagesWithPersonality, getLanguagePersonalityMapping } from '@/lib/multilingual/multilingual-personality-system';

interface LanguageSelectorProps {
  selectedLanguage?: string;
  onLanguageChange?: (language: string) => void;
  showPersonalityInfo?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  ttsLang: string;
  hasPersonalitySupport: boolean;
  personalityFeatures?: string[];
}

/**
 * 🌍 다국어 지원 언어 선택 컴포넌트
 * Phase 2: 성격 기반 문화적 적응 정보 포함
 */
export default function LanguageSelector({
  selectedLanguage = 'ko',
  onLanguageChange,
  showPersonalityInfo = true,
  disabled = false,
  compact = false
}: LanguageSelectorProps) {
  
  const [isOpen, setIsOpen] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState<LanguageInfo[]>([]);
  const [selectedLangInfo, setSelectedLangInfo] = useState<LanguageInfo | null>(null);
  
  useEffect(() => {
    // 지원되는 언어 목록 구성 (임시 비활성화)
    // const languagesWithPersonality = getSupportedLanguagesWithPersonality();
    const languages: LanguageInfo[] = Object.values(LANGUAGE_CONFIGS).map(langConfig => {
      // const hasPersonalitySupport = languagesWithPersonality.includes(langConfig.code);
      // const personalityMapping = hasPersonalitySupport ? getLanguagePersonalityMapping(langConfig.code) : null;
      
      return {
        code: langConfig.code,
        name: langConfig.name,
        nativeName: langConfig.nativeName,
        flag: langConfig.flag,
        ttsLang: langConfig.ttsLang,
        hasPersonalitySupport: false, // 임시 비활성화
        personalityFeatures: [] // personalityMapping ? Object.keys(personalityMapping) : []
      };
    });
    
    setSupportedLanguages(languages);
    
    // 선택된 언어 정보 설정
    const selectedInfo = languages.find(lang => lang.code === selectedLanguage);
    setSelectedLangInfo(selectedInfo || languages[0]);
    
  }, [selectedLanguage]);
  
  const handleLanguageSelect = (languageCode: string) => {
    setIsOpen(false);
    if (onLanguageChange) {
      onLanguageChange(languageCode);
    }
  };
  
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };
  
  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={toggleDropdown}
          disabled={disabled}
          type="button"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={`언어 선택: 현재 ${selectedLangInfo?.nativeName}. 클릭하여 언어 변경`}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-md border
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
            ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'}
            ${isOpen ? 'ring-2 ring-blue-400' : 'ring-1 ring-gray-300'}
            transition-all duration-200
          `}
        >
          <span className="text-lg">{selectedLangInfo?.flag}</span>
          <span className="text-sm font-medium">{selectedLangInfo?.code.toUpperCase()}</span>
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div 
            className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-gray-300 z-50"
            role="listbox"
            aria-label="언어 선택 목록"
          >
            <div className="py-1">
              {supportedLanguages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  type="button"
                  role="option"
                  aria-selected={lang.code === selectedLanguage}
                  aria-label={`${lang.nativeName} 언어로 변경`}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 text-sm hover:bg-gray-50
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
                    ${lang.code === selectedLanguage ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                  `}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{lang.nativeName}</div>
                    {lang.hasPersonalitySupport && (
                      <div className="text-xs text-green-600">🎭 성격 적응</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          🌍 언어 선택
        </h3>
        <span className="text-xs text-gray-500">Phase 2</span>
      </div>
      
      {/* 현재 선택된 언어 표시 */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{selectedLangInfo?.flag}</span>
          <div>
            <div className="font-medium text-blue-800">{selectedLangInfo?.nativeName}</div>
            <div className="text-sm text-blue-600">{selectedLangInfo?.name}</div>
            {selectedLangInfo?.hasPersonalitySupport && (
              <div className="text-xs text-green-600 flex items-center mt-1">
                <span className="mr-1">🎭</span>
                성격 기반 문화적 적응 지원
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 언어 선택 드롭다운 */}
      <div className="relative">
        <button
          onClick={toggleDropdown}
          disabled={disabled}
          type="button"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={`언어 선택: 현재 ${selectedLangInfo?.nativeName}. 클릭하여 언어 변경`}
          className={`
            w-full flex items-center justify-between px-4 py-3 rounded-lg border
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
            ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'}
            ${isOpen ? 'ring-2 ring-blue-400 border-blue-400' : 'border-gray-300'}
            transition-all duration-200
          `}
        >
          <span className="text-sm font-medium">언어 변경</span>
          <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div 
            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg ring-1 ring-gray-300 z-50 max-h-80 overflow-y-auto"
            role="listbox"
            aria-label="언어 선택 목록"
          >
            <div className="py-2">
              {supportedLanguages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  type="button"
                  role="option"
                  aria-selected={lang.code === selectedLanguage}
                  aria-label={`${lang.nativeName} 언어로 변경`}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
                    ${lang.code === selectedLanguage ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                    transition-colors duration-150
                  `}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{lang.nativeName}</div>
                    <div className="text-sm text-gray-500">{lang.name}</div>
                    {lang.hasPersonalitySupport && (
                      <div className="flex items-center text-xs text-green-600 mt-1">
                        <span className="mr-1">🎭</span>
                        성격 적응 지원
                      </div>
                    )}
                  </div>
                  {lang.code === selectedLanguage && (
                    <svg 
                      className="w-5 h-5 text-blue-600" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Phase 2 기능 정보 */}
      {showPersonalityInfo && selectedLangInfo?.hasPersonalitySupport && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm text-green-800">
            <div className="font-medium mb-1">🎭 성격 기반 문화적 적응</div>
            <div className="text-xs text-green-700">
              • 사용자 성격에 맞는 언어 스타일 적용<br/>
              • 문화적 맥락을 고려한 콘텐츠 적응<br/>
              • 현지 커뮤니케이션 방식 반영
            </div>
          </div>
        </div>
      )}
      
      {/* 언어별 기능 지원 상태 */}
      <div className="mt-3 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>지원 언어</span>
          <span>{supportedLanguages.length}개</span>
        </div>
        <div className="flex items-center justify-between">
          <span>성격 적응</span>
          <span className="text-green-600">
            {supportedLanguages.filter(l => l.hasPersonalitySupport).length}개
          </span>
        </div>
      </div>
      
      {/* 디버그 정보 (개발 모드에서만) */}
      {process.env.NODE_ENV === 'development' && selectedLangInfo && (
        <details className="mt-3">
          <summary className="text-xs text-gray-400 cursor-pointer">디버그 정보</summary>
          <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded overflow-auto max-h-20">
            {JSON.stringify({
              selectedLanguage: selectedLangInfo.code,
              hasPersonalitySupport: selectedLangInfo.hasPersonalitySupport,
              personalityFeatures: selectedLangInfo.personalityFeatures,
              ttsSupport: selectedLangInfo.ttsLang
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

/**
 * 🔧 간단한 언어 선택 훅
 */
export function useLanguageSelector(initialLanguage: string = 'ko') {
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [isSupported, setIsSupported] = useState(true);
  
  useEffect(() => {
    // const supportedLanguages = getSupportedLanguagesWithPersonality();
    const langCode = selectedLanguage.slice(0, 2);
    // 임시로 모든 언어 지원
    setIsSupported(Object.keys(LANGUAGE_CONFIGS).includes(langCode));
  }, [selectedLanguage]);
  
  const changeLanguage = (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    console.log(`🌍 언어 변경: ${newLanguage}`);
  };
  
  return {
    selectedLanguage,
    changeLanguage,
    isSupported,
    getLanguageConfig: () => getLanguageConfig(selectedLanguage)
  };
}