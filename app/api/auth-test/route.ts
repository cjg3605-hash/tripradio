export async function GET() {
  try {
    // NextAuth 없이 기본 세션 응답
    return Response.json({ 
      user: null,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    console.error('Auth 테스트 에러:', error);
    return Response.json({ error: 'Auth 테스트 실패' }, { status: 500 });
  }
}