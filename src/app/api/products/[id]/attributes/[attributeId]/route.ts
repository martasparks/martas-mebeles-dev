import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT - Atjaunināt atribūtu
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; attributeId: string }> }
) {
  const { id, attributeId } = await params;
  const body = await req.json();
  const { typeName, valueName } = body;

  try {
    console.log("Updating attribute:", { id, attributeId, typeName, valueName });

    // Atrodam esošo atribūtu
    const existingAttribute = await prisma.productAttribute.findUnique({
      where: { id: attributeId },
      include: {
        attributeType: true,
        attributeValue: true,
      },
    });

    if (!existingAttribute) {
      console.log("Attribute not found:", attributeId);
      return NextResponse.json({ error: "Atribūts nav atrasts" }, { status: 404 });
    }

    // Atrodam vai izveidojam jauno AttributeType
    let type = await prisma.attributeType.findFirst({ where: { name: typeName } });
    if (!type) {
      type = await prisma.attributeType.create({
        data: {
          name: typeName,
          code: typeName.toLowerCase().replace(/\s+/g, "_"),
        },
      });
    }

    // Atrodam vai izveidojam jauno AttributeValue
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

    // Atjauninām ProductAttribute
    const updatedAttribute = await prisma.productAttribute.update({
      where: { id: attributeId },
      data: {
        attributeTypeId: type.id,
        attributeValueId: value.id,
      },
      include: {
        attributeType: true,
        attributeValue: true,
      },
    });

    return NextResponse.json(updatedAttribute);
  } catch (error) {
    console.error("Error updating attribute:", error);
    return NextResponse.json({ error: "Kļūda atjauninot atribūtu" }, { status: 500 });
  }
}

// DELETE - Dzēst atribūtu
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; attributeId: string }> }
) {
  const { attributeId } = await params;

  try {
    console.log("Deleting attribute:", attributeId);

    await prisma.productAttribute.delete({
      where: { id: attributeId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting attribute:", error);
    return NextResponse.json({ error: "Kļūda dzēšot atribūtu" }, { status: 500 });
  }
}
