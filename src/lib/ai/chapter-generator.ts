// 🎯 AI 기반 동적 챕터 생성 시스템
// architect + analyzer 페르소나 활용

import { LocationAnalyzer, EXPERT_PERSONAS, LocationContext } from './location-analyzer';

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

    return {
      chapterIndex: 0,
      title: `${locationName} 소개`,
      description: `${locationName}${cityInfo}${countryInfo}에 대한 전반적인 소개와 첫인상`,
      targetDuration: this.TARGET_CHAPTER_DURATION,
      estimatedSegments: this.SEGMENTS_PER_CHAPTER,
      contentFocus: [
        '장소의 첫인상과 전반적 개요',
        '역사적 배경과 문화적 의미',
        '방문자들이 알아야 할 핵심 정보',
        '오늘의 탐방 계획 미리보기'
      ],
      transitionToNext: `자, 그럼 이제 ${locationName}의 첫 번째 핵심 구역으로 들어가볼까요?`
    };
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
      chapters.push(...this.generateFromLocationAnalysis(
        locationName,
        locationContext,
        locationAnalysis,
        targetChapterCount
      ));
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
  private static generateFromLocationAnalysis(
    locationName: string,
    locationContext: LocationContext,
    locationAnalysis: any,
    targetCount: number
  ): ChapterStructure[] {
    const chapters: ChapterStructure[] = [];
    const locationType = locationAnalysis.locationType;

    // 🎯 장소별 실제 유명 스팟 생성 (AI가 구체적인 장소명을 생성하도록)
    const specificSpots = this.generateSpecificSpots(locationName, locationType, targetCount);

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
   * 🎯 실제 장소별 구체적인 스팟 생성
   * AI가 프롬프트에서 이 정보를 활용하여 해당 스팟에 대한 대화 생성
   */
  private static generateSpecificSpots(
    locationName: string,
    locationType: string,
    count: number
  ): Array<{name: string, description: string, contentFocus: string[]}> {
    const spots: Array<{name: string, description: string, contentFocus: string[]}> = [];

    // 장소 이름 기반 스팟 추론
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
    // 기본 템플릿 (일반 관광지)
    else {
      for (let i = 0; i < count; i++) {
        spots.push({
          name: `${locationName} 핵심 스팟 ${i + 1}`,
          description: `${locationName}의 ${i + 1}번째 주요 관광 포인트`,
          contentFocus: ['주요 특징', '역사적 의미', '관람 포인트', '사진 촬영지']
        });
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