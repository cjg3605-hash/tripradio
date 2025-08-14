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
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-[#F8F8F8] rounded-full text-sm font-medium text-[#555555] mb-6">
              {t('hero.badge')}
            </div>
            <h1 className="text-[clamp(3rem,5vw,4.5rem)] font-semibold text-black mb-6 leading-tight tracking-tight">
              {t('hero.title')} 
              <span className="font-light block mt-3">{t('hero.titleBold')}</span>
            </h1>
            <p className="text-[clamp(1rem,1.5vw,1.25rem)] font-light text-[#555555] mb-12 leading-relaxed max-w-3xl mx-auto">
              {t('hero.description')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/"
              className="bg-[#007AFF] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#005FCC] transition-colors duration-200 min-w-[200px]"
            >
              {t('hero.startFree')}
            </Link>
            <Link 
              href="#ai-features"
              className="border border-[#555555] text-[#555555] px-8 py-3 rounded-lg font-medium hover:bg-[#F8F8F8] transition-colors duration-200 min-w-[200px]"
            >
              {t('hero.exploreFeaturesButton')}
            </Link>
          </div>
        </div>
      </section>

      {/* Future of Travel Section */}
      <section className="py-24 lg:py-32 bg-[#F8F8F8]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold text-black mb-6 leading-tight">
              {t('futureOfTravel.title')} 
              <span className="font-light block mt-2">{t('futureOfTravel.titleBold')}</span>
            </h2>
            <div className="w-16 h-px bg-[#555555] mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8]">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">😰</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4 leading-snug">{t('futureOfTravel.existingProblems.title')}</h3>
              <ul className="text-[#555555] space-y-2 text-sm font-light">
                {existingProblemsItems.map((item: string, index: number) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8]">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🤖</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4 leading-snug">{t('futureOfTravel.aiInnovation.title')}</h3>
              <ul className="text-[#555555] space-y-2 text-sm font-light">
                {aiInnovationItems.map((item: string, index: number) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8]">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">✨</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4 leading-snug">{t('futureOfTravel.futureTravel.title')}</h3>
              <ul className="text-[#555555] space-y-2 text-sm font-light">
                {futureTravelItems.map((item: string, index: number) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section id="ai-features" className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold text-black mb-6 leading-tight">
              {t('aiFeatures.title')} 
              <span className="font-light block mt-2">{t('aiFeatures.titleBold')}</span>
            </h2>
            <div className="w-16 h-px bg-[#555555] mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🧠</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4 leading-snug">{t('aiFeatures.intelligentContent.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('aiFeatures.intelligentContent.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎯</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4 leading-snug">{t('aiFeatures.personalization.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('aiFeatures.personalization.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📍</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4 leading-snug">{t('aiFeatures.locationRecognition.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('aiFeatures.locationRecognition.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🗣️</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4 leading-snug">{t('aiFeatures.voiceSynthesis.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('aiFeatures.voiceSynthesis.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📚</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4 leading-snug">{t('aiFeatures.dataIntegration.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('aiFeatures.dataIntegration.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🔄</div>
              </div>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4 leading-snug">{t('aiFeatures.continuousLearning.title')}</h3>
              <p className="text-[#555555] font-light leading-relaxed">
                {t('aiFeatures.continuousLearning.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Journey Section */}
      <section className="py-24 lg:py-32 bg-[#F8F8F8]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold text-black mb-6 leading-tight">
              {t('aiJourney.title')} 
              <span className="font-light block mt-2">{t('aiJourney.titleBold')}</span>
            </h2>
            <div className="w-16 h-px bg-[#555555] mx-auto"></div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-[#F8F8F8] rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📋</span>
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
                    <span className="text-2xl">🧭</span>
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
                    <span className="text-2xl">🎙️</span>
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
                    <span className="text-2xl">📱</span>
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
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold text-black mb-6 leading-tight">
              {t('benefits.title')} 
              <span className="font-light block mt-2">{t('benefits.titleBold')}</span>
            </h2>
            <div className="w-16 h-px bg-[#555555] mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg border border-[#F8F8F8] hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#F8F8F8] rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
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
                    <span className="text-2xl">⏰</span>
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
                    <span className="text-2xl">🎯</span>
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
                    <span className="text-2xl">🌍</span>
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
                    <span className="text-2xl">🔄</span>
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
                    <span className="text-2xl">📚</span>
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
      <section className="py-24 lg:py-32 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold mb-6 leading-tight">
              {t('cta.title')}
            </h2>
            <p className="text-[clamp(1rem,1.5vw,1.25rem)] font-light text-[#555555] mb-12 leading-relaxed">
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