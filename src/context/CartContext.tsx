import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CartItem, Product } from '../types';
import { cartService } from '../services/cartService';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface InternalCartItem extends CartItem {
  cartItemId?: number;
}

function mapFromDto(dto: { cartId: number; items: any[]; total: number }): InternalCartItem[] {
  return dto.items.map((item) => {
    const product: Product = {
      id: String(item.productId),
      name: item.productName,
      category: '',
      price: item.productPrice,
      image: item.imageUrl || '',
      description: '',
      specifications: {},
      stock: Number.MAX_SAFE_INTEGER,
      rating: 4.5,
      reviews: 0,
      brand: '',
    };

    return {
      cartItemId: item.cartItemId,
      product,
      quantity: item.quantity,
    };
  });
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<InternalCartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        const dto = await cartService.getCart();
        setCart(mapFromDto(dto));
      } catch (error: any) {
        // If unauthenticated or API not available, fall back to empty cart
        if (error?.status !== 401) {
          console.error('Failed to load cart', error);
        }
        setCart([]);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const syncFromDto = (dto: { cartId: number; items: any[]; total: number }) => {
    setCart(mapFromDto(dto));
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      const dto = await cartService.addItem(Number(product.id), quantity);
      syncFromDto(dto);
    } catch (error) {
      console.error('Failed to add to cart', error);
      // Optimistic fallback so UI still works if API fails
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.product.id === product.id);
        if (existingItem) {
          return prevCart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevCart, { product, quantity }];
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    if (!item?.cartItemId) {
      setCart((prevCart) => prevCart.filter((i) => i.product.id !== productId));
      return;
    }

    try {
      const dto = await cartService.removeItem(item.cartItemId);
      syncFromDto(dto);
    } catch (error) {
      console.error('Failed to remove from cart', error);
      setCart((prevCart) => prevCart.filter((i) => i.product.id !== productId));
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    const item = cart.find((i) => i.product.id === productId);
    if (!item?.cartItemId) {
      setCart((prevCart) =>
        prevCart.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        )
      );
      return;
    }

    try {
      const dto = await cartService.updateItem(item.cartItemId, quantity);
      syncFromDto(dto);
    } catch (error) {
      console.error('Failed to update cart quantity', error);
      setCart((prevCart) =>
        prevCart.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        )
      );
    }
  };

  const clearCart = async () => {
    try {
      const dto = await cartService.clearCart();
      syncFromDto(dto);
    } catch (error) {
      console.error('Failed to clear cart', error);
      setCart([]);
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
