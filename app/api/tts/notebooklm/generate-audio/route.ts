/**
 * 개별 세그먼트 오디오 생성 API
 * 팟캐스트 재생 중 오디오 파일이 없을 때 자동으로 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SequentialTTSGenerator } from '@/lib/ai/tts/sequential-tts-generator';
import { DialogueSegment } from '@/lib/ai/tts/sequential-dialogue-processor';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { episodeId, segmentIndex, textContent, speakerType, language, chapterIndex } = body;

    // 입력 검증
    if (!episodeId || segmentIndex === undefined || !textContent || !speakerType || !language) {
      return NextResponse.json({
        success: false,
        error: '필수 파라미터 누락: episodeId, segmentIndex, textContent, speakerType, language'
      }, { status: 400 });
    }

    console.log(`🎙️ 개별 세그먼트 TTS 생성 요청:`, {
      episodeId,
      segmentIndex,
      speakerType,
      language,
      textLength: textContent.length
    });

    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 에피소드 정보 조회
    const { data: episode, error: episodeError } = await supabase
      .from('podcast_episodes')
      .select('location_slug, language')
      .eq('id', episodeId)
      .single();

    if (episodeError || !episode) {
      return NextResponse.json({
        success: false,
        error: '에피소드를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    // 세그먼트 생성
    const segment: DialogueSegment = {
      sequenceNumber: segmentIndex,
      speakerType: speakerType as 'male' | 'female',
      textContent: textContent,
      estimatedDuration: Math.ceil(textContent.length / 8),
      chapterIndex: chapterIndex || 0
    };

    console.log(`🔊 TTS 생성 시작...`);

    // 단일 세그먼트 TTS 생성 (static 메서드 호출)
    const result = await SequentialTTSGenerator.generateSequentialTTS(
      [segment],
      episode.location_slug,
      episodeId,
      language
    );

    if (!result.success || result.segmentFiles.length === 0) {
      console.error(`❌ TTS 생성 실패:`, result.errors);
      return NextResponse.json({
        success: false,
        error: 'TTS 생성에 실패했습니다.',
        details: result.errors
      }, { status: 500 });
    }

    const generatedFile = result.segmentFiles[0];

    console.log(`✅ TTS 생성 완료:`, {
      audioUrl: generatedFile.publicUrl,
      duration: generatedFile.duration
    });

    // DB 업데이트 - 생성된 오디오 URL 저장
    const { error: updateError } = await supabase
      .from('podcast_segments')
      .update({
        audio_url: generatedFile.publicUrl,
        duration_seconds: Math.round(generatedFile.duration),
        duration: Math.round(generatedFile.duration),
        file_size_bytes: generatedFile.fileSize
      })
      .eq('episode_id', episodeId)
      .eq('sequence_number', segmentIndex);

    if (updateError) {
      console.warn(`⚠️ DB 업데이트 실패 (오디오는 생성됨):`, updateError);
    }

    return NextResponse.json({
      success: true,
      audioUrl: generatedFile.publicUrl,
      duration: generatedFile.duration,
      fileSize: generatedFile.fileSize
    });

  } catch (error) {
    console.error('❌ 개별 세그먼트 TTS 생성 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
