import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log('===== 회원가입 API 시작 =====');
  
  try {
    const body = await req.json();
    const { email, password, name } = body;

    console.log('회원가입 요청:', { 
      email: email ? email.substring(0, 3) + '***@***' : undefined, 
      name: name ? name.substring(0, 2) + '***' : undefined,
      hasPassword: !!password 
    });

    // 입력값 검증
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 비밀번호 강도 검증
    if (password.length < 8) {
      return NextResponse.json(
        { error: '비밀번호는 8자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 이름 길이 검증
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: '이름은 2자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 이메일 인증 완료 확인
    const { data: verification, error: verificationError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .eq('verified', true)
      .single();

    if (verificationError || !verification) {
      console.log('이메일 인증이 완료되지 않음:', verificationError?.message);
      return NextResponse.json(
        { error: '이메일 인증을 먼저 완료해주세요. 다시 인증해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 중복 체크 (최종 확인)
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 409 }
      );
    }

    // 패스워드 해싱
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // 사용자 ID 생성
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const userData = {
      id,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      password: hashedPassword,
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('사용자 데이터 생성 시도:', { ...userData, password: '[HIDDEN]' });

    // Supabase users 테이블에 저장
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([userData])
      .select('id, email, name, email_verified, created_at')
      .single();

    if (insertError) {
      console.error('사용자 생성 실패:', insertError);
      
      // 중복 이메일 에러 처리
      if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
        return NextResponse.json(
          { error: '이미 사용 중인 이메일입니다.' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: '회원가입 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 사용된 인증 코드 삭제 (보안)
    await supabase
      .from('email_verifications')
      .delete()
      .eq('email', email);

    console.log('✅ 새 사용자 생성 완료:', { email: newUser.email, name: newUser.name });

    return NextResponse.json(
      { 
        success: true,
        message: '회원가입이 완료되었습니다.',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          emailVerified: newUser.email_verified
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('회원가입 오류:', error);
    
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}