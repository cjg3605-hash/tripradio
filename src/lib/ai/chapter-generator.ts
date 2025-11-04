// 🎯 AI 기반 동적 챕터 생성 시스템
// architect + analyzer 페르소나 활용

import { LocationAnalyzer, EXPERT_PERSONAS, LocationContext } from './location-analyzer';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChapterStructure {
  chapterIndex: number;
  title: string;
  description: string;
  targetDuration: number; // 초 단위 (690초 = 11.5분)
  estimatedSegments: number;
  contentFocus: string[];
  transitionToNext?: string;
}

export interface PodcastStructure {
  intro: ChapterStructure;
  chapters: ChapterStructure[];
  outro?: ChapterStructure;
  totalChapters: number;
  totalDuration: number;
  selectedPersonas: string[];
  locationAnalysis: any;
}

export class ChapterGenerator {
  private static readonly TARGET_CHAPTER_DURATION = 360; // 6분/챕터 (최적화)
  private static readonly SEGMENT_DURATION_RANGE = [20, 30]; // 초 (단축)
  private static readonly SEGMENTS_PER_CHAPTER = 15; // 평균값 (단축)

  /**
   * 메인 챕터 구조 생성 함수
   */
  static async generatePodcastStructure(
    locationName: string,
    locationContext: LocationContext,
    guideData?: any,
    language: string = 'ko'
  ): Promise<PodcastStructure> {
    console.log('🏗️ 팟캐스트 구조 생성 시작:', { locationName, locationContext });

    // 1. 장소 분석
    const locationAnalysis = await LocationAnalyzer.analyzeLocation(
      locationName,
      locationContext,
      guideData
    );

    console.log('📊 장소 분석 결과:', locationAnalysis);

    // 2. 인트로 챕터 생성
    const intro = this.generateIntroChapter(locationName, locationContext, locationAnalysis);

    // 3. 메인 챕터들 생성
    const chapters = await this.generateMainChapters(
      locationName,
      locationContext,
      locationAnalysis,
      guideData
    );

    // 4. 아웃트로 챕터 생성 (선택적)
    const outro = chapters.length > 6 ? 
      this.generateOutroChapter(locationName, locationContext) : undefined;

    const totalChapters = chapters.length + 1 + (outro ? 1 : 0);
    const totalDuration = (chapters.length + 1 + (outro ? 1 : 0)) * this.TARGET_CHAPTER_DURATION;

    return {
      intro,
      chapters,
      outro,
      totalChapters,
      totalDuration,
      selectedPersonas: locationAnalysis.personas,
      locationAnalysis
    };
  }

  /**
   * 인트로 챕터 생성 (항상 0번 챕터)
   */
  private static generateIntroChapter(
    locationName: string,
    locationContext: LocationContext,
    locationAnalysis: any
  ): ChapterStructure {
    const cityInfo = locationContext.city ? `, ${locationContext.city}` : '';
    const countryInfo = locationContext.country ? `, ${locationContext.country}` : '';

    // ✅ 실제 장소명 사용 우선순위:
    // 1. locationContext.displayName (API에서 location_names 또는 포맷팅된 이름)
    // 2. slug를 포맷팅한 이름 (fallback)
    const displayName = (locationContext as any).displayName || this.formatLocationName(locationName);

    console.log(`📍 Intro 챕터 생성: "${displayName}" (원본: "${locationName}")`);

    return {
      chapterIndex: 0,
      title: `${displayName} 소개`,
      description: `${displayName}${cityInfo}${countryInfo}에 대한 전반적인 소개와 첫인상`,
      targetDuration: this.TARGET_CHAPTER_DURATION,
      estimatedSegments: this.SEGMENTS_PER_CHAPTER,
      contentFocus: [
        '장소의 첫인상과 전반적 개요',
        '역사적 배경과 문화적 의미',
        '방문자들이 알아야 할 핵심 정보',
        '오늘의 탐방 계획 미리보기'
      ],
      transitionToNext: `자, 그럼 이제 ${displayName}의 첫 번째 핵심 구역으로 들어가볼까요?`
    };
  }

