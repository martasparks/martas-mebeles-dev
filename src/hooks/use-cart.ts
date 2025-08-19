import { useCartStore } from '@/stores/cart-store';
import { useToast } from '@/contexts/ToastContext';

export function useCart() {
  const cart = useCartStore();
  const toast = useToast();
  
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