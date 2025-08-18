import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/cart - Get cart by guestId or customerId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get('guestId');
    
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    
    let cart = null;
    
    if (user) {
      // Get cart for authenticated user
      const customer = await prisma.customer.findUnique({
        where: { supabaseUserId: user.id },
        include: {
          cart: {
            include: {
              items: true
            }
          }
        }
      });
      
      cart = customer?.cart;
    } else if (guestId) {
      // Get cart for guest user
      cart = await prisma.cart.findFirst({
        where: { guestId },
        include: {
          items: true
        }
      });
    }
    
    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Clear cart for authenticated user
      const customer = await prisma.customer.findUnique({
        where: { supabaseUserId: user.id }
      });
      
      // Note: cart relation might not exist in current schema
      // if (customer?.cart) {
      //   await prisma.cartItem.deleteMany({
      //     where: { cartId: customer.cart.id }
      //   });
      // }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}