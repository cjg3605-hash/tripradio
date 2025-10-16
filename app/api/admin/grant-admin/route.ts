import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST() {
  try {
    console.log('🔧 기존 계정에 관리자 권한 부여 시작...');

    const adminEmail = 'naviadmin@tripradio.shop';

    // 1. 기존 계정 확인
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (findError || !existingUser) {
      console.error('❌ 관리자 계정을 찾을 수 없습니다:', findError);
      return NextResponse.json({
        success: false,
        error: '관리자 계정을 찾을 수 없습니다.',
        details: findError
      }, { status: 404 });
    }

    console.log('👤 기존 계정 발견:', {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      isAdmin: existingUser.is_admin
    });

    // 2. 관리자 권한 부여
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        is_admin: true,
        updated_at: new Date().toISOString()
      })
      .eq('email', adminEmail)
      .select()
      .single();

    if (updateError) {
      console.error('❌ 관리자 권한 부여 실패:', updateError);
      return NextResponse.json({
        success: false,
        error: '관리자 권한 부여에 실패했습니다.',
        details: updateError
      }, { status: 500 });
    }

    console.log('✅ 관리자 권한 부여 완료:', updatedUser);

    // 3. 업데이트 확인
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select('id, email, name, is_admin')
      .eq('email', adminEmail)
      .single();

    return NextResponse.json({
      success: true,
      message: '관리자 권한이 성공적으로 부여되었습니다.',
      before: {
        email: existingUser.email,
        name: existingUser.name,
        isAdmin: existingUser.is_admin
      },
      after: {
        email: verifyUser?.email,
        name: verifyUser?.name,
        isAdmin: verifyUser?.is_admin
      },
      login_info: {
        email: 'naviadmin@tripradio.shop',
        password: 'naviadmin1134'
      }
    });

  } catch (error) {
    console.error('❌ 관리자 권한 부여 중 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // 현재 관리자 계정 상태 확인
    const { data: adminUser, error } = await supabase
      .from('users')
      .select('id, email, name, is_admin, created_at, updated_at')
      .eq('email', 'naviadmin@tripradio.shop')
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        error: '관리자 계정을 찾을 수 없습니다.',
        details: error
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      admin_status: {
        email: adminUser.email,
        name: adminUser.name,
        isAdmin: adminUser.is_admin,
        created: adminUser.created_at,
        updated: adminUser.updated_at,
        status: adminUser.is_admin ? '✅ 관리자 권한 활성화' : '❌ 관리자 권한 비활성화'
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}