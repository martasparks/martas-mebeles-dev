import { NextRequest, NextResponse } from 'next/server';
import { TranslationSystem, type Locale } from '@/lib/translation-system';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.user_metadata?.is_super_admin === true;
  
  return { user, isAdmin };
}

export async function GET() {
  try {
    const { isAdmin } = await checkAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const translations = await TranslationSystem.getAllTranslations();
    return NextResponse.json(translations);
  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await checkAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { key, locale, value, namespace } = await request.json();
    
    if (!key || !locale || !value) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const translation = await TranslationSystem.upsertTranslation(
      key,
      locale as Locale,
      value,
      namespace
    );

    // Trigger revalidation to refresh all pages with new translations
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/revalidate`, {
        method: 'POST'
      });
    } catch (error) {
      console.warn('Could not trigger revalidation:', error);
    }

    return NextResponse.json(translation);
  } catch (error) {
    console.error('Error creating/updating translation:', error);
    return NextResponse.json(
      { error: 'Failed to save translation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { isAdmin } = await checkAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { translations } = await request.json();
    
    if (!Array.isArray(translations)) {
      return NextResponse.json(
        { error: 'Invalid translations format' },
        { status: 400 }
      );
    }

    const result = await TranslationSystem.upsertMultipleTranslations(translations);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error bulk updating translations:', error);
    return NextResponse.json(
      { error: 'Failed to update translations' },
      { status: 500 }
    );
  }
}