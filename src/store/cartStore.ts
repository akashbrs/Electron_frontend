import { create } from 'zustand';
import { cartService } from '../services/cartService';
import type { CartData, CartItem } from '../services/cartService';

interface CartState {
    cart: CartData | null;
    isLoading: boolean;
    error: string | null;

    // Expose aggregated counters for UI components like header badges
    totalItemsCount: number;

    // Actions
    fetchCart: () => Promise<void>;
    addToCart: (productId: string, quantity: number) => Promise<void>;
    updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    generateSummary: () => Promise<void>;
    clearCartData: () => Promise<void>;
    clearError: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
    cart: null,
    isLoading: false,
    error: null,
    totalItemsCount: 0,

    clearError: () => set({ error: null }),

    clearCartData: async () => {
        set({ isLoading: true, error: null });
        try {
            await cartService.clearCart();
            set({ cart: null, totalItemsCount: 0, isLoading: false });
        } catch (e) {
            const error = e as Error;
            set({ error: error.message, isLoading: false });
        }
    },

    fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await cartService.getCart();
            const count = data.items.reduce((acc: number, item: CartItem) => acc + item.quantity, 0);
            set({ cart: data, totalItemsCount: count, isLoading: false });
        } catch (e) {
            const error = e as Error;
            set({ error: error.message, isLoading: false });
        }
    },

    addToCart: async (productId: string, quantity: number = 1) => {
        set({ isLoading: true, error: null });
        try {
            await cartService.addToCart({ product_id: productId, quantity });
            // Optimistically fetching the updated cart state immediately
            await get().fetchCart();
        } catch (e) {
            const error = e as Error;
            set({ error: error.message, isLoading: false });
        }
    },

    updateItemQuantity: async (itemId: string, quantity: number) => {
        set({ isLoading: true, error: null });
        try {
            if (quantity <= 0) {
                await cartService.removeCartItem(itemId);
            } else {
                await cartService.updateCartItem(itemId, { quantity });
            }
            await get().fetchCart(); // Sync fresh data
        } catch (e) {
            const error = e as Error;
            set({ error: error.message, isLoading: false });
        }
    },

    removeItem: async (itemId: string) => {
        set({ isLoading: true, error: null });
        try {
            await cartService.removeCartItem(itemId);
            await get().fetchCart(); // Sync fresh data
        } catch (e) {
            const error = e as Error;
            set({ error: error.message, isLoading: false });
        }
    },

    generateSummary: async () => {
        set({ isLoading: true, error: null });
        try {
            await cartService.generateOrderSummary();
            set({ isLoading: false });
            // Usually you would navigate to checkout here, handled externally
        } catch (e) {
            const error = e as Error;
            set({ error: error.message, isLoading: false });
            throw error; // Let UI know if summary generation failed
        }
    },
}));
