import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '마이페이지 | NaviDocent AI 여행 가이드',
  description: 'NaviDocent에서 생성한 나만의 여행 가이드를 확인하고 관리하세요. 개인 여행 히스토리와 맞춤형 추천을 받아보세요.',
  keywords: ['마이페이지', '여행 히스토리', '개인 가이드', 'NaviDocent', '여행 기록'],
  openGraph: {
    title: '마이페이지 | NaviDocent AI 여행 가이드',
    description: 'NaviDocent에서 생성한 나만의 여행 가이드를 확인하고 관리하세요.',
    type: 'website',
    url: '/mypage',
  },
  twitter: {
    card: 'summary',
    title: '마이페이지 | NaviDocent AI 여행 가이드',
    description: 'NaviDocent에서 생성한 나만의 여행 가이드를 확인하고 관리하세요.',
  },
  robots: {
    index: false, // 개인정보 페이지는 색인하지 않음
    follow: true,
  },
};

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}