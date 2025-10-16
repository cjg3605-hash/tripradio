"use client";
import { useLanguage } from '@/contexts/LanguageContext';

export default function TermsPage() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            {t('legal.terms.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 transition-colors duration-300">
            {t('legal.terms.description')}
          </p>
        </div>

        {/* 콘텐츠 */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 transition-colors duration-300">
              {t('legal.terms.content')}
            </p>
            
            {/* 업데이트 날짜 */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600 transition-colors duration-300">
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                {t('legal.terms.lastUpdated')}: 2024-07-23
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 