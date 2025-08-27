import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  // 기본적으로 모든 요청을 통과시킴
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 특정 경로만 매칭
     */
    '/mypage/:path*',
    '/api/auth/:path*',
  ],
};