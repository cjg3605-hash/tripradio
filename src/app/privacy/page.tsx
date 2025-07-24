"use client";
import { useLanguage } from '@/contexts/LanguageContext';

export default function PrivacyPage() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('legal.privacy.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('legal.privacy.description')}
          </p>
        </div>

        {/* 콘텐츠 */}
        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              {t('legal.privacy.content')}
            </p>
            
            {/* 업데이트 날짜 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                {t('legal.privacy.lastUpdated')}: 2024-07-23
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 