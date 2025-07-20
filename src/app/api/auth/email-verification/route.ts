import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Gmail 설정
const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log('===== 이메일 인증 API 시작 =====');
  
  try {
    const body = await req.json();
    const { action, email, verificationCode } = body;

    console.log('요청 데이터:', { action, email: email ? '***@***.***' : undefined, verificationCode: verificationCode ? '******' : undefined });

    // === 인증 코드 발송 ===
    if (action === 'send_code') {
      // 이메일 유효성 검사
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        console.log('유효하지 않은 이메일:', email);
        return NextResponse.json(
          { error: '유효한 이메일 주소를 입력해주세요.' },
          { status: 400 }
        );
      }

      // Gmail 환경변수 확인
      if (!gmailUser || !gmailAppPassword) {
        console.error('Gmail 환경변수 누락:', { 
          gmailUser: !!gmailUser, 
          gmailAppPassword: !!gmailAppPassword 
        });
        return NextResponse.json(
          { error: 'Gmail 설정이 누락되었습니다. 관리자에게 문의해주세요.' },
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
        console.log('Gmail 전송 준비 중...');
        
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
          subject: '[AI 여행 가이드] 이메일 인증 코드',
          html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #3B82F6; margin: 0;">AI 여행 가이드</h1>
                <p style="color: #666; margin: 5px 0;">이메일 인증 코드</p>
              </div>
              
              <div style="background: #f8fafc; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h2 style="color: #1e293b; margin-bottom: 20px;">인증 코드</h2>
                <div style="font-size: 36px; font-weight: bold; color: #3B82F6; letter-spacing: 8px; margin: 20px 0;">
                  ${newVerificationCode}
                </div>
                <p style="color: #666; margin: 0;">위 코드를 회원가입 페이지에 입력해주세요</p>
              </div>
              
              <div style="color: #666; font-size: 14px; line-height: 1.6;">
                <p><strong>주의사항:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>이 코드는 <strong>10분 후 만료</strong>됩니다</li>
                  <li>코드를 다른 사람과 공유하지 마세요</li>
                  <li>본인이 요청하지 않았다면 이 이메일을 무시해주세요</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
                <p>이 메일은 자동 발송되었습니다. 문의사항이 있으시면 고객센터로 연락해주세요.</p>
              </div>
            </div>
          `,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ 이메일 발송 성공:', result.messageId);

        return NextResponse.json(
          { 
            success: true,
            message: '인증 코드가 발송되었습니다. 이메일을 확인해주세요.',
            expiresAt: expiresAt.toISOString()
          },
          { status: 200 }
        );

      } catch (emailError) {
        console.error('이메일 발송 실패:', emailError);
        
        // 이메일 발송 실패시 DB에서 인증 코드 삭제
        try {
          await supabase
            .from('email_verifications')
            .delete()
            .eq('email', email);
        } catch (cleanupError) {
          console.error('정리 작업 실패:', cleanupError);
        }

        return NextResponse.json(
          { error: '이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.' },
          { status: 500 }
        );
      }
    }

    // === 인증 코드 확인 ===
    if (action === 'verify_code') {
      if (!email || !verificationCode) {
        return NextResponse.json(
          { error: '이메일과 인증 코드를 모두 입력해주세요.' },
          { status: 400 }
        );
      }

      try {
        console.log('인증 코드 확인 중...');
        
        const { data: verification, error: verifyError } = await supabase
          .from('email_verifications')
          .select('*')
          .eq('email', email)
          .eq('verification_code', verificationCode)
          .eq('verified', false)
          .single();

        if (verifyError || !verification) {
          console.log('인증 코드 불일치 또는 없음:', verifyError?.message);
          return NextResponse.json(
            { error: '인증 코드가 올바르지 않습니다.' },
            { status: 400 }
          );
        }

        // 만료 시간 확인
        const now = new Date();
        const expiresAt = new Date(verification.expires_at);
        
        if (now > expiresAt) {
          console.log('인증 코드 만료:', { now, expiresAt });
          
          // 만료된 코드 삭제
          await supabase
            .from('email_verifications')
            .delete()
            .eq('email', email);

          return NextResponse.json(
            { error: '인증 코드가 만료되었습니다. 새로운 코드를 요청해주세요.' },
            { status: 400 }
          );
        }

        // 인증 완료 처리
        const { error: updateError } = await supabase
          .from('email_verifications')
          .update({ 
            verified: true, 
            verified_at: new Date().toISOString() 
          })
          .eq('email', email)
          .eq('verification_code', verificationCode);

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