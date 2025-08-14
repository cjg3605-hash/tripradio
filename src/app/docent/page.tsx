'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

export default function DocentPage() {
  const t = useTranslations('docent');
  
  return (
    <>
      <KeywordPageSchema 
        keyword={t('meta.keyword')}
        pagePath="/docent"
        title={t('meta.title')}
        description={t('meta.description')}
        features={[t('meta.features.customized'), t('meta.features.realTime'), t('meta.features.free'), t('meta.features.flexible'), t('meta.features.worldwide'), t('meta.features.smartphone')]}
      />
      <div className="min-h-screen bg-white font-['SF_Pro_Display','SF_Pro_Text',-apple-system,BlinkMacSystemFont,sans-serif]">
      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-8 md:px-16 lg:px-24 lg:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-[#F8F8F8] rounded-lg text-sm font-light text-[#555555]">
              {t('hero.badge')}
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
                href="/"
                className="bg-[#007AFF] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#005FCC] transition-colors duration-200 min-w-[200px]"
              >
                {t('hero.startFree')}
              </Link>
              <Link 
                href="#how-it-works"
                className="border border-[#E5E5E5] text-black px-8 py-3 rounded-lg font-medium hover:bg-[#F8F8F8] transition-colors duration-200 min-w-[200px]"
              >
                {t('hero.serviceIntro')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-4 py-16 sm:px-8 md:px-16 lg:px-24 lg:py-24 bg-[#F8F8F8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-black mb-3 tracking-tight">
              {t('problems.title')}
            </h2>
            <p className="text-lg text-[#555555] font-light">
              {t('problems.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-white p-8 rounded-xl border border-[#E5E5E5] hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💸</div>
              </div>
              <h3 className="text-lg font-semibold text-black mb-4">{t('problems.expensiveCost.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('problems.expensiveCost.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-[#E5E5E5] hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">⏰</div>
              </div>
              <h3 className="text-lg font-semibold text-black mb-4">{t('problems.fixedSchedule.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('problems.fixedSchedule.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-[#E5E5E5] hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">👥</div>
              </div>
              <h3 className="text-lg font-semibold text-black mb-4">{t('problems.genericContent.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('problems.genericContent.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="how-it-works" className="px-4 py-16 sm:px-8 md:px-16 lg:px-24 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-black mb-3 tracking-tight">
              {t('solution.title')}
            </h2>
            <p className="text-lg text-[#555555] font-light">
              {t('solution.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-white p-8 rounded-xl border border-[#E5E5E5] hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎯</div>
              </div>
              <h3 className="text-lg font-semibold text-black mb-4">{t('solution.features.customized.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('solution.features.customized.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-[#E5E5E5] hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">⚡</div>
              </div>
              <h3 className="text-lg font-semibold text-black mb-4">{t('solution.features.realTime.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('solution.features.realTime.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-[#E5E5E5] hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💰</div>
              </div>
              <h3 className="text-lg font-semibold text-black mb-4">{t('solution.features.free.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('solution.features.free.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-[#E5E5E5] hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🕐</div>
              </div>
              <h3 className="text-lg font-semibold text-black mb-4">{t('solution.features.flexible.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('solution.features.flexible.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-[#E5E5E5] hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🌍</div>
              </div>
              <h3 className="text-lg font-semibold text-black mb-4">{t('solution.features.worldwide.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('solution.features.worldwide.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-[#E5E5E5] hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📱</div>
              </div>
              <h3 className="text-lg font-semibold text-black mb-4">{t('solution.features.smartphone.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('solution.features.smartphone.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="px-4 py-16 sm:px-8 md:px-16 lg:px-24 lg:py-24 bg-[#F8F8F8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-black mb-3 tracking-tight">
              {t('useCases.title')}
            </h2>
            <p className="text-lg text-[#555555] font-light">
              {t('useCases.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="bg-white p-8 rounded-xl border border-[#E5E5E5] hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200">
              <h3 className="text-xl font-semibold text-black mb-6 flex items-center gap-3">
                <span className="text-3xl">🏛️</span> {t('useCases.museums.title')}
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-black flex-shrink-0 mt-2"></div>
                  <span className="text-[#555555] font-light">{t('useCases.museums.examples.national')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-black flex-shrink-0 mt-2"></div>
                  <span className="text-[#555555] font-light">{t('useCases.museums.examples.history')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-black flex-shrink-0 mt-2"></div>
                  <span className="text-[#555555] font-light">{t('useCases.museums.examples.science')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-black flex-shrink-0 mt-2"></div>
                  <span className="text-[#555555] font-light">{t('useCases.museums.examples.international')}</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-[#E5E5E5] hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200">
              <h3 className="text-xl font-semibold text-black mb-6 flex items-center gap-3">
                <span className="text-3xl">🎨</span> {t('useCases.galleries.title')}
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-black flex-shrink-0 mt-2"></div>
                  <span className="text-[#555555] font-light">{t('useCases.galleries.examples.national')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-black flex-shrink-0 mt-2"></div>
                  <span className="text-[#555555] font-light">{t('useCases.galleries.examples.private')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-black flex-shrink-0 mt-2"></div>
                  <span className="text-[#555555] font-light">{t('useCases.galleries.examples.international')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-black flex-shrink-0 mt-2"></div>
                  <span className="text-[#555555] font-light">{t('useCases.galleries.examples.outdoor')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="px-4 py-16 sm:px-8 md:px-16 lg:px-24 lg:py-24 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-black mb-3 tracking-tight">
              {t('howToUse.title')}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="bg-black text-white w-16 h-16 rounded-xl flex items-center justify-center text-xl font-semibold mx-auto mb-6">1</div>
              <h3 className="text-lg font-semibold text-black mb-4">{t('howToUse.steps.search.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('howToUse.steps.search.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-black text-white w-16 h-16 rounded-xl flex items-center justify-center text-xl font-semibold mx-auto mb-6">2</div>
              <h3 className="text-lg font-semibold text-black mb-4">{t('howToUse.steps.interests.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('howToUse.steps.interests.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-black text-white w-16 h-16 rounded-xl flex items-center justify-center text-xl font-semibold mx-auto mb-6">3</div>
              <h3 className="text-lg font-semibold text-black mb-4">{t('howToUse.steps.listen.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('howToUse.steps.listen.description')}
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
              {t('cta.title')}
            </h2>
            <p className="text-base sm:text-lg text-[#EAEAEA] mb-12 leading-relaxed font-light">
              {t('cta.description')}
            </p>
            <Link 
              href="/"
              className="inline-block bg-white text-black px-10 py-4 rounded-lg font-medium hover:bg-[#F8F8F8] transition-colors duration-200"
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