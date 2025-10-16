export async function GET() {
  return Response.json({ 
    message: 'API 라우트 테스트 성공',
    timestamp: new Date().toISOString()
  });
}