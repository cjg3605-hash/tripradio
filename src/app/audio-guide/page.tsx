'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

export default function AudioGuidePage() {
  const { translations } = useLanguage();
  
  // 간단한 번역 함수 - 안전한 접근
  const t = (key: string) => {
    if (!translations?.audioGuide) return key;
    try {
      const keys = key.split('.');
      let value: any = translations.audioGuide;
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
  const existingItems = [
    t('comparison.existing.items.0') || "정해진 스크립트로 획일적인 해설",
    t('comparison.existing.items.1') || "개인 취향을 고려하지 않는 일방적 정보", 
    t('comparison.existing.items.2') || "제한적인 언어와 지역 지원",
    t('comparison.existing.items.3') || "높은 이용 비용과 복잡한 절차",
    t('comparison.existing.items.4') || "인터넷 연결 필수로 불편함"
  ];
  
  const tripRadioItems = [
    t('comparison.tripRadio.items.0') || "AI가 실시간으로 생성하는 맞춤형 해설",
    t('comparison.tripRadio.items.1') || "개인 관심사와 여행 스타일 반영",
    t('comparison.tripRadio.items.2') || "전세계 180개국 다국어 지원", 
    t('comparison.tripRadio.items.3') || "완전 무료로 부담 없는 이용",
    t('comparison.tripRadio.items.4') || "오프라인 다운로드로 언제든 청취"
  ];
  
  return (
    <>
      <style jsx>{`
        .btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-xs) var(--space-md);
          border-radius: var(--radius-md);
          border: var(--border-thin) solid transparent;
          font-weight: 600;
          font-size: var(--fs-h6-d);
          line-height: 1.2;
          transition: background var(--dur-md) var(--ease-standard), transform var(--dur-fast);
          text-decoration: none;
          cursor: pointer;
        }
        .btn--primary {
          background: var(--color-primary);
          color: var(--color-bg);
        }
        .btn--primary:hover {
          background: var(--color-primary-hover);
        }
        .btn--secondary {
          background: var(--color-bg);
          color: var(--color-text-high);
          border-color: var(--color-border);
        }
        .btn--secondary:hover {
          background: var(--color-bg-alt);
        }
        .card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          box-shadow: var(--shadow-sm);
        }
        .card__title {
          margin: 0 0 var(--space-md);
          font-size: var(--fs-h3-d);
          font-weight: 600;
          color: var(--color-text-high);
          line-height: 1.3;
        }
        .card__body {
          color: var(--color-text-medium);
        }
        .body {
          font-size: var(--fs-body-d);
          line-height: var(--lh-body);
        }
        @media (max-width: 1024px) {
          .card__title {
            font-size: var(--fs-h3-t);
          }
          .body {
            font-size: var(--fs-body-t);
          }
          .btn {
            font-size: var(--fs-h6-t);
          }
        }
        @media (max-width: 640px) {
          .card__title {
            font-size: var(--fs-h3-m);
          }
          .body {
            font-size: var(--fs-body-m);
          }
          .btn {
            font-size: var(--fs-h6-m);
          }
        }
      `}</style>
      <KeywordPageSchema 
        keyword={t('meta.keyword')}
        pagePath="/audio-guide"
        title={t('meta.title')}
        description={t('meta.description')}
        features={[t('features.aiRealTime.title'), t('features.personalized.title'), t('features.worldwide.title'), t('features.free.title'), t('features.multiLanguage.title'), t('features.offline.title')]}
      />
      <div className="min-h-screen" style={{ 
        fontFamily: 'var(--font-family-base)',
        backgroundColor: 'var(--color-bg)'
      }}>
      {/* Hero Section */}
      <section className="container mx-auto" style={{ 
        paddingLeft: 'var(--space-lg)', 
        paddingRight: 'var(--space-lg)', 
        paddingTop: 'var(--space-2xl)', 
        paddingBottom: 'var(--space-2xl)' 
      }}>
        <div className="max-w-4xl mx-auto text-center">
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="inline-flex items-center" style={{ 
              padding: 'var(--space-xs) var(--space-md)', 
              backgroundColor: 'var(--color-bg-alt)', 
              borderRadius: 'var(--radius-lg)', 
              fontSize: 'var(--fs-body-s-d)', 
              fontWeight: '400', 
              color: 'var(--color-text-medium)', 
              marginBottom: 'var(--space-lg)' 
            }}>
              {t('hero.badge')}
            </div>
            <h1 style={{ 
              fontSize: 'var(--fs-h1-d)', 
              fontWeight: '600', 
              color: 'var(--color-text-high)', 
              marginBottom: 'var(--space-lg)', 
              lineHeight: 'var(--lh-heading)' 
            }}>
              {t('hero.title')} 
              <span className="font-light block" style={{ marginTop: 'var(--space-sm)' }}>{t('hero.titleBold')}</span>
            </h1>
            <p style={{ 
              fontSize: 'var(--fs-body-l-d)', 
              color: 'var(--color-text-medium)', 
              marginBottom: 'var(--space-2xl)', 
              lineHeight: 'var(--lh-body)', 
              maxWidth: '65ch', 
              marginLeft: 'auto', 
              marginRight: 'auto' 
            }}>
              {t('hero.description')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center" style={{ gap: 'var(--space-md)' }}>
            <Link 
              href="/"
              className="btn btn--primary"
              style={{ minWidth: '200px' }}
            >
              {t('hero.startFree')}
            </Link>
            <Link 
              href="#features"
              className="btn btn--secondary"
              style={{ minWidth: '200px' }}
            >
              {t('hero.exploreFeatures')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ 
        paddingTop: 'var(--space-2xl)', 
        paddingBottom: 'var(--space-2xl)', 
        backgroundColor: 'var(--color-bg-alt)' 
      }}>
        <div className="container mx-auto" style={{ 
          paddingLeft: 'var(--space-lg)', 
          paddingRight: 'var(--space-lg)' 
        }}>
          <div className="max-w-4xl mx-auto text-center" style={{ marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{ 
              fontSize: 'var(--fs-h2-d)', 
              fontWeight: '600', 
              color: 'var(--color-text-high)', 
              marginBottom: 'var(--space-sm)', 
              lineHeight: 'var(--lh-heading)' 
            }}>
              {t('features.title')} 
              <span className="font-light block" style={{ marginTop: 'var(--space-sm)' }}>{t('features.titleBold')}</span>
            </h2>
            <div style={{ 
              width: '64px', 
              height: '1px', 
              backgroundColor: 'var(--color-border)', 
              margin: 'var(--space-lg) auto 0' 
            }}></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto" style={{ gap: 'var(--space-xl)' }}>
            <article className="card">
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: 'var(--color-bg-alt)', 
                borderRadius: 'var(--radius-md)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: 'var(--space-lg)', 
                fontSize: '24px' 
              }}>
                🤖
              </div>
              <h3 className="card__title">{t('features.aiRealTime.title')}</h3>
              <p className="card__body body">
                {t('features.aiRealTime.description')}
              </p>
            </article>
            
            <article className="card">
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: 'var(--color-bg-alt)', 
                borderRadius: 'var(--radius-md)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: 'var(--space-lg)', 
                fontSize: '24px' 
              }}>
                🎯
              </div>
              <h3 className="card__title">{t('features.personalized.title')}</h3>
              <p className="card__body body">
                {t('features.personalized.description')}
              </p>
            </article>
            
            <article className="card">
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: 'var(--color-bg-alt)', 
                borderRadius: 'var(--radius-md)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: 'var(--space-lg)', 
                fontSize: '24px' 
              }}>
                🌍
              </div>
              <h3 className="card__title">{t('features.worldwide.title')}</h3>
              <p className="card__body body">
                {t('features.worldwide.description')}
              </p>
            </article>
            
            <article className="card">
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: 'var(--color-bg-alt)', 
                borderRadius: 'var(--radius-md)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: 'var(--space-lg)', 
                fontSize: '24px' 
              }}>
                💰
              </div>
              <h3 className="card__title">{t('features.free.title')}</h3>
              <p className="card__body body">
                {t('features.free.description')}
              </p>
            </article>
            
            <article className="card">
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: 'var(--color-bg-alt)', 
                borderRadius: 'var(--radius-md)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: 'var(--space-lg)', 
                fontSize: '24px' 
              }}>
                🗣️
              </div>
              <h3 className="card__title">{t('features.multiLanguage.title')}</h3>
              <p className="card__body body">
                {t('features.multiLanguage.description')}
              </p>
            </article>
            
            <article className="card">
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: 'var(--color-bg-alt)', 
                borderRadius: 'var(--radius-md)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: 'var(--space-lg)', 
                fontSize: '24px' 
              }}>
                📱
              </div>
              <h3 className="card__title">{t('features.offline.title')}</h3>
              <p className="card__body body">
                {t('features.offline.description')}
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold text-black mb-3 leading-tight tracking-tight">
              {t('comparison.title')}
              <span className="font-light block mt-3">{t('comparison.titleBold')}</span>
            </h2>
            <div className="w-16 h-px bg-[#E5E5E5] mx-auto mt-6"></div>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="p-10 border-r border-[#E5E5E5]">
                  <h3 className="text-[clamp(1.25rem,2.5vw,1.5rem)] font-semibold mb-8 text-[#555555] leading-snug">{t('comparison.existing.title')}</h3>
                  <ul className="space-y-5">
                    {existingItems.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-4">
                        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                        <span className="text-[#555555] font-light">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-10 bg-[#F8F8F8]">
                  <h3 className="text-[clamp(1.25rem,2.5vw,1.5rem)] font-semibold mb-8 text-black leading-snug">{t('comparison.tripRadio.title')}</h3>
                  <ul className="space-y-5">
                    {tripRadioItems.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-4">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                        <span className="text-[#555555] font-light">{item}</span>
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
      <section className="py-24 lg:py-32 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold mb-6 leading-tight tracking-tight">
              {t('cta.title')}
            </h2>
            <p className="text-[clamp(1rem,1.5vw,1.25rem)] text-[#EAEAEA] mb-12 leading-relaxed font-light">
              {t('cta.description')}
            </p>
            <Link 
              href="/"
              className="inline-block bg-white text-black px-10 py-4 rounded-lg font-medium hover:bg-[#F8F8F8] transition-colors duration-200"
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