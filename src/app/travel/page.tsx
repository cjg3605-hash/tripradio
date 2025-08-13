'use client';
import Link from 'next/link';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';
import { useTranslations } from 'next-intl';

export default function TravelPage() {
  const t = useTranslations('travel');
  
  return (
    <>
      <KeywordPageSchema 
        keyword={t('keyword')}
        pagePath="/travel"
        title={t('metadata.title')}
        description={t('metadata.description')}
        features={[t('features.worldwide'), t('features.realtime'), t('features.personalized'), t('features.hidden'), t('features.culture'), t('features.free')]}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
              {t('badge')}
            </div>
            <h1 className="text-4xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              {t('hero.title')} 
              <span className="font-semibold block mt-2">{t('hero.subtitle')}</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              {t('hero.description')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/?purpose=travel&ai=smart"
              className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 min-w-[200px]"
            >
              {t('cta.primary')}
            </Link>
            <Link 
              href="#destinations"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-w-[200px]"
            >
              {t('cta.secondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('problems.title')}
              <span className="font-semibold block mt-2">{t('problems.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🤔</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('problems.items.0.title')}</h3>
              <p className="text-gray-600">
                {t('problems.items.0.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📱</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('problems.items.1.title')}</h3>
              <p className="text-gray-600">
                {t('problems.items.1.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💸</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('problems.items.2.title')}</h3>
              <p className="text-gray-600">
                {t('problems.items.2.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Features */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('solution.title')} 
              <span className="font-semibold block mt-2">{t('solution.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🌍</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('solution.features.0.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('solution.features.0.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🤖</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('solution.features.1.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('solution.features.1.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎯</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('solution.features.2.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('solution.features.2.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💎</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('solution.features.3.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('solution.features.3.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🏛️</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('solution.features.4.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('solution.features.4.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💝</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('solution.features.5.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('solution.features.5.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section id="destinations" className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('destinations.title')} 
              <span className="font-semibold block mt-2">{t('destinations.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🗾</div>
                <h3 className="text-lg font-medium text-gray-900">{t('destinations.items.0.name')}</h3>
                <p className="text-sm text-gray-600 mt-2">{t('destinations.items.0.description')}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🇫🇷</div>
                <h3 className="text-lg font-medium text-gray-900">{t('destinations.items.1.name')}</h3>
                <p className="text-sm text-gray-600 mt-2">{t('destinations.items.1.description')}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🏝️</div>
                <h3 className="text-lg font-medium text-gray-900">{t('destinations.items.2.name')}</h3>
                <p className="text-sm text-gray-600 mt-2">{t('destinations.items.2.description')}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🏛️</div>
                <h3 className="text-lg font-medium text-gray-900">{t('destinations.items.3.name')}</h3>
                <p className="text-sm text-gray-600 mt-2">{t('destinations.items.3.description')}</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/destinations"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              {t('destinations.viewMore')}
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('howItWorks.title')}
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-light mb-6 tracking-tight">
              {t('finalCta.title')}
            </h2>
            <p className="text-lg lg:text-xl text-gray-300 mb-12 leading-relaxed">
              {t('finalCta.description')}
            </p>
            <Link 
              href="/?purpose=travel&ai=smart"
              className="inline-block bg-white text-black px-10 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200"
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