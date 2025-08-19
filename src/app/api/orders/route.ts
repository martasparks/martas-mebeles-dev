import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

interface OrderData {
  customerEmail: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerPhone?: string;
  billingAddress: string;
  billingCity: string;
  billingPostalCode: string;
  billingCountry: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  paymentMethod: string;
  orderNotes?: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }>;
}

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `MM${timestamp}${random}`;
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const orderData: OrderData = await request.json();
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Calculate totals
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = 0; // Free shipping
    const totalAmount = subtotal + shippingCost;
    
    // Get customer ID if authenticated
    let customerId: string | null = null;
    if (user) {
      const customer = await prisma.customer.findUnique({
        where: { supabaseUserId: user.id }
      });
      customerId = customer?.id || null;
    }
    
    // Generate order number
    let orderNumber: string;
    let isUnique = false;
    
    do {
      orderNumber = generateOrderNumber();
      const existingOrder = await prisma.order.findUnique({
        where: { orderNumber }
      });
      isUnique = !existingOrder;
    } while (!isUnique);
    
    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        customerEmail: orderData.customerEmail,
        customerFirstName: orderData.customerFirstName,
        customerLastName: orderData.customerLastName,
        customerPhone: orderData.customerPhone,
        billingAddress: orderData.billingAddress,
        billingCity: orderData.billingCity,
        billingPostalCode: orderData.billingPostalCode,
        billingCountry: orderData.billingCountry,
        shippingAddress: orderData.shippingAddress,
        shippingCity: orderData.shippingCity,
        shippingPostalCode: orderData.shippingPostalCode,
        shippingCountry: orderData.shippingCountry,
        subtotal: subtotal,
        shippingCost: shippingCost,
        totalAmount: totalAmount,
        paymentMethod: orderData.paymentMethod,
        orderNotes: orderData.orderNotes,
        items: {
          create: orderData.items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
          }))
        }
      },
      include: {
        items: true,
        customer: true
      }
    });
    
    // Clear cart after successful order
    if (customerId) {
      // Clear authenticated user's cart
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: { cart: true }
      });
      
      if (customer?.cart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: customer.cart.id }
        });
      }
    }
    // Note: Guest cart will be cleared on frontend
    
    return NextResponse.json({ 
      success: true, 
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/orders - Get orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 1) Allow lookup by orderNumber (+ optional email) — useful for order confirmation pages
    const orderNumber = searchParams.get('orderNumber');
    const email = searchParams.get('email');
    if (orderNumber) {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: true, customer: true },
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // If email provided, make sure it matches (simple protection)
      if (email && email.toLowerCase() !== order.customerEmail.toLowerCase()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      return NextResponse.json({ order });
    }

    // 2) Otherwise, return orders for the authenticated user (with pagination)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { supabaseUserId: user.id },
    });

    if (!customer) {
      return NextResponse.json({ orders: [], page: 1, pageSize: 10, total: 0 });
    }

    // Pagination
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10), 1), 50);
    const skip = (page - 1) * pageSize;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId: customer.id },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.order.count({ where: { customerId: customer.id } }),
    ]);

    return NextResponse.json({ orders, page, pageSize, total });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}