/**
 * 🎯 AI 지도 분석 기반 챕터 0 좌표 생성 시스템
 * Google Places 우선 검색 → AI 지도 분석 → 최적 시작점 결정
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GooglePlacesTextSearchResult {
  results: Array<{
    name: string;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    place_id: string;
    rating?: number;
    types: string[];
  }>;
}

export interface GooglePlacesNearbyResult {
  results: Array<{
    name: string;
    types: string[];
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    place_id: string;
    rating?: number;
    vicinity?: string;
  }>;
}

export interface GoogleGeocodingResult {
  results: Array<{
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
      location_type: 'ROOFTOP' | 'RANGE_INTERPOLATED' | 'GEOMETRIC_CENTER' | 'APPROXIMATE';
    };
    place_id: string;
    types: string[];
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }>;
  status: string;
}

export interface AIMapAnalysisResult {
  success: boolean;
  selectedStartingPoint: {
    name: string;
    coordinate: { lat: number; lng: number };
    placeId: string;
    reasoning: string;
  } | null;
  allFacilities: Array<{
    name: string;
    coordinate: { lat: number; lng: number };
    types: string[];
    rating?: number;
  }>;
  confidence: number;
  processingTimeMs: number;
}

/**
 * 🧠 AI 지도 분석 시스템 클래스
 */
