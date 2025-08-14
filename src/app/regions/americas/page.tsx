'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import OptimalAdSense from '@/components/ads/OptimalAdSense';

export default function AmericasRegionPage() {
  const router = useRouter();
  const { currentLanguage, t } = useLanguage();
  const [loadingState, setLoadingState] = useState<string | null>(null);

  // 아메리카 지역 명소 데이터 (메인 페이지와 동일)
  const americasDestinations = [
    {
      city: '뉴욕',
      country: '미국',
      cityDescription: '꿈의 도시, 세계의 중심지',
      attractions: [
        {
          name: '자유의여신상',
          description: '미국의 상징이자 자유와 민주주의의 등대로 1886년 프랑스가 미국 독립 100주년을 기념해 선물한 조각상입니다. 리버티 아일랜드에서 맨해튼 스카이라인을 바라보며 아메리칸 드림의 상징적 의미를 느낄 수 있는 감동적인 장소입니다.'
        },
        {
          name: '센트럴파크',
          description: '맨해튼 한복판에 위치한 843에이커 규모의 도시 공원으로 뉴욕시민들의 휴식처입니다. 사계절 다른 아름다움을 선사하며, 영화와 드라마의 단골 배경지로도 유명한 이곳에서는 진정한 뉴욕의 일상을 체험할 수 있습니다.'
        },
        {
          name: '타임스스퀘어',
          description: '세계의 교차로라 불리는 뉴욕의 심장부로 24시간 잠들지 않는 화려한 네온사인과 광고판들이 장관을 이룹니다. 브로드웨이 뮤지컬의 본고장이자 새해 카운트다운으로 유명한 곳으로, 뉴욕의 역동적 에너지를 가장 강렬하게 느낄 수 있습니다.'
        }
      ]
    },
    {
      city: '라스베이거스',
      country: '미국',
      cityDescription: '사막의 오아시스, 엔터테인먼트의 메카',
      attractions: [
        {
          name: '라스베이거스 스트립',
          description: '세계에서 가장 화려한 거리로 4마일에 걸쳐 펼쳐진 메가 리조트들과 카지노들의 환상적인 네온사인이 장관을 이룹니다. 벨라지오 분수쇼부터 프리몬트 스트리트의 LED 천장까지, 라스베이거스만의 독특한 매력을 만끽할 수 있습니다.'
        },
        {
          name: '벨라지오분수',
          description: '라스베이거스의 대표적인 무료 공연으로 음악에 맞춰 춤추는 물줄기가 최고 140미터까지 솟아오르는 웅장한 분수쇼입니다. 15분마다 펼쳐지는 이 환상적인 쇼는 사막 한복판에서 펼쳐지는 예술적 감동을 선사합니다.'
        },
        {
          name: '후버댐',
          description: '라스베이거스에서 40분 거리에 위치한 1930년대 건설된 미국의 대표적 토목 건축물로 콜로라도강을 가로막은 거대한 댐입니다. 인공 호수 미드와 함께 사막 지역의 물 공급을 담당하며, 20세기 미국 공학 기술의 위대함을 보여주는 기념비적 건축물입니다.'
        }
      ]
    },
    {
      city: '리우데자네이루',
      country: '브라질',
      cityDescription: '브라질의 보석, 카니발과 해변의 도시',
      attractions: [
        {
          name: '코르코바도예수상',
          description: '리우데자네이루의 상징이자 세계 7대 불가사의 중 하나로 710미터 코르코바도산 정상에 서 있는 높이 38미터의 거대한 예수상입니다. 두 팔을 벌려 도시를 품에 안은 모습으로 서 있으며, 정상에서 바라보는 리우 전경은 숨막히게 아름답습니다.'
        },
        {
          name: '코파카바나해변',
          description: '세계에서 가장 유명한 해변 중 하나로 4km에 걸쳐 펼쳐진 반달 모양의 백사장입니다. 브라질 특유의 자유로운 분위기와 함께 비치 발리볼, 카이피리냐, 그리고 삼바 리듬이 어우러진 라틴 아메리카의 열정을 만끽할 수 있습니다.'
        },
        {
          name: '설탕빵산',
          description: '포르투갈어로 팡지아수카르라 불리는 해발 396미터의 바위산으로 케이블카를 타고 올라가 리우데자네이루의 360도 파노라마를 감상할 수 있습니다. 특히 일몰 시간에 바라보는 과나바라만의 풍경은 리우 여행의 하이라이트입니다.'
        }
      ]
    },
    {
      city: '토론토',
      country: '캐나다',
      cityDescription: '캐나다 최대 도시, 다문화의 모자이크',
      attractions: [
        {
          name: 'CN타워',
          description: '토론토의 상징이자 높이 553미터의 통신탑으로 1976년부터 세계에서 가장 높은 독립 구조물이었습니다. 엣지워크 체험과 글래스 플로어에서 내려다보는 스릴 넘치는 전망은 물론, 맑은 날에는 나이아가라 폭포까지 조망할 수 있습니다.'
        },
        {
          name: '로열온타리오박물관',
          description: '캐나다 최대 규모의 박물관으로 600만 점의 소장품을 보유하고 있으며, 다니엘 리베스킨드가 설계한 독특한 크리스털 건물로도 유명합니다. 공룡 화석부터 이집트 미라, 한국관까지 세계 각국의 문화와 자연사를 한눈에 볼 수 있습니다.'
        },
        {
          name: '디스틸러리구역',
          description: '19세기 위스키 증류소를 개조한 역사적 지구로 빅토리아 시대 산업 건축물들이 잘 보존되어 있습니다. 현재는 갤러리, 부티크, 레스토랑, 카페들이 들어서 있어 토론토의 예술과 문화를 체험할 수 있는 트렌디한 문화 공간으로 변모했습니다.'
        }
      ]
    }
  ];

  const handleAttractionClick = (attractionName: string) => {
    setLoadingState(attractionName);
    router.push(`/guide/${encodeURIComponent(attractionName)}?lang=${currentLanguage}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* SEO 메타 정보 */}
      <div className="hidden">
        <h1>아메리카 여행 가이드 - 뉴욕, 라스베이거스, 리우데자네이루, 토론토 완벽 가이드</h1>
        <p>아메리카 대륙의 대표 관광지 뉴욕, 라스베이거스, 리우데자네이루, 토론토를 AI 가이드와 함께 탐험하세요. 자유와 꿈, 열정이 살아있는 아메리카의 아름다운 명소들을 상세한 설명과 함께 소개합니다.</p>
      </div>

      {/* 헤더 */}
      <header className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              🌎 아메리카 여행 가이드
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
              자유와 꿈, 열정이 살아있는 아메리카 대륙의 매력적인 도시들을 AI 가이드와 함께 탐험하세요
            </p>
            <div className="inline-flex items-center space-x-2 bg-white/20 px-6 py-3 rounded-full">
              <span className="text-green-200">🗽 12개 주요 관광지</span>
              <span className="text-green-200">•</span>
              <span className="text-green-200">🎙️ AI 음성 가이드</span>
              <span className="text-green-200">•</span>
              <span className="text-green-200">🌏 다국어 지원</span>
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
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            아메리카 대표 관광지
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            북미와 남미를 아우르는 아메리카 대륙의 다양한 문화와 웅장한 자연이 어우러진 최고의 여행지들을 소개합니다. 
            각 명소마다 AI가 생성하는 개인 맞춤형 가이드로 더욱 깊이 있는 아메리카 문화 체험을 경험하세요.
          </p>
        </div>

        {/* 도시별 명소 */}
        <div className="space-y-16">
          {americasDestinations.map((destination, index) => (
            <section key={destination.city} className="bg-gray-50 rounded-2xl p-8 md:p-12">
              <div className="mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  📍 {destination.city}, {destination.country}
                </h3>
                <p className="text-lg text-gray-600 mb-6">
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
                    <h4 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                      {attraction.name}
                    </h4>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {attraction.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <button
                        disabled={loadingState === attraction.name}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <div className="text-green-600 group-hover:translate-x-1 transition-transform">
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
        <section className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-2xl p-12 text-center mt-16">
          <h3 className="text-3xl font-bold mb-6">
            더 많은 아메리카 여행 정보가 필요하신가요?
          </h3>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            TripRadio.AI의 메인 검색에서 원하는 아메리카 도시를 입력하고 개인 맞춤형 여행 가이드를 받아보세요
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition-colors"
          >
            🔍 여행지 검색하기
          </button>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-100 py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="text-gray-600 mb-4">
            <h4 className="font-bold text-lg mb-2">TripRadio.AI - 아메리카 여행 가이드</h4>
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