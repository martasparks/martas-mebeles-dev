import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/cart/merge - Merge guest cart with user cart on login
export async function POST(request: NextRequest) {
  try {
    // Safely parse JSON with error handling
    let body;
    try {
      const text = await request.text();
      console.log('Raw request body:', text);
      
      if (!text || text.trim() === '') {
        console.log('Empty request body, using default values');
        body = { guestId: null };
      } else {
        body = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({ 
        error: 'Invalid JSON in request body' 
      }, { status: 400 });
    }

    const { guestId }: { guestId: string | null } = body;
    
    console.log('Merge cart request - guestId:', guestId);
    
    const supabase = await createClient();
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
    
    // If no guestId provided, just return existing user cart
    if (!guestId) {
      console.log('No guestId provided, returning existing user cart');
      return NextResponse.json({ 
        success: true, 
        cart: customer.cart || null 
      });
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
      console.log('No guest cart found or empty, returning user cart');
      return NextResponse.json({ 
        success: true, 
        cart: customer.cart || null 
      });
    }
    
    let userCart = customer.cart;
    
    if (!userCart) {
      // Convert guest cart to user cart
      console.log('Converting guest cart to user cart');
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
      console.log('Merging guest cart items into user cart');
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
    
    console.log('Cart merge completed successfully');
    return NextResponse.json({ 
      success: true, 
      cart: userCart 
    });
  } catch (error) {
    console.error('Error merging cart:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}