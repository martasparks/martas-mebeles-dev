import { useEffect } from 'react';
import { useCartStore } from '@/stores/cart-store';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export function useCart() {
  const cart = useCartStore();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  
  // Handle auth state changes
  useEffect(() => {
    if (authLoading || !cart.isHydrated) return;
    
    // When user logs in, merge guest cart with user cart
    if (user && cart.guestId) {
      mergeGuestCartWithUserCart();
    }
    
    // When user logs out, ensure we have a guest ID
    if (!user && !cart.guestId) {
      // This should not happen due to store persistence, but just in case
      const guestId = generateGuestId();
      cart.guestId = guestId;
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
          guestId: cart.guestId
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.cart && data.cart.items) {
          // Update local cart with merged data
          const serverItems = data.cart.items.map((item: any) => ({
            id: item.id,
            productId: item.productId,
            name: item.name,
            price: parseFloat(item.price),
            quantity: item.quantity,
            imageUrl: item.imageUrl,
          }));
          
          cart.setItems(serverItems);
          
          // Clear guest ID since we're now a logged-in user
          if (typeof window !== 'undefined') {
            localStorage.removeItem('cart_guest_id');
          }
        }
      }
    } catch (error) {
      console.error('Error merging cart:', error);
    } finally {
      cart.setLoading(false);
    }
  };
  
  const generateGuestId = (): string => {
    const { v4: uuidv4 } = require('uuid');
    const guestId = uuidv4();
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart_guest_id', guestId);
    }
    return guestId;
  };
  
  return {
    ...cart,
    
    // Enhanced actions with better UX
    addItem: (item: Parameters<typeof cart.addItem>[0]) => {
      cart.addItem(item);
    },
    
    removeItem: (productId: string) => {
      const item = cart.items.find(i => i.productId === productId);
      cart.removeItem(productId);
      
      // Show toast notification
      if (item) {
        toast.showInfo(`Noņemts no groza`, item.name);
      }
    },
    
    // Helper methods
    getItem: (productId: string) => {
      return cart.items.find(item => item.productId === productId);
    },
    
    getItemQuantity: (productId: string) => {
      const item = cart.items.find(item => item.productId === productId);
      return item?.quantity || 0;
    },
    
    isInCart: (productId: string) => {
      return cart.items.some(item => item.productId === productId);
    },
    
    // Format total price
    formattedTotalPrice: () => {
      return `€${cart.totalPrice.toFixed(2)}`;
    },
  };
}