'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

interface InternalLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
  prefetch?: boolean;
}

/**
 * SEO 최적화된 내부 링크 컴포넌트
 * - 자동 prefetch
 * - 적절한 anchor text
 * - 다국어 지원
 * - 접근성 향상
 */
export function InternalLink({ 
  href, 
  children, 
  className = '', 
  title,
  prefetch = true 
}: InternalLinkProps) {
  const { currentLanguage } = useLanguage();
  
  // 새 URL 구조에서는 언어 파라미터 불필요 (이미 path에 포함)
  const localizedHref = href;

  return (
    <Link 
      href={localizedHref}
      className={`hover:underline focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50 ${className}`}
      title={title}
      prefetch={prefetch}
    >
      {children}
    </Link>
  );
}

/**
 * 인기 목적지 링크 컴포넌트
 */
export function PopularDestinationLinks() {
  const { t } = useLanguage();
  
  const popularDestinations = [
    { name: '경복궁', href: '/guide/경복궁' },
    { name: '제주도', href: '/guide/제주도' },
    { name: '부산', href: '/guide/부산' },
    { name: '서울타워', href: '/guide/서울타워' },
    { name: '인사동', href: '/guide/인사동' }
  ];

  return (
    <nav aria-label="인기 여행지">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        {t('home.popularDestinations') || '인기 여행지'}
      </h3>
      <ul className="space-y-2">
        {popularDestinations.map((destination) => (
          <li key={destination.name}>
            <InternalLink 
              href={destination.href}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title={`${destination.name} AI 가이드 보기`}
            >
              {destination.name}
            </InternalLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * 브레드크럼 네비게이션
 */
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="py-4">
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-400">/</span>
            )}
            {item.href ? (
              <InternalLink 
                href={item.href}
                className="hover:text-gray-900 transition-colors"
              >
                {item.label}
              </InternalLink>
            ) : (
              <span className="text-gray-900 font-medium">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}