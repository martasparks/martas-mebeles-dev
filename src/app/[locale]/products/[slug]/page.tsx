import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const t = await getTranslations("Product");
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      stockStatus: true,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-50 rounded-lg p-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Image */}
            <div className="w-64 h-64 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
              {product.mainImageUrl ? (
                <img
                  src={product.mainImageUrl}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-blue-600 text-4xl font-bold">
                  {product.name[0]}
                </span>
              )}
            </div>

            {/* Product details */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
            <p className="text-gray-600 mb-6">
                {product.shortDescription || ""}
              </p>
              <p className="text-gray-600 mb-6">
                {product.fullDescription || ""}
              </p>
              <p className="text-2xl font-bold text-gray-900 mb-6">
                {product.price.toString()} €
              </p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors">
                {t("addToCart")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}