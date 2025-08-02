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

  // 로그아웃 후 세션 상태 정확성을 위해 주기적 검증 활성화
  return (
    <NextAuthSessionProvider 
      session={session}
      refetchInterval={5 * 60} // 5분마다 세션 검증 (로그아웃 감지)
      refetchOnWindowFocus={true} // 윈도우 포커스시 세션 재검증
      refetchWhenOffline={false}
    >
      {children}
    </NextAuthSessionProvider>
  );
}