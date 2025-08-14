'use client';
import Link from 'next/link';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';
import { useTranslations } from 'next-intl';

export default function TourRadioPage() {
  const t = useTranslations('tourRadio');
  
  return (
    <>
      <KeywordPageSchema 
        keyword={t('keyword')}
        pagePath="/tour-radio"
        title={t('metadata.title')}
        description={t('metadata.description')}
        features={[t('features.realtime'), t('features.storytelling'), t('features.location'), t('features.music'), t('features.interactive'), t('features.worldwide')]}
      />
      <div className="min-h-screen bg-white font-['SF_Pro_Display','SF_Pro_Text',-apple-system,BlinkMacSystemFont,sans-serif]">
      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-8 md:px-16 lg:px-24 lg:py-24">
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
              href="/"
              className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 min-w-[200px]"
            >
              {t('cta.primary')}
            </Link>
            <Link 
              href="#features"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-w-[200px]"
            >
              {t('cta.secondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-4 py-16 sm:px-8 md:px-16 lg:px-24 lg:py-24 bg-[#F8F8F8]">
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
                <div className="text-2xl">🤫</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('problems.items.0.title')}</h3>
              <p className="text-gray-600">
                {t('problems.items.0.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📖</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('problems.items.1.title')}</h3>
              <p className="text-gray-600">
                {t('problems.items.1.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💰</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('problems.items.2.title')}</h3>
              <p className="text-gray-600">
                {t('problems.items.2.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">⏰</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('problems.items.3.title')}</h3>
              <p className="text-gray-600">
                {t('problems.items.3.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">👥</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('problems.items.4.title')}</h3>
              <p className="text-gray-600">
                {t('problems.items.4.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🗣️</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('problems.items.5.title')}</h3>
              <p className="text-gray-600">
                {t('problems.items.5.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Radio Features */}
      <section id="features" className="px-4 py-16 sm:px-8 md:px-16 lg:px-24 lg:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('radioFeatures.title')} 
              <span className="font-semibold block mt-2">{t('radioFeatures.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📻</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('radioFeatures.features.0.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('radioFeatures.features.0.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎭</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('radioFeatures.features.1.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('radioFeatures.features.1.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📍</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('radioFeatures.features.2.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('radioFeatures.features.2.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎵</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('radioFeatures.features.3.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('radioFeatures.features.3.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💬</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('radioFeatures.features.4.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('radioFeatures.features.4.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🌍</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('radioFeatures.features.5.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('radioFeatures.features.5.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Types */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('contentTypes.title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('contentTypes.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-lg flex items-center justify-center text-2xl mx-auto mb-4">
                🏛️
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">{t('contentTypes.items.0.title')}</h3>
              <p className="text-gray-600 text-sm">
                {t('contentTypes.items.0.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-lg flex items-center justify-center text-2xl mx-auto mb-4">
                🌟
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">{t('contentTypes.items.1.title')}</h3>
              <p className="text-gray-600 text-sm">
                {t('contentTypes.items.1.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-lg flex items-center justify-center text-2xl mx-auto mb-4">
                🍜
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">{t('contentTypes.items.2.title')}</h3>
              <p className="text-gray-600 text-sm">
                {t('contentTypes.items.2.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-lg flex items-center justify-center text-2xl mx-auto mb-4">
                👻
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">{t('contentTypes.items.3.title')}</h3>
              <p className="text-gray-600 text-sm">
                {t('contentTypes.items.3.description')}
              </p>
            </div>
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

      {/* Sample Programs */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('samplePrograms.title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('samplePrograms.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">🗼</div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{t('samplePrograms.programs.0.title')}</h3>
                  <p className="text-sm text-gray-600">{t('samplePrograms.programs.0.location')}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {t('samplePrograms.programs.0.description')}
              </p>
              <div className="text-xs text-gray-500">
                🎵 {t('samplePrograms.programs.0.bgMusic')}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">🏛️</div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{t('samplePrograms.programs.1.title')}</h3>
                  <p className="text-sm text-gray-600">{t('samplePrograms.programs.1.location')}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {t('samplePrograms.programs.1.description')}
              </p>
              <div className="text-xs text-gray-500">
                🎵 {t('samplePrograms.programs.1.bgMusic')}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">🌸</div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{t('samplePrograms.programs.2.title')}</h3>
                  <p className="text-sm text-gray-600">{t('samplePrograms.programs.2.location')}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {t('samplePrograms.programs.2.description')}
              </p>
              <div className="text-xs text-gray-500">
                🎵 {t('samplePrograms.programs.2.bgMusic')}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">🏔️</div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{t('samplePrograms.programs.3.title')}</h3>
                  <p className="text-sm text-gray-600">{t('samplePrograms.programs.3.location')}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {t('samplePrograms.programs.3.description')}
              </p>
              <div className="text-xs text-gray-500">
                🎵 {t('samplePrograms.programs.3.bgMusic')}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">🌊</div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{t('samplePrograms.programs.4.title')}</h3>
                  <p className="text-sm text-gray-600">{t('samplePrograms.programs.4.location')}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {t('samplePrograms.programs.4.description')}
              </p>
              <div className="text-xs text-gray-500">
                🎵 {t('samplePrograms.programs.4.bgMusic')}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">🎪</div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{t('samplePrograms.programs.5.title')}</h3>
                  <p className="text-sm text-gray-600">{t('samplePrograms.programs.5.location')}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {t('samplePrograms.programs.5.description')}
              </p>
              <div className="text-xs text-gray-500">
                🎵 {t('samplePrograms.programs.5.bgMusic')}
              </div>
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
              href="/"
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