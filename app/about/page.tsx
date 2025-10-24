'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { CheckCircle, Users, Globe, Zap, Shield, Target } from 'lucide-react';

export default function AboutPage() {
  const { t, currentLanguage } = useLanguage();
  const isKorean = currentLanguage === 'ko';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-950 text-white py-16 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {isKorean ? 'TripRadio.AI 소개' : 'About TripRadio.AI'}
          </h1>
          <p className="text-lg text-blue-100">
            {isKorean
              ? 'AI 기반 여행 오디오 가이드 플랫폼'
              : 'AI-Powered Travel Audio Guide Platform'}
          </p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* 미션 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {isKorean ? '우리의 미션' : 'Our Mission'}
          </h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-6 rounded">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {isKorean
                ? '여행이 더욱 깊고 의미 있는 경험이 되도록, AI 기술을 활용하여 개인맞춤형 여행 오디오 가이드를 제공합니다. 언어와 지역의 제약 없이 누구나 전문가 수준의 여행 정보에 접근할 수 있는 세상을 만드는 것이 우리의 목표입니다.'
                : 'We aim to make travel more meaningful and enriching by providing personalized audio guides powered by AI technology. Our goal is to create a world where everyone, regardless of language or location, can access expert-level travel information.'}
            </p>
          </div>
        </section>

        {/* 특징 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {isKorean ? '주요 특징' : 'Key Features'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Zap,
                title: isKorean ? 'AI 기술' : 'AI-Powered',
                desc: isKorean
                  ? 'Google Gemini AI를 활용한 지능형 콘텐츠 생성'
                  : 'Intelligent content generation using Google Gemini AI'
              },
              {
                icon: Globe,
                title: isKorean ? '다국어 지원' : 'Multilingual',
                desc: isKorean
                  ? '5개 언어(한글, 영문, 일본어, 중국어, 스페인어) 지원'
                  : 'Support for 5 languages (Korean, English, Japanese, Chinese, Spanish)'
              },
              {
                icon: Shield,
                title: isKorean ? '데이터 보안' : 'Data Security',
                desc: isKorean
                  ? 'HTTPS 암호화 및 엄격한 개인정보보호 정책'
                  : 'HTTPS encryption and strict privacy protection'
              },
              {
                icon: Target,
                title: isKorean ? '개인맞춤형' : 'Personalized',
                desc: isKorean
                  ? '사용자 선호도에 따른 맞춤형 여행 정보 제공'
                  : 'Customized travel information based on user preferences'
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 기술 스택 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {isKorean ? '기술 스택' : 'Technology Stack'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'Next.js', category: 'Frontend' },
              { name: 'TypeScript', category: 'Language' },
              { name: 'React', category: 'UI Framework' },
              { name: 'Supabase', category: 'Database' },
              { name: 'Google Gemini AI', category: 'AI/ML' },
              { name: 'NotebookLM', category: 'TTS' },
              { name: 'Vercel', category: 'Hosting' },
              { name: 'PostgreSQL', category: 'Database' }
            ].map((tech, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700"
              >
                <p className="font-semibold text-gray-900 dark:text-white">{tech.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{tech.category}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 품질 보증 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {isKorean ? '품질 보증' : 'Quality Assurance'}
          </h2>
          <div className="space-y-4">
            {[
              {
                title: isKorean ? 'AI 콘텐츠 투명성' : 'AI Content Transparency',
                desc: isKorean
                  ? '모든 콘텐츠는 AI로 생성되었음을 명시하고, 사용자가 정보를 검증할 수 있도록 안내합니다.'
                  : 'All content is clearly marked as AI-generated, and users are guided to verify information.'
              },
              {
                title: isKorean ? '사실 검증' : 'Fact Verification',
                desc: isKorean
                  ? 'Google Gemini AI는 여러 출처의 정보를 기반으로 검증된 콘텐츠를 생성합니다.'
                  : 'Content is generated based on information from multiple verified sources.'
              },
              {
                title: isKorean ? '정기적 업데이트' : 'Regular Updates',
                desc: isKorean
                  ? '여행 정보는 정기적으로 업데이트되어 최신 상황을 반영합니다.'
                  : 'Travel information is regularly updated to reflect current conditions.'
              },
              {
                title: isKorean ? '사용자 피드백' : 'User Feedback',
                desc: isKorean
                  ? '사용자의 피드백을 통해 지속적으로 서비스를 개선합니다.'
                  : 'We continuously improve our service based on user feedback.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 팀 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {isKorean ? '팀' : 'Team'}
          </h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {isKorean ? 'TripRadio.AI 팀' : 'TripRadio.AI Team'}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isKorean
                ? 'TripRadio.AI는 AI 기술, 여행 산업, 소프트웨어 개발 분야의 전문가들로 구성된 팀입니다. 우리는 사용자에게 최고의 여행 경험을 제공하기 위해 지속적으로 노력합니다.'
                : 'TripRadio.AI is a team of experts in AI technology, travel industry, and software development. We are committed to providing users with the best travel experience.'}
            </p>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>📧 {isKorean ? '문의:' : 'Contact:'} support@tripradio.shop</p>
              <p>🌐 {isKorean ? '웹사이트:' : 'Website:'} tripradio.shop</p>
              <p>📍 {isKorean ? '위치:' : 'Location:'} {isKorean ? '대한민국' : 'South Korea'}</p>
            </div>
          </div>
        </section>

        {/* 개인정보보호 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {isKorean ? '개인정보 보호' : 'Privacy & Legal'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {isKorean
              ? '사용자의 개인정보 보호는 우리의 최우선 과제입니다. 자세한 내용은 다음을 참조하세요:'
              : 'Protecting your personal information is our top priority. Please refer to the following:'}
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/privacy"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {isKorean ? '개인정보 처리방침' : 'Privacy Policy'}
            </Link>
            <Link
              href="/terms"
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              {isKorean ? '이용약관' : 'Terms of Service'}
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {isKorean ? '지금 시작하세요' : 'Get Started Today'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            {isKorean
              ? 'TripRadio.AI와 함께 더욱 특별한 여행 경험을 시작하세요.'
              : 'Start your journey with TripRadio.AI and experience travel like never before.'}
          </p>
          <Link
            href="/guide"
            className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            {isKorean ? '여행 가이드 둘러보기' : 'Explore Travel Guides'}
          </Link>
        </section>
      </div>
    </div>
  );
}
