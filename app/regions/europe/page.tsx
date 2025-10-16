'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import OptimalAdSense from '@/components/ads/OptimalAdSense';

export default function EuropeRegionPage() {
  const router = useRouter();
  const { currentLanguage, t } = useLanguage();
  const [loadingState, setLoadingState] = useState<string | null>(null);

  // 유럽 지역 명소 데이터 (메인 페이지와 동일)
  const europeDestinations = [
    {
      city: '파리',
      country: '프랑스',
      cityDescription: '로맨스와 예술의 도시, 세계 문화의 중심지',
      attractions: [
        {
          name: '에펠탑',
          description: '파리의 상징이자 프랑스 로맨스의 대명사로 1889년 만국박람회를 위해 건설된 324m 높이의 철탑입니다. 낮과 밤 각기 다른 아름다움을 선사하며, 정시마다 펼쳐지는 반짝이는 조명쇼는 파리 여행의 절정을 만들어줍니다.'
        },
        {
          name: '루브르박물관',
          description: '세계 3대 박물관 중 하나로 모나리자와 밀로의 비너스 등 인류 최고의 예술 작품들을 소장한 문화의 성지입니다. 과거 왕궁이었던 건물 자체도 건축의 걸작품으로, 예술과 역사가 살아 숨쉬는 공간입니다.'
        },
        {
          name: '샹젤리제거리',
          description: '세계에서 가장 아름다운 거리로 불리는 파리의 중심가로 개선문에서 콩코드 광장까지 이어지는 1.9km의 대로입니다. 럭셔리 브랜드 쇼핑과 카페 문화, 그리고 파리지앵들의 일상을 엿볼 수 있는 파리의 심장부입니다.'
        }
      ]
    },
    {
      city: '로마',
      country: '이탈리아',
      cityDescription: '영원한 도시, 고대 로마 제국의 영광이 살아있는 곳',
      attractions: [
        {
          name: '콜로세움',
          description: '고대 로마의 영광을 증명하는 세계적인 원형 경기장으로 유네스코 세계문화유산입니다. 검투사들의 격투와 함께 5만 명의 관중이 열광했던 로마 제국의 웅장함을 느낄 수 있는 인류 문명의 걸작입니다.'
        },
        {
          name: '바티칸시국',
          description: '세계에서 가장 작은 독립국가이자 가톨릭의 성지로 시스티나 성당과 성 베드로 대성당이 있는 곳입니다. 미켈란젤로의 천지창조와 최후의 심판 등 르네상스 예술의 정수를 만날 수 있는 신성한 공간입니다.'
        },
        {
          name: '트레비분수',
          description: '로마에서 가장 아름다운 바로크 양식의 분수로 동전을 던지며 소원을 비는 전통으로 유명합니다. 포세이돈과 바다의 신들이 조각된 웅장한 분수는 밤에 조명을 받으면 더욱 환상적인 아름다움을 선사합니다.'
        }
      ]
    },
    {
      city: '런던',
      country: '영국',
      cityDescription: '전통과 혁신이 공존하는 대영제국의 수도',
      attractions: [
        {
          name: '빅벤',
          description: '런던의 상징이자 영국 의회의 시계탑으로 정확한 시간을 알리는 종소리로 전 세계에 알려져 있습니다. 고딕 양식의 웅장한 건축미와 함께 템스강변에서 바라보는 빅벤의 모습은 런던 여행의 필수 코스입니다.'
        },
        {
          name: '버킹엄궁전',
          description: '영국 왕실의 공식 거주지로 여왕의 근위병 교대식으로 유명한 런던의 대표 명소입니다. 화려한 궁전 건축과 함께 영국 왕실의 전통과 품격을 느낄 수 있으며, 세인트 제임스 공원과 함께 산책하기 좋은 곳입니다.'
        },
        {
          name: '런던아이',
          description: '템스강변에 세워진 거대한 관람차로 런던 전체를 360도로 조망할 수 있는 현대적 명소입니다. 32개의 캡슐에서 30분간 천천히 돌며 빅벤, 세인트폴 대성당 등 런던의 모든 랜드마크를 한눈에 볼 수 있습니다.'
        }
      ]
    },
    {
      city: '바르셀로나',
      country: '스페인',
      cityDescription: '가우디의 환상적인 건축과 지중해의 낭만이 어우러진 도시',
      attractions: [
        {
          name: '사그라다파밀리아',
          description: '안토니 가우디의 미완성 걸작으로 140년째 건설 중인 세계에서 유일한 유네스코 세계문화유산 성당입니다. 자연을 모티브로 한 독창적인 건축 양식과 스테인드글라스의 환상적인 빛은 바르셀로나 여행의 하이라이트입니다.'
        },
        {
          name: '구엘공원',
          description: '가우디가 설계한 세계에서 가장 아름다운 공원 중 하나로 동화 속 같은 모자이크 예술이 가득한 곳입니다. 화려한 색깔의 타일과 곡선미가 어우러진 독특한 건축물들 사이에서 바르셀로나 시내를 내려다볼 수 있습니다.'
        },
        {
          name: '람블라스거리',
          description: '바르셀로나의 중심가를 가로지르는 1.2km의 보행자 전용 대로로 거리 예술가들과 상점들이 즐비한 활기찬 거리입니다. 카탈루냐 광장에서 콜럼버스 기념탑까지 이어지며 바르셀로나의 진정한 매력을 느낄 수 있는 곳입니다.'
        }
      ]
    }
  ];

  const handleAttractionClick = (attractionName: string) => {
    setLoadingState(attractionName);
    // 🚀 새 URL 구조: /guide/[language]/[location]
    router.push(`/guide/${currentLanguage}/${encodeURIComponent(attractionName)}`);
  };

  return (
    <div className="min-h-screen bg-white" style={{ '--space-2xs': '4px', '--space-xs': '8px', '--space-sm': '12px', '--space-md': '16px', '--space-lg': '24px', '--space-xl': '40px', '--space-2xl': '64px' } as React.CSSProperties}>
      {/* SEO 메타 정보 */}
      <div className="hidden">
        <h1>유럽 여행 가이드 - 파리, 로마, 런던, 바르셀로나 완벽 가이드</h1>
        <p>유럽의 대표 관광지 파리, 로마, 런던, 바르셀로나를 AI 가이드와 함께 탐험하세요. 역사와 문화, 예술이 살아있는 유럽의 아름다운 명소들을 상세한 설명과 함께 소개합니다.</p>
      </div>

      {/* 헤더 */}
      <header className="bg-white py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-[clamp(3rem,5vw,4.5rem)] font-semibold text-black mb-6 leading-tight tracking-tight">
              유럽 여행 가이드
            </h1>
            <p className="text-[clamp(1rem,1.5vw,1.25rem)] font-light text-[#555555] mb-8 max-w-3xl mx-auto leading-relaxed">
              역사와 문화, 예술이 살아 숨쉬는 유럽의 대표 도시들을 AI 가이드와 함께 탐험하세요
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
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            유럽 대표 관광지
          </h2>
          <p className="text-lg text-[#555555] font-light max-w-3xl mx-auto">
            수천 년의 역사와 문화유산이 살아있는 유럽의 최고 여행지들을 소개합니다. 
            각 명소마다 AI가 생성하는 개인 맞춤형 가이드로 더욱 깊이 있는 문화 체험을 경험하세요.
          </p>
        </div>

        {/* 도시별 명소 */}
        <div className="space-y-16">
          {europeDestinations.map((destination, index) => (
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
                        className="bg-[#007AFF] text-white px-6 py-2 rounded-lg hover:bg-[#005FCC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            더 많은 유럽 여행 정보가 필요하신가요?
          </h3>
          <p className="text-lg text-[#555555] font-light mb-8 max-w-2xl mx-auto leading-relaxed">
            TripRadio.AI의 메인 검색에서 원하는 유럽 도시를 입력하고 개인 맞춤형 여행 가이드를 받아보세요
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-[#007AFF] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#005FCC] transition-colors"
          >
            여행지 검색하기
          </button>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-100 py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="text-[#555555] font-light mb-4">
            <h4 className="font-bold text-lg mb-2">TripRadio.AI - 유럽 여행 가이드</h4>
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