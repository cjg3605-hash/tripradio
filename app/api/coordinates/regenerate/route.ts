// 🚨 DEPRECATED: 이 API는 기존 enhanceGuideCoordinates 시스템과 충돌합니다
// 사용을 중단하고 guide-coordinate-enhancer.ts의 enhanceGuideCoordinates를 사용하세요
// 🚨 DEPRECATED: This API conflicts with existing enhanceGuideCoordinates system
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// 좌표 응답 인터페이스
interface CoordinateResponse {
  coordinates: Array<{
    chapterId: string;
    chapterIndex: number;
    title: string;
    latitude: number | null;
    longitude: number | null;
    confidence: number;
    tier: number; // 0=좌표없음, 1-4=TIER 분류
    userGuidance: string;
    reasoning: string;
    expectedAccuracy: number;
  }>;
}

interface RegenerateRequest {
  guideId?: string;
  locationName?: string;
  minAccuracy?: number;
  maxAttempts?: number;
  forceRegenerate?: boolean;
}

export async function POST(request: NextRequest) {
  // 🚨 DEPRECATED API - 통합 시스템으로 리다이렉트
  console.warn('🚨 DEPRECATED: /api/coordinates/regenerate는 중단된 API입니다.');
  console.warn('📍 대신 enhanceGuideCoordinates 함수를 사용하세요.');
  
  return NextResponse.json({
    success: false,
    deprecated: true,
    message: '이 API는 중단되었습니다. generate-guide-with-gemini API의 enhanceCoordinates 옵션을 사용하세요.',
    migration: {
      oldApi: '/api/coordinates/regenerate',
      newApi: '/api/ai/generate-guide-with-gemini', 
      option: 'enhanceCoordinates: true (기본값)',
      system: 'enhanceGuideCoordinates 함수 통합 사용'
    }
  }, { status: 410 }); // 410 Gone
  
  /*
  // 🚨 기존 코드는 충돌하는 로직이므로 주석 처리
  try {
    const body: RegenerateRequest = await request.json();
    const {
      guideId,
      locationName,
      minAccuracy = 0.9, // 실용성을 위해 90% 기본값으로 상향
      maxAttempts = 3,
      forceRegenerate = false
    } = body;

    // 1. 재생성 대상 챕터 조회
    let query = supabase
      .from('guide_chapters')
      .select('*');

    if (guideId) {
      query = query.eq('guide_id', guideId);
    }

    if (!forceRegenerate) {
      query = query
        .or(`coordinate_accuracy.lt.${minAccuracy},coordinate_accuracy.is.null`)
        .lt('regeneration_attempts', maxAttempts);
    }

    const { data: chapters, error: fetchError } = await query;

    if (fetchError) {
      return NextResponse.json({ 
        success: false, 
        error: `챕터 조회 실패: ${fetchError.message}` 
      }, { status: 500 });
    }

    if (!chapters || chapters.length === 0) {
      return NextResponse.json({
        success: true,
        message: '재생성이 필요한 챕터가 없습니다.',
        regeneratedCount: 0
      });
    }

    // 2. 가이드 정보 조회 (locationName이 없는 경우)
    let targetLocationName = locationName;
    if (!targetLocationName && guideId) {
      const { data: guide } = await supabase
        .from('guides')
        .select('locationname')
        .eq('id', guideId)
        .single();
      
      if (guide) {
        targetLocationName = guide.locationname;
      }
    }

    if (!targetLocationName) {
      return NextResponse.json({ 
        success: false, 
        error: '장소명이 필요합니다.' 
      }, { status: 400 });
    }

    // 3. AI를 통한 좌표 재생성
    const chaptersForAI = chapters.map(chapter => ({
      chapterId: chapter.id,
      chapterIndex: chapter.chapter_index,
      title: chapter.title,
      currentLatitude: chapter.latitude,
      currentLongitude: chapter.longitude,
      currentAccuracy: chapter.coordinate_accuracy || 0
    }));

    const aiPrompt = `
# 좌표 정확도 개선 요청 (하이브리드 접근법)

**주요 장소**: ${targetLocationName}
**재생성 대상 챕터들**:

${chaptersForAI.map(ch => `
- **챕터 ${ch.chapterIndex}**: ${ch.title}
  - 현재 좌표: ${ch.currentLatitude}, ${ch.currentLongitude}
  - 현재 정확도: ${ch.currentAccuracy}
`).join('\n')}

## 🎯 좌표 생성 전략

### **1단계: 위치 카테고리 분석**
각 챕터를 다음 중 하나로 분류:

**TIER 1: 절대 정확 (신뢰도 0.95-1.0) - 인트로 챕터 전용**
- 입구/게이트: "Main Entrance", "Gate 1", "Entry Point", "Ticket Office" (Google Places 100% 등록)
- 교통 허브: "Metro Station Exit A", "Bus Stop #123", "Train Station Platform" (공식 번호/명칭)
- 공식 시설: "Visitor Center", "Information Center", "Welcome Center" (공식 안내소)
- 주차 시설: "Official Parking Entrance", "Main Parking Lot" (공식 주차장만)

**TIER 2: 근사 위치 (신뢰도 0.6-0.8)**
- 건물 내부: "Gallery Hall", "Main Hall", "Courtyard", "Lobby"
- 상대 위치: "North of A", "Behind Building B", "Adjacent to C"
- 구조물: "Bridge Center", "Stairway Top", "Fountain Area"

**TIER 3: 구역 안내 (신뢰도 0.4-0.6)**  
- 넓은 공간: "Plaza", "Square", "Park", "Garden", "Courtyard"
- 거리/구역: "Shopping District", "Food Court", "Alley", "Promenade"
- 자연 지형: "Hill", "Waterfront", "Trail", "Pathway"

**TIER 4: 설명 위주 (신뢰도 0.2-0.4)**
- 추상적: "Photo Spot", "Viewpoint", "Scenic Area"
- 체험 기반: "Dining Area", "Night View Spot"
- 계절적: "Seasonal Display", "Garden Path"

### **2단계: 좌표 선택 우선순위**
1. **Google Places 검색 가능한 정확한 명칭 우선**
2. **주요 랜드마크에서 상대적 거리로 계산**
3. **해당 구역의 중심점이나 대표 지점**
4. **관광객 동선과 안전성 고려**

### **3단계: 신뢰도 점수 산정**
- **0.95-1.0**: Google Places 정확 매칭 + 주소 일치 (±5m 이내)
- **0.90-0.94**: 공식 POI 확인됨 (±10-20m 이내) - **실용 기준선**
- **0.80-0.89**: 랜드마크 기준 상대 위치 (±30-50m 이내)  
- **0.60-0.79**: 구역 중심점/일반 관광지 (±100m 이내)
- **0.40-0.59**: 추정 위치 (±200m+ 오차 가능)
- **0.20-0.39**: 불확실한 위치 (사용 비권장)

## 📍 AI 좌표 생성 규칙 (자동화 최적화)

### **TIER 분류 자동 결정 (다국어 지원)**:
1. **키워드 매칭**: "entrance", "gate", "ticket", "입구", "정문", "매표소" → TIER 1
2. **건물명 포함**: "hall", "center", "museum", "전", "관", "당", "각" → TIER 1-2  
3. **공간 표현**: "plaza", "square", "park", "광장", "마당", "뜰" → TIER 3
4. **추상 표현**: "viewpoint", "photo spot", "포토존", "뷰포인트" → TIER 4

### **좌표 생성 전략 (플로우 최적화)**:

**인트로 챕터 (id: 0) 전용 규칙:**
- 반드시 TIER 1만 사용 (절대 정확한 위치)
- Google Places API에서 100% 확인된 POI만
- 건물 내부/상대적 위치 절대 금지
- 입구, 게이트, 방문자센터, 교통허브, 주차장만 허용
- ⚠️ **검증 필수**: 생성된 좌표가 실제 관광지의 공식 접근점인지 확인
- ⚠️ **실패시**: 가장 가까운 대중교통 정류장으로 대체

**일반 챕터 (id: 1+) 규칙:**
- 좌표 생성하지 않음 (latitude: null, longitude: null)
- nextDirection 텍스트 안내에만 집중
- "From previous location, head [direction] for [distance]" 형식 사용
- tier: 0 (좌표 없음을 명시)

### **정확도 목표 (플로우 최적화)**:

**인트로 챕터 (id: 0):**
- 정확도: 95%+ (5-15m 오차)
- 절대 실패 불가: Google Places 확인된 위치만
- 사용자 경험: "정확히 여기서 시작하세요"

**일반 챕터 (id: 1+):**
- 좌표 없음 (지도 표시 안 함)
- nextDirection으로만 안내
- 사용자 경험: "방향 안내를 따라 이동하세요"

**출력 형식:**
- 인트로 챕터: tier=1, 정확한 좌표, confidence=0.95+, expectedAccuracy=5-15m
- 일반 챕터: tier=0, latitude=null, longitude=null, confidence=0, expectedAccuracy=0

### **검증 체크리스트 (인트로 챕터)**:
1. 좌표가 실제 관광지 경계 내부인가?
2. Google Maps에서 해당 좌표 검색 시 올바른 장소명이 나오는가?
3. 대중교통(지하철/버스/기차)으로 접근 가능한 지점인가?
4. 입구/게이트/방문자센터 등 명확한 시작점인가?
5. 일반인이 찾아갈 수 있는 공개된 장소인가?
`;

    if (!genAI) {
      return NextResponse.json({ 
        success: false, 
        error: 'Gemini AI가 설정되지 않았습니다.' 
      }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const fullPrompt = aiPrompt + `

응답은 반드시 다음과 같은 JSON 형식으로만 제공하세요:
{
  "coordinates": [
    {
      "chapterId": "챕터ID",
      "chapterIndex": 챕터순번,
      "title": "챕터제목",
      "latitude": 위도_또는_null,
      "longitude": 경도_또는_null,
      "confidence": 0.0~1.0,
      "tier": 0~4,
      "userGuidance": "사용자안내메시지",
      "reasoning": "좌표선택이유",
      "expectedAccuracy": 예상오차미터
    }
  ]
}`;

    const geminiResult = await model.generateContent(fullPrompt);
    const response = await geminiResult.response;
    const responseText = response.text();
    
    let result: CoordinateResponse;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      return NextResponse.json({ 
        success: false, 
        error: `AI 응답 파싱 실패: ${parseError}` 
      }, { status: 500 });
    }

    // 4. 생성된 좌표로 데이터베이스 업데이트
    const updatePromises = result.coordinates.map(async (coord) => {
      const chapter = chapters.find(ch => ch.id === coord.chapterId);
      if (!chapter) return null;

      // 🎯 일반 챕터는 좌표 null 처리
      const updateData = coord.tier === 0 ? {
        latitude: null,
        longitude: null,
        coordinate_accuracy: 0,
        coordinate_confidence: 0,
        regeneration_attempts: (chapter.regeneration_attempts || 0) + 1,
        validation_status: 'no_coordinates_needed',
        validation_source: 'ai_flow_optimization',
        last_validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } : {
        latitude: coord.latitude,
        longitude: coord.longitude,
        coordinate_accuracy: coord.confidence,
        coordinate_confidence: coord.confidence,
        regeneration_attempts: (chapter.regeneration_attempts || 0) + 1,
        validation_status: coord.confidence >= 0.95 ? 'verified' : 'pending', // 인트로는 95% 기준
        validation_source: 'ai_regenerated',
        last_validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('guide_chapters')
        .update(updateData)
        .eq('id', coord.chapterId);

      return { chapterId: coord.chapterId, success: !error, error };
    });

    const updateResults = await Promise.all(updatePromises);
    const successCount = updateResults.filter(r => r?.success).length;
    const failedUpdates = updateResults.filter(r => r && !r.success);

    // 5. 결과 반환
    return NextResponse.json({
      success: true,
      message: `${successCount}개 챕터의 좌표를 성공적으로 재생성했습니다.`,
      regeneratedCount: successCount,
      totalCandidates: chapters.length,
      coordinates: result.coordinates,
      failedUpdates: failedUpdates.map(f => ({
        chapterId: f?.chapterId,
        error: f?.error
      }))
    });

  } catch (error) {
    console.error('좌표 재생성 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: `좌표 재생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
    }, { status: 500 });
  }
}

// GET: 재생성 대상 챕터 조회 - DEPRECATED
export async function GET(request: NextRequest) {
  // 🚨 DEPRECATED API 
  return NextResponse.json({
    success: false,
    deprecated: true,
    message: '이 API는 중단되었습니다. 통합된 좌표 시스템을 사용하세요.'
  }, { status: 410 }); // 410 Gone
  
  /*
  // 🚨 기존 코드 주석 처리
  try {
    const { searchParams } = new URL(request.url);
    const guideId = searchParams.get('guideId');
    const minAccuracy = parseFloat(searchParams.get('minAccuracy') || '0.8');
    const maxAttempts = parseInt(searchParams.get('maxAttempts') || '3');

    let query = supabase
      .from('guide_chapters')
      .select('id, guide_id, chapter_index, title, latitude, longitude, coordinate_accuracy, regeneration_attempts, validation_status')
      .or(`coordinate_accuracy.lt.${minAccuracy},coordinate_accuracy.is.null`)
      .lt('regeneration_attempts', maxAttempts);

    if (guideId) {
      query = query.eq('guide_id', guideId);
    }

    const { data: chapters, error } = await query;

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: `챕터 조회 실패: ${error.message}` 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      candidates: chapters || [],
      count: chapters?.length || 0,
      criteria: {
        minAccuracy,
        maxAttempts
      }
    });

  } catch (error) {
    console.error('재생성 대상 조회 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: `조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
    }, { status: 500 });
  }
  */
}