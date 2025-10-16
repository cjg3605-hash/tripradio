/**
 * Legal Pages Service
 * AdSense 승인을 위한 필수 법적 페이지 관리 마이크로서비스
 */

export interface LegalPageContent {
  id: string;
  type: 'privacy' | 'terms' | 'about' | 'contact' | 'disclaimer' | 'ads-revenue';
  title: string;
  content: string;
  lastUpdated: Date;
  version: string;
  language: string;
  isPublished: boolean;
  seoMetadata: {
    description: string;
    keywords: string[];
    canonicalUrl: string;
  };
}

export interface ContactInformation {
  serviceName: string;
  serviceAddress?: {
    city: string;
    state: string;
    country: string;
  };
  email: string;
  phone?: string;
  developerName: string;
}

export interface AdSenseComplianceMetrics {
  hasPrivacyPolicy: boolean;
  hasTermsOfService: boolean;
  hasAboutPage: boolean;
  hasContactInfo: boolean;
  hasValidServiceInfo: boolean;
  lastComplianceCheck: Date;
  complianceScore: number; // 0-100
  missingElements: string[];
}

/**
 * AdSense 정책 준수를 위한 법적 페이지 관리 서비스
 */
export class LegalPagesService {
  private static instance: LegalPagesService;
  private contactInfo: ContactInformation = {
    serviceName: 'TripRadio',
    developerName: 'TripRadio Developer',
    serviceAddress: {
      city: '서울',
      state: '서울시',
      country: '대한민국'
    },
    email: 'contact@navidocent.com'
  };
  private pages = new Map<string, LegalPageContent>();

  static getInstance(): LegalPagesService {
    if (!this.instance) {
      this.instance = new LegalPagesService();
    }
    return this.instance;
  }

  /**
   * 개인정보처리방침 생성 (AdSense 정책 준수)
   */
  generatePrivacyPolicy(language: string = 'ko'): LegalPageContent {
    const privacyContent = this.buildPrivacyPolicyContent(language);
    
    const page: LegalPageContent = {
      id: `privacy-${language}`,
      type: 'privacy',
      title: language === 'ko' ? '개인정보처리방침' : 'Privacy Policy',
      content: privacyContent,
      lastUpdated: new Date(),
      version: '1.0.0',
      language,
      isPublished: true,
      seoMetadata: {
        description: language === 'ko' 
          ? 'TripRadio 개인정보처리방침 - 사용자 데이터 보호 및 처리 방침'
          : 'TripRadio Privacy Policy - User data protection and processing policy',
        keywords: ['privacy policy', 'data protection', '개인정보보호', 'GDPR', 'user privacy'],
        canonicalUrl: `/legal/privacy`
      }
    };

    this.pages.set(page.id, page);
    return page;
  }

  /**
   * 이용약관 생성 (AdSense 정책 준수)
   */
  generateTermsOfService(language: string = 'ko'): LegalPageContent {
    const termsContent = this.buildTermsOfServiceContent(language);
    
    const page: LegalPageContent = {
      id: `terms-${language}`,
      type: 'terms',
      title: language === 'ko' ? '이용약관' : 'Terms of Service',
      content: termsContent,
      lastUpdated: new Date(),
      version: '1.0.0',
      language,
      isPublished: true,
      seoMetadata: {
        description: language === 'ko'
          ? 'TripRadio 이용약관 - 서비스 이용 조건 및 사용자 권리'
          : 'TripRadio Terms of Service - Service usage conditions and user rights',
        keywords: ['terms of service', 'user agreement', '이용약관', 'service terms'],
        canonicalUrl: `/legal/terms`
      }
    };

    this.pages.set(page.id, page);
    return page;
  }

  /**
   * 회사 소개 페이지 생성 (AdSense 신뢰성 요구사항)
   */
  generateAboutPage(language: string = 'ko'): LegalPageContent {
    const aboutContent = this.buildAboutPageContent(language);
    
    const page: LegalPageContent = {
      id: `about-${language}`,
      type: 'about',
      title: language === 'ko' ? '서비스 소개' : 'About Us',
      content: aboutContent,
      lastUpdated: new Date(),
      version: '1.0.0',
      language,
      isPublished: true,
      seoMetadata: {
        description: language === 'ko'
          ? 'TripRadio 소개 - AI 기반 여행 도슨트 서비스'
          : 'About TripRadio - AI-powered travel docent service',
        keywords: ['about us', 'service', 'AI travel', '서비스소개', 'travel technology'],
        canonicalUrl: `/about`
      }
    };

    this.pages.set(page.id, page);
    return page;
  }

