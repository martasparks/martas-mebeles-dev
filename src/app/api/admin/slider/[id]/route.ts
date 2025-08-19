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
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const linkUrl = formData.get('linkUrl') as string;
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0;
    const isActive = formData.get('isActive') === 'true';
    
    const desktopImage = formData.get('desktopImage') as File | null;
    const mobileImage = formData.get('mobileImage') as File | null;
    
    // Get existing slider
    const existingSlider = await prisma.slider.findUnique({
      where: { id }
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
    
    // Update slider in database
    const updatedSlider = await prisma.slider.update({
      where: { id },
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