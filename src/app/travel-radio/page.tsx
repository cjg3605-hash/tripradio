'use client';
import Link from 'next/link';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';
import { useTranslations } from 'next-intl';

export default function TravelRadioPage() {
  const t = useTranslations('travelRadio');
  return (
    <>
      <KeywordPageSchema 
        keyword={t('keyword')}
        pagePath="/travel-radio"
        title={t('metadata.title')}
        description={t('metadata.description')}
        features={[t('features.realtime'), t('features.personalized'), t('features.worldwide'), t('features.authentic'), t('features.free'), t('features.comfortable')]}
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
              href="/"
              className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 min-w-[200px]"
            >
              {t('cta.primary')}
            </Link>
            <Link 
              href="#why-travel-radio"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-w-[200px]"
            >
              {t('cta.secondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* Why Travel Radio Section */}
      <section id="why-travel-radio" className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('whyNeeded.title')} 
              <span className="font-semibold block mt-2">{t('whyNeeded.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">😴</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('whyNeeded.problems.0.title')}</h3>
              <p className="text-gray-600">
                {t('whyNeeded.problems.0.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📱</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('whyNeeded.problems.1.title')}</h3>
              <p className="text-gray-600">
                {t('whyNeeded.problems.1.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💸</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('whyNeeded.problems.2.title')}</h3>
              <p className="text-gray-600">
                {t('whyNeeded.problems.2.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('specialExperience.title')} 
              <span className="font-semibold block mt-2">{t('specialExperience.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎙️</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('specialExperience.features.0.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('specialExperience.features.0.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎯</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('specialExperience.features.1.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('specialExperience.features.1.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🌍</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('specialExperience.features.2.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('specialExperience.features.2.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📻</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('specialExperience.features.3.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('specialExperience.features.3.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💝</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('specialExperience.features.4.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('specialExperience.features.4.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎧</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('specialExperience.features.5.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('specialExperience.features.5.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Radio Types Section */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('radioTypes.title')} 
              <span className="font-semibold block mt-2">{t('radioTypes.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏰</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">{t('radioTypes.categories.0.title')}</h3>
                    <p className="text-gray-600">
                      {t('radioTypes.categories.0.description')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🌺</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">{t('radioTypes.categories.1.title')}</h3>
                    <p className="text-gray-600">
                      {t('radioTypes.categories.1.description')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🍜</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">{t('radioTypes.categories.2.title')}</h3>
                    <p className="text-gray-600">
                      {t('radioTypes.categories.2.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">{t('radioTypes.categories.3.title')}</h3>
                    <p className="text-gray-600">
                      {t('radioTypes.categories.3.description')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏙️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">{t('radioTypes.categories.4.title')}</h3>
                    <p className="text-gray-600">
                      {t('radioTypes.categories.4.description')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🌙</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">{t('radioTypes.categories.5.title')}</h3>
                    <p className="text-gray-600">
                      {t('radioTypes.categories.5.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Listen Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('howToListen.title')} 
              <span className="font-semibold block mt-2">{t('howToListen.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">1</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('howToListen.steps.0.title')}</h3>
              <p className="text-gray-600">
                {t('howToListen.steps.0.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">2</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('howToListen.steps.1.title')}</h3>
              <p className="text-gray-600">
                {t('howToListen.steps.1.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">3</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('howToListen.steps.2.title')}</h3>
              <p className="text-gray-600">
                {t('howToListen.steps.2.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">4</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('howToListen.steps.3.title')}</h3>
              <p className="text-gray-600">
                {t('howToListen.steps.3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('testimonials.title')} 
              <span className="font-semibold block mt-2">{t('testimonials.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-4xl mb-6 text-center">🌟</div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                {t('testimonials.reviews.0.content')}
              </p>
              <p className="text-sm text-gray-500 text-center">{t('testimonials.reviews.0.author')}</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-4xl mb-6 text-center">💝</div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                {t('testimonials.reviews.1.content')}
              </p>
              <p className="text-sm text-gray-500 text-center">{t('testimonials.reviews.1.author')}</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-4xl mb-6 text-center">🎧</div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                {t('testimonials.reviews.2.content')}
              </p>
              <p className="text-sm text-gray-500 text-center">{t('testimonials.reviews.2.author')}</p>
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
              href="/"
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