'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { useEffect, useState } from 'react';

interface SessionProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

export default function SessionProvider({ children, session }: SessionProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // SSR/SSG 중에는 항상 SessionProvider로 감싸서 렌더링
  // 로그아웃 후 세션 재갱신 방지를 위해 자동 갱신 비활성화
  return (
    <NextAuthSessionProvider 
      session={session}
      refetchInterval={0} // 자동 갱신 완전 비활성화
      refetchOnWindowFocus={false} // 윈도우 포커스시 갱신 비활성화
      refetchWhenOffline={false}
    >
      {children}
    </NextAuthSessionProvider>
  );
}