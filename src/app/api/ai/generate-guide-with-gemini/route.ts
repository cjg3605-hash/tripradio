import { NextRequest, NextResponse } from 'next/server';
import { generatePersonalizedGuide } from '@/lib/ai/gemini';
import { UserProfile } from '@/types/guide';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Gemini 라이브러리 기반 가이드 생성 API 호출');
    
    const body = await request.json();
    const { location, userProfile } = body;

    if (!location || typeof location !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: '유효한 위치 정보가 필요합니다.' 
        },
        { status: 400 }
      );
    }

    // UserProfile 타입 검증 및 기본값 설정
    const safeUserProfile: UserProfile = {
      interests: userProfile?.interests || ['문화', '역사'],
      ageGroup: userProfile?.ageGroup || '30대',
      knowledgeLevel: userProfile?.knowledgeLevel || '중급',
      companions: userProfile?.companions || 'solo',
      tourDuration: userProfile?.tourDuration || 90,
      preferredStyle: userProfile?.preferredStyle || '친근함',
      language: userProfile?.language || 'ko'
    };

    console.log('📍 요청 정보:', {
      location: location.trim(),
      userProfile: safeUserProfile
    });

    // Gemini 라이브러리 호출
    const guideData = await generatePersonalizedGuide(
      location.trim(),
      safeUserProfile
    );

    console.log('✅ 가이드 생성 성공');

    return NextResponse.json({
      success: true,
      data: guideData,
      location: location.trim(),
      language: safeUserProfile.language
    });

  } catch (error) {
    console.error('❌ 가이드 생성 실패:', error);
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
    
    return NextResponse.json(
      { 
        success: false, 
        error: `가이드 생성 실패: ${errorMessage}`,
        details: process.env.NODE_ENV === 'development' ? {
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined
        } : undefined
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    }
  });
}

// GET 메서드 추가 (디버깅용)
export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'GET 메서드는 지원하지 않습니다. POST 메서드를 사용해주세요.',
    allowedMethods: ['POST', 'OPTIONS'],
    endpoint: '/api/ai/generate-guide-with-gemini',
    description: '완전한 Gemini 라이브러리를 사용한 개인화 가이드 생성 API'
  }, { status: 405 });
}