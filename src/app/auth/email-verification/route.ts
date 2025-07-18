// ===================================================
// 📧 이메일 인증 회원가입 시스템 - API Route
// src/app/api/auth/email-verification/route.ts
// ===================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// 이메일 전송 설정 (Gmail 사용)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Gmail 계정
    pass: process.env.GMAIL_APP_PASSWORD, // 앱 비밀번호
  },
});

// 인증 코드 전송
export async function POST(request: NextRequest) {
  try {
    const { email, action } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: '이메일을 입력해주세요.' },
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

    if (action === 'send_code') {
      // 회원가입용: 이메일 중복 체크
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

      // 6자리 인증 코드 생성
      const verificationCode = crypto.randomInt(100000, 999999).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료

      // 기존 인증 코드 삭제 후 새로 생성
      await supabase
        .from('email_verifications')
        .delete()
        .eq('email', email);

      const { error: insertError } = await supabase
        .from('email_verifications')
        .insert([{
          email,
          verification_code: verificationCode,
          expires_at: expiresAt.toISOString(),
          verified: false,
          created_at: new Date().toISOString()
        }]);

      if (insertError) {
        console.error('인증 코드 저장 실패:', insertError);
        return NextResponse.json(
          { error: '인증 코드 생성에 실패했습니다.' },
          { status: 500 }
        );
      }

      // 이메일 전송
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: '[AI 가이드] 회원가입 인증 코드',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin-bottom: 10px;">AI 가이드</h1>
              <p style="color: #666; font-size: 16px;">회원가입 인증 코드</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h2 style="color: #333; margin-bottom: 15px;">인증 코드</h2>
              <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px; margin: 20px 0;">
                ${verificationCode}
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
              <p style="margin-top: 10px;">© 2024 AI 가이드. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        
        return NextResponse.json(
          { 
            success: true,
            message: '인증 코드가 이메일로 전송되었습니다.',
            expiresIn: 600 // 10분 (초 단위)
          },
          { status: 200 }
        );
      } catch (emailError) {
        console.error('이메일 전송 실패:', emailError);
        return NextResponse.json(
          { error: '인증 이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.' },
          { status: 500 }
        );
      }
    }

    if (action === 'verify_code') {
      const { verificationCode } = await request.json();
      
      if (!verificationCode) {
        return NextResponse.json(
          { error: '인증 코드를 입력해주세요.' },
          { status: 400 }
        );
      }

      // 인증 코드 확인
      const { data: verification, error } = await supabase
        .from('email_verifications')
        .select('*')
        .eq('email', email)
        .eq('verification_code', verificationCode)
        .eq('verified', false)
        .single();

      if (error || !verification) {
        return NextResponse.json(
          { error: '잘못된 인증 코드입니다.' },
          { status: 400 }
        );
      }

      // 만료 시간 확인
      const now = new Date();
      const expiresAt = new Date(verification.expires_at);
      
      if (now > expiresAt) {
        return NextResponse.json(
          { error: '인증 코드가 만료되었습니다. 새 코드를 요청해주세요.' },
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
        .eq('id', verification.id);

      if (updateError) {
        console.error('인증 상태 업데이트 실패:', updateError);
        return NextResponse.json(
          { error: '인증 처리 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { 
          success: true,
          message: '이메일 인증이 완료되었습니다.',
          verified: true
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: '잘못된 요청입니다.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('이메일 인증 처리 오류:', error);
    return NextResponse.json(
      { error: '인증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}