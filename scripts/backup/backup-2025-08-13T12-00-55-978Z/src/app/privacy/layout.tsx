import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보 처리방침 | TripRadio.AI AI 여행 가이드',
  description: 'TripRadio.AI의 개인정보 처리방침을 확인하세요. 사용자의 개인정보 보호와 데이터 처리 방식에 대한 상세한 안내를 제공합니다.',
  keywords: ['개인정보 처리방침', '프라이버시', '데이터 보호', 'TripRadio.AI', '개인정보보호'],
  openGraph: {
    title: '개인정보 처리방침 | TripRadio.AI AI 여행 가이드',
    description: 'TripRadio.AI의 개인정보 처리방침과 데이터 보호 정책을 확인하세요.',
    type: 'website',
    url: '/privacy',
  },
  twitter: {
    card: 'summary',
    title: '개인정보 처리방침 | TripRadio.AI',
    description: 'TripRadio.AI의 개인정보 처리방침과 데이터 보호 정책을 확인하세요.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}