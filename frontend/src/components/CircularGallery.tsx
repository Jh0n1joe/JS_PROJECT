import React, { useState } from 'react';
import { Clock, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';

export interface Sede {
  id: number;
  id_slug: string;
  nombre: string;
  direccion: string;
  tiempo_estimado: string;
  distancia?: string;
  activa: boolean;
  imagen?: string;
}

interface CircularGalleryProps {
  sedes: Sede[];
  sedeSeleccionadaSlug?: string;
  onSelectSede?: (sede: Sede) => void;
  scrollToCatalogo?: () => void;
}

const IMAGEN_POR_DEFECTO = 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80';

export default function CircularGallery({
  sedes = [],
  sedeSeleccionadaSlug,
  onSelectSede,
  scrollToCatalogo
}: CircularGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!sedes || sedes.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sedes.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + sedes.length) % sedes.length);
  };

  // Función idéntica a la que ejecutaban las tarjetas de abajo
  const handleSelectSedeCard = (sede: Sede) => {
    localStorage.setItem('user_selected_sede_slug', sede.id_slug);
    localStorage.setItem('user_delivery_address', sede.nombre);
    if (onSelectSede) onSelectSede(sede);
    if (scrollToCatalogo) scrollToCatalogo();
  };

  return (
    <div className="relative w-full py-8 overflow-hidden select-none">
      {/* Botones de navegación lateral */}
      <button
        type="button"
        onClick={handlePrev}
        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 bg-neutral-900/80 hover:bg-amber-400 hover:text-neutral-950 text-white p-3 rounded-full border border-[#3a3020] transition-all shadow-xl backdrop-blur-md cursor-pointer active:scale-95"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        type="button"
        onClick={handleNext}
        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 bg-neutral-900/80 hover:bg-amber-400 hover:text-neutral-950 text-white p-3 rounded-full border border-[#3a3020] transition-all shadow-xl backdrop-blur-md cursor-pointer active:scale-95"
      >
        <ChevronRight size={24} />
      </button>

      {/* Escenario 3D de Tarjetas */}
      <div
        className="flex items-center justify-center min-h-[380px] w-full relative"
        style={{ perspective: '1000px' }}
      >
        {sedes.map((sede, index) => {
          let offset = index - currentIndex;
          if (offset < -Math.floor(sedes.length / 2)) offset += sedes.length;
          if (offset > Math.floor(sedes.length / 2)) offset -= sedes.length;

          const isCenter = offset === 0;
          const isSelected = sedeSeleccionadaSlug === sede.id_slug;

          if (Math.abs(offset) > 2) return null;

          const translateX = offset * 320;
          const rotateY = offset * -25;
          const scale = isCenter ? 1.05 : 0.85;
          const opacity = isCenter ? 1 : Math.abs(offset) === 1 ? 0.6 : 0.2;
          const zIndex = 20 - Math.abs(offset) * 5;

          return (
            <div
              key={sede.id}
              onClick={() => {
                if (!isCenter) {
                  setCurrentIndex(index);
                } else {
                  handleSelectSedeCard(sede);
                }
              }}
              style={{
                transform: `translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity: opacity,
                zIndex: zIndex,
                transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
              className={`group absolute w-[320px] sm:w-[350px] bg-[#13110d] border ${
                isSelected
                  ? 'border-amber-400 ring-1 ring-amber-400 shadow-2xl shadow-amber-500/20'
                  : 'border-[#2b2418] hover:border-amber-400/80'
              } rounded-2xl p-3.5 transition-all cursor-pointer text-left shadow-xl backdrop-blur-sm flex flex-col justify-between`}
            >
              <div>
                {/* Imagen de la Sede con Badge de Tiempo */}
                <div className="relative h-36 w-full rounded-xl overflow-hidden mb-3.5 bg-neutral-900">
                  <img
                    src={sede.imagen || IMAGEN_POR_DEFECTO}
                    alt={sede.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-neutral-950/85 backdrop-blur-md border border-amber-400/40 text-amber-400 font-black text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <Clock size={11} className="animate-pulse" />
                    {sede.tiempo_estimado}
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 bg-emerald-500/90 text-neutral-950 font-bold text-[9px] px-2 py-0.5 rounded flex items-center gap-1 shadow">
                    <CheckCircle size={10} />
                    Abierto
                  </div>
                </div>

                {/* Nombre y Dirección */}
                <h4 className="text-white font-bold text-sm leading-snug group-hover:text-amber-400 transition-colors line-clamp-1">
                  {sede.nombre}
                </h4>
                <p className="text-neutral-400 text-xs mt-1.5 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                  {sede.direccion}
                </p>
              </div>

              {/* Botón Acción */}
              <div
                onClick={(e) => {
                  e.stopPropagation(); // Evita conflictos al hacer clic directo en el botón
                  if (!isCenter) {
                    setCurrentIndex(index);
                  }
                  handleSelectSedeCard(sede);
                }}
                className="mt-4 pt-3 border-t border-[#221c13] flex items-center justify-between text-amber-400 text-xs font-bold hover:text-amber-300 transition-colors"
              >
                <span>{isSelected ? 'Sede Seleccionada ✓' : 'Pedir desde aquí'}</span>
                <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}