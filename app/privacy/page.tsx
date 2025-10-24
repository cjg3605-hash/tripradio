"use client";
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            {t('legal.privacy.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 transition-colors duration-300">
            {t('legal.privacy.description')}
          </p>
        </div>

        {/* 콘텐츠 */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="prose prose-lg dark:prose-invert max-w-none whitespace-pre-wrap">
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 transition-colors duration-300">
              {t('legal.privacy.content')}
            </div>

            {/* 업데이트 날짜 */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600 transition-colors duration-300">
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300 mb-4">
                {t('legal.privacy.lastUpdated')}: October 23, 2025
              </p>

              {/* 연락처 */}
              <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                <p className="mb-2">
                  📧 Contact:
                  <a href="mailto:privacy@tripradio.shop" className="text-blue-600 dark:text-blue-400 hover:underline ml-2">
                    privacy@tripradio.shop
                  </a>
                </p>
                <p>
                  🔗 <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                    {t('legal.terms.title')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 