  /**
   * 연락처 페이지 생성 (AdSense 투명성 요구사항)
   */
  generateContactPage(language: string = 'ko'): LegalPageContent {
    const contactContent = this.buildContactPageContent(language);
    
    const page: LegalPageContent = {
      id: `contact-${language}`,
      type: 'contact',
      title: language === 'ko' ? '연락처' : 'Contact Us',
      content: contactContent,
      lastUpdated: new Date(),
      version: '1.0.0',
      language,
      isPublished: true,
      seoMetadata: {
        description: language === 'ko'
          ? '트립라디오AI 연락처 - 고객지원 및 비즈니스 문의'
          : 'Contact TripRadio AI - Customer support and business inquiries',
        keywords: ['contact', 'customer support', '연락처', 'business inquiry'],
        canonicalUrl: `/contact`
      }
    };

    this.pages.set(page.id, page);
    return page;
  }

  /**
   * 광고 수익 공지 페이지 생성 (AdSense 투명성 요구사항)
   */
  generateAdsRevenuePage(language: string = 'ko'): LegalPageContent {
    const adsRevenueContent = this.buildAdsRevenuePageContent(language);
    
    const page: LegalPageContent = {
      id: `ads-revenue-${language}`,
      type: 'ads-revenue',
      title: language === 'ko' ? '광고 수익 공지' : 'Ad Revenue Notice',
      content: adsRevenueContent,
      lastUpdated: new Date(),
      version: '1.0.0',
      language,
      isPublished: true,
      seoMetadata: {
        description: language === 'ko'
          ? '트립라디오AI 광고 수익 정책 - AdSense 및 광고 파트너십 투명성 공지'
          : 'TripRadio AI Ad Revenue Policy - AdSense and advertising partnership transparency notice',
        keywords: ['ad revenue', 'adsense', 'advertising policy', '광고수익', '애드센스', '광고정책'],
        canonicalUrl: `/legal/ads-revenue`
      }
    };

    this.pages.set(page.id, page);
    return page;
  }

  /**
   * AdSense 정책 준수 상태 평가
   */
  assessAdSenseCompliance(): AdSenseComplianceMetrics {
    const hasPrivacyPolicy = this.pages.has('privacy-ko') || this.pages.has('privacy-en');
    const hasTermsOfService = this.pages.has('terms-ko') || this.pages.has('terms-en');
    const hasAboutPage = this.pages.has('about-ko') || this.pages.has('about-en');
    const hasContactInfo = this.pages.has('contact-ko') || this.pages.has('contact-en');
    const hasValidServiceInfo = this.contactInfo && this.contactInfo.email && this.contactInfo.serviceName;

    const missingElements: string[] = [];
    if (!hasPrivacyPolicy) missingElements.push('Privacy Policy');
    if (!hasTermsOfService) missingElements.push('Terms of Service');
    if (!hasAboutPage) missingElements.push('About Us Page');
    if (!hasContactInfo) missingElements.push('Contact Information');
    if (!hasValidServiceInfo) missingElements.push('Valid Service Information');

    const complianceScore = Math.round(
      ((hasPrivacyPolicy ? 25 : 0) +
       (hasTermsOfService ? 25 : 0) +
       (hasAboutPage ? 20 : 0) +
       (hasContactInfo ? 15 : 0) +
       (hasValidServiceInfo ? 15 : 0))
    );

    return {
      hasPrivacyPolicy,
      hasTermsOfService,
      hasAboutPage,
      hasContactInfo,
      hasValidServiceInfo: !!hasValidServiceInfo,
      lastComplianceCheck: new Date(),
      complianceScore,
      missingElements
    };
  }

  /**
   * 연락처 정보 설정
   */
  setContactInformation(contactInfo: ContactInformation): void {
    this.contactInfo = contactInfo;
  }

