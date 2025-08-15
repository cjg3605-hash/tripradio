'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

export default function AudioGuidePage() {
  const { t } = useLanguage();
  
  // audio-guide 전용 번역 함수
  const audioT = (key: string): string => {
    const translation = t(`audioGuide.${key}`);
    return Array.isArray(translation) ? translation[0] || '' : translation || '';
  };
  
  // 기존 오디오 가이드의 한계점
  const existingLimitations = [
    audioT('comparison.existing.items.0') || "정해진 스크립트로 획일적인 해설",
    audioT('comparison.existing.items.1') || "개인 취향을 고려하지 않는 일방적 정보", 
    audioT('comparison.existing.items.2') || "제한적인 언어와 지역 지원",
    audioT('comparison.existing.items.3') || "높은 이용 비용과 복잡한 절차",
    audioT('comparison.existing.items.4') || "인터넷 연결 필수로 불편함"
  ];
  
  // Trip Radio의 장점
  const tripRadioAdvantages = [
    audioT('comparison.tripRadio.items.0') || "AI가 실시간으로 생성하는 맞춤형 해설",
    audioT('comparison.tripRadio.items.1') || "개인 관심사와 여행 스타일 반영",
    audioT('comparison.tripRadio.items.2') || "전세계 180개국 다국어 지원", 
    audioT('comparison.tripRadio.items.3') || "완전 무료로 부담 없는 이용",
    audioT('comparison.tripRadio.items.4') || "오프라인 다운로드로 언제든 청취"
  ];

  // 핵심 기능 데이터
  const features = [
    {
      title: audioT('features.aiRealTime.title') || "AI 실시간 해설",
      description: audioT('features.aiRealTime.description') || "인공지능이 실시간으로 생성하는 맞춤형 오디오 가이드"
    },
    {
      title: audioT('features.personalized.title') || "개인화된 콘텐츠",
      description: audioT('features.personalized.description') || "개인 취향과 관심사를 반영한 맞춤형 여행 해설"
    },
    {
      title: audioT('features.worldwide.title') || "전세계 지원",
      description: audioT('features.worldwide.description') || "180개국 어디서나 사용 가능한 글로벌 서비스"
    },
    {
      title: audioT('features.free.title') || "완전 무료",
      description: audioT('features.free.description') || "모든 기능을 무료로 제공하는 부담 없는 서비스"
    },
    {
      title: audioT('features.multiLanguage.title') || "다국어 지원",
      description: audioT('features.multiLanguage.description') || "20개 이상 언어로 제공되는 음성 해설"
    },
    {
      title: audioT('features.offline.title') || "오프라인 이용",
      description: audioT('features.offline.description') || "다운로드 후 인터넷 없이도 언제든 청취 가능"
    }
  ];
  
  return (
    <>
      <KeywordPageSchema 
        keyword={audioT('meta.keyword')}
        pagePath="/audio-guide"
        title={audioT('meta.title')}
        description={audioT('meta.description')}
        features={features.map(feature => feature.title)}
      />
      
      <div className="min-h-screen" style={{ 
        /* Typography tokens */
        '--font-family-base': '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
        '--fs-h1-d': '40px', '--fs-h1-t': '34px', '--fs-h1-m': '28px',
        '--fs-h2-d': '32px', '--fs-h2-t': '28px', '--fs-h2-m': '24px',
        '--fs-h3-d': '24px', '--fs-h3-t': '22px', '--fs-h3-m': '20px',
        '--fs-body-l-d': '18px', '--fs-body-l-t': '18px', '--fs-body-l-m': '16px',
        '--fs-body-d': '16px', '--fs-body-t': '16px', '--fs-body-m': '14px',
        '--fs-body-s-d': '14px', '--fs-body-s-t': '14px', '--fs-body-s-m': '13px',
        '--lh-heading': '1.2', '--lh-body': '1.5',
        /* Radius and shadow tokens */
        '--radius-sm': '4px', '--radius-md': '8px', '--radius-lg': '16px',
        '--shadow-sm': '0 1px 2px rgba(0,0,0,.06)', '--shadow-md': '0 4px 10px rgba(0,0,0,.08)', '--shadow-lg': '0 12px 24px rgba(0,0,0,.12)',
        /* Spacing tokens */
        '--space-2xs': '4px', '--space-xs': '8px', '--space-sm': '12px', '--space-md': '16px', '--space-lg': '24px', '--space-xl': '40px', '--space-2xl': '64px',
        /* Color tokens - styleguide.md compliant */
        '--color-bg': '#ffffff', '--color-bg-alt': '#f8f8f8', '--color-text-high': '#000000', '--color-text-medium': '#555555', '--color-text-low': 'rgba(0,0,0,0.54)',
        '--color-primary': '#007AFF', '--color-primary-hover': '#005FCC', '--color-border': '#e6e6e6',
        backgroundColor: 'var(--color-bg)',
        fontFamily: 'var(--font-family-base)'
      } as React.CSSProperties}>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-12 lg:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center rounded-full font-medium font-light" style={{ 
              fontSize: 'var(--fs-body-s-d)', 
              paddingLeft: 'var(--space-lg)', 
              paddingRight: 'var(--space-lg)', 
              paddingTop: 'var(--space-sm)', 
              paddingBottom: 'var(--space-sm)', 
              backgroundColor: 'var(--color-bg-alt)', 
              border: '1px solid var(--color-border)', 
              color: 'var(--color-text-medium)', 
              marginBottom: 'var(--space-xl)' 
            } as React.CSSProperties}>
              {audioT('hero.badge')}
            </div>
            <h1 className="font-light tracking-tight" style={{ 
              fontSize: 'clamp(var(--fs-h1-m), 4vw, var(--fs-h1-d))', 
              lineHeight: 'var(--lh-heading)', 
              color: 'var(--color-text-high)', 
              marginBottom: 'var(--space-lg)' 
            } as React.CSSProperties}>
              {audioT('hero.title')}
            </h1>
            <h2 className="font-normal" style={{ 
              fontSize: 'clamp(var(--fs-h2-m), 3vw, var(--fs-h2-d))', 
              lineHeight: 'var(--lh-heading)', 
              color: 'var(--color-text-medium)', 
              marginBottom: 'var(--space-xl)' 
            } as React.CSSProperties}>
              {audioT('hero.titleBold')}
            </h2>
            <p className="font-light max-w-3xl mx-auto" style={{ 
              fontSize: 'clamp(var(--fs-body-d), 2vw, var(--fs-body-l-d))', 
              lineHeight: 'var(--lh-body)', 
              color: 'var(--color-text-medium)', 
              marginBottom: 'var(--space-2xl)' 
            } as React.CSSProperties}>
              {audioT('hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link 
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 shadow-sm min-h-[44px] min-w-[200px]"
              >
                {audioT('hero.startFree')}
              </Link>
              <Link 
                href="#features"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-black border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-h-[44px] min-w-[200px]"
              >
                {audioT('hero.exploreFeatures')}
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 lg:py-16 bg-[#F8F8F8]">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-light text-black mb-4 tracking-tight">
                {audioT('features.title')}
              </h2>
              <p className="text-lg text-[#555555] font-light">
                {audioT('features.titleBold')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-gray-400 rounded"></div>
                  </div>
                  <h3 className="text-lg font-medium text-black mb-3">{feature.title}</h3>
                  <p className="text-[#555555] font-light text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-light text-black mb-4 tracking-tight">
                {audioT('comparison.title')}
              </h2>
              <p className="text-lg text-[#555555] font-light">
                {audioT('comparison.titleBold')}
              </p>
            </div>
            
            <div className="max-w-5xl mx-auto">
              <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
                <div className="grid md:grid-cols-2">
                  {/* 기존 오디오 가이드 */}
                  <div className="p-8 border-r border-[#E5E5E5]">
                    <h3 className="text-xl font-medium mb-6 text-[#555555]">
                      {audioT('comparison.existing.title')}
                    </h3>
                    <ul className="space-y-4">
                      {existingLimitations.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          </div>
                          <span className="text-[#555555] font-light text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                
                  {/* Trip Radio */}
                  <div className="p-8 bg-[#F8F8F8]">
                    <h3 className="text-xl font-medium mb-6 text-black">
                      {audioT('comparison.tripRadio.title')}
                    </h3>
                    <ul className="space-y-4">
                      {tripRadioAdvantages.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          </div>
                          <span className="text-[#555555] font-light text-sm">{item}</span>
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
        <section className="py-12 lg:py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-light mb-6 tracking-tight">
                {audioT('cta.title')}
              </h2>
              <p className="text-lg lg:text-xl text-gray-300 mb-8 leading-relaxed">
                {audioT('cta.description')}
              </p>
              <Link 
                href="/"
                className="inline-block bg-white text-black px-10 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg min-h-[44px] flex items-center justify-center"
              >
                {audioT('cta.startFree')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}