  /**
   * slug 형태의 location name을 사람이 읽을 수 있는 형태로 변환
   * 예: "louvre-museum" → "Louvre Museum"
   */
  private static formatLocationName(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * 메인 챕터들 생성 (1번부터 N번까지)
   */
  private static async generateMainChapters(
    locationName: string,
    locationContext: LocationContext,
    locationAnalysis: any,
    guideData?: any
  ): Promise<ChapterStructure[]> {
    const chapters: ChapterStructure[] = [];
    const targetChapterCount = locationAnalysis.estimatedChapters - 1; // 인트로 제외

    if (guideData?.content?.realTimeGuide?.chapters) {
      // 기존 가이드 데이터 기반 챕터 생성
      chapters.push(...this.generateFromGuideData(
        guideData.content.realTimeGuide.chapters,
        targetChapterCount,
        locationName,
        locationAnalysis
      ));
    } else {
      // AI 기반 자동 챕터 생성
      const aiChapters = await this.generateFromLocationAnalysis(
        locationName,
        locationContext,
        locationAnalysis,
        targetChapterCount
      );
      chapters.push(...aiChapters);
    }

    return chapters;
  }

  /**
   * 기존 가이드 데이터 기반 챕터 생성
   * 🎯 가이드 데이터의 실제 챕터 제목 활용
   */
  private static generateFromGuideData(
    guideChapters: any[],
    targetCount: number,
    locationName: string,
    locationAnalysis: any
  ): ChapterStructure[] {
    const chapters: ChapterStructure[] = [];

    // 가이드 챕터를 목표 수에 맞게 조정
    const selectedChapters = this.selectAndGroupChapters(guideChapters, targetCount);

    selectedChapters.forEach((chapterGroup, index) => {
      const chapterIndex = index + 1;
      const mainChapter = Array.isArray(chapterGroup) ? chapterGroup[0] : chapterGroup;

      // 🎯 실제 챕터 제목 추출 (scene_name 또는 title 우선 사용)
      let chapterTitle = mainChapter.scene_name || mainChapter.title;

      // 제목이 없으면 AI가 생성한 구체적인 장소명 사용
      if (!chapterTitle) {
        chapterTitle = this.generateChapterTitle(mainChapter, locationAnalysis.locationType);
      }

      chapters.push({
        chapterIndex,
        title: chapterTitle,
        description: this.generateChapterDescription(chapterGroup, locationAnalysis),
        targetDuration: this.TARGET_CHAPTER_DURATION,
        estimatedSegments: this.SEGMENTS_PER_CHAPTER,
        contentFocus: this.extractContentFocus(chapterGroup),
        transitionToNext: index < selectedChapters.length - 1 ?
          `다음으로는 ${selectedChapters[index + 1]?.scene_name || selectedChapters[index + 1]?.title || '다음 장소'}로 이동하겠습니다.` : undefined
      });
    });

    return chapters;
  }

  /**
   * AI 기반 자동 챕터 생성 (가이드 데이터가 없는 경우)
   * 🎯 각 챕터는 실제 장소의 특정 스팟을 대표함
   */
  private static async generateFromLocationAnalysis(
    locationName: string,
    locationContext: LocationContext,
    locationAnalysis: any,
    targetCount: number
  ): Promise<ChapterStructure[]> {
    const chapters: ChapterStructure[] = [];
    const locationType = locationAnalysis.locationType;

    // 🤖 AI 기반 실제 스팟 생성
    const specificSpots = await this.generateSpecificSpots(locationName, locationType, targetCount);

    specificSpots.forEach((spot, index) => {
      chapters.push({
        chapterIndex: index + 1,
        title: spot.name,
        description: spot.description,
        targetDuration: this.TARGET_CHAPTER_DURATION,
        estimatedSegments: this.SEGMENTS_PER_CHAPTER,
        contentFocus: spot.contentFocus,
        transitionToNext: index < specificSpots.length - 1 ?
          `다음으로는 ${specificSpots[index + 1].name}으로 이동하겠습니다.` : undefined
      });
    });

    return chapters;
  }

  /**
   * 🤖 AI 기반 실제 스팟 생성 (모든 장소 자동 대응)
   * Gemini가 실제 존재하는 구체적인 스팟들을 자동으로 생성
   */
  private static async generateSpecificSpots(
    locationName: string,
    locationType: string,
    count: number
  ): Promise<Array<{name: string, description: string, contentFocus: string[]}>> {
    console.log(`🤖 AI 기반 스팟 생성: ${locationName} (${count}개)`);

    try {
      // Gemini AI 호출
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('⚠️ GEMINI_API_KEY 없음, fallback 사용');
        return this.generateFallbackSpots(locationName, count);
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.3, // 정확성 우선
          maxOutputTokens: 2048
        }
      });

