
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const updateSession = async (request: NextRequest) => {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  );

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Check if user is logged in but email not verified
  if (user && !user.email_confirmed_at) {
    const url = request.nextUrl.clone();
    
    // Don't redirect if already on auth pages
    if (!url.pathname.includes('/auth/') && !url.pathname.includes('/api/')) {
      url.pathname = '/lv/auth/verify-email';
      url.searchParams.set('email', user.email || '');
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
};

// Backwards compatibility
export const createClient = updateSession;
