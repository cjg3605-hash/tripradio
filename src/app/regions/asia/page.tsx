'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import OptimalAdSense from '@/components/ads/OptimalAdSense';

export default function AsiaRegionPage() {
  const router = useRouter();
  const { currentLanguage, t } = useLanguage();
  const [loadingState, setLoadingState] = useState<string | null>(null);

  // 아시아 지역 명소 데이터 (메인 페이지와 동일)
  const asiaDestinations = [
    {
      city: '도쿄',
      country: '일본',
      cityDescription: '전통과 첨단이 공존하는 일본의 수도',
      attractions: [
        {
          name: '센소지',
          description: '도쿄에서 가장 오래된 불교 사원으로 1400년의 역사를 자랑하는 아사쿠사의 상징입니다. 나카미세도리의 전통 상점가를 지나 본당에 도착하면 일본 전통 문화의 진수를 느낄 수 있으며, 오미쿠지(운세점)도 체험할 수 있습니다.'
        },
        {
          name: '시부야스크램블교차로',
          description: '세계에서 가장 바쁜 교차로로 한 번에 3000명이 건너다니는 도쿄의 상징적 장소입니다. 네온사인과 초고층 빌딩들 사이로 쏟아져 나오는 인파의 물결은 현대 일본의 역동성을 가장 극명하게 보여주는 도시 풍경입니다.'
        },
        {
          name: '메이지신궁',
          description: '도쿄 한복판에 위치한 일본 최대 규모의 신사로 메이지천황을 모신 신성한 공간입니다. 100만 그루의 울창한 숲으로 둘러싸여 도시의 소음을 차단하며, 전통 일본 건축의 아름다움과 함께 평화로운 명상의 시간을 제공합니다.'
        }
      ]
    },
    {
      city: '방콕',
      country: '태국',
      cityDescription: '동양의 베니스, 황금 사원과 수상시장의 도시',
      attractions: [
        {
          name: '방콕 대왕궁',
          description: '태국 왕실의 공식 거주지로 150년 동안 왕들이 거주했던 황금빛 궁전입니다. 에메랄드 불상이 모셔진 왓 프라케오와 함께 태국 전통 건축의 정수를 보여주며, 섬세한 금박 장식과 화려한 색채가 동남아시아의 웅장함을 선사합니다.'
        },
        {
          name: '왓아룬',
          description: '새벽 사원이라 불리는 방콕의 상징적인 사원으로 차오프라야강변에 우뚝 선 79m 높이의 프랑입니다. 중국산 도자기 조각들로 장식된 독특한 건축 양식과 함께 일몰과 야경이 특히 아름다워 방콕에서 가장 로맨틱한 장소 중 하나입니다.'
        },
        {
          name: '차투착시장',
          description: '세계 최대 규모의 주말 시장으로 1만 5천 개의 상점이 미로 같은 골목에 빼곡히 들어서 있습니다. 태국 전통 공예품부터 현지 먹거리까지 상상할 수 있는 모든 것을 만날 수 있으며, 현지인들의 생생한 일상을 체험할 수 있는 태국 문화의 보고입니다.'
        }
      ]
    },
    {
      city: '싱가포르',
      country: '싱가포르',
      cityDescription: '아시아의 허브, 다문화가 어우러진 도시국가',
      attractions: [
        {
          name: '마리나베이샌즈',
          description: '싱가포르의 랜드마크로 55층 높이의 3개 타워 위에 배 모양의 스카이파크가 올려진 독특한 건축물입니다. 세계에서 가장 높은 무한수영장에서 바라보는 싱가포르 전경과 야경은 평생 잊지 못할 감동을 선사합니다.'
        },
        {
          name: '가든스바이더베이',
          description: '미래형 식물원으로 거대한 슈퍼트리들이 숲을 이룬 환상적인 공간입니다. 클라우드 포레스트와 플라워 돔에서는 전 세계의 희귀 식물들을 만날 수 있으며, 밤에 펼쳐지는 슈퍼트리 라이트쇼는 SF 영화 같은 장관을 연출합니다.'
        },
        {
          name: '머라이언파크',
          description: '사자 머리와 물고기 몸을 한 싱가포르의 상징 머라이언 동상이 있는 곳으로 마리나베이의 아름다운 전경을 조망할 수 있습니다. 특히 일몰 시간에 바라보는 마리나베이샌즈와 금융가 스카이라인은 싱가포르 여행의 하이라이트입니다.'
        }
      ]
    },
    {
      city: '베이징',
      country: '중국',
      cityDescription: '중국 5천년 역사의 수도, 자금성과 만리장성의 도시',
      attractions: [
        {
          name: '자금성',
          description: '명·청 황제들이 거주했던 세계 최대 규모의 궁전 건축군으로 유네스코 세계문화유산입니다. 9999개의 방을 가진 이 거대한 궁전에서는 중국 황실의 찬란한 역사와 함께 중국 전통 건축의 완벽한 조화미를 감상할 수 있습니다.'
        },
        {
          name: '만리장성',
          description: '인류 역사상 가장 거대한 건축물로 총 길이 2만 1천km에 달하는 중국의 상징입니다. 험준한 산맥을 따라 구불구불 이어진 성벽에서 바라보는 웅장한 풍경은 중국 문명의 위대함과 함께 자연의 경이로움을 동시에 느끼게 합니다.'
        },
        {
          name: '천안문광장',
          description: '세계에서 가장 큰 광장 중 하나로 중국 현대사의 중심무대가 된 역사적 공간입니다. 인민영웅기념비와 마오쩌둥 기념관이 있으며, 매일 아침 국기 게양식은 중국의 웅장함을 체감할 수 있는 감동적인 순간입니다.'
        }
      ]
    }
  ];

  const handleAttractionClick = (attractionName: string) => {
    setLoadingState(attractionName);
    router.push(`/guide/${encodeURIComponent(attractionName)}?lang=${currentLanguage}`);
  };

  return (
    <div className="min-h-screen bg-white" style={{ '--space-2xs': '4px', '--space-xs': '8px', '--space-sm': '12px', '--space-md': '16px', '--space-lg': '24px', '--space-xl': '40px', '--space-2xl': '64px' } as React.CSSProperties}>
      {/* SEO 메타 정보 */}
      <div className="hidden">
        <h1>아시아 여행 가이드 - 도쿄, 방콕, 싱가포르, 베이징 완벽 가이드</h1>
        <p>아시아의 대표 관광지 도쿄, 방콕, 싱가포르, 베이징을 AI 가이드와 함께 탐험하세요. 전통과 현대가 어우러진 아시아의 아름다운 명소들을 상세한 설명과 함께 소개합니다.</p>
      </div>

      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-semibold text-black mb-6">
              아시아 여행 가이드
            </h1>
            <p className="text-lg md:text-xl text-[#555555] font-light mb-8 max-w-3xl mx-auto leading-relaxed">
              전통과 현대가 어우러진 아시아의 매력적인 도시들을 AI 가이드와 함께 탐험하세요
            </p>
            <div className="inline-flex items-center space-x-3 bg-[#F8F8F8] px-6 py-3 rounded-xl border border-gray-200">
              <span className="text-gray-700 text-sm">12개 주요 관광지</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-700 text-sm">AI 음성 가이드</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-700 text-sm">다국어 지원</span>
            </div>
          </div>
        </div>
      </header>

      {/* AdSense 광고 */}
      <div className="container mx-auto px-4 py-8">
        <OptimalAdSense placement="homepage-hero" className="mb-8" />
      </div>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            아시아 대표 관광지
          </h2>
          <p className="text-lg text-[#555555] font-light max-w-3xl mx-auto">
            찬란한 역사와 문화, 그리고 현대적 발전이 조화를 이룬 아시아 최고의 여행지들을 소개합니다. 
            각 명소마다 AI가 생성하는 개인 맞춤형 가이드로 더욱 깊이 있는 아시아 문화 체험을 경험하세요.
          </p>
        </div>

        {/* 도시별 명소 */}
        <div className="space-y-16">
          {asiaDestinations.map((destination, index) => (
            <section key={destination.city} className="bg-[#F8F8F8] rounded-2xl p-8 md:p-12">
              <div className="mb-8">
                <h3 className="text-2xl md:text-3xl font-semibold text-black mb-4">
                  {destination.city}, {destination.country}
                </h3>
                <p className="text-lg text-[#555555] font-light mb-6 leading-relaxed">
                  {destination.cityDescription}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {destination.attractions.map((attraction) => (
                  <div
                    key={attraction.name}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    onClick={() => handleAttractionClick(attraction.name)}
                  >
                    <h4 className="text-xl font-semibold text-black mb-4 group-hover:text-gray-700 transition-colors">
                      {attraction.name}
                    </h4>
                    <p className="text-[#555555] font-light leading-relaxed mb-4">
                      {attraction.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <button
                        disabled={loadingState === attraction.name}
                        className="bg-[#007AFF] text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingState === attraction.name ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            가이드 생성 중...
                          </span>
                        ) : (
                          'AI 가이드 보기'
                        )}
                      </button>
                      <div className="text-gray-700 group-hover:translate-x-1 transition-transform">
                        →
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* AdSense 광고 */}
        <div className="my-16">
          <OptimalAdSense placement="guide-content" className="mb-8" />
        </div>

        {/* CTA 섹션 */}
        <section className="bg-[#F8F8F8] border border-gray-200 rounded-2xl p-12 text-center mt-16">
          <h3 className="text-2xl md:text-3xl font-semibold text-black mb-6">
            더 많은 아시아 여행 정보가 필요하신가요?
          </h3>
          <p className="text-lg text-[#555555] font-light mb-8 max-w-2xl mx-auto leading-relaxed">
            TripRadio.AI의 메인 검색에서 원하는 아시아 도시를 입력하고 개인 맞춤형 여행 가이드를 받아보세요
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-[#007AFF] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-colors"
          >
            여행지 검색하기
          </button>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-100 py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="text-[#555555] font-light mb-4">
            <h4 className="font-bold text-lg mb-2">TripRadio.AI - 아시아 여행 가이드</h4>
            <p>AI가 만드는 개인 맞춤형 여행 가이드 서비스</p>
          </div>
          <div className="text-sm text-gray-500">
            <p>© 2024 TripRadio.AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}