export class AIMapAnalysisSystem {
  private gemini: GoogleGenerativeAI | null = null;
  private model: any = null;
  private googleApiKey: string = '';
  private geminiApiKey: string = '';

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Gemini 초기화
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      this.geminiApiKey = geminiKey;
      this.gemini = new GoogleGenerativeAI(geminiKey);
      this.model = this.gemini.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048, // 복잡한 관광 동선 분석을 위해 증가
          topP: 0.8
        }
      });
    }

    // Google API 키 설정
    this.googleApiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '';
  }

  /**
   * 🎯 메인 함수: AI 지도 분석을 통한 챕터 0 좌표 생성
   */
  async generateChapter0CoordinateWithMapAnalysis(
    locationName: string,
    chapterDescription: string = ''
  ): Promise<AIMapAnalysisResult> {
    const startTime = Date.now();
    console.log(`🎯 AI 지도 분석 시작: ${locationName}`);

    const result: AIMapAnalysisResult = {
      success: false,
      selectedStartingPoint: null,
      allFacilities: [],
      confidence: 0,
      processingTimeMs: 0
    };

    try {
      // 1단계: 하이브리드 검색으로 메인 장소 찾기 (Places + Geocoding)
      const mainLocation = await this.searchMainLocationHybrid(locationName);
      if (!mainLocation) {
        console.warn(`⚠️ 메인 장소를 찾을 수 없음: ${locationName}`);
        result.processingTimeMs = Date.now() - startTime;
        return result;
      }

      console.log(`✅ 메인 장소 발견: ${mainLocation.name} (${mainLocation.geometry.location.lat}, ${mainLocation.geometry.location.lng})`);
      console.log(`🔍 검색 방식: ${mainLocation.source?.toUpperCase()} API`);

      // 2단계: 주변 1km 반경의 모든 관련 시설 검색
      const nearbyFacilities = await this.searchNearbyTouristFacilities(
        mainLocation.geometry.location,
        locationName
      );

      if (nearbyFacilities.length === 0) {
        console.warn(`⚠️ 주변 시설을 찾을 수 없음: ${locationName}`);
        result.processingTimeMs = Date.now() - startTime;
        return result;
      }

      console.log(`🔍 주변 시설 ${nearbyFacilities.length}개 발견`);

      // 3단계: AI가 지도 분석하여 최적 시작점 선택
      const aiSelection = await this.analyzeMapAndSelectStartingPoint(
        locationName,
        chapterDescription,
        nearbyFacilities,
        mainLocation
      );

      if (aiSelection) {
        result.success = true;
        result.selectedStartingPoint = aiSelection;
        result.confidence = 0.8; // confidence는 analysis에서 설정
        
        console.log(`✅ AI 선택 완료: ${aiSelection.name}`);
        console.log(`📍 좌표: ${aiSelection.coordinate.lat}, ${aiSelection.coordinate.lng}`);
        console.log(`🧠 선택 근거: ${aiSelection.reasoning}`);
      }

      // 모든 시설 정보 저장
      result.allFacilities = nearbyFacilities.map(f => ({
        name: f.name,
        coordinate: f.geometry.location,
        types: f.types,
        rating: f.rating
      }));

      result.processingTimeMs = Date.now() - startTime;
      return result;

    } catch (error) {
      console.error('❌ AI 지도 분석 실패:', error);
      result.processingTimeMs = Date.now() - startTime;
      return result;
    }
  }

  /**
   * 🎯 하이브리드 좌표 검색: Places + Geocoding API 병렬 실행
   */
  private async searchMainLocationHybrid(locationName: string) {
    if (!this.googleApiKey) {
      throw new Error('Google API key not available');
    }

    try {
      console.log(`🔍 하이브리드 검색 시작: ${locationName}`);
      
      // Places와 Geocoding API 병렬 실행으로 속도 최적화
      const [placesResult, geocodingResult] = await Promise.all([
        this.searchWithPlacesAPI(locationName),
        this.searchWithGeocodingAPI(locationName)
      ]);

      // 최적 좌표 선택
      const bestResult = this.selectBestCoordinate(placesResult, geocodingResult, locationName);
      
      if (bestResult) {
        console.log(`✅ 하이브리드 검색 성공: ${bestResult.source} API 선택`);
        console.log(`📍 좌표: ${bestResult.geometry.location.lat}, ${bestResult.geometry.location.lng}`);
      }
      
      return bestResult;

    } catch (error) {
      console.error('❌ 하이브리드 검색 실패:', error);
      // 폴백: Places API만 사용
      return await this.searchWithPlacesAPI(locationName);
    }
  }

  /**
   * 🔍 Google Places Text Search로 메인 장소 검색
   */
  private async searchWithPlacesAPI(locationName: string) {
    try {
      // 다국어 및 정확한 장소명으로 검색 개선
      const enhancedQuery = await this.enhanceLocationQuery(locationName);
      
      // 역(Station) 관련 검색인 경우 타입 필터 추가
      const isStation = enhancedQuery.toLowerCase().includes('station') || locationName.includes('역');
      const typeFilter = isStation ? '&type=transit_station' : '';
      
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(enhancedQuery)}&language=en${typeFilter}&key=${this.googleApiKey}`;
      
      console.log(`🔍 Places API 검색: ${enhancedQuery}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Places API error: ${response.status}`);
      }

      const data: GooglePlacesTextSearchResult = await response.json();
      
      if (data.results && data.results.length > 0) {
        return { ...data.results[0], source: 'places' };
      }

      return null;

    } catch (error) {
      console.error('Places API 검색 실패:', error);
      return null;
    }
  }

  /**
   * 🗺️ Google Geocoding API로 정확한 주소 기반 좌표 검색
   */
  private async searchWithGeocodingAPI(locationName: string) {
    try {
      // AI 번역된 장소명 사용
      const enhancedQuery = await this.enhanceLocationQuery(locationName);
      
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(enhancedQuery)}&language=en&key=${this.googleApiKey}`;
      
      console.log(`🗺️ Geocoding API 검색: ${enhancedQuery}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data: GoogleGeocodingResult = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          name: result.formatted_address,
          formatted_address: result.formatted_address,
          geometry: result.geometry,
          place_id: result.place_id,
          types: result.types,
          source: 'geocoding',
          location_type: result.geometry.location_type
        };
      }

      return null;

    } catch (error) {
      console.error('Geocoding API 검색 실패:', error);
      return null;
    }
  }

  /**
   * 🏢 2단계: 주변 관광 시설 검색 (1km 반경)
   */
  private async searchNearbyTouristFacilities(
    centerLocation: { lat: number; lng: number },
    locationName: string
  ) {
    if (!this.googleApiKey) {
      throw new Error('Google API key not available');
    }

    try {
      // 관광 관련 시설 타입들
      const touristTypes = [
        'tourist_attraction',
        'point_of_interest', 
        'establishment',
        'museum',
        'transit_station',
        'subway_station',
        'train_station'
      ];

      const allFacilities: any[] = [];

      // 각 타입별로 검색 (Google Places는 한 번에 하나의 타입만 검색 가능)
      for (const type of touristTypes) {
        // 다중 반경 검색으로 정확도 향상
        const radii = [500, 1000, 2000]; // 500m, 1km, 2km
        
        for (const radius of radii) {
          const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${centerLocation.lat},${centerLocation.lng}&radius=${radius}&type=${type}&key=${this.googleApiKey}`;
          
          const response = await fetch(url);
          if (response.ok) {
            const data: GooglePlacesNearbyResult = await response.json();
            if (data.results) {
              allFacilities.push(...data.results.map(facility => ({
                ...facility,
                searchRadius: radius,
                searchType: type
              })));
            }
          }
          
          // API 호출 간격 (rate limiting 방지)
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // 중복 제거 (place_id 기준)
      const uniqueFacilities = allFacilities.filter((facility, index, self) => 
        index === self.findIndex(f => f.place_id === facility.place_id)
      );

      // 관련성 점수로 정렬
      return uniqueFacilities
        .map(facility => ({
          ...facility,
          relevanceScore: this.calculateRelevanceScore(facility.name, facility.types, locationName)
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 30); // 30개로 확장하여 더 정확한 분석

    } catch (error) {
      console.error('주변 시설 검색 실패:', error);
      return [];
    }
  }

  /**
   * 🧠 3단계: AI가 지도 분석하여 최적 시작점 선택 (챕터 컨텍스트 포함)
   */
  private async analyzeMapAndSelectStartingPoint(
    locationName: string,
    chapterDescription: string,
    facilities: any[],
    mainLocation: any
  ) {
    if (!this.model) {
      throw new Error('Gemini model not available');
    }

    const facilitiesInfo = facilities.slice(0, 20).map((f, index) => 
      `${index + 1}. ${f.name} (${f.types.slice(0, 3).join(', ')}) - ${f.rating ? f.rating + '★' : '평점없음'} - 좌표: ${f.geometry.location.lat}, ${f.geometry.location.lng}`
    ).join('\n');

    // 🎯 챕터 컨텍스트 분석을 통한 구체적 장소명 추출
    const chapterContext = this.extractChapterLocationContext(chapterDescription);
    const isSpecificLocation = chapterContext && chapterContext !== locationName;

    const prompt = `# 🎯 AI 관광 시작점 분석 (컨텍스트 기반)

**메인 관광지:** ${locationName}
**메인 장소:** ${mainLocation.name} (${mainLocation.geometry.location.lat}, ${mainLocation.geometry.location.lng})
**챕터 설명:** ${chapterDescription || '제공되지 않음'}
${isSpecificLocation ? `**🎯 중요: 챕터에서 언급하는 구체적 장소:** "${chapterContext}"` : ''}

## 주변 시설 목록 (1km 반경)
${facilitiesInfo}

## 분석 요청
${isSpecificLocation ? 
  `**특별 요구사항**: 챕터에서 "${chapterContext}"를 언급하고 있습니다. 이는 "${locationName}"과는 다른 구체적인 시작 지점을 의미합니다. 
  
  관광객이 **"${chapterContext}"에서 시작**하여 **${locationName}** 관람을 진행하기에 가장 적절한 장소를 선택해주세요.` :
  `관광객이 **${locationName}** 관람을 시작하기에 **가장 적절한 장소**를 하나 선택해주세요.`}

### 선택 기준 (우선순위 순)
${isSpecificLocation ? 
  `1. **"${chapterContext}" 관련 시설** - 챕터에서 명시한 구체적 장소 우선
  2. **교통 연결점** - ${chapterContext}로 가는 접근 경로
  3. **메인 입구/정문** - ${chapterContext}의 출입구
  4. **매표소/티켓부스** - ${chapterContext} 이용을 위한 티켓 구매처
  5. **안내소/정보센터** - ${chapterContext} 관련 정보 제공처` :
  `1. **메인 입구/정문** - 관광객이 자연스럽게 도착하는 곳
  2. **방문자센터/안내소** - 정보 제공 및 시작점 역할
  3. **매표소/티켓부스** - 입장권 구매 후 시작하는 곳
  4. **교통 연결점** - 지하철/기차역 출구 등
  5. **중앙 광장/로비** - 랜드마크가 되는 중심 공간`}

### 고려사항
- 관광객 접근성 (대중교통, 도보)
${isSpecificLocation ? 
  `- "${chapterContext}" 키워드가 포함된 시설명 우선 고려
  - ${chapterContext}와 직접 연관된 시설이나 장소` :
  `- 시설명에서 "entrance", "main", "center", "information" 등의 키워드`}
- 평점이 높고 잘 알려진 곳
- ${locationName}와 직접 연관된 곳

다음 JSON 형식으로 정확히 답변하세요:

{
  "selectedFacilityIndex": 선택한 시설의 번호 (1-20),
  "selectedFacility": {
    "name": "선택한 시설명",
    "coordinate": { "lat": 위도, "lng": 경도 },
    "placeId": "place_id"
  },
  "reasoning": "선택 근거 설명 (2-3문장)${isSpecificLocation ? `, 특히 ${chapterContext}와의 연관성 설명` : ''}",
  "confidence": 신뢰도 (0.0-1.0)
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = await result.response.text();
      
      // JSON 파싱
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI 분석 결과에서 JSON을 찾을 수 없음');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      
      // 선택된 시설 정보 매핑
      const selectedIndex = analysis.selectedFacilityIndex - 1;
      if (selectedIndex >= 0 && selectedIndex < facilities.length) {
        const selectedFacility = facilities[selectedIndex];
        
        return {
          name: selectedFacility.name,
          coordinate: selectedFacility.geometry.location,
          placeId: selectedFacility.place_id,
          reasoning: analysis.reasoning
        };
      }

      throw new Error('선택된 시설 인덱스가 유효하지 않음');

    } catch (error) {
      console.error('AI 지도 분석 실패:', error);
      return null;
    }
  }

  /**
   * 🌍 AI 기반 실시간 장소명 번역 - Google Places API 최적화
   */
  private async enhanceLocationQuery(locationName: string): Promise<string> {
    // 한국어가 포함된 경우에만 AI 번역 실행
    if (this.containsKorean(locationName)) {
      console.log(`🤖 AI 실시간 번역: "${locationName}"`);
      return await this.translateWithGeminiAI(locationName);
    }
    
    // 한국어가 없으면 원본 사용
    return locationName;
  }


  /**
   * 🔍 한국어 포함 여부 확인
   */
  private containsKorean(text: string): boolean {
    return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);
  }


  /**
   * 🤖 Gemini AI를 활용한 실시간 장소명 번역
   * 한국어 장소명을 Google Places API에 최적화된 영어/현지어로 변환
   */
  private async translateWithGeminiAI(locationName: string): Promise<string> {
    try {
      if (!this.geminiApiKey) {
        console.warn('⚠️ Gemini API key 없음, 원본 사용');
        return locationName;
      }

      const genAI = new GoogleGenerativeAI(this.geminiApiKey);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.1, // 일관된 번역을 위해 낮은 temperature
          maxOutputTokens: 150 // 관광지 분석을 위해 증가
        }
      });

      const prompt = `
한국어 장소명을 Google Places API 검색에 최적화된 검색어로 변환해주세요.

규칙:
1. 한국 지하철역/기차역: 영어로 번역 + Station 추가 (예: "평촌역" → "Pyeongchon Station Korea")
2. 한국 일반 장소: 한국어 그대로 유지 (예: "광화문" → "광화문")  
3. 해외 장소: 해당 국가 현지어/영어로 번역 (예: "에펠탑" → "Tour Eiffel Paris France")
4. 도시명/국가명 포함하여 검색 정확도 향상
5. 공식 명칭 사용

한국어 장소명: "${locationName}"

답변: 최적화된 검색어만 출력 (설명이나 따옴표 없이)
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const translatedName = response.text().trim().replace(/['"]/g, ''); // 따옴표 제거

      if (translatedName && translatedName !== locationName && translatedName.length < 200) {
        console.log(`🤖 AI 번역: "${locationName}" → "${translatedName}"`);
        return translatedName;
      } else {
        console.warn(`⚠️ AI 번역 실패, 원본 사용: ${locationName}`);
        return locationName;
      }

    } catch (error) {
      console.warn(`⚠️ Gemini AI 번역 오류: ${locationName}`, error);
      return locationName;
    }
  }

  /**
   * 🎯 최적 좌표 선택: Places vs Geocoding 결과 비교
   */
  private selectBestCoordinate(placesResult: any, geocodingResult: any, locationName: string) {
    // 둘 다 없으면 null
    if (!placesResult && !geocodingResult) {
      return null;
    }

    // 하나만 있으면 그것 반환
    if (!placesResult) return geocodingResult;
    if (!geocodingResult) return placesResult;

    // 둘 다 있으면 정확도 점수로 비교
    const placesScore = this.calculateAccuracyScore(placesResult, locationName, 'places');
    const geocodingScore = this.calculateAccuracyScore(geocodingResult, locationName, 'geocoding');

    console.log(`📊 정확도 점수 비교:`);
    console.log(`   Places: ${placesScore.toFixed(2)} (${placesResult.name})`);
    console.log(`   Geocoding: ${geocodingScore.toFixed(2)} (${geocodingResult.name})`);

    return placesScore >= geocodingScore ? placesResult : geocodingResult;
  }

  /**
   * 📏 좌표 정확도 점수 계산
   */
  private calculateAccuracyScore(result: any, locationName: string, source: string): number {
    let score = 0;

    // 1. 이름 유사성 (0-0.4)
    const nameSimilarity = this.calculateStringSimilarity(
      result.name?.toLowerCase() || '',
      locationName.toLowerCase()
    );
    score += nameSimilarity * 0.4;

    // 2. Geocoding 특별 보너스 (0-0.3)
    if (source === 'geocoding') {
      const locationType = result.location_type;
      if (locationType === 'ROOFTOP') score += 0.3;
      else if (locationType === 'RANGE_INTERPOLATED') score += 0.2;
      else if (locationType === 'GEOMETRIC_CENTER') score += 0.1;
    }

    // 3. Places 특별 보너스 (0-0.3)
    if (source === 'places') {
      // 관광지/시설 타입 보너스
      const relevantTypes = ['tourist_attraction', 'point_of_interest', 'transit_station'];
      const hasRelevantType = result.types?.some((type: string) => relevantTypes.includes(type));
      if (hasRelevantType) score += 0.2;
      
      // 평점 보너스
      if (result.rating && result.rating > 4.0) score += 0.1;
    }

    // 4. 타입 관련성 (0-0.2)
    if (result.types) {
      const isStation = locationName.includes('역') || locationName.toLowerCase().includes('station');
      const hasStationType = result.types.some((type: string) => 
        type.includes('station') || type.includes('transit')
      );
      if (isStation && hasStationType) score += 0.2;
    }

    // 5. 주소 완성도 (0-0.1)
    if (result.formatted_address && result.formatted_address.length > 20) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * 📊 시설과 대상 장소 간 관련성 점수 계산
   */
  private calculateRelevanceScore(facilityName: string, facilityTypes: string[], locationName: string): number {
    let score = 0;

    // 이름 유사성 점수 (0-0.5)
    const nameSimilarity = this.calculateStringSimilarity(
      facilityName.toLowerCase(),
      locationName.toLowerCase()
    );
    score += nameSimilarity * 0.5;

    // 시설 타입 점수 (0-0.5)
    const relevantTypes = [
      'tourist_attraction', 'point_of_interest', 'establishment',
      'museum', 'transit_station', 'subway_station', 'train_station'
    ];

    const typeScore = facilityTypes.some(type => relevantTypes.includes(type)) ? 0.5 : 0;
    score += typeScore;

    return Math.min(score, 1.0);
  }

  /**
   * 📝 문자열 유사성 계산
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    // 포함 관계 확인
    if (longer.includes(shorter) || shorter.includes(longer)) {
      return 0.8;
    }
    
    // 단어 단위 매칭
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  /**
   * 🎯 챕터 설명에서 구체적인 장소 컨텍스트 추출
   */
  private extractChapterLocationContext(chapterDescription: string): string | null {
    if (!chapterDescription || chapterDescription.length < 5) {
      return null;
    }

    // 구체적인 장소명을 나타내는 패턴들
    const locationPatterns = [
      // 케이블카, 교통수단
      /(?:남산)?케이블카/gi,
      /(?:남산)?곤돌라/gi,
      /(?:남산)?로프웨이/gi,
      
      // 출입구, 역, 정류장
      /(?:\w+)?역/gi,
      /(?:\w+)?출입구/gi,
      /(?:\w+)?정문/gi,
      /(?:\w+)?입구/gi,
      /(?:\w+)?게이트/gi,
      /(?:\w+)?터미널/gi,
      /(?:\w+)?정류장/gi,
      
      // 시설명
      /(?:\w+)?센터/gi,
      /(?:\w+)?타워/gi,
      /(?:\w+)?전망대/gi,
      /(?:\w+)?매표소/gi,
      /(?:\w+)?안내소/gi,
      /(?:\w+)?광장/gi,
      /(?:\w+)?공원/gi,
      /(?:\w+)?박물관/gi,
      /(?:\w+)?미술관/gi,
      
      // 방향/위치
      /(?:\w+)?쪽/gi,
      /(?:\w+)?편/gi,
      /(?:\w+)?구역/gi,
      /(?:\w+)?층/gi,
      /(?:\w+)?홀/gi,
      /(?:\w+)?관/gi
    ];

    // 모든 패턴에서 매치되는 항목들 수집
    const foundLocations: string[] = [];
    
    for (const pattern of locationPatterns) {
      const matches = chapterDescription.match(pattern);
      if (matches) {
        foundLocations.push(...matches.map(match => match.trim()));
      }
    }

    if (foundLocations.length === 0) {
      return null;
    }

    // 중복 제거 및 가장 구체적인 것 선택
    const uniqueLocations = [...new Set(foundLocations)];
    
    // 우선순위: 교통수단 > 구체적 시설명 > 일반적 위치
    const priorities = [
      /케이블카|곤돌라|로프웨이/i,
      /역|터미널|정류장/i,
      /센터|타워|전망대|매표소|안내소/i,
      /출입구|정문|입구|게이트/i,
      /광장|공원|박물관|미술관/i,
      /쪽|편|구역|층|홀|관/i
    ];

    for (const priority of priorities) {
      const priorityMatch = uniqueLocations.find(loc => priority.test(loc));
      if (priorityMatch) {
        return priorityMatch;
      }
    }

    // 우선순위 매치가 없으면 첫 번째 반환
    return uniqueLocations[0];
  }
}

// 싱글톤 인스턴스
export const aiMapAnalysisSystem = new AIMapAnalysisSystem();

/**
 * 🎯 편의 함수: AI 지도 분석을 통한 챕터 0 좌표 생성
 */
export async function generateChapter0CoordinateWithAI(
  locationName: string,
  chapterDescription: string = ''
): Promise<AIMapAnalysisResult> {
  return await aiMapAnalysisSystem.generateChapter0CoordinateWithMapAnalysis(
    locationName,
    chapterDescription
  );
}