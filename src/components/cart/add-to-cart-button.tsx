'use client';

import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
  };
  quantity?: number;
  className?: string;
  children?: React.ReactNode;
}

export function AddToCartButton({ 
  product, 
  quantity = 1, 
  className = "",
  children 
}: AddToCartButtonProps) {
  const cart = useCart();
  const toast = useToast();
  const { user, updateLastLogin } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  
  const handleAddToCart = async () => {
    setIsAdding(true);
    
    try {
      cart.addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        imageUrl: product.imageUrl,
      });
      
      // Update last login on cart action (if user is logged in)
      if (user) {
        updateLastLogin();
      }
      
      // Show success state
      setJustAdded(true);
      
      // Show toast notification
      toast.showSuccess(
        `Pievienots grozam!`,
        product.name
      );
      
      // Reset after 2 seconds
      setTimeout(() => {
        setJustAdded(false);
      }, 2000);
      
    } catch (error) {
      toast.showError('Neizdevās pievienot produktu grozam');
    } finally {
      setIsAdding(false);
    }
  };
  
  const isInCart = cart.isInCart(product.id);
  const itemQuantity = cart.getItemQuantity(product.id);
  
  return (
    <div className="flex items-center space-x-2">
      {isInCart ? (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              cart.updateQuantity(product.id, itemQuantity - 1);
              if (itemQuantity === 1) {
                toast.showInfo(`Noņemts no groza`);
              }
            }}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-medium transition-colors"
            disabled={cart.isLoading}
          >
            -
          </button>
          <span className="text-sm font-medium min-w-[2rem] text-center">
            {itemQuantity}
          </span>
          <button
            onClick={() => {
              cart.updateQuantity(product.id, itemQuantity + 1);
              toast.showSuccess(`Daudzums palielināts`);
            }}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-medium transition-colors"
            disabled={cart.isLoading}
          >
            +
          </button>
        </div>
      ) : (
        <button
          onClick={handleAddToCart}
          disabled={isAdding || cart.isLoading || justAdded}
          className={`
            relative overflow-hidden px-4 py-2 rounded-md text-sm font-medium transition-all duration-300
            ${justAdded 
              ? 'bg-green-600 text-white' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
            disabled:cursor-not-allowed
            ${className}
          `}
        >
          <div className={`
            flex items-center justify-center space-x-2 transition-all duration-300
            ${justAdded ? 'opacity-100' : isAdding ? 'opacity-100' : 'opacity-100'}
          `}>
            {justAdded ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Pievienots!</span>
              </>
            ) : isAdding ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Pievieno...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 8a2 2 0 00-2 2m0 0a2 2 0 002 2h12.32a2 2 0 002-2m-2 0V9H7v4z" />
                </svg>
                <span>{children || 'Pievienot grozam'}</span>
              </>
            )}
          </div>
        </button>
      )}
    </div>
  );
}