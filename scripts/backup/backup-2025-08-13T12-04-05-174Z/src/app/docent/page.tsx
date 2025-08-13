import { Metadata } from 'next';
import Link from 'next/link';
import { generateKeywordPageMetadata } from '@/lib/seo/metadata';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

export const metadata: Metadata = {
  ...generateKeywordPageMetadata(
    '/docent',
    'ko',
    'AI 도슨트 서비스 | 전문 해설사 없이도 박물관·미술관 투어 TripRadio.AI',
    '🎨 전문 도슨트 없이도 박물관, 미술관에서 깊이 있는 해설을 들을 수 있습니다. AI가 실시간으로 만드는 개인 맞춤형 문화예술 해설 서비스',
    ['도슨트', 'AI도슨트', '박물관도슨트', '미술관도슨트', '문화해설사', '박물관해설', '미술관해설', '전시해설', '큐레이터해설', '문화투어', 'TripRadio.AI', '트립라디오AI', 'docent', 'museum guide', 'art guide']
  )
};

export default function DocentPage() {
  return (
    <>
      <KeywordPageSchema 
        keyword="도슨트"
        pagePath="/docent"
        title="AI 도슨트 서비스 | 전문 해설사 없이도 박물관·미술관 투어 TripRadio.AI"
        description="전문 도슨트 없이도 박물관, 미술관에서 깊이 있는 해설을 들을 수 있습니다. AI가 실시간으로 만드는 개인 맞춤형 문화예술 해설 서비스"
        features={['맞춤형 해설', '실시간 생성', '완전 무료', '자유로운 시간', '전 세계 지원', '스마트폰으로']}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
              AI Docent Service • Cultural Experience
            </div>
            <h1 className="text-4xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              AI 도슨트 서비스로 
              <span className="font-semibold block mt-2">깊이 있는 문화체험</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              전문 도슨트가 없어도 괜찮습니다. AI가 당신만을 위한 박물관·미술관 해설을 
              실시간으로 만들어드립니다
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/"
              className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 min-w-[200px]"
            >
              무료 체험하기
            </Link>
            <Link 
              href="#how-it-works"
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
              이런 경험 
              <span className="font-semibold block mt-2">있으시죠?</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💸</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">비싼 도슨트 비용</h3>
              <p className="text-gray-600">
                박물관 도슨트 투어는 1인당 2-5만원, 단체는 더 비싸죠
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">⏰</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">정해진 시간에만</h3>
              <p className="text-gray-600">
                도슨트 투어는 정해진 시간에만 가능하고, 내가 원하는 속도로 관람하기 어려워요
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">👥</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">획일적인 해설</h3>
              <p className="text-gray-600">
                모든 사람에게 같은 해설을 하니까, 내 관심사와 맞지 않을 때가 많아요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              TripRadio.AI 도슨트는 
              <span className="font-semibold block mt-2">완전히 다릅니다</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎯</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">맞춤형 해설</h3>
              <p className="text-gray-600 leading-relaxed">
                역사 애호가인가요? 예술 기법에 관심이 많나요? 당신의 관심사에 맞춰 완전히 다른 관점으로 해설해드립니다.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">⚡</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">실시간 생성</h3>
              <p className="text-gray-600 leading-relaxed">
                미리 녹음된 해설이 아닌, AI가 현장에서 실시간으로 생성하는 생생한 해설을 경험하세요.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💰</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">완전 무료</h3>
              <p className="text-gray-600 leading-relaxed">
                비싼 도슨트 비용 부담 없이, 언제든 무료로 전문가 수준의 해설을 들을 수 있습니다.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🕐</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">자유로운 시간</h3>
              <p className="text-gray-600 leading-relaxed">
                정해진 투어 시간에 맞출 필요 없이, 내가 원하는 속도로 자유롭게 관람하세요.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🌍</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">전 세계 지원</h3>
              <p className="text-gray-600 leading-relaxed">
                국립중앙박물관부터 루브르 박물관까지, 전 세계 어떤 문화시설이든 즉시 해설 제공
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📱</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">스마트폰으로</h3>
              <p className="text-gray-600 leading-relaxed">
                별도 장비 없이 스마트폰만 있으면 어디서든 개인 전용 도슨트를 이용할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              이런 곳에서 
              <span className="font-semibold block mt-2">활용하세요</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <h3 className="text-2xl font-medium text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">🏛️</span> 박물관
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">국립중앙박물관, 국립민속박물관</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">전쟁기념관, 역사박물관</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">과학관, 자연사박물관</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">해외 유명 박물관 (루브르, 대영박물관 등)</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <h3 className="text-2xl font-medium text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">🎨</span> 미술관
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">국립현대미술관, 리움미술관</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">개인 갤러리, 기획전시</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">해외 미술관 (MoMA, 테이트 모던 등)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">야외 조각공원, 설치미술</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              <span className="font-semibold">3단계</span>로 간단하게
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">1</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">장소 검색</h3>
              <p className="text-gray-600">
                방문하고 있는 박물관이나 미술관 이름을 검색하세요
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">2</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">관심사 선택</h3>
              <p className="text-gray-600">
                역사, 예술, 과학 등 당신의 관심 분야를 선택하세요
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">3</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">해설 청취</h3>
              <p className="text-gray-600">
                AI가 만든 맞춤형 해설을 들으며 깊이 있는 관람을 시작하세요
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
              지금 바로 AI 도슨트와 함께 문화체험을 시작하세요
            </h2>
            <p className="text-lg lg:text-xl text-gray-300 mb-12 leading-relaxed">
              더 이상 비싼 도슨트 비용 때문에 망설이지 마세요
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