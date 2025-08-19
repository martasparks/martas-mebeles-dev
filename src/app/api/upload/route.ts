import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3, generateFileName, validateImageFile } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'products';

    if (!file) {
      return NextResponse.json(
        { error: 'Nav norādīts fails' },
        { status: 400 }
      );
    }

    // Validate image file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Generate unique file name
    const fileName = generateFileName(file.name);
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3
    const imageUrl = await uploadToS3(buffer, fileName, file.type, folder);

    return NextResponse.json({
      success: true,
      imageUrl
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Kļūda augšupielādējot attēlu' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Nav norādīta attēla URL' },
        { status: 400 }
      );
    }

    // Import deleteFromS3 function
    const { deleteFromS3 } = await import('@/lib/s3');
    
    const fileName = imageUrl.split('/').pop() || '';

    await deleteFromS3(fileName);

    return NextResponse.json({
      success: true,
      message: 'Attēls veiksmīgi izdzēsts'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Kļūda dzēšot attēlu' },
      { status: 500 }
    );
  }
}