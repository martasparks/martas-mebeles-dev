import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // Revalidate all pages that might use translations
    revalidateTag('translations');
    
    // Revalidate common paths that use translations
    revalidatePath('/', 'layout');
    revalidatePath('/[locale]', 'layout');
    revalidatePath('/profile');
    revalidatePath('/profile/orders');
    revalidatePath('/admin');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Revalidation triggered successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error during revalidation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to revalidate cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}