/**
 * Web Vitals API Endpoint
 *
 * Week 4 Performance Monitoring System
 * Persona: DevOps Expert
 * Role: Infrastructure setup, API integration
 *
 * POST /api/vitals
 * Receives Core Web Vitals from client browsers and stores in Supabase
 *
 * Expected payload:
 * {
 *   lcp?: number,
 *   fid?: number,
 *   cls?: number,
 *   ttfb?: number,
 *   fcp?: number,
 *   pageUrl: string,
 *   timestamp: number,
 *   userAgent?: string,
 *   sessionId?: string,
 *   language?: string,
 *   location?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const runtime = 'nodejs';

interface WebVitalsPayload {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
  pageUrl: string;
  timestamp: number;
  userAgent?: string;
  sessionId?: string;
  language?: string;
  location?: string;
}

/**
 * POST: Receive and store Web Vitals metrics
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    let payload: WebVitalsPayload;
    try {
      payload = await request.json();
    } catch (error) {
      console.error('❌ Invalid JSON in vitals request:', error);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!payload.pageUrl || !payload.timestamp) {
      console.warn('⚠️ Missing required fields in vitals:', {
        hasPageUrl: !!payload.pageUrl,
        hasTimestamp: !!payload.timestamp,
      });
      return NextResponse.json(
        { error: 'Missing required fields: pageUrl, timestamp' },
        { status: 400 }
      );
    }

    // Prepare data for Supabase
    const vitalsData = {
      page_url: payload.pageUrl,
      timestamp: new Date(payload.timestamp),
      session_id: payload.sessionId,
      language: payload.language,
      location: payload.location,
      user_agent: payload.userAgent,
      // Core Web Vitals
      lcp: payload.lcp || null,
      fid: payload.fid || null,
      cls: payload.cls || null,
      ttfb: payload.ttfb || null,
      fcp: payload.fcp || null,
      // Metadata
      recorded_at: new Date(),
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('web_vitals')
      .insert([vitalsData]);

    if (error) {
      console.error('❌ Failed to insert vitals into Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to store metrics', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Web Vitals stored:', {
      sessionId: payload.sessionId,
      location: payload.location,
      lcp: payload.lcp,
      fid: payload.fid,
      cls: payload.cls,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Metrics recorded',
        data: vitalsData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Unexpected error in /api/vitals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET: Retrieve Web Vitals metrics (summary statistics)
 *
 * Query parameters:
 * - location: Filter by page location
 * - language: Filter by language
 * - hours: Time window in hours (default: 24)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const language = searchParams.get('language');
    const hours = parseInt(searchParams.get('hours') || '24');

    // Build query
    let query = supabase
      .from('web_vitals')
      .select('*')
      .gte('recorded_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString());

    // Apply filters
    if (location) {
      query = query.eq('location', location);
    }
    if (language) {
      query = query.eq('language', language);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Failed to fetch vitals from Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to fetch metrics' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const stats = {
      totalRecords: data?.length || 0,
      averageLcp: calculateAverage(data, 'lcp'),
      averageFid: calculateAverage(data, 'fid'),
      averageCls: calculateAverage(data, 'cls'),
      averageTtfb: calculateAverage(data, 'ttfb'),
      averageFcp: calculateAverage(data, 'fcp'),
      percentile75Lcp: calculatePercentile(data, 'lcp', 75),
      percentile75Fid: calculatePercentile(data, 'fid', 75),
      timeWindow: `${hours} hours`,
      filters: {
        location: location || 'all',
        language: language || 'all',
      },
    };

    console.log('📊 Web Vitals stats retrieved:', {
      totalRecords: stats.totalRecords,
      averageLcp: stats.averageLcp,
      timeWindow: stats.timeWindow,
    });

    return NextResponse.json(
      { success: true, stats, data },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Unexpected error in GET /api/vitals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Calculate average value for a metric from data array
 */
function calculateAverage(
  data: any[] | null,
  metric: 'lcp' | 'fid' | 'cls' | 'ttfb' | 'fcp'
): number | null {
  if (!data || data.length === 0) return null;

  const values = data
    .map((record) => record[metric])
    .filter((val) => val !== null && val !== undefined);

  if (values.length === 0) return null;

  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

/**
 * Calculate percentile value for a metric
 */
function calculatePercentile(
  data: any[] | null,
  metric: 'lcp' | 'fid' | 'cls' | 'ttfb' | 'fcp',
  percentile: number
): number | null {
  if (!data || data.length === 0) return null;

  const values = data
    .map((record) => record[metric])
    .filter((val) => val !== null && val !== undefined)
    .sort((a, b) => a - b);

  if (values.length === 0) return null;

  const index = Math.ceil((percentile / 100) * values.length) - 1;
  return values[Math.max(0, index)];
}
