"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    // 쿠키 동의 여부 확인
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // 페이지 로드 후 1초 뒤에 표시 (UX 개선)
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent', 'all');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setIsVisible(false);

    // Google Analytics 동의 설정
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted'
      });
    }
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem('cookie-consent', 'necessary');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setIsVisible(false);

    // Google Analytics 동의 거부
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
    }
  };

  if (!isVisible) return null;

  const content = {
    ko: {
      title: '🍪 쿠키 사용 안내',
      message: '트립라디오AI는 서비스 개선과 맞춤형 광고 제공을 위해 쿠키를 사용합니다. 쿠키 사용에 동의하시면 더 나은 사용자 경험을 제공받으실 수 있습니다.',
      acceptAll: '모두 수락',
      acceptNecessary: '필수만 허용',
      learnMore: '자세히 보기',
      cookiePolicyLink: '/legal/cookie-policy?lang=ko',
    },
    en: {
      title: '🍪 Cookie Notice',
      message: 'TripRadio.AI uses cookies to improve services and provide personalized advertising. By accepting cookies, you can receive a better user experience.',
      acceptAll: 'Accept All',
      acceptNecessary: 'Necessary Only',
      learnMore: 'Learn More',
      cookiePolicyLink: '/legal/cookie-policy?lang=en',
    },
    ja: {
      title: '🍪 Cookieのお知らせ',
      message: 'TripRadio.AIは、サービスの改善とパーソナライズされた広告の提供のためにクッキーを使用しています。',
      acceptAll: 'すべて許可',
      acceptNecessary: '必須のみ',
      learnMore: '詳細',
      cookiePolicyLink: '/legal/cookie-policy?lang=en',
    },
    zh: {
      title: '🍪 Cookie通知',
      message: 'TripRadio.AI使用Cookie来改进服务并提供个性化广告。',
      acceptAll: '全部接受',
      acceptNecessary: '仅必需',
      learnMore: '了解更多',
      cookiePolicyLink: '/legal/cookie-policy?lang=en',
    },
    es: {
      title: '🍪 Aviso de Cookies',
      message: 'TripRadio.AI utiliza cookies para mejorar los servicios y proporcionar publicidad personalizada.',
      acceptAll: 'Aceptar todo',
      acceptNecessary: 'Solo necesarias',
      learnMore: 'Más información',
      cookiePolicyLink: '/legal/cookie-policy?lang=en',
    }
  };

  const lang = currentLanguage as keyof typeof content || 'ko';
  const text = content[lang] || content.ko;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-700 shadow-2xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* 메시지 섹션 */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              {text.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
              {text.message}
              {' '}
              <a
                href={text.cookiePolicyLink}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                {text.learnMore}
              </a>
            </p>
          </div>

          {/* 버튼 섹션 */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handleAcceptNecessary}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-gray-400"
            >
              {text.acceptNecessary}
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-lg"
            >
              {text.acceptAll}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
