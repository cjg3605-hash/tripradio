'use client';
import Link from 'next/link';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TourRadioPage() {
  const { t } = useLanguage();
  const tourRadioT = (key: string) => {
    return t(`tourRadio.${key}`);
  };
  
  return (
    <>
      <KeywordPageSchema 
        keyword={tourRadioT('keyword')}
        pagePath="/tour-radio"
        title={tourRadioT('metadata.title')}
        description={tourRadioT('metadata.description')}
        features={[tourRadioT('features.realtime'), tourRadioT('features.storytelling'), tourRadioT('features.location'), tourRadioT('features.music'), tourRadioT('features.interactive'), tourRadioT('features.worldwide')]}
      />
      <div className="min-h-screen bg-white font-['SF_Pro_Display','SF_Pro_Text',-apple-system,BlinkMacSystemFont,sans-serif]">
      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-8 md:px-16 lg:px-24 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-[#F8F8F8] rounded-full text-sm font-semibold text-[#555555] mb-6">
              {tourRadioT('badge')}
            </div>
            <h1 className="text-[clamp(3rem,5vw,4.5rem)] font-semibold text-black mb-6 leading-tight tracking-tight">
              {tourRadioT('hero.title')} 
              <span className="font-light block mt-3">{tourRadioT('hero.subtitle')}</span>
            </h1>
            <p className="text-[clamp(1rem,1.5vw,1.25rem)] font-light text-[#555555] mb-12 leading-relaxed max-w-3xl mx-auto">
              {tourRadioT('hero.description')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/"
              className="bg-[#007AFF] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#005FCC] transition-colors duration-200 min-w-[200px]"
            >
              {tourRadioT('cta.primary')}
            </Link>
            <Link 
              href="#features"
              className="border border-[#555555] text-[#555555] px-8 py-3 rounded-lg font-semibold hover:bg-[#F8F8F8] transition-colors duration-200 min-w-[200px]"
            >
              {tourRadioT('cta.secondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-4 py-16 sm:px-8 md:px-16 lg:px-24 lg:py-24 bg-[#F8F8F8]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold text-black mb-6 leading-tight">
              {tourRadioT('problems.title')} 
              <span className="font-light block mt-2">{tourRadioT('problems.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-[#555555] mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8]">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🤫</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{tourRadioT('problems.items.0.title')}</h3>
              <p className="text-[#555555] font-light">
                {tourRadioT('problems.items.0.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8]">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📖</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{tourRadioT('problems.items.1.title')}</h3>
              <p className="text-[#555555] font-light">
                {tourRadioT('problems.items.1.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8]">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💰</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{tourRadioT('problems.items.2.title')}</h3>
              <p className="text-[#555555] font-light">
                {tourRadioT('problems.items.2.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8]">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">⏰</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{tourRadioT('problems.items.3.title')}</h3>
              <p className="text-[#555555] font-light">
                {tourRadioT('problems.items.3.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8]">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">👥</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{tourRadioT('problems.items.4.title')}</h3>
              <p className="text-[#555555] font-light">
                {tourRadioT('problems.items.4.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8]">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🗣️</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{tourRadioT('problems.items.5.title')}</h3>
              <p className="text-[#555555] font-light">
                {tourRadioT('problems.items.5.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Radio Features */}
      <section id="features" className="px-4 py-16 sm:px-8 md:px-16 lg:px-24 lg:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold text-black mb-6 tracking-tight">
              {tourRadioT('radioFeatures.title')} 
              <span className="font-semibold block mt-2">{tourRadioT('radioFeatures.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📻</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{tourRadioT('radioFeatures.features.0.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {tourRadioT('radioFeatures.features.0.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎭</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{tourRadioT('radioFeatures.features.1.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {tourRadioT('radioFeatures.features.1.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📍</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{tourRadioT('radioFeatures.features.2.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {tourRadioT('radioFeatures.features.2.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎵</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{tourRadioT('radioFeatures.features.3.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {tourRadioT('radioFeatures.features.3.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💬</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{tourRadioT('radioFeatures.features.4.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {tourRadioT('radioFeatures.features.4.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🌍</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{tourRadioT('radioFeatures.features.5.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {tourRadioT('radioFeatures.features.5.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Types */}
      <section className="py-24 lg:py-32 bg-[#F8F8F8]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold text-black mb-6 tracking-tight">
              {tourRadioT('contentTypes.title')}
            </h2>
            <p className="text-[clamp(1rem,1.5vw,1.25rem)] text-[#555555] font-light">
              {tourRadioT('contentTypes.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-lg flex items-center justify-center text-2xl mx-auto mb-4">
                🏛️
              </div>
              <h3 className="text-[clamp(1rem,1.5vw,1.25rem)] font-semibold text-black mb-3">{tourRadioT('contentTypes.items.0.title')}</h3>
              <p className="text-[#555555] font-light text-sm">
                {tourRadioT('contentTypes.items.0.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-lg flex items-center justify-center text-2xl mx-auto mb-4">
                🌟
              </div>
              <h3 className="text-[clamp(1rem,1.5vw,1.25rem)] font-semibold text-black mb-3">{tourRadioT('contentTypes.items.1.title')}</h3>
              <p className="text-[#555555] font-light text-sm">
                {tourRadioT('contentTypes.items.1.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-lg flex items-center justify-center text-2xl mx-auto mb-4">
                🍜
              </div>
              <h3 className="text-[clamp(1rem,1.5vw,1.25rem)] font-semibold text-black mb-3">{tourRadioT('contentTypes.items.2.title')}</h3>
              <p className="text-[#555555] font-light text-sm">
                {tourRadioT('contentTypes.items.2.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-lg flex items-center justify-center text-2xl mx-auto mb-4">
                👻
              </div>
              <h3 className="text-[clamp(1rem,1.5vw,1.25rem)] font-semibold text-black mb-3">{tourRadioT('contentTypes.items.3.title')}</h3>
              <p className="text-[#555555] font-light text-sm">
                {tourRadioT('contentTypes.items.3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold text-black mb-6 tracking-tight">
              {tourRadioT('howItWorks.title')}
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-black text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-semibold mx-auto mb-6">1</div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{tourRadioT('howItWorks.steps.0.title')}</h3>
              <p className="text-[#555555] font-light">
                {tourRadioT('howItWorks.steps.0.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-black text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-semibold mx-auto mb-6">2</div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{tourRadioT('howItWorks.steps.1.title')}</h3>
              <p className="text-[#555555] font-light">
                {tourRadioT('howItWorks.steps.1.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-black text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-semibold mx-auto mb-6">3</div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4">{tourRadioT('howItWorks.steps.2.title')}</h3>
              <p className="text-[#555555] font-light">
                {tourRadioT('howItWorks.steps.2.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Programs */}
      <section className="py-24 lg:py-32 bg-[#F8F8F8]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold text-black mb-6 tracking-tight">
              {tourRadioT('samplePrograms.title')}
            </h2>
            <p className="text-[clamp(1rem,1.5vw,1.25rem)] text-[#555555] font-light">
              {tourRadioT('samplePrograms.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">🗼</div>
                <div>
                  <h3 className="text-[clamp(1rem,1.5vw,1.25rem)] font-semibold text-black">{tourRadioT('samplePrograms.programs.0.title')}</h3>
                  <p className="text-sm text-[#555555] font-light">{tourRadioT('samplePrograms.programs.0.location')}</p>
                </div>
              </div>
              <p className="text-[#555555] font-light text-sm mb-4">
                {tourRadioT('samplePrograms.programs.0.description')}
              </p>
              <div className="text-xs text-gray-500">
                🎵 {tourRadioT('samplePrograms.programs.0.bgMusic')}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">🏛️</div>
                <div>
                  <h3 className="text-[clamp(1rem,1.5vw,1.25rem)] font-semibold text-black">{tourRadioT('samplePrograms.programs.1.title')}</h3>
                  <p className="text-sm text-[#555555] font-light">{tourRadioT('samplePrograms.programs.1.location')}</p>
                </div>
              </div>
              <p className="text-[#555555] font-light text-sm mb-4">
                {tourRadioT('samplePrograms.programs.1.description')}
              </p>
              <div className="text-xs text-gray-500">
                🎵 {tourRadioT('samplePrograms.programs.1.bgMusic')}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">🌸</div>
                <div>
                  <h3 className="text-[clamp(1rem,1.5vw,1.25rem)] font-semibold text-black">{tourRadioT('samplePrograms.programs.2.title')}</h3>
                  <p className="text-sm text-[#555555] font-light">{tourRadioT('samplePrograms.programs.2.location')}</p>
                </div>
              </div>
              <p className="text-[#555555] font-light text-sm mb-4">
                {tourRadioT('samplePrograms.programs.2.description')}
              </p>
              <div className="text-xs text-gray-500">
                🎵 {tourRadioT('samplePrograms.programs.2.bgMusic')}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">🏔️</div>
                <div>
                  <h3 className="text-[clamp(1rem,1.5vw,1.25rem)] font-semibold text-black">{tourRadioT('samplePrograms.programs.3.title')}</h3>
                  <p className="text-sm text-[#555555] font-light">{tourRadioT('samplePrograms.programs.3.location')}</p>
                </div>
              </div>
              <p className="text-[#555555] font-light text-sm mb-4">
                {tourRadioT('samplePrograms.programs.3.description')}
              </p>
              <div className="text-xs text-gray-500">
                🎵 {tourRadioT('samplePrograms.programs.3.bgMusic')}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">🌊</div>
                <div>
                  <h3 className="text-[clamp(1rem,1.5vw,1.25rem)] font-semibold text-black">{tourRadioT('samplePrograms.programs.4.title')}</h3>
                  <p className="text-sm text-[#555555] font-light">{tourRadioT('samplePrograms.programs.4.location')}</p>
                </div>
              </div>
              <p className="text-[#555555] font-light text-sm mb-4">
                {tourRadioT('samplePrograms.programs.4.description')}
              </p>
              <div className="text-xs text-gray-500">
                🎵 {tourRadioT('samplePrograms.programs.4.bgMusic')}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">🎪</div>
                <div>
                  <h3 className="text-[clamp(1rem,1.5vw,1.25rem)] font-semibold text-black">{tourRadioT('samplePrograms.programs.5.title')}</h3>
                  <p className="text-sm text-[#555555] font-light">{tourRadioT('samplePrograms.programs.5.location')}</p>
                </div>
              </div>
              <p className="text-[#555555] font-light text-sm mb-4">
                {tourRadioT('samplePrograms.programs.5.description')}
              </p>
              <div className="text-xs text-gray-500">
                🎵 {tourRadioT('samplePrograms.programs.5.bgMusic')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-8 md:px-16 lg:px-24 lg:py-24 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold mb-6 leading-tight">
              {tourRadioT('finalCta.title')}
            </h2>
            <p className="text-[clamp(1rem,1.5vw,1.25rem)] font-light text-[#555555] mb-12 leading-relaxed">
              {tourRadioT('finalCta.description')}
            </p>
            <Link 
              href="/"
              className="inline-block bg-white text-black px-10 py-4 rounded-lg font-semibold hover:bg-[#F8F8F8] transition-colors duration-200"
            >
              {tourRadioT('finalCta.button')}
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}