  /**
   * 모든 법적 페이지 일괄 생성
   */
  generateAllLegalPages(languages: string[] = ['ko', 'en']): LegalPageContent[] {
    const pages: LegalPageContent[] = [];
    
    languages.forEach(lang => {
      pages.push(this.generatePrivacyPolicy(lang));
      pages.push(this.generateTermsOfService(lang));
      pages.push(this.generateAboutPage(lang));
      pages.push(this.generateContactPage(lang));
      pages.push(this.generateAdsRevenuePage(lang));
    });

    return pages;
  }

  /**
   * 개인정보처리방침 내용 구축
   */
  private buildPrivacyPolicyContent(language: string): string {
    if (language === 'ko') {
      return `
# 개인정보처리방침

**최종 업데이트: ${new Date().toLocaleDateString('ko-KR')}**

## 1. 개인정보의 처리목적

트립라디오AI("회사" 또는 "저희")는 다음의 목적을 위하여 개인정보를 처리하고 있으며, 다음의 목적 이외의 용도로는 이용하지 않습니다.

- AI 기반 여행 가이드 서비스 제공
- 개인화된 여행 추천 서비스
- 고객 지원 및 서비스 개선
- 서비스 이용 통계 분석
- 법적 의무 이행

## 2. 개인정보의 처리 및 보유기간

회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.

## 3. 정보주체의 권리·의무 및 행사방법

정보주체는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다:
- 개인정보 처리정지 요구권
- 개인정보 열람요구권
- 개인정보 정정·삭제요구권
- 개인정보 처리정지 요구권

## 4. 처리하는 개인정보 항목

회사는 다음의 개인정보 항목을 처리하고 있습니다:
- 필수항목: 이메일 주소, 서비스 이용 기록
- 선택항목: 프로필 정보, 여행 선호도

## 5. 개인정보의 파기

회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.

## 6. 개인정보의 안전성 확보조치

회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
- 관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육
- 기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치
- 물리적 조치: 전산실, 자료보관실 등의 접근통제

## 7. 개인정보보호책임자

회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보보호책임자를 지정하고 있습니다.

**개인정보보호책임자**
- 연락처: ${this.contactInfo?.email || 'contact@navidocent.com'}

## 8. 개인정보 처리방침 변경

이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.

## 9. Google AdSense 및 광고 정책

본 웹사이트는 Google AdSense를 사용하여 광고를 게재합니다:
- Google과 제3자 공급업체는 쿠키를 사용하여 광고를 게재합니다
- 사용자는 Google 광고 설정에서 맞춤 광고를 사용 중지할 수 있습니다
- 제3자 공급업체의 쿠키 사용에 대한 자세한 내용은 Google의 개인정보보호정책을 참조하세요

본 방침은 ${new Date().toLocaleDateString('ko-KR')}부터 시행됩니다.
      `;
    } else {
      return `
# Privacy Policy

**Last Updated: ${new Date().toLocaleDateString('en-US')}**

## 1. Information We Collect

NaviGuide AI ("Company," "we," or "us") collects information you provide directly to us, such as when you create an account, use our services, or contact us for support.

## 2. How We Use Your Information

We use the information we collect to:
- Provide and maintain our AI travel guide services
- Personalize your travel recommendations
- Improve our services and user experience
- Communicate with you about our services
- Comply with legal obligations

## 3. Information Sharing and Disclosure

We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.

## 4. Data Security

We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

## 5. Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate information
- Delete your personal information
- Object to processing of your personal information

## 6. Google AdSense and Advertising

This website uses Google AdSense to serve advertisements:
- Google and third-party vendors use cookies to serve ads
- Users may opt out of personalized advertising by visiting Google Ad Settings
- For more information about third-party vendor cookie usage, please visit Google's Privacy Policy

## 7. Contact Us

If you have any questions about this Privacy Policy, please contact us at:
Email: ${this.contactInfo?.email || 'contact@navidocent.com'}

This policy is effective as of ${new Date().toLocaleDateString('en-US')}.
      `;
    }
  }

