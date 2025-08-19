-- CreateTable
CREATE TABLE "public"."sliders" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "desktopImageUrl" TEXT NOT NULL,
    "mobileImageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sliders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sliders_sortOrder_idx" ON "public"."sliders"("sortOrder");

-- CreateIndex
CREATE INDEX "sliders_isActive_idx" ON "public"."sliders"("isActive");
