import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// import { generateInvoicePDF } from '@/lib/pdf-generator';

// GET /api/orders/[orderNumber]/invoice - Generate PDF invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    
    if (!orderNumber) {
      return NextResponse.json({ error: 'Order number is required' }, { status: 400 });
    }
    
    // Get order with items
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Generate PDF - temporarily disabled
    // const pdfBuffer = generateInvoicePDF(order);
    
    return NextResponse.json({ 
      error: 'PDF generation temporarily disabled',
      order: order 
    }, { status: 501 });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

