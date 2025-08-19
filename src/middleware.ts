import createIntlMiddleware from 'next-intl/middleware';
import { updateSession } from '@/utils/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip i18n middleware for admin routes
  if (pathname.startsWith('/admin')) {
    return await updateSession(request);
  }
  
  // Handle internationalization for other routes
  const handleI18nRouting = createIntlMiddleware(routing);
  const response = handleI18nRouting(request);
  
  if (response) {
    // Handle Supabase auth on the i18n response
    const authResponse = await updateSession(request);
    // Copy auth cookies to i18n response
    for (const cookie of authResponse.cookies.getAll()) {
      response.cookies.set(cookie.name, cookie.value, cookie);
    }
    return response;
  }
  
  // No i18n redirect needed, just handle auth
  return await updateSession(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};