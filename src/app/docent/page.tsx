'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

export default function DocentPage() {
  const t = useTranslations('docent');
  
  return (
    <>
      <KeywordPageSchema 
        keyword="도슨트"
        pagePath="/docent"
        title="AI 도슨트 서비스 | 전문 해설사 없이도 박물관·미술관 투어 TripRadio.AI"
        description="전문 도슨트 없이도 박물관, 미술관에서 깊이 있는 해설을 들을 수 있습니다. AI가 실시간으로 만드는 개인 맞춤형 문화예술 해설 서비스"
        features={['맞춤형 해설', '실시간 생성', '완전 무료', '자유로운 시간', '전 세계 지원', '스마트폰으로']}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
              AI Docent Service • Cultural Experience
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
              {t('hero.startFree')}
            </Link>
            <Link 
              href="#how-it-works"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-w-[200px]"
            >
              {t('hero.serviceIntro')}
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
                <div className="text-2xl">💸</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('problems.expensiveCost.title')}</h3>
              <p className="text-gray-600">
                {t('problems.expensiveCost.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">⏰</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('problems.fixedSchedule.title')}</h3>
              <p className="text-gray-600">
                {t('problems.fixedSchedule.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">👥</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('problems.genericContent.title')}</h3>
              <p className="text-gray-600">
                {t('problems.genericContent.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-white">
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
                <div className="text-2xl">🎯</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('solution.features.customized.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('solution.features.customized.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">⚡</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('solution.features.realTime.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('solution.features.realTime.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💰</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('solution.features.free.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('solution.features.free.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🕐</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('solution.features.flexible.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('solution.features.flexible.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🌍</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('solution.features.worldwide.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('solution.features.worldwide.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📱</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('solution.features.smartphone.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('solution.features.smartphone.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('useCases.title')} 
              <span className="font-semibold block mt-2">{t('useCases.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <h3 className="text-2xl font-medium text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">🏛️</span> {t('useCases.museums.title')}
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">{t('useCases.museums.examples.national')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">{t('useCases.museums.examples.history')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">{t('useCases.museums.examples.science')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">{t('useCases.museums.examples.international')}</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <h3 className="text-2xl font-medium text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">🎨</span> {t('useCases.galleries.title')}
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">{t('useCases.galleries.examples.national')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">{t('useCases.galleries.examples.private')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">{t('useCases.galleries.examples.international')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">{t('useCases.galleries.examples.outdoor')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('howToUse.title')}
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">1</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('howToUse.steps.search.title')}</h3>
              <p className="text-gray-600">
                {t('howToUse.steps.search.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">2</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('howToUse.steps.interests.title')}</h3>
              <p className="text-gray-600">
                {t('howToUse.steps.interests.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">3</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('howToUse.steps.listen.title')}</h3>
              <p className="text-gray-600">
                {t('howToUse.steps.listen.description')}
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