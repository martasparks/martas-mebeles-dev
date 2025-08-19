import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    // Safely parse body and normalize values
    let body: any = {};
    try {
      body = await request.json();
    } catch (_) {
      body = {};
    }

    const normalize = (v: unknown) => {
      if (v === null || v === undefined) return undefined;
      if (typeof v === 'string') {
        const t = v.trim();
        return t === '' ? undefined : t.toUpperCase();
      }
      return String(v).toUpperCase();
    };

    const orderStatus = normalize(body.orderStatus);
    const paymentStatus = normalize(body.paymentStatus);

    // Verify admin authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.user_metadata?.is_super_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate provided statuses (one or both may be present)
    const validOrderStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    const validPaymentStatuses = ['UNPAID', 'PAID', 'REFUNDED', 'FAILED', 'PARTIALLY_REFUNDED', 'PENDING'];

    if (orderStatus === undefined && paymentStatus === undefined) {
      return NextResponse.json({
        error: 'Nothing to update',
        hint: 'Provide orderStatus and/or paymentStatus',
        expected: { orderStatus: validOrderStatuses, paymentStatus: validPaymentStatuses }
      }, { status: 422 });
    }

    if (orderStatus !== undefined && !validOrderStatuses.includes(orderStatus)) {
      return NextResponse.json({
        error: 'Invalid orderStatus',
        received: orderStatus,
        expected: validOrderStatuses
      }, { status: 422 });
    }

    if (paymentStatus !== undefined && !validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json({
        error: 'Invalid paymentStatus',
        received: paymentStatus,
        expected: validPaymentStatuses
      }, { status: 422 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(orderStatus !== undefined ? { orderStatus } : {}),
        ...(paymentStatus !== undefined ? { paymentStatus } : {}),
        updatedAt: new Date(),
      },
      include: {
        customer: {
          select: { email: true, firstName: true, lastName: true }
        }
      }
    });

    return NextResponse.json({
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        orderStatus: updatedOrder.orderStatus,
        paymentStatus: updatedOrder.paymentStatus,
        totalAmount: updatedOrder.totalAmount,
        createdAt: updatedOrder.createdAt.toISOString(),
        updatedAt: updatedOrder.updatedAt.toISOString(),
        customer: updatedOrder.customer,
      }
    });

  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}