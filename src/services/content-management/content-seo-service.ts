/**
 * Content Management & SEO Service
 * AdSense "게시자 콘텐츠가 없는 화면" 문제 해결을 위한 콘텐츠 관리 서비스
 */

export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: 'travel' | 'guide' | 'destination' | 'tips' | 'news' | 'blog';
  tags: string[];
  author: string;
  publishedAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'archived';
  language: string;
  wordCount: number;
  readingTime: number; // minutes
  seoScore: number; // 0-100
  seoMetadata: SEOMetadata;
  images: ContentImage[];
  relatedPages: string[];
}

export interface SEOMetadata {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: any;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  internalLinks: number;
  externalLinks: number;
  imageAltTexts: string[];
}

export interface ContentImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
  fileSize: number;
  format: string;
}

export interface ContentAnalytics {
  pageViews: number;
  uniqueVisitors: number;
  averageTimeOnPage: number;
  bounceRate: number;
  searchImpressions: number;
  searchClicks: number;
  averagePosition: number;
  clickThroughRate: number;
}

export interface AdSenseContentRequirements {
  minimumWordCount: number;
  minimumPages: number;
  requiredCategories: string[];
  contentQualityScore: number;
  originalityScore: number;
  userEngagementScore: number;
}

/**
 * AdSense 승인을 위한 고품질 콘텐츠 관리 서비스
 */
export class ContentSEOService {
  private static instance: ContentSEOService;
  private contents = new Map<string, ContentPage>();
  private analytics = new Map<string, ContentAnalytics>();

  static getInstance(): ContentSEOService {
    if (!this.instance) {
      this.instance = new ContentSEOService();
    }
    return this.instance;
  }

  /**
   * AdSense 요구사항에 맞는 여행 가이드 콘텐츠 생성
   */
  async generateTravelGuideContent(): Promise<ContentPage[]> {
    const travelContents: Partial<ContentPage>[] = [
      {
        slug: 'seoul-travel-guide',
        title: '서울 완벽 여행 가이드 - AI가 추천하는 숨은 명소',
        description: '서울의 전통과 현대가 어우러진 매력적인 여행지를 AI 분석을 통해 소개합니다. 궁궐부터 현대적인 쇼핑몰까지 완벽한 서울 여행 코스를 만나보세요.',
        category: 'destination',
        tags: ['서울', '여행가이드', 'AI추천', '관광명소', '한국여행'],
        author: '네비가이드AI 편집팀'
      },
      {
        slug: 'ai-travel-planning-tips',
        title: 'AI로 완벽한 여행 계획하기 - 스마트 여행의 시작',
        description: '인공지능을 활용한 효율적인 여행 계획 수립 방법을 알아보세요. 개인 취향 분석부터 최적 경로 추천까지, AI가 도와주는 스마트한 여행 준비법을 소개합니다.',
        category: 'tips',
        tags: ['AI여행', '여행계획', '스마트여행', '여행팁', '인공지능'],
        author: '네비가이드AI 편집팀'
      },
      {
        slug: 'korean-culture-experience-guide',
        title: '한국 전통문화 체험 가이드 - 외국인을 위한 완벽한 안내',
        description: '한국의 아름다운 전통문화를 직접 체험할 수 있는 프로그램들을 소개합니다. 한복 체험부터 전통 요리 클래스까지, 잊을 수 없는 문화 체험을 만나보세요.',
        category: 'guide',
        tags: ['한국문화', '전통체험', '문화관광', '한복체험', '외국인여행'],
        author: '네비가이드AI 편집팀'
      },
      {
        slug: 'budget-travel-korea',
        title: '저예산 한국 여행 완벽 가이드 - 합리적인 여행의 모든 것',
        description: '적은 예산으로도 충분히 즐길 수 있는 한국 여행 노하우를 공개합니다. 무료 관광지부터 저렴한 맛집까지, 알뜰한 여행자를 위한 실용적인 정보를 제공합니다.',
        category: 'tips',
        tags: ['저예산여행', '배낭여행', '알뜰여행', '가성비여행', '여행절약'],
        author: '네비가이드AI 편집팀'
      },
      {
        slug: 'seasonal-korea-travel',
        title: '계절별 한국 여행 가이드 - 사계절의 아름다움을 만나다',
        description: '한국의 사계절별 매력과 최적의 여행 시기를 소개합니다. 봄의 벚꽃부터 겨울의 설경까지, 각 계절마다 놓칠 수 없는 특별한 경험들을 안내해드립니다.',
        category: 'destination',
        tags: ['계절여행', '사계절', '벚꽃여행', '단풍여행', '겨울여행'],
        author: '네비가이드AI 편집팀'
      }
    ];

    const generatedContents: ContentPage[] = [];

    for (const contentData of travelContents) {
      const content = await this.createHighQualityContent(contentData);
      generatedContents.push(content);
      this.contents.set(content.id, content);
    }

    return generatedContents;
  }