      const prompt = this.createSpotGenerationPrompt(locationName, locationType, count);

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // JSON 파싱
      const spots = this.parseSpotResponse(responseText, locationName, count);

      console.log(`✅ AI 스팟 생성 완료: ${spots.length}개`);
      return spots;

    } catch (error) {
      console.error('❌ AI 스팟 생성 실패, fallback 사용:', error);
      return this.generateFallbackSpots(locationName, count);
    }
  }

  /**
   * 🎯 스팟 생성 프롬프트 생성
   */
  private static createSpotGenerationPrompt(
    locationName: string,
    locationType: string,
    count: number
  ): string {
    return `
당신은 전세계 관광지 전문가입니다. ${locationName}을 실제 방문하는 관광객이 **절대 빠뜨리면 안 되는 필수 명소**를 모두 포함하여 주요 관광 스팟을 정확하게 식별하세요.

## 🎯 분석 대상: ${locationName}
## 📍 장소 유형: ${locationType}
## 🎪 목표: 필수 관람 명소 **전부** 포함 (최대 ${count}개)

## 📋 출력 형식 (정확히 준수):
다음 JSON 형식으로만 응답하세요:

\`\`\`json
{
  "spots": [
    {
      "name": "구체적인 스팟명",
      "description": "간단한 설명 (1-2문장)",
      "contentFocus": ["볼거리1", "볼거리2", "볼거리3", "볼거리4"]
    }
  ]
}
\`\`\`

## ⚠️ 중요 지침:
1. **필수 관람 명소 우선순위**: 세계적으로 유명한 필수 스팟을 빠뜨리지 말 것
2. **실제 존재하는 스팟만** 언급 (할루시네이션 절대 금지)
3. **구체적인 장소명** 사용 (예: "Dubai Aquarium", "에펠탑 2층 전망대", "경복궁 근정전")
4. **추상적 주제 금지** (예: "역사와 문화", "주요 명소" 같은 일반적 제목 사용 금지)
5. 각 스팟은 ${locationName} 내부의 **실제 방문 가능한 구역/시설**이어야 함
6. **유명한 장소일수록 더 많은 스팟 포함** (필수 명소를 놓치지 않도록)

## 📊 장소 유형별 예시 (필수 명소 전부 포함):

### 세계적 박물관:
- **"Louvre Museum"** →
  1. "Mona Lisa (모나리자)"
  2. "Venus de Milo (밀로의 비너스)"
  3. "Winged Victory of Samothrace (사모트라케의 니케)"
  4. "Egyptian Antiquities (이집트 유물관)"
  5. "Ancient Greek & Roman Sculptures (그리스/로마 조각관)"
  6. "Napoleon's Apartments (나폴레옹 아파트)"
  7. "Crown Jewels of France (프랑스 왕관 보석)"
  8. "Medieval Louvre Foundations (중세 루브르 성터)"
  9. "Islamic Art Collection (이슬람 미술관)"
  10. "French Paintings Gallery (프랑스 회화관 - 들라크루아, 다비드)"

- **"British Museum"** → "Rosetta Stone", "Egyptian Mummies", "Parthenon Sculptures", "Assyrian Lion Hunt", "Lewis Chessmen", etc.

### 궁궐/성:
- **"경복궁"** → "광화문", "근정전", "경회루", "향원정", "자경전", "강녕전"
- **"Versailles Palace"** → "Hall of Mirrors", "King's Apartments", "Queen's Apartments", "Royal Chapel", "Royal Opera", "Gardens"

### 쇼핑몰/복합시설:
- **"Dubai Mall"** → "Dubai Aquarium", "Fashion Avenue", "Dubai Fountain", "VR Park", "Souk", "Ice Rink"

### 테마파크:
- **"Disneyland"** → "Cinderella Castle", "Space Mountain", "Pirates of Caribbean", "Haunted Mansion", "It's a Small World"

### 타워/랜드마크:
- **"에펠탑"** → "1층 전망대", "2층 전망대", "정상 전망대", "샹드마르스 공원", "트로카데로 광장"

## 🎯 ${locationName} 필수 명소 생성:
지금 ${locationName}의 **필수 관람 명소 전부**를 포함하여 실제 스팟을 JSON으로 생성하세요.
- 세계적으로 유명한 장소라면 빠뜨리면 안 되는 핵심 스팟들을 모두 포함
- 일반 관광객이 꼭 봐야 할 하이라이트를 우선순위로 배치
- 최대 ${count}개까지 생성 가능
    `;
  }

  /**
   * 🔍 AI 응답 파싱
   */
  private static parseSpotResponse(
    responseText: string,
    locationName: string,
    count: number
  ): Array<{name: string, description: string, contentFocus: string[]}> {
    try {
      // JSON 블록 추출
      const jsonMatch = responseText.match(/\`\`\`json\s*([\s\S]*?)\`\`\`/) ||
                        responseText.match(/\{[\s\S]*"spots"[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('JSON 형식을 찾을 수 없음');
      }

      const jsonText = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonText);

      if (!parsed.spots || !Array.isArray(parsed.spots)) {
        throw new Error('spots 배열이 없음');
      }

      // 검증 및 필터링
      const validSpots = parsed.spots
        .filter((spot: any) =>
          spot.name &&
          spot.description &&
          spot.contentFocus &&
          Array.isArray(spot.contentFocus) &&
          spot.contentFocus.length > 0
        )
        .slice(0, count);

      if (validSpots.length === 0) {
        throw new Error('유효한 스팟이 없음');
      }

      return validSpots;

    } catch (error) {
      console.error('❌ 스팟 응답 파싱 실패:', error);
      throw error;
    }
  }

  /**
   * 🔄 Fallback: 기본 스팟 생성
   */
  private static generateFallbackSpots(
    locationName: string,
    count: number
  ): Array<{name: string, description: string, contentFocus: string[]}> {
    const spots: Array<{name: string, description: string, contentFocus: string[]}> = [];

    // 장소 이름 기반 스팟 추론 (하드코딩, fallback용)
    const lowerName = locationName.toLowerCase();

    // 🏛️ 에펠탑 예시
    if (lowerName.includes('에펠') || lowerName.includes('eiffel')) {
      spots.push(
        { name: '에펠탑 1층 전망대', description: '투명 유리바닥과 첫 번째 전망 공간', contentFocus: ['유리바닥 체험', '파리 전경', '레스토랑', '전시관'] },
        { name: '에펠탑 2층 전망대', description: '최고의 파리 조망과 레스토랑', contentFocus: ['파노라마 뷰', '줄 베른 레스토랑', '망원경 체험', '야경 포인트'] },
        { name: '에펠탑 정상', description: '구스타브 에펠의 사무실과 최상층 전망', contentFocus: ['최고층 전망', '에펠 사무실', '샴페인 바', '기념품 구매'] },
        { name: '샹드마르스 공원', description: '에펠탑을 배경으로 한 완벽한 사진 촬영지', contentFocus: ['포토 스팟', '피크닉 장소', '야외 휴식', '거리 공연'] }
      );
    }
    // 🏯 콜로세움 예시
    else if (lowerName.includes('콜로') || lowerName.includes('colosseum')) {
      spots.push(
        { name: '콜로세움 지상층', description: '검투사들이 싸웠던 아레나 바닥', contentFocus: ['아레나 구조', '검투사 역사', '동물 사육장', '건축 기술'] },
        { name: '콜로세움 지하층', description: '숨겨진 통로와 무대 장치', contentFocus: ['지하 통로', '엘리베이터 시스템', '대기 공간', '무대 장치'] },
        { name: '콜로세움 상층부', description: '관중석과 로마 전경', contentFocus: ['관중석 구조', '로마 포럼 조망', '계급별 좌석', '건축 양식'] }
      );
    }
    // 🏰 경복궁 예시
    else if (lowerName.includes('경복궁') || lowerName.includes('gyeongbokgung')) {
      spots.push(
        { name: '광화문과 흥례문', description: '조선 왕조의 정문과 첫 인상', contentFocus: ['광화문 현판', '해태상', '근정문', '수문장 교대식'] },
        { name: '근정전', description: '왕의 즉위식이 열리던 정전', contentFocus: ['용마루', '월대', '품계석', '조정 의식'] },
        { name: '경회루', description: '연못 위의 아름다운 누각', contentFocus: ['인공 연못', '연회 공간', '건축미', '사계절 풍경'] },
        { name: '향원정과 자경전', description: '왕실 여성들의 공간', contentFocus: ['향원정 연못', '취향교', '자경전 꽃담', '왕비 처소'] }
      );
    }
    // 🗼 도쿄타워 예시
    else if (lowerName.includes('도쿄') && lowerName.includes('타워') || lowerName.includes('tokyo') && lowerName.includes('tower')) {
      spots.push(
        { name: '도쿄타워 메인 전망대', description: '150m 높이의 도쿄 전경', contentFocus: ['도쿄 시내 조망', '후지산 뷰', '기념 사진', '카페'] },
        { name: '도쿄타워 탑 데크', description: '250m 최상층 특별 전망대', contentFocus: ['최고층 전망', '투명 바닥', '럭셔리 라운지', '일몰 명소'] },
        { name: '도쿄타워 풋타운', description: '쇼핑과 엔터테인먼트 복합공간', contentFocus: ['원피스 타워', '기념품 샵', '레스토랑', '게임센터'] }
      );
    }
    // 🗼 남산타워 예시
    else if (lowerName.includes('남산')) {
      spots.push(
        { name: 'N서울타워 전망대', description: '서울 전역을 조망하는 360도 파노라마', contentFocus: ['360도 전망', '망원경 체험', '야경 명소', '일몰 포토스팟'] },
        { name: '사랑의 자물쇠', description: '연인들의 사랑을 약속하는 상징적 공간', contentFocus: ['자물쇠 벽', '데이트 명소', '추억 만들기', '포토존'] },
        { name: '남산 케이블카', description: '케이블카로 즐기는 서울 전경', contentFocus: ['케이블카 탑승', '공중 조망', '이동 체험', '사계절 풍경'] },
        { name: '남산 산책로', description: '남산 자락을 따라 걷는 힐링 코스', contentFocus: ['둘레길', '자연 경관', '팔각정', '야외 휴식'] }
      );
    }
    // 🏗️ 동대문디자인플라자(DDP) 예시
    else if (lowerName.includes('동대문') || lowerName.includes('ddp') || lowerName.includes('디자인플라자')) {
      spots.push(
        { name: 'DDP 외관과 LED 장미정원', description: '자하 하디드의 곡선미와 빛의 향연', contentFocus: ['건축 외관', 'LED 장미', '야경 명소', '포토존'] },
        { name: 'DDP 디자인 갤러리', description: '최신 디자인 전시와 아트 컬렉션', contentFocus: ['전시 관람', '디자인 트렌드', '기획전', '체험 공간'] },
        { name: 'DDP 알림터', description: '패션쇼와 이벤트가 열리는 중심 공간', contentFocus: ['이벤트홀', '패션쇼', '런웨이', '문화 행사'] },
        { name: 'DDP 야경 산책', description: '밤에 빛나는 DDP의 또 다른 매력', contentFocus: ['야경 포토', '조명 연출', '산책로', '분위기'] }
      );
    }
    // 🏖️ 오이도/해변 예시
    else if (lowerName.includes('오이도') || lowerName.includes('갯벌') || lowerName.includes('포구') || lowerName.includes('해변') || lowerName.includes('해수욕장')) {
      spots.push(
        { name: '오이도 소개', description: '서해 갯벌의 보석, 오이도 전체 안내', contentFocus: ['지리적 특징', '갯벌 생태', '역사', '방문 정보'] },
        { name: '오이도 빨간등대', description: '오이도의 상징, 빨간등대와 주변 경관', contentFocus: ['등대 역사', '사진 명소', '낙조 감상', '등대 구조'] },
        { name: '오이도 갯벌체험', description: '갯벌에서의 천연 생물 관찰과 활동', contentFocus: ['갯벌 생태', '조개캐기', '조류 관찰', '환경 학습'] },
        { name: '오이도 포구', description: '어항의 정취와 신선한 먹거리', contentFocus: ['해산물 시장', '포구 풍경', '먹거리', '마을 문화'] },
        { name: '오이도 서해낙조', description: '일몰 시간 서해의 자연이 만드는 경이', contentFocus: ['낙조 감상', '사진 촬영', '감성 여행', '야경'] }
      );
    }
    // 🏔️ 갓바위/산 예시
    else if (lowerName.includes('갓바위') || lowerName.includes('godbaawi')) {
      spots.push(
        { name: '갓바위 소개', description: '한국의 영험한 산 갓바위 전체 안내', contentFocus: ['지리적 특징', '종교적 의미', '역사와 전설', '방문 정보'] },
        { name: '갓바위 불상과 기도터', description: '바위 위의 관음보살 불상과 신성한 기도 공간', contentFocus: ['불상 역사', '영험함', '참배 문화', '불교 신앙'] },
        { name: '갓바위 등산로', description: '대구 시내를 조망하는 산책과 등산 코스', contentFocus: ['등산 경로', '자연 경관', '계절 풍경', '힐링 명소'] },
        { name: '갓바위 일출/일몰', description: '해돋이와 해넘이를 감상하는 최고의 포인트', contentFocus: ['해돋이 명소', '해넘이 경관', '사진 촬영지', '명상 공간'] },
        { name: '갓바위 주변 관광지', description: '갓바위 근처 다양한 명소와 문화유산', contentFocus: ['주변 사찰', '전통시장', '먹거리', '문화 체험'] }
      );
    }
    // 🏛️ 일반 박물관
    else if (lowerName.includes('박물관') || lowerName.includes('museum')) {
      spots.push(
        { name: `${locationName} 주요 전시실`, description: '대표 소장품과 하이라이트', contentFocus: ['대표 유물', '국보급 소장품', '주요 작품', '상설 전시'] },
        { name: `${locationName} 특별전시관`, description: '기획 전시와 특별 전시', contentFocus: ['기획전', '순회 전시', '체험 프로그램', '미디어 아트'] },
        { name: `${locationName} 역사관`, description: '시대별 역사와 문화', contentFocus: ['연대기', '역사적 사건', '문화 변천', '시대상'] }
      );
    }
    // 🕌 사찰/절
    else if (lowerName.includes('사') || lowerName.includes('암') || lowerName.includes('절') || lowerName.includes('temple')) {
      spots.push(
        { name: `${locationName} 일주문`, description: '신성한 영역의 시작', contentFocus: ['일주문 의미', '사찰 입구', '편액', '기둥 구조'] },
        { name: `${locationName} 대웅전`, description: '부처님을 모신 주불전', contentFocus: ['불상', '단청', '불화', '예불 의식'] },
        { name: `${locationName} 탑과 석조물`, description: '석탑과 불교 미술', contentFocus: ['다층석탑', '석등', '석조 유물', '불교 상징'] }
      );
    }
    // 🏯 궁궐/성
    else if (lowerName.includes('궁') || lowerName.includes('성') || lowerName.includes('palace') || lowerName.includes('castle')) {
      spots.push(
        { name: `${locationName} 정문`, description: '궁궐의 위엄있는 정문', contentFocus: ['정문 건축', '수문장', '궁궐 구조', '의례 공간'] },
        { name: `${locationName} 정전`, description: '왕의 공식 행사 공간', contentFocus: ['정전 의식', '왕좌', '조정', '건축미'] },
        { name: `${locationName} 침전`, description: '왕실 가족의 생활 공간', contentFocus: ['생활 풍속', '왕실 문화', '궁중 의례', '건축 특징'] }
      );
    }
    // 🌳 자연/공원
    else if (lowerName.includes('공원') || lowerName.includes('산') || lowerName.includes('park') || lowerName.includes('mountain')) {
      spots.push(
        { name: `${locationName} 주요 탐방로`, description: '대표 산책로와 트레일', contentFocus: ['트레킹 코스', '자연 경관', '포토존', '휴게소'] },
        { name: `${locationName} 전망대`, description: '최고의 조망 포인트', contentFocus: ['파노라마 뷰', '일출 일몰', '사진 촬영', '전망 시설'] },
        { name: `${locationName} 생태 구역`, description: '자연 생태와 야생 동식물', contentFocus: ['생태계', '야생 동물', '식물 관찰', '환경 보호'] }
      );
    }
    // 기본 템플릿 (일반 관광지) - 더 나은 설명과 함께
    else {
      // 더 나은 기본 제목 생성
      const defaultSpotNames = [
        `${locationName} 소개`,
        `${locationName} 주요 명소`,
        `${locationName} 역사와 문화`,
        `${locationName} 추천 포토스팟`,
        `${locationName} 방문 정보`,
        `${locationName} 음식문화`,
        `${locationName} 쇼핑 & 엔터테인먼트`,
        `${locationName} 자연 경관`,
        `${locationName} 야경명소`,
        `${locationName} 숨은 보석 명소`
      ];

      for (let i = 0; i < count && i < defaultSpotNames.length; i++) {
        spots.push({
          name: defaultSpotNames[i],
          description: `${locationName}의 ${defaultSpotNames[i].split(' ').pop()} 구간`,
          contentFocus: ['주요 특징', '역사적 의미', '관람 포인트', '사진 촬영지']
        });
      }

      // 필요한 경우 추가 생성 (5개 이상)
      if (count > defaultSpotNames.length) {
        for (let i = defaultSpotNames.length; i < count; i++) {
          spots.push({
            name: `${locationName} 특별한 장소 ${i - defaultSpotNames.length + 1}`,
            description: `${locationName}의 독특한 매력을 느낄 수 있는 장소`,
            contentFocus: ['지역 특색', '문화 체험', '감성 여행', '추억 장소']
          });
        }
      }
    }

    return spots.slice(0, count);
  }

  /**
   * 장소 유형별 챕터 템플릿
   */
  private static getChapterTemplates(locationType: string) {
    const templates: Record<string, any[]> = {
      'museum': [
        {
          title: '상설 전시관 하이라이트',
          description: '박물관의 대표 소장품과 핵심 전시물들',
          contentFocus: ['대표 소장품', '역사적 의미', '예술적 가치', '보존 이야기'],
          transition: '이제 특별 전시관으로 발걸음을 옮겨보겠습니다.'
        },
        {
          title: '특별 전시 및 기획전',
          description: '현재 진행 중인 특별 전시와 기획 전시',
          contentFocus: ['특별 전시 소개', '기획 의도', '관람 포인트', '체험 프로그램'],
          transition: '박물관의 숨겨진 이야기들을 더 들어보시죠.'
        },
        {
          title: '건축과 공간 이야기',
          description: '박물관 건축과 전시 공간의 설계 철학',
          contentFocus: ['건축 설계', '공간 구성', '관람 동선', '건축가 이야기'],
          transition: '마지막으로 박물관의 교육 프로그램을 살펴보겠습니다.'
        }
      ],
      'temple_shrine': [
        {
          title: '성스러운 공간의 의미',
          description: '종교 건축물의 신성한 공간과 그 의미',
          contentFocus: ['종교적 의미', '건축 양식', '신앙 체계', '의례 문화'],
          transition: '이제 이곳의 역사적 변천사를 살펴보겠습니다.'
        },
        {
          title: '역사 속의 신앙',
          description: '시대를 관통하는 종교적 역사와 문화',
          contentFocus: ['역사적 변천', '종교적 사건', '문화적 영향', '예술적 유산'],
          transition: '현재까지 이어지는 종교 문화를 알아보시죠.'
        }
      ],
      'shopping_district': [
        {
          title: '쇼핑의 메카, 트렌드의 중심',
          description: '최신 패션과 트렌드가 만나는 쇼핑의 성지',
          contentFocus: ['쇼핑 문화', '패션 트렌드', '브랜드 스토리', '소비 문화'],
          transition: '이제 이 지역의 먹거리 문화를 탐방해보겠습니다.'
        },
        {
          title: '맛의 거리, 음식의 향연',
          description: '다양한 음식 문화와 맛집들의 이야기',
          contentFocus: ['음식 문화', '대표 맛집', '길거리 음식', '요리 역사'],
          transition: '마지막으로 이 지역의 야경과 밤문화를 살펴보시죠.'
        }
      ],
      'natural_landmark': [
        {
          title: '자연의 조형미',
          description: '자연이 만들어낸 경이로운 지형과 경관',
          contentFocus: ['지질학적 특성', '형성 과정', '자연 경관', '생태계'],
          transition: '이곳에 서식하는 생명체들을 만나보겠습니다.'
        },
        {
          title: '생태계의 보고',
          description: '다양한 생물들이 어우러진 자연 생태계',
          contentFocus: ['생물 다양성', '서식지', '생태계 보전', '환경 보호'],
          transition: '자연 보호와 지속가능한 관광에 대해 이야기해보시죠.'
        }
      ]
    };

    return templates[locationType] || templates['museum']; // 기본값
  }

  /**
   * 아웃트로 챕터 생성
   */
  private static generateOutroChapter(
    locationName: string,
    locationContext: LocationContext
  ): ChapterStructure {
    return {
      chapterIndex: 999, // 마지막 챕터 표시
      title: '마무리와 다음 여행',
      description: `${locationName} 탐방을 마무리하며 다음 여행지 추천`,
      targetDuration: this.TARGET_CHAPTER_DURATION * 0.8, // 조금 짧게
      estimatedSegments: Math.floor(this.SEGMENTS_PER_CHAPTER * 0.8),
      contentFocus: [
        '오늘 탐방 내용 정리',
        '가장 인상 깊었던 순간들',
        '주변 추천 명소',
        '다음 여행 계획 제안'
      ]
    };
  }

  /**
   * 유틸리티 함수들
   */
  private static selectAndGroupChapters(guideChapters: any[], targetCount: number) {
    if (guideChapters.length <= targetCount) {
      return guideChapters;
    }
    
    // 중요도나 내용 길이 기반으로 선별 및 그룹핑
    const sortedChapters = guideChapters.sort((a, b) => 
      (b.narrative?.length || 0) - (a.narrative?.length || 0)
    );
    
    return sortedChapters.slice(0, targetCount);
  }

  private static generateChapterTitle(chapter: any, locationType: string): string {
    if (chapter.title) return chapter.title;
    
    const titlePrefixes: Record<string, string> = {
      'museum': '전시관',
      'temple_shrine': '성역',
      'palace_castle': '궁전',
      'shopping_district': '상권',
      'natural_landmark': '자연'
    };
    
    const prefix = titlePrefixes[locationType] || '구역';
    return `${prefix} ${chapter.id || '탐방'}`;
  }

  private static generateChapterDescription(chapterGroup: any, locationAnalysis: any): string {
    if (Array.isArray(chapterGroup)) {
      return `${chapterGroup.length}개 구역의 통합 탐방: ${chapterGroup.map(c => c.title || '미지의 구역').join(', ')}`;
    }
    
    return chapterGroup.scene_description || chapterGroup.narrative || '이 구역의 특별한 이야기들을 들어보시죠.';
  }

  private static extractContentFocus(chapterGroup: any): string[] {
    const defaultFocus = ['주요 볼거리', '역사적 배경', '문화적 의미', '관람 포인트'];
    
    if (Array.isArray(chapterGroup)) {
      return chapterGroup.map(c => c.title || '특별한 경험').slice(0, 4);
    }
    
    return defaultFocus;
  }
}