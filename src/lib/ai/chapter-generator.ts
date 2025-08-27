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
  private static readonly TARGET_CHAPTER_DURATION = 690; // 1.15배속 10분 = 실제 11.5분
  private static readonly SEGMENT_DURATION_RANGE = [25, 35]; // 초
  private static readonly SEGMENTS_PER_CHAPTER = 23; // 평균값

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
      
      chapters.push({
        chapterIndex,
        title: this.generateChapterTitle(mainChapter, locationAnalysis.locationType),
        description: this.generateChapterDescription(chapterGroup, locationAnalysis),
        targetDuration: this.TARGET_CHAPTER_DURATION,
        estimatedSegments: this.SEGMENTS_PER_CHAPTER,
        contentFocus: this.extractContentFocus(chapterGroup),
        transitionToNext: index < selectedChapters.length - 1 ? 
          `다음으로는 ${locationName}의 또 다른 매력적인 구역을 살펴보겠습니다.` : undefined
      });
    });

    return chapters;
  }

  /**
   * AI 기반 자동 챕터 생성 (가이드 데이터가 없는 경우)
   */
  private static generateFromLocationAnalysis(
    locationName: string,
    locationContext: LocationContext,
    locationAnalysis: any,
    targetCount: number
  ): ChapterStructure[] {
    const chapters: ChapterStructure[] = [];
    const locationType = locationAnalysis.locationType;

    // 장소 유형별 기본 챕터 템플릿
    const chapterTemplates = this.getChapterTemplates(locationType);
    
    for (let i = 0; i < targetCount; i++) {
      const template = chapterTemplates[i] || chapterTemplates[chapterTemplates.length - 1];
      
      chapters.push({
        chapterIndex: i + 1,
        title: template.title.replace('{locationName}', locationName),
        description: template.description.replace('{locationName}', locationName),
        targetDuration: this.TARGET_CHAPTER_DURATION,
        estimatedSegments: this.SEGMENTS_PER_CHAPTER,
        contentFocus: template.contentFocus,
        transitionToNext: i < targetCount - 1 ? template.transition : undefined
      });
    }

    return chapters;
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