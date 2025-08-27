import { NextRequest, NextResponse } from 'next/server';
import { monitor } from '@/lib/monitoring';

export const runtime = 'nodejs';

/**
 * 성능 메트릭 조회 API
 * GET /api/monitoring/metrics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const detailed = searchParams.get('detailed') === 'true';

    const metrics = monitor.getMetrics();
    const health = monitor.getHealthStatus();

    const response = {
      timestamp: new Date().toISOString(),
      health: health,
      metrics: detailed ? metrics : Object.keys(metrics).reduce((acc, key) => {
        acc[key] = {
          avgResponseTime: metrics[key].avgResponseTime,
          totalCalls: metrics[key].totalCalls,
          errorRate: metrics[key].errorRate,
          successRate: metrics[key].successRate
        };
        return acc;
      }, {} as any)
    };

    // Prometheus 형식 지원
    if (format === 'prometheus') {
      const prometheusFormat = convertToPrometheus(metrics);
      return new NextResponse(prometheusFormat, {
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('❌ 메트릭 조회 실패:', error);
    return NextResponse.json(
      { error: '메트릭 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 메트릭 초기화 API (개발용)
 * DELETE /api/monitoring/metrics
 */
export async function DELETE(request: NextRequest) {
  try {
    // 개발 환경에서만 허용
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: '개발 환경에서만 사용 가능합니다.' },
        { status: 403 }
      );
    }

    monitor.clearMetrics();
    
    return NextResponse.json({
      success: true,
      message: '모든 메트릭이 초기화되었습니다.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 메트릭 초기화 실패:', error);
    return NextResponse.json(
      { error: '메트릭 초기화에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * Prometheus 형식으로 변환
 */
function convertToPrometheus(metrics: Record<string, any>): string {
  let output = '';
  
  for (const [name, metric] of Object.entries(metrics)) {
    const sanitizedName = name.replace(/[^a-zA-Z0-9_]/g, '_');
    
    output += `# HELP ${sanitizedName}_response_time_ms Average response time in milliseconds\n`;
    output += `# TYPE ${sanitizedName}_response_time_ms gauge\n`;
    output += `${sanitizedName}_response_time_ms ${metric.avgResponseTime}\n\n`;
    
    output += `# HELP ${sanitizedName}_total_calls Total number of calls\n`;
    output += `# TYPE ${sanitizedName}_total_calls counter\n`;
    output += `${sanitizedName}_total_calls ${metric.totalCalls}\n\n`;
    
    output += `# HELP ${sanitizedName}_error_rate Error rate percentage\n`;
    output += `# TYPE ${sanitizedName}_error_rate gauge\n`;
    output += `${sanitizedName}_error_rate ${metric.errorRate}\n\n`;
  }
  
  return output;
}