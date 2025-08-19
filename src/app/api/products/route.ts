import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const categoryId = searchParams.get('categoryId');
    const brandId = searchParams.get('brandId');
    const search = searchParams.get('search');
    const onlyVisible = searchParams.get('visible') === 'true';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (onlyVisible) {
      where.isVisible = true;
      where.isActive = true;
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (brandId) {
      where.brandId = brandId;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get products with relations
    const products = await prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
        stockStatus: true,
        attributes: {
          include: {
            attributeType: true,
            attributeValue: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.product.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const brand = await prisma.brand.findUnique({
      where: { id: data.brandId }
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 400 });
    }

    const updatedBrand = await prisma.brand.update({
      where: { id: data.brandId },
      data: { productCounter: { increment: 1 } }
    });

    const generatedCode = `${brand.code}-${String(updatedBrand.productCounter).padStart(3, "0")}`;

    const product = await prisma.product.create({
      data: {
        name: data.name,
        code: generatedCode,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        price: data.price,
        salePrice: data.salePrice,
        stock: data.stock,
        width: data.width,
        height: data.height,
        depth: data.depth,
        weight: data.weight,
        isVisible: data.isVisible,
        isActive: data.isActive,
        mainImageUrl: data.mainImageUrl,
        imageUrls: data.imageUrls || [],
        brand: {
          connect: { id: data.brandId }
        },
        category: {
          connect: { id: data.categoryId }
        },
        stockStatus: {
          connect: { id: data.stockStatusId }
        }
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}