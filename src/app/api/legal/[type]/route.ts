/**
 * Legal Pages API Routes
 * AdSense 정책 준수를 위한 법적 페이지 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { legalPagesService } from '@/services/legal-pages/legal-pages-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const { type } = params;
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('lang') || 'ko';
    
    // 연락처 정보 설정 (최초 실행 시)
    legalPagesService.setContactInformation({
      companyName: '네비가이드AI 서비스',
      businessAddress: {
        street: '',
        city: '',
        state: '한국',
        zipCode: '',
        country: '대한민국'
      },
      email: 'cjg5209@gmail.com',
      phone: '070-0000-0000',
      representativeName: 'cjg5209'
    });

    let page;
    
    switch (type) {
      case 'privacy':
        page = legalPagesService.generatePrivacyPolicy(language);
        break;
      case 'terms':
        page = legalPagesService.generateTermsOfService(language);
        break;
      case 'about':
        page = legalPagesService.generateAboutPage(language);
        break;
      case 'contact':
        page = legalPagesService.generateContactPage(language);
        break;
      case 'compliance':
        const compliance = legalPagesService.assessAdSenseCompliance();
        return NextResponse.json({ success: true, data: compliance });
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid page type' },
          { status: 400 }
        );
    }

    // SEO 메타데이터와 함께 반환
    return NextResponse.json({
      success: true,
      data: {
        page,
        seo: page.seoMetadata,
        compliance: legalPagesService.assessAdSenseCompliance()
      }
    });

  } catch (error) {
    console.error('Legal pages API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const { type } = params;
    
    if (type === 'contact-info') {
      const contactInfo = await request.json();
      legalPagesService.setContactInformation(contactInfo);
      
      return NextResponse.json({
        success: true,
        message: 'Contact information updated',
        compliance: legalPagesService.assessAdSenseCompliance()
      });
    }

    if (type === 'generate-all') {
      const { languages = ['ko', 'en'] } = await request.json();
      const pages = legalPagesService.generateAllLegalPages(languages);
      
      return NextResponse.json({
        success: true,
        data: {
          pages,
          compliance: legalPagesService.assessAdSenseCompliance()
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid operation' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Legal pages POST API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}