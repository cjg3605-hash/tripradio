/**
 * Compliance Monitoring API
 * AdSense 정책 준수 실시간 모니터링 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { policyComplianceService } from '@/services/legal-pages/policy-compliance-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'report';

    switch (action) {
      case 'report':
        const report = await policyComplianceService.generateComplianceReport();
        return NextResponse.json({
          success: true,
          data: report
        });

      case 'violations':
        const contentViolations = await policyComplianceService.scanContentViolations('', '');
        const technicalViolations = await policyComplianceService.scanTechnicalCompliance();
        const legalViolations = await policyComplianceService.scanLegalCompliance();
        
        return NextResponse.json({
          success: true,
          data: {
            content: contentViolations,
            technical: technicalViolations,
            legal: legalViolations
          }
        });

      case 'sensitive-events':
        const sensitiveEvents = await policyComplianceService.monitorSensitiveEvents();
        return NextResponse.json({
          success: true,
          data: sensitiveEvents
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action parameter' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Compliance monitoring error:', error);
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
      case 'scan-content':
        const { content, pageUrl } = data;
        const violations = await policyComplianceService.scanContentViolations(content, pageUrl);
        
        return NextResponse.json({
          success: true,
          data: {
            violations,
            complianceScore: Math.max(0, 100 - (violations.length * 15))
          }
        });

      case 'auto-fix':
        const fixResults = await policyComplianceService.autoFixViolations();
        
        return NextResponse.json({
          success: true,
          data: fixResults
        });

      case 'start-monitoring':
        policyComplianceService.startRealTimeMonitoring();
        
        return NextResponse.json({
          success: true,
          message: 'Real-time monitoring started'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Compliance action error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}