'use client';
import Link from 'next/link';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TravelRadioPage() {
  const { t } = useLanguage();
  const travelRadioT = (key: string) => {
    return t(`travelRadio.${key}`);
  };
  return (
    <>
      <KeywordPageSchema 
        keyword={travelRadioT('keyword')}
        pagePath="/travel-radio"
        title={travelRadioT('metadata.title')}
        description={travelRadioT('metadata.description')}
        features={[t('features.realtime'), t('features.personalized'), t('features.worldwide'), t('features.authentic'), t('features.free'), t('features.comfortable')]}
      />
      <div className="min-h-screen bg-white font-['SF_Pro_Display','SF_Pro_Text',-apple-system,BlinkMacSystemFont,sans-serif]">
      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-8 md:px-16 lg:px-24 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-[#F8F8F8] rounded-full text-sm font-semibold text-[#555555] mb-6">
              {travelRadioT('badge')}
            </div>
            <h1 className="text-[clamp(3rem,5vw,4.5rem)] font-semibold text-black mb-6 leading-tight tracking-tight">
              {travelRadioT('hero.title')} 
              <span className="font-light block mt-3">{travelRadioT('hero.subtitle')}</span>
            </h1>
            <p className="text-[clamp(1rem,1.5vw,1.25rem)] font-light text-[#555555] mb-12 leading-relaxed max-w-3xl mx-auto">
              {travelRadioT('hero.description')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/"
              className="bg-[#007AFF] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#005FCC] transition-colors duration-200 min-w-[200px]"
            >
              {travelRadioT('cta.primary')}
            </Link>
            <Link 
              href="#why-travel-radio"
              className="border border-[#555555] text-[#555555] px-8 py-3 rounded-lg font-semibold hover:bg-[#F8F8F8] transition-colors duration-200 min-w-[200px]"
            >
              {travelRadioT('cta.secondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* Why Travel Radio Section */}
      <section id="why-travel-radio" className="px-4 py-16 sm:px-8 md:px-16 lg:px-24 lg:py-24 bg-[#F8F8F8]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold text-black mb-6 tracking-tight">
              {travelRadioT('whyNeeded.title')} 
              <span className="font-semibold block mt-2">{travelRadioT('whyNeeded.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-[#555555] mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8]">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">😴</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{travelRadioT('whyNeeded.problems.0.title')}</h3>
              <p className="text-[#555555] font-light">
                {travelRadioT('whyNeeded.problems.0.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8]">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📱</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{travelRadioT('whyNeeded.problems.1.title')}</h3>
              <p className="text-[#555555] font-light">
                {travelRadioT('whyNeeded.problems.1.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8]">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💸</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{travelRadioT('whyNeeded.problems.2.title')}</h3>
              <p className="text-[#555555] font-light">
                {travelRadioT('whyNeeded.problems.2.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 sm:px-8 md:px-16 lg:px-24 lg:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold text-black mb-6 tracking-tight">
              {travelRadioT('specialExperience.title')} 
              <span className="font-semibold block mt-2">{travelRadioT('specialExperience.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-[#555555] mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎙️</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{travelRadioT('specialExperience.features.0.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {travelRadioT('specialExperience.features.0.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎯</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{travelRadioT('specialExperience.features.1.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {travelRadioT('specialExperience.features.1.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🌍</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{travelRadioT('specialExperience.features.2.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {travelRadioT('specialExperience.features.2.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📻</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{travelRadioT('specialExperience.features.3.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {travelRadioT('specialExperience.features.3.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💝</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{travelRadioT('specialExperience.features.4.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {travelRadioT('specialExperience.features.4.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎧</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{travelRadioT('specialExperience.features.5.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {travelRadioT('specialExperience.features.5.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Radio Types Section */}
      <section className="py-24 lg:py-32 bg-[#F8F8F8]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold text-black mb-6 tracking-tight">
              {travelRadioT('radioTypes.title')} 
              <span className="font-semibold block mt-2">{travelRadioT('radioTypes.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-[#555555] mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏰</span>
                  </div>
                  <div>
                    <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-2">{travelRadioT('radioTypes.categories.0.title')}</h3>
                    <p className="text-[#555555] font-light">
                      {travelRadioT('radioTypes.categories.0.description')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🌺</span>
                  </div>
                  <div>
                    <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-2">{travelRadioT('radioTypes.categories.1.title')}</h3>
                    <p className="text-[#555555] font-light">
                      {travelRadioT('radioTypes.categories.1.description')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🍜</span>
                  </div>
                  <div>
                    <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-2">{travelRadioT('radioTypes.categories.2.title')}</h3>
                    <p className="text-[#555555] font-light">
                      {travelRadioT('radioTypes.categories.2.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <div>
                    <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-2">{travelRadioT('radioTypes.categories.3.title')}</h3>
                    <p className="text-[#555555] font-light">
                      {travelRadioT('radioTypes.categories.3.description')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏙️</span>
                  </div>
                  <div>
                    <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-2">{travelRadioT('radioTypes.categories.4.title')}</h3>
                    <p className="text-[#555555] font-light">
                      {travelRadioT('radioTypes.categories.4.description')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🌙</span>
                  </div>
                  <div>
                    <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-2">{travelRadioT('radioTypes.categories.5.title')}</h3>
                    <p className="text-[#555555] font-light">
                      {travelRadioT('radioTypes.categories.5.description')}
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
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold text-black mb-6 tracking-tight">
              {travelRadioT('howToListen.title')} 
              <span className="font-semibold block mt-2">{travelRadioT('howToListen.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-[#555555] mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="bg-black text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-semibold mx-auto mb-6">1</div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{travelRadioT('howToListen.steps.0.title')}</h3>
              <p className="text-[#555555] font-light">
                {travelRadioT('howToListen.steps.0.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-black text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-semibold mx-auto mb-6">2</div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{travelRadioT('howToListen.steps.1.title')}</h3>
              <p className="text-[#555555] font-light">
                {travelRadioT('howToListen.steps.1.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-black text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-semibold mx-auto mb-6">3</div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{travelRadioT('howToListen.steps.2.title')}</h3>
              <p className="text-[#555555] font-light">
                {travelRadioT('howToListen.steps.2.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-black text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-semibold mx-auto mb-6">4</div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{travelRadioT('howToListen.steps.3.title')}</h3>
              <p className="text-[#555555] font-light">
                {travelRadioT('howToListen.steps.3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 lg:py-32 bg-[#F8F8F8]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold text-black mb-6 tracking-tight">
              {travelRadioT('testimonials.title')} 
              <span className="font-semibold block mt-2">{travelRadioT('testimonials.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-[#555555] mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8]">
              <div className="text-4xl mb-6 text-center">🌟</div>
              <p className="text-[#555555] font-light mb-6 italic leading-relaxed">
                {travelRadioT('testimonials.reviews.0.content')}
              </p>
              <p className="text-sm text-[#555555] font-light text-center">{travelRadioT('testimonials.reviews.0.author')}</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8]">
              <div className="text-4xl mb-6 text-center">💝</div>
              <p className="text-[#555555] font-light mb-6 italic leading-relaxed">
                {travelRadioT('testimonials.reviews.1.content')}
              </p>
              <p className="text-sm text-[#555555] font-light text-center">{travelRadioT('testimonials.reviews.1.author')}</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8]">
              <div className="text-4xl mb-6 text-center">🎧</div>
              <p className="text-[#555555] font-light mb-6 italic leading-relaxed">
                {travelRadioT('testimonials.reviews.2.content')}
              </p>
              <p className="text-sm text-[#555555] font-light text-center">{travelRadioT('testimonials.reviews.2.author')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-8 md:px-16 lg:px-24 lg:py-24 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold mb-6 leading-tight">
              {travelRadioT('finalCta.title')}
            </h2>
            <p className="text-[clamp(1rem,1.5vw,1.25rem)] font-light text-[#555555] mb-12 leading-relaxed">
              {travelRadioT('finalCta.description')}
            </p>
            <Link 
              href="/"
              className="inline-block bg-white text-black px-10 py-4 rounded-lg font-semibold hover:bg-[#F8F8F8] transition-colors duration-200"
            >
              {travelRadioT('finalCta.button')}
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}