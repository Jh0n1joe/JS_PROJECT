import React from 'react';
import { ShoppingCart } from 'lucide-react';
import type { Producto } from '../types';
import { useCartStore } from '../store/useCartStore';

interface Props {
  producto: Producto;
  onSelect: (producto: Producto) => void;
}

export const OfferCard: React.FC<Props> = ({ producto, onSelect }) => {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <div className="bg-[#181612] border border-[#2c261b] rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/50 transition-all group shadow-xl">
      <div className="relative">
        {/* Badge de Descuento */}
        {producto.descuento_porcentaje && (
          <span className="absolute top-2 left-2 bg-[#2c2518] text-amber-400 border border-amber-500/30 text-[11px] font-black px-2 py-0.5 rounded-md z-10">
            -{producto.descuento_porcentaje}%
          </span>
        )}

        {/* Imagen centrada y clickable */}
        <div 
          onClick={() => onSelect(producto)}
          className="h-44 flex items-center justify-center p-2 cursor-pointer bg-[#0e0d0a] rounded-xl overflow-hidden mb-4"
        >
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Info del producto */}
        <div onClick={() => onSelect(producto)} className="cursor-pointer">
          <h3 className="text-white font-bold text-base line-clamp-1 group-hover:text-amber-400 transition-colors">
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
          onClick={(e) => {
            e.stopPropagation();
            addToCart(producto);
          }}
          className="bg-amber-400 hover:bg-amber-500 text-neutral-950 p-2.5 rounded-full transition-colors shadow-lg shadow-amber-500/10"
        >
          <ShoppingCart size={16} />
        </button>
      </div>
    </div>
  );
};