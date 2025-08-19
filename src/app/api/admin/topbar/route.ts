import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const messages = await prisma.topBarMessage.findMany({
      orderBy: { locale: 'asc' }
    });
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching top bar messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { locale, message, isActive } = await request.json();
    
    if (!locale || !message) {
      return NextResponse.json({ error: 'Locale and message are required' }, { status: 400 });
    }

    const topBarMessage = await prisma.topBarMessage.upsert({
      where: { locale },
      update: {
        message,
        isActive: isActive ?? true
      },
      create: {
        locale,
        message,
        isActive: isActive ?? true
      }
    });
    
    return NextResponse.json(topBarMessage, { status: 201 });
  } catch (error) {
    console.error('Error saving top bar message:', error);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}