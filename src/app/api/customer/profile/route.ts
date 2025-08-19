import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get customer profile from database
    const customer = await prisma.customer.findUnique({
      where: {
        supabaseUserId: user.id,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 });
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      fullName,
      phone,
      address,
      city,
      postalCode,
      country,
      preferredLocale,
      newsletterSubscribed,
    } = body;

    // Create or update customer profile
    const customer = await prisma.customer.upsert({
      where: {
        supabaseUserId: user.id,
      },
      update: {
        firstName,
        lastName,
        fullName,
        phone,
        address,
        city,
        postalCode,
        country,
        preferredLocale,
        newsletterSubscribed,
        emailVerified: user.email_confirmed_at ? true : false,
        lastLoginAt: new Date(),
      },
      create: {
        supabaseUserId: user.id,
        email: user.email!,
        firstName,
        lastName,
        fullName: fullName || user.user_metadata?.full_name,
        phone,
        address,
        city,
        postalCode,
        country: country || 'LV',
        preferredLocale: preferredLocale || 'lv',
        newsletterSubscribed: newsletterSubscribed || false,
        emailVerified: user.email_confirmed_at ? true : false,
        lastLoginAt: new Date(),
      },
    });

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Update customer profile
    const customer = await prisma.customer.update({
      where: {
        supabaseUserId: user.id,
      },
      data: {
        ...body,
        lastLoginAt: new Date(),
      },
    });

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}