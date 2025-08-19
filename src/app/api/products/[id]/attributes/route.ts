import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = id;

  const attributes = await prisma.productAttribute.findMany({
    where: { productId },
    include: {
      attributeType: true,
      attributeValue: true,
    },
  });

  return NextResponse.json(attributes);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = id;
  const body = await req.json();
  const { typeName, valueName } = body;

  let type = await prisma.attributeType.findFirst({ where: { name: typeName } });
  if (!type) {
    type = await prisma.attributeType.create({
      data: {
        name: typeName,
        code: typeName.toLowerCase().replace(/\s+/g, "_"),
      },
    });
  }

  let value = await prisma.attributeValue.findFirst({
    where: { value: valueName, attributeTypeId: type.id },
  });
  if (!value) {
    value = await prisma.attributeValue.create({
      data: {
        name: valueName,
        value: valueName,
        attributeTypeId: type.id,
      },
    });
  }

  await prisma.productAttribute.create({
    data: {
      productId,
      attributeTypeId: type.id,
      attributeValueId: value.id,
    },
  });

  return NextResponse.json({ success: true });
}
