import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserByEmail } from '@/lib/user';

export async function POST() {
  try {
    console.log('🔄 세션 강제 갱신 시작...');
    
    // 현재 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: '로그인이 필요합니다.'
      }, { status: 401 });
    }

    console.log('👤 현재 세션 사용자:', session.user.email);

    // 데이터베이스에서 최신 사용자 정보 조회
    const latestUser = await getUserByEmail(session.user.email);
    
    if (!latestUser) {
      return NextResponse.json({
        success: false,
        error: '사용자 정보를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    console.log('🔍 데이터베이스 사용자 정보:', {
      email: latestUser.email,
      isAdmin: latestUser.isAdmin
    });

    // NextAuth는 JWT 토큰을 사용하므로 서버에서 직접 세션을 수정할 수 없음
    // 클라이언트에서 signOut 후 signIn을 해야 함
    return NextResponse.json({
      success: true,
      message: '세션 갱신이 필요합니다. 다시 로그인해주세요.',
      current_session: {
        email: session.user.email,
        name: session.user.name,
        isAdmin: (session.user as any).isAdmin || false
      },
      database_user: {
        email: latestUser.email,
        name: latestUser.name,
        isAdmin: latestUser.isAdmin
      },
      needs_relogin: (session.user as any).isAdmin !== latestUser.isAdmin,
      instructions: [
        '1. 완전 로그아웃을 해주세요',
        '2. 브라우저 쿠키를 정리해주세요 (선택사항)',
        '3. 다시 로그인해주세요',
        '4. 마이페이지에서 관리자 버튼을 확인하세요'
      ]
    });

  } catch (error) {
    console.error('❌ 세션 갱신 중 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}