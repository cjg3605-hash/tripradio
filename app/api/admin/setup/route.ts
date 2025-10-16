import { NextRequest, NextResponse } from 'next/server';
import { createOrUpdateAdmin } from '@/lib/user';

export async function POST() {
  try {
    console.log('🔧 관리자 계정 설정 시작...');
    
    const adminUser = await createOrUpdateAdmin();
    
    console.log('✅ 관리자 계정 설정 완료');
    
    return NextResponse.json({
      success: true,
      message: '관리자 계정이 성공적으로 설정되었습니다.',
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        isAdmin: adminUser.isAdmin
      }
    });

  } catch (error) {
    console.error('❌ 관리자 계정 설정 실패:', error);
    
    return NextResponse.json({
      success: false,
      message: '관리자 계정 설정 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

// GET 요청으로 관리자 계정 존재 여부 확인
export async function GET() {
  try {
    const { getUserByEmail } = await import('@/lib/user');
    const adminUser = await getUserByEmail('naviadmin@navidocent.com');
    
    return NextResponse.json({
      exists: !!adminUser,
      isAdmin: adminUser?.isAdmin || false,
      message: adminUser ? 
        (adminUser.isAdmin ? '관리자 계정이 존재하고 권한이 활성화되어 있습니다.' : '계정은 존재하지만 관리자 권한이 없습니다.') :
        '관리자 계정이 존재하지 않습니다.'
    });

  } catch (error) {
    console.error('❌ 관리자 계정 확인 실패:', error);
    
    return NextResponse.json({
      success: false,
      message: '관리자 계정 확인 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}