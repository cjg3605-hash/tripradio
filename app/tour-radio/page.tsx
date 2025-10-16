'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

export default function TourRadioPage() {
  const { t } = useLanguage();
  
  // tour-radio 전용 번역 함수
  const tourRadioT = (key: string): string => {
    const translation = t(`tourRadio.${key}`);
    return Array.isArray(translation) ? translation[0] || '' : translation || '';
  };

  // 문제점 데이터
  const problems = [
    {
      title: tourRadioT('problems.items.0.title') || "지루한 관광",
      description: tourRadioT('problems.items.0.description') || "획일적이고 재미없는 기존 가이드"
    },
    {
      title: tourRadioT('problems.items.1.title') || "딱딱한 설명",
      description: tourRadioT('problems.items.1.description') || "교과서 같은 지식 전달 방식"
    },
    {
      title: tourRadioT('problems.items.2.title') || "높은 비용",
      description: tourRadioT('problems.items.2.description') || "가이드 투어의 부담스러운 가격"
    },
    {
      title: tourRadioT('problems.items.3.title') || "시간 제약",
      description: tourRadioT('problems.items.3.description') || "정해진 시간에만 이용 가능"
    },
    {
      title: tourRadioT('problems.items.4.title') || "단체 행동",
      description: tourRadioT('problems.items.4.description') || "개인 취향을 고려하지 않는 단체 투어"
    },
    {
      title: tourRadioT('problems.items.5.title') || "언어 장벽",
      description: tourRadioT('problems.items.5.description') || "제한적인 언어 지원"
    }
  ];

  // 라디오 기능 데이터
  const radioFeatures = [
    {
      title: tourRadioT('radioFeatures.features.0.title') || "라디오 스타일",
      description: tourRadioT('radioFeatures.features.0.description') || "재미있고 몰입감 있는 라디오 방송 형태"
    },
    {
      title: tourRadioT('radioFeatures.features.1.title') || "스토리텔링",
      description: tourRadioT('radioFeatures.features.1.description') || "흥미진진한 이야기로 전하는 여행 정보"
    },
    {
      title: tourRadioT('radioFeatures.features.2.title') || "위치 기반",
      description: tourRadioT('radioFeatures.features.2.description') || "현재 위치에 맞는 맞춤 콘텐츠"
    },
    {
      title: tourRadioT('radioFeatures.features.3.title') || "배경음악",
      description: tourRadioT('radioFeatures.features.3.description') || "분위기를 살리는 음악과 효과음"
    },
    {
      title: tourRadioT('radioFeatures.features.4.title') || "인터랙티브",
      description: tourRadioT('radioFeatures.features.4.description') || "사용자와 소통하는 양방향 콘텐츠"
    },
    {
      title: tourRadioT('radioFeatures.features.5.title') || "전세계 지원",
      description: tourRadioT('radioFeatures.features.5.description') || "180개국 어디서나 이용 가능"
    }
  ];

  // 콘텐츠 유형 데이터
  const contentTypes = [
    {
      title: tourRadioT('contentTypes.items.0.title') || "역사 이야기",
      description: tourRadioT('contentTypes.items.0.description') || "흥미진진한 역사적 배경과 이야기"
    },
    {
      title: tourRadioT('contentTypes.items.1.title') || "숨겨진 명소",
      description: tourRadioT('contentTypes.items.1.description') || "현지인만 아는 특별한 장소들"
    },
    {
      title: tourRadioT('contentTypes.items.2.title') || "맛집 탐방",
      description: tourRadioT('contentTypes.items.2.description') || "현지 음식 문화와 맛집 정보"
    },
    {
      title: tourRadioT('contentTypes.items.3.title') || "미스터리",
      description: tourRadioT('contentTypes.items.3.description') || "신비롭고 흥미로운 도시 전설"
    }
  ];

  // 사용 방법 단계
  const steps = [
    {
      title: tourRadioT('howItWorks.steps.0.title') || "위치 선택",
      description: tourRadioT('howItWorks.steps.0.description') || "여행하고 싶은 도시나 장소를 선택합니다"
    },
    {
      title: tourRadioT('howItWorks.steps.1.title') || "콘텐츠 선택",
      description: tourRadioT('howItWorks.steps.1.description') || "관심 있는 주제와 스타일을 선택합니다"
    },
    {
      title: tourRadioT('howItWorks.steps.2.title') || "라디오 청취",
      description: tourRadioT('howItWorks.steps.2.description') || "AI가 생성한 맞춤형 라디오를 즐깁니다"
    }
  ];

  // 샘플 프로그램 데이터
  const samplePrograms = [
    {
      title: tourRadioT('samplePrograms.programs.0.title') || "파리 야경 투어",
      location: tourRadioT('samplePrograms.programs.0.location') || "파리, 프랑스",
      description: tourRadioT('samplePrograms.programs.0.description') || "에펠탑과 센 강변의 로맨틱한 야경을 배경으로 한 파리의 숨겨진 이야기",
      bgMusic: tourRadioT('samplePrograms.programs.0.bgMusic') || "프렌치 재즈"
    },
    {
      title: tourRadioT('samplePrograms.programs.1.title') || "로마 제국의 흔적",
      location: tourRadioT('samplePrograms.programs.1.location') || "로마, 이탈리아",
      description: tourRadioT('samplePrograms.programs.1.description') || "콜로세움과 포로 로마노에서 들려주는 고대 로마 황제들의 이야기",
      bgMusic: tourRadioT('samplePrograms.programs.1.bgMusic') || "클래식 오케스트라"
    },
    {
      title: tourRadioT('samplePrograms.programs.2.title') || "교토 사계절",
      location: tourRadioT('samplePrograms.programs.2.location') || "교토, 일본",
      description: tourRadioT('samplePrograms.programs.2.description') || "기온 거리와 청수사에서 만나는 일본 전통 문화와 사계절 이야기",
      bgMusic: tourRadioT('samplePrograms.programs.2.bgMusic') || "일본 전통 음악"
    },
    {
      title: tourRadioT('samplePrograms.programs.3.title') || "알프스 트레킹",
      location: tourRadioT('samplePrograms.programs.3.location') || "스위스",
      description: tourRadioT('samplePrograms.programs.3.description') || "융프라우와 마터호른에서 들려주는 알프스 산맥의 전설과 자연의 경이",
      bgMusic: tourRadioT('samplePrograms.programs.3.bgMusic') || "클래식 연주"
    },
    {
      title: tourRadioT('samplePrograms.programs.4.title') || "지중해 크루즈",
      location: tourRadioT('samplePrograms.programs.4.location') || "그리스",
      description: tourRadioT('samplePrograms.programs.4.description') || "산토리니와 미코노스 섬에서 펼쳐지는 그리스 신화와 에게해의 이야기",
      bgMusic: tourRadioT('samplePrograms.programs.4.bgMusic') || "지중해 음악"
    },
    {
      title: tourRadioT('samplePrograms.programs.5.title') || "뉴욕 브로드웨이",
      location: tourRadioT('samplePrograms.programs.5.location') || "뉴욕, 미국",
      description: tourRadioT('samplePrograms.programs.5.description') || "타임스퀘어와 브로드웨이에서 만나는 뮤지컬과 공연 예술의 세계",
      bgMusic: tourRadioT('samplePrograms.programs.5.bgMusic') || "브로드웨이 뮤지컬"
    }
  ];
  
  return (
    <>
      <KeywordPageSchema 
        keyword={tourRadioT('keyword')}
        pagePath="/tour-radio"
        title={tourRadioT('metadata.title')}
        description={tourRadioT('metadata.description')}
        features={radioFeatures.map(feature => feature.title)}
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
              {tourRadioT('badge')}
            </div>
            <h1 className="font-light tracking-tight" style={{ 
              fontSize: 'clamp(var(--fs-h1-m), 4vw, var(--fs-h1-d))', 
              lineHeight: 'var(--lh-heading)', 
              color: 'var(--color-text-high)', 
              marginBottom: 'var(--space-lg)' 
            } as React.CSSProperties}>
              {tourRadioT('hero.title')}
            </h1>
            <h2 className="font-normal" style={{ 
              fontSize: 'clamp(var(--fs-h2-m), 3vw, var(--fs-h2-d))', 
              lineHeight: 'var(--lh-heading)', 
              color: 'var(--color-text-medium)', 
              marginBottom: 'var(--space-xl)' 
            } as React.CSSProperties}>
              {tourRadioT('hero.subtitle')}
            </h2>
            <p className="font-light max-w-3xl mx-auto" style={{ 
              fontSize: 'clamp(var(--fs-body-d), 2vw, var(--fs-body-l-d))', 
              lineHeight: 'var(--lh-body)', 
              color: 'var(--color-text-medium)', 
              marginBottom: 'var(--space-2xl)' 
            } as React.CSSProperties}>
              {tourRadioT('hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link 
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 shadow-sm min-h-[44px] min-w-[200px]"
              >
                {tourRadioT('cta.primary')}
              </Link>
              <Link 
                href="#features"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-black border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-h-[44px] min-w-[200px]"
              >
                {tourRadioT('cta.secondary')}
              </Link>
            </div>
          </div>
        </section>

        {/* Problems Section */}
        <section className="py-12 lg:py-16 bg-[#F8F8F8]">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-light text-black mb-4 tracking-tight">
                {tourRadioT('problems.title')}
              </h2>
              <p className="text-lg text-[#555555] font-light">
                {tourRadioT('problems.subtitle')}
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

        {/* Radio Features Section */}
        <section id="features" className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-light text-black mb-4 tracking-tight">
                {tourRadioT('radioFeatures.title')}
              </h2>
              <p className="text-lg text-[#555555] font-light">
                {tourRadioT('radioFeatures.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {radioFeatures.map((feature, index) => (
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

        {/* Content Types Section */}
        <section className="py-12 lg:py-16 bg-[#F8F8F8]">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-light text-black mb-4 tracking-tight">
                {tourRadioT('contentTypes.title')}
              </h2>
              <p className="text-lg text-[#555555] font-light">
                {tourRadioT('contentTypes.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {contentTypes.map((type, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-black text-white rounded-lg flex items-center justify-center text-xl font-medium mx-auto mb-6">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-medium text-black mb-4">{type.title}</h3>
                  <p className="text-[#555555] font-light text-sm leading-relaxed">
                    {type.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-light text-black mb-4 tracking-tight">
                {tourRadioT('howItWorks.title')}
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

        {/* Sample Programs Section */}
        <section className="py-12 lg:py-16 bg-[#F8F8F8]">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-light text-black mb-4 tracking-tight">
                {tourRadioT('samplePrograms.title')}
              </h2>
              <p className="text-lg text-[#555555] font-light">
                {tourRadioT('samplePrograms.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {samplePrograms.map((program, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-black mb-1">{program.title}</h3>
                    <p className="text-sm text-[#555555] font-light mb-3">{program.location}</p>
                  </div>
                  <p className="text-[#555555] font-light text-sm mb-4 leading-relaxed">
                    {program.description}
                  </p>
                  <div className="text-xs text-gray-500">
                    배경음악: {program.bgMusic}
                  </div>
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
                {tourRadioT('finalCta.title')}
              </h2>
              <p className="text-lg lg:text-xl text-gray-300 mb-8 leading-relaxed">
                {tourRadioT('finalCta.description')}
              </p>
              <Link 
                href="/"
                className="inline-block bg-white text-black px-10 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg min-h-[44px] flex items-center justify-center"
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