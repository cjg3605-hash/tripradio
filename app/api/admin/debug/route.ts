import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    console.log('🔍 관리자 디버그 모드 시작...');
    
    // 1. Supabase 연결 테스트
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count(*)', { count: 'exact', head: true });

    if (connectionError) {
      console.error('❌ Supabase 연결 실패:', connectionError);
      return NextResponse.json({
        success: false,
        step: 'connection_test',
        error: connectionError.message,
        details: connectionError
      }, { status: 500 });
    }

    console.log('✅ Supabase 연결 성공, 사용자 수:', connectionTest);

    // 2. users 테이블 구조 확인
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_columns', { table_name: 'users' })
      .single();

    // 위 RPC가 없을 수 있으므로 실제 데이터로 구조 확인
    const { data: sampleUser, error: sampleError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .maybeSingle();

    console.log('📊 테이블 샘플 데이터:', sampleUser);
    console.log('📊 샘플 데이터 에러:', sampleError);

    // 3. is_admin 컬럼 존재 확인
    let hasAdminColumn = false;
    if (sampleUser) {
      hasAdminColumn = 'is_admin' in sampleUser;
    }

    console.log('🔧 is_admin 컬럼 존재:', hasAdminColumn);

    // 4. 관리자 계정 존재 확인
    const { data: adminCheck, error: adminError } = await supabase
      .from('users')
      .select('id, email, name, is_admin')
      .eq('email', 'naviadmin@navidocent.com')
      .maybeSingle();

    console.log('👤 관리자 계정 확인:', adminCheck);
    console.log('👤 관리자 계정 에러:', adminError);

    return NextResponse.json({
      success: true,
      debug_info: {
        connection: '✅ 성공',
        total_users: connectionTest,
        has_admin_column: hasAdminColumn,
        sample_user_columns: sampleUser ? Object.keys(sampleUser) : [],
        admin_account: adminCheck,
        admin_account_error: adminError?.message || null,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 디버그 중 오류:', error);
    return NextResponse.json({
      success: false,
      step: 'debug_general',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('🔧 관리자 계정 강제 생성 시작...');

    // 1. 먼저 is_admin 컬럼이 있는지 확인
    const { data: sampleUser } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .maybeSingle();

    const hasAdminColumn = sampleUser && 'is_admin' in sampleUser;

    if (!hasAdminColumn) {
      return NextResponse.json({
        success: false,
        error: 'is_admin 컬럼이 존재하지 않습니다. Supabase에서 다음 SQL을 실행하세요: ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;'
      }, { status: 400 });
    }

    // 2. 관리자 계정 강제 생성
    const bcrypt = require('bcryptjs');
    const { randomUUID } = require('crypto');

    const adminEmail = 'naviadmin@navidocent.com';
    const adminName = 'NaviAdmin';
    const adminPassword = 'naviadmin1134';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const id = `user_${randomUUID()}`;

    // 3. 기존 계정 삭제 (있다면)
    await supabase
      .from('users')
      .delete()
      .eq('email', adminEmail);

    // 4. 새 관리자 계정 생성
    const { data: newAdmin, error: createError } = await supabase
      .from('users')
      .insert([{
        id,
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        is_admin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      console.error('❌ 관리자 계정 생성 실패:', createError);
      return NextResponse.json({
        success: false,
        error: createError.message,
        details: createError
      }, { status: 500 });
    }

    console.log('✅ 관리자 계정 강제 생성 완료:', newAdmin);

    return NextResponse.json({
      success: true,
      message: '관리자 계정이 강제로 생성되었습니다.',
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        isAdmin: newAdmin.is_admin
      }
    });

  } catch (error) {
    console.error('❌ 강제 생성 중 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}