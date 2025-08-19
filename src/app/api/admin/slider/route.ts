import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3, generateFileName, validateImageFile, deleteFromS3 } from '@/lib/s3';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const sliders = await prisma.slider.findMany({
      include: {
        translations: true
      },
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
    
    // Get translations for all languages
    const titleLv = formData.get('title_lv') as string;
    const descriptionLv = formData.get('description_lv') as string;
    const titleEn = formData.get('title_en') as string;
    const descriptionEn = formData.get('description_en') as string;
    const titleRu = formData.get('title_ru') as string;
    const descriptionRu = formData.get('description_ru') as string;
    
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
        desktopImageUrl,
        mobileImageUrl,
        linkUrl: linkUrl || null,
        sortOrder,
        isActive,
        translations: {
          createMany: {
            data: [
              {
                locale: 'lv',
                title: titleLv || null,
                description: descriptionLv || null
              },
              {
                locale: 'en',
                title: titleEn || null,
                description: descriptionEn || null
              },
              {
                locale: 'ru',
                title: titleRu || null,
                description: descriptionRu || null
              }
            ]
          }
        }
      },
      include: {
        translations: true
      }
    });
    
    return NextResponse.json(slider, { status: 201 });
  } catch (error) {
    console.error('Error creating slider:', error);
    return NextResponse.json({ error: 'Failed to create slider' }, { status: 500 });
  }
}