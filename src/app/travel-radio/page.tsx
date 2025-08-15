'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

export default function TravelRadioPage() {
  const { t } = useLanguage();
  
  // travel-radio 전용 번역 함수
  const travelRadioT = (key: string): string => {
    const translation = t(`travelRadio.${key}`);
    return Array.isArray(translation) ? translation[0] || '' : translation || '';
  };

  // 문제점 데이터
  const problems = [
    {
      title: travelRadioT('whyNeeded.problems.0.title') || "지루한 여행",
      description: travelRadioT('whyNeeded.problems.0.description') || "단조롭고 재미없는 여행 경험"
    },
    {
      title: travelRadioT('whyNeeded.problems.1.title') || "스마트폰 의존",
      description: travelRadioT('whyNeeded.problems.1.description') || "화면만 보며 놓치는 소중한 순간들"
    },
    {
      title: travelRadioT('whyNeeded.problems.2.title') || "높은 비용",
      description: travelRadioT('whyNeeded.problems.2.description') || "비싼 현지 가이드와 투어 비용"
    }
  ];

  // 특별한 경험 기능 데이터
  const specialFeatures = [
    {
      title: travelRadioT('specialExperience.features.0.title') || "라디오 DJ 스타일",
      description: travelRadioT('specialExperience.features.0.description') || "친근한 DJ가 들려주는 여행 이야기"
    },
    {
      title: travelRadioT('specialExperience.features.1.title') || "맞춤형 콘텐츠",
      description: travelRadioT('specialExperience.features.1.description') || "개인 취향에 맞는 여행 정보"
    },
    {
      title: travelRadioT('specialExperience.features.2.title') || "전세계 지원",
      description: travelRadioT('specialExperience.features.2.description') || "180개국 어디서나 이용 가능"
    },
    {
      title: travelRadioT('specialExperience.features.3.title') || "진짜 라디오",
      description: travelRadioT('specialExperience.features.3.description') || "실제 라디오 방송 같은 몰입감"
    },
    {
      title: travelRadioT('specialExperience.features.4.title') || "완전 무료",
      description: travelRadioT('specialExperience.features.4.description') || "모든 기능을 무료로 제공"
    },
    {
      title: travelRadioT('specialExperience.features.5.title') || "편안한 청취",
      description: travelRadioT('specialExperience.features.5.description') || "편안하게 들으며 즐기는 여행"
    }
  ];

  // 라디오 유형 데이터
  const radioTypes = [
    {
      title: travelRadioT('radioTypes.categories.0.title') || "역사 탐방",
      description: travelRadioT('radioTypes.categories.0.description') || "유적지와 문화유산의 깊은 이야기"
    },
    {
      title: travelRadioT('radioTypes.categories.1.title') || "자연 체험",
      description: travelRadioT('radioTypes.categories.1.description') || "아름다운 자연과 풍경 이야기"
    },
    {
      title: travelRadioT('radioTypes.categories.2.title') || "음식 문화",
      description: travelRadioT('radioTypes.categories.2.description') || "현지 음식과 요리 문화 탐방"
    },
    {
      title: travelRadioT('radioTypes.categories.3.title') || "예술 문화",
      description: travelRadioT('radioTypes.categories.3.description') || "미술관과 문화 예술 체험"
    },
    {
      title: travelRadioT('radioTypes.categories.4.title') || "도시 탐방",
      description: travelRadioT('radioTypes.categories.4.description') || "현대적인 도시의 매력 발견"
    },
    {
      title: travelRadioT('radioTypes.categories.5.title') || "야경 투어",
      description: travelRadioT('radioTypes.categories.5.description') || "밤에 펼쳐지는 특별한 풍경"
    }
  ];

  // 사용 방법 단계
  const steps = [
    {
      title: travelRadioT('howToListen.steps.0.title') || "목적지 선택",
      description: travelRadioT('howToListen.steps.0.description') || "여행할 도시나 장소를 선택합니다"
    },
    {
      title: travelRadioT('howToListen.steps.1.title') || "테마 선택",
      description: travelRadioT('howToListen.steps.1.description') || "관심 있는 여행 테마를 선택합니다"
    },
    {
      title: travelRadioT('howToListen.steps.2.title') || "라디오 생성",
      description: travelRadioT('howToListen.steps.2.description') || "AI가 맞춤형 라디오를 제작합니다"
    },
    {
      title: travelRadioT('howToListen.steps.3.title') || "여행 청취",
      description: travelRadioT('howToListen.steps.3.description') || "편안하게 들으며 여행을 즐깁니다"
    }
  ];

  // 후기 데이터
  const testimonials = [
    {
      content: travelRadioT('testimonials.reviews.0.content') || "정말 특별한 여행 경험이었어요. 마치 현지 친구가 안내해주는 것 같았습니다.",
      author: travelRadioT('testimonials.reviews.0.author') || "김지현, 파리 여행"
    },
    {
      content: travelRadioT('testimonials.reviews.1.content') || "무료로 이런 퀄리티의 가이드를 들을 수 있다는 게 놀라워요.",
      author: travelRadioT('testimonials.reviews.1.author') || "박민수, 로마 여행"
    },
    {
      content: travelRadioT('testimonials.reviews.2.content') || "라디오 형식이라 정말 편하게 들으며 여행할 수 있었어요.",
      author: travelRadioT('testimonials.reviews.2.author') || "이수진, 도쿄 여행"
    }
  ];
  
  return (
    <>
      <KeywordPageSchema 
        keyword={travelRadioT('keyword')}
        pagePath="/travel-radio"
        title={travelRadioT('metadata.title')}
        description={travelRadioT('metadata.description')}
        features={specialFeatures.map(feature => feature.title)}
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
              {travelRadioT('badge')}
            </div>
            <h1 className="font-light tracking-tight" style={{ 
              fontSize: 'clamp(var(--fs-h1-m), 4vw, var(--fs-h1-d))', 
              lineHeight: 'var(--lh-heading)', 
              color: 'var(--color-text-high)', 
              marginBottom: 'var(--space-lg)' 
            } as React.CSSProperties}>
              {travelRadioT('hero.title')}
            </h1>
            <h2 className="font-normal" style={{ 
              fontSize: 'clamp(var(--fs-h2-m), 3vw, var(--fs-h2-d))', 
              lineHeight: 'var(--lh-heading)', 
              color: 'var(--color-text-medium)', 
              marginBottom: 'var(--space-xl)' 
            } as React.CSSProperties}>
              {travelRadioT('hero.subtitle')}
            </h2>
            <p className="font-light max-w-3xl mx-auto" style={{ 
              fontSize: 'clamp(var(--fs-body-d), 2vw, var(--fs-body-l-d))', 
              lineHeight: 'var(--lh-body)', 
              color: 'var(--color-text-medium)', 
              marginBottom: 'var(--space-2xl)' 
            } as React.CSSProperties}>
              {travelRadioT('hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link 
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 shadow-sm min-h-[44px] min-w-[200px]"
              >
                {travelRadioT('cta.primary')}
              </Link>
              <Link 
                href="#why-travel-radio"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-black border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-h-[44px] min-w-[200px]"
              >
                {travelRadioT('cta.secondary')}
              </Link>
            </div>
          </div>
        </section>

        {/* Why Travel Radio Section */}
        <section id="why-travel-radio" className="py-12 lg:py-16 bg-[#F8F8F8]">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-light text-black mb-4 tracking-tight">
                {travelRadioT('whyNeeded.title')}
              </h2>
              <p className="text-lg text-[#555555] font-light">
                {travelRadioT('whyNeeded.subtitle')}
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

        {/* Special Experience Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-light text-black mb-4 tracking-tight">
                {travelRadioT('specialExperience.title')}
              </h2>
              <p className="text-lg text-[#555555] font-light">
                {travelRadioT('specialExperience.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {specialFeatures.map((feature, index) => (
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

        {/* Radio Types Section */}
        <section className="py-12 lg:py-16 bg-[#F8F8F8]">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-light text-black mb-4 tracking-tight">
                {travelRadioT('radioTypes.title')}
              </h2>
              <p className="text-lg text-[#555555] font-light">
                {travelRadioT('radioTypes.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {radioTypes.map((type, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-gray-400 rounded"></div>
                  </div>
                  <h3 className="text-lg font-medium text-black mb-3">{type.title}</h3>
                  <p className="text-[#555555] font-light text-sm leading-relaxed">
                    {type.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to Listen Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-light text-black mb-4 tracking-tight">
                {travelRadioT('howToListen.title')}
              </h2>
              <p className="text-lg text-[#555555] font-light">
                {travelRadioT('howToListen.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
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

        {/* Testimonials Section */}
        <section className="py-12 lg:py-16 bg-[#F8F8F8]">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-light text-black mb-4 tracking-tight">
                {travelRadioT('testimonials.title')}
              </h2>
              <p className="text-lg text-[#555555] font-light">
                {travelRadioT('testimonials.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6 mx-auto">
                    <div className="w-6 h-6 bg-gray-400 rounded"></div>
                  </div>
                  <p className="text-[#555555] font-light mb-6 italic leading-relaxed text-center">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <p className="text-sm text-[#555555] font-light text-center">{testimonial.author}</p>
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
                {travelRadioT('finalCta.title')}
              </h2>
              <p className="text-lg lg:text-xl text-gray-300 mb-8 leading-relaxed">
                {travelRadioT('finalCta.description')}
              </p>
              <Link 
                href="/"
                className="inline-block bg-white text-black px-10 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg min-h-[44px] flex items-center justify-center"
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