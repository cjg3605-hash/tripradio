/**
 * Legal Pages Dynamic Route
 * SEO 최적화된 법적 페이지 렌더링
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface LegalPageProps {
  params: { type: string };
  searchParams: { lang?: string };
}

// SEO 메타데이터 생성
export async function generateMetadata({ params, searchParams }: LegalPageProps): Promise<Metadata> {
  const { type } = params;
  const lang = searchParams.lang || 'ko';
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/legal/${type}?lang=${lang}`, {
      cache: 'force-cache',
      next: { revalidate: 86400 } // 24시간 캐시
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch legal page data');
    }
    
    const { data } = await response.json();
    const { page, seo } = data;
    
    return {
      title: `${page.title} | 네비가이드AI`,
      description: seo.description,
      keywords: seo.keywords.join(', '),
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}${seo.canonicalUrl}`,
      robots: 'index, follow',
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL}${seo.canonicalUrl}`,
        languages: {
          'ko': `/legal/${type}?lang=ko`,
          'en': `/legal/${type}?lang=en`
        }
      },
      openGraph: {
        title: page.title,
        description: seo.description,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}${seo.canonicalUrl}`,
        siteName: '네비가이드AI',
        locale: lang === 'ko' ? 'ko_KR' : 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: page.title,
        description: seo.description,
      }
    };
  } catch (error) {
    console.error('Failed to generate metadata for legal page:', error);
    return {
      title: 'Legal Page | 네비가이드AI',
      description: 'Legal information for NaviGuide AI services',
    };
  }
}

// 유효한 법적 페이지 타입들
const validPageTypes = ['privacy', 'terms', 'about', 'contact'];

export default async function LegalPage({ params, searchParams }: LegalPageProps) {
  const { type } = params;
  const lang = searchParams.lang || 'ko';
  
  // 유효하지 않은 페이지 타입 체크
  if (!validPageTypes.includes(type)) {
    notFound();
  }
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/legal/${type}?lang=${lang}`, {
      cache: 'force-cache',
      next: { revalidate: 86400 } // 24시간 캐시
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch legal page data');
    }
    
    const { data } = await response.json();
    const { page, compliance } = data;
    
    // Markdown을 HTML로 변환하는 간단한 함수
    const markdownToHtml = (markdown: string) => {
      return markdown
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-6 text-gray-900">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-4 mt-8 text-gray-800">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mb-3 mt-6 text-gray-700">$1</h3>')
        .replace(/^\*\*(.*)\*\*/gim, '<strong class="font-semibold text-gray-900">$1</strong>')
        .replace(/^- (.*$)/gim, '<li class="mb-1 text-gray-700">$1</li>')
        .replace(/^\n/gim, '<br>')
        .replace(/\n\n/g, '</p><p class="mb-4 text-gray-600 leading-relaxed">')
        .replace(/^(?!<[hl]|<li|<br)(.+)$/gim, '<p class="mb-4 text-gray-600 leading-relaxed">$1</p>');
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{page.title}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  최종 업데이트: {new Date(page.lastUpdated).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US')}
                </p>
              </div>
              
              {/* Language Toggle */}
              <div className="flex space-x-2">
                <a
                  href={`/legal/${type}?lang=ko`}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    lang === 'ko' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  한국어
                </a>
                <a
                  href={`/legal/${type}?lang=en`}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    lang === 'en' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  English
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* AdSense Compliance Badge */}
            {compliance.complianceScore >= 80 && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">
                      AdSense 정책 준수율: {compliance.complianceScore}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Page Content */}
            <article 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: markdownToHtml(page.content) 
              }}
            />

            {/* Footer Navigation */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {validPageTypes.map((pageType) => (
                  <a
                    key={pageType}
                    href={`/legal/${pageType}?lang=${lang}`}
                    className={`text-center p-3 rounded-lg border transition-colors ${
                      pageType === type
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageType === 'privacy' && (lang === 'ko' ? '개인정보처리방침' : 'Privacy Policy')}
                    {pageType === 'terms' && (lang === 'ko' ? '이용약관' : 'Terms of Service')}
                    {pageType === 'about' && (lang === 'ko' ? '회사 소개' : 'About Us')}
                    {pageType === 'contact' && (lang === 'ko' ? '연락처' : 'Contact')}
                  </a>
                ))}
              </div>
            </div>

            {/* Back to Home */}
            <div className="mt-6 text-center">
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {lang === 'ko' ? '홈으로 돌아가기' : 'Back to Home'}
              </a>
            </div>
          </div>
        </main>

        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": page.title,
              "description": page.seoMetadata?.description,
              "url": `${process.env.NEXT_PUBLIC_BASE_URL}/legal/${type}`,
              "dateModified": page.lastUpdated,
              "inLanguage": lang === 'ko' ? 'ko-KR' : 'en-US',
              "isPartOf": {
                "@type": "WebSite",
                "name": "네비가이드AI",
                "url": process.env.NEXT_PUBLIC_BASE_URL
              },
              "publisher": {
                "@type": "Organization",
                "name": "네비가이드AI",
                "url": process.env.NEXT_PUBLIC_BASE_URL
              }
            })
          }}
        />
      </div>
    );

  } catch (error) {
    console.error('Failed to render legal page:', error);
    notFound();
  }
}

// 정적 params 생성 (빌드 시 사전 생성)
export function generateStaticParams() {
  return validPageTypes.map((type) => ({
    type: type,
  }));
}