  /**
   * 이용약관 내용 구축
   */
  private buildTermsOfServiceContent(language: string): string {
    if (language === 'ko') {
      return `
# 이용약관

**최종 업데이트: ${new Date().toLocaleDateString('ko-KR')}**

## 1. 서비스 소개

트립라디오AI는 인공지능 기반 여행 가이드 서비스를 제공합니다. 본 약관은 서비스 이용과 관련된 권리, 의무 및 책임사항을 규정합니다.

## 2. 서비스 이용계약

### 2.1 계약의 성립
- 이용자가 본 약관에 동의하고 서비스를 이용하는 시점에 계약이 성립됩니다.

### 2.2 서비스 제공
- AI 기반 맞춤형 여행 가이드 생성
- 실시간 여행 정보 및 추천
- 다국어 지원 서비스
- 오프라인 가이드 다운로드

## 3. 이용자의 의무

### 3.1 금지행위
이용자는 다음 행위를 해서는 안됩니다:
- 서비스의 안정성을 해치는 행위
- 다른 이용자에게 피해를 주는 행위
- 불법적이거나 부적절한 목적으로의 서비스 이용
- 지적재산권 침해 행위

## 4. 서비스의 제공 및 변경

회사는 서비스의 품질 향상 및 기술적 이유로 서비스 내용을 변경할 수 있으며, 중요한 변경사항은 사전에 공지합니다.

## 5. 개인정보보호

개인정보의 보호 및 사용에 대해서는 관련 법령 및 회사의 개인정보처리방침이 적용됩니다.

## 6. 책임제한

### 6.1 회사의 책임제한
- 천재지변, 시스템 장애 등 불가항력으로 인한 서비스 중단
- 이용자의 귀책사유로 인한 서비스 이용 장애
- 제3자가 제공하는 정보의 정확성

### 6.2 면책사항
회사는 다음의 경우 책임을 지지 않습니다:
- 이용자 간 또는 이용자와 제3자 간의 분쟁
- 서비스 이용으로 얻은 정보로 인한 손해

## 7. 분쟁해결

본 약관에 관한 분쟁은 대한민국 법률에 따라 해결되며, 관할법원은 서울중앙지방법원으로 합니다.

## 8. 광고 및 수익화 정책

### 8.1 Google AdSense
- 본 서비스는 Google AdSense를 통해 광고를 게재합니다
- 광고 수익은 서비스 운영 및 개선에 사용됩니다
- 이용자는 광고 설정을 통해 맞춤형 광고를 제어할 수 있습니다

## 9. 기타

본 약관에서 정하지 아니한 사항과 본 약관의 해석에 관하여는 관련 법령 또는 상관례에 따릅니다.

**시행일: ${new Date().toLocaleDateString('ko-KR')}**
      `;
    } else {
      return `
# Terms of Service

**Last Updated: ${new Date().toLocaleDateString('en-US')}**

## 1. Service Description

NaviGuide AI provides AI-powered travel guide services. These terms govern your use of our services.

## 2. Service Agreement

### 2.1 Agreement Formation
The agreement is formed when you accept these terms and begin using our services.

### 2.2 Services Provided
- AI-powered personalized travel guide generation
- Real-time travel information and recommendations
- Multi-language support
- Offline guide downloads

## 3. User Obligations

### 3.1 Prohibited Activities
Users must not:
- Engage in activities that harm service stability
- Harm other users
- Use services for illegal or inappropriate purposes
- Infringe intellectual property rights

## 4. Service Provision and Changes

We may modify our services for quality improvement and technical reasons. Important changes will be notified in advance.

## 5. Privacy Protection

The protection and use of personal information is governed by applicable laws and our Privacy Policy.

## 6. Limitation of Liability

### 6.1 Company Liability Limitation
We are not liable for:
- Service interruptions due to force majeure or system failures
- Service disruptions caused by user actions
- Accuracy of third-party information

## 7. Dispute Resolution

Disputes related to these terms will be resolved under Korean law, with Seoul Central District Court as the governing jurisdiction.

## 8. Advertising and Monetization Policy

### 8.1 Google AdSense
- Our service displays advertisements through Google AdSense
- Ad revenue is used for service operation and improvement
- Users can control personalized advertising through ad settings

## 9. Miscellaneous

Matters not specified in these terms will be governed by applicable laws and customs.

**Effective Date: ${new Date().toLocaleDateString('en-US')}**
      `;
    }
  }

