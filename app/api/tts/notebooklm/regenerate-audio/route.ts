import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { episodeId, script, language = 'ko' } = await req.json();
    
    console.log('🔄 오디오 재생성 요청:', { episodeId, language, scriptLength: script?.length });
    
    if (!episodeId || !script) {
      return NextResponse.json({ 
        success: false, 
        error: '에피소드 ID와 스크립트가 필요합니다.' 
      }, { status: 400 });
    }

    // 1. 기존 에피소드 확인
    const { data: existingEpisode, error: episodeError } = await supabase
      .from('podcast_episodes')
      .select('*')
      .eq('id', episodeId)
      .single();

    if (episodeError) {
      console.error('❌ 에피소드 조회 오류:', episodeError);
      return NextResponse.json({ 
        success: false, 
        error: '에피소드를 찾을 수 없습니다.' 
      }, { status: 404 });
    }

    console.log('✅ 기존 에피소드 확인:', existingEpisode.id);

    // 2. TTS 생성 (기존 스크립트 사용)
    const ttsResponse = await fetch(`${req.nextUrl.origin}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: script,
        language: language,
        voice: language === 'ko' ? 'ko-KR-Neural2-C' : 'en-US-Neural2-D',
        speakingRate: 0.95,
        pitch: 0.0,
        volumeGainDb: 2.0
      })
    });

    let audioUrl: string | null = null;
    let duration = 0;

    if (ttsResponse.ok) {
      // TTS API 응답이 JSON인지 바이너리인지 확인
      const contentType = ttsResponse.headers.get('content-type');
      console.log('🔍 TTS 응답 Content-Type:', contentType);
      
      let audioBuffer;
      
      if (contentType && contentType.includes('application/json')) {
        // JSON 응답인 경우
        const jsonResponse = await ttsResponse.json();
        console.log('📄 TTS JSON 응답:', {
          success: jsonResponse.success,
          hasAudioData: !!jsonResponse.audioData,
          audioDataLength: jsonResponse.audioData?.length
        });
        
        if (jsonResponse.success && jsonResponse.audioData) {
          audioBuffer = Buffer.from(jsonResponse.audioData, 'base64');
        } else {
          throw new Error('TTS JSON 응답에 오디오 데이터가 없습니다');
        }
      } else {
        // 바이너리 응답인 경우
        const ttsData = await ttsResponse.blob();
        audioBuffer = Buffer.from(await ttsData.arrayBuffer());
      }
      
      console.log('🎵 TTS 오디오 재생성 완료:', {
        audioSize: audioBuffer.length,
        contentType,
        bufferValid: audioBuffer.length > 0
      });

      // 3. Supabase Storage에 업로드 (새 파일명 사용)
      const timestamp = Date.now();
      const filename = `podcasts/podcast-${episodeId}-regenerated-${timestamp}.mp3`;
      
      console.log('📤 Supabase Storage 재업로드 시도:', {
        filename,
        bufferSize: audioBuffer.length,
        bucket: 'audio'
      });
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio')
        .upload(filename, audioBuffer, {
          contentType: 'audio/mpeg',
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Supabase Storage 업로드 실패:', uploadError);
        console.log('🔍 업로드 에러 상세:', {
          message: uploadError.message,
          error: (uploadError as any).error,
          statusCode: (uploadError as any).statusCode,
          filename,
          bufferSize: audioBuffer.length
        });
        
        // 업로드 실패시 fallback으로 base64 사용
        const fallbackUrl = `data:audio/mp3;base64,${audioBuffer.toString('base64')}`;
        audioUrl = fallbackUrl;
        console.log('🔄 Fallback: base64 URL 생성 (길이:', audioUrl.length, ')');
      } else {
        // Supabase Storage 공개 URL 생성
        const { data: publicUrl } = supabase.storage
          .from('audio')
          .getPublicUrl(filename);
        
        audioUrl = publicUrl.publicUrl;
        console.log('✅ Supabase Storage 재업로드 성공:', {
          uploadPath: uploadData?.path,
          publicUrl: audioUrl,
          filename
        });
        
        // 업로드된 파일 존재 확인
        try {
          const testResponse = await fetch(audioUrl, { method: 'HEAD' });
          console.log('✅ 재생성된 파일 접근 테스트:', {
            status: testResponse.status,
            statusText: testResponse.statusText,
            contentType: testResponse.headers.get('content-type'),
            contentLength: testResponse.headers.get('content-length')
          });
        } catch (testError) {
          console.error('❌ 재생성된 파일 접근 실패:', testError);
        }
      }
      
      duration = Math.ceil(script.length / 8); // 대략적인 재생 시간 추정
      
      // 4. 데이터베이스 업데이트 (오디오 URL만 변경)
      const { error: updateError } = await supabase
        .from('podcast_episodes')
        .update({ 
          audio_url: audioUrl,
          duration_seconds: duration,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', episodeId);

      if (updateError) {
        console.error('❌ 에피소드 업데이트 오류:', updateError);
      } else {
        console.log('✅ 에피소드 오디오 URL 업데이트 완료');
      }
    } else {
      throw new Error('TTS 생성에 실패했습니다');
    }

    return NextResponse.json({
      success: true,
      data: {
        episodeId,
        audioUrl,
        duration,
        status: audioUrl ? 'completed' : 'failed'
      }
    });

  } catch (error) {
    console.error('❌ 오디오 재생성 API 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: '오디오 재생성 중 서버 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}