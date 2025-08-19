import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3, generateFileName, validateImageFile, deleteFromS3 } from '@/lib/s3';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const sliders = await prisma.slider.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    
    return NextResponse.json(sliders);
  } catch (error) {
    console.error('Error fetching sliders:', error);
    return NextResponse.json({ error: 'Failed to fetch sliders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const linkUrl = formData.get('linkUrl') as string;
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0;
    const isActive = formData.get('isActive') === 'true';
    
    const desktopImage = formData.get('desktopImage') as File;
    const mobileImage = formData.get('mobileImage') as File;
    
    if (!desktopImage || !mobileImage) {
      return NextResponse.json({ error: 'Both desktop and mobile images are required' }, { status: 400 });
    }
    
    // Validate image files
    const desktopValidation = validateImageFile(desktopImage);
    const mobileValidation = validateImageFile(mobileImage);
    
    if (!desktopValidation.isValid) {
      return NextResponse.json({ error: `Desktop image: ${desktopValidation.error}` }, { status: 400 });
    }
    
    if (!mobileValidation.isValid) {
      return NextResponse.json({ error: `Mobile image: ${mobileValidation.error}` }, { status: 400 });
    }
    
    // Upload images to S3
    const desktopImageBuffer = Buffer.from(await desktopImage.arrayBuffer());
    const mobileImageBuffer = Buffer.from(await mobileImage.arrayBuffer());
    
    const desktopFileName = generateFileName(desktopImage.name);
    const mobileFileName = generateFileName(mobileImage.name);
    
    const desktopImageUrl = await uploadToS3(
      desktopImageBuffer, 
      desktopFileName, 
      desktopImage.type, 
      'slider'
    );
    
    const mobileImageUrl = await uploadToS3(
      mobileImageBuffer, 
      mobileFileName, 
      mobileImage.type, 
      'slider'
    );
    
    // Create slider in database    
    const slider = await prisma.slider.create({
      data: {
        title: title || null,
        description: description || null,
        desktopImageUrl,
        mobileImageUrl,
        linkUrl: linkUrl || null,
        sortOrder,
        isActive
      }
    });
    
    return NextResponse.json(slider, { status: 201 });
  } catch (error) {
    console.error('Error creating slider:', error);
    return NextResponse.json({ error: 'Failed to create slider' }, { status: 500 });
  }
}