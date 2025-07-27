/**
 * Sellers.json Management Service
 * Google sellers.json 파일 관리 및 비즈니스 정보 공개 상태 설정
 */

export interface SellersJsonEntry {
  seller_id: string;
  seller_type: 'PUBLISHER' | 'INTERMEDIARY' | 'BOTH';
  name?: string;
  domain?: string;
  comment?: string;
  is_confidential?: 0 | 1;
}

export interface BusinessDisclosureConfig {
  publicDisclosure: boolean;
  businessName: string;
  verifiedDomain: string;
  contactEmail: string;
  businessAddress?: string;
  publisherType: 'content' | 'search' | 'both';
}

/**
 * Google sellers.json 파일 관리 서비스
 */
export class SellersJsonService {
  private static instance: SellersJsonService;
  private businessConfig: BusinessDisclosureConfig;

  static getInstance(): SellersJsonService {
    if (!this.instance) {
      this.instance = new SellersJsonService();
    }
    return this.instance;
  }

  constructor() {
    this.businessConfig = {
      publicDisclosure: false, // 기본값: 내부용
      businessName: '네비가이드AI',
      verifiedDomain: 'navi-guide-ai-eight.vercel.app',
      contactEmail: 'contact@naviguide.ai',
      businessAddress: '서울특별시 강남구',
      publisherType: 'content'
    };
  }

  /**
   * 비즈니스 공개 상태 설정
   */
  setBusinessDisclosure(config: Partial<BusinessDisclosureConfig>): void {
    this.businessConfig = {
      ...this.businessConfig,
      ...config
    };
  }

  /**
   * sellers.json 엔트리 생성
   */
  generateSellersJsonEntry(): SellersJsonEntry {
    const publisherId = process.env.ADSENSE_PUBLISHER_ID || 'pub-8225961966676319';
    
    const entry: SellersJsonEntry = {
      seller_id: publisherId,
      seller_type: 'PUBLISHER',
      is_confidential: this.businessConfig.publicDisclosure ? 0 : 1
    };

    // 공개 설정일 경우 추가 정보 포함
    if (this.businessConfig.publicDisclosure) {
      entry.name = this.businessConfig.businessName;
      entry.domain = this.businessConfig.verifiedDomain;
      entry.comment = `${this.businessConfig.publisherType} publisher - Timezone: (UTC+09:00) Seoul`;
    }

    return entry;
  }

  /**
   * Google sellers.json 파일 구조 생성
   */
  generateSellersJson(): {
    contact_email: string;
    contact_address?: string;
    version: string;
    sellers: SellersJsonEntry[];
  } {
    return {
      contact_email: this.businessConfig.contactEmail,
      contact_address: this.businessConfig.businessAddress,
      version: '1.0',
      sellers: [this.generateSellersJsonEntry()]
    };
  }

  /**
   * AdSense 계정 상태 정보
   */
  getAccountStatus(): {
    publisherId: string;
    customerId: string;
    timezone: string;
    products: string[];
    accountStatus: string;
    disclosureStatus: 'internal' | 'public';
  } {
    return {
      publisherId: process.env.ADSENSE_PUBLISHER_ID || 'pub-8225961966676319',
      customerId: process.env.GOOGLE_ADSENSE_CUSTOMER_ID || '2434557208',
      timezone: '(UTC+09:00) Seoul',
      products: ['search', 'content'],
      accountStatus: 'active',
      disclosureStatus: this.businessConfig.publicDisclosure ? 'public' : 'internal'
    };
  }

  /**
   * 공개 상태 토글
   */
  toggleDisclosureStatus(): void {
    this.businessConfig.publicDisclosure = !this.businessConfig.publicDisclosure;
  }

  /**
   * 비즈니스 정보 검증
   */
  validateBusinessInfo(): {
    isValid: boolean;
    missingFields: string[];
    recommendations: string[];
  } {
    const missingFields: string[] = [];
    const recommendations: string[] = [];

    if (!this.businessConfig.businessName) {
      missingFields.push('businessName');
    }

    if (!this.businessConfig.verifiedDomain) {
      missingFields.push('verifiedDomain');
    }

    if (!this.businessConfig.contactEmail) {
      missingFields.push('contactEmail');
    }

    if (this.businessConfig.publicDisclosure) {
      recommendations.push('공개 설정 시 비즈니스 이름과 도메인이 Google sellers.json에 표시됩니다');
      recommendations.push('도메인 소유권 확인을 완료하세요');
      recommendations.push('정확한 연락처 정보를 제공하세요');
    } else {
      recommendations.push('내부용 설정으로 비즈니스 정보가 비공개됩니다');
      recommendations.push('필요시 언제든 공개 상태로 변경할 수 있습니다');
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
      recommendations
    };
  }

  /**
   * AdSense 정책 준수 상태 체크
   */
  checkAdSenseCompliance(): {
    adsTxtValid: boolean;
    sellersJsonReady: boolean;
    businessInfoComplete: boolean;
    overallCompliance: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let complianceScore = 0;

    // ads.txt 검증
    const publisherId = process.env.ADSENSE_PUBLISHER_ID;
    const adsTxtValid = !!publisherId && publisherId.startsWith('pub-');
    if (adsTxtValid) {
      complianceScore += 40;
    } else {
      issues.push('ads.txt 파일에 유효한 Publisher ID가 필요합니다');
    }

    // sellers.json 준비 상태
    const businessValidation = this.validateBusinessInfo();
    const sellersJsonReady = businessValidation.isValid;
    if (sellersJsonReady) {
      complianceScore += 30;
    } else {
      issues.push('sellers.json을 위한 비즈니스 정보가 불완전합니다');
    }

    // 비즈니스 정보 완성도
    const businessInfoComplete = !!(
      this.businessConfig.businessName &&
      this.businessConfig.contactEmail &&
      this.businessConfig.verifiedDomain
    );
    if (businessInfoComplete) {
      complianceScore += 30;
    } else {
      issues.push('비즈니스 정보를 완성해주세요');
    }

    return {
      adsTxtValid,
      sellersJsonReady,
      businessInfoComplete,
      overallCompliance: complianceScore,
      issues
    };
  }

  /**
   * 현재 설정 정보 조회
   */
  getCurrentConfig(): BusinessDisclosureConfig {
    return { ...this.businessConfig };
  }
}

// Singleton 인스턴스 export
export const sellersJsonService = SellersJsonService.getInstance();