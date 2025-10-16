// src/lib/multilang-guide-manager.ts
import { supabase } from '@/lib/supabaseClient';
import { normalizeLocationName } from '@/lib/utils';
import { logger } from './utils/logger';

export class MultiLangGuideManager {
  /**
   * 🔍 언어별 가이드 조회
   */
  static async getGuideByLanguage(locationName: string, language: string): Promise<{
    success: boolean;
    data?: any;
    coordinates?: any; // 🔥 좌표 타입 추가
    error?: string;
    source: 'cache' | 'database';
  }> {
    try {
      // 🔥 통일된 위치명 정규화 사용 (page.tsx와 동일)
      const normalizedLocation = normalizeLocationName(locationName);
      
      logger.api.start('guide-db-query', { 
        original: locationName, 
        normalized: normalizedLocation, 
        language 
      });
      
      // .single() 대신 .limit(1)을 사용하여 406 에러 방지
      const { data, error } = await supabase
        .from('guides')
        .select('id, locationname, language, content, coordinates, location_region, country_code, created_at, updated_at')
        .eq('locationname', normalizedLocation)
        .eq('language', language.toLowerCase())
        .limit(1);

      if (error) {
        logger.api.error('guide-db-query', { error: error.message, code: error.code });
        return { success: false, error: error.message, source: 'database' };
      }

      // 결과가 없는 경우
      if (!data || data.length === 0) {
        logger.api.success('guide-db-query', { result: 'NOT_FOUND' });
        return { success: false, error: 'NOT_FOUND', source: 'database' };
      }

      const guide = data[0]; // 첫 번째 결과 사용
      logger.api.success('guide-db-query', { 
        found: true,
        region: guide.location_region,
        country: guide.country_code 
      });

      return { 
        success: true, 
        data: guide.content,
        coordinates: guide.coordinates, // 🔥 핵심 수정: coordinates 데이터 포함
        source: 'database' 
      } as any;

    } catch (error) {
      logger.general.error('DB 조회 중 예외 발생', error);
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
        // 🎯 coordinates 저장 제거 - generate-coordinates API에서 단독 처리
        location_region: regionalInfo.location_region || null,
        country_code: regionalInfo.country_code || null,
        updated_at: new Date().toISOString()
      };

      console.log(`📋 DB 저장 데이터:`, {
        locationname: saveData.locationname,
        language: saveData.language,
        location_region: saveData.location_region,
        country_code: saveData.country_code
        // 🎯 coordinates 로깅 제거 - 더 이상 이 함수에서 처리하지 않음
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
    coordinates?: any; // 🔥 좌표 타입 추가
    error?: string;
    source?: 'cache' | 'generated';
  }> {
    try {
      console.log(`🔄 스마트 언어 전환: ${locationName} → ${targetLanguage}`);

      // 🔄 기존 가이드 무시하고 항상 새로 생성 (API 라우팅은 클라이언트에서 처리)
      console.log(`🔄 기존 가이드 무시하고 새로 생성`);
      
      // 가이드 새로 생성
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
  ): Promise<{ success: boolean; data?: any; coordinates?: any; error?: any; source?: string }> {
    
    try {
      console.log(`🤖 ${language} 가이드 생성 시작:`, locationName);

      // 🔄 기존 가이드 무시하고 항상 새로 생성
      console.log(`🔄 기존 가이드 무시하고 새로 생성`);

      // 🎯 기본 일반 가이드 API 사용 (pageType 분류는 클라이언트에서 처리)
      let apiUrl = '/api/ai/generate-sequential-guide';
      
      console.log(`🎯 API: ${apiUrl}`);
      
      // 🌍 지역 정보 우선순위 최적화: 첫 번째 시도 성공률 향상을 위해 폴백 시스템 우선 사용
      let queryParams = new URLSearchParams();
      
      try {
        // 🥇 1순위: SessionStorage의 자동완성 데이터 사용 (가장 정확)
        if (regionalContext && regionalContext.region && regionalContext.country && regionalContext.countryCode) {
          console.log('✅ SessionStorage 자동완성 데이터 우선 사용:', regionalContext);
          queryParams.set('region', regionalContext.region);
          queryParams.set('country', regionalContext.country);
          queryParams.set('countryCode', regionalContext.countryCode);
          queryParams.set('type', regionalContext.type || 'attraction');
          
        } else {
          console.log(`🔄 SessionStorage 데이터 불완전, 폴백 시스템 우선 시도: "${locationName}"`);
          
          // 🥈 2순위: 폴백 시스템 먼저 시도 (속도 및 안정성 우선)
          const { routeLocationQueryCached } = await import('@/lib/location/location-router');
          const classificationResult = await routeLocationQueryCached(locationName);
          
          console.log('🎯 폴백 지역 분류 결과:', classificationResult);
          
          if (classificationResult.locationData) {
            const locationData = classificationResult.locationData;
            
            // 지역 정보 추출
            const region = locationData.parent || 
                          (locationData.type === 'city' ? locationData.country : null) ||
                          null;
            const country = locationData.country || null;
            const countryCode = country === '한국' ? 'KOR' : 
                               country === '대한민국' ? 'KOR' :
                               country === '일본' ? 'JPN' :
                               country === '중국' ? 'CHN' :
                               country === '프랑스' ? 'FRA' :
                               country === '미국' ? 'USA' :
                               country === '영국' ? 'GBR' :
                               country === '이탈리아' ? 'ITA' :
                               country === '스페인' ? 'ESP' :
                               country === '독일' ? 'DEU' : null;
            
            if (region) queryParams.set('region', region);
            if (country) queryParams.set('country', country);
            if (countryCode) queryParams.set('countryCode', countryCode);
            queryParams.set('type', locationData.type || 'landmark');
            
            console.log('✅ 폴백으로 추출된 지역 정보:', {
              locationName,
              region,
              country,
              countryCode,
              type: locationData.type,
              source: classificationResult.source,
              confidence: classificationResult.confidence
            });
            
          } else {
            console.log(`🔍 폴백 실패, Google API 시도: "${locationName}"`);
            
            // 🥉 3순위: Google API 기반 정확한 지역 정보 추출 시도 (정확도 높지만 느림)
            const { extractAccurateLocationInfo } = await import('@/lib/coordinates/accurate-country-extractor');
            const accurateInfo = await extractAccurateLocationInfo(locationName, language);
            
            if (accurateInfo && accurateInfo.countryCode) {
              console.log('✅ Google API 기반 정확한 지역 정보 추출 성공:', {
                placeName: accurateInfo.placeName,
                region: accurateInfo.region,
                country: accurateInfo.country,
                countryCode: accurateInfo.countryCode,
                confidence: (accurateInfo.confidence * 100).toFixed(1) + '%'
              });
              
              // Google API에서 추출한 정확한 정보 사용
              queryParams.set('region', accurateInfo.region);
              queryParams.set('country', accurateInfo.country);
              queryParams.set('countryCode', accurateInfo.countryCode);
              queryParams.set('type', 'attraction'); // 기본값
            
            } else {
              console.log('⚠️ Google API도 실패, 최종 폴백 사용');
              // 🥀 최종 Fallback: 부분 regionalContext나 parentRegion 사용
              if (regionalContext && (regionalContext.region || regionalContext.country)) {
                console.log('🌍 부분 regionalContext 사용:', regionalContext);
                if (regionalContext.region) queryParams.set('region', regionalContext.region);
                if (regionalContext.country) queryParams.set('country', regionalContext.country);
                if (regionalContext.countryCode) queryParams.set('countryCode', regionalContext.countryCode);
                queryParams.set('type', regionalContext.type || 'attraction');
              } else if (parentRegion) {
                console.log('🌍 parentRegion 사용:', parentRegion);
                queryParams.set('region', parentRegion);
                queryParams.set('type', 'attraction');
              } else {
                console.log('⚠️ 모든 지역 분류 실패 - 기본값 사용');
                queryParams.set('type', 'attraction');
              }
            }
          }
        }
        
      } catch (error) {
        console.error('❌ 지역 정보 추출 시스템 오류:', error);
        
        // 오류 발생 시 기존 로직 사용 (null 안전 처리)
        if (regionalContext) {
          if (regionalContext.region) queryParams.set('region', regionalContext.region);
          if (regionalContext.country) queryParams.set('country', regionalContext.country);
          if (regionalContext.countryCode) queryParams.set('countryCode', regionalContext.countryCode);
          queryParams.set('type', regionalContext.type || 'attraction');
        } else if (parentRegion) {
          queryParams.set('region', parentRegion);
          queryParams.set('type', 'attraction');
        } else {
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

      // 🔧 API 타입에 따른 결과 처리 분기
      // generateAndSaveGuide는 항상 DetailedGuidePage로 처리
      const isRegionHub = false;
      let guideData, coordinates;
      
      if (isRegionHub) {
        // RegionExploreHub: regionData를 guideData 형식으로 변환
        const regionData = result.regionData;
        coordinates = result.coordinates;
        
        guideData = {
          title: regionData.name,
          location: regionData.name,
          description: regionData.description,
          highlights: regionData.highlights,
          realTimeGuide: {
            chapters: [{
              id: 0,
              title: `${regionData.name} 소개`,
              description: regionData.description,
              narrative: regionData.description
            }]
          }
        };
        
        console.log(`🌍 ${language} 지역 허브 수신: ${regionData.name}`);
      } else {
        // DetailedGuidePage: 기존 방식 그대로
        guideData = result.data;
        coordinates = result.coordinates;
        console.log(`📥 ${language} AI 가이드 수신: ${JSON.stringify(guideData).length}자`);
        
        // 🚨 디버깅: 받은 데이터의 좌표 정보 확인 (DetailedGuidePage만)
        console.log(`\n🔍 MultiLangGuideManager 수신 데이터 검증:`);
        console.log(`  - realTimeGuide 존재: ${!!guideData.realTimeGuide}`);
        console.log(`  - chapters 개수: ${guideData.realTimeGuide?.chapters?.length || 0}`);
        
        if (guideData.realTimeGuide?.chapters) {
          guideData.realTimeGuide.chapters.slice(0, 2).forEach((chapter: any, index: number) => {
            console.log(`  - 챕터 ${index}: coordinates=${JSON.stringify(chapter.coordinates)}`);
          });
        }
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
        
        // 🔍 생성 후 coordinates 조회 시도
        const updatedGuide = await this.getGuideByLanguage(locationName, language);
        const coordinates = updatedGuide.success ? updatedGuide.coordinates : null;
        
        return { 
          success: true, 
          data: guideData,
          coordinates: coordinates // 🔥 좌표 데이터 포함
        };
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
    regionalContext?: any,
    pageType?: 'RegionExploreHub' | 'DetailedGuidePage'
  ): Promise<{ success: boolean; data?: any; coordinates?: any; error?: any }> {
    
    try {
      console.log(`🔄 ${language} 가이드 강제 재생성:`, locationName);

      // 🎯 페이지 타입에 따라 적절한 API 선택
      const isRegionHub = pageType === 'RegionExploreHub';
      let apiUrl = isRegionHub 
        ? '/api/ai/generate-region-overview'
        : '/api/ai/generate-multilang-guide';
      
      console.log(`🎯 강제 재생성 - 페이지 타입: ${pageType}, API: ${apiUrl}`);

      // API 라우트를 통해 AI 가이드 생성 요청
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationName: locationName,
          language: language,
          userProfile: userProfile,
          parentRegion: parentRegion,
          regionalContext: regionalContext,
          routingResult: { pageType, processingMethod: 'force-regenerate' }
        })
      });

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'AI 가이드 생성 실패');
      }

      // 🔧 API 타입에 따른 결과 처리 분기 (generateAndSaveGuide와 동일)
      let guideData, coordinates;
      
      if (isRegionHub) {
        // RegionExploreHub: regionData를 guideData 형식으로 변환
        const regionData = result.regionData;
        coordinates = result.coordinates;
        
        guideData = {
          title: regionData.name,
          location: regionData.name,
          description: regionData.description,
          highlights: regionData.highlights,
          realTimeGuide: {
            chapters: [{
              id: 0,
              title: `${regionData.name} 소개`,
              description: regionData.description,
              narrative: regionData.description
            }]
          }
        };
        
        console.log(`🌍 ${language} 지역 허브 강제 재생성 수신: ${regionData.name}`);
      } else {
        // DetailedGuidePage: 기존 방식 그대로
        guideData = result.data;
        coordinates = result.coordinates;
        console.log(`📥 ${language} AI 가이드 재생성 수신: ${JSON.stringify(guideData).length}자`);
      }
      
      // 🚨 디버깅: 재생성된 데이터의 좌표 정보 확인 (DetailedGuidePage만)
      if (!isRegionHub) {
        console.log(`\n🔍 MultiLangGuideManager 재생성 데이터 검증:`);
        console.log(`  - realTimeGuide 존재: ${!!guideData.realTimeGuide}`);
        console.log(`  - chapters 개수: ${guideData.realTimeGuide?.chapters?.length || 0}`);
        
        if (guideData.realTimeGuide?.chapters) {
          guideData.realTimeGuide.chapters.slice(0, 2).forEach((chapter: any, index: number) => {
            console.log(`  - 챕터 ${index}: coordinates=${JSON.stringify(chapter.coordinates)}`);
          });
        }
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
        
        // 🔍 재생성 후 coordinates 조회 시도
        const updatedGuide = await this.getGuideByLanguage(locationName, language);
        const coordinates = updatedGuide.success ? updatedGuide.coordinates : null;
        
        return { 
          success: true, 
          data: guideData,
          coordinates: coordinates // 🔥 좌표 데이터 포함
        };
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