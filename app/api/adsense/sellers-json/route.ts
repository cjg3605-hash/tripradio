/**
 * Sellers.json API Route
 * Google sellers.json 파일 및 비즈니스 공개 상태 관리 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { sellersJsonService } from '@/services/ads/sellers-json-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'info';

    switch (action) {
      case 'info':
        const accountStatus = sellersJsonService.getAccountStatus();
        const currentConfig = sellersJsonService.getCurrentConfig();
        const compliance = sellersJsonService.checkAdSenseCompliance();
        
        return NextResponse.json({
          success: true,
          data: {
            account: accountStatus,
            config: currentConfig,
            compliance
          }
        });

      case 'sellers-json':
        const sellersJson = sellersJsonService.generateSellersJson();
        return NextResponse.json(sellersJson);

      case 'validate':
        const validation = sellersJsonService.validateBusinessInfo();
        return NextResponse.json({
          success: true,
          data: validation
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action parameter' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Sellers.json API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'update-disclosure':
        const { publicDisclosure, businessName, verifiedDomain, contactEmail } = data;
        
        sellersJsonService.setBusinessDisclosure({
          publicDisclosure,
          businessName,
          verifiedDomain,
          contactEmail
        });

        return NextResponse.json({
          success: true,
          message: 'Business disclosure settings updated',
          data: sellersJsonService.getCurrentConfig()
        });

      case 'toggle-disclosure':
        sellersJsonService.toggleDisclosureStatus();
        
        return NextResponse.json({
          success: true,
          message: 'Disclosure status toggled',
          data: {
            currentStatus: sellersJsonService.getCurrentConfig().publicDisclosure ? 'public' : 'internal'
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Sellers.json POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}