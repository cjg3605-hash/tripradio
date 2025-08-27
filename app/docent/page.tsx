'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

export default function DocentPage() {
  const { t } = useLanguage();
  
  // docent 전용 번역 함수
  const docentT = (key: string): string => {
    const translation = t(`docent.${key}`);
    return Array.isArray(translation) ? translation[0] || '' : translation || '';
  };

  // 문제점 데이터
  const problems = [
    {
      title: docentT('problems.expensiveCost.title') || "높은 비용",
      description: docentT('problems.expensiveCost.description') || "기존 도슨트 서비스는 높은 비용으로 부담이 됩니다"
    },
    {
      title: docentT('problems.fixedSchedule.title') || "정해진 일정",
      description: docentT('problems.fixedSchedule.description') || "고정된 시간표로 개인 일정에 맞추기 어렵습니다"
    },
    {
      title: docentT('problems.genericContent.title') || "획일적 내용",
      description: docentT('problems.genericContent.description') || "개인의 관심사를 고려하지 않은 일반적인 설명입니다"
    }
  ];

  // 솔루션 기능 데이터
  const features = [
    {
      title: docentT('solution.features.customized.title') || "맞춤형 해설",
      description: docentT('solution.features.customized.description') || "개인 관심사에 맞춘 AI 도슨트 해설"
    },
    {
      title: docentT('solution.features.realTime.title') || "실시간 생성",
      description: docentT('solution.features.realTime.description') || "AI가 실시간으로 생성하는 전문 해설"
    },
    {
      title: docentT('solution.features.free.title') || "완전 무료",
      description: docentT('solution.features.free.description') || "모든 기능을 무료로 제공하는 서비스"
    },
    {
      title: docentT('solution.features.flexible.title') || "유연한 시간",
      description: docentT('solution.features.flexible.description') || "언제든 원할 때 이용 가능한 서비스"
    },
    {
      title: docentT('solution.features.worldwide.title') || "전세계 지원",
      description: docentT('solution.features.worldwide.description') || "전세계 박물관과 갤러리 지원"
    },
    {
      title: docentT('solution.features.smartphone.title') || "스마트폰 최적화",
      description: docentT('solution.features.smartphone.description') || "스마트폰으로 언제든 간편하게 이용"
    }
  ];

  // 사용 사례 데이터
  const useCases = [
    {
      title: docentT('useCases.museums.title') || "박물관",
      examples: [
        docentT('useCases.museums.examples.national') || "국립중앙박물관",
        docentT('useCases.museums.examples.history') || "역사박물관",
        docentT('useCases.museums.examples.science') || "과학관",
        docentT('useCases.museums.examples.international') || "국제 박물관"
      ]
    },
    {
      title: docentT('useCases.galleries.title') || "미술관",
      examples: [
        docentT('useCases.galleries.examples.national') || "국립현대미술관",
        docentT('useCases.galleries.examples.private') || "사립 갤러리",
        docentT('useCases.galleries.examples.international') || "해외 미술관",
        docentT('useCases.galleries.examples.outdoor') || "야외 조각공원"
      ]
    }
  ];

  // 사용 방법 단계
  const steps = [
    {
      title: docentT('howToUse.steps.search.title') || "장소 검색",
      description: docentT('howToUse.steps.search.description') || "방문할 박물관이나 갤러리를 검색합니다"
    },
    {
      title: docentT('howToUse.steps.interests.title') || "관심사 선택",
      description: docentT('howToUse.steps.interests.description') || "개인 관심사와 선호도를 선택합니다"
    },
    {
      title: docentT('howToUse.steps.listen.title') || "해설 청취",
      description: docentT('howToUse.steps.listen.description') || "AI가 생성한 맞춤형 해설을 청취합니다"
    }
  ];
  
  return (
    <>
      <KeywordPageSchema 
        keyword={docentT('meta.keyword')}
        pagePath="/docent"
        title={docentT('meta.title')}
        description={docentT('meta.description')}
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
              {docentT('hero.badge')}
            </div>
            <h1 className="font-light tracking-tight" style={{ 
              fontSize: 'clamp(var(--fs-h1-m), 4vw, var(--fs-h1-d))', 
              lineHeight: 'var(--lh-heading)', 
              color: 'var(--color-text-high)', 
              marginBottom: 'var(--space-lg)' 
            } as React.CSSProperties}>
              {docentT('hero.title')}
            </h1>
            <h2 className="font-normal" style={{ 
              fontSize: 'clamp(var(--fs-h2-m), 3vw, var(--fs-h2-d))', 
              lineHeight: 'var(--lh-heading)', 
              color: 'var(--color-text-medium)', 
              marginBottom: 'var(--space-xl)' 
            } as React.CSSProperties}>
              {docentT('hero.subtitle')}
            </h2>
            <p className="font-light max-w-3xl mx-auto" style={{ 
              fontSize: 'clamp(var(--fs-body-d), 2vw, var(--fs-body-l-d))', 
              lineHeight: 'var(--lh-body)', 
              color: 'var(--color-text-medium)', 
              marginBottom: 'var(--space-2xl)' 
            } as React.CSSProperties}>
              {docentT('hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link 
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 shadow-sm min-h-[44px] min-w-[200px]"
              >
                {docentT('hero.startFree')}
              </Link>
              <Link 
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-black border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-h-[44px] min-w-[200px]"
              >
                {docentT('hero.serviceIntro')}
              </Link>
            </div>
          </div>
        </section>

        {/* Problems Section */}
        <section className="py-12 lg:py-16 bg-[#F8F8F8]">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-light text-black mb-4 tracking-tight">
                {docentT('problems.title')}
              </h2>
              <p className="text-lg text-[#555555] font-light">
                {docentT('problems.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {problems.map((problem, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-gray-400 rounded"></div>
                  </div>
                  <h3 className="text-lg font-medium text-black mb-3">{problem.title}</h3>
                  <p className="text-[#555555] font-light text-sm leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section id="how-it-works" className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-light text-black mb-4 tracking-tight">
                {docentT('solution.title')}
              </h2>
              <p className="text-lg text-[#555555] font-light">
                {docentT('solution.subtitle')}
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

        {/* Use Cases Section */}
        <section className="py-12 lg:py-16 bg-[#F8F8F8]">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-light text-black mb-4 tracking-tight">
                {docentT('useCases.title')}
              </h2>
              <p className="text-lg text-[#555555] font-light">
                {docentT('useCases.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {useCases.map((useCase, index) => (
                <div key={index} className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <h3 className="text-xl font-medium text-black mb-6">
                    {useCase.title}
                  </h3>
                  <ul className="space-y-3">
                    {useCase.examples.map((example, exampleIndex) => (
                      <li key={exampleIndex} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-black flex-shrink-0 mt-2"></div>
                        <span className="text-[#555555] font-light text-sm">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to Use Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-light text-black mb-4 tracking-tight">
                {docentT('howToUse.title')}
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="bg-black text-white w-16 h-16 rounded-lg flex items-center justify-center text-xl font-medium mx-auto mb-6">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-medium text-black mb-4">{step.title}</h3>
                  <p className="text-[#555555] font-light text-sm leading-relaxed">
                    {step.description}
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
                {docentT('cta.title')}
              </h2>
              <p className="text-lg lg:text-xl text-gray-300 mb-8 leading-relaxed">
                {docentT('cta.description')}
              </p>
              <Link 
                href="/"
                className="inline-block bg-white text-black px-10 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg min-h-[44px] flex items-center justify-center"
              >
                {docentT('cta.startFree')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}