  /**
   * 회사 소개 페이지 내용 구축
   */
  private buildAboutPageContent(language: string): string {
    if (language === 'ko') {
      return `
# 트립라디오AI 소개

## 회사 개요

트립라디오AI는 인공지능 기술을 활용하여 개인화된 여행 가이드 서비스를 제공하는 혁신적인 기술 기업입니다. 2025년에 설립된 저희는 여행자들에게 더 나은 여행 경험을 제공하고자 합니다.

## 우리의 미션

**"AI 기술로 모든 여행자에게 맞춤형 가이드를 제공하여 더 풍부하고 의미있는 여행 경험을 만들어갑니다."**

## 핵심 서비스

### 🤖 AI 맞춤형 가이드
- 개인의 선호도와 여행 스타일을 분석하여 최적화된 여행 가이드 생성
- 실시간 상황에 맞는 추천 및 조언 제공

### 🌍 다국어 지원
- 전 세계 주요 언어로 서비스 제공
- 현지 문화와 언어에 맞는 정보 제공

### 📱 실시간 정보
- 최신 여행 정보 및 현지 상황 반영
- 교통, 날씨, 이벤트 정보 실시간 업데이트

### 🎯 개인화 추천
- 사용자의 관심사와 선호도 기반 맞춤 추천
- 머신러닝을 통한 지속적인 추천 정확도 향상

## 기술적 우수성

### AI 및 머신러닝
- 최신 자연어 처리 기술 적용
- 사용자 행동 패턴 분석을 통한 개인화 알고리즘
- 지속적인 학습을 통한 서비스 품질 향상

### 클라우드 인프라
- 안정적이고 확장 가능한 클라우드 기반 서비스
- 전 세계 어디서나 빠른 접속 속도 보장
- 24/7 서비스 가용성

## 데이터 보안 및 개인정보보호

저희는 사용자의 개인정보 보호를 최우선으로 생각합니다:
- GDPR 및 개인정보보호법 완전 준수
- 최신 암호화 기술을 통한 데이터 보호
- 투명한 데이터 사용 정책

## 연락처 정보

**사업자 정보**
- 회사명: 트립라디오AI
- 이메일: ${this.contactInfo?.email || 'contact@navidocent.com'}
- 주소: ${this.contactInfo?.serviceAddress?.city || '서울'}, ${this.contactInfo?.serviceAddress?.country || '대한민국'}

**문의 유형**
- 일반 문의: 서비스 이용, 계정 관련
- 기술 지원: 버그 신고, 기능 문의  
- 제안/피드백: 서비스 개선 아이디어

## 파트너십 및 협력

저희는 다양한 여행 관련 기업들과 파트너십을 맺고 있으며, 지속적으로 서비스 품질 향상을 위해 노력하고 있습니다.

---

*트립라디오AI와 함께 더 스마트하고 개인화된 여행을 경험해보세요.*
      `;
    } else {
      return `
# About NaviGuide AI

## Company Overview

NaviGuide AI is an innovative technology company that provides personalized travel guide services using artificial intelligence technology. Founded in 2024, we aim to provide travelers with better travel experiences.

## Our Mission

**"To create richer and more meaningful travel experiences by providing personalized guides to all travelers through AI technology."**

## Core Services

### 🤖 AI Personalized Guides
- Generate optimized travel guides by analyzing personal preferences and travel styles
- Provide real-time recommendations and advice based on current situations

### 🌍 Multi-language Support
- Services provided in major languages worldwide
- Information tailored to local culture and language

### 📱 Real-time Information
- Latest travel information reflecting local conditions
- Real-time updates on transportation, weather, and events

### 🎯 Personalized Recommendations
- Customized recommendations based on user interests and preferences
- Continuous improvement of recommendation accuracy through machine learning

## Technical Excellence

### AI and Machine Learning
- Application of cutting-edge natural language processing technology
- Personalization algorithms through user behavior pattern analysis
- Continuous service quality improvement through ongoing learning

### Cloud Infrastructure
- Stable and scalable cloud-based services
- Fast connection speeds guaranteed worldwide
- 24/7 service availability

## Data Security and Privacy Protection

We prioritize user privacy protection:
- Full compliance with GDPR and privacy protection laws
- Data protection through latest encryption technology
- Transparent data usage policies

## Contact Information

**Business Information**
- Company: NaviGuide AI
- Email: ${this.contactInfo?.email || 'contact@navidocent.com'}
- Address: ${this.contactInfo?.serviceAddress?.city || 'Seoul'}, ${this.contactInfo?.serviceAddress?.country || 'South Korea'}

**Contact Types**
- General Inquiry: Service usage, account related
- Technical Support: Bug reports, feature questions
- Suggestions/Feedback: Service improvement ideas

## Partnerships and Collaboration

We have partnerships with various travel-related companies and continuously strive to improve service quality.

---

*Experience smarter and more personalized travel with NaviGuide AI.*
      `;
    }
  }

