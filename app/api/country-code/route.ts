import { NextRequest, NextResponse } from 'next/server';

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    
    if (!country) {
      return NextResponse.json({
        success: false,
        error: '국가명이 필요합니다'
      }, { status: 400 });
    }

    // "미분류", "알 수 없음" 등 Unknown 값 처리
    const unknownValues = ['미분류', '알 수 없음', '불명', 'unknown', 'unclassified', 'n/a', ''];
    if (unknownValues.includes(country.toLowerCase())) {
      return NextResponse.json({
        success: false,
        error: '분류되지 않은 국가입니다'
      }, { status: 404 });
    }

    // 한국어 → 영어 매핑
    const koreanCountryMap: Record<string, string> = {
      '대한민국': 'South Korea',
      '한국': 'South Korea',
      '미국': 'United States',
      '일본': 'Japan',
      '중국': 'China',
      '프랑스': 'France',
      '독일': 'Germany',
      '영국': 'United Kingdom',
      '이탈리아': 'Italy',
      '스페인': 'Spain',
      '러시아': 'Russia',
      '캐나다': 'Canada',
      '호주': 'Australia',
      '브라질': 'Brazil',
      '인도': 'India',
      '태국': 'Thailand',
      '베트남': 'Vietnam',
      '싱가포르': 'Singapore',
      '말레이시아': 'Malaysia',
      '인도네시아': 'Indonesia',
      '필리핀': 'Philippines'
    };

    const englishCountryName = koreanCountryMap[country] || country;
    
    // 여러 API 엔드포인트 시도 (fullText=true로 정확한 매칭)
    const endpoints = [
      `https://restcountries.com/v3.1/name/${encodeURIComponent(englishCountryName)}?fullText=true&fields=cca3`,
      `https://restcountries.com/v3.1/translation/${encodeURIComponent(englishCountryName)}?fields=cca3`,
      `https://restcountries.com/v3.1/name/${encodeURIComponent(englishCountryName)}?fields=cca3` // 폴백용
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            'User-Agent': 'TripRadio-AI/1.0'
          }
        });
        
        if (!response.ok) {
          continue;
        }
        
        const data = await response.json();
        
        if (data && data.length > 0 && data[0].cca3) {
          return NextResponse.json({
            success: true,
            countryCode: data[0].cca3
          });
        }
      } catch (endpointError) {
        console.error(`Country API endpoint error: ${endpoint}`, endpointError);
        continue;
      }
    }
    
    // 모든 엔드포인트 실패시 기본값 반환
    return NextResponse.json({
      success: false,
      error: '국가 코드를 찾을 수 없습니다'
    }, { status: 404 });
    
  } catch (error) {
    console.error('Country code API error:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류'
    }, { status: 500 });
  }
}