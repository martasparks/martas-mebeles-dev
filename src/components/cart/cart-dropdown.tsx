'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/contexts/ToastContext';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function CartDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const cart = useCart();
  const toast = useToast();
  const t = useTranslations('Cart');

  const handleRemoveItem = (productId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    cart.removeItem(productId);
  };

  const handleQuantityChange = (productId: string, newQuantity: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const item = cart.getItem(productId);
    cart.updateQuantity(productId, newQuantity);
    
    if (item && newQuantity > item.quantity) {
      toast.showSuccess(`Daudzums palielināts`);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium relative"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 8a2 2 0 00-2 2m0 0a2 2 0 002 2h12.32a2 2 0 002-2m-2 0V9H7v4z" />
        </svg>
        <span>Grozs</span>
        {cart.totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {cart.totalItems}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 max-h-96 overflow-y-auto">
            {cart.isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Ielādē...</p>
              </div>
            ) : cart.items.length === 0 ? (
              <div className="p-4 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 8a2 2 0 00-2 2m0 0a2 2 0 002 2h12.32a2 2 0 002-2m-2 0V9H7v4z" />
                </svg>
                <p className="text-gray-500">Jūsu grozs ir tukšs</p>
              </div>
            ) : (
              <>
                <div className="p-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Iepirkumu grozs</h3>
                  <div className="space-y-2">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        {item.imageUrl && (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-sm text-gray-500">€{item.price.toFixed(2)}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <button
                              onClick={(e) => handleQuantityChange(item.productId, item.quantity - 1, e)}
                              className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                            >
                              -
                            </button>
                            <span className="text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={(e) => handleQuantityChange(item.productId, item.quantity + 1, e)}
                              className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleRemoveItem(item.productId, e)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-medium text-gray-900">Kopā:</span>
                    <span className="text-lg font-bold text-blue-600">{cart.formattedTotalPrice()}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Link
                      href="/cart"
                      className="w-full block text-center bg-gray-100 text-gray-900 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Apskatīt grozu
                    </Link>
                    <Link
                      href="/checkout"
                      className="w-full block text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Noformēt pasūtījumu
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}