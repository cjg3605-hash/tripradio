import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { getUserByEmail } from './user';

/**
 * 서버 사이드에서 관리자 권한을 확인하는 함수
 */
export async function requireAdminAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized: No session found');
  }

  // 데이터베이스에서 최신 사용자 정보 확인
  const user = await getUserByEmail(session.user.email);
  
  if (!user || !user.isAdmin) {
    throw new Error('Forbidden: Admin access required');
  }

  return { user, session };
}

/**
 * 클라이언트 사이드에서 관리자 권한을 확인하는 함수
 */
export function isAdminUser(session: any): boolean {
  return !!(session?.user?.isAdmin);
}

/**
 * 관리자 전용 API 라우트 핸들러 래퍼
 */
export function withAdminAuth<T extends any[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      await requireAdminAuth();
      return await handler(...args);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Access denied';
      
      if (message.includes('Unauthorized')) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      if (message.includes('Forbidden')) {
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}