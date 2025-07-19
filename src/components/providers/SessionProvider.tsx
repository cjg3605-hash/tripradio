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
  // 이렇게 하면 prerendering 시에도 useSession이 안전하게 작동
  return (
    <NextAuthSessionProvider 
      session={session}
      refetchInterval={isClient ? 5 * 60 : 0} // 클라이언트에서만 자동 갱신
      refetchOnWindowFocus={isClient}
      refetchWhenOffline={false}
    >
      {children}
    </NextAuthSessionProvider>
  );
}