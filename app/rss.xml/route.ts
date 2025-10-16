import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

function escapeXml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  try {
    // 최근 게시 가이드 20개 (한국어 기준) - 본문 전체 포함 권장
    const { data, error } = await supabase
      .from('guides')
      .select('locationname, content, updated_at')
      .eq('language', 'ko')
      .order('updated_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('RSS feed query error:', error);
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tripradio.shop';
    const items = (data || []).map((row) => {
      const url = `${baseUrl}/guide/${encodeURIComponent(row.locationname)}`;
      const title = escapeXml(row.locationname);
      // 본문 전체 포함(문자열/객체 대응)
      let description = '';
      try {
        const c = typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
        description = escapeXml(
          c?.overview || c?.description || JSON.stringify(c || {}, null, 2)
        );
      } catch {
        description = escapeXml(String(row.content || ''));
      }
      const pubDate = new Date(row.updated_at || Date.now()).toUTCString();
      return `
      <item>
        <title>${title}</title>
        <link>${url}</link>
        <description>${description}</description>
        <pubDate>${pubDate}</pubDate>
        <guid>${url}</guid>
      </item>`;
    }).join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>TripRadio.AI - ${baseUrl.replace(/^https?:\/\//, '')}</title>
    <link>${baseUrl}/</link>
    <description>AI가 만드는 개인 맞춤형 여행 오디오가이드</description>
    ${items}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (e) {
    console.error('RSS feed error:', e);
    return new NextResponse('RSS feed generation error', { status: 500 });
  }
}


