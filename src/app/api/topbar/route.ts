import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const messages = await prisma.topBarMessage.findMany({
      where: { isActive: true },
      orderBy: { locale: 'asc' }
    });
    
    // Convert to key-value format for easy lookup
    const messageMap: Record<string, string> = {};
    messages.forEach(msg => {
      messageMap[msg.locale] = msg.message;
    });
    
    return NextResponse.json(messageMap);
  } catch (error) {
    console.error('Error fetching top bar messages:', error);
    // Return fallback messages if database fails
    return NextResponse.json({
      lv: 'Bezmaksas piegāde pasūtījumiem virs €50',
      en: 'Free delivery for orders over €50', 
      ru: 'Бесплатная доставка для заказов свыше €50'
    });
  }
}