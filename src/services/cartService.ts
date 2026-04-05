import api from './api';

export interface BackendCartItem {
    id: number | string; // The cart item ID specifically
    product: number | string; // The actual product ID
    product_name?: string;
    price?: string | number;
    image?: string;
    quantity: number;
}

// Ensure the frontend hooks (which might expect UI product variables) get what they need.
export interface CartItem {
    id: string;
    product_id: string | number;
    name?: string;
    price?: number;
    discountedPrice?: number;
    quantity: number;
    image?: string;
    discount?: number;
    color?: string;
}

export interface CartData {
    items: CartItem[];
}

export interface CartSummary {
    subtotal: string | number;
    discount: string | number;
    total: string | number;
    deliveryFee: string | number;
}

export const cartService = {
    getCart: async (): Promise<CartData> => {
        const response = await api.get('/cart/');

        // Transform the backend cart items if needed to match frontend expects.
        // We know from backend.txt: { id: 10, product: 1, product_name: "...", price: "649.00", quantity: 1 }
        const mappedItems: CartItem[] = response.data.items.map((i: BackendCartItem) => ({
            id: String(i.id),
            product_id: i.product,
            name: i.product_name,
            price: i.price ? Number(i.price) : 0,
            discountedPrice: i.price ? Number(i.price) : 0,
            image: i.image,
            quantity: i.quantity,
        }));

        return { items: mappedItems };
    },

    addToCart: async (payload: { product_id: string | number; quantity: number }): Promise<{ message: string }> => {
        const response = await api.post('/cart/add/', payload);
        return response.data;
    },

    updateCartItem: async (itemId: string | number, payload: { quantity: number }): Promise<{ message: string }> => {
        const response = await api.patch(`/cart/items/${itemId}/`, payload);
        return response.data;
    },

    removeCartItem: async (itemId: string | number): Promise<{ message: string }> => {
        const response = await api.delete(`/cart/items/${itemId}/`);
        return response.data;
    },

    clearCart: async (): Promise<{ message: string }> => {
        const response = await api.delete('/cart/');
        return response.data;
    },

    generateOrderSummary: async (): Promise<CartSummary> => {
        const response = await api.post('/cart/summary/', {});
        return response.data;
    },
};
