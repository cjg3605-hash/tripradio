import { Metadata } from 'next';
import Link from 'next/link';
import { generateKeywordPageMetadata } from '@/lib/seo/metadata';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

export const metadata: Metadata = {
  ...generateKeywordPageMetadata(
    '/travel-radio',
    'ko',
    '여행라디오 앱 | 여행 중 들을 수 있는 특별한 라디오 TripRadio.AI',
    '🎙️ 지루한 여행은 이제 그만! AI가 실시간으로 만들어주는 나만의 여행라디오로 특별한 여행 경험을 시작하세요. 완전 무료!',
    ['여행라디오', '트립라디오', '여행방송', '여행팟캐스트', '여행음성', '여행오디오', '여행해설', '여행가이드', '여행스토리', '여행이야기', 'TripRadio.AI', '트립라디오AI', 'travel radio', 'trip radio', 'travel podcast']
  )
};

export default function TravelRadioPage() {
  return (
    <>
      <KeywordPageSchema 
        keyword="여행라디오"
        pagePath="/travel-radio"
        title="여행라디오 앱 | 여행 중 들을 수 있는 특별한 라디오 TripRadio.AI"
        description="지루한 여행은 이제 그만! AI가 실시간으로 만들어주는 나만의 여행라디오로 특별한 여행 경험을 시작하세요"
        features={['실시간 라디오 제작', '개인 맞춤형 콘텐츠', '전 세계 어디든', '진짜 라디오 느낌', '완전 무료', '편안한 청취']}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
              Travel Radio Service • AI-Powered Broadcasting
            </div>
            <h1 className="text-4xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              나만의 여행라디오가 
              <span className="font-semibold block mt-2">시작됩니다</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              AI가 당신을 위해 특별히 만드는 개인 맞춤형 여행라디오로 
              특별한 여행 경험을 시작하세요
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
              href="#why-travel-radio"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-w-[200px]"
            >
              서비스 소개
            </Link>
          </div>
        </div>
      </section>

      {/* Why Travel Radio Section */}
      <section id="why-travel-radio" className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              왜 여행라디오가 
              <span className="font-semibold block mt-2">필요할까요?</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">😴</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">조용한 혼자 여행</h3>
              <p className="text-gray-600">
                혼자 여행할 때 너무 조용해서 심심하고, 그 장소의 특별한 이야기를 놓치고 있어요
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📱</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">스마트폰만 보는 여행</h3>
              <p className="text-gray-600">
                여행 중에도 계속 스마트폰을 보게 되어 진짜 여행의 재미를 놓치고 있어요
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💸</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">비싼 가이드 투어</h3>
              <p className="text-gray-600">
                가이드 투어는 비싸고, 다른 사람들과 일정을 맞춰야 해서 자유롭지 못해요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              TripRadio.AI 여행라디오의 
              <span className="font-semibold block mt-2">특별한 경험</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎙️</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">실시간 라디오 제작</h3>
              <p className="text-gray-600 leading-relaxed">
                미리 녹음된 콘텐츠가 아닌, AI가 당신이 있는 곳에서 실시간으로 제작하는 생생한 여행라디오
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎯</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">개인 맞춤형 콘텐츠</h3>
              <p className="text-gray-600 leading-relaxed">
                당신의 여행 스타일, 관심사, 나이대에 맞춰 완전히 다른 스타일의 여행라디오를 제공
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🌍</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">전 세계 어디든</h3>
              <p className="text-gray-600 leading-relaxed">
                부산 해운대부터 파리 샹젤리제까지, 전 세계 어떤 곳이든 그 장소만의 여행라디오 즉시 제작
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📻</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">진짜 라디오 느낌</h3>
              <p className="text-gray-600 leading-relaxed">
                딱딱한 가이드가 아닌, 친근한 라디오 DJ가 들려주는 것 같은 자연스러운 진행 스타일
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💝</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">완전 무료</h3>
              <p className="text-gray-600 leading-relaxed">
                비싼 오디오가이드 대여비나 투어 비용 없이, 언제든 무료로 나만의 여행라디오를 이용
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎧</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">편안한 청취</h3>
              <p className="text-gray-600 leading-relaxed">
                이어폰만 끼면 되는 간편함! 걸으면서, 쉬면서, 언제든 편안하게 여행라디오 청취
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Radio Types Section */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              다양한 여행라디오 
              <span className="font-semibold block mt-2">채널의 종류</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏰</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">역사 여행라디오</h3>
                    <p className="text-gray-600">
                      고궁, 유적지에서 들을 수 있는 흥미진진한 역사 이야기와 숨겨진 비화
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🌺</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">자연 여행라디오</h3>
                    <p className="text-gray-600">
                      산, 바다, 공원에서 들을 수 있는 자연의 아름다움과 생태 이야기
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🍜</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">맛집 여행라디오</h3>
                    <p className="text-gray-600">
                      맛집 탐방과 함께 들을 수 있는 음식 문화와 현지인들의 이야기
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">문화 여행라디오</h3>
                    <p className="text-gray-600">
                      미술관, 박물관에서 들을 수 있는 예술 작품과 문화에 대한 깊이 있는 해설
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
                    <h3 className="text-xl font-medium text-gray-900 mb-2">도시 여행라디오</h3>
                    <p className="text-gray-600">
                      번화가, 골목길에서 들을 수 있는 도시의 역동적인 이야기와 트렌드
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🌙</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">야경 여행라디오</h3>
                    <p className="text-gray-600">
                      밤에 들을 수 있는 특별한 야경 명소와 낭만적인 여행 이야기
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Listen Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              여행라디오 
              <span className="font-semibold block mt-2">청취 방법</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">1</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">여행지 도착</h3>
              <p className="text-gray-600">
                여행하고 싶은 곳에 도착하면 TripRadio.AI를 실행하세요
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">2</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">취향 설정</h3>
              <p className="text-gray-600">
                어떤 스타일의 여행라디오를 들을지 간단히 선택하세요
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">3</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">라디오 생성</h3>
              <p className="text-gray-600">
                AI가 당신만을 위한 특별한 여행라디오를 실시간으로 제작합니다
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">4</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">여행 즐기기</h3>
              <p className="text-gray-600">
                이어폰을 끼고 여행라디오를 들으며 특별한 여행을 즐기세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              여행라디오와 함께한 
              <span className="font-semibold block mt-2">특별한 경험들</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-4xl mb-6 text-center">🌟</div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                "혼자 제주도 여행이 심심했는데, 여행라디오 덕분에 마치 친구와 함께 여행하는 기분이었어요!"
              </p>
              <p className="text-sm text-gray-500 text-center">- 20대 직장인 김○○님</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-4xl mb-6 text-center">💝</div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                "경복궁에서 들은 역사 이야기가 너무 재미있어서 시간 가는 줄 몰랐어요. 무료인 게 믿기지 않아요!"
              </p>
              <p className="text-sm text-gray-500 text-center">- 30대 주부 박○○님</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-4xl mb-6 text-center">🎧</div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                "파리 여행에서 루브르 박물관 해설을 한국어로 들을 수 있어서 정말 좋았습니다!"
              </p>
              <p className="text-sm text-gray-500 text-center">- 50대 여행객 이○○님</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-light mb-6 tracking-tight">
              지금 바로 나만의 여행라디오를 시작하세요
            </h2>
            <p className="text-lg lg:text-xl text-gray-300 mb-12 leading-relaxed">
              더 이상 심심한 혼자 여행은 그만! 특별한 여행라디오와 함께 떠나세요
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