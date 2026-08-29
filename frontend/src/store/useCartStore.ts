import { create } from 'zustand';
import type { Producto, ItemCarrito } from '../types';

interface CartState {
  cart: ItemCarrito[];
  addToCart: (producto: Producto, cantidad?: number) => void;
  removeFromCart: (productoId: number) => void;
  updateQuantity: (productoId: number, cantidad: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: [],

  addToCart: (producto, cantidad = 1) =>
    set((state) => {
      const itemExistente = state.cart.find((i) => i.producto.id === producto.id);
      if (itemExistente) {
        return {
          cart: state.cart.map((i) =>
            i.producto.id === producto.id
              ? { ...i, cantidad: i.cantidad + cantidad }
              : i
          ),
        };
      }
      return { cart: [...state.cart, { producto, cantidad }] };
    }),

  removeFromCart: (productoId) =>
    set((state) => ({
      cart: state.cart.filter((i) => i.producto.id !== productoId),
    })),

  updateQuantity: (productoId, cantidad) =>
    set((state) => ({
      cart: state.cart
        .map((i) => (i.producto.id === productoId ? { ...i, cantidad } : i))
        .filter((i) => i.cantidad > 0),
    })),

  clearCart: () => set({ cart: [] }),
}));