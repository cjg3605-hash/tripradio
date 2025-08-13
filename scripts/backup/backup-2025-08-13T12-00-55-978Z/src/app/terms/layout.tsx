import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이용약관 | TripRadio.AI AI 여행 가이드',
  description: 'TripRadio.AI 서비스 이용약관을 확인하세요. 서비스 사용 규정과 사용자 권리에 대한 상세한 내용을 제공합니다.',
  keywords: ['이용약관', '서비스 약관', '사용자 규정', 'TripRadio.AI', '서비스 이용'],
  openGraph: {
    title: '이용약관 | TripRadio.AI AI 여행 가이드',
    description: 'TripRadio.AI 서비스 이용약관과 사용자 권리를 확인하세요.',
    type: 'website',
    url: '/terms',
  },
  twitter: {
    card: 'summary',
    title: '이용약관 | TripRadio.AI',
    description: 'TripRadio.AI 서비스 이용약관과 사용자 권리를 확인하세요.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}