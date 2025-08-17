import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  href: string;
  imageUrl?: string;
  isOnSale?: boolean;
}

export function FeaturedProducts() {
  const t = useTranslations('HomePage.Products');

  // Temporary static data - būs aizstājama ar datubāzes datiem  
  const products: Product[] = [
    {
      id: '1',
      name: t('product1Name'),
      price: 299.99,
      originalPrice: 399.99,
      description: t('product1Desc'),
      href: '/products/modern-sofa',
      isOnSale: true
    },
    {
      id: '2',
      name: t('product2Name'), 
      price: 149.99,
      description: t('product2Desc'),
      href: '/products/wooden-table'
    },
    {
      id: '3',
      name: t('product3Name'),
      price: 89.99,
      description: t('product3Desc'),
      href: '/products/office-chair'
    },
    {
      id: '4',
      name: t('product4Name'),
      price: 199.99,
      description: t('product4Desc'),
      href: '/products/wardrobe'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {/* Placeholder for product image */}
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-4xl font-bold">{product.name[0]}</span>
                </div>
                {product.isOnSale && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                    {t('sale')}
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  <Link href={product.href} className="hover:text-blue-600">
                    {product.name}
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                
                <div className="flex items-center mb-3">
                  <span className="text-xl font-bold text-gray-900">
                    €{product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      €{product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                
                <AddToCartButton 
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl
                  }}
                  className="w-full"
                >
                  {t('addToCart')}
                </AddToCartButton>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/products" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border border-blue-600 hover:bg-blue-50 transition-colors">
            {t('viewAllProducts')}
          </Link>
        </div>
      </div>
    </section>
  );
}