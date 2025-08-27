'use client';
import Link from 'next/link';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';
import { useTranslations } from 'next-intl';

export default function FreeTravelPage() {
  const t = useTranslations('freeTravel');
  
  return (
    <>
      <KeywordPageSchema 
        keyword={t('keyword')}
        pagePath="/free-travel"
        title={t('metadata.title')}
        description={t('metadata.description')}
        features={[t('features.planning'), t('features.guide'), t('features.safety'), t('features.budget'), t('features.language'), t('features.support')]}
      />
      <div className="min-h-screen bg-white font-['SF_Pro_Display','SF_Pro_Text',-apple-system,BlinkMacSystemFont,sans-serif]">
      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-8 md:px-16 lg:px-24 lg:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-[#F8F8F8] rounded-lg text-sm font-light text-[#555555]">
              {t('badge')}
            </div>
            <div className="space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold text-black leading-tight tracking-tight">
                {t('hero.title')}
                <span className="block mt-3 font-light">{t('hero.subtitle')}</span>
              </h1>
              <p className="text-base sm:text-lg text-[#555555] leading-relaxed max-w-3xl mx-auto font-light">
                {t('hero.description')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link 
                href="/ai-trip-planner?type=solo&focus=safety"
                className="bg-[#007AFF] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#005FCC] transition-colors duration-200 min-w-[200px]"
              >
                {t('cta.primary')}
              </Link>
              <Link 
                href="#planning"
                className="border border-[#E5E5E5] text-black px-8 py-3 rounded-lg font-medium hover:bg-[#F8F8F8] transition-colors duration-200 min-w-[200px]"
              >
                {t('cta.secondary')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Free Travel Challenges */}
      <section className="px-4 py-16 sm:px-8 md:px-16 lg:px-24 lg:py-24 bg-[#F8F8F8]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('challenges.title')} 
              <span className="font-semibold block mt-2">{t('challenges.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📋</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('challenges.items.0.title')}</h3>
              <p className="text-gray-600">
                {t('challenges.items.0.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🚨</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('challenges.items.1.title')}</h3>
              <p className="text-gray-600">
                {t('challenges.items.1.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🗣️</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('challenges.items.2.title')}</h3>
              <p className="text-gray-600">
                {t('challenges.items.2.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💸</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('challenges.items.3.title')}</h3>
              <p className="text-gray-600">
                {t('challenges.items.3.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🏠</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('challenges.items.4.title')}</h3>
              <p className="text-gray-600">
                {t('challenges.items.4.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📱</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('challenges.items.5.title')}</h3>
              <p className="text-gray-600">
                {t('challenges.items.5.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Solutions */}
      <section className="px-4 py-16 sm:px-8 md:px-16 lg:px-24 lg:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('solutions.title')} 
              <span className="font-semibold block mt-2">{t('solutions.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🤖</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('solutions.features.0.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('solutions.features.0.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🛡️</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('solutions.features.1.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('solutions.features.1.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💬</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('solutions.features.2.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('solutions.features.2.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💰</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('solutions.features.3.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('solutions.features.3.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🏨</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('solutions.features.4.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('solutions.features.4.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📱</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('solutions.features.5.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('solutions.features.5.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Free Travel Planning */}
      <section id="planning" className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('howItWorks.title')}
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">1</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('howItWorks.steps.0.title')}</h3>
              <p className="text-gray-600">
                {t('howItWorks.steps.0.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">2</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('howItWorks.steps.1.title')}</h3>
              <p className="text-gray-600">
                {t('howItWorks.steps.1.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">3</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('howItWorks.steps.2.title')}</h3>
              <p className="text-gray-600">
                {t('howItWorks.steps.2.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">4</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('howItWorks.steps.3.title')}</h3>
              <p className="text-gray-600">
                {t('howItWorks.steps.3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Free Travel Tips */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('tips.title')} 
              <span className="font-semibold block mt-2">{t('tips.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div className="text-2xl mb-4">🎯</div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">{t('tips.items.0.title')}</h3>
              <p className="text-gray-600 text-sm">
                {t('tips.items.0.description')}
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div className="text-2xl mb-4">📱</div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">{t('tips.items.1.title')}</h3>
              <p className="text-gray-600 text-sm">
                {t('tips.items.1.description')}
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div className="text-2xl mb-4">🏠</div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">{t('tips.items.2.title')}</h3>
              <p className="text-gray-600 text-sm">
                {t('tips.items.2.description')}
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div className="text-2xl mb-4">💳</div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">{t('tips.items.3.title')}</h3>
              <p className="text-gray-600 text-sm">
                {t('tips.items.3.description')}
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div className="text-2xl mb-4">🚨</div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">{t('tips.items.4.title')}</h3>
              <p className="text-gray-600 text-sm">
                {t('tips.items.4.description')}
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div className="text-2xl mb-4">🤝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">{t('tips.items.5.title')}</h3>
              <p className="text-gray-600 text-sm">
                {t('tips.items.5.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-8 md:px-16 lg:px-24 lg:py-24 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-6 tracking-tight">
              {t('finalCta.title')}
            </h2>
            <p className="text-base sm:text-lg text-[#EAEAEA] mb-12 leading-relaxed font-light">
              {t('finalCta.description')}
            </p>
            <Link 
              href="/ai-trip-planner?type=solo&focus=safety"
              className="inline-block bg-white text-black px-10 py-4 rounded-lg font-medium hover:bg-[#F8F8F8] transition-colors duration-200"
            >
              {t('finalCta.button')}
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}