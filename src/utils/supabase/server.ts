
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = async (cookieStore?: ReturnType<typeof cookies>) => {
  const cookieStoreValue = cookieStore || (await cookies());
  
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStoreValue.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => 
              cookieStoreValue.set(name, value, options)
            )
          } catch {
            console.error("Failed to set cookies in Supabase client creation");
          }
        },
      },
    },
  );
};
