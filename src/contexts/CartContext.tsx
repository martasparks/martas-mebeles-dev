'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCartStore } from '@/stores/cart-store';

type CartContextType = {
  // This context just handles cart merge logic
  // Actual cart state comes from zustand store
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const cart = useCartStore();
  const hasMerged = useRef(false);
  
  // Handle auth state changes - ONLY merge logic here
  useEffect(() => {
    if (authLoading || !cart.isHydrated) return;
    
    // When user logs in, merge guest cart with user cart (only once)
    if (user && cart.guestId && !hasMerged.current) {
      hasMerged.current = true;
      // Add delay to avoid racing with zustand rehydration
      setTimeout(() => {
        mergeGuestCartWithUserCart();
      }, 200);
    }
    
    // When user logs out, reset merge flag
    if (!user) {
      hasMerged.current = false;
    }
  }, [user, authLoading, cart.isHydrated]);
  
  const mergeGuestCartWithUserCart = async () => {
    try {
      cart.setLoading(true);
      
      const response = await fetch('/api/cart/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestId: cart.guestId || null
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.cart && data.cart.items) {
          // Update local cart with merged data
          const serverItems = data.cart.items.map((item: Record<string, unknown>) => ({
            id: item.id,
            productId: item.productId,
            name: item.name,
            price: parseFloat(item.price as string),
            quantity: item.quantity,
            imageUrl: item.imageUrl,
          }));
          
          cart.setItems(serverItems);
          
          // Clear guest ID since we're now a logged-in user
          if (typeof window !== 'undefined') {
            localStorage.removeItem('cart_guest_id');
          }
        }
      } else {
        const errorData = await response.text();
        console.error('Cart merge failed:', errorData);
      }
    } catch (error) {
      console.error('Error merging cart:', error);
    } finally {
      cart.setLoading(false);
    }
  };

  const value = {};

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartProvider() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartProvider must be used within a CartProvider');
  }
  return context;
}