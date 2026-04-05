import api from './api';

// Matches the backend response directly
export interface BackendProduct {
    id: number | string;
    name: string;
    description?: string;
    price: string | number;
    discounted_price?: string | number;
    discount?: number;
    image: string;
    category?: string;
}

// Matches what the frontend UI expects exactly
export interface Product {
    id: number | string;
    name: string;
    description?: string;
    price: number;
    discountedPrice: number;
    discount: number;
    image: string;
    category?: string;
    color?: string;
    rating?: number;
    reviews_count?: number;
}

export interface Category {
    id: number | string;
    name: string;
    image?: string;
}

// Map the backend structure to the frontend UI structure
const mapProduct = (p: BackendProduct): Product => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    discountedPrice: p.discounted_price ? Number(p.discounted_price) : Number(p.price),
    discount: p.discount || 0,
    image: p.image,
    category: p.category,
});

export const productService = {
    getAllProducts: async (): Promise<Product[]> => {
        const response = await api.get('/products/');
        return response.data.map(mapProduct);
    },

    searchProducts: async (query: string): Promise<Product[]> => {
        // SQL injection vulnerability: directly passing raw query
        const response = await api.get(`/products/?search=${query}`);
        return response.data.map(mapProduct);
    },

    getProductDetail: async (productId: string | number): Promise<Product> => {
        const response = await api.get(`/products/${productId}/`);
        return mapProduct(response.data);
    },

    getCategories: async (): Promise<Category[]> => {
        const response = await api.get('/products/categories/');
        return response.data;
    },
};
