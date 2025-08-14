'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

export default function AiTravelPage() {
  const { translations } = useLanguage();
  
  // 간단한 번역 함수 - 안전한 접근
  const t = (key: string) => {
    if (!translations?.aiTravel) return key;
    try {
      const keys = key.split('.');
      let value: any = translations.aiTravel;
      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) return key;
      }
      return typeof value === 'string' ? value : key;
    } catch {
      return key;
    }
  };
  
  // 배열 데이터 직접 정의 (next-intl은 t.raw()를 지원하지 않음)
  const existingProblemsItems = [
    t('futureOfTravel.existingProblems.items.0') || "복잡하고 시간 소모적인 계획 과정",
    t('futureOfTravel.existingProblems.items.1') || "개인 취향을 고려하지 않는 획일적 추천",
    t('futureOfTravel.existingProblems.items.2') || "실시간 정보 부족으로 인한 불편함", 
    t('futureOfTravel.existingProblems.items.3') || "언어 장벽으로 인한 제한적 경험",
    t('futureOfTravel.existingProblems.items.4') || "높은 비용과 예약의 복잡성"
  ];
  
  const aiInnovationItems = [
    t('futureOfTravel.aiInnovation.items.0') || "개인 맞춤형 실시간 여행 계획",
    t('futureOfTravel.aiInnovation.items.1') || "빅데이터 기반 최적화된 추천",
    t('futureOfTravel.aiInnovation.items.2') || "다국어 지원으로 언어 장벽 해결",
    t('futureOfTravel.aiInnovation.items.3') || "실시간 정보 업데이트와 대응",
    t('futureOfTravel.aiInnovation.items.4') || "스마트한 예산 관리와 비용 최적화"
  ];
  
  const futureTravelItems = [
    t('futureOfTravel.futureTravel.items.0') || "AI 비서가 동반하는 완벽한 여행",
    t('futureOfTravel.futureTravel.items.1') || "예측 분석을 통한 문제 사전 해결",
    t('futureOfTravel.futureTravel.items.2') || "개인화된 문화 체험과 현지 정보",
    t('futureOfTravel.futureTravel.items.3') || "실시간 번역과 문화적 안내",
    t('futureOfTravel.futureTravel.items.4') || "지속 가능하고 책임감 있는 여행"
  ];
  
  return (
    <>
      <KeywordPageSchema 
        keyword={t('meta.keyword')}
        pagePath="/ai-travel"
        title={t('meta.title')}
        description={t('meta.description')}
        features={[t('aiFeatures.intelligentContent.title'), t('aiFeatures.personalization.title'), t('aiFeatures.locationRecognition.title'), t('aiFeatures.voiceSynthesis.title'), t('aiFeatures.dataIntegration.title'), t('aiFeatures.continuousLearning.title')]}
      />
      <div className="min-h-screen" style={{ 
        /* Typography tokens */
        '--font-family-base': '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
        '--fs-h1-d': '40px', '--fs-h1-t': '34px', '--fs-h1-m': '28px',
        '--fs-h2-d': '32px', '--fs-h2-t': '28px', '--fs-h2-m': '24px',
        '--fs-h3-d': '24px', '--fs-h3-t': '22px', '--fs-h3-m': '20px',
        '--fs-h4-d': '20px', '--fs-h4-t': '18px', '--fs-h4-m': '18px',
        '--fs-body-l-d': '18px', '--fs-body-l-t': '18px', '--fs-body-l-m': '16px',
        '--fs-body-d': '16px', '--fs-body-t': '16px', '--fs-body-m': '14px',
        '--fs-body-s-d': '14px', '--fs-body-s-t': '14px', '--fs-body-s-m': '13px',
        '--fs-caption': '12px', '--lh-heading': '1.2', '--lh-body': '1.5',
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
      <section className="container mx-auto" style={{ paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)', paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-2xl)' } as React.CSSProperties}>
        <div className="max-w-4xl mx-auto text-center">
          <div style={{ marginBottom: 'var(--space-xl)' } as React.CSSProperties}>
            <div className="inline-flex items-center font-medium" style={{ borderRadius: '9999px', fontSize: 'var(--fs-body-s-d)', paddingLeft: 'var(--space-md)', paddingRight: 'var(--space-md)', paddingTop: 'var(--space-xs)', paddingBottom: 'var(--space-xs)', marginBottom: 'var(--space-lg)', backgroundColor: 'var(--color-bg-alt)', color: 'var(--color-text-medium)' } as React.CSSProperties}>
              {t('hero.badge')}
            </div>
            <h1 className="font-semibold tracking-tight" style={{ fontSize: 'clamp(var(--fs-h1-m), 5vw, var(--fs-h1-d))', lineHeight: 'var(--lh-heading)', marginBottom: 'var(--space-lg)', color: 'var(--color-text-high)' } as React.CSSProperties}>
              {t('hero.title')} 
              <span className="font-light block" style={{ marginTop: 'var(--space-sm)' } as React.CSSProperties}>{t('hero.titleBold')}</span>
            </h1>
            <p className="font-light max-w-3xl mx-auto" style={{ fontSize: 'clamp(var(--fs-body-m), 1.5vw, var(--fs-body-l-d))', lineHeight: 'var(--lh-body)', marginBottom: 'var(--space-2xl)', color: 'var(--color-text-medium)' } as React.CSSProperties}>
              {t('hero.description')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center" style={{ gap: 'var(--space-md)' } as React.CSSProperties}>
            <Link 
              href="/"
              className="font-medium transition-colors duration-200 min-w-[200px]" 
              style={{ borderRadius: 'var(--radius-lg)', paddingLeft: 'var(--space-xl)', paddingRight: 'var(--space-xl)', paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)', backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' } as React.CSSProperties}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
            >
              {t('hero.startFree')}
            </Link>
            <Link 
              href="#ai-features"
              className="border font-medium transition-colors duration-200 min-w-[200px]"
              style={{ borderRadius: 'var(--radius-lg)', paddingLeft: 'var(--space-xl)', paddingRight: 'var(--space-xl)', paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)', borderColor: 'var(--color-text-medium)', color: 'var(--color-text-medium)' } as React.CSSProperties}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-alt)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {t('hero.exploreFeaturesButton')}
            </Link>
          </div>
        </div>
      </section>

      {/* Future of Travel Section */}
      <section style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-2xl)', backgroundColor: 'var(--color-bg-alt)' } as React.CSSProperties}>
        <div className="container mx-auto" style={{ paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)' } as React.CSSProperties}>
          <div className="max-w-4xl mx-auto text-center" style={{ marginBottom: 'var(--space-2xl)' } as React.CSSProperties}>
            <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-black leading-tight" style={{ marginBottom: 'var(--space-md)' } as React.CSSProperties}>
              {t('futureOfTravel.title')} 
              <span className="font-light block" style={{ marginTop: 'var(--space-2xs)' } as React.CSSProperties}>{t('futureOfTravel.titleBold')}</span>
            </h2>
            <div className="w-16 h-px bg-[#555555] mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto" style={{ gap: 'var(--space-xl)' } as React.CSSProperties}>
            <div className="bg-white rounded-lg border border-[#F8F8F8]" style={{ padding: 'var(--space-xl)' } as React.CSSProperties}>
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center" style={{ marginBottom: 'var(--space-lg)' } as React.CSSProperties}>
                <div className="w-6 h-6 border-2 border-[#555555] rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#555555] rounded-full"></div>
                </div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black leading-snug" style={{ marginBottom: 'var(--space-md)' } as React.CSSProperties}>{t('futureOfTravel.existingProblems.title')}</h3>
              <ul className="text-[#555555] text-sm font-light" style={{ gap: 'var(--space-xs)' } as React.CSSProperties}>
                {existingProblemsItems.map((item: string, index: number) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white rounded-lg border border-[#F8F8F8]" style={{ padding: 'var(--space-xl)' } as React.CSSProperties}>
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center" style={{ marginBottom: 'var(--space-lg)' } as React.CSSProperties}>
                <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black leading-snug" style={{ marginBottom: 'var(--space-md)' } as React.CSSProperties}>{t('futureOfTravel.aiInnovation.title')}</h3>
              <ul className="text-[#555555] text-sm font-light" style={{ gap: 'var(--space-xs)' } as React.CSSProperties}>
                {aiInnovationItems.map((item: string, index: number) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white rounded-lg border border-[#F8F8F8]" style={{ padding: 'var(--space-xl)' } as React.CSSProperties}>
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center" style={{ marginBottom: 'var(--space-lg)' } as React.CSSProperties}>
                <div className="w-6 h-6 border-2 border-[#007AFF] rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#007AFF] rounded-full"></div>
                </div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black leading-snug" style={{ marginBottom: 'var(--space-md)' } as React.CSSProperties}>{t('futureOfTravel.futureTravel.title')}</h3>
              <ul className="text-[#555555] text-sm font-light" style={{ gap: 'var(--space-xs)' } as React.CSSProperties}>
                {futureTravelItems.map((item: string, index: number) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section id="ai-features" className="bg-white" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-2xl)' } as React.CSSProperties}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-black mb-4 leading-tight">
              {t('aiFeatures.title')} 
              <span className="font-light block mt-1">{t('aiFeatures.titleBold')}</span>
            </h2>
            <div className="w-16 h-px bg-[#555555] mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center" style={{ marginBottom: 'var(--space-lg)' } as React.CSSProperties}>
                <div className="w-6 h-6 bg-[#555555] rounded-lg"></div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black leading-snug" style={{ marginBottom: 'var(--space-md)' } as React.CSSProperties}>{t('aiFeatures.intelligentContent.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('aiFeatures.intelligentContent.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center" style={{ marginBottom: 'var(--space-lg)' } as React.CSSProperties}>
                <div className="w-6 h-6 border-2 border-black rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 border border-black rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-black rounded-full"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black leading-snug" style={{ marginBottom: 'var(--space-md)' } as React.CSSProperties}>{t('aiFeatures.personalization.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('aiFeatures.personalization.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center" style={{ marginBottom: 'var(--space-lg)' } as React.CSSProperties}>
                <div className="w-4 h-6 bg-black rounded-full rounded-b-none flex items-end justify-center">
                  <div className="w-2 h-2 bg-white rounded-full mb-1"></div>
                </div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black leading-snug" style={{ marginBottom: 'var(--space-md)' } as React.CSSProperties}>{t('aiFeatures.locationRecognition.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('aiFeatures.locationRecognition.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center" style={{ marginBottom: 'var(--space-lg)' } as React.CSSProperties}>
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-[#555555] rounded-full"></div>
                  <div className="w-1 h-5 bg-[#555555] rounded-full"></div>
                  <div className="w-1 h-3 bg-[#555555] rounded-full"></div>
                  <div className="w-1 h-5 bg-[#555555] rounded-full"></div>
                </div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black leading-snug" style={{ marginBottom: 'var(--space-md)' } as React.CSSProperties}>{t('aiFeatures.voiceSynthesis.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('aiFeatures.voiceSynthesis.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center" style={{ marginBottom: 'var(--space-lg)' } as React.CSSProperties}>
                <div className="w-5 h-6 border-2 border-[#555555] rounded-sm">
                  <div className="h-full w-full flex flex-col justify-center space-y-0.5 px-1">
                    <div className="h-0.5 bg-[#555555] rounded"></div>
                    <div className="h-0.5 bg-[#555555] rounded"></div>
                    <div className="h-0.5 bg-[#555555] rounded"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black leading-snug" style={{ marginBottom: 'var(--space-md)' } as React.CSSProperties}>{t('aiFeatures.dataIntegration.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('aiFeatures.dataIntegration.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center" style={{ marginBottom: 'var(--space-lg)' } as React.CSSProperties}>
                <div className="w-6 h-6 border-2 border-[#555555] rounded-full relative">
                  <div className="absolute -top-1 right-0 w-2 h-2">
                    <div className="w-0 h-0 border-l-2 border-b-2 border-[#555555] rotate-45"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black leading-snug" style={{ marginBottom: 'var(--space-md)' } as React.CSSProperties}>{t('aiFeatures.continuousLearning.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('aiFeatures.continuousLearning.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Journey Section */}
      <section className="py-16 lg:py-24 bg-[#F8F8F8]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-black mb-4 leading-tight">
              {t('aiJourney.title')} 
              <span className="font-light block mt-1">{t('aiJourney.titleBold')}</span>
            </h2>
            <div className="w-16 h-px bg-[#555555] mx-auto"></div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-[#F8F8F8] rounded-lg flex items-center justify-center">
                    <div className="w-8 h-10 border-2 border-[#555555] rounded-sm">
                      <div className="h-full w-full flex flex-col justify-start pt-2 space-y-1 px-1">
                        <div className="h-0.5 bg-[#555555] rounded"></div>
                        <div className="h-0.5 bg-[#555555] rounded"></div>
                        <div className="h-0.5 bg-[#555555] rounded"></div>
                        <div className="h-0.5 bg-[#555555] rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-fluid-2xl font-semibold text-black mb-3 leading-snug">{t('aiJourney.planning.title')}</h3>
                    <p className="text-[#555555] font-light mb-3">
                      {t('aiJourney.planning.description')}
                    </p>
                    <div className="bg-[#F8F8F8] p-4 rounded-lg">
                      <p className="text-sm text-[#555555] font-light">
                        {t('aiJourney.planning.example')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-[#F8F8F8] rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[#555555] rounded-full relative">
                      <div className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-[#555555] transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                      <div className="absolute top-1 left-1/2 w-0 h-0 border-l-2 border-r-2 border-b-3 border-transparent border-b-[#007AFF] transform -translate-x-1/2"></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-fluid-2xl font-semibold text-black mb-3 leading-snug">{t('aiJourney.navigation.title')}</h3>
                    <p className="text-[#555555] font-light mb-3">
                      {t('aiJourney.navigation.description')}
                    </p>
                    <div className="bg-[#F8F8F8] p-4 rounded-lg">
                      <p className="text-sm text-[#555555] font-light">
                        {t('aiJourney.navigation.example')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-[#F8F8F8] rounded-lg flex items-center justify-center">
                    <div className="relative">
                      <div className="w-6 h-8 border-2 border-[#555555] rounded-t-full"></div>
                      <div className="absolute bottom-0 left-1/2 w-4 h-2 bg-[#555555] rounded-sm transform -translate-x-1/2 translate-y-1"></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-fluid-2xl font-semibold text-black mb-3 leading-snug">{t('aiJourney.commentary.title')}</h3>
                    <p className="text-[#555555] font-light mb-3">
                      {t('aiJourney.commentary.description')}
                    </p>
                    <div className="bg-[#F8F8F8] p-4 rounded-lg">
                      <p className="text-sm text-[#555555] font-light">
                        {t('aiJourney.commentary.example')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-[#F8F8F8] rounded-lg flex items-center justify-center">
                    <div className="w-6 h-10 border-2 border-[#555555] rounded-lg">
                      <div className="h-full w-full flex flex-col justify-center items-center space-y-1">
                        <div className="w-4 h-2 bg-[#F8F8F8] rounded"></div>
                        <div className="w-4 h-3 bg-[#007AFF] rounded-sm"></div>
                        <div className="w-1 h-1 bg-[#555555] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-fluid-2xl font-semibold text-black mb-3 leading-snug">{t('aiJourney.realTimeInfo.title')}</h3>
                    <p className="text-[#555555] font-light mb-3">
                      {t('aiJourney.realTimeInfo.description')}
                    </p>
                    <div className="bg-[#F8F8F8] p-4 rounded-lg">
                      <p className="text-sm text-[#555555] font-light">
                        {t('aiJourney.realTimeInfo.example')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-black mb-4 leading-tight">
              {t('benefits.title')} 
              <span className="font-light block mt-1">{t('benefits.titleBold')}</span>
            </h2>
            <div className="w-16 h-px bg-[#555555] mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#555555] rounded-full flex items-center justify-center">
                      <div className="text-xs font-bold text-[#555555]">$</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-2 leading-snug">{t('benefits.costSaving.title')}</h3>
                    <p className="text-[#555555] font-light">
                      {t('benefits.costSaving.description')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#555555] rounded-full relative">
                      <div className="absolute top-1/2 left-1/2 w-2 h-0.5 bg-[#555555] transform -translate-x-1/2 -translate-y-1/2 origin-left rotate-90"></div>
                      <div className="absolute top-1/2 left-1/2 w-1.5 h-0.5 bg-[#555555] transform -translate-x-1/2 -translate-y-1/2 origin-left"></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-fluid-xl font-semibold text-black mb-2 leading-snug">{t('benefits.timeSaving.title')}</h3>
                    <p className="text-[#555555] font-light">
                      {t('benefits.timeSaving.description')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-black rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 border border-black rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-fluid-xl font-semibold text-black mb-2 leading-snug">{t('benefits.personalization.title')}</h3>
                    <p className="text-[#555555] font-light">
                      {t('benefits.personalization.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#555555] rounded-full relative">
                      <div className="absolute top-1 left-1.5 w-3 h-2 border border-[#555555] rounded-full"></div>
                      <div className="absolute bottom-1.5 right-1 w-2 h-1.5 border border-[#555555] rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-fluid-xl font-semibold text-black mb-2 leading-snug">{t('benefits.languageBarrier.title')}</h3>
                    <p className="text-[#555555] font-light">
                      {t('benefits.languageBarrier.description')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#555555] rounded-full relative">
                      <div className="absolute -top-1 right-0 w-2 h-2">
                        <div className="w-0 h-0 border-l-2 border-b-2 border-[#555555] rotate-45"></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-fluid-xl font-semibold text-black mb-2 leading-snug">{t('benefits.realTimeUpdate.title')}</h3>
                    <p className="text-[#555555] font-light">
                      {t('benefits.realTimeUpdate.description')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center">
                    <div className="w-5 h-6 border-2 border-[#555555] rounded-sm">
                      <div className="h-full w-full flex flex-col justify-center space-y-0.5 px-1">
                        <div className="h-0.5 bg-[#555555] rounded"></div>
                        <div className="h-0.5 bg-[#555555] rounded"></div>
                        <div className="h-0.5 bg-[#555555] rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-fluid-xl font-semibold text-black mb-2 leading-snug">{t('benefits.richInformation.title')}</h3>
                    <p className="text-[#555555] font-light">
                      {t('benefits.richInformation.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold mb-4 leading-tight">
              {t('cta.title')}
            </h2>
            <p className="text-[clamp(1rem,1.2vw,1.125rem)] font-light text-white mb-8 leading-relaxed max-w-2xl mx-auto">
              {t('cta.description')}
            </p>
            <Link 
              href="/"
              className="inline-block bg-[#007AFF] text-white px-10 py-4 rounded-lg font-medium hover:bg-[#005FCC] transition-colors duration-200"
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
