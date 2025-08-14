'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import OptimalAdSense from '@/components/ads/OptimalAdSense';

export default function KoreaRegionPage() {
  const router = useRouter();
  const { currentLanguage, t } = useLanguage();
  const [loadingState, setLoadingState] = useState<string | null>(null);

  // 한국 지역 명소 데이터 (메인 페이지와 동일)
  const koreaDestinations = [
    {
      city: '서울',
      cityDescription: '전통과 현대가 어우러진 대한민국의 수도',
      attractions: [
        {
          name: '경복궁',
          description: '조선왕조의 법궁으로 600년 역사를 간직한 서울의 대표 궁궐입니다. 근정전과 경회루에서 조선 왕조의 찬란한 문화를 체험하고, 수문장 교대식으로 전통 문화의 위엄을 느껴보세요. 한복을 입고 방문하면 입장료가 무료입니다.'
        },
        {
          name: '남산타워',
          description: '서울의 랜드마크로 도심 전체를 조망할 수 있는 최고의 전망대입니다. 낭만적인 사랑의 자물쇠와 함께 아름다운 서울 야경을 감상하며, 케이블카를 타고 오르는 설렘도 놓칠 수 없는 매력입니다.'
        },
        {
          name: '명동',
          description: '서울 최고의 쇼핑과 미식의 거리로 K-뷰티와 한국 문화의 중심지입니다. 명동성당의 고딕 건축미와 함께 국내외 브랜드 쇼핑, 길거리 음식과 한국 전통 먹거리를 모두 즐길 수 있는 관광의 핵심 지역입니다.'
        }
      ]
    },
    {
      city: '부산',
      cityDescription: '아름다운 바다와 항구의 도시',
      attractions: [
        {
          name: '해운대해수욕장',
          description: '한국을 대표하는 해변 리조트로 1.5km의 백사장과 푸른 바다가 펼쳐진 부산의 상징입니다. 해수욕과 수상 스포츠를 즐기며, 해변가 고급 호텔들과 맛집들이 즐비해 완벽한 휴양지 경험을 제공합니다.'
        },
        {
          name: '감천문화마을',
          description: '부산의 마추픽추라 불리는 계단식 색색의 주택들이 어우러진 예술 마을입니다. 골목마다 숨어있는 벽화와 조형물들을 발견하며, 부산의 역사와 문화를 느낄 수 있는 독특한 관광 명소입니다.'
        },
        {
          name: '자갈치시장',
          description: '한국 최대 규모의 수산물 시장으로 신선한 해산물과 부산의 생동감을 느낄 수 있는 곳입니다. 갓 잡은 생선회와 해산물 요리를 맛보며, 부산 아지매들의 정겨운 인정을 경험할 수 있는 전통 시장입니다.'
        }
      ]
    },
    {
      city: '제주',
      cityDescription: '환상적인 자연경관의 섬',
      attractions: [
        {
          name: '한라산',
          description: '제주도의 중심에 우뚝 선 대한민국 최고봉으로 유네스코 세계자연유산입니다. 사계절 각기 다른 아름다움을 선사하며, 백록담 정상에서 바라보는 360도 제주 전경은 평생 잊지 못할 감동을 선사합니다.'
        },
        {
          name: '성산일출봉',
          description: '제주를 대표하는 일출 명소로 유네스코 세계자연유산에 등재된 화산 분화구입니다. 정상에서 바라보는 장엄한 일출과 에메랄드빛 바다의 조화는 제주 여행의 하이라이트가 됩니다.'
        },
        {
          name: '중문관광단지',
          description: '제주 남부의 대표적인 리조트 지역으로 천혜의 자연환경과 현대적 편의시설이 조화를 이룬 곳입니다. 중문해수욕장의 검은 모래와 주상절리, 그리고 다양한 테마파크와 골프장이 어우러진 종합 관광단지입니다.'
        }
      ]
    },
    {
      city: '경주',
      cityDescription: '신라 천년의 고도',
      attractions: [
        {
          name: '불국사',
          description: '신라 불교 예술의 정수를 보여주는 유네스코 세계문화유산으로 한국 고대 건축의 백미입니다. 다보탑과 석가탑의 조화로운 아름다움과 극락전, 대웅전의 장엄함에서 신라인들의 정신세계를 엿볼 수 있습니다.'
        },
        {
          name: '석굴암',
          description: '동양 조각 예술의 걸작으로 불국사와 함께 유네스코 세계문화유산에 등재된 신라의 보물입니다. 본존불의 자비로운 미소와 정교한 조각 기법은 천년을 넘어 오늘날까지 감동을 전해주는 문화유산입니다.'
        },
        {
          name: '첨성대',
          description: '동양에서 가장 오래된 천문대로 신라인들의 과학 기술과 우주관을 보여주는 독특한 문화재입니다. 밤하늘의 별자리와 함께 바라보는 첨성대는 신라 천년의 지혜와 낭만을 동시에 느낄 수 있는 특별한 경험입니다.'
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
        <h1>한국 여행 가이드 - 대한민국 주요 관광지 완벽 가이드</h1>
        <p>서울, 부산, 제주, 경주 등 한국의 대표 관광지들을 AI 가이드와 함께 탐험하세요. 전통과 현대가 어우러진 한국의 아름다운 명소들을 상세한 설명과 함께 소개합니다.</p>
      </div>

      {/* 헤더 */}
      <header className="bg-white py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-[clamp(3rem,5vw,4.5rem)] font-semibold text-black mb-6 leading-tight tracking-tight">
              한국 여행 가이드
            </h1>
            <p className="text-[clamp(1rem,1.5vw,1.25rem)] font-light text-[#555555] mb-8 max-w-3xl mx-auto leading-relaxed">
              전통과 현대가 어우러진 대한민국의 아름다운 명소들을 AI 가이드와 함께 탐험하세요
            </p>
            <div className="inline-flex items-center space-x-3 bg-[#F8F8F8] px-6 py-3 rounded-lg">
              <span className="text-[#555555] text-sm font-light">12개 주요 관광지</span>
              <span className="text-[#555555]">•</span>
              <span className="text-[#555555] text-sm font-light">AI 음성 가이드</span>
              <span className="text-[#555555]">•</span>
              <span className="text-[#555555] text-sm font-light">다국어 지원</span>
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
          <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold text-black mb-6 leading-tight">
            대한민국 대표 관광지
          </h2>
          <p className="text-[clamp(1rem,1.5vw,1.25rem)] font-light text-[#555555] max-w-3xl mx-auto leading-relaxed">
            한국의 역사와 문화, 자연의 아름다움을 만끽할 수 있는 최고의 여행지들을 소개합니다. 
            각 명소마다 AI가 생성하는 개인 맞춤형 가이드로 더욱 깊이 있는 여행을 경험하세요.
          </p>
        </div>

        {/* 도시별 명소 */}
        <div className="space-y-16">
          {koreaDestinations.map((destination, index) => (
            <section key={destination.city} className="bg-[#F8F8F8] rounded-lg p-8 md:p-12">
              <div className="mb-8">
                <h3 className="text-[clamp(1.5rem,2.5vw,2rem)] font-semibold text-black mb-4">
                  {destination.city}
                </h3>
                <p className="text-[clamp(1rem,1.5vw,1.25rem)] font-light text-[#555555] mb-6 leading-relaxed">
                  {destination.cityDescription}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {destination.attractions.map((attraction) => (
                  <div
                    key={attraction.name}
                    className="bg-white rounded-lg p-6 border border-[#F8F8F8] hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => handleAttractionClick(attraction.name)}
                  >
                    <h4 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-black mb-4 transition-colors">
                      {attraction.name}
                    </h4>
                    <p className="text-[#555555] font-light leading-relaxed mb-4">
                      {attraction.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <button
                        disabled={loadingState === attraction.name}
                        className="bg-[#007AFF] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#005FCC] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <section className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center mt-16">
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">
            더 많은 한국 여행 정보가 필요하신가요?
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            TripRadio.AI의 메인 검색에서 원하는 지역을 입력하고 개인 맞춤형 여행 가이드를 받아보세요
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-colors"
          >
            여행지 검색하기
          </button>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-100 py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="text-gray-600 mb-4">
            <h4 className="font-bold text-lg mb-2">TripRadio.AI - 한국 여행 가이드</h4>
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