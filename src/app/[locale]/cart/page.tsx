'use client';

import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useState, useEffect, useRef } from 'react';

export default function CartPage() {
  const cart = useCart();
  const toast = useToast();
  const { user, updateLastLogin } = useAuth();
  const t = useTranslations('Cart');
  const [isClearing, setIsClearing] = useState(false);
  const hasUpdatedLogin = useRef(false);
  
  // Update last login when user visits cart page (only once)
  useEffect(() => {
    if (user && !hasUpdatedLogin.current) {
      hasUpdatedLogin.current = true;
      updateLastLogin();
    }
  }, [user]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      cart.removeItem(productId);
    } else {
      cart.updateQuantity(productId, newQuantity);
      toast.showSuccess(t('quantityUpdated'));
    }
  };

  const handleClearCart = async () => {
    if (cart.items.length === 0) return;
    
    setIsClearing(true);
    try {
      cart.clearCart();
      toast.showSuccess(t('cartCleared'));
    } catch (error) {
      toast.showError(t('errorClearingCart'));
    } finally {
      setIsClearing(false);
    }
  };

  const shippingCost = 0; // Free shipping
  const grandTotal = cart.totalPrice + shippingCost;

  if (cart.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600">
            {cart.items.length > 0 
              ? `${cart.totalItems} ${t('itemsCount')}` 
              : t('emptyMessage')
            }
          </p>
        </div>

        {cart.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mb-6">
              <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 8a2 2 0 00-2 2m0 0a2 2 0 002 2h12.32a2 2 0 002-2m-2 0V9H7v4z" />
              </svg>
              <h2 className="text-2xl font-medium text-gray-900 mb-2">{t('emptyTitle')}</h2>
              <p className="text-gray-600 mb-6">{t('emptyMessage')}</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('continueShopping')}
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-900">
                    <div className="col-span-2">{t('product')}</div>
                    <div className="text-center">{t('price')}</div>
                    <div className="text-center">{t('quantity')}</div>
                    <div className="text-center">{t('total')}</div>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cart.items.map((item) => (
                    <div key={item.id} className="px-6 py-6">
                      <div className="grid grid-cols-5 gap-4 items-center">
                        {/* Product Info */}
                        <div className="col-span-2 flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                            {item.imageUrl ? (
                              <img 
                                src={item.imageUrl} 
                                alt={item.name}
                                className="w-full h-full object-cover rounded-md"
                              />
                            ) : (
                              <span className="text-gray-500 text-lg font-bold">
                                {item.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </h3>
                            <button
                              onClick={() => cart.removeItem(item.productId)}
                              className="text-sm text-red-600 hover:text-red-800 mt-1"
                            >
                              {t('removeItem')}
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-center">
                          <span className="text-sm font-medium text-gray-900">
                            €{Number(item.price).toFixed(2)}
                          </span>
                        </div>

                        {/* Quantity */}
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-medium transition-colors"
                              disabled={cart.isLoading}
                            >
                              -
                            </button>
                            <span className="text-sm font-medium min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-medium transition-colors"
                              disabled={cart.isLoading}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="text-center">
                          <span className="text-sm font-medium text-gray-900">
                            €{(Number(item.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Cart Actions */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <Link
                      href="/"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      {t('continueShopping')}
                    </Link>
                    
                    <button
                      onClick={handleClearCart}
                      disabled={isClearing || cart.isLoading}
                      className="inline-flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                    >
                      {isClearing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                          {t('clearing')}
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {t('clearCart')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">{t('summary')}</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('subtotal')}</span>
                    <span className="font-medium text-gray-900">€{cart.totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('shipping')}</span>
                    <span className="font-medium text-green-600">{t('freeShipping')}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-medium">
                      <span className="text-gray-900">{t('grandTotal')}</span>
                      <span className="text-gray-900">€{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Link 
                    href="/checkout"
                    className="w-full block text-center bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
                  >
                    {t('proceedToCheckout')}
                  </Link>
                  
                  <div className="text-center">
                    <span className="text-xs text-gray-500">
                      🚚 {t('freeShippingNote')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}