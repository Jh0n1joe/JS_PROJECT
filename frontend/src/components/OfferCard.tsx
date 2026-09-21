import React from 'react';
import { ShoppingCart, CheckCircle2, XCircle } from 'lucide-react';
import type { Producto } from '../types';
import { useCartStore } from '../store/useCartStore';

interface Props {
  producto: Producto;
  selectedSede?: string | null;
  onSelect: (producto: Producto) => void;
}

export const OfferCard: React.FC<Props> = ({ producto, selectedSede, onSelect }) => {
  const addToCart = useCartStore((state) => state.addToCart);

  // 1. Evaluación estricta de Stock
  const tieneStock = (producto.stock ?? 0) > 0;

  // 2. Un producto está disponible para comprar si tiene stock
  const sePuedeComprar = tieneStock;

  return (
    <div 
      className={`bg-[#181612] border rounded-2xl p-4 flex flex-col justify-between transition-all group shadow-xl relative ${
        sePuedeComprar 
          ? 'border-[#2c261b] hover:border-amber-500/50' 
          : 'border-red-950/40 opacity-70'
      }`}
    >
      <div className="relative">
        {/* Badge de Descuento */}
        {producto.descuento_porcentaje && (
          <span className="absolute top-2 left-2 bg-[#2c2518] text-amber-400 border border-amber-500/30 text-[11px] font-black px-2 py-0.5 rounded-md z-10">
            -{producto.descuento_porcentaje}%
          </span>
        )}

        {/* Badge de Disponibilidad de Stock en la Sede */}
        <div className="absolute top-2 right-2 z-10">
          {tieneStock ? (
            <span className="bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
              <CheckCircle2 size={11} />
              Disponible
            </span>
          ) : (
            <span className="bg-red-950/90 border border-red-500/40 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
              <XCircle size={11} />
              Agotado en sede
            </span>
          )}
        </div>

        {/* Imagen centrada y clickable */}
        <div 
          onClick={() => sePuedeComprar && onSelect(producto)}
          className={`h-44 flex items-center justify-center p-2 bg-[#0e0d0a] rounded-xl overflow-hidden mb-4 ${
            sePuedeComprar ? 'cursor-pointer' : 'cursor-not-allowed'
          }`}
        >
          <img
            src={producto.imagen || producto.imagen_url || "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500"}
            alt={producto.nombre}
            className={`max-h-full object-contain transition-transform duration-300 ${
              sePuedeComprar ? 'group-hover:scale-105' : 'grayscale'
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500";
            }}
          />
        </div>

        {/* Info del producto */}
        <div 
          onClick={() => sePuedeComprar && onSelect(producto)} 
          className={sePuedeComprar ? 'cursor-pointer' : 'cursor-not-allowed'}
        >
          <h3 className={`font-bold text-base line-clamp-1 transition-colors ${
            sePuedeComprar ? 'text-white group-hover:text-amber-400' : 'text-neutral-400'
          }`}>
            {producto.nombre}
          </h3>
          <p className="text-neutral-500 text-xs mt-0.5 font-medium line-clamp-1">
            {producto.subcategoria || producto.categoria}
          </p>
        </div>
      </div>

      {/* Precio y Botón de añadir rápido */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#262016]">
        <div>
          {producto.precio_anterior_usd && (
            <span className="text-neutral-500 text-xs line-through block leading-none">
              ${producto.precio_anterior_usd.toFixed(2)}
            </span>
          )}
          <span className="text-amber-400 font-extrabold text-lg leading-tight">
            ${producto.precio_usd.toFixed(2)}
          </span>
        </div>

        <button
          disabled={!sePuedeComprar}
          onClick={(e) => {
            e.stopPropagation();
            if (sePuedeComprar) addToCart(producto);
          }}
          className={`p-2.5 rounded-full transition-colors shadow-lg ${
            sePuedeComprar
              ? 'bg-amber-400 hover:bg-amber-500 text-neutral-950 shadow-amber-500/10 cursor-pointer active:scale-95'
              : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
          }`}
        >
          <ShoppingCart size={16} />
        </button>
      </div>
    </div>
  );
};