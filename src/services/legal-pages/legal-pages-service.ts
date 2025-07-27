/**
 * Legal Pages Service
 * AdSense 승인을 위한 필수 법적 페이지 관리 마이크로서비스
 */

export interface LegalPageContent {
  id: string;
  type: 'privacy' | 'terms' | 'about' | 'contact' | 'disclaimer';
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
  companyName: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  email: string;
  phone?: string;
  businessNumber?: string;
  representativeName: string;
}

export interface AdSenseComplianceMetrics {
  hasPrivacyPolicy: boolean;
  hasTermsOfService: boolean;
  hasAboutPage: boolean;
  hasContactInfo: boolean;
  hasValidBusinessInfo: boolean;
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
    companyName: '네비가이드AI',
    representativeName: '김대표',
    businessAddress: {
      street: '테헤란로 123',
      city: '강남구',
      state: '서울특별시',
      zipCode: '06159',
      country: '대한민국'
    },
    email: 'support@naviguide.ai',
    phone: '070-0000-0000'
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
          ? '네비가이드AI 개인정보처리방침 - 사용자 데이터 보호 및 처리 방침'
          : 'NaviGuide AI Privacy Policy - User data protection and processing policy',
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
          ? '네비가이드AI 이용약관 - 서비스 이용 조건 및 사용자 권리'
          : 'NaviGuide AI Terms of Service - Service usage conditions and user rights',
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
      title: language === 'ko' ? '회사 소개' : 'About Us',
      content: aboutContent,
      lastUpdated: new Date(),
      version: '1.0.0',
      language,
      isPublished: true,
      seoMetadata: {
        description: language === 'ko'
          ? '네비가이드AI 소개 - AI 기반 여행 가이드 서비스 제공업체'
          : 'About NaviGuide AI - AI-powered travel guide service provider',
        keywords: ['about us', 'company', 'AI travel', '회사소개', 'travel technology'],
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
          ? '네비가이드AI 연락처 - 고객지원 및 비즈니스 문의'
          : 'Contact NaviGuide AI - Customer support and business inquiries',
        keywords: ['contact', 'customer support', '연락처', 'business inquiry'],
        canonicalUrl: `/contact`
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
    const hasValidBusinessInfo = this.contactInfo && this.contactInfo.email && this.contactInfo.businessAddress;

    const missingElements: string[] = [];
    if (!hasPrivacyPolicy) missingElements.push('Privacy Policy');
    if (!hasTermsOfService) missingElements.push('Terms of Service');
    if (!hasAboutPage) missingElements.push('About Us Page');
    if (!hasContactInfo) missingElements.push('Contact Information');
    if (!hasValidBusinessInfo) missingElements.push('Valid Business Information');

    const complianceScore = Math.round(
      ((hasPrivacyPolicy ? 25 : 0) +
       (hasTermsOfService ? 25 : 0) +
       (hasAboutPage ? 20 : 0) +
       (hasContactInfo ? 15 : 0) +
       (hasValidBusinessInfo ? 15 : 0))
    );

    return {
      hasPrivacyPolicy,
      hasTermsOfService,
      hasAboutPage,
      hasContactInfo,
      hasValidBusinessInfo: !!hasValidBusinessInfo,
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

네비가이드AI("회사" 또는 "저희")는 다음의 목적을 위하여 개인정보를 처리하고 있으며, 다음의 목적 이외의 용도로는 이용하지 않습니다.

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
- 연락처: ${this.contactInfo?.email || 'contact@naviguide.ai'}

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
Email: ${this.contactInfo?.email || 'contact@naviguide.ai'}

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

네비가이드AI는 인공지능 기반 여행 가이드 서비스를 제공합니다. 본 약관은 서비스 이용과 관련된 권리, 의무 및 책임사항을 규정합니다.

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
# 네비가이드AI 소개

## 회사 개요

네비가이드AI는 인공지능 기술을 활용하여 개인화된 여행 가이드 서비스를 제공하는 혁신적인 기술 기업입니다. 2024년에 설립된 저희는 여행자들에게 더 나은 여행 경험을 제공하고자 합니다.

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
- 회사명: 네비가이드AI
- 이메일: ${this.contactInfo?.email || 'contact@naviguide.ai'}
- 주소: ${this.contactInfo?.businessAddress?.street || '서울특별시 강남구 테헤란로'} ${this.contactInfo?.businessAddress?.city || ''}

**고객 지원**
- 이메일: support@naviguide.ai
- 운영시간: 평일 09:00 - 18:00 (KST)

## 파트너십 및 협력

저희는 다양한 여행 관련 기업들과 파트너십을 맺고 있으며, 지속적으로 서비스 품질 향상을 위해 노력하고 있습니다.

---

*네비가이드AI와 함께 더 스마트하고 개인화된 여행을 경험해보세요.*
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
- Email: ${this.contactInfo?.email || 'contact@naviguide.ai'}
- Address: ${this.contactInfo?.businessAddress?.street || 'Seoul, South Korea'}

**Customer Support**
- Email: support@naviguide.ai
- Business Hours: Weekdays 09:00 - 18:00 (KST)

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

네비가이드AI에 대한 문의나 지원이 필요하시면 아래 정보를 이용해 주세요.

## 📧 이메일 문의

**일반 문의**
- Email: ${this.contactInfo?.email || 'contact@naviguide.ai'}
- 운영시간: 평일 09:00 - 18:00 (KST)
- 응답시간: 24시간 이내

**기술 지원**
- Email: support@naviguide.ai
- 긴급 기술 문제: 우선 처리

**비즈니스 문의**
- Email: business@naviguide.ai
- 파트너십, 제휴, 투자 관련

## 🏢 사업자 정보

**회사명**: 네비가이드AI  
**대표자**: ${this.contactInfo?.representativeName || '김대표'}  
**사업자등록번호**: ${this.contactInfo?.businessNumber || '000-00-00000'}  

**사업장 주소**  
${this.contactInfo?.businessAddress?.street || '서울특별시 강남구 테헤란로 000'}  
${this.contactInfo?.businessAddress?.city || '서울특별시'} ${this.contactInfo?.businessAddress?.zipCode || '00000'}  
${this.contactInfo?.businessAddress?.country || '대한민국'}

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
- **웹사이트**: https://navi-guide-ai-eight.vercel.app
- **블로그**: 준비 중
- **뉴스레터**: 구독 신청 가능

## 📋 피드백 및 제안

서비스 개선을 위한 소중한 의견을 언제든 보내주세요:
- **피드백**: feedback@naviguide.ai
- **기능 제안**: suggestions@naviguide.ai

---

**더 나은 서비스를 위해 항상 노력하는 네비가이드AI입니다.**
      `;
    } else {
      return `
# Contact Us

If you need inquiries or support regarding NaviGuide AI, please use the information below.

## 📧 Email Inquiries

**General Inquiries**
- Email: ${this.contactInfo?.email || 'contact@naviguide.ai'}
- Business Hours: Weekdays 09:00 - 18:00 (KST)
- Response Time: Within 24 hours

**Technical Support**
- Email: support@naviguide.ai
- Urgent technical issues: Priority processing

**Business Inquiries**
- Email: business@naviguide.ai
- Partnership, collaboration, investment related

## 🏢 Business Information

**Company Name**: NaviGuide AI  
**Representative**: ${this.contactInfo?.representativeName || 'CEO Kim'}  
**Business Registration Number**: ${this.contactInfo?.businessNumber || '000-00-00000'}  

**Business Address**  
${this.contactInfo?.businessAddress?.street || 'Seoul, South Korea'}  
${this.contactInfo?.businessAddress?.city || 'Seoul'} ${this.contactInfo?.businessAddress?.zipCode || '00000'}  
${this.contactInfo?.businessAddress?.country || 'South Korea'}

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
- **Website**: https://navi-guide-ai-eight.vercel.app
- **Blog**: Coming soon
- **Newsletter**: Subscription available

## 📋 Feedback and Suggestions

Please send us your valuable opinions for service improvement:
- **Feedback**: feedback@naviguide.ai
- **Feature Suggestions**: suggestions@naviguide.ai

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
   * 버전 증가
   */
  private incrementVersion(currentVersion: string): string {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  }
}

// Singleton 인스턴스 export
export const legalPagesService = LegalPagesService.getInstance();