import { Metadata } from 'next';
import Link from 'next/link';
import { generateKeywordPageMetadata } from '@/lib/seo/metadata';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';
import { useTranslations } from '@/components/useTranslations';

export const metadata: Metadata = {
  ...generateKeywordPageMetadata(
    '/free-travel',
    'ko',
    '자유여행 가이드 | AI가 계획부터 현지가이드까지 TripRadio.AI',
    '✈️ 혼자서도 안전하고 알찬 자유여행! AI가 계획부터 현지 가이드까지 모든 것을 도와드립니다. 나만의 자유여행을 완벽하게 설계하세요',
    ['자유여행', '혼자여행', '배낭여행', '개인여행', '자유여행코스', '자유여행계획', '자유여행가이드', '자유여행앱', 'AI자유여행', '스마트자유여행', '맞춤자유여행', '안전자유여행', 'TripRadio.AI', '트립라디오AI', 'free travel', 'solo travel', 'independent travel']
  )
};

export default function FreeTravelPage() {
  const t = useTranslations();
  
  return (
    <>
      <KeywordPageSchema 
        keyword="자유여행"
        pagePath="/free-travel"
        title="자유여행 가이드 | AI가 계획부터 현지가이드까지 TripRadio.AI"
        description="혼자서도 안전하고 알찬 자유여행! AI가 계획부터 현지 가이드까지 모든 것을 도와드립니다. 나만의 자유여행을 완벽하게 설계하세요"
        features={['완벽한 여행 계획', '실시간 현지 가이드', '안전 정보 제공', '예산 최적화', '언어 장벽 해결', '24시간 지원']}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
              {t('pages.freeTravel.badge')}
            </div>
            <h1 className="text-4xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              {t('pages.freeTravel.hero.title')} 
              <span className="font-semibold block mt-2">{t('pages.freeTravel.hero.subtitle')}</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              {t('pages.freeTravel.hero.description')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/trip-planner?type=solo&focus=safety"
              className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 min-w-[200px]"
            >
              {t('pages.freeTravel.cta.primary')}
            </Link>
            <Link 
              href="#planning"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-w-[200px]"
            >
              {t('pages.freeTravel.cta.secondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* Free Travel Challenges */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              자유여행, 이런 것들이 
              <span className="font-semibold block mt-2">걱정되시죠?</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📋</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">복잡한 계획 세우기</h3>
              <p className="text-gray-600">
                어디서 자고, 뭘 먹고, 어떻게 이동할지... 혼자 계획 세우기가 너무 복잡해요
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🚨</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">안전 걱정</h3>
              <p className="text-gray-600">
                혼자 여행하면서 위험한 곳은 아닌지, 사기당하지는 않을지 불안해요
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🗣️</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">언어 장벽</h3>
              <p className="text-gray-600">
                현지 언어를 못해서 제대로 소통할 수 있을지, 길을 잃으면 어떡할지 걱정돼요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Free Travel Solution */}
      <section id="planning" className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              AI가 만드는 
              <span className="font-semibold block mt-2">완벽한 자유여행</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎯</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">완벽한 여행 계획</h3>
              <p className="text-gray-600 leading-relaxed">
                예산, 일정, 취향을 고려해 AI가 숙소-교통-식당-관광지까지 완벽한 일정 자동 생성
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🧭</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">실시간 현지 가이드</h3>
              <p className="text-gray-600 leading-relaxed">
                현재 위치에 맞는 실시간 정보와 추천 장소를 AI가 즉시 제공하는 개인 전용 가이드
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🛡️</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">안전 정보 제공</h3>
              <p className="text-gray-600 leading-relaxed">
                현지 치안, 주의사항, 응급상황 대처법까지 안전한 자유여행을 위한 모든 정보
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💰</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">예산 최적화</h3>
              <p className="text-gray-600 leading-relaxed">
                한정된 예산으로 최고의 경험을 할 수 있도록 가성비 좋은 옵션들을 AI가 추천
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🗨️</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">언어 장벽 해결</h3>
              <p className="text-gray-600 leading-relaxed">
                주요 회화부터 응급상황 표현까지, 현지에서 필요한 모든 언어 지원을 AI가 제공
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🌙</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">24시간 지원</h3>
              <p className="text-gray-600 leading-relaxed">
                시차에 상관없이 언제든 AI 어시스턴트가 여행 중 발생하는 모든 질문에 즉시 답변
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Free Travel Types */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              어떤 스타일의 
              <span className="font-semibold block mt-2">자유여행을 원하세요?</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🎒</div>
                <h3 className="text-2xl font-medium text-gray-900">배낭여행 스타일</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>저예산으로 오래 머물며 현지 문화 깊이 체험</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>게스트하우스, 호스텔 등 가성비 숙소 추천</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>대중교통 활용한 효율적 이동 계획</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">✈️</div>
                <h3 className="text-2xl font-medium text-gray-900">편안한 개인여행</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>적당한 예산으로 편안하고 안전한 여행</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>호텔, 리조트 등 편의시설 갖춘 숙소</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>택시, 렌터카 등 편리한 교통수단 활용</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Planning Process */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              AI 자유여행 계획 
              <span className="font-semibold block mt-2">진행 과정</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">1️⃣</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-gray-900 mb-3">기본 정보 입력</h3>
                    <p className="text-gray-600 mb-3">
                      여행지, 기간, 예산, 동행인 수, 숙박 선호도 등 기본 정보를 입력합니다.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        💡 예시: "일본 도쿄 4박 5일, 예산 150만원, 혼자여행, 호텔 선호"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">2️⃣</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-gray-900 mb-3">맞춤 계획 생성</h3>
                    <p className="text-gray-600 mb-3">
                      AI가 당신의 정보를 분석해 최적의 여행 일정을 자동으로 생성합니다.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        💡 숙소 위치, 교통편, 관광 코스, 맛집까지 하루하루 상세 계획 제공
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">3️⃣</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-gray-900 mb-3">실시간 여행 지원</h3>
                    <p className="text-gray-600 mb-3">
                      여행 중에는 현재 위치 기반으로 실시간 가이드와 추천을 제공합니다.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        💡 날씨 변화, 교통 상황, 현지 이벤트 등에 따른 실시간 일정 조정
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              AI와 함께한 
              <span className="font-semibold block mt-2">성공적인 자유여행</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-4xl mb-6 text-center">🇯🇵</div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                "첫 해외 혼자 여행이었는데, AI 덕분에 완벽한 일본 여행을 했어요. 숨겨진 라멘집까지 추천해줘서 놀랐어요!"
              </p>
              <p className="text-sm text-gray-500 text-center">- 25세 직장인 김○○님</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-4xl mb-6 text-center">🇪🇺</div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                "유럽 한 달 배낭여행을 AI가 완벽하게 계획해줬어요. 예산 관리부터 안전 정보까지 정말 든든했습니다."
              </p>
              <p className="text-sm text-gray-500 text-center">- 22세 대학생 박○○님</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-4xl mb-6 text-center">🏝️</div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                "제주도 자유여행이 이렇게 특별할 수 있다니! 현지인도 모르는 숨겨진 명소들을 찾아갈 수 있었어요."
              </p>
              <p className="text-sm text-gray-500 text-center">- 30세 회사원 이○○님</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-light mb-6 tracking-tight">
              AI와 함께 완벽한 자유여행을 시작하세요
            </h2>
            <p className="text-lg lg:text-xl text-gray-300 mb-12 leading-relaxed">
              더 이상 복잡한 계획 때문에 망설이지 마세요. 당신만의 맞춤형 자유여행이 기다립니다
            </p>
            <Link 
              href="/trip-planner?type=solo&focus=safety"
              className="inline-block bg-white text-black px-10 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200"
            >
              자유여행 계획 시작하기
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}