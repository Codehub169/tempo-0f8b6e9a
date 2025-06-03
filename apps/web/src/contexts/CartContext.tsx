import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import apiClient, { Cart, CartItem, Product } from '../lib/apiClient';

export interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  isAddingToCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

// Helper to calculate total items in cart
const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState<number>(0);
  const [addingProductId, setAddingProductId] = useState<string | null>(null); // To track specific item being added

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedCart = await apiClient.getCart();
      setCart(fetchedCart);
      setItemCount(calculateItemCount(fetchedCart.items));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cart');
      // Initialize an empty cart structure on error to prevent app crash
      setCart({ id: '', userId: '', items: [], subtotal: 0, tax: 0, total: 0, createdAt: '', updatedAt: '' });
      setItemCount(0);
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId: string, quantity: number) => {
    setAddingProductId(productId);
    setError(null);
    try {
      const updatedCart = await apiClient.addItemToCart(productId, quantity);
      setCart(updatedCart);
      setItemCount(calculateItemCount(updatedCart.items));
    } catch (err: any) {
      setError(err.message || 'Failed to add item to cart');
      console.error('Failed to add item to cart:', err);
      // Optionally re-fetch cart to ensure consistency if add fails partially
      await fetchCart(); 
    } finally {
      setAddingProductId(null);
    }
  };

  const removeFromCart = async (itemId: string) => {
    setLoading(true); // General loading for modifications other than add
    setError(null);
    try {
      const updatedCart = await apiClient.removeItemFromCart(itemId);
      setCart(updatedCart);
      setItemCount(calculateItemCount(updatedCart.items));
    } catch (err: any) {
      setError(err.message || 'Failed to remove item from cart');
      console.error('Failed to remove item from cart:', err);
      await fetchCart(); 
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updatedCart = await apiClient.updateCartItem(itemId, quantity);
      setCart(updatedCart);
      setItemCount(calculateItemCount(updatedCart.items));
    } catch (err: any) {
      setError(err.message || 'Failed to update item quantity');
      console.error('Failed to update item quantity:', err);
      await fetchCart(); 
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const updatedCart = await apiClient.clearCart();
      setCart(updatedCart);
      setItemCount(calculateItemCount(updatedCart.items));
    } catch (err: any) {
      setError(err.message || 'Failed to clear cart');
      console.error('Failed to clear cart:', err);
      await fetchCart(); 
    } finally {
      setLoading(false);
    }
  };

  const isAddingToCart = (productId: string) => addingProductId === productId;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        itemCount,
        addToCart,
        removeFromCart,
        updateItemQuantity,
        clearCart,
        fetchCart,
        isAddingToCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
