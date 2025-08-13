import { Metadata } from 'next';
import Link from 'next/link';
import { generateKeywordPageMetadata } from '@/lib/seo/metadata';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

export const metadata: Metadata = {
  ...generateKeywordPageMetadata(
    '/ai-travel',
    'ko',
    'AI여행 가이드 | 인공지능과 함께하는 스마트한 여행 TripRadio.AI',
    '🤖 AI가 계획부터 해설까지! 인공지능과 함께하는 완전히 새로운 스마트 여행 경험을 만나보세요. 개인 맞춤형 AI여행 가이드 서비스',
    ['AI여행', 'AI여행가이드', '인공지능여행', '스마트여행', 'AI가이드', 'AI투어', '인공지능가이드', '스마트가이드', 'AI여행앱', 'AI관광', 'TripRadio.AI', '트립라디오AI', 'AI travel', 'smart travel', 'AI guide']
  )
};

export default function AiTravelPage() {
  return (
    <>
      <KeywordPageSchema 
        keyword="AI여행"
        pagePath="/ai-travel"
        title="AI여행 가이드 | 인공지능과 함께하는 스마트한 여행 TripRadio.AI"
        description="AI가 계획부터 해설까지! 인공지능과 함께하는 완전히 새로운 스마트 여행 경험을 만나보세요"
        features={['지능형 콘텐츠 생성', '개인화 추천 엔진', '실시간 위치 인식', '자연어 음성 합성', '다중 데이터 통합', '지속적 학습']}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
              AI Travel Service • Smart Journey
            </div>
            <h1 className="text-4xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              AI와 함께하는 
              <span className="font-semibold block mt-2">스마트한 여행</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              이제 여행 계획부터 현지 해설까지 모든 것을 AI가 도와드립니다. 
              인공지능과 함께하는 완전히 새로운 여행의 시작
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
              href="#ai-features"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-w-[200px]"
            >
              AI 기능 살펴보기
            </Link>
          </div>
        </div>
      </section>

      {/* Future of Travel Section */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              AI여행이 바꾸는 
              <span className="font-semibold block mt-2">여행의 미래</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">😰</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">기존 여행의 문제점</h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• 여행 계획 세우기가 너무 복잡</li>
                <li>• 현지에서 길을 잃거나 정보 부족</li>
                <li>• 언어 장벽으로 제대로 된 설명 못 들음</li>
                <li>• 가이드북은 재미없고 딱딱함</li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🤖</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">AI여행의 혁신</h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• AI가 자동으로 최적의 여행 계획 수립</li>
                <li>• 실시간 위치 기반 맞춤 정보 제공</li>
                <li>• 다국어 지원으로 언어 장벽 해결</li>
                <li>• 개인 취향에 맞는 재미있는 해설</li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">✨</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">미래 여행의 모습</h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• 스마트폰 하나로 모든 것 해결</li>
                <li>• 24시간 언제든 개인 전용 가이드</li>
                <li>• 실시간 학습으로 점점 더 똑똑해짐</li>
                <li>• 완전 무료로 누구나 이용 가능</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section id="ai-features" className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              TripRadio.AI의 
              <span className="font-semibold block mt-2">첨단 AI 기술</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🧠</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">지능형 콘텐츠 생성</h3>
              <p className="text-gray-600 leading-relaxed">
                Google Gemini AI를 활용하여 각 장소의 특색에 맞는 고품질 여행 콘텐츠를 실시간으로 생성합니다
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎯</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">개인화 추천 엔진</h3>
              <p className="text-gray-600 leading-relaxed">
                당신의 여행 패턴, 선호도, 관심사를 학습하여 점점 더 정확한 맞춤형 추천을 제공합니다
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📍</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">실시간 위치 인식</h3>
              <p className="text-gray-600 leading-relaxed">
                GPS와 AI 기술을 결합하여 현재 위치를 정확히 파악하고 적합한 콘텐츠를 즉시 제공합니다
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🗣️</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">자연어 음성 합성</h3>
              <p className="text-gray-600 leading-relaxed">
                최신 TTS 기술로 자연스럽고 감정이 담긴 음성으로 여행 해설을 들려드립니다
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📚</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">다중 데이터 통합</h3>
              <p className="text-gray-600 leading-relaxed">
                UNESCO, Wikipedia, Google Places 등 신뢰할 수 있는 다양한 데이터를 AI가 분석하고 종합합니다
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🔄</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">지속적 학습</h3>
              <p className="text-gray-600 leading-relaxed">
                사용자 피드백과 행동 패턴을 통해 AI가 지속적으로 학습하며 서비스가 계속 향상됩니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Journey Section */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              AI와 함께하는 
              <span className="font-semibold block mt-2">여행 여정</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-gray-900 mb-3">1. AI 여행 계획 수립</h3>
                    <p className="text-gray-600 mb-3">
                      원하는 여행지만 입력하면 AI가 당신의 취향을 분석하여 최적의 여행 일정을 자동으로 계획합니다.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        💡 예시: "부산 2박 3일" 입력 → AI가 해운대, 감천문화마을, 태종대 등 맞춤 코스 제안
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🧭</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-gray-900 mb-3">2. 스마트 내비게이션</h3>
                    <p className="text-gray-600 mb-3">
                      AI가 실시간으로 교통상황을 분석하여 가장 빠른 길을 안내하고, 중간에 들릴 만한 곳도 추천합니다.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        💡 예시: 경복궁 가는 길에 "북촌한옥마을도 가까우니 함께 둘러보시겠어요?" 제안
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎙️</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-gray-900 mb-3">3. 현장 AI 해설</h3>
                    <p className="text-gray-600 mb-3">
                      도착하면 AI가 그 장소만의 특별한 이야기를 당신의 관심사에 맞춰 실시간으로 만들어 들려줍니다.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        💡 예시: 역사 좋아하는 분 → 조선시대 왕실 이야기 / 건축 관심 → 전통 건축 기법 설명
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📱</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-gray-900 mb-3">4. 실시간 맞춤 정보</h3>
                    <p className="text-gray-600 mb-3">
                      날씨, 혼잡도, 운영시간 등을 실시간으로 체크하여 여행 일정을 자동으로 조정해줍니다.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        💡 예시: "비가 예상되니 실내 관광지인 국립중앙박물관으로 먼저 가시는 게 어떨까요?"
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
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              왜 AI여행을 
              <span className="font-semibold block mt-2">선택해야 할까요?</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">비용 절약</h3>
                    <p className="text-gray-600">
                      비싼 가이드 투어나 여행사 패키지 없이도 전문가 수준의 여행 서비스를 무료로 이용
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⏰</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">시간 절약</h3>
                    <p className="text-gray-600">
                      여행 계획 세우는 데 며칠 걸리던 일을 AI가 몇 분 만에 해결
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">개인 맞춤화</h3>
                    <p className="text-gray-600">
                      획일적인 단체 투어가 아닌, 나만을 위한 개인 맞춤형 여행 경험
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">언어 장벽 해결</h3>
                    <p className="text-gray-600">
                      전 세계 어디를 가도 한국어로 자세한 설명을 들을 수 있어 언어 걱정 없음
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔄</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">실시간 업데이트</h3>
                    <p className="text-gray-600">
                      변경되는 정보들을 실시간으로 반영하여 항상 최신 정보 제공
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">풍부한 정보</h3>
                    <p className="text-gray-600">
                      단순한 기본 정보를 넘어 흥미로운 비화와 깊이 있는 배경 지식까지
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
            <h2 className="text-3xl lg:text-4xl font-light mb-6 tracking-tight">
              AI여행의 미래를 지금 바로 경험해보세요
            </h2>
            <p className="text-lg lg:text-xl text-gray-300 mb-12 leading-relaxed">
              더 스마트하고, 더 편리하고, 더 재미있는 여행이 당신을 기다립니다
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