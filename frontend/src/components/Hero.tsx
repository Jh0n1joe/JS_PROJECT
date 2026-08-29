// src/components/Hero.tsx
import React from 'react';
import { MapPin, Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <div className="relative bg-[#0d0c0a] py-20 px-6 border-b border-[#2a2419] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-[#0d0c0a] to-[#0d0c0a] pointer-events-none" />

      <div className="max-w-3xl mx-auto text-center relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Disponible 24/7
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
          La Noche es Joven. <br />
          <span className="text-amber-400">Nosotros También.</span>
        </h1>

        <p className="text-neutral-400 text-sm md:text-base mt-4 max-w-xl">
          Licores premium entregados a tu puerta en minutos. Cuando la celebración no puede esperar.
        </p>

        <div className="mt-8 w-full max-w-lg flex items-center bg-[#1a1712] border border-[#383020] rounded-xl p-1.5 shadow-2xl">
          <div className="pl-3 text-neutral-500">
            <MapPin size={20} />
          </div>
          <input
            type="text"
            placeholder="Ingresa tu dirección de entrega..."
            className="w-full bg-transparent border-none text-white text-sm focus:outline-none px-3 placeholder-neutral-500"
          />
          <button className="bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold px-5 py-3 rounded-lg text-sm whitespace-nowrap transition-colors flex items-center gap-2">
            <Sparkles size={16} />
            Pedir Ahora
          </button>
        </div>
      </div>
    </div>
  );
};