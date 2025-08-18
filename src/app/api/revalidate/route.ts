import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // Revalidate all locale pages to pick up new translations
    revalidatePath('/', 'layout');
    revalidatePath('/[locale]', 'layout');
    
    return NextResponse.json({ revalidated: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 });
  }
}