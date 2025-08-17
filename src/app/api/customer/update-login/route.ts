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
    
    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 });
    }

    // Update last login
    await CustomerService.updateLastLogin(user.id);

    return NextResponse.json({ success: true, lastLogin: new Date() });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}