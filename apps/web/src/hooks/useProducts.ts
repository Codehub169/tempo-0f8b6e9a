import { useState, useEffect, useCallback } from 'react';
import apiClient, { Product } from '../lib/apiClient';

export interface FetchProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string; // Category name or ID, depends on API implementation
  sortBy?: 'name' | 'price' | 'createdAt' | 'averageRating';
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginatedProductsResponse {
  products: Product[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

interface UseProductsReturn {
  data: PaginatedProductsResponse | null;
  loading: boolean;
  error: string | null;
  fetchProducts: (params?: FetchProductsParams) => void;
}

const useProducts = (initialParams?: FetchProductsParams): UseProductsReturn => {
  const [data, setData] = useState<PaginatedProductsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentParams, setCurrentParams] = useState<FetchProductsParams | undefined>(initialParams);

  const fetchProducts = useCallback(async (params: FetchProductsParams = {}) => {
    setLoading(true);
    setError(null);
    
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    if (params.minPrice !== undefined) query.append('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined) query.append('maxPrice', String(params.maxPrice));

    const queryString = query.toString();
    const url = `/products${queryString ? `?${queryString}` : ''}`;

    try {
      // apiClient.getProducts() is simple, so we use apiClient.request directly to pass constructed url
      const response = await apiClient.request<PaginatedProductsResponse>({ url, method: 'GET' });
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      console.error('Failed to fetch products:', err);
      setData(null); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(currentParams);
  }, [fetchProducts, currentParams]);

  // Function to update params and trigger refetch
  const updateAndFetchProducts = (newParams?: FetchProductsParams) => {
    setCurrentParams(prevParams => ({ ...prevParams, ...newParams }));
  };

  return { data, loading, error, fetchProducts: updateAndFetchProducts };
};

export default useProducts;
