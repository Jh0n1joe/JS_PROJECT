import React, { useState } from 'react';
import { ShoppingBag, Minus, Plus, X, Utensils, Flame, Cookie } from 'lucide-react';
import type { Producto } from '../types';
import { TASA_BCV } from '../data/mockProductos';
import { useCartStore } from '../store/useCartStore';

interface Props {
  producto: Producto;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<Props> = ({ producto, onClose }) => {
  const [cantidad, setCantidad] = useState(1);
  const addToCart = useCartStore((state) => state.addToCart);

  // Formatear URL de imagen procedente de Django o fallback
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
  const rawImage = producto.imagen_url || (producto as any).imagen;

  const imageUrl = rawImage
    ? rawImage.startsWith('http')
      ? rawImage
      : `${apiUrl}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`
    : 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=600&q=80';

  const precioBs = (producto.precio_usd * TASA_BCV).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleAddToCart = () => {
    addToCart(producto, cantidad);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#14120e] border border-[#2a2419] rounded-2xl max-w-4xl w-full p-6 md:p-8 relative shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-full bg-neutral-900/50 z-10"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="bg-[#0b0a08] border border-[#231e15] rounded-xl p-6 flex items-center justify-center min-h-[320px]">
            <img
              src={imageUrl}
              alt={producto.nombre}
              className="max-h-72 object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)]"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=600&q=80';
              }}
            />
          </div>

          <div>
            <div className="flex items-center gap-3 text-xs mb-2">
              <span className="bg-[#241f16] text-neutral-300 px-3 py-1 rounded-full border border-[#383020]">
                {typeof producto.categoria === 'object'
                  ? (producto.categoria as any).nombre
                  : producto.subcategoria || producto.categoria}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                24/7 Disponible
              </span>
            </div>

            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              {producto.nombre}
            </h2>

            <div className="bg-[#1c1913] border border-[#332b1c] rounded-xl p-4 my-5">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-400">
                  ${producto.precio_usd.toFixed(2)}
                </span>
                <span className="text-neutral-500 font-bold text-sm">USD</span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Ref VED: Bs. {precioBs} <span className="text-neutral-500">(Tasa BCV)</span>
              </p>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center bg-[#1c1913] border border-[#332b1c] rounded-full p-1">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="p-2 text-neutral-400 hover:text-white transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center text-white font-bold">{cantidad}</span>
                <button
                  onClick={() => setCantidad(cantidad + 1)}
                  className="p-2 text-neutral-400 hover:text-white transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                <ShoppingBag size={18} />
                Añadir al Carrito
              </button>
            </div>

            <div>
              <h4 className="text-sm font-bold text-neutral-200 mb-1">Descripción del Producto</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">{producto.descripcion}</p>
            </div>

            {producto.maridajes && (
              <div className="mt-5">
                <h4 className="text-sm font-bold text-neutral-200 mb-2">Sugerencias de Maridaje</h4>
                <div className="grid grid-cols-3 gap-3">
                  {producto.maridajes.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-[#1c1913] border border-[#2c2518] rounded-xl p-2.5 flex flex-col items-center justify-center text-center gap-1.5"
                    >
                      {m.tipo === 'chocolate' && <Cookie size={18} className="text-amber-400" />}
                      {m.tipo === 'habano' && <Flame size={18} className="text-amber-400" />}
                      {m.tipo === 'carne' && <Utensils size={18} className="text-amber-400" />}
                      <span className="text-[11px] text-neutral-300 font-medium">{m.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};