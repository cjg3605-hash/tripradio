'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function NotFound() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [suggestedUrl, setSuggestedUrl] = useState<string | null>(null)

  useEffect(() => {
    // 🔍 레거시 URL 패턴 감지 (/guide/[location] with ?lang=xx)
    const legacyGuideMatch = pathname?.match(/^\/guide\/([^\/]+)$/)
    const langParam = searchParams?.get('lang')
    
    if (legacyGuideMatch && langParam) {
      const location = legacyGuideMatch[1]
      const supportedLanguages = ['ko', 'en', 'ja', 'zh', 'es']
      const safeLanguage = supportedLanguages.includes(langParam) ? langParam : 'ko'
      
      // 새 URL 구조로 제안
      const newUrl = `/guide/${safeLanguage}/${location}`
      setSuggestedUrl(newUrl)
    }
  }, [pathname, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* 로고 */}
        <div className="space-y-4">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">TripRadio.AI</h1>
        </div>

        {/* 404 메시지 */}
        <div className="space-y-4">
          <div className="text-8xl font-bold text-gray-300">404</div>
          <h2 className="text-2xl font-semibold text-gray-700">페이지를 찾을 수 없습니다</h2>
          <p className="text-gray-600">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>

        {/* 레거시 URL 감지 시 제안 */}
        {suggestedUrl && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-yellow-800 font-medium">URL 구조가 변경되었습니다</span>
            </div>
            <p className="text-yellow-700 text-sm">
              새로운 URL로 이동하시겠습니까?
            </p>
            <Link 
              href={suggestedUrl}
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              새 URL로 이동
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            홈으로 돌아가기
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            이전 페이지
          </button>
        </div>

        {/* 인기 가이드 추천 */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">인기 가이드 추천</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/guide/ko/경복궁" className="text-blue-600 hover:text-blue-800 transition-colors">
              📍 경복궁 가이드
            </Link>
            <Link href="/guide/ko/제주도" className="text-blue-600 hover:text-blue-800 transition-colors">
              🏝️ 제주도 가이드
            </Link>
            <Link href="/guide/ko/부산" className="text-blue-600 hover:text-blue-800 transition-colors">
              🌊 부산 가이드
            </Link>
            <Link href="/guide/ko/서울" className="text-blue-600 hover:text-blue-800 transition-colors">
              🏙️ 서울 가이드
            </Link>
          </div>
        </div>

        {/* 도움말 */}
        <div className="text-sm text-gray-500 space-y-2">
          <p>문제가 지속되면 고객지원팀에 문의해 주세요.</p>
          <div className="flex items-center justify-center space-x-4">
            <span>📧 support@tripradio.ai</span>
            <span>•</span>
            <span>🌐 tripradio.ai</span>
          </div>
        </div>
      </div>
    </div>
  )
}