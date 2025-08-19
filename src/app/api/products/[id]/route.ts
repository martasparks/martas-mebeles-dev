import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      stockStatus: true,
      attributes: {
        include: {
          attributeType: true,
          attributeValue: true,
        },
      },
    },
  });

    if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

  return NextResponse.json({ product });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await request.json();

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
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
        brandId: data.brandId,
        categoryId: data.categoryId,
        stockStatusId: data.stockStatusId,
        mainImageUrl: data.mainImageUrl,
        imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
      },
    });

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}