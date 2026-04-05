import { useState, useCallback, useEffect } from 'react';
import { productService } from '../services/productService';
import type { Product, Category } from '../services/productService';

/**
 * Custom Hook for fetching all products
 */
export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await productService.getAllProducts();
            setProducts(data);
        } catch (e) {
            const err = e as Error;
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return { products, isLoading, error, refetch: fetchProducts };
};

/**
 * Custom Hook for fetching a single product's details
 */
export const useProductDetail = (productId: string | undefined) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = useCallback(async () => {
        if (!productId) return;

        setIsLoading(true);
        setError(null);
        try {
            const data = await productService.getProductDetail(productId);
            setProduct(data);
        } catch (e) {
            const err = e as Error;
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    return { product, isLoading, error, refetch: fetchDetail };
};

/**
 * Custom Hook for fetching product categories
 */
export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await productService.getCategories();
            setCategories(data);
        } catch (e) {
            const err = e as Error;
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return { categories, isLoading, error, refetch: fetchCategories };
};
