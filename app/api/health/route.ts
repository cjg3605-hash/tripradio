import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 시스템 상태 체크
    const healthChecks = {
      api: false,
      database: false,
      ai_service: false,
      memory: {
        used: 0,
        available: 0,
        percentage: 0
      },
      environment: process.env.NODE_ENV || 'unknown'
    };

    // 1. API 기본 상태 (항상 true)
    healthChecks.api = true;

    // 2. 데이터베이스 연결 체크
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // 간단한 연결 테스트
        const { data, error } = await Promise.race([
          supabase.from('guides').select('locationname').limit(1),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database timeout')), 5000)
          )
        ]);
        
        healthChecks.database = !error;
      }
    } catch (dbError) {
      console.warn('Database health check failed:', dbError);
      healthChecks.database = false;
    }

    // 3. AI 서비스 연결 체크
    try {
      if (process.env.GEMINI_API_KEY) {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // 매우 간단한 테스트 (5초 타임아웃)
        await Promise.race([
          model.generateContent("Hi"),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI timeout')), 5000)
          )
        ]);
        
        healthChecks.ai_service = true;
      }
    } catch (aiError) {
      console.warn('AI service health check failed:', aiError);
      healthChecks.ai_service = false;
    }

    // 4. 메모리 사용량 체크 (Node.js)
    try {
      const memUsage = process.memoryUsage();
      const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const availableMB = totalMB - usedMB;
      const percentage = Math.round((usedMB / totalMB) * 100);
      
      healthChecks.memory = {
        used: usedMB,
        available: availableMB,
        percentage
      };
    } catch (memError) {
      console.warn('Memory check failed:', memError);
    }

    // 전체 상태 결정
    const isHealthy = healthChecks.api && healthChecks.database && healthChecks.ai_service;
    const responseTime = Date.now() - startTime;

    const status = isHealthy ? 'healthy' : 'degraded';
    const statusCode = isHealthy ? 200 : 503;

    // 상태별 추가 정보
    const issues: string[] = [];
    if (!healthChecks.database) issues.push('database_connection');
    if (!healthChecks.ai_service) issues.push('ai_service');
    if (healthChecks.memory.percentage > 90) issues.push('high_memory_usage');

    return NextResponse.json({
      status,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      version: '1.0.0',
      services: healthChecks,
      issues: issues.length > 0 ? issues : null,
      uptime: process.uptime ? `${Math.round(process.uptime())}s` : 'unknown'
    }, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': status,
        'X-Response-Time': `${responseTime}ms`
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        api: false,
        database: false,
        ai_service: false
      }
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'unhealthy',
        'X-Response-Time': `${responseTime}ms`
      }
    });
  }
}

// HEAD 요청도 지원 (로드밸런서용)
export async function HEAD(request: NextRequest) {
  try {
    // 간단한 연결 체크만
    const startTime = Date.now();
    
    // 기본적인 서비스 체크
    let isHealthy = true;
    
    // 환경 변수 체크
    if (!process.env.GEMINI_API_KEY) isHealthy = false;
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL) isHealthy = false;
    
    const responseTime = Date.now() - startTime;
    const status = isHealthy ? 200 : 503;
    
    return new Response(null, {
      status,
      headers: {
        'X-Health-Check': isHealthy ? 'healthy' : 'unhealthy',
        'X-Response-Time': `${responseTime}ms`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    return new Response(null, {
      status: 503,
      headers: {
        'X-Health-Check': 'unhealthy',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}