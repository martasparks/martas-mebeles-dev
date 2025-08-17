import createIntlMiddleware from 'next-intl/middleware';
import { updateSession } from '@/utils/supabase/middleware';
import { type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

// Create the next-intl middleware
const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Apply internationalization middleware first
  const response = intlMiddleware(request);
  
  // If intlMiddleware returns a response (redirect), use it
  if (response) {
    return response;
  }
  
  // Handle Supabase auth session
  return await updateSession(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};