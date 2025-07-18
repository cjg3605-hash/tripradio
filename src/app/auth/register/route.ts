// ===================================================
// 🔐 기존 파일 교체: src/app/api/auth/register/route.ts
// ===================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, verificationCode } = await request.json();

    console.log('회원가입 요청 수신:', { email, name, hasPassword: !!password, hasVerificationCode: !!verificationCode });

    // 입력값 검증
    if (!email || !name || !password || !verificationCode) {
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

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 이름 길이 검증
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: '이름은 최소 2자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 🔐 이메일 인증 확인
    const { data: verification, error: verificationError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .eq('verification_code', verificationCode)
      .eq('verified', true)
      .single();

    if (verificationError || !verification) {
      console.error('이메일 인증 확인 실패:', verificationError);
      return NextResponse.json(
        { error: '이메일 인증이 완료되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 인증 코드 만료 시간 확인 (추가 보안)
    const now = new Date();
    const verifiedAt = new Date(verification.verified_at || verification.created_at);
    const timeDiff = now.getTime() - verifiedAt.getTime();
    const maxAge = 30 * 60 * 1000; // 30분

    if (timeDiff > maxAge) {
      return NextResponse.json(
        { error: '인증이 만료되었습니다. 다시 인증해주세요.' },
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
      password: hashedPassword, // 기존 테이블의 password 컬럼 사용
      email_verified: true, // 인증 완료
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('사용자 데이터 생성 시도:', { ...userData, password: '[HIDDEN]' });

    // 🗄️ Supabase users 테이블에 저장
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

    // 🧹 사용된 인증 코드 삭제 (보안)
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