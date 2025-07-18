import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    if (!req.nextauth.token && req.nextUrl.pathname.startsWith('/mypage')) {
      return NextResponse.redirect(
        new URL('/auth/signin?callbackUrl=' + encodeURIComponent(req.url), req.url)
      );
    }
    
    if (req.nextauth.token && req.nextUrl.pathname.startsWith('/auth/signin')) {
      const callbackUrl = req.nextUrl.searchParams.get('callbackUrl');
      return NextResponse.redirect(
        new URL(callbackUrl || '/', req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/mypage')) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/mypage/:path*',
    '/auth/signin',
    '/api/auth/:path*'
  ]
};