import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { CustomerService } from '@/lib/customer-service';

export async function POST() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.email_confirmed_at) {
      return NextResponse.json({ error: 'Email not verified' }, { status: 400 });
    }

    // Check if customer profile exists
    const existingCustomer = await CustomerService.getCustomerBySupabaseId(user.id);
    
    if (existingCustomer) {
      return NextResponse.json({ customer: existingCustomer, created: false });
    }

    // Create customer profile
    const newCustomer = await CustomerService.createCustomer({
      supabaseUserId: user.id,
      email: user.email!,
      fullName: user.user_metadata?.full_name,
      firstName: user.user_metadata?.first_name,
      lastName: user.user_metadata?.last_name,
      preferredLocale: user.user_metadata?.preferred_locale || 'lv',
    });

    return NextResponse.json({ customer: newCustomer, created: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}