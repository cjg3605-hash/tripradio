import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateTTSAndUrl } from '@/lib/tts-gcs';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const { text, guide_id, locationName, language } = await req.json();
    if (!text || !guide_id || !locationName || !language) {
      return NextResponse.json({ success: false, error: '필수 값 누락' }, { status: 400 });
    }
    // 1. TTS 파일 생성 및 Storage 업로드
    const ttsUrl = await getOrCreateTTSAndUrl(text, locationName, language);

    // 2. audio_files DB 저장 (file_path는 Storage 내 경로만 추출)
    const file_path = ttsUrl.split('.com/')[1];
    const { error: dbError } = await supabase.from('audio_files').insert([
      { guide_id, file_path, created_at: new Date().toISOString() }
    ]);
    if (dbError) return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });

    return NextResponse.json({ success: true, url: ttsUrl, file_path });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
} 