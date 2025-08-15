// src/lib/multilang-guide-manager.ts
import { supabase } from '@/lib/supabaseClient';
import { normalizeLocationName } from '@/lib/utils';

export class MultiLangGuideManager {
  /**
   * 🔍 언어별 가이드 조회
   */
  static async getGuideByLanguage(locationName: string, language: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    source: 'cache' | 'database';
  }> {
    try {
      // 🔥 통일된 위치명 정규화 사용 (page.tsx와 동일)
      const normalizedLocation = normalizeLocationName(locationName);
      
      console.log(`🔍 DB 조회: "${locationName}" → "${normalizedLocation}" (${language})`);
      
      const { data, error } = await supabase
        .from('guides')
        .select('id, locationname, language, content, coordinates, location_region, country_code, created_at, updated_at')
        .eq('locationname', normalizedLocation)
        .eq('language', language.toLowerCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`❌ DB에서 가이드 없음: "${normalizedLocation}" (${language})`);
          return { success: false, error: 'NOT_FOUND', source: 'database' };
        }
        console.error(`❌ DB 조회 오류:`, error);
        return { success: false, error: error.message, source: 'database' };
      }

      console.log(`✅ DB에서 가이드 발견: "${normalizedLocation}" (${language})`, {
        location_region: data.location_region,
        country_code: data.country_code
      });
      return { 
        success: true, 
        data: data.content, 
        source: 'cache' 
      } as any;

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        source: 'database'
      };
    }
  }

  /**
   * 📋 모든 가이드 목록 조회 (디버깅용)
   */
  static async getAllGuides(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('id, locationname, language, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ 전체 가이드 목록 조회 실패:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ 전체 가이드 목록 조회 중 오류:', error);
      return [];
    }
  }

  /**
   * 🔍 향상된 가이드 검색 (여러 패턴으로 시도)
   */
  static async findGuideWithVariations(locationName: string, language: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    source: 'cache' | 'database';
    matchedTerm?: string;
  }> {
    try {
      console.log(`🔍 향상된 검색 시작: "${locationName}" (${language})`);
      
      // 🔥 통일된 정규화 사용하여 검색 패턴 생성
      const normalizedBase = normalizeLocationName(locationName);
      const searchPatterns = [
        normalizedBase, // 표준 정규화
        locationName.toLowerCase().trim().replace(/\s+/g, ''), // 모든 공백 제거
        locationName.toLowerCase().trim().replace(/[^\w\s가-힣]/g, ''), // 특수문자 제거
        // 추가 한글-영어 매핑
        ...(locationName === '에펠탑' ? ['eiffel tower', 'eiffeltower'] : []),
        ...(locationName === '스핑크스' ? ['sphinx', 'great sphinx'] : [])
      ];

      console.log(`🔍 "${locationName}" 검색 패턴들:`, searchPatterns);

      for (const pattern of searchPatterns) {
        console.log(`🔎 패턴 시도: "${pattern}"`);
        const { data, error } = await supabase
          .from('guides')
          .select('*')
          .eq('locationname', pattern)
          .eq('language', language.toLowerCase())
          .single();

        if (!error && data) {
          console.log(`✅ 가이드 발견: "${pattern}"`);
          return { 
            success: true, 
            data: data.content, 
            source: 'cache',
            matchedTerm: pattern
          };
        }
      }

      console.log(`📭 모든 패턴 실패: ${locationName}`);
      return { success: false, error: 'NOT_FOUND', source: 'database' };

    } catch (error) {
      console.error(`❌ 향상된 검색 중 오류:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        source: 'database'
      };
    }
  }

  /**
   * 🌍 모든 언어 버전 조회
   */
  static async getAllLanguageVersions(locationName: string): Promise<{
    success: boolean;
    data: string[];
    error?: string;
  }> {
    try {
      console.log(`🌍 모든 언어 버전 조회:`, locationName);
      
      const { data, error } = await supabase
        .from('guides')
        .select('language, updated_at')
        .eq('locationname', normalizeLocationName(locationName));

      if (error) {
        console.error('❌ 다국어 조회 실패:', error);
        return { success: false, error: error.message, data: [] };
      }

      const languages = data?.map(item => item.language) || [];
      console.log(`✅ 다국어 조회 완료:`, languages);
      return { success: true, data: languages };

    } catch (error) {
      console.error('❌ 다국어 조회 중 오류:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        data: []
      };
    }
  }

  /**
   * 💾 언어별 가이드 저장 (지역 정보 포함)
   */
  static async saveGuideByLanguage({
    locationName,
    language,
    guideData,
    userProfile
  }: {
    locationName: string;
    language: string;
    guideData: any;
    userProfile?: any;
  }) {
    try {
      console.log(`💾 ${language} 가이드 저장 시작:`, locationName);

      // 🌍 지역 정보 추출
      const regionalInfo = guideData.regionalInfo || {};
      console.log(`🌍 저장할 지역 정보:`, regionalInfo);

      const saveData = {
        locationname: normalizeLocationName(locationName),
        language: language.toLowerCase(),
        content: guideData,
        coordinates: guideData.coordinatesArray || null, // 🔥 새로운 coordinates 컬럼에 저장
        location_region: regionalInfo.location_region || null,
        country_code: regionalInfo.country_code || null,
        updated_at: new Date().toISOString()
      };

      console.log(`📋 DB 저장 데이터:`, {
        locationname: saveData.locationname,
        language: saveData.language,
        location_region: saveData.location_region,
        country_code: saveData.country_code,
        coordinatesCount: Array.isArray(saveData.coordinates) ? saveData.coordinates.length : 0
      });

      const { data, error } = await supabase
        .from('guides')
        .upsert(saveData, {
          onConflict: 'locationname,language'
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ ${language} 가이드 저장 실패:`, error);
        return { success: false, error: error.message };
      }

      console.log(`✅ ${language} 가이드 저장 완료:`, locationName);
      return { success: true, data };

    } catch (error) {
      console.error(`❌ ${language} 가이드 저장 중 오류:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }

  /**
   * 🎨 스마트 언어 전환 (기존 가이드가 없으면 생성)
   */
  static async smartLanguageSwitch(
    locationName: string, 
    targetLanguage: string, 
    userProfile?: any,
    parentRegion?: string,
    regionalContext?: any
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    source?: 'cache' | 'generated';
  }> {
    try {
      console.log(`🔄 스마트 언어 전환: ${locationName} → ${targetLanguage}`);

      // 1단계: 기존 가이드 확인
      const existingGuide = await this.getGuideByLanguage(locationName, targetLanguage);
      
      if (existingGuide.success) {
        console.log(`✅ 기존 ${targetLanguage} 가이드 발견 - 반환`);
        return {
          success: true,
          data: existingGuide.data,
          source: 'cache'
        };
      }

      // 2단계: 가이드가 없으면 새로 생성
      console.log(`🎨 새로운 ${targetLanguage} 가이드 생성 중...`);
      
      const generateResult = await this.generateAndSaveGuide(
        locationName, 
        targetLanguage, 
        userProfile,
        parentRegion,
        regionalContext
      );

      if (generateResult.success) {
        console.log(`✅ ${targetLanguage} 가이드 생성 및 저장 완료`);
        return {
          success: true,
          data: generateResult.data,
          source: 'generated'
        };
      } else {
        console.error(`❌ ${targetLanguage} 가이드 생성 실패:`, generateResult.error);
        return {
          success: false,
          error: generateResult.error
        };
      }

    } catch (error) {
      console.error(`❌ 스마트 언어 전환 실패:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }

  /**
   * 🤖 새로운 가이드 생성 및 저장 (강제 재생성용)
   */
  static async generateAndSaveGuide(
    locationName: string, 
    language: string, 
    userProfile?: any,
    parentRegion?: string,
    regionalContext?: any
  ): Promise<{ success: boolean; data?: any; error?: any; source?: string }> {
    
    try {
      console.log(`🤖 ${language} 가이드 생성 시작:`, locationName);

      // ⚠️ 중복 체크: 기존 가이드가 있으면 반환 (강제 재생성이 아닌 경우)
      const existingGuide = await this.getGuideByLanguage(locationName, language);
      if (existingGuide.success) {
        console.log(`✅ 기존 ${language} 가이드 발견 - 중복 생성 방지`);
        return {
          success: true,
          data: existingGuide.data,
          source: 'cache'
        };
      }

      console.log(`🎨 ${language} 가이드가 없음 - 새로 생성`);

      // 🚀 새로운 순차 API 라우트를 통해 AI 가이드 생성 요청
      // URL 파라미터로 지역 정보 전달 (검색박스에서 전달된 구조화된 데이터 활용)
      let apiUrl = '/api/ai/generate-sequential-guide';
      
      // 🌍 통합 지역 분류 시스템 사용
      let queryParams = new URLSearchParams();
      
      try {
        console.log(`🔍 통합 지역 분류 시작: "${locationName}"`);
        
        // 통합 지역 분류 시스템 호출 (정적 + 동적)
        const { classifyLocationDynamic } = await import('@/lib/location/dynamic-location-classifier');
        const classificationResult = await classifyLocationDynamic(locationName);
        
        console.log('🎯 지역 분류 결과:', classificationResult);
        
        if (classificationResult.locationData) {
          const locationData = classificationResult.locationData;
          
          // 지역 정보 추출
          const region = locationData.parent || 
                        (locationData.type === 'city' ? locationData.country : null) ||
                        '미분류';
          const country = locationData.country || '대한민국';
          const countryCode = country === '한국' ? 'KOR' : 
                             country === '대한민국' ? 'KOR' :
                             country === '일본' ? 'JPN' :
                             country === '중국' ? 'CHN' :
                             country === '프랑스' ? 'FRA' :
                             country === '미국' ? 'USA' :
                             country === '영국' ? 'GBR' :
                             country === '이탈리아' ? 'ITA' :
                             country === '스페인' ? 'ESP' :
                             country === '독일' ? 'DEU' : 'KOR';
          
          queryParams.set('region', region);
          queryParams.set('country', country);
          queryParams.set('countryCode', countryCode);
          queryParams.set('type', locationData.type || 'landmark');
          
          console.log('✅ 자동 추출된 지역 정보:', {
            locationName,
            region,
            country,
            countryCode,
            type: locationData.type,
            source: classificationResult.source,
            confidence: classificationResult.confidence
          });
          
        } else {
          // Fallback: regionalContext 사용
          if (regionalContext) {
            console.log('🌍 regionalContext 사용:', regionalContext);
            queryParams.set('region', regionalContext.region || regionalContext.parentRegion || '미분류');
            queryParams.set('country', regionalContext.country || '대한민국');
            queryParams.set('countryCode', regionalContext.countryCode || 'KOR');
            queryParams.set('type', regionalContext.type || 'attraction');
          } else if (parentRegion) {
            console.log('🌍 parentRegion 사용:', parentRegion);
            queryParams.set('region', parentRegion);
            queryParams.set('country', '대한민국');
            queryParams.set('countryCode', 'KOR');
            queryParams.set('type', 'attraction');
          } else {
            console.log('⚠️ 모든 지역 분류 실패 - 기본값 사용');
            queryParams.set('region', '미분류');
            queryParams.set('country', '대한민국');
            queryParams.set('countryCode', 'KOR');
            queryParams.set('type', 'attraction');
          }
        }
        
      } catch (error) {
        console.error('❌ 지역 분류 시스템 오류:', error);
        
        // 오류 발생 시 기존 로직 사용
        if (regionalContext) {
          queryParams.set('region', regionalContext.region || regionalContext.parentRegion || '미분류');
          queryParams.set('country', regionalContext.country || '대한민국');
          queryParams.set('countryCode', regionalContext.countryCode || 'KR');
          queryParams.set('type', regionalContext.type || 'attraction');
        } else if (parentRegion) {
          queryParams.set('region', parentRegion);
          queryParams.set('country', '대한민국');
          queryParams.set('countryCode', 'KR');
          queryParams.set('type', 'attraction');
        } else {
          queryParams.set('region', '미분류');
          queryParams.set('country', '대한민국');
          queryParams.set('countryCode', 'KR');
          queryParams.set('type', 'attraction');
        }
      }
      
      // URL 파라미터 추가
      if (queryParams.toString()) {
        apiUrl += `?${queryParams.toString()}`;
      }
      
      console.log(`🚀 순차 API 호출: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationName: locationName,
          language: language,
          userProfile: userProfile
        })
      });

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'AI 가이드 생성 실패');
      }

      const guideData = result.data;
      console.log(`📥 ${language} AI 가이드 수신: ${JSON.stringify(guideData).length}자`);
      
      // 🚨 디버깅: 받은 데이터의 좌표 정보 확인
      console.log(`\n🔍 MultiLangGuideManager 수신 데이터 검증:`);
      console.log(`  - realTimeGuide 존재: ${!!guideData.realTimeGuide}`);
      console.log(`  - chapters 개수: ${guideData.realTimeGuide?.chapters?.length || 0}`);
      
      if (guideData.realTimeGuide?.chapters) {
        guideData.realTimeGuide.chapters.slice(0, 2).forEach((chapter: any, index: number) => {
          console.log(`  - 챕터 ${index}: coordinates=${JSON.stringify(chapter.coordinates)}`);
        });
      }

      // DB에 저장
      const saveResult = await this.saveGuideByLanguage({
        locationName,
        language,
        guideData,
        userProfile
      });

      if (saveResult.success) {
        console.log(`✅ ${language} 가이드 생성 및 저장 완료`);
        return { success: true, data: guideData };
      } else {
        return { success: false, error: saveResult.error };
      }

    } catch (error) {
      console.error(`❌ ${language} 가이드 생성 실패:`, error);
      return { success: false, error };
    }
  }

  /**
   * 🔄 강제 재생성 (기존 가이드 무시하고 새로 생성)
   */
  static async forceRegenerateGuide(
    locationName: string, 
    language: string, 
    userProfile?: any,
    parentRegion?: string,
    regionalContext?: any
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    
    try {
      console.log(`🔄 ${language} 가이드 강제 재생성:`, locationName);

      // API 라우트를 통해 AI 가이드 생성 요청
      const response = await fetch('/api/ai/generate-multilang-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationName: locationName,
          language: language,
          userProfile: userProfile,
          parentRegion: parentRegion,
          regionalContext: regionalContext
        })
      });

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'AI 가이드 생성 실패');
      }

      const guideData = result.data;
      console.log(`📥 ${language} AI 가이드 재생성 수신: ${JSON.stringify(guideData).length}자`);
      
      // 🚨 디버깅: 재생성된 데이터의 좌표 정보 확인
      console.log(`\n🔍 MultiLangGuideManager 재생성 데이터 검증:`);
      console.log(`  - realTimeGuide 존재: ${!!guideData.realTimeGuide}`);
      console.log(`  - chapters 개수: ${guideData.realTimeGuide?.chapters?.length || 0}`);
      
      if (guideData.realTimeGuide?.chapters) {
        guideData.realTimeGuide.chapters.slice(0, 2).forEach((chapter: any, index: number) => {
          console.log(`  - 챕터 ${index}: coordinates=${JSON.stringify(chapter.coordinates)}`);
        });
      }

      // DB에 저장 (덮어쓰기)
      const saveResult = await this.saveGuideByLanguage({
        locationName,
        language,
        guideData,
        userProfile
      });

      if (saveResult.success) {
        console.log(`✅ ${language} 가이드 강제 재생성 완료`);
        return { success: true, data: guideData };
      } else {
        return { success: false, error: saveResult.error };
      }

    } catch (error) {
      console.error(`❌ ${language} 가이드 강제 재생성 실패:`, error);
      return { success: false, error };
    }
  }

  /**
   * 📊 언어별 가이드 통계
   */
  static async getLanguageStats(locationName: string) {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('language, updated_at')
        .eq('locationname', locationName.toLowerCase().trim());

      if (error) {
        return { total: 0, languages: [] };
      }

      return {
        total: data?.length || 0,
        languages: data?.map(item => ({
          language: item.language,
          lastUpdated: item.updated_at
        })) || []
      };

    } catch (error) {
      return { total: 0, languages: [] };
    }
  }
}

// Backward compatibility - 기존 import를 위한 alias
export const MultiLanguageGuideManager = MultiLangGuideManager;