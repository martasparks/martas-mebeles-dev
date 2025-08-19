import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface CartState {
  // State
  items: CartItem[];
  guestId: string;
  isLoading: boolean;
  isHydrated: boolean;
  
  // Computed values
  totalItems: number;
  totalPrice: number;
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  
  // Sync actions
  syncToServer: () => Promise<void>;
  loadFromServer: () => Promise<void>;
}

// Generate or get existing guest ID
const getGuestId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let guestId = localStorage.getItem('cart_guest_id');
  if (!guestId) {
    guestId = uuidv4();
    localStorage.setItem('cart_guest_id', guestId);
  }
  return guestId;
};

// Calculate derived state
const calculateTotals = (items: CartItem[]) => ({
  totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
  totalPrice: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
});

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      guestId: '',
      isLoading: false,
      isHydrated: false,
      totalItems: 0,
      totalPrice: 0,

      // Actions
      addItem: (newItem) => {
        const items = get().items;
        const existingItemIndex = items.findIndex(item => item.productId === newItem.productId);
        
        let updatedItems: CartItem[];
        
        if (existingItemIndex >= 0) {
          // Update existing item quantity
          updatedItems = items.map((item, index) => 
            index === existingItemIndex 
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          );
        } else {
          // Add new item
          updatedItems = [...items, { ...newItem, id: uuidv4() }];
        }
        
        const totals = calculateTotals(updatedItems);
        set({ 
          items: updatedItems,
          ...totals
        });
        
        // Sync to server in background
        get().syncToServer();
      },

      removeItem: (productId) => {
        const items = get().items;
        const updatedItems = items.filter(item => item.productId !== productId);
        const totals = calculateTotals(updatedItems);
        
        set({ 
          items: updatedItems,
          ...totals
        });
        
        // Sync to server in background
        get().syncToServer();
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        const items = get().items;
        const updatedItems = items.map(item => 
          item.productId === productId 
            ? { ...item, quantity }
            : item
        );
        
        const totals = calculateTotals(updatedItems);
        set({ 
          items: updatedItems,
          ...totals
        });
        
        // Sync to server in background
        get().syncToServer();
      },

      clearCart: () => {
        set({ 
          items: [],
          totalItems: 0,
          totalPrice: 0
        });
        
        // Sync to server in background
        get().syncToServer();
      },

      setItems: (items) => {
        const totals = calculateTotals(items);
        set({ 
          items,
          ...totals
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),
      
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),

// Sync to server
syncToServer: async () => {
  const { items, guestId, isHydrated } = get();
  
  // Don't sync if not hydrated yet or no items
  if (!isHydrated || typeof window === 'undefined') return;
  
  try {
    set({ isLoading: true });
    
    const response = await fetch('/api/cart/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        guestId: guestId || null,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
        }))
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to sync cart to server:', errorText);
    }
  } catch (error) {
    console.error('Error syncing cart to server:', error);
  } finally {
    set({ isLoading: false });
  }
},

      // Load from server
      loadFromServer: async () => {
        const { guestId } = get();
        
        if (!guestId || typeof window === 'undefined') return;
        
        try {
          set({ isLoading: true });
          
          const response = await fetch(`/api/cart?guestId=${guestId}`);
          
          if (response.ok) {
            const data = await response.json();
            if (data.cart && data.cart.items) {
              const serverItems: CartItem[] = data.cart.items.map((item: Record<string, unknown>) => ({
                id: item.id,
                productId: item.productId,
                name: item.name,
                price: parseFloat(item.price as string),
                quantity: item.quantity,
                imageUrl: item.imageUrl,
              }));
              
              get().setItems(serverItems);
            }
          }
        } catch (error) {
          console.error('Error loading cart from server:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Initialize guest ID and set hydrated state
        if (state) {
          const guestId = getGuestId();
          state.guestId = guestId;
          state.isHydrated = true;
          
          // Calculate totals on rehydration
          const totals = calculateTotals(state.items);
          state.totalItems = totals.totalItems;
          state.totalPrice = totals.totalPrice;
          
          // Only load from server if user is not logged in
          // If user is logged in, useCart hook will handle merging
          setTimeout(() => {
            const isLoggedIn = document.cookie.includes('sb-');
            if (!isLoggedIn) {
              state.loadFromServer();
            }
          }, 100);
        }
      },
      partialize: (state) => ({
        items: state.items,
        guestId: state.guestId,
      }),
    }
  )
);