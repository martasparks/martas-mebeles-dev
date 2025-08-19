import { PrismaClient } from '@prisma/client';
import { generateProductCode } from './product-seed';

const prisma = new PrismaClient();

async function createSampleProducts() {
  console.log('🏗️ Creating sample products...');

  // Get required data
  const googleBrand = await prisma.brand.findUnique({ where: { code: 'GOO' } });
  const ikeaBrand = await prisma.brand.findUnique({ where: { code: 'IKE' } });
  const bedroomCategory = await prisma.category.findUnique({ where: { slug: 'bedroom' } });
  const livingRoomCategory = await prisma.category.findUnique({ where: { slug: 'living-room' } });
  const inStockStatus = await prisma.stockStatus.findUnique({ where: { code: 'in_stock' } });
  const lowStockStatus = await prisma.stockStatus.findUnique({ where: { code: 'low_stock' } });

  if (!googleBrand || !ikeaBrand || !bedroomCategory || !livingRoomCategory || !inStockStatus || !lowStockStatus) {
    throw new Error('Required seed data not found. Run product-seed.ts first.');
  }

  // Create Google products
  const googleProduct1 = await prisma.product.create({
    data: {
      code: await generateProductCode(googleBrand.id),
      name: 'Google Smart Bed Frame',
      slug: 'google-smart-bed-frame',
      shortDescription: 'Smart bed frame with built-in wireless charging',
      fullDescription: 'Advanced smart bed frame featuring integrated wireless charging stations, LED ambient lighting, and sleep tracking capabilities.',
      price: 1299.99,
      salePrice: 999.99,
      stock: 15,
      stockStatusId: inStockStatus.id,
      brandId: googleBrand.id,
      categoryId: bedroomCategory.id,
      width: 160,
      height: 90,
      depth: 200,
      weight: 45.5,
      isVisible: true,
      mainImageUrl: '/images/products/google-smart-bed-frame.jpg',
      imageUrls: [
        '/images/products/google-smart-bed-frame-1.jpg',
        '/images/products/google-smart-bed-frame-2.jpg',
        '/images/products/google-smart-bed-frame-3.jpg'
      ],
      metaTitle: 'Google Smart Bed Frame - Wireless Charging & Sleep Tracking',
      metaDescription: 'Revolutionary smart bed frame with wireless charging, LED lighting, and advanced sleep monitoring technology.'
    }
  });

  const googleProduct2 = await prisma.product.create({
    data: {
      code: await generateProductCode(googleBrand.id),
      name: 'Google Nest Nightstand',
      slug: 'google-nest-nightstand',
      shortDescription: 'Smart nightstand with Google Assistant integration',
      fullDescription: 'Intelligent nightstand featuring built-in Google Nest Hub, wireless charging pad, and smart storage compartments.',
      price: 299.99,
      stock: 8,
      stockStatusId: inStockStatus.id,
      brandId: googleBrand.id,
      categoryId: bedroomCategory.id,
      width: 40,
      height: 55,
      depth: 35,
      weight: 12.3,
      isVisible: true,
      mainImageUrl: '/images/products/google-nest-nightstand.jpg'
    }
  });

  // Create IKEA products
  const ikeaProduct1 = await prisma.product.create({
    data: {
      code: await generateProductCode(ikeaBrand.id),
      name: 'IKEA HEMNES Dresser',
      slug: 'ikea-hemnes-dresser',
      shortDescription: 'Classic white dresser with 8 drawers',
      fullDescription: 'Spacious dresser with eight deep drawers, perfect for organizing clothes and accessories. Made from sustainable pine wood.',
      price: 199.99,
      stock: 3,
      stockStatusId: lowStockStatus.id,
      brandId: ikeaBrand.id,
      categoryId: bedroomCategory.id,
      width: 160,
      height: 95,
      depth: 50,
      weight: 35.0,
      isVisible: true,
      mainImageUrl: '/images/products/ikea-hemnes-dresser.jpg'
    }
  });

  const ikeaProduct2 = await prisma.product.create({
    data: {
      code: await generateProductCode(ikeaBrand.id),
      name: 'IKEA EKTORP Sofa',
      slug: 'ikea-ektorp-sofa',
      shortDescription: '3-seat sofa with removable covers',
      fullDescription: 'Comfortable 3-seat sofa with removable and washable covers. Perfect for family living rooms.',
      price: 449.99,
      salePrice: 399.99,
      stock: 12,
      stockStatusId: inStockStatus.id,
      brandId: ikeaBrand.id,
      categoryId: livingRoomCategory.id,
      width: 218,
      height: 88,
      depth: 88,
      weight: 48.2,
      isVisible: true,
      mainImageUrl: '/images/products/ikea-ektorp-sofa.jpg'
    }
  });

  // Add attributes to products
  const colorType = await prisma.attributeType.findUnique({ where: { code: 'color' } });
  const materialType = await prisma.attributeType.findUnique({ where: { code: 'material' } });
  const whiteColor = await prisma.attributeValue.findFirst({ 
    where: { attributeTypeId: colorType!.id, value: 'white' } 
  });
  const oakMaterial = await prisma.attributeValue.findFirst({ 
    where: { attributeTypeId: materialType!.id, value: 'oak' } 
  });

  // Add attributes to Google Smart Bed
  if (colorType && materialType && whiteColor && oakMaterial) {
    await prisma.productAttribute.createMany({
      data: [
        {
          productId: googleProduct1.id,
          attributeTypeId: colorType.id,
          attributeValueId: whiteColor.id
        },
        {
          productId: googleProduct1.id,
          attributeTypeId: materialType.id,
          attributeValueId: oakMaterial.id
        }
      ]
    });
  }

  console.log('✅ Sample products created successfully!');
  console.log(`📦 Created products with codes:
  - ${googleProduct1.code}: ${googleProduct1.name}
  - ${googleProduct2.code}: ${googleProduct2.name}
  - ${ikeaProduct1.code}: ${ikeaProduct1.name}
  - ${ikeaProduct2.code}: ${ikeaProduct2.name}`);
}

if (require.main === module) {
  createSampleProducts()
    .catch((e) => {
      console.error('❌ Sample product creation failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default createSampleProducts;