/**
 * 개별 세그먼트 오디오 생성 API
 * 팟캐스트 재생 중 오디오 파일이 없을 때 자동으로 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SequentialTTSGenerator } from '@/lib/ai/tts/sequential-tts-generator';
import { DialogueSegment } from '@/lib/ai/tts/sequential-dialogue-processor';

export const maxDuration = 300; // 배치 처리를 위해 5분으로 증가

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { episodeId, segmentIndex, textContent, speakerType, language, chapterIndex, segments } = body;

    // 배치 처리 모드 확인
    const isBatchMode = Array.isArray(segments);

    // 입력 검증
    if (!episodeId || !language) {
      return NextResponse.json({
        success: false,
        error: '필수 파라미터 누락: episodeId, language'
      }, { status: 400 });
    }

    if (!isBatchMode && (segmentIndex === undefined || !textContent || !speakerType)) {
      return NextResponse.json({
        success: false,
        error: '필수 파라미터 누락: segmentIndex, textContent, speakerType'
      }, { status: 400 });
    }

    // 🔥 배치 모드: 여러 세그먼트 한 번에 처리
    if (isBatchMode) {
      console.log(`🎙️ 배치 TTS 생성 요청:`, {
        episodeId,
        language,
        segmentCount: segments.length
      });

      // 🔍 첫 번째 세그먼트 구조 확인
      console.log('📋 첫 번째 세그먼트 구조:', segments[0]);
      console.log('📋 세그먼트 필드명:', Object.keys(segments[0]));

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

      // 세그먼트 변환 (camelCase 및 snake_case 필드명 지원)
      const dialogueSegments: DialogueSegment[] = segments.map((seg: any) => ({
        sequenceNumber: seg.sequenceNumber || seg.sequence_number,
        speakerType: (seg.speakerType || seg.speaker_type) as 'male' | 'female',
        textContent: seg.textContent || seg.text_content,
        estimatedDuration: Math.ceil((seg.textContent || seg.text_content).length / 8),
        chapterIndex: seg.chapterIndex || seg.chapter_index || 0
      }));

      console.log(`🔊 배치 TTS 생성 시작 (${dialogueSegments.length}개 세그먼트)...`);

      // 배치 TTS 생성
      const result = await SequentialTTSGenerator.generateSequentialTTS(
        dialogueSegments,
        episode.location_slug,
        episodeId,
        language
      );

      if (!result.success) {
        console.error(`❌ 배치 TTS 생성 실패:`, result.errors);
        return NextResponse.json({
          success: false,
          error: 'TTS 생성에 실패했습니다.',
          details: result.errors
        }, { status: 500 });
      }

      console.log(`✅ 배치 TTS 생성 완료: ${result.segmentFiles.length}개 파일`);

      // DB 업데이트 - 생성된 오디오 URL들 저장
      console.log(`📝 DB 업데이트 시작: ${result.segmentFiles.length}개 세그먼트`);

      const updateResults = await Promise.all(
        result.segmentFiles.map(async (file) => {
          const { data, error } = await supabase
            .from('podcast_segments')
            .update({
              audio_url: file.supabaseUrl,
              duration_seconds: Math.round(file.duration),
              duration: Math.round(file.duration),
              file_size_bytes: file.fileSize
            })
            .eq('episode_id', episodeId)
            .eq('sequence_number', file.sequenceNumber);

          if (error) {
            console.error(`❌ 세그먼트 ${file.sequenceNumber} DB 업데이트 실패:`, error);
            return { success: false, sequenceNumber: file.sequenceNumber, error };
          }

          console.log(`✅ 세그먼트 ${file.sequenceNumber} DB 업데이트 성공`);
          return { success: true, sequenceNumber: file.sequenceNumber };
        })
      );

      const failedUpdates = updateResults.filter(r => !r.success);
      if (failedUpdates.length > 0) {
        console.warn(`⚠️ ${failedUpdates.length}개 세그먼트 DB 업데이트 실패:`, failedUpdates);
      }

      // 에피소드 상태를 completed로 업데이트
      await supabase
        .from('podcast_episodes')
        .update({ status: 'completed' })
        .eq('id', episodeId);

      return NextResponse.json({
        success: true,
        data: {
          generatedCount: result.segmentFiles.length,
          status: 'completed',
          segments: result.segmentFiles.map(f => ({
            sequenceNumber: f.sequenceNumber,
            audioUrl: f.supabaseUrl,
            duration: f.duration
          }))
        }
      });
    }

    // 개별 세그먼트 모드
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
      audioUrl: generatedFile.supabaseUrl,
      duration: generatedFile.duration
    });

    // DB 업데이트 - 생성된 오디오 URL 저장
    const { error: updateError } = await supabase
      .from('podcast_segments')
      .update({
        audio_url: generatedFile.supabaseUrl,
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
      audioUrl: generatedFile.supabaseUrl,
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
