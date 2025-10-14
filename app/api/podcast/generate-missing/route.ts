import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import LocationSlugService from '@/lib/location/location-slug-service';
import { generateTTSAudio } from '@/lib/ai/tts/tts-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationName, language, episodeData, missingFiles } = body;
    
    console.log('🔧 부분 보완 TTS 생성 시작:', { 
      locationName, 
      language, 
      episodeId: episodeData.episodeId,
      누락파일개수: missingFiles?.length 
    });

    if (!missingFiles || missingFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: '누락된 파일이 없습니다.',
        generatedCount: 0
      });
    }

    // 1. Location slug 생성
    const slugResult = await LocationSlugService.getOrCreateLocationSlug(locationName, language);
    const folderPath = `podcasts/${slugResult.slug}`;
    
    console.log('📁 TTS 저장 경로:', folderPath);

    // 2. 누락된 파일들을 챕터별로 그룹화
    const missingByChapter: { [key: string]: string[] } = {};
    
    missingFiles.forEach((fileName: string) => {
      // 파일명에서 챕터-세그먼트 추출 (예: "1-2ko.mp3" -> 챕터1, 세그먼트2)
      const match = fileName.match(/^(\d+)-(\d+)[a-z]{2}\.mp3$/);
      if (match) {
        const chapterIndex = parseInt(match[1]) - 1; // 0-based index
        const segmentIndex = parseInt(match[2]) - 1; // 0-based index
        
        const chapterKey = `chapter-${chapterIndex}`;
        if (!missingByChapter[chapterKey]) {
          missingByChapter[chapterKey] = [];
        }
        missingByChapter[chapterKey].push(`${chapterIndex}-${segmentIndex}`);
      }
    });

    console.log('📊 챕터별 누락 파일 분석:', missingByChapter);

    // 3. 각 챕터의 누락된 세그먼트만 TTS 생성
    const generationResults: Array<{
      fileName: string;
      segment: string;
      success: boolean;
      url?: string;
      error?: string;
    }> = [];
    let totalGenerated = 0;

    for (const [chapterKey, segments] of Object.entries(missingByChapter)) {
      const chapterIndex = parseInt(chapterKey.split('-')[1]);
      const chapter = episodeData.chapters[chapterIndex];
      
      if (!chapter) {
        console.warn(`⚠️ 챕터 ${chapterIndex + 1} 데이터를 찾을 수 없음`);
        continue;
      }

      console.log(`🎯 챕터 ${chapterIndex + 1} 누락 세그먼트 생성 시작:`, segments.length, '개');

      // 각 누락된 세그먼트 생성
      for (let i = 0; i < segments.length; i++) {
        const segmentKey = segments[i];
        const [chIdx, segIdx] = segmentKey.split('-').map(Number);
        const segmentData = chapter.files?.[segIdx];
        
        if (!segmentData || !segmentData.text) {
          console.warn(`⚠️ 세그먼트 ${chIdx + 1}-${segIdx + 1} 텍스트 데이터 없음`);
          continue;
        }

        try {
          // TTS 생성 및 업로드
          const fileName = `${chIdx + 1}-${segIdx + 1}${language.toLowerCase()}.mp3`;
          
          console.log(`🎤 진행률 ${Math.round(((totalGenerated + 1) / missingFiles.length) * 100)}% - ${fileName} 생성 중...`);
          
          const result = await generateTTSAudio({
            text: segmentData.text,
            voice: segmentData.voice || 'male',
            fileName,
            folderPath,
            language
          });

          if (result.success) {
            generationResults.push({
              fileName,
              segment: `${chIdx + 1}-${segIdx + 1}`,
              success: true,
              url: result.publicUrl
            });
            totalGenerated++;
            console.log(`✅ ${fileName} 생성 완료 (${totalGenerated}/${missingFiles.length})`);
          } else {
            generationResults.push({
              fileName,
              segment: `${chIdx + 1}-${segIdx + 1}`,
              success: false,
              error: result.error
            });
            console.error(`❌ ${fileName} 생성 실패:`, result.error);
          }
        } catch (error) {
          console.error(`❌ 세그먼트 ${chIdx + 1}-${segIdx + 1} TTS 생성 오류:`, error);
          generationResults.push({
            fileName: `${chIdx + 1}-${segIdx + 1}${language.toLowerCase()}.mp3`,
            segment: `${chIdx + 1}-${segIdx + 1}`,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }

        // 진행률 업데이트를 위한 짧은 대기
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // 4. 결과 정리
    const successCount = generationResults.filter(r => r.success).length;
    const failureCount = generationResults.filter(r => !r.success).length;

    console.log('🎯 부분 보완 TTS 생성 완료:', {
      요청된파일: missingFiles.length,
      성공: successCount,
      실패: failureCount,
      총생성: totalGenerated
    });

    return NextResponse.json({
      success: true,
      message: `${totalGenerated}개 오디오 파일이 성공적으로 생성되었습니다.`,
      generatedCount: totalGenerated,
      requestedCount: missingFiles.length,
      results: generationResults,
      summary: {
        success: successCount,
        failed: failureCount,
        total: generationResults.length
      }
    });

  } catch (error) {
    console.error('❌ 부분 보완 TTS 생성 중 오류:', error);
    return NextResponse.json({
      success: false,
      message: 'TTS 생성 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}