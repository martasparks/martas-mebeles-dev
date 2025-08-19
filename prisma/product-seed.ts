import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProducts() {
  console.log('🌱 Starting product system seed...');

  // 1. Create Stock Statuses
  const stockStatuses = await Promise.all([
    prisma.stockStatus.upsert({
      where: { code: 'in_stock' },
      update: {},
      create: {
        name: 'In Stock',
        code: 'in_stock',
        color: '#10B981', // green
      },
    }),
    prisma.stockStatus.upsert({
      where: { code: 'low_stock' },
      update: {},
      create: {
        name: 'Low Stock',
        code: 'low_stock',
        color: '#F59E0B', // yellow
      },
    }),
    prisma.stockStatus.upsert({
      where: { code: 'out_of_stock' },
      update: {},
      create: {
        name: 'Out of Stock',
        code: 'out_of_stock',
        color: '#EF4444', // red
      },
    }),
    prisma.stockStatus.upsert({
      where: { code: 'pre_order' },
      update: {},
      create: {
        name: 'Pre-order',
        code: 'pre_order',
        color: '#8B5CF6', // purple
      },
    }),
  ]);

  // 2. Create Brands
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { code: 'GOO' },
      update: {},
      create: {
        name: 'Google',
        code: 'GOO',
        description: 'Google furniture and home products',
        productCounter: 0,
      },
    }),
    prisma.brand.upsert({
      where: { code: 'IKE' },
      update: {},
      create: {
        name: 'IKEA',
        code: 'IKE',
        description: 'Swedish furniture retailer',
        productCounter: 0,
      },
    }),
    prisma.brand.upsert({
      where: { code: 'SAM' },
      update: {},
      create: {
        name: 'Samsung',
        code: 'SAM',
        description: 'Samsung home appliances and furniture',
        productCounter: 0,
      },
    }),
  ]);

  // 3. Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'bedroom' },
      update: {},
      create: {
        name: 'Bedroom',
        slug: 'bedroom',
        description: 'Bedroom furniture and accessories',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'living-room' },
      update: {},
      create: {
        name: 'Living Room',
        slug: 'living-room',
        description: 'Living room furniture and decor',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'kitchen' },
      update: {},
      create: {
        name: 'Kitchen',
        slug: 'kitchen',
        description: 'Kitchen furniture and appliances',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'office' },
      update: {},
      create: {
        name: 'Office',
        slug: 'office',
        description: 'Office furniture and equipment',
        sortOrder: 4,
      },
    }),
  ]);

  // 4. Create Attribute Types
  const attributeTypes = await Promise.all([
    prisma.attributeType.upsert({
      where: { code: 'color' },
      update: {},
      create: {
        name: 'Color',
        code: 'color',
        inputType: 'color',
        isRequired: false,
        sortOrder: 1,
      },
    }),
    prisma.attributeType.upsert({
      where: { code: 'material' },
      update: {},
      create: {
        name: 'Material',
        code: 'material',
        inputType: 'select',
        isRequired: false,
        sortOrder: 2,
      },
    }),
    prisma.attributeType.upsert({
      where: { code: 'handle_type' },
      update: {},
      create: {
        name: 'Handle Type',
        code: 'handle_type',
        inputType: 'select',
        isRequired: false,
        sortOrder: 3,
      },
    }),
    prisma.attributeType.upsert({
      where: { code: 'finish' },
      update: {},
      create: {
        name: 'Finish',
        code: 'finish',
        inputType: 'select',
        isRequired: false,
        sortOrder: 4,
      },
    }),
  ]);

  // 5. Create Attribute Values
  const colorType = attributeTypes.find(t => t.code === 'color')!;
  const materialType = attributeTypes.find(t => t.code === 'material')!;
  const handleType = attributeTypes.find(t => t.code === 'handle_type')!;
  const finishType = attributeTypes.find(t => t.code === 'finish')!;

  // Color values
  const colorValues = await Promise.all([
    prisma.attributeValue.upsert({
      where: { attributeTypeId_value: { attributeTypeId: colorType.id, value: 'white' } },
      update: {},
      create: {
        attributeTypeId: colorType.id,
        name: 'White',
        value: 'white',
        colorCode: '#FFFFFF',
        sortOrder: 1,
      },
    }),
    prisma.attributeValue.upsert({
      where: { attributeTypeId_value: { attributeTypeId: colorType.id, value: 'black' } },
      update: {},
      create: {
        attributeTypeId: colorType.id,
        name: 'Black',
        value: 'black',
        colorCode: '#000000',
        sortOrder: 2,
      },
    }),
    prisma.attributeValue.upsert({
      where: { attributeTypeId_value: { attributeTypeId: colorType.id, value: 'brown' } },
      update: {},
      create: {
        attributeTypeId: colorType.id,
        name: 'Brown',
        value: 'brown',
        colorCode: '#8B4513',
        sortOrder: 3,
      },
    }),
  ]);

  // Material values
  const materialValues = await Promise.all([
    prisma.attributeValue.upsert({
      where: { attributeTypeId_value: { attributeTypeId: materialType.id, value: 'oak' } },
      update: {},
      create: {
        attributeTypeId: materialType.id,
        name: 'Oak Wood',
        value: 'oak',
        sortOrder: 1,
      },
    }),
    prisma.attributeValue.upsert({
      where: { attributeTypeId_value: { attributeTypeId: materialType.id, value: 'pine' } },
      update: {},
      create: {
        attributeTypeId: materialType.id,
        name: 'Pine Wood',
        value: 'pine',
        sortOrder: 2,
      },
    }),
    prisma.attributeValue.upsert({
      where: { attributeTypeId_value: { attributeTypeId: materialType.id, value: 'metal' } },
      update: {},
      create: {
        attributeTypeId: materialType.id,
        name: 'Metal',
        value: 'metal',
        sortOrder: 3,
      },
    }),
  ]);

  // Handle values
  const handleValues = await Promise.all([
    prisma.attributeValue.upsert({
      where: { attributeTypeId_value: { attributeTypeId: handleType.id, value: 'chrome' } },
      update: {},
      create: {
        attributeTypeId: handleType.id,
        name: 'Chrome Handle',
        value: 'chrome',
        sortOrder: 1,
      },
    }),
    prisma.attributeValue.upsert({
      where: { attributeTypeId_value: { attributeTypeId: handleType.id, value: 'brass' } },
      update: {},
      create: {
        attributeTypeId: handleType.id,
        name: 'Brass Handle',
        value: 'brass',
        sortOrder: 2,
      },
    }),
  ]);

  console.log('✅ Product system seed completed!');
  console.log(`📊 Created:
  - ${stockStatuses.length} stock statuses
  - ${brands.length} brands
  - ${categories.length} categories  
  - ${attributeTypes.length} attribute types
  - ${colorValues.length + materialValues.length + handleValues.length} attribute values`);
}

// Helper function to generate product code
export async function generateProductCode(brandId: string): Promise<string> {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
  });

  if (!brand) {
    throw new Error('Brand not found');
  }

  // Increment counter
  const updatedBrand = await prisma.brand.update({
    where: { id: brandId },
    data: { productCounter: brand.productCounter + 1 },
  });

  // Generate code: GOO-001, GOO-002, etc.
  const productNumber = updatedBrand.productCounter.toString().padStart(3, '0');
  return `${brand.code}-${productNumber}`;
}

if (require.main === module) {
  seedProducts()
    .catch((e) => {
      console.error('❌ Product seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default seedProducts;