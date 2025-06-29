import { NextRequest } from 'next/server';
import { getOrCreateGoldenCoordinates } from '@/lib/ai/officialData';

export async function POST(req: NextRequest) {
  try {
    const { locationName, language } = await req.json();
    if (!locationName || !language) {
      return new Response(JSON.stringify({ success: false, error: '필수 파라미터 누락' }), { status: 400 });
    }
    const coordinates = await getOrCreateGoldenCoordinates(locationName, language);
    return new Response(JSON.stringify({ success: true, coordinates }), { status: 200 });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
} 