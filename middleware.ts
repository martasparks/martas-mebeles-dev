import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Only apply middleware to admin routes
  if (!request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.includes('/admin/')) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Get current user (more secure than getSession)
  const { data: { user }, error } = await supabase.auth.getUser();
  
  // If no user, redirect to login
  if (!user || error) {
    const loginUrl = new URL('/lv/auth/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user is super admin
  const isAdmin = user?.user_metadata?.is_super_admin === true;
  
  if (!isAdmin) {
    // Redirect non-admin users to home page
    return NextResponse.redirect(new URL('/lv', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*']
};