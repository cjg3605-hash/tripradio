'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

export default function AiTravelPage() {
  const { t } = useLanguage();
  
  // ai-travel 전용 번역 함수
  const aiTravelT = (key: string): string => {
    const translation = t(`aiTravel.${key}`);
    return Array.isArray(translation) ? translation[0] || '' : translation || '';
  };

  // 기존 문제점 데이터
  const existingProblems = [
    {
      title: aiTravelT('futureOfTravel.existingProblems.title') || "기존 여행의 한계",
      items: [
        aiTravelT('futureOfTravel.existingProblems.items.0') || "복잡하고 시간 소모적인 계획 과정",
        aiTravelT('futureOfTravel.existingProblems.items.1') || "개인 취향을 고려하지 않는 획일적 추천",
        aiTravelT('futureOfTravel.existingProblems.items.2') || "실시간 정보 부족으로 인한 불편함",
        aiTravelT('futureOfTravel.existingProblems.items.3') || "언어 장벽으로 인한 제한적 경험",
        aiTravelT('futureOfTravel.existingProblems.items.4') || "높은 비용과 예약의 복잡성"
      ]
    }
  ];

  // AI 혁신 데이터
  const aiInnovation = [
    {
      title: aiTravelT('futureOfTravel.aiInnovation.title') || "AI 혁신",
      items: [
        aiTravelT('futureOfTravel.aiInnovation.items.0') || "개인 맞춤형 실시간 여행 계획",
        aiTravelT('futureOfTravel.aiInnovation.items.1') || "빅데이터 기반 최적화된 추천",
        aiTravelT('futureOfTravel.aiInnovation.items.2') || "다국어 지원으로 언어 장벽 해결",
        aiTravelT('futureOfTravel.aiInnovation.items.3') || "실시간 정보 업데이트와 대응",
        aiTravelT('futureOfTravel.aiInnovation.items.4') || "스마트한 예산 관리와 비용 최적화"
      ]
    }
  ];

  // 미래 여행 데이터
  const futureTravel = [
    {
      title: aiTravelT('futureOfTravel.futureTravel.title') || "미래의 여행",
      items: [
        aiTravelT('futureOfTravel.futureTravel.items.0') || "AI 비서가 동반하는 완벽한 여행",
        aiTravelT('futureOfTravel.futureTravel.items.1') || "예측 분석을 통한 문제 사전 해결",
        aiTravelT('futureOfTravel.futureTravel.items.2') || "개인화된 문화 체험과 현지 정보",
        aiTravelT('futureOfTravel.futureTravel.items.3') || "실시간 번역과 문화적 안내",
        aiTravelT('futureOfTravel.futureTravel.items.4') || "지속 가능하고 책임감 있는 여행"
      ]
    }
  ];

  // AI 기능 데이터
  const aiFeatures = [
    {
      title: aiTravelT('aiFeatures.intelligentContent.title') || "지능형 콘텐츠 생성",
      description: aiTravelT('aiFeatures.intelligentContent.description') || "AI가 실시간으로 생성하는 맞춤형 여행 콘텐츠"
    },
    {
      title: aiTravelT('aiFeatures.personalization.title') || "개인화 엔진",
      description: aiTravelT('aiFeatures.personalization.description') || "개인 취향과 선호도 기반 맞춤형 추천"
    },
    {
      title: aiTravelT('aiFeatures.locationRecognition.title') || "위치 인식",
      description: aiTravelT('aiFeatures.locationRecognition.description') || "정확한 위치 기반 실시간 정보 제공"
    },
    {
      title: aiTravelT('aiFeatures.voiceSynthesis.title') || "음성 합성",
      description: aiTravelT('aiFeatures.voiceSynthesis.description') || "자연스러운 음성으로 전달되는 여행 가이드"
    },
    {
      title: aiTravelT('aiFeatures.dataIntegration.title') || "데이터 통합",
      description: aiTravelT('aiFeatures.dataIntegration.description') || "다양한 소스의 실시간 데이터 통합 분석"
    },
    {
      title: aiTravelT('aiFeatures.continuousLearning.title') || "지속적 학습",
      description: aiTravelT('aiFeatures.continuousLearning.description') || "사용자 피드백을 통한 AI 성능 향상"
    }
  ];

  // AI 여행 과정 데이터
  const aiJourney = [
    {
      title: aiTravelT('aiJourney.planning.title') || "여행 계획",
      description: aiTravelT('aiJourney.planning.description') || "AI가 개인 취향을 분석하여 최적의 여행 계획을 수립합니다",
      example: aiTravelT('aiJourney.planning.example') || "예시: 3일간의 파리 여행 - 예술과 음식 중심 코스"
    },
    {
      title: aiTravelT('aiJourney.navigation.title') || "실시간 안내",
      description: aiTravelT('aiJourney.navigation.description') || "현재 위치를 인식하여 실시간으로 최적의 경로를 안내합니다",
      example: aiTravelT('aiJourney.navigation.example') || "예시: 루브르 박물관까지 15분, 지하철 1호선 이용 추천"
    },
    {
      title: aiTravelT('aiJourney.commentary.title') || "음성 해설",
      description: aiTravelT('aiJourney.commentary.description') || "방문지에 대한 풍부한 정보를 자연스러운 음성으로 제공합니다",
      example: aiTravelT('aiJourney.commentary.example') || "예시: 에펠탑의 역사와 건축 기법에 대한 상세한 설명"
    },
    {
      title: aiTravelT('aiJourney.realTimeInfo.title') || "실시간 정보",
      description: aiTravelT('aiJourney.realTimeInfo.description') || "날씨, 교통, 운영시간 등 실시간 정보를 지속적으로 업데이트합니다",
      example: aiTravelT('aiJourney.realTimeInfo.example') || "예시: 비 예보로 인한 실내 활동 추천 및 일정 조정"
    }
  ];

  // 혜택 데이터
  const benefits = [
    {
      title: aiTravelT('benefits.costSaving.title') || "비용 절약",
      description: aiTravelT('benefits.costSaving.description') || "AI 최적화를 통한 효율적인 예산 관리"
    },
    {
      title: aiTravelT('benefits.timeSaving.title') || "시간 절약",
      description: aiTravelT('benefits.timeSaving.description') || "즉시 생성되는 맞춤형 여행 계획"
    },
    {
      title: aiTravelT('benefits.personalization.title') || "개인화",
      description: aiTravelT('benefits.personalization.description') || "개인 취향에 완벽하게 맞춘 여행 경험"
    },
    {
      title: aiTravelT('benefits.languageBarrier.title') || "언어 장벽 해결",
      description: aiTravelT('benefits.languageBarrier.description') || "실시간 번역과 다국어 지원"
    },
    {
      title: aiTravelT('benefits.realTimeUpdate.title') || "실시간 업데이트",
      description: aiTravelT('benefits.realTimeUpdate.description') || "변화하는 상황에 즉시 대응"
    },
    {
      title: aiTravelT('benefits.richInformation.title') || "풍부한 정보",
      description: aiTravelT('benefits.richInformation.description') || "전문가 수준의 상세한 여행 정보"
    }
  ];
  
  return (
    <>
      <KeywordPageSchema 
        keyword={aiTravelT('meta.keyword')}
        pagePath="/ai-travel"
        title={aiTravelT('meta.title')}
        description={aiTravelT('meta.description')}
        features={aiFeatures.map(feature => feature.title)}
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
              {aiTravelT('hero.badge')}
            </div>
            <h1 className="font-light tracking-tight" style={{ 
              fontSize: 'clamp(var(--fs-h1-m), 4vw, var(--fs-h1-d))', 
              lineHeight: 'var(--lh-heading)', 
              color: 'var(--color-text-high)', 
              marginBottom: 'var(--space-lg)' 
            } as React.CSSProperties}>
              {aiTravelT('hero.title')}
            </h1>
            <h2 className="font-normal" style={{ 
              fontSize: 'clamp(var(--fs-h2-m), 3vw, var(--fs-h2-d))', 
              lineHeight: 'var(--lh-heading)', 
              color: 'var(--color-text-medium)', 
              marginBottom: 'var(--space-xl)' 
            } as React.CSSProperties}>
              {aiTravelT('hero.titleBold')}
            </h2>
            <p className="font-light max-w-3xl mx-auto" style={{ 
              fontSize: 'clamp(var(--fs-body-d), 2vw, var(--fs-body-l-d))', 
              lineHeight: 'var(--lh-body)', 
              color: 'var(--color-text-medium)', 
              marginBottom: 'var(--space-2xl)' 
            } as React.CSSProperties}>
              {aiTravelT('hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link 
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 shadow-sm min-h-[44px] min-w-[200px]"
              >
                {aiTravelT('hero.startFree')}
              </Link>
              <Link 
                href="#ai-features"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-black border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-h-[44px] min-w-[200px]"
              >
                {aiTravelT('hero.exploreFeaturesButton')}
              </Link>
            </div>
          </div>
        </section>

        {/* Future of Travel Section */}
        <section className="py-12 lg:py-16 bg-[#F8F8F8]">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-light text-black mb-4 tracking-tight">
                {aiTravelT('futureOfTravel.title')}
              </h2>
              <p className="text-lg text-[#555555] font-light">
                {aiTravelT('futureOfTravel.titleBold')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* 기존 문제점 */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                </div>
                <h3 className="text-lg font-medium text-black mb-3">{existingProblems[0].title}</h3>
                <ul className="text-[#555555] font-light text-sm space-y-2">
                  {existingProblems[0].items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI 혁신 */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                </div>
                <h3 className="text-lg font-medium text-black mb-3">{aiInnovation[0].title}</h3>
                <ul className="text-[#555555] font-light text-sm space-y-2">
                  {aiInnovation[0].items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 미래 여행 */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                </div>
                <h3 className="text-lg font-medium text-black mb-3">{futureTravel[0].title}</h3>
                <ul className="text-[#555555] font-light text-sm space-y-2">
                  {futureTravel[0].items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* AI Features Section */}
        <section id="ai-features" className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-light text-black mb-4 tracking-tight">
                {aiTravelT('aiFeatures.title')}
              </h2>
              <p className="text-lg text-[#555555] font-light">
                {aiTravelT('aiFeatures.titleBold')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {aiFeatures.map((feature, index) => (
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

        {/* AI Journey Section */}
        <section className="py-12 lg:py-16 bg-[#F8F8F8]">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-light text-black mb-4 tracking-tight">
                {aiTravelT('aiJourney.title')}
              </h2>
              <p className="text-lg text-[#555555] font-light">
                {aiTravelT('aiJourney.titleBold')}
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-8">
              {aiJourney.map((step, index) => (
                <div key={index} className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-[#F8F8F8] rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 bg-gray-400 rounded"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-medium text-black mb-3">{step.title}</h3>
                      <p className="text-[#555555] font-light mb-3 leading-relaxed">
                        {step.description}
                      </p>
                      <div className="bg-[#F8F8F8] p-4 rounded-lg">
                        <p className="text-sm text-[#555555] font-light">
                          {step.example}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-light text-black mb-4 tracking-tight">
                {aiTravelT('benefits.title')}
              </h2>
              <p className="text-lg text-[#555555] font-light">
                {aiTravelT('benefits.titleBold')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-gray-400 rounded"></div>
                  </div>
                  <h3 className="text-lg font-medium text-black mb-3">{benefit.title}</h3>
                  <p className="text-[#555555] font-light text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 lg:py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-light mb-6 tracking-tight">
                {aiTravelT('cta.title')}
              </h2>
              <p className="text-lg lg:text-xl text-gray-300 mb-8 leading-relaxed">
                {aiTravelT('cta.description')}
              </p>
              <Link 
                href="/"
                className="inline-block bg-white text-black px-10 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg min-h-[44px] flex items-center justify-center"
              >
                {aiTravelT('cta.startFree')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}