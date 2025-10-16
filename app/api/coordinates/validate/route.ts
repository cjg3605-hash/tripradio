// Google Places API를 사용한 좌표 검증 시스템
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

interface PlaceValidationResult {
  isValid: boolean;
  accuracy: number;
  confidence: number;
  placeName?: string;
  placeTypes?: string[];
  distance?: number; // 미터 단위
  reasoning: string;
}

interface ValidateRequest {
  latitude: number;
  longitude: number;
  expectedPlaceName?: string;
  chapterId?: string;
}

// Haversine 공식을 사용한 두 좌표간 거리 계산 (미터)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // 지구 반지름 (미터)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Google Places API를 사용한 좌표 검증
async function validateCoordinateWithGoogle(
  latitude: number, 
  longitude: number, 
  expectedPlaceName?: string
): Promise<PlaceValidationResult> {
  
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return {
      isValid: false,
      accuracy: 0.5,
      confidence: 0.3,
      reasoning: 'Google Places API 키가 설정되지 않음 - 기본 추정값 사용'
    };
  }

  try {
    // 1. Reverse Geocoding으로 좌표의 실제 장소 정보 조회
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_PLACES_API_KEY}&language=ko`;
    
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();
    
    if (geocodeData.status !== 'OK' || !geocodeData.results?.length) {
      return {
        isValid: false,
        accuracy: 0.2,
        confidence: 0.1,
        reasoning: `좌표 검증 실패: ${geocodeData.status || '알 수 없는 오류'}`
      };
    }

    const result = geocodeData.results[0];
    const placeName = result.formatted_address;
    const placeTypes = result.types || [];
    
    // 2. 장소 타입 분석
    const touristAttraction = placeTypes.includes('tourist_attraction');
    const pointOfInterest = placeTypes.includes('point_of_interest');
    const establishment = placeTypes.includes('establishment');
    
    let accuracy = 0.6; // 기본값
    let confidence = 0.7;
    
    // 관광지나 POI인 경우 정확도 증가
    if (touristAttraction) {
      accuracy += 0.3;
      confidence += 0.2;
    } else if (pointOfInterest) {
      accuracy += 0.2;
      confidence += 0.1;
    } else if (establishment) {
      accuracy += 0.1;
    }
    
    // 3. 예상 장소명과 비교 (있는 경우)
    if (expectedPlaceName) {
      const normalizedExpected = expectedPlaceName.toLowerCase().replace(/\s+/g, '');
      const normalizedActual = placeName.toLowerCase().replace(/\s+/g, '');
      
      if (normalizedActual.includes(normalizedExpected) || normalizedExpected.includes(normalizedActual)) {
        accuracy += 0.1;
        confidence += 0.1;
      }
      
      // Nearby search로 더 정확한 매칭 시도
      try {
        const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=100&keyword=${encodeURIComponent(expectedPlaceName)}&key=${process.env.GOOGLE_PLACES_API_KEY}&language=ko`;
        
        const nearbyResponse = await fetch(nearbyUrl);
        const nearbyData = await nearbyResponse.json();
        
        if (nearbyData.status === 'OK' && nearbyData.results?.length > 0) {
          const closestPlace = nearbyData.results[0];
          const distance = calculateDistance(
            latitude, longitude,
            closestPlace.geometry.location.lat,
            closestPlace.geometry.location.lng
          );
          
          if (distance < 10) { // 10미터 이내 - 매우 정확
            accuracy = Math.max(accuracy, 0.95);
            confidence = Math.max(confidence, 0.95);
          } else if (distance < 30) { // 30미터 이내 - 실용적 정확도
            accuracy = Math.max(accuracy, 0.90);
            confidence = Math.max(confidence, 0.90);
          } else if (distance < 100) { // 100미터 이내 - 허용 가능
            accuracy = Math.max(accuracy, 0.80);
            confidence = Math.max(confidence, 0.80);
          }
        }
      } catch (nearbyError) {
        console.warn('Nearby search 실패:', nearbyError);
      }
    }
    
    // 값 범위 제한
    accuracy = Math.min(accuracy, 1.0);
    confidence = Math.min(confidence, 1.0);
    
    return {
      isValid: accuracy >= 0.85, // 실용적 최소 기준 상향
      accuracy,
      confidence,
      placeName,
      placeTypes,
      reasoning: `Google Places 검증 완료 - ${touristAttraction ? '관광지' : pointOfInterest ? 'POI' : '일반 장소'} (${placeName})`
    };
    
  } catch (error) {
    console.error('Google Places API 오류:', error);
    return {
      isValid: false,
      accuracy: 0.3,
      confidence: 0.2,
      reasoning: `Google Places API 호출 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    };
  }
}

// POST: 좌표 검증 및 정확도 업데이트
export async function POST(request: NextRequest) {
  try {
    const body: ValidateRequest = await request.json();
    const { latitude, longitude, expectedPlaceName, chapterId } = body;

    if (!latitude || !longitude) {
      return NextResponse.json({
        success: false,
        error: '위도와 경도가 필요합니다.'
      }, { status: 400 });
    }

    // 1. Google Places API로 좌표 검증
    const validation = await validateCoordinateWithGoogle(latitude, longitude, expectedPlaceName);
    
    // 2. 챕터 ID가 제공된 경우 데이터베이스 업데이트
    if (chapterId) {
      const { error: updateError } = await supabase
        .from('guide_chapters')
        .update({
          coordinate_accuracy: validation.accuracy,
          coordinate_confidence: validation.confidence,
          validation_status: validation.isValid ? 'verified' : 'failed',
          validation_source: 'google_places',
          last_validated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', chapterId);

      if (updateError) {
        console.error('챕터 업데이트 실패:', updateError);
        return NextResponse.json({
          success: false,
          error: `챕터 업데이트 실패: ${updateError.message}`,
          validation
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      validation,
      updated: !!chapterId
    });

  } catch (error) {
    console.error('좌표 검증 오류:', error);
    return NextResponse.json({
      success: false,
      error: `좌표 검증 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }, { status: 500 });
  }
}

// GET: 검증이 필요한 좌표들을 일괄 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guideId = searchParams.get('guideId');
    const minAccuracy = parseFloat(searchParams.get('minAccuracy') || '0.9'); // 실용적 정확도 기준 상향
    const batchSize = parseInt(searchParams.get('batchSize') || '20');

    let query = supabase
      .from('guide_chapters')
      .select('id, guide_id, chapter_index, title, latitude, longitude, coordinate_accuracy, validation_status, last_validated_at')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .or(`coordinate_accuracy.lt.${minAccuracy},coordinate_accuracy.is.null,validation_status.eq.pending`)
      .order('coordinate_accuracy', { ascending: true, nullsFirst: true })
      .limit(batchSize);

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
        batchSize
      }
    });

  } catch (error) {
    console.error('검증 대상 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: `조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }, { status: 500 });
  }
}