  /**
   * 연락처 페이지 내용 구축
   */
  private buildContactPageContent(language: string): string {
    if (language === 'ko') {
      return `
# 연락처

트립라디오AI에 대한 문의나 지원이 필요하시면 아래 정보를 이용해 주세요.

## 📱 문의 채널

**주 연락처**
- Email: ${this.contactInfo?.email || 'cjg5209@gmail.com'}
- 텔레그램 채널: [네비:가이드AI](https://t.me/+z2Z5yfFKu30xN2Vl)
- 운영시간: 평일 09:00 - 18:00 (KST)
- 응답시간: 24시간 이내

## 🏢 사업자 정보

**서비스명**: 트립라디오AI  
**개발자**: ${this.contactInfo?.developerName || 'TripRadio Developer'}  
**주소**: 경기도 안양시

## 📞 전화 문의

${this.contactInfo?.phone ? `**대표번호**: ${this.contactInfo.phone}` : '**전화 문의**: 현재 이메일로만 접수 가능'}  
**운영시간**: 평일 09:00 - 18:00 (KST)

## 🕒 고객지원 운영시간

**평일**: 09:00 - 18:00 (KST)  
**주말/공휴일**: 휴무 (긴급 문의는 이메일로)

## 💬 자주 묻는 질문

서비스 이용 중 궁금한 점이 있으시면 먼저 FAQ를 확인해 주세요:

### Q: 서비스는 무료인가요?
A: 기본 서비스는 무료로 제공되며, 프리미엄 기능은 유료입니다.

### Q: 개인정보는 안전한가요?
A: 네, 최신 보안 기술과 암호화로 개인정보를 보호합니다.

### Q: 오프라인에서도 사용 가능한가요?
A: 가이드 다운로드 기능을 통해 오프라인에서도 이용 가능합니다.

## 🌐 소셜 미디어

저희 소식을 소셜 미디어에서도 확인하세요:
- **웹사이트**: https://navidocent.com
- **블로그**: 준비 중
- **뉴스레터**: 구독 신청 가능

---

**더 나은 서비스를 위해 항상 노력하는 트립라디오AI입니다.**
      `;
    } else {
      return `
# Contact Us

If you need inquiries or support regarding NaviGuide AI, please use the information below.

## 📱 Contact Channels

**Main Contact**
- Email: ${this.contactInfo?.email || 'cjg5209@gmail.com'}
- Telegram Channel: [Navi:GuideAI](https://t.me/+z2Z5yfFKu30xN2Vl)
- Business Hours: Weekdays 09:00 - 18:00 (KST)
- Response Time: Within 24 hours

## 🏢 Business Information

**Service Name**: NaviGuide AI  
**Operator**: ${this.contactInfo?.developerName || 'cjg5209'}  
**Address**: Gyeonggi-do, Anyang-si, South Korea

## 📞 Phone Inquiries

${this.contactInfo?.phone ? `**Main Number**: ${this.contactInfo.phone}` : '**Phone Inquiries**: Currently available by email only'}  
**Business Hours**: Weekdays 09:00 - 18:00 (KST)

## 🕒 Customer Support Hours

**Weekdays**: 09:00 - 18:00 (KST)  
**Weekends/Holidays**: Closed (urgent inquiries by email)

## 💬 Frequently Asked Questions

If you have questions while using the service, please check the FAQ first:

### Q: Is the service free?
A: Basic services are provided free of charge, premium features are paid.

### Q: Is personal information secure?
A: Yes, we protect personal information with the latest security technology and encryption.

### Q: Can it be used offline?
A: It can be used offline through the guide download function.

## 🌐 Social Media

Check our news on social media:
- **Website**: https://navidocent.com
- **Blog**: Coming soon
- **Newsletter**: Subscription available

## 📋 Feedback and Suggestions

Please send us your valuable opinions for service improvement:
- **Feedback**: feedback@navidocent.com
- **Feature Suggestions**: suggestions@navidocent.com

---

**NaviGuide AI always strives for better service.**
      `;
    }
  }

