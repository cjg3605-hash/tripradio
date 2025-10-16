/**
 * Gemini 전세계 지역정보 추출 시스템 테스트 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractLocationForDB, extractLocationInfoWithGemini } from '@/lib/location/gemini-location-extractor';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.nextUrl);
    const placeName = searchParams.get('place') || 'test-location';
    
    console.log(`🧪 Gemini 추출 테스트: "${placeName}"`);
    
    // 1. 상세 정보 추출
    const fullInfo = await extractLocationInfoWithGemini(placeName, 'ko');
    
    // 2. DB용 간소화 정보 추출  
    const dbInfo = await extractLocationForDB(placeName, 'ko');
    
    return NextResponse.json({
      success: true,
      placeName,
      fullInfo,
      dbInfo,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Gemini 추출 테스트 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { testCases } = await request.json();
    
    if (!testCases || !Array.isArray(testCases)) {
      return NextResponse.json({
        success: false,
        error: 'testCases 배열이 필요합니다'
      }, { status: 400 });
    }
    
    console.log(`🧪 배치 테스트 시작: ${testCases.length}개 장소`);
    
    const results: Array<{
      placeName: string;
      success: boolean;
      data?: any;
      error?: string;
      valid: boolean;
    }> = [];
    
    for (let i = 0; i < testCases.length; i++) {
      const placeName = testCases[i];
      console.log(`📍 ${i + 1}/${testCases.length}: "${placeName}"`);
      
      try {
        const dbInfo = await extractLocationForDB(placeName, 'ko');
        
        results.push({
          placeName,
          success: !!dbInfo,
          data: dbInfo,
          valid: dbInfo ? !!(
            dbInfo.location_region &&
            dbInfo.country_code &&
            dbInfo.country_code.length === 3 &&
            dbInfo.country_code !== 'UNK'
          ) : false
        });
        
        // API 호출 제한을 위한 대기
        if (i < testCases.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        results.push({
          placeName,
          success: false,
          error: error instanceof Error ? error.message : '알 수 없는 오류',
          valid: false
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const validCount = results.filter(r => r.valid).length;
    
    console.log(`🎯 배치 테스트 완료: ${testCases.length}개 중 ${successCount}개 성공, ${validCount}개 유효`);
    
    return NextResponse.json({
      success: true,
      summary: {
        total: testCases.length,
        successful: successCount,
        valid: validCount,
        failed: testCases.length - successCount
      },
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ 배치 테스트 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}