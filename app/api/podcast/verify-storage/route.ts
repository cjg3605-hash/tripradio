import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import LocationSlugService from '@/lib/location/location-slug-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationName, language, episodeData } = body;
    
    console.log('🔍 서버 스토리지 검증 시작:', { locationName, language, episodeId: episodeData.episodeId });

    // 1. Location slug 생성 (TTS 생성 시와 동일한 로직)
    const slugResult = await LocationSlugService.getOrCreateLocationSlug(locationName, language);
    const expectedFolderPath = `podcasts/${slugResult.slug}`;
    
    console.log('📁 예상 폴더 경로:', expectedFolderPath);

    // 2. Supabase 스토리지에서 해당 폴더의 파일 목록 조회
    const { data: files, error } = await supabase.storage
      .from('audio')
      .list(expectedFolderPath, {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.warn('⚠️ 스토리지 접근 실패:', error);
      return NextResponse.json({
        success: false,
        isValid: false,
        reason: 'storage_access_error',
        details: error.message
      });
    }

    if (!files || files.length === 0) {
      console.warn('⚠️ 스토리지에 파일이 없음:', expectedFolderPath);
      return NextResponse.json({
        success: false,
        isValid: false,
        reason: 'no_files_in_storage',
        expectedPath: expectedFolderPath,
        actualFileCount: 0
      });
    }

    // 3. 오디오 파일만 필터링 (.mp3 파일만)
    const audioFiles = files.filter(file => file.name.endsWith('.mp3'));
    console.log('🎵 스토리지 오디오 파일 개수:', audioFiles.length);

    // 4. DB에서 실제 세그먼트 개수 직접 조회
    let expectedSegmentCount = 0;
    
    try {
      const { count, error: countError } = await supabase
        .from('podcast_segments')
        .select('*', { count: 'exact', head: true })
        .eq('episode_id', episodeData.episodeId);
        
      if (countError) {
        console.warn('⚠️ 세그먼트 개수 조회 실패, 폴백 계산 사용:', countError);
        expectedSegmentCount = episodeData.chapters ? 
          episodeData.chapters.reduce((total: number, chapter: any) => 
            total + (chapter.files?.length || chapter.segmentCount || 0), 0
          ) : (episodeData.segments?.length || 0);
      } else {
        expectedSegmentCount = count || 0;
        console.log('📊 DB에서 조회한 실제 세그먼트 개수:', expectedSegmentCount);
      }
    } catch (error) {
      console.warn('⚠️ 세그먼트 개수 조회 중 오류, 폴백 계산 사용:', error);
      expectedSegmentCount = episodeData.chapters ? 
        episodeData.chapters.reduce((total: number, chapter: any) => 
          total + (chapter.files?.length || chapter.segmentCount || 0), 0
        ) : (episodeData.segments?.length || 0);
    }

    console.log('📊 파일 개수 비교:', {
      스토리지_실제파일: audioFiles.length,
      DB_예상세그먼트: expectedSegmentCount,
      매칭여부: audioFiles.length === expectedSegmentCount
    });

    // 5. 파일명 패턴 검증 (예: 1-1ko.mp3, 1-2ko.mp3 등)
    const languageCode = language.toLowerCase();
    const fileNamePattern = new RegExp(`^\\d+-\\d+${languageCode}\\.mp3$`);
    const validFileNames = audioFiles.filter(file => fileNamePattern.test(file.name));

    console.log('🔤 파일명 패턴 검증:', {
      전체파일: audioFiles.length,
      유효한패턴: validFileNames.length,
      패턴: fileNamePattern.toString(),
      예시파일명: audioFiles.slice(0, 3).map(f => f.name)
    });

    // 6. URL 접근성 검증 (몇 개 샘플만)
    const sampleFiles = audioFiles.slice(0, Math.min(3, audioFiles.length));
    const urlCheckResults = await Promise.allSettled(
      sampleFiles.map(async (file) => {
        const publicUrl = supabase.storage
          .from('audio')
          .getPublicUrl(`${expectedFolderPath}/${file.name}`);
        
        try {
          const response = await fetch(publicUrl.data.publicUrl, { method: 'HEAD' });
          return {
            fileName: file.name,
            url: publicUrl.data.publicUrl,
            accessible: response.ok,
            status: response.status
          };
        } catch (error) {
          return {
            fileName: file.name,
            url: publicUrl.data.publicUrl,
            accessible: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    const accessibleCount = urlCheckResults.filter(result => 
      result.status === 'fulfilled' && result.value.accessible
    ).length;

    console.log('🌐 URL 접근성 검증:', {
      검증된파일: sampleFiles.length,
      접근가능: accessibleCount,
      결과: urlCheckResults.map(result => 
        result.status === 'fulfilled' 
          ? `${result.value.fileName}: ${result.value.accessible ? '✅' : '❌'}`
          : '❌ 오류'
      )
    });

    // 7. 누락된 파일 식별
    const missingFiles: string[] = [];
    const existingFileNames = new Set(audioFiles.map(f => f.name));
    
    // 예상되는 파일명 생성 (챕터-세그먼트 형식)
    if (episodeData.chapters) {
      episodeData.chapters.forEach((chapter: any, chapterIndex: number) => {
        const segmentCount = chapter.files?.length || chapter.segmentCount || 0;
        for (let segmentIndex = 1; segmentIndex <= segmentCount; segmentIndex++) {
          const expectedFileName = `${chapterIndex + 1}-${segmentIndex}${languageCode}.mp3`;
          if (!existingFileNames.has(expectedFileName)) {
            missingFiles.push(expectedFileName);
          }
        }
      });
    }

    console.log('🔍 누락된 파일 분석:', {
      전체예상파일: expectedSegmentCount,
      실제존재파일: audioFiles.length,
      누락된파일개수: missingFiles.length,
      누락파일목록: missingFiles.slice(0, 5) // 처음 5개만 로그
    });

    // 8. 최종 검증 결과
    const isValid = 
      audioFiles.length > 0 && 
      audioFiles.length === expectedSegmentCount &&
      validFileNames.length === audioFiles.length &&
      accessibleCount === sampleFiles.length;

    const result = {
      success: true,
      isValid,
      folderPath: expectedFolderPath,
      actualFileCount: audioFiles.length,
      expectedFileCount: expectedSegmentCount,
      validFileNames: validFileNames.length,
      accessibleUrls: accessibleCount,
      missingFiles: missingFiles,
      missingCount: missingFiles.length,
      existingFiles: audioFiles.map(f => f.name).sort(),
      sampleUrls: urlCheckResults.filter(r => r.status === 'fulfilled').map(r => ({
        fileName: (r.value as any).fileName,
        url: (r.value as any).url,
        accessible: (r.value as any).accessible
      })),
      reason: !isValid ? (missingFiles.length > 0 ? 'missing_files' : 'validation_failed') : 'verified'
    };

    console.log(isValid ? '✅ 서버 스토리지 검증 성공' : '❌ 서버 스토리지 검증 실패', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ 서버 스토리지 검증 중 오류:', error);
    return NextResponse.json({
      success: false,
      isValid: false,
      reason: 'verification_error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}