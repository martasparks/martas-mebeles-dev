import prisma from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function ProductsPage() {
  const t = await getTranslations("Products");

  // Izvelkam produktus no DB
  const products = await prisma.product.findMany({
    where: {
      isVisible: true,
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">
                {product.mainImageUrl ? (
                  <img
                    src={product.mainImageUrl}
                    alt={product.name}
                    className="w-32 h-32 object-cover rounded mx-auto"
                  />
                ) : (
                  <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-blue-600 text-2xl font-bold">
                      {product.name[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {product.shortDescription || ""}
                </p>
                <p className="text-gray-900 font-bold mb-4">
                  {product.price.toString()} €
                </p>
                <Link
                  href={`/products/${product.slug}`}
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {t("viewProduct")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}