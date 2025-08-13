import { Metadata } from 'next';
import Link from 'next/link';
import { generateKeywordPageMetadata } from '@/lib/seo/metadata';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

export const metadata: Metadata = {
  ...generateKeywordPageMetadata(
    '/destinations',
    'ko',
    '전세계 TOP100 관광명소 가이드 | 세계 유명 여행지 TripRadio.AI',
    '🌍 전세계 TOP100 관광명소를 AI 가이드와 함께! 파리 에펠탑부터 제주도까지, 세계 유명 여행지의 숨겨진 이야기를 만나보세요',
    ['전세계관광명소', 'TOP100여행지', '세계유명관광지', '해외관광명소', '세계여행지', '유명여행지', '관광명소추천', '세계관광지', '해외여행지', '명소가이드', '세계명소', 'TripRadio.AI', '트립라디오AI', 'world attractions', 'top destinations', 'famous landmarks']
  )
};

// 전세계 TOP100 관광명소 데이터 (SEO 최적화용)
const worldTop100Destinations = [
  // 유럽
  { name: '에펠탑', country: '프랑스', continent: '유럽', emoji: '🗼', description: '파리의 상징적 랜드마크' },
  { name: '로마 콜로세움', country: '이탈리아', continent: '유럽', emoji: '🏛️', description: '고대 로마의 영광' },
  { name: '사그라다 파밀리아', country: '스페인', continent: '유럽', emoji: '⛪', description: '가우디의 미완성 걸작' },
  { name: '루브르 박물관', country: '프랑스', continent: '유럽', emoji: '🎨', description: '세계 최대 미술관' },
  { name: '베르사유 궁전', country: '프랑스', continent: '유럽', emoji: '👑', description: '프랑스 왕실의 화려함' },
  
  // 아시아
  { name: '만리장성', country: '중국', continent: '아시아', emoji: '🏯', description: '인류 최대의 건축물' },
  { name: '후지산', country: '일본', continent: '아시아', emoji: '🗻', description: '일본의 상징' },
  { name: '앙코르와트', country: '캄보디아', continent: '아시아', emoji: '🕌', description: '크메르 문명의 걸작' },
  { name: '타지마할', country: '인도', continent: '아시아', emoji: '🕌', description: '사랑의 무덤' },
  { name: '경복궁', country: '한국', continent: '아시아', emoji: '🏰', description: '조선왕조의 정궁' },
  
  // 아메리카
  { name: '자유의 여신상', country: '미국', continent: '아메리카', emoji: '🗽', description: '자유와 민주주의의 상징' },
  { name: '마추픽추', country: '페루', continent: '아메리카', emoji: '⛰️', description: '공중도시 잉카의 비밀' },
  { name: '그랜드캐니언', country: '미국', continent: '아메리카', emoji: '🏔️', description: '지구의 상처' },
  
  // 아프리카
  { name: '피라미드', country: '이집트', continent: '아프리카', emoji: '🔺', description: '고대 이집트의 신비' },
  { name: '빅토리아 폭포', country: '잠비아/짐바브웨', continent: '아프리카', emoji: '💦', description: '천둥치는 연기' },
  
  // 오세아니아
  { name: '시드니 오페라하우스', country: '호주', continent: '오세아니아', emoji: '🎭', description: '현대 건축의 아이콘' },
  { name: '울루루', country: '호주', continent: '오세아니아', emoji: '🪨', description: '호주 원주민의 성지' },
];

export default function DestinationsPage() {
  const continents = ['유럽', '아시아', '아메리카', '아프리카', '오세아니아'];
  
  return (
    <>
      <KeywordPageSchema 
        keyword="전세계 관광명소"
        pagePath="/destinations"
        title="전세계 TOP100 관광명소 가이드 | 세계 유명 여행지 TripRadio.AI"
        description="전세계 TOP100 관광명소를 AI 가이드와 함께! 파리 에펠탑부터 제주도까지, 세계 유명 여행지의 숨겨진 이야기를 만나보세요"
        features={['TOP100 세계명소', 'AI 전문 가이드', '숨겨진 스토리', '역사와 문화', '현지 정보', '맞춤 추천']}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
              World TOP100 Attractions • AI Expert Guide
            </div>
            <h1 className="text-4xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              전세계 TOP100 
              <span className="font-semibold block mt-2">관광명소 완벽 가이드</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              세계에서 가장 아름답고 의미 있는 명소들을 AI 전문 가이드가 
              생생한 이야기와 함께 안내해드립니다
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/"
              className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 min-w-[200px]"
            >
              무료 가이드 시작
            </Link>
            <Link 
              href="#top-destinations"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-w-[200px]"
            >
              TOP100 명소 보기
            </Link>
          </div>
        </div>
      </section>

      {/* Why TOP100 */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              왜 이 명소들이 
              <span className="font-semibold block mt-2">세계 TOP100일까요?</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🏛️</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">역사적 가치</h3>
              <p className="text-gray-600">
                인류 문명의 발전 과정을 보여주는 소중한 유산들로 구성된 세계적 명소
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎨</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">예술적 가치</h3>
              <p className="text-gray-600">
                인간 창의성의 극한을 보여주는 건축물과 예술 작품들의 집합체
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🌿</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">자연의 경이</h3>
              <p className="text-gray-600">
                지구가 수억 년에 걸쳐 만들어낸 경이로운 자연 풍경과 생태계
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Guide Benefits */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              AI 가이드만의 
              <span className="font-semibold block mt-2">특별한 경험</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🧠</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">전문가 수준 지식</h3>
              <p className="text-gray-600 leading-relaxed">
                수천 개의 전문 자료를 학습한 AI가 역사학자, 예술사가 수준의 깊이 있는 해설 제공
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🕐</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">언제든 이용 가능</h3>
              <p className="text-gray-600 leading-relaxed">
                시간 제약 없이 24시간 언제든, 당신이 원하는 속도로 각 명소를 깊이 탐험
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎯</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">맞춤형 관심사</h3>
              <p className="text-gray-600 leading-relaxed">
                역사, 예술, 건축, 종교 등 당신의 관심사에 따라 완전히 다른 관점의 설명
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🗣️</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">다국어 완벽 지원</h3>
              <p className="text-gray-600 leading-relaxed">
                한국어, 영어, 일본어, 중국어 등 다양한 언어로 동일한 품질의 가이드 제공
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📱</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">스마트폰으로 간편</h3>
              <p className="text-gray-600 leading-relaxed">
                별도 장비 없이 스마트폰만 있으면 전세계 어떤 명소든 전문 가이드 이용
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💰</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">완전 무료</h3>
              <p className="text-gray-600 leading-relaxed">
                어떤 명소든, 얼마나 오래 들어도 완전 무료로 이용할 수 있는 프리미엄 가이드
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Destinations by Continent */}
      <section id="top-destinations" className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              대륙별 TOP 
              <span className="font-semibold block mt-2">관광명소</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="space-y-16">
            {continents.map((continent) => {
              const destinations = worldTop100Destinations.filter(d => d.continent === continent);
              return (
                <div key={continent} className="max-w-6xl mx-auto">
                  <h3 className="text-2xl font-medium text-gray-900 mb-8 text-center">
                    {continent === '유럽' && '🇪🇺'} 
                    {continent === '아시아' && '🌏'} 
                    {continent === '아메리카' && '🌎'} 
                    {continent === '아프리카' && '🌍'} 
                    {continent === '오세아니아' && '🇦🇺'} 
                    {' '}{continent}
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {destinations.map((destination, index) => (
                      <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                        <div className="text-center mb-4">
                          <div className="text-3xl mb-3">{destination.emoji}</div>
                          <h4 className="text-lg font-medium text-gray-900">{destination.name}</h4>
                          <p className="text-sm text-gray-500 mb-2">{destination.country}</p>
                          <p className="text-xs text-gray-600">{destination.description}</p>
                        </div>
                        <Link 
                          href={`/guide/${encodeURIComponent(destination.name)}`}
                          className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded text-center text-sm hover:bg-gray-200 transition-colors"
                        >
                          가이드 듣기
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="text-center mt-16">
            <p className="text-gray-600 mb-6">
              이 외에도 전세계 수많은 명소의 AI 가이드를 만나보세요
            </p>
            <Link 
              href="/"
              className="inline-flex items-center px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200"
            >
              전체 명소 검색하기
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Special Features */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              세계 명소별 
              <span className="font-semibold block mt-2">특별한 이야기</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🏺</div>
                <h3 className="text-xl font-medium text-gray-900">숨겨진 역사</h3>
              </div>
              <p className="text-gray-600 mb-4">
                일반 가이드북에서는 찾을 수 없는 각 명소의 숨겨진 역사와 비하인드 스토리를 AI가 발굴해서 들려드립니다.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>에펠탑 건설 당시 파리 시민들의 반대 이야기</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>마추픽추가 500년간 숨겨져 있던 이유</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>타지마할에 숨겨진 사랑과 슬픔의 이야기</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🎭</div>
                <h3 className="text-xl font-medium text-gray-900">문화적 의미</h3>
              </div>
              <p className="text-gray-600 mb-4">
                단순한 관광지가 아닌 각 명소가 해당 문화권에서 갖는 깊은 의미와 현재까지의 영향을 상세히 설명합니다.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>앙코르와트가 크메르 문명에 미친 영향</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>만리장성이 중국 역사에서의 역할</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>후지산이 일본 문화에 미친 정신적 영향</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-light mb-6 tracking-tight">
              전세계 TOP100 명소를 지금 바로 만나보세요
            </h2>
            <p className="text-lg lg:text-xl text-gray-300 mb-12 leading-relaxed">
              AI 전문 가이드와 함께하는 세계 명소 탐험이 당신을 기다립니다
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