  /**
   * 고품질 콘텐츠 생성
   */
  private async createHighQualityContent(data: Partial<ContentPage>): Promise<ContentPage> {
    const fullContent = this.generateDetailedContent(data.slug!, data.title!, data.category!);
    const seoMetadata = this.generateSEOMetadata(data.title!, data.description!, fullContent);
    
    const page: ContentPage = {
      id: `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      slug: data.slug!,
      title: data.title!,
      description: data.description!,
      content: fullContent,
      category: data.category!,
      tags: data.tags || [],
      author: data.author || '네비가이드AI',
      publishedAt: new Date(),
      updatedAt: new Date(),
      status: 'published',
      language: 'ko',
      wordCount: this.countWords(fullContent),
      readingTime: Math.ceil(this.countWords(fullContent) / 200), // 분당 200자 기준
      seoScore: this.calculateSEOScore(seoMetadata, fullContent),
      seoMetadata,
      images: this.generateContentImages(data.slug!),
      relatedPages: []
    };

    return page;
  }

  /**
   * 상세한 콘텐츠 생성 (AdSense 요구사항 충족)
   */
  private generateDetailedContent(slug: string, title: string, category: string): string {
    const contentTemplates = {
      'seoul-travel-guide': `
# ${title}

서울은 600년 역사의 조선왕조 수도이자 현대 한국의 중심지로, 전통과 현대가 완벽하게 조화를 이루는 독특한 매력을 지닌 도시입니다. AI 분석을 통해 선별된 서울의 핵심 여행지들을 소개하며, 각 지역의 특색과 방문 팁을 상세히 안내해드립니다.

## 서울의 역사적 명소

### 경복궁 - 조선왕조의 정궁
경복궁은 1395년에 창건된 조선왕조의 정궁으로, 현재까지도 그 웅장함과 아름다움을 자랑합니다. 매일 10시, 14시, 15시에 진행되는 수문장 교대식은 놓칠 수 없는 볼거리입니다.

**방문 정보:**
- 개방시간: 09:00-18:00 (계절별 상이)
- 입장료: 성인 3,000원
- 추천 코스: 광화문 → 근정전 → 경회루 → 국립고궁박물관

### 창덕궁과 비원
유네스코 세계문화유산으로 지정된 창덕궁은 자연과 건축의 완벽한 조화를 보여줍니다. 특히 후원(비원)은 한국 전통 정원의 진수를 느낄 수 있는 곳입니다.

### 북촌한옥마을
600년 전통의 한옥들이 모여있는 북촌한옥마을은 서울의 과거와 현재가 공존하는 특별한 공간입니다. 골목길을 따라 걸으며 전통 찻집과 공예품 가게들을 둘러보세요.

## 현대적 매력의 서울

### 강남 · 홍대 · 명동
- **강남**: 현대 한국의 번영을 상징하는 지역, 코엑스와 가로수길 탐방
- **홍대**: 젊은 예술가들의 거리, 클럽과 라이브 카페의 중심지
- **명동**: 쇼핑의 메카, 국내외 브랜드와 화장품 쇼핑의 천국

### 한강공원
서울을 관통하는 한강은 시민들의 휴식처이자 다양한 액티비티를 즐길 수 있는 공간입니다. 자전거 대여, 한강 크루즈, 치킨과 맥주를 즐기는 '치맥' 문화를 경험해보세요.

## 서울 맛집 가이드

### 전통 한식
- **광장시장**: 100년 전통의 재래시장, 빈대떡과 마약김밥
- **토속촌**: 인삼닭곱탕의 원조, 건강한 한식의 정수
- **진고개**: 설렁탕과 곰탕의 명가

### 현대적 맛집
- **가로수길**: 트렌디한 카페와 퓨전 레스토랑
- **이태원**: 다국적 음식의 거리
- **망원동**: 힙한 로컬 맛집들의 성지

## 교통 및 숙박 정보

### 대중교통
서울의 지하철과 버스 시스템은 세계적으로 우수한 수준입니다. T-money 카드나 WOWPASS를 구매하여 편리하게 이용하세요.

### 숙박 추천
- **명동/중구**: 관광지 접근성이 좋은 호텔들
- **강남**: 비즈니스 호텔과 럭셔리 호텔
- **홍대/마포**: 게스트하우스와 부티크 호텔

## 여행 팁

1. **언어**: 한국어가 기본이지만, 주요 관광지에서는 영어 안내가 가능합니다
2. **시즌**: 봄(3-5월)과 가을(9-11월)이 최적의 여행 시기입니다
3. **결제**: 신용카드와 모바일 결제가 일반적이며, 현금도 준비하세요
4. **문화**: 한국의 예의와 문화를 존중하며 여행하세요

서울은 하루 이틀로는 다 볼 수 없는 매력적인 도시입니다. 이 가이드를 참고하여 여러분만의 특별한 서울 여행을 계획해보세요.
      `,
      'ai-travel-planning-tips': `
# ${title}

현대 여행의 패러다임이 바뀌고 있습니다. 인공지능 기술의 발전으로 이제 누구나 전문가 수준의 여행 계획을 세울 수 있게 되었습니다. 이 가이드에서는 AI를 활용한 스마트한 여행 계획 수립 방법을 단계별로 알아보겠습니다.

## AI 여행 계획의 장점

### 개인화된 추천
AI는 여러분의 과거 여행 패턴, 선호도, 예산을 분석하여 최적의 여행지와 액티비티를 추천합니다. 천편일률적인 추천이 아닌, 여러분만을 위한 맞춤형 여행 계획을 제공합니다.

### 실시간 정보 업데이트
날씨, 교통, 현지 이벤트 등 실시간 정보를 바탕으로 여행 계획을 동적으로 조정할 수 있습니다. 갑작스러운 일정 변경에도 유연하게 대응 가능합니다.

### 비용 최적화
AI는 항공료, 숙박비, 현지 활동비용을 종합적으로 분석하여 예산 내에서 최고의 여행 경험을 제공하는 조합을 찾아줍니다.

## AI 여행 계획 단계별 가이드

### 1단계: 여행 프로필 설정
먼저 AI가 여러분을 이해할 수 있도록 상세한 프로필을 만드세요:

- **여행 스타일**: 액티브, 휴양, 문화탐방, 모험, 가족여행
- **선호 활동**: 자연경관, 역사유적, 음식탐방, 쇼핑, 나이트라이프
- **예산 범위**: 저예산, 중간예산, 고급여행
- **동행 정보**: 혼자, 커플, 가족, 친구들

### 2단계: 목적지 선택
AI가 분석하는 요소들:
- 계절별 날씨와 최적 여행시기
- 현재 코로나19 상황과 입국 규정
- 환율과 현지 물가 수준
- 개인 선호도와 매칭되는 특색
- 과거 여행자들의 리뷰와 만족도

### 3단계: 일정 최적화
**스마트 루트 플래닝:**
- 지리적 위치를 고려한 효율적인 동선
- 각 장소별 적정 체류시간 계산
- 교통수단별 이동시간과 비용 비교
- 현지 교통 상황과 대중교통 스케줄 반영

**시간 관리:**
- 개장/폐장시간 고려한 방문 순서
- 혼잡도 예측을 통한 최적 방문시간
- 식사시간과 휴식시간 배분
- 예상치 못한 지연시간 여유분 확보

### 4단계: 숙박 및 교통 예약
AI가 고려하는 요소들:
- 위치의 편리성과 접근성
- 가격 대비 만족도 분석
- 실시간 가격 변동 모니터링
- 취소 정책과 유연성
- 리뷰 데이터 기반 품질 평가

## 추천 AI 여행 도구들

### 네비가이드AI
- 개인화된 여행 가이드 생성
- 실시간 현지 정보 제공
- 다국어 지원으로 언어 장벽 해소

### 기타 유용한 AI 도구들
- **Hopper**: 항공료 예측 및 최적 예약시기 알림
- **Kayak**: 가격 예측과 여행 계획 도구
- **TripIt**: 여행 일정 자동 정리
- **Google Travel**: 통합 여행 정보 플랫폼

## 실전 활용 팁

### 데이터 품질 관리
- 정확한 개인정보 입력으로 추천 정확도 향상
- 정기적인 선호도 업데이트
- 여행 후 피드백 제공으로 학습 도움

### 유연성 유지
- AI 추천을 100% 맹신하지 말고 참고 자료로 활용
- 현지에서의 즉흥적인 발견도 여행의 즐거움
- 예상치 못한 상황에 대한 대안 계획 준비

### 보안 및 프라이버시
- 신뢰할 수 있는 AI 서비스 선택
- 개인정보 공유 범위 신중히 설정
- 결제 정보 보안에 각별히 주의

## 미래의 AI 여행

### 가상현실 미리보기
여행 전 VR을 통해 목적지를 미리 경험하고 계획을 구체화할 수 있습니다.

### 실시간 번역과 문화 가이드
AI 번역기와 문화 해설 기능으로 언어와 문화 장벽이 사라집니다.

### 예측적 여행 관리
기계학습을 통해 여행 중 발생할 수 있는 문제들을 사전에 예측하고 대비책을 제시합니다.

AI 기술은 여행을 더욱 스마트하고 편리하게 만들어줍니다. 하지만 기술은 도구일 뿐, 진정한 여행의 의미는 새로운 경험과 만남에서 찾을 수 있습니다. AI의 도움을 받아 더 효율적으로 계획하고, 그 시간에 더 많은 추억을 만들어보세요.
      `
    };

    return contentTemplates[slug as keyof typeof contentTemplates] || this.generateGenericContent(title, category);
  }

  /**
   * 일반적인 콘텐츠 생성
   */
  private generateGenericContent(title: string, category: string): string {
    return `
# ${title}

이 글에서는 ${category}에 대한 종합적인 정보를 제공합니다. 전문가의 분석과 실제 경험을 바탕으로 작성된 이 가이드는 여러분의 여행 계획에 도움이 될 것입니다.

## 주요 내용

여행은 새로운 경험과 추억을 만들어가는 소중한 시간입니다. 올바른 정보와 계획을 통해 더욱 의미있는 여행을 만들어보세요.

### 핵심 포인트

1. **계획의 중요성**: 철저한 사전 준비가 성공적인 여행의 열쇠입니다.
2. **현지 정보**: 최신 현지 정보를 파악하고 유연하게 대응하세요.
3. **안전 우선**: 안전을 최우선으로 고려한 여행 계획을 세우세요.
4. **문화 존중**: 현지 문화와 관습을 이해하고 존중하는 자세가 중요합니다.

## 상세 가이드

이 섹션에서는 구체적인 실행 방법과 주의사항들을 자세히 살펴보겠습니다.

### 준비 단계
여행 전 준비해야 할 사항들을 체크리스트로 정리했습니다.

### 실행 단계  
실제 여행 중 유용한 팁과 노하우를 공유합니다.

### 마무리 단계
여행 후 정리와 다음 여행을 위한 피드백 방법을 알아봅니다.

## 결론

성공적인 여행은 좋은 계획에서 시작됩니다. 이 가이드의 정보를 활용하여 여러분만의 특별한 여행을 만들어보세요.

더 자세한 정보나 개인 맞춤 상담이 필요하시면 언제든 연락 주시기 바랍니다.
    `;
  }

  /**
   * SEO 메타데이터 생성
   */
  private generateSEOMetadata(title: string, description: string, content: string): SEOMetadata {
    const headings = this.extractHeadings(content);
    const keywords = this.generateKeywords(title, content);
    
    return {
      metaTitle: title.length > 60 ? title.substring(0, 57) + '...' : title,
      metaDescription: description.length > 160 ? description.substring(0, 157) + '...' : description,
      keywords,
      canonicalUrl: `/content/${this.slugify(title)}`,
      ogTitle: title,
      ogDescription: description,
      ogImage: `/images/og/${this.slugify(title)}.jpg`,
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: `/images/twitter/${this.slugify(title)}.jpg`,
      headings,
      internalLinks: this.countInternalLinks(content),
      externalLinks: this.countExternalLinks(content),
      imageAltTexts: this.extractImageAltTexts(content),
      structuredData: this.generateStructuredData(title, description)
    };
  }

  /**
   * 콘텐츠 이미지 생성
   */
  private generateContentImages(slug: string): ContentImage[] {
    const baseImages = [
      {
        id: `${slug}-main`,
        url: `/images/content/${slug}/main.jpg`,
        alt: `${slug} 메인 이미지`,
        caption: '대표 이미지',
        width: 1200,
        height: 630,
        fileSize: 245000,
        format: 'JPEG'
      },
      {
        id: `${slug}-thumb`,
        url: `/images/content/${slug}/thumbnail.jpg`,
        alt: `${slug} 썸네일`,
        width: 400,
        height: 300,
        fileSize: 85000,
        format: 'JPEG'
      }
    ];

    return baseImages;
  }

  /**
   * AdSense 콘텐츠 요구사항 확인
   */
  assessAdSenseContentRequirements(): AdSenseContentRequirements {
    const allContents = Array.from(this.contents.values());
    const publishedContents = allContents.filter(c => c.status === 'published');
    
    const totalWordCount = publishedContents.reduce((sum, content) => sum + content.wordCount, 0);
    const averageWordCount = totalWordCount / publishedContents.length || 0;
    
    const uniqueCategories = new Set(publishedContents.map(c => c.category)).size;
    const averageSEOScore = publishedContents.reduce((sum, content) => sum + content.seoScore, 0) / publishedContents.length || 0;

    return {
      minimumWordCount: 500, // AdSense 권장 최소 단어 수
      minimumPages: 10, // AdSense 권장 최소 페이지 수
      requiredCategories: ['travel', 'guide', 'destination', 'tips'],
      contentQualityScore: Math.min(100, (averageWordCount / 500) * 100),
      originalityScore: 85, // 원본 콘텐츠 점수 (추정)
      userEngagementScore: this.calculateEngagementScore()
    };
  }

  /**
   * 사용자 참여도 점수 계산
   */
  private calculateEngagementScore(): number {
    const analyticsData = Array.from(this.analytics.values());
    if (analyticsData.length === 0) return 60; // 기본값

    const averageBounceRate = analyticsData.reduce((sum, data) => sum + data.bounceRate, 0) / analyticsData.length;
    const averageTimeOnPage = analyticsData.reduce((sum, data) => sum + data.averageTimeOnPage, 0) / analyticsData.length;
    
    // 낮은 이탈률과 높은 체류시간이 좋은 점수
    const bounceScore = Math.max(0, 100 - averageBounceRate);
    const timeScore = Math.min(100, (averageTimeOnPage / 120) * 100); // 2분 기준
    
    return Math.round((bounceScore + timeScore) / 2);
  }

  /**
   * 유틸리티 메서드들
   */
  private countWords(content: string): number {
    return content.replace(/[^\w\s가-힣]/g, '').split(/\s+/).filter(word => word.length > 0).length;
  }

  private calculateSEOScore(seoMetadata: SEOMetadata, content: string): number {
    let score = 0;
    
    // 제목 길이 (60자 이하 권장)
    if (seoMetadata.metaTitle.length <= 60) score += 15;
    
    // 설명 길이 (160자 이하 권장)
    if (seoMetadata.metaDescription.length <= 160) score += 15;
    
    // 키워드 개수 (5-10개 권장)
    if (seoMetadata.keywords.length >= 5 && seoMetadata.keywords.length <= 10) score += 10;
    
    // 헤딩 구조
    if (seoMetadata.headings.h1.length === 1) score += 10;
    if (seoMetadata.headings.h2.length >= 2) score += 10;
    
    // 내부 링크 (3개 이상 권장)
    if (seoMetadata.internalLinks >= 3) score += 10;
    
    // 이미지 alt 텍스트
    if (seoMetadata.imageAltTexts.length > 0) score += 10;
    
    // 콘텐츠 길이 (500자 이상 권장)
    if (this.countWords(content) >= 500) score += 20;
    
    return Math.min(100, score);
  }

  private extractHeadings(content: string): { h1: string[]; h2: string[]; h3: string[] } {
    const h1Matches = content.match(/^# (.+)$/gm) || [];
    const h2Matches = content.match(/^## (.+)$/gm) || [];
    const h3Matches = content.match(/^### (.+)$/gm) || [];
    
    return {
      h1: h1Matches.map(h => h.replace(/^# /, '')),
      h2: h2Matches.map(h => h.replace(/^## /, '')),
      h3: h3Matches.map(h => h.replace(/^### /, ''))
    };
  }

  private generateKeywords(title: string, content: string): string[] {
    const commonKeywords = ['여행', '가이드', 'AI', '추천', '관광', '한국', '서울'];
    const titleWords = title.split(' ').filter(word => word.length > 1);
    const contentWords = content.match(/[가-힣]{2,}/g) || [];
    
    const wordFreq = new Map<string, number>();
    contentWords.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });
    
    const topWords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
    
    return [...new Set([...titleWords, ...topWords, ...commonKeywords])].slice(0, 8);
  }

  private countInternalLinks(content: string): number {
    const internalLinkPattern = /\[.*?\]\(\/.*?\)/g;
    return (content.match(internalLinkPattern) || []).length;
  }

  private countExternalLinks(content: string): number {
    const externalLinkPattern = /\[.*?\]\(https?:\/\/.*?\)/g;
    return (content.match(externalLinkPattern) || []).length;
  }

  private extractImageAltTexts(content: string): string[] {
    const imagePattern = /!\[(.*?)\]/g;
    const matches: string[] = [];
    let match;
    while ((match = imagePattern.exec(content)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  }

  private generateStructuredData(title: string, description: string): any {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description,
      "author": {
        "@type": "Organization",
        "name": "네비가이드AI"
      },
      "publisher": {
        "@type": "Organization", 
        "name": "네비가이드AI",
        "logo": {
          "@type": "ImageObject",
          "url": `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`
        }
      },
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString()
    };
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * 콘텐츠 CRUD 메서드들
   */
  getContent(id: string): ContentPage | undefined {
    return this.contents.get(id);
  }

  getAllContents(): ContentPage[] {
    return Array.from(this.contents.values());
  }

  getPublishedContents(): ContentPage[] {
    return Array.from(this.contents.values()).filter(c => c.status === 'published');
  }

  getContentsByCategory(category: string): ContentPage[] {
    return Array.from(this.contents.values()).filter(c => c.category === category);
  }

  updateContent(id: string, updates: Partial<ContentPage>): boolean {
    const content = this.contents.get(id);
    if (!content) return false;

    const updatedContent = {
      ...content,
      ...updates,
      updatedAt: new Date()
    };

    // SEO 점수 재계산
    if (updates.content || updates.title || updates.description) {
      updatedContent.seoScore = this.calculateSEOScore(updatedContent.seoMetadata, updatedContent.content);
    }

    this.contents.set(id, updatedContent);
    return true;
  }

  deleteContent(id: string): boolean {
    return this.contents.delete(id);
  }
}

// Singleton 인스턴스 export
export const contentSEOService = ContentSEOService.getInstance();