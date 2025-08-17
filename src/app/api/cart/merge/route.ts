import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/cart/merge - Merge guest cart with user cart on login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestId }: { guestId: string } = body;
    
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get customer
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
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    // Find guest cart
    const guestCart = await prisma.cart.findFirst({
      where: { guestId },
      include: {
        items: true
      }
    });
    
    if (!guestCart || guestCart.items.length === 0) {
      // No guest cart to merge, just return existing user cart
      return NextResponse.json({ 
        success: true, 
        cart: customer.cart 
      });
    }
    
    let userCart = customer.cart;
    
    if (!userCart) {
      // Convert guest cart to user cart
      userCart = await prisma.cart.update({
        where: { id: guestCart.id },
        data: {
          customerId: customer.id,
          guestId: null
        },
        include: {
          items: true
        }
      });
    } else {
      // Merge guest cart items into user cart
      for (const guestItem of guestCart.items) {
        // Check if item already exists in user cart
        const existingItem = await prisma.cartItem.findUnique({
          where: {
            cartId_productId: {
              cartId: userCart.id,
              productId: guestItem.productId
            }
          }
        });
        
        if (existingItem) {
          // Update quantity
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: existingItem.quantity + guestItem.quantity
            }
          });
        } else {
          // Add new item
          await prisma.cartItem.create({
            data: {
              cartId: userCart.id,
              productId: guestItem.productId,
              name: guestItem.name,
              price: guestItem.price,
              quantity: guestItem.quantity,
              imageUrl: guestItem.imageUrl,
            }
          });
        }
      }
      
      // Delete guest cart
      await prisma.cart.delete({
        where: { id: guestCart.id }
      });
      
      // Fetch updated user cart
      userCart = await prisma.cart.findUnique({
        where: { id: userCart.id },
        include: {
          items: true
        }
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      cart: userCart 
    });
  } catch (error) {
    console.error('Error merging cart:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}