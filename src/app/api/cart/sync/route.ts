import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CartItemData {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

// POST /api/cart/sync - Sync cart items to database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestId, items }: { guestId: string; items: CartItemData[] } = body;
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let customerId: string | null = null;
    
    // Get customer ID if user is authenticated
    if (user) {
      const customer = await prisma.customer.findUnique({
        where: { supabaseUserId: user.id }
      });
      customerId = customer?.id || null;
    }
    
    // Find or create cart
    let cart = await prisma.cart.findFirst({
      where: customerId 
        ? { customerId } 
        : { guestId },
      include: {
        items: true
      }
    });
    
    if (!cart) {
      // Create new cart
      cart = await prisma.cart.create({
        data: {
          customerId,
          guestId: customerId ? null : guestId, // Only set guestId for guest users
        },
        include: {
          items: true
        }
      });
    } else if (customerId && cart.guestId && !cart.customerId) {
      // Convert guest cart to customer cart
      cart = await prisma.cart.update({
        where: { id: cart.id },
        data: {
          customerId,
          guestId: null
        },
        include: {
          items: true
        }
      });
    }
    
    // Clear existing items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });
    
    // Add new items
    if (items.length > 0) {
      await prisma.cartItem.createMany({
        data: items.map(item => ({
          cartId: cart.id,
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
        }))
      });
    }
    
    // Fetch updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: true
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      cart: updatedCart 
    });
  } catch (error) {
    console.error('Error syncing cart:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}