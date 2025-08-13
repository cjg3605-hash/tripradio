import { Metadata } from 'next';
import Link from 'next/link';
import { generateKeywordPageMetadata } from '@/lib/seo/metadata';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';
import { useTranslations } from '@/components/useTranslations';

export const metadata: Metadata = {
  ...generateKeywordPageMetadata(
    '/travel',
    'ko',
    '여행 가이드 추천 1위 | 전세계 어디든 AI 여행 가이드 TripRadio.AI',
    '🌍 전세계 모든 여행지의 숨겨진 이야기를 AI가 실시간으로 들려드립니다. 나만의 맞춤형 여행 경험을 무료로 시작하세요!',
    ['여행', '여행가이드', '여행정보', '관광', '관광지', '여행앱', '맞춤여행', '스마트여행', 'AI여행가이드', '무료여행가이드', '실시간가이드', '전세계여행', 'TripRadio.AI', '트립라디오AI', 'travel guide', 'tourism', 'travel app']
  )
};

export default function TravelPage() {
  const t = useTranslations();
  
  return (
    <>
      <KeywordPageSchema 
        keyword="여행"
        pagePath="/travel"
        title="여행 가이드 추천 1위 | 전세계 어디든 AI 여행 가이드 TripRadio.AI"
        description="전세계 모든 여행지의 숨겨진 이야기를 AI가 실시간으로 들려드립니다. 나만의 맞춤형 여행 경험을 무료로 시작하세요!"
        features={['전세계 모든 여행지', 'AI 실시간 생성', '개인 맞춤 추천', '숨겨진 명소 발굴', '현지 문화 체험', '완전 무료']}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
              {t('pages.travel.badge')}
            </div>
            <h1 className="text-4xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              {t('pages.travel.hero.title')} 
              <span className="font-semibold block mt-2">{t('pages.travel.hero.subtitle')}</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              {t('pages.travel.hero.description')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/?purpose=travel&ai=smart"
              className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 min-w-[200px]"
            >
              {t('pages.travel.cta.primary')}
            </Link>
            <Link 
              href="#destinations"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-w-[200px]"
            >
              {t('pages.travel.cta.secondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('pages.travel.problems.title')}
              <span className="font-semibold block mt-2">{t('pages.travel.problems.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🤔</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">어디로 가야 할지 모르겠어요</h3>
              <p className="text-gray-600">
                수많은 여행지 정보에 압도되어서 정작 어디로 가야 할지 결정을 못 내리겠어요
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📱</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">정보가 너무 많고 복잡해요</h3>
              <p className="text-gray-600">
                인터넷에 정보는 많은데 어떤 게 맞는지, 내게 적합한지 판단하기 어려워요
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💸</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">가이드 비용이 부담돼요</h3>
              <p className="text-gray-600">
                현지 가이드나 투어 프로그램 비용이 비싸서 자유여행을 하면 아쉬워요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Features */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              TripRadio.AI만의 
              <span className="font-semibold block mt-2">스마트 여행 솔루션</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🌍</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">전세계 모든 여행지</h3>
              <p className="text-gray-600 leading-relaxed">
                파리 루브르부터 제주도 해녀문화까지, 전세계 어떤 곳이든 AI가 즉시 맞춤형 가이드 생성
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🤖</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">AI 실시간 생성</h3>
              <p className="text-gray-600 leading-relaxed">
                미리 준비된 딱딱한 정보가 아닌, 당신의 관심사와 상황에 맞춰 AI가 실시간으로 생성
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎯</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">개인 맞춤 추천</h3>
              <p className="text-gray-600 leading-relaxed">
                나이, 취향, 동행인, 예산 등을 고려해 당신만을 위한 완벽한 여행 코스 추천
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💎</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">숨겨진 명소 발굴</h3>
              <p className="text-gray-600 leading-relaxed">
                관광책자에 없는 현지인만 아는 숨겨진 명소와 특별한 이야기까지 발견
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🏛️</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">현지 문화 체험</h3>
              <p className="text-gray-600 leading-relaxed">
                단순한 관광을 넘어서 그 나라의 역사, 문화, 생활을 깊이 있게 이해하는 여행
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💝</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">완전 무료</h3>
              <p className="text-gray-600 leading-relaxed">
                비싼 가이드 투어나 여행앱 구독료 없이, 언제든 무료로 전문가급 여행 가이드 이용
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section id="destinations" className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              인기 여행지에서 
              <span className="font-semibold block mt-2">특별한 경험</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🗾</div>
                <h3 className="text-lg font-medium text-gray-900">일본</h3>
                <p className="text-sm text-gray-600 mt-2">교토, 오사카, 도쿄의 숨겨진 이야기</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🇫🇷</div>
                <h3 className="text-lg font-medium text-gray-900">프랑스</h3>
                <p className="text-sm text-gray-600 mt-2">파리, 니스, 리옹의 예술과 문화</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🏝️</div>
                <h3 className="text-lg font-medium text-gray-900">제주도</h3>
                <p className="text-sm text-gray-600 mt-2">자연의 아름다움과 제주 고유문화</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🏛️</div>
                <h3 className="text-lg font-medium text-gray-900">이탈리아</h3>
                <p className="text-sm text-gray-600 mt-2">로마, 피렌체, 베네치아의 역사</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/destinations"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              더 많은 여행지 보기
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              <span className="font-semibold">3단계</span>로 쉽게 시작
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">1</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">여행지 입력</h3>
              <p className="text-gray-600">
                가고 싶은 여행지나 현재 위치를 입력하면 AI가 자동으로 인식합니다
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">2</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">취향 설정</h3>
              <p className="text-gray-600">
                관심 분야, 동행인, 예산 등 간단한 정보를 입력해 맞춤 설정을 완료합니다
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">3</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">가이드 시작</h3>
              <p className="text-gray-600">
                AI가 생성한 맞춤형 여행 가이드를 들으며 특별한 여행을 시작하세요
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
              지금 바로 스마트한 여행을 시작하세요
            </h2>
            <p className="text-lg lg:text-xl text-gray-300 mb-12 leading-relaxed">
              전세계 어디든 당신만의 AI 여행 가이드가 함께합니다
            </p>
            <Link 
              href="/?purpose=travel&ai=smart"
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