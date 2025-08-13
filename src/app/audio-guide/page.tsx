'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

export default function AudioGuidePage() {
  const t = useTranslations('audioGuide');
  
  return (
    <>
      <KeywordPageSchema 
        keyword="오디오가이드"
        pagePath="/audio-guide"
        title="AI 오디오가이드 앱 추천 1위 | 무료 여행 해설 TripRadio.AI"
        description="전 세계 어디서든 AI가 실시간으로 만들어주는 개인 맞춤형 오디오가이드! 도슨트 없이도 전문가급 해설을 무료로 경험해보세요"
        features={[t('features.aiRealTime.title'), t('features.personalized.title'), t('features.worldwide.title'), t('features.free.title'), t('features.multiLanguage.title'), t('features.offline.title')]}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
              {t('hero.badge')}
            </div>
            <h1 className="text-4xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              {t('hero.title')} 
              <span className="font-semibold block mt-2">{t('hero.titleBold')}</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              {t('hero.description')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/"
              className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 min-w-[200px]"
            >
              {t('hero.startFree')}
            </Link>
            <Link 
              href="#features"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-w-[200px]"
            >
              {t('hero.exploreFeatures')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('features.title')} 
              <span className="font-semibold block mt-2">{t('features.titleBold')}</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🤖</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('features.aiRealTime.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('features.aiRealTime.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎯</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('features.personalized.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('features.personalized.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🌍</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('features.worldwide.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('features.worldwide.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💰</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('features.free.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('features.free.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🗣️</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('features.multiLanguage.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('features.multiLanguage.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📱</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('features.offline.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('features.offline.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('comparison.title')}
              <span className="font-semibold block mt-2">{t('comparison.titleBold')}</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="p-10 border-r border-gray-200">
                  <h3 className="text-xl font-medium mb-8 text-gray-500">{t('comparison.existing.title')}</h3>
                  <ul className="space-y-5">
                    {t.raw('comparison.existing.items').map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-4">
                        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-10 bg-gray-50">
                  <h3 className="text-xl font-medium mb-8 text-gray-900">{t('comparison.tripRadio.title')}</h3>
                  <ul className="space-y-5">
                    {t.raw('comparison.tripRadio.items').map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-4">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-light mb-6 tracking-tight">
              {t('cta.title')}
            </h2>
            <p className="text-lg lg:text-xl text-gray-300 mb-12 leading-relaxed">
              {t('cta.description')}
            </p>
            <Link 
              href="/"
              className="inline-block bg-white text-black px-10 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200"
            >
              {t('cta.startFree')}
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}