'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Smartphone } from 'lucide-react';

export default function Footer() {
  const { t, currentLanguage } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* 브랜드 */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              TripRadio.AI
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentLanguage === 'ko'
                ? 'AI가 만드는 나만의 여행 오디오가이드'
                : 'Your Personal AI Travel Audio Guide'}
            </p>
          </div>

          {/* 서비스 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              {currentLanguage === 'ko' ? '서비스' : 'Services'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/guide" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {currentLanguage === 'ko' ? '여행가이드' : 'Travel Guide'}
                </Link>
              </li>
              <li>
                <Link href="/podcast" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {currentLanguage === 'ko' ? '팟캐스트' : 'Podcast'}
                </Link>
              </li>
              <li>
                <Link href="/tour-radio" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {currentLanguage === 'ko' ? '투어라디오' : 'Tour Radio'}
                </Link>
              </li>
            </ul>
          </div>

          {/* 정보 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              {currentLanguage === 'ko' ? '정보' : 'Information'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {currentLanguage === 'ko' ? '개인정보 처리방침' : 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {currentLanguage === 'ko' ? '이용약관' : 'Terms of Service'}
                </Link>
              </li>
              <li>
                <a href="https://tripradio.shop" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {currentLanguage === 'ko' ? '웹사이트' : 'Website'}
                </a>
              </li>
            </ul>
          </div>

          {/* 연락처 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              {currentLanguage === 'ko' ? '연락처' : 'Contact'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <a href="mailto:support@tripradio.shop" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  support@tripradio.shop
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <a href="mailto:privacy@tripradio.shop" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  privacy@tripradio.shop
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-200 dark:border-gray-800 my-8"></div>

        {/* 하단 정보 */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            &copy; {currentYear} TripRadio.AI. {currentLanguage === 'ko' ? '모든 권리 보유' : 'All rights reserved'}.
          </p>
        </div>
      </div>
    </footer>
  );
}
