'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';

interface Brand {
  id: string;
  name: string;
  code: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface StockStatus {
  id: string;
  name: string;
  code: string;
  color?: string;
}

interface Product {
  id: string;
  code: string;
  name: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  stock: number;
  isVisible: boolean;
  slug: string;
  mainImageUrl?: string;
  brand: Brand;
  category: Category;
  stockStatus: StockStatus;
  createdAt: string;
}

export function FeaturedProducts() {
  const t = useTranslations('HomePage.Products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      // Load first 4 visible products
      const response = await fetch('/api/products?visible=true&limit=4');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error loading featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('lv-LV', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(numPrice);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('title')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-3 w-2/3"></div>
                  <div className="h-6 bg-gray-200 rounded mb-3 w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nav pieejamu produktu</h3>
            <p className="text-gray-500">Produkti tiks pievienoti drīzumā.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  {/* Product image */}
                  <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                    {product.mainImageUrl ? (
                      <img
                        src={product.mainImageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <span className={`text-gray-500 text-4xl font-bold ${product.mainImageUrl ? 'hidden' : ''}`}>
                      {product.name.charAt(0)}
                    </span>
                  </div>
                  {product.salePrice && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                      {t('sale')}
                    </div>
                  )}
                  {/* Brand badge */}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded">
                    {product.brand.name}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                      {product.code}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    <Link href={`/products/${product.slug}`} className="hover:text-blue-600">
                      {product.name}
                    </Link>
                  </h3>
                  
                  {product.shortDescription && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.shortDescription}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {product.salePrice ? (
                        <>
                          <span className="text-xl font-bold text-red-600">
                            {formatPrice(product.salePrice)}
                          </span>
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            {formatPrice(product.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {product.category.name}
                    </div>
                  </div>
                  
                  {/* Stock status */}
                  <div className="mb-3">
                    <span 
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full text-white"
                      style={{ backgroundColor: product.stockStatus.color || '#6B7280' }}
                    >
                      {product.stockStatus.name}
                    </span>
                  </div>
                  
                  <AddToCartButton 
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.salePrice || product.price,
                      imageUrl: product.mainImageUrl
                    }}
                    className="w-full"
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? 'Nav noliktavā' : t('addToCart')}
                  </AddToCartButton>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <Link href="/products" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border border-blue-600 hover:bg-blue-50 transition-colors">
            {t('viewAllProducts')}
          </Link>
        </div>
      </div>
    </section>
  );
}