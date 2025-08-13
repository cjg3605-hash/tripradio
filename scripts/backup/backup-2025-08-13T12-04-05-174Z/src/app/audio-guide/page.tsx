import { Metadata } from 'next';
import Link from 'next/link';
import { generateKeywordPageMetadata } from '@/lib/seo/metadata';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

export const metadata: Metadata = {
  ...generateKeywordPageMetadata(
    '/audio-guide',
    'ko',
    'AI 오디오가이드 앱 추천 1위 | 무료 여행 해설 TripRadio.AI',
    '🎧 전 세계 어디서든 AI가 실시간으로 만들어주는 개인 맞춤형 오디오가이드! 도슨트 없이도 전문가급 해설을 무료로 경험해보세요 ✈️',
    ['오디오가이드', 'AI오디오가이드', '무료오디오가이드', '여행오디오가이드', '박물관오디오가이드', '미술관오디오가이드', '오디오가이드앱', '음성가이드', 'TripRadio.AI', '트립라디오AI', 'audio guide', 'travel audio guide']
  )
};

export default function AudioGuidePage() {
  return (
    <>
      <KeywordPageSchema 
        keyword="오디오가이드"
        pagePath="/audio-guide"
        title="AI 오디오가이드 앱 추천 1위 | 무료 여행 해설 TripRadio.AI"
        description="전 세계 어디서든 AI가 실시간으로 만들어주는 개인 맞춤형 오디오가이드! 도슨트 없이도 전문가급 해설을 무료로 경험해보세요"
        features={['AI 실시간 생성', '개인 맞춤형', '전 세계 지원', '완전 무료', '5개국어 지원', '오프라인 지원']}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
              AI Audio Guide • Premium Experience
            </div>
            <h1 className="text-4xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              AI 오디오가이드 앱 추천 
              <span className="font-semibold block mt-2">1위</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              전 세계 어디서든 AI가 실시간으로 만들어주는 개인 맞춤형 여행 오디오가이드로 
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
              href="#features"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-w-[200px]"
            >
              기능 둘러보기
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              기존 오디오가이드와는 
              <span className="font-semibold block mt-2">완전히 다릅니다</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🤖</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">AI 실시간 생성</h3>
              <p className="text-gray-600 leading-relaxed">
                미리 녹음된 딱딱한 해설이 아닌, AI가 당신의 관심사에 맞춰 실시간으로 생성하는 생동감 있는 해설
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎯</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">개인 맞춤형</h3>
              <p className="text-gray-600 leading-relaxed">
                역사 애호가, 예술 팬, 건축 매니아 등 당신의 취향에 맞춰 완전히 다른 관점의 해설을 제공
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🌍</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">전 세계 지원</h3>
              <p className="text-gray-600 leading-relaxed">
                파리 루브르에서 교토 금각사까지, 전 세계 어떤 곳이든 즉시 전문가급 오디오가이드 생성
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💰</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">완전 무료</h3>
              <p className="text-gray-600 leading-relaxed">
                비싼 도슨트 비용이나 오디오가이드 대여비 없이, 언제든 무료로 이용 가능
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🗣️</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">5개국어 지원</h3>
              <p className="text-gray-600 leading-relaxed">
                한국어, 영어, 일본어, 중국어, 스페인어로 자연스러운 음성 해설 제공
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📱</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">오프라인 지원</h3>
              <p className="text-gray-600 leading-relaxed">
                미리 다운로드하면 인터넷 없이도 언제든지 오디오가이드 이용 가능
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              기존 오디오가이드 vs
              <span className="font-semibold block mt-2">TripRadio.AI</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="p-10 border-r border-gray-200">
                  <h3 className="text-xl font-medium mb-8 text-gray-500">기존 오디오가이드</h3>
                  <ul className="space-y-5">
                    <li className="flex items-start gap-4">
                      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                      <span className="text-gray-600">미리 녹음된 고정 콘텐츠</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                      <span className="text-gray-600">모든 사람에게 동일한 해설</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                      <span className="text-gray-600">제한된 장소만 지원</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                      <span className="text-gray-600">대여비용 발생</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-10 bg-gray-50">
                  <h3 className="text-xl font-medium mb-8 text-gray-900">TripRadio.AI</h3>
                  <ul className="space-y-5">
                    <li className="flex items-start gap-4">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">AI가 실시간으로 생성</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">개인 취향별 맞춤 해설</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">전 세계 어디든 즉시 지원</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">완전 무료 사용</span>
                    </li>
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
            <h2 className="text-3xl lg:text-4xl font-light mb-6 tracking-tight">
              지금 바로 AI 오디오가이드를 경험해보세요
            </h2>
            <p className="text-lg lg:text-xl text-gray-300 mb-12 leading-relaxed">
              무료 체험으로 시작하는 특별한 여행의 첫걸음
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