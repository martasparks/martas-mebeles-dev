import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Verify admin authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.user_metadata?.is_super_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch orders with customer and items
    const orders = await prisma.order.findMany({
      include: {
        customer: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          }
        },
        items: {
          select: {
            id: true,
            productId: true,
            name: true,
            price: true,
            quantity: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ 
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt.toISOString(),
        customer: order.customer,
        items: order.items
      }))
    });

  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}