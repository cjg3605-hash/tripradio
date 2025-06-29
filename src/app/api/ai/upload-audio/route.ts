import { supabase } from '@/lib/supabaseClient';

export const runtime = 'edge';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const guideId = formData.get('guide_id') as string;
  if (!file || !guideId) {
    return new Response('file, guide_id required', { status: 400 });
  }
  const filePath = `${guideId}/${file.name}`;

  // 1. Storage 업로드
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('audio')
    .upload(filePath, file, { upsert: true });
  if (uploadError) return new Response(uploadError.message, { status: 500 });

  // 2. audio_files 테이블에 메타데이터 저장
  const { error: dbError } = await supabase.from('audio_files').insert([
    { guide_id: guideId, file_path: filePath }
  ]);
  if (dbError) return new Response(dbError.message, { status: 500 });

  return Response.json({ filePath });
} 