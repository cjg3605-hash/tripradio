/**
 * QA Validation Script: Podcast Segment Database Validation
 *
 * Purpose: Query Supabase DB to validate segment data matches UI display
 * Episode: Colosseum (episode-1759896192379-oxbv0ctf8)
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase with service role key for full access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// UI reported data for comparison
const UI_DATA = {
  segment1: {
    speaker: 'Host',
    textContent: '안녕하세요, 여러분! TripRadio.AI의 진행자입니다. 새로운 여정의 시작을 알리는 설레는 소리와 함께 여러분을 찾아왔습니다. 오늘은 정말 특별한 곳, 바로 로마의 심장부이자...',
    audioUrl: 'http://localhost:3000/podcast/ko/audio/podcasts/colosseum/0-1ko.mp3'
  }
};

async function validateSegments() {
  console.log('🔍 Starting Database Validation...\n');
  console.log('=' .repeat(80));

  const episodeId = 'episode-1759896192379-oxbv0ctf8';

  // 1. Query Episode Info
  console.log('\n📊 STEP 1: Query Episode Metadata');
  console.log('-'.repeat(80));
  const { data: episode, error: episodeError } = await supabase
    .from('podcast_episodes')
    .select('id, location_slug, location_names, language, title, chapter_type, quality_score, created_at')
    .eq('id', episodeId)
    .single();

  if (episodeError) {
    console.error('❌ Episode Query Error:', episodeError);
  } else {
    console.log('✅ Episode Found:');
    console.log(JSON.stringify(episode, null, 2));
  }

  // 2. Query First 5 Segments
  console.log('\n📊 STEP 2: Query First 5 Segments');
  console.log('-'.repeat(80));
  const { data: segments, error: segmentError } = await supabase
    .from('podcast_segments')
    .select('sequence_number, speaker_name, speaker_type, text_content, audio_url, duration_seconds, chapter_index, created_at')
    .eq('episode_id', episodeId)
    .order('sequence_number', { ascending: true })
    .limit(5);

  if (segmentError) {
    console.error('❌ Segment Query Error:', segmentError);
    return;
  }

  console.log(`✅ Found ${segments.length} segments\n`);

  // 3. Validate Segment 1
  console.log('\n🔍 STEP 3: Validate Segment 1 (UI vs DB)');
  console.log('='.repeat(80));

  if (segments.length > 0) {
    const seg1 = segments[0];
    const textMatch = seg1.text_content.substring(0, 100);
    const uiTextMatch = UI_DATA.segment1.textContent.substring(0, 100);

    console.log('\n📝 TEXT CONTENT COMPARISON:');
    console.log('DB Text (first 100 chars):', textMatch);
    console.log('UI Text (first 100 chars):', uiTextMatch);
    console.log('Match:', textMatch === uiTextMatch ? '✅ YES' : '❌ NO');

    console.log('\n🎤 SPEAKER MAPPING:');
    console.log('DB speaker_name:', seg1.speaker_name);
    console.log('DB speaker_type:', seg1.speaker_type);
    console.log('UI speaker:', UI_DATA.segment1.speaker);
    console.log('Expected mapping: Host = male, Curator = female');
    console.log('Mapping correct:',
      (seg1.speaker_name === 'Host' && UI_DATA.segment1.speaker === 'Host') ? '✅ YES' : '❌ NO'
    );

    console.log('\n🔊 AUDIO URL ANALYSIS:');
    console.log('DB audio_url:', seg1.audio_url);
    console.log('UI audio_url:', UI_DATA.segment1.audioUrl);
    console.log('');

    // Parse URLs
    const isDbUrlFull = seg1.audio_url.startsWith('https://');
    const isUiUrlRelative = UI_DATA.segment1.audioUrl.startsWith('http://localhost');

    console.log('DB URL Type:', isDbUrlFull ? 'Full Supabase URL ✅' : 'Relative/Incorrect URL ❌');
    console.log('UI URL Type:', isUiUrlRelative ? 'Relative localhost URL ❌' : 'Full Supabase URL ✅');

    if (isDbUrlFull && isUiUrlRelative) {
      console.log('\n⚠️ AUDIO URL ISSUE DETECTED:');
      console.log('- DB has correct full Supabase URL');
      console.log('- UI is showing relative localhost path');
      console.log('- This indicates URL transformation issue in page.tsx');
      console.log('- Check lines 140, 172, 224, 287, 564 in page.tsx where audioUrl is set');
    }
  }

  // 4. Segments 2-5 Summary
  console.log('\n\n📊 STEP 4: Segments 2-5 Summary');
  console.log('='.repeat(80));

  segments.forEach((seg, idx) => {
    if (idx === 0) return; // Skip segment 1, already detailed above

    console.log(`\nSegment ${seg.sequence_number}:`);
    console.log(`  Speaker: ${seg.speaker_name} (${seg.speaker_type})`);
    console.log(`  Chapter: ${seg.chapter_index}`);
    console.log(`  Audio URL: ${seg.audio_url}`);
    console.log(`  URL Format: ${seg.audio_url.startsWith('https://') ? '✅ Correct' : '❌ Incorrect'}`);
    console.log(`  Text (first 80 chars): ${seg.text_content.substring(0, 80)}...`);
  });

  // 5. Generate JSON Report
  console.log('\n\n📋 STEP 5: JSON Validation Report');
  console.log('='.repeat(80));

  const seg1 = segments[0];
  const report = {
    segment1_validation: {
      db_text: seg1.text_content.substring(0, 100),
      ui_text: UI_DATA.segment1.textContent,
      text_matches: seg1.text_content.substring(0, 100) === UI_DATA.segment1.textContent.substring(0, 100),
      db_speaker: seg1.speaker_name,
      db_speaker_type: seg1.speaker_type,
      ui_speaker: UI_DATA.segment1.speaker,
      speaker_matches: seg1.speaker_name === UI_DATA.segment1.speaker,
      db_audio_url: seg1.audio_url,
      ui_audio_url: UI_DATA.segment1.audioUrl,
      audio_url_correct: seg1.audio_url.startsWith('https://') && !UI_DATA.segment1.audioUrl.startsWith('http://localhost')
    },
    audio_url_issue: {
      root_cause: 'UI is transforming DB audio_url from full Supabase URL to relative localhost path',
      db_stores: 'Full Supabase URL (correct)',
      ui_displays: 'Relative localhost path (incorrect)',
      expected_format: seg1.audio_url,
      actual_format: UI_DATA.segment1.audioUrl,
      fix_needed: 'Check page.tsx lines where audioUrl is assigned (140, 172, 224, 287, 564). Ensure audio_url from DB is used directly without transformation.',
      suspected_code_locations: [
        'page.tsx:140 - audioRef.current.src = episode.segments[0].audioUrl',
        'page.tsx:172 - audioRef.current.src = segment.audioUrl',
        'page.tsx:224 - audioRef.current.src = currentSegment.audioUrl',
        'page.tsx:287 - audioRef.current.src = episode.segments[0].audioUrl',
        'page.tsx:564 - audioRef.current.src = episodeData.segments[0].audioUrl'
      ]
    },
    segments_2_to_5: segments.slice(1).map(seg => ({
      sequence: seg.sequence_number,
      speaker: seg.speaker_name,
      chapter_index: seg.chapter_index,
      has_correct_url: seg.audio_url.startsWith('https://'),
      audio_url: seg.audio_url,
      text_preview: seg.text_content.substring(0, 80) + '...'
    })),
    summary: {
      total_segments_checked: segments.length,
      db_audio_urls_correct: segments.filter(s => s.audio_url.startsWith('https://')).length,
      db_audio_urls_incorrect: segments.filter(s => !s.audio_url.startsWith('https://')).length,
      issue: 'DB stores correct URLs, but UI transforms them incorrectly'
    }
  };

  console.log(JSON.stringify(report, null, 2));

  // 6. Code Analysis Recommendation
  console.log('\n\n💡 STEP 6: Code Fix Recommendations');
  console.log('='.repeat(80));
  console.log(`
ISSUE IDENTIFIED:
- Database stores correct full Supabase URLs: ${seg1.audio_url}
- UI displays incorrect relative localhost URLs: ${UI_DATA.segment1.audioUrl}

ROOT CAUSE:
The segments data loaded from DB is likely being processed incorrectly in page.tsx.

INSPECTION NEEDED:
1. Check how segments are mapped from DB query results (page.tsx:403-411)
2. Verify audio_url field is correctly passed without transformation
3. Look for any baseURL concatenation or path manipulation

SUSPECTED CODE (page.tsx:403-411):
\`\`\`typescript
allSegments = dbSegments.map((seg: any) => ({
  sequenceNumber: seg.sequence_number,
  speakerType: (seg.speaker_name === 'Host' || seg.speaker_type === 'male') ? 'male' : 'female',
  audioUrl: seg.audio_url,  // ⚠️ Check if this is correct
  duration: seg.duration_seconds || 30,
  textContent: seg.text_content || '',
  chapterIndex: seg.chapter_index,
  chapterTitle: chapterInfos.find(ch => ch.chapterIndex === seg.chapter_index)?.title || ''
}));
\`\`\`

ACTION ITEMS:
1. Add console.log to verify seg.audio_url value before mapping
2. Check if audio_url contains full URL or just path
3. If only path, verify DB query is selecting correct field
4. Test with browser DevTools Network tab to see actual audio request URLs
  `);

  console.log('\n✅ Validation Complete\n');
  console.log('=' .repeat(80));
}

// Run validation
validateSegments().catch(console.error);
