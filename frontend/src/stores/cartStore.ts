import { create } from 'zustand';
import { cartApi } from '../services/api';
import type { Cart, SkontoCalculation } from '../types';

interface CartState {
  cart: Cart | null;
  skonto: SkontoCalculation | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity: number, colorId?: number | null) => Promise<void>;
  updateItem: (productId: number, quantity: number, colorId?: number | null) => Promise<void>;
  removeItem: (productId: number, colorId?: number | null) => Promise<void>;
  clearLocal: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  skonto: null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await cartApi.get();
      set({ cart: data.data, skonto: data.skonto, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity, colorId) => {
    set({ isLoading: true });
    const { data } = await cartApi.add(productId, quantity, colorId);
    set({ cart: data.data, skonto: data.skonto, isLoading: false });
  },

  updateItem: async (productId, quantity, colorId) => {
    set({ isLoading: true });
    const { data } = await cartApi.update(productId, quantity, colorId);
    set({ cart: data.data, skonto: data.skonto, isLoading: false });
  },

  removeItem: async (productId, colorId) => {
    set({ isLoading: true });
    const { data } = await cartApi.remove(productId, colorId);
    set({ cart: data.data, skonto: data.skonto, isLoading: false });
  },

  clearLocal: () => set({ cart: null, skonto: null }),
}));