  /**
   * 페이지 조회
   */
  getPage(id: string): LegalPageContent | undefined {
    return this.pages.get(id);
  }

  /**
   * 모든 페이지 조회
   */
  getAllPages(): LegalPageContent[] {
    return Array.from(this.pages.values());
  }

  /**
   * 페이지 업데이트
   */
  updatePage(id: string, updates: Partial<LegalPageContent>): boolean {
    const page = this.pages.get(id);
    if (!page) return false;

    const updatedPage = {
      ...page,
      ...updates,
      lastUpdated: new Date(),
      version: this.incrementVersion(page.version)
    };

    this.pages.set(id, updatedPage);
    return true;
  }

  /**
   * 광고 수익 공지 페이지 내용 구축
   */
  private buildAdsRevenuePageContent(language: string): string {
    if (language === 'ko') {
      return `
# 광고 수익 공지

**최종 업데이트: ${new Date().toLocaleDateString('ko-KR')}**

## 광고 정책 투명성 공지

트립라디오AI는 사용자들에게 투명한 서비스 운영 정보를 제공하기 위해 광고 수익 정책을 공개합니다.

## 1. 광고 서비스 현황

### Google AdSense
- **파트너**: Google AdSense
- **광고 유형**: 디스플레이 광고, 자동 광고
- **게재 위치**: 웹사이트 내 지정된 광고 영역
- **수익 모델**: CPC (클릭당 과금), CPM (노출당 과금)

### 광고 품질 관리
- Google의 광고 정책 및 품질 기준 준수
- 부적절한 광고 콘텐츠 자동 필터링
- 사용자 경험을 해치지 않는 광고 배치

## 2. 수익 활용 방침

광고를 통해 창출된 수익은 다음 목적으로 사용됩니다:

### 📱 서비스 운영 및 개선
- 서버 인프라 유지 및 확장
- AI 모델 학습 데이터 구매 및 처리
- 서비스 품질 향상을 위한 기술 개발

### 🌍 콘텐츠 확장
- 새로운 여행지 가이드 개발
- 다국어 지원 확대
- 사용자 맞춤형 기능 개발

### 💡 연구 개발
- AI 기술 연구 및 개발
- 사용자 경험 개선 연구
- 새로운 여행 기술 혁신

## 3. 사용자 권리 및 선택

### 광고 개인화 설정
사용자는 다음과 같은 권리를 가집니다:
- **광고 개인화 해제**: [Google 광고 설정](https://adssettings.google.com)에서 맞춤형 광고 비활성화
- **관심사 기반 광고 제어**: 광고 선호도 설정 및 관리
- **데이터 사용 거부**: 광고 목적 데이터 수집 거부 권리

### 광고 차단 소프트웨어
- 광고 차단 소프트웨어 사용은 사용자의 선택입니다
- 광고 수익은 무료 서비스 제공의 기반이 됩니다
- 광고 차단 시에도 서비스 이용에 제한은 없습니다

## 4. 제3자 광고 네트워크

### Google AdSense 파트너십
- **데이터 수집**: Google의 개인정보 처리방침 적용
- **쿠키 사용**: 광고 개인화 및 성과 측정 목적
- **옵트아웃**: [Google 광고 설정](https://adssettings.google.com)에서 언제든 해제 가능

### 기타 광고 파트너
현재는 Google AdSense만을 사용하고 있으며, 향후 새로운 광고 파트너 추가 시 본 페이지를 통해 공지하겠습니다.

## 5. 수익 투명성

### 월간 수익 활용 보고서
- 분기별로 광고 수익 활용 현황을 공개합니다
- 주요 투자 분야 및 서비스 개선 내역을 투명하게 공유합니다
- 사용자 피드백을 바탕으로 수익 활용 방향을 조정합니다

### 재정 건전성
- 광고 수익은 서비스 지속가능성을 위한 건전한 수익 모델입니다
- 과도한 광고 게재나 사용자 경험 저해는 지양합니다
- 장기적인 서비스 발전을 위한 책임감 있는 운영을 약속합니다

## 6. 광고 정책 업데이트

본 광고 수익 정책은 다음의 경우 업데이트될 수 있습니다:
- 새로운 광고 파트너십 체결
- 광고 기술 또는 형태의 변경
- 관련 법규 변경에 따른 정책 조정
- 사용자 요구사항 반영

## 7. 문의 및 의견

광고 정책에 대한 문의나 의견이 있으시면 언제든지 연락해 주세요:

**연락처**
- 이메일: ${this.contactInfo?.email || 'contact@navidocent.com'}
- 텔레그램: [네비:가이드AI](https://t.me/+z2Z5yfFKu30xN2Vl)

## 8. 정책 적용일

본 광고 수익 정책은 ${new Date().toLocaleDateString('ko-KR')}부터 적용됩니다.

---

**트립라디오AI는 투명하고 책임감 있는 광고 정책을 통해 지속 가능한 서비스를 제공하겠습니다.**
      `;
    } else {
      return `
# Ad Revenue Notice

**Last Updated: ${new Date().toLocaleDateString('en-US')}**

## Advertising Policy Transparency Notice

TripRadio AI discloses our advertising revenue policy to provide users with transparent service operation information.

## 1. Current Advertising Services

### Google AdSense
- **Partner**: Google AdSense
- **Ad Types**: Display ads, Auto ads
- **Placement**: Designated advertising areas within the website
- **Revenue Model**: CPC (Cost Per Click), CPM (Cost Per Mille)

### Ad Quality Management
- Compliance with Google's advertising policies and quality standards
- Automatic filtering of inappropriate ad content
- Ad placement that doesn't compromise user experience

## 2. Revenue Utilization Policy

Revenue generated through advertising is used for the following purposes:

### 📱 Service Operation & Improvement
- Server infrastructure maintenance and expansion
- AI model training data purchase and processing
- Technology development for service quality improvement

### 🌍 Content Expansion
- Development of new travel destination guides
- Multi-language support expansion
- User-personalized feature development

### 💡 Research & Development
- AI technology research and development
- User experience improvement research
- Innovation in new travel technologies

## 3. User Rights and Choices

### Ad Personalization Settings
Users have the following rights:
- **Disable Ad Personalization**: Deactivate personalized ads in [Google Ad Settings](https://adssettings.google.com)
- **Interest-based Ad Control**: Set and manage advertising preferences
- **Data Usage Opt-out**: Right to refuse data collection for advertising purposes

### Ad Blocking Software
- Using ad blocking software is the user's choice
- Ad revenue is the foundation for providing free services
- There are no service restrictions when ads are blocked

## 4. Third-party Advertising Networks

### Google AdSense Partnership
- **Data Collection**: Google's Privacy Policy applies
- **Cookie Usage**: For ad personalization and performance measurement
- **Opt-out**: Can be disabled anytime in [Google Ad Settings](https://adssettings.google.com)

### Other Advertising Partners
Currently, we only use Google AdSense. Future additions of new advertising partners will be announced through this page.

## 5. Revenue Transparency

### Monthly Revenue Utilization Reports
- Quarterly disclosure of advertising revenue utilization status
- Transparent sharing of major investment areas and service improvements
- Adjustment of revenue utilization direction based on user feedback

### Financial Health
- Ad revenue is a healthy revenue model for service sustainability
- We avoid excessive ad placement or user experience degradation
- We promise responsible operation for long-term service development

## 6. Advertising Policy Updates

This advertising revenue policy may be updated in the following cases:
- New advertising partnerships
- Changes in advertising technology or formats
- Policy adjustments due to regulatory changes
- Reflection of user requirements

## 7. Inquiries and Feedback

If you have any questions or feedback about our advertising policy, please contact us anytime:

**Contact Information**
- Email: ${this.contactInfo?.email || 'contact@navidocent.com'}
- Telegram: [Navi:GuideAI](https://t.me/+z2Z5yfFKu30xN2Vl)

## 8. Policy Effective Date

This advertising revenue policy is effective from ${new Date().toLocaleDateString('en-US')}.

---

**TripRadio AI is committed to providing sustainable services through transparent and responsible advertising policies.**
      `;
    }
  }

  /**
   * 버전 증가
   */
  private incrementVersion(currentVersion: string): string {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  }
}

// Singleton 인스턴스 export
export const legalPagesService = LegalPagesService.getInstance();