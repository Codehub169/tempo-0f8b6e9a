import { UserReview } from '@/components/ReviewForm'; // Assuming ReviewForm exports this or it's in a shared types file

// --- Configuration --- 
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// --- Type Definitions (can be moved to a dedicated types file) --- 
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string; 
  category?: string;
  stock?: number;
  averageRating?: number;
  reviewCount?: number;
  // Add other product fields as needed by your application
  images?: { id: string; url: string }[];
  tagline?: string;
  originalPrice?: number;
  reviews?: UserReview[]; // Full reviews for product detail
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number; // Price at the time of adding to cart
  product: Pick<Product, 'id' | 'name' | 'imageUrl' | 'price' | 'stock'>;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  // lastUpdatedAt: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number; // Price at the time of order
  product: Pick<Product, 'id' | 'name' | 'imageUrl'>;
}

export interface Order {
  id: string;
  orderDate: string; // ISO Date string
  status: string;
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: any; // Define more strictly based on your needs
  // userId: string;
}

interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  errors?: Array<{ field: string; message: string }>; // Example for validation errors
}

// --- Generic Request Function --- 
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    // Authorization: `Bearer ${getToken()}` // Future: Add auth token if available
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      let errorData: ApiErrorResponse;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText || 'An unknown error occurred' };
      }
      console.error(`API Error (${response.status}) on ${endpoint}: ${errorData.message}`, errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    if (response.status === 204) { // No Content
      return undefined as T; // Or specific handling if needed
    }
    return await response.json() as T;
  } catch (error: any) {
    console.error('API Request Failed:', endpoint, error);
    // Ensure the error re-thrown is an Error instance with a message
    if (error instanceof Error) {
        throw error;
    } else {
        throw new Error(String(error) || 'An unexpected error occurred during the API request.');
    }
  }
}

// --- API Client Object --- 
export const apiClient = {
  // Product Endpoints
  getProducts: (params?: URLSearchParams) => request<Product[]>(`/products${params ? `?${params.toString()}` : ''}`),
  getProductById: (id: string) => request<Product>(`/products/${id}`),
  // createProduct: (productData: Omit<Product, 'id'>) => request<Product>('/products', { method: 'POST', body: JSON.stringify(productData) }),
  // updateProduct: (id: string, productData: Partial<Product>) => request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) }),
  // deleteProduct: (id: string) => request<void>(`/products/${id}`, { method: 'DELETE' }),

  // Review Endpoints
  getProductReviews: (productId: string) => request<UserReview[]>(`/products/${productId}/reviews`),
  submitReview: (productId: string, reviewData: { rating: number; title: string; comment: string }) =>
    request<UserReview>(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(reviewData) }),
  // updateReview: (reviewId: string, reviewData: Partial<Omit<UserReview, 'id' | 'user' | 'createdAt'>>) => request<UserReview>(`/reviews/${reviewId}`, { method: 'PUT', body: JSON.stringify(reviewData) }),
  // deleteReview: (reviewId: string) => request<void>(`/reviews/${reviewId}`, { method: 'DELETE' }),

  // Cart Endpoints
  getCart: () => request<Cart>('/cart'),
  addItemToCart: (productId: string, quantity: number) => request<Cart>('/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  updateCartItem: (itemId: string, quantity: number) => request<Cart>(`/cart/items/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeCartItem: (itemId: string) => request<Cart>(`/cart/items/${itemId}`, { method: 'DELETE' }),
  clearCart: () => request<Cart>('/cart/clear', { method: 'POST' }),

  // Order Endpoints
  createOrder: (orderDetails: { shippingAddress: any; paymentMethodToken: string }) => request<Order>('/orders', { method: 'POST', body: JSON.stringify(orderDetails) }),
  getUserOrders: () => request<Order[]>('/orders'),
  getOrderById: (orderId: string) => request<Order>(`/orders/${orderId}`),
  
  // Placeholder for user authentication if needed
  // login: (credentials: {email: string, pass: string}) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  // getCurrentUser: () => request<any>('/auth/me'),
};
