'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItemType {
  productId: string;
  variantId?: string | null;
  productName: string;
  productSlug: string;
  productImage: string;
  variantTitle?: string | null;
  price: number;
  originalPrice?: number;
  quantity: number;
  inStock: number;
}

export interface AppliedCouponType {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  discountAmount: number;
}

interface CartContextType {
  items: CartItemType[];
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  freeShippingThreshold: number;
  discountAmount: number;
  totalAmount: number;
  appliedCoupon: AppliedCouponType | null;
  addToCart: (item: Omit<CartItemType, 'quantity'>, quantity?: number) => void;
  updateQuantity: (productId: string, variantId: string | null | undefined, quantity: number) => void;
  removeFromCart: (productId: string, variantId?: string | null) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 1000000; // 1,000,000 VND
const DEFAULT_SHIPPING_FEE = 30000;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponType | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('vitacore_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedCoupon = localStorage.getItem('vitacore_coupon');
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('vitacore_cart', JSON.stringify(items));
      if (appliedCoupon) {
        localStorage.setItem('vitacore_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('vitacore_coupon');
      }
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }, [items, appliedCoupon, isLoaded]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Shipping logic: free if >= 1,000,000 VND
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : DEFAULT_SHIPPING_FEE;

  // Calculate discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.discountAmount && discountAmount > appliedCoupon.discountAmount) {
        discountAmount = appliedCoupon.discountAmount; // capped max discount
      }
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
    // Cannot discount more than subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }
  }

  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const addToCart = (newItem: Omit<CartItemType, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(updated[existingIndex].quantity + quantity, newItem.inStock);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      } else {
        return [...prev, { ...newItem, quantity: Math.min(quantity, newItem.inStock) }];
      }
    });
  };

  const updateQuantity = (productId: string, variantId: string | null | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          return { ...item, quantity: Math.min(quantity, item.inStock) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, variantId?: string | null) => {
    setItems((prev) =>
      prev.filter((item) => !(item.productId === productId && item.variantId === variantId))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Mã giảm giá không hợp lệ' };
      }

      setAppliedCoupon({
        code: data.coupon.code,
        description: data.coupon.description,
        discountType: data.coupon.discountType,
        discountValue: data.coupon.discountValue,
        discountAmount: data.discountAmount,
      });

      return { success: true, message: 'Áp dụng mã giảm giá thành công!' };
    } catch {
      return { success: false, message: 'Lỗi khi kiểm tra mã giảm giá' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        shippingFee,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        discountAmount,
        totalAmount,
        appliedCoupon,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

