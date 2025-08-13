import { Metadata } from 'next';
import Link from 'next/link';
import { generateKeywordPageMetadata } from '@/lib/seo/metadata';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

export const metadata: Metadata = {
  ...generateKeywordPageMetadata(
    '/tour-radio',
    'ko',
    '투어라디오 앱 | AI가 만드는 실시간 여행 해설 방송 TripRadio.AI',
    '📻 여행지에서 들을 수 있는 특별한 투어라디오! AI가 실시간으로 만들어주는 개인 맞춤형 여행 해설 방송을 무료로 경험하세요',
    ['투어라디오', '여행라디오', '투어방송', '여행방송', '관광라디오', '여행해설', '투어해설', '여행가이드라디오', '관광방송', '여행오디오', 'TripRadio.AI', '트립라디오AI', 'tour radio', 'travel radio', 'travel broadcast']
  )
};

export default function TourRadioPage() {
  return (
    <>
      <KeywordPageSchema 
        keyword="투어라디오"
        pagePath="/tour-radio"
        title="투어라디오 앱 | AI가 만드는 실시간 여행 해설 방송 TripRadio.AI"
        description="여행지에서 들을 수 있는 특별한 투어라디오! AI가 실시간으로 만들어주는 개인 맞춤형 여행 해설 방송을 무료로 경험하세요"
        features={['실시간 방송 형태', '재미있는 스토리텔링', '위치 기반 자동 재생', '배경음악과 효과음', '대화형 진행', '전 세계 어디든']}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
              Tour Radio Service • Real-time Broadcasting
            </div>
            <h1 className="text-4xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              AI 투어라디오로 
              <span className="font-semibold block mt-2">특별한 여행 방송</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              AI가 당신이 있는 곳의 이야기를 실시간으로 들려주는 
              개인 전용 투어라디오 방송을 경험하세요
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/"
              className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 min-w-[200px]"
            >
              무료로 시작하기
            </Link>
            <Link 
              href="#features"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-w-[200px]"
            >
              서비스 소개
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              기존 여행에서 
              <span className="font-semibold block mt-2">아쉬웠던 점들</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🤫</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">조용한 여행</h3>
              <p className="text-gray-600">
                혼자 여행할 때 너무 조용하고 심심해서 그 곳의 이야기를 알 수 없었어요
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📖</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">딱딱한 설명</h3>
              <p className="text-gray-600">
                가이드북이나 안내판의 딱딱한 설명보다는 재미있는 이야기로 듣고 싶었어요
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💰</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">비싼 가이드</h3>
              <p className="text-gray-600">
                현지 가이드나 투어 프로그램은 비싸고, 다른 사람들과 맞춰야 해서 불편해요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              TripRadio.AI만의 
              <span className="font-semibold block mt-2">특별한 경험</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📻</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">실시간 방송 형태</h3>
              <p className="text-gray-600 leading-relaxed">
                딱딱한 해설이 아닌, 마치 현지 DJ가 들려주는 것 같은 자연스러운 방송 형태로 여행 이야기를 전달합니다
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎭</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">재미있는 스토리텔링</h3>
              <p className="text-gray-600 leading-relaxed">
                역사적 사실을 지루하게 나열하는 것이 아니라, 흥미진진한 이야기로 포장해서 들려드립니다
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎯</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">위치 기반 자동 재생</h3>
              <p className="text-gray-600 leading-relaxed">
                GPS를 통해 당신이 어디에 있는지 자동으로 인식하고, 그 장소에 맞는 투어라디오를 자동 시작합니다
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎶</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">배경음악과 효과음</h3>
              <p className="text-gray-600 leading-relaxed">
                적절한 배경음악과 효과음으로 마치 진짜 라디오 방송을 듣는 것 같은 몰입감을 제공합니다
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💬</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">대화형 진행</h3>
              <p className="text-gray-600 leading-relaxed">
                "혹시 이런 생각해본 적 있나요?" 같은 대화형 진행으로 마치 친구와 대화하는 것 같은 느낌을 줍니다
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🌍</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">전 세계 어디든</h3>
              <p className="text-gray-600 leading-relaxed">
                한국의 작은 골목부터 파리의 에펠탑까지, 전 세계 어떤 곳이든 그 장소만의 투어라디오를 즉시 생성합니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Types Section */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              다양한 투어라디오 
              <span className="font-semibold block mt-2">경험의 종류</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏛️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">문화유적 투어라디오</h3>
                    <p className="text-gray-600">
                      경복궁, 불국사 같은 문화유적에서 들을 수 있는 역사 이야기 라디오
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🌊</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">자연 명소 투어라디오</h3>
                    <p className="text-gray-600">
                      제주도, 설악산 같은 자연 명소에서 들을 수 있는 자연과 생태 이야기 라디오
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏙️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">도시 탐방 투어라디오</h3>
                    <p className="text-gray-600">
                      홍대, 명동 같은 도시 곳곳에서 들을 수 있는 동네 이야기와 문화 라디오
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🍜</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">맛집 투어라디오</h3>
                    <p className="text-gray-600">
                      유명 맛집 주변에서 들을 수 있는 음식 문화와 역사 이야기 라디오
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">예술 투어라디오</h3>
                    <p className="text-gray-600">
                      미술관, 갤러리에서 들을 수 있는 예술 작품과 작가 이야기 라디오
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🌸</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">계절 특집 투어라디오</h3>
                    <p className="text-gray-600">
                      벚꽃, 단풍 같은 계절별 명소에서 들을 수 있는 계절 이야기 라디오
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              투어라디오 
              <span className="font-semibold block mt-2">이용 방법</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">1</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">앱 실행</h3>
              <p className="text-gray-600">
                여행지에 도착하면 TripRadio.AI 앱을 실행하세요
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">2</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">위치 감지</h3>
              <p className="text-gray-600">
                GPS가 자동으로 현재 위치를 감지하고 해당 장소를 인식합니다
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">3</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">라디오 시작</h3>
              <p className="text-gray-600">
                AI가 그 장소만의 특별한 투어라디오를 실시간으로 생성합니다
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">4</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">감상</h3>
              <p className="text-gray-600">
                이어폰을 끼고 편안하게 투어라디오를 들으며 여행을 즐기세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-light mb-6 tracking-tight">
              당신만의 특별한 투어라디오를 지금 시작하세요
            </h2>
            <p className="text-lg lg:text-xl text-gray-300 mb-12 leading-relaxed">
              더 이상 심심한 여행은 그만! 재미있는 이야기가 가득한 여행을 경험하세요
            </p>
            <Link 
              href="/"
              className="inline-block bg-white text-black px-10 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200"
            >
              무료로 시작하기
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}