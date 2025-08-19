import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const stockStatuses = await prisma.stockStatus.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ stockStatuses });
  } catch (error) {
    console.error("Error fetching stock statuses:", error);
    return NextResponse.json({ error: "Failed to fetch stock statuses" }, { status: 500 });
  }
}