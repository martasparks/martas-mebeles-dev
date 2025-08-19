import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3, generateFileName, validateImageFile, deleteFromS3 } from '@/lib/s3';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    
    const desktopImage = formData.get('desktopImage') as File | null;
    const mobileImage = formData.get('mobileImage') as File | null;
    
    // Get existing slider
    const existingSlider = await prisma.slider.findUnique({
      where: { id },
      include: {
        translations: true
      }
    });
    
    if (!existingSlider) {
      return NextResponse.json({ error: 'Slider not found' }, { status: 404 });
    }
    
    let desktopImageUrl = existingSlider.desktopImageUrl;
    let mobileImageUrl = existingSlider.mobileImageUrl;
    
    // Update desktop image if provided
    if (desktopImage && desktopImage.size > 0) {
      const validation = validateImageFile(desktopImage);
      if (!validation.isValid) {
        return NextResponse.json({ error: `Desktop image: ${validation.error}` }, { status: 400 });
      }
      
      // Delete old image from S3
      const oldDesktopFileName = existingSlider.desktopImageUrl.split('/').pop();
      if (oldDesktopFileName) {
        await deleteFromS3(oldDesktopFileName, 'slider');
      }
      
      // Upload new image
      const imageBuffer = Buffer.from(await desktopImage.arrayBuffer());
      const fileName = generateFileName(desktopImage.name);
      desktopImageUrl = await uploadToS3(imageBuffer, fileName, desktopImage.type, 'slider');
    }
    
    // Update mobile image if provided
    if (mobileImage && mobileImage.size > 0) {
      const validation = validateImageFile(mobileImage);
      if (!validation.isValid) {
        return NextResponse.json({ error: `Mobile image: ${validation.error}` }, { status: 400 });
      }
      
      // Delete old image from S3
      const oldMobileFileName = existingSlider.mobileImageUrl.split('/').pop();
      if (oldMobileFileName) {
        await deleteFromS3(oldMobileFileName, 'slider');
      }
      
      // Upload new image
      const imageBuffer = Buffer.from(await mobileImage.arrayBuffer());
      const fileName = generateFileName(mobileImage.name);
      mobileImageUrl = await uploadToS3(imageBuffer, fileName, mobileImage.type, 'slider');
    }
    
    // Update slider and translations in database
    const updatedSlider = await prisma.slider.update({
      where: { id },
      data: {
        desktopImageUrl,
        mobileImageUrl,
        linkUrl: linkUrl || null,
        sortOrder,
        isActive
      },
      include: {
        translations: true
      }
    });

    // Update translations for all locales
    const locales = [
      { locale: 'lv', title: titleLv, description: descriptionLv },
      { locale: 'en', title: titleEn, description: descriptionEn },
      { locale: 'ru', title: titleRu, description: descriptionRu }
    ];

    for (const { locale, title, description } of locales) {
      await prisma.sliderTranslation.upsert({
        where: {
          sliderId_locale: {
            sliderId: id,
            locale: locale
          }
        },
        update: {
          title: title || null,
          description: description || null
        },
        create: {
          sliderId: id,
          locale: locale,
          title: title || null,
          description: description || null
        }
      });
    }
    
    return NextResponse.json(updatedSlider);
  } catch (error) {
    console.error('Error updating slider:', error);
    return NextResponse.json({ error: 'Failed to update slider' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get slider to delete images from S3
    const slider = await prisma.slider.findUnique({
      where: { id }
    });
    
    if (!slider) {
      return NextResponse.json({ error: 'Slider not found' }, { status: 404 });
    }
    
    // Delete images from S3
    const desktopFileName = slider.desktopImageUrl.split('/').pop();
    const mobileFileName = slider.mobileImageUrl.split('/').pop();
    
    if (desktopFileName) {
      await deleteFromS3(desktopFileName, 'slider');
    }
    
    if (mobileFileName) {
      await deleteFromS3(mobileFileName, 'slider');
    }
    
    // Delete slider from database
    await prisma.slider.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Slider deleted successfully' });
  } catch (error) {
    console.error('Error deleting slider:', error);
    return NextResponse.json({ error: 'Failed to delete slider' }, { status: 500 });
  }
}