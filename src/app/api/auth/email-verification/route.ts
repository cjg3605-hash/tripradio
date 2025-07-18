// src/app/api/auth/email-verification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    console.log('===== 이메일 인증 API 호출 시작 =====');
    
    const body = await request.json();
    const { email, action, verificationCode } = body;
    
    console.log('요청 데이터:', { email, action, hasVerificationCode: !!verificationCode });
    
    // 환경변수 확인
    console.log('환경변수 확인:', {
      GMAIL_USER: !!process.env.GMAIL_USER,
      GMAIL_APP_PASSWORD: !!process.env.GMAIL_APP_PASSWORD,
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });
    
    if (!email) {
      console.log('이메일 누락');
      return NextResponse.json(
        { error: '이메일을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('잘못된 이메일 형식:', email);
      return NextResponse.json(
        { error: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 인증 코드 전송
    if (action === 'send_code') {
      console.log('인증 코드 전송 시작');
      
      // Supabase 연결 테스트
      try {
        console.log('Supabase 연결 테스트 중...');
        const { data: testData, error: testError } = await supabase
          .from('users')
          .select('count')
          .limit(1);
        
        if (testError) {
          console.error('Supabase 연결 실패:', testError);
          return NextResponse.json(
            { error: `데이터베이스 연결 실패: ${testError.message}` },
            { status: 500 }
          );
        }
        console.log('Supabase 연결 성공');
      } catch (connectionError) {
        console.error('Supabase 연결 오류:', connectionError);
        return NextResponse.json(
          { error: '데이터베이스 연결 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }

      // 기존 사용자 확인
      try {
        console.log('기존 사용자 확인 중...');
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('email', email)
          .single();

        if (userError && userError.code !== 'PGRST116') {
          console.error('사용자 조회 오류:', userError);
          return NextResponse.json(
            { error: `사용자 조회 중 오류: ${userError.message}` },
            { status: 500 }
          );
        }

        if (existingUser) {
          console.log('이미 존재하는 사용자:', email);
          return NextResponse.json(
            { error: '이미 사용 중인 이메일입니다.' },
            { status: 409 }
          );
        }
        console.log('사용자 확인 완료 - 신규 사용자');
      } catch (userCheckError) {
        console.error('사용자 확인 중 오류:', userCheckError);
        return NextResponse.json(
          { error: '사용자 확인 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }

      // 인증 코드 생성
      const newVerificationCode = crypto.randomInt(100000, 999999).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      
      console.log('인증 코드 생성:', { code: newVerificationCode, expiresAt });

      // email_verifications 테이블 확인 및 데이터 삽입
      try {
        console.log('기존 인증 코드 삭제 중...');
        const { error: deleteError } = await supabase
          .from('email_verifications')
          .delete()
          .eq('email', email);

        if (deleteError) {
          console.error('기존 인증 코드 삭제 오류:', deleteError);
          // 테이블이 존재하지 않는 경우일 수 있으므로 계속 진행
        }

        console.log('새 인증 코드 삽입 중...');
        const { error: insertError } = await supabase
          .from('email_verifications')
          .insert([{
            email,
            verification_code: newVerificationCode,
            expires_at: expiresAt.toISOString(),
            verified: false,
            created_at: new Date().toISOString()
          }]);

        if (insertError) {
          console.error('인증 코드 저장 실패:', insertError);
          return NextResponse.json(
            { error: `인증 코드 저장 실패: ${insertError.message}` },
            { status: 500 }
          );
        }
        console.log('인증 코드 저장 성공');
      } catch (dbError) {
        console.error('데이터베이스 작업 중 오류:', dbError);
        return NextResponse.json(
          { error: '데이터베이스 작업 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }

      // 이메일 전송
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error('Gmail 환경변수 누락');
        return NextResponse.json(
          { error: 'Gmail 설정이 누락되었습니다.' },
          { status: 500 }
        );
      }

      try {
        console.log('이메일 전송 시작...');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });

        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: email,
          subject: '[AI 가이드] 회원가입 인증 코드',
          html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #333; margin-bottom: 10px;">🤖 AI 가이드</h1>
                <p style="color: #666; font-size: 16px;">회원가입 인증 코드</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h2 style="color: #333; margin-bottom: 15px;">인증 코드</h2>
                <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px; margin: 20px 0;">
                  ${newVerificationCode}
                </div>
                <p style="color: #666; margin-top: 15px;">위 코드를 회원가입 페이지에 입력해주세요.</p>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  ⚠️ 이 코드는 <strong>10분 후</strong> 만료됩니다.
                </p>
              </div>
              
              <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
                <p>이 이메일을 요청하지 않으셨다면 무시하셔도 됩니다.</p>
                <p style="margin-top: 10px;">© 2025 AI 가이드. All rights reserved.</p>
              </div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log('이메일 전송 성공');
        
        return NextResponse.json(
          { 
            success: true,
            message: '인증 코드가 이메일로 전송되었습니다.',
            expiresIn: 600
          },
          { status: 200 }
        );
      } catch (emailError) {
        console.error('이메일 전송 실패:', emailError);
        const errorMessage = emailError instanceof Error ? emailError.message : '알 수 없는 오류';
        return NextResponse.json(
          { error: `이메일 전송 실패: ${errorMessage}` },
          { status: 500 }
        );
      }
    }

    // 인증 코드 확인
    if (action === 'verify_code') {
      console.log('인증 코드 확인 시작');
      
      if (!verificationCode) {
        console.log('인증 코드 누락');
        return NextResponse.json(
          { error: '인증 코드를 입력해주세요.' },
          { status: 400 }
        );
      }

      try {
        console.log('인증 코드 조회 중...');
        const { data: verification, error } = await supabase
          .from('email_verifications')
          .select('*')
          .eq('email', email)
          .eq('verification_code', verificationCode)
          .eq('verified', false)
          .single();

        if (error) {
          console.error('인증 코드 조회 오류:', error);
          return NextResponse.json(
            { error: '잘못된 인증 코드입니다.' },
            { status: 400 }
          );
        }

        if (!verification) {
          console.log('인증 코드를 찾을 수 없음');
          return NextResponse.json(
            { error: '잘못된 인증 코드입니다.' },
            { status: 400 }
          );
        }

        // 만료 시간 확인
        const now = new Date();
        const expiresAt = new Date(verification.expires_at);
        
        if (now > expiresAt) {
          console.log('인증 코드 만료');
          return NextResponse.json(
            { error: '인증 코드가 만료되었습니다. 새 코드를 요청해주세요.' },
            { status: 400 }
          );
        }

        // 인증 완료 처리
        console.log('인증 완료 처리 중...');
        const { error: updateError } = await supabase
          .from('email_verifications')
          .update({ 
            verified: true,
            verified_at: new Date().toISOString()
          })
          .eq('id', verification.id);

        if (updateError) {
          console.error('인증 상태 업데이트 실패:', updateError);
          return NextResponse.json(
            { error: '인증 처리 중 오류가 발생했습니다.' },
            { status: 500 }
          );
        }

        console.log('인증 완료');
        return NextResponse.json(
          { 
            success: true,
            message: '이메일 인증이 완료되었습니다.',
            verified: true
          },
          { status: 200 }
        );
      } catch (verifyError) {
        console.error('인증 코드 확인 중 오류:', verifyError);
        return NextResponse.json(
          { error: '인증 코드 확인 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }
    }

    console.log('잘못된 액션:', action);
    return NextResponse.json(
      { error: '잘못된 요청입니다.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('===== 이메일 인증 API 전체 오류 =====');
    console.error('오류 상세:', error);
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    const stackTrace = error instanceof Error ? error.stack : undefined;
    
    if (stackTrace) {
      console.error('스택 트레이스:', stackTrace);
    }
    
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}