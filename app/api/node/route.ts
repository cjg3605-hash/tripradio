// src/app/api/node/route.ts
// 이 파일은 이 디렉토리와 모든 하위 디렉토리의 런타임을 설정합니다.
export const runtime = 'nodejs';

// 이 파일은 실제 요청을 처리하지 않으므로,
// 기본 핸들러를 내보내지 않거나 빈 응답을 반환할 수 있습니다.
// Next.js는 이 파일의 존재만으로 런타임 설정을 적용합니다.
export async function GET() {
  return new Response('Node.js runtime is active for this route group.', { status: 200 });
} 