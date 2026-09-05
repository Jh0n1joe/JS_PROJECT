import React from 'react';
import { X, CheckCircle2, Clock, Phone, MessageSquare, Bike, Home, GlassWater } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      {/* Contenedor Principal (Simula la pantalla completa con mapa de fondo) */}
      <div className="relative w-full max-w-5xl h-[650px] bg-[#0d0c0a] border border-[#2a2419] rounded-3xl overflow-hidden shadow-2xl flex">
        
        {/* PANEL IZQUIERDO: SEGUIMIENTO (OVERLAY) */}
        <div className="w-full md:w-[420px] bg-[#12100d]/95 backdrop-blur-xl border-r border-[#262016] p-6 flex flex-col justify-between z-10 overflow-y-auto">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#262016] pb-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Order #MG-8429</h2>
                <p className="text-neutral-400 text-xs mt-1">Expected today at 02:45 AM</p>
              </div>
              <button
                onClick={onClose}
                type="button"
                className="w-9 h-9 bg-[#1c1914] border border-[#332a1b] rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:border-amber-400 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Arriving In Card con el ícono Clock integrado */}
            <div className="my-6 bg-[#1b1712] border border-[#382e1c] rounded-2xl p-5 text-center shadow-inner relative overflow-hidden">
              <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Clock size={14} className="animate-pulse" />
                Arriving in
              </div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-black text-amber-400 tracking-tight">12</span>
                <span className="text-xl font-bold text-amber-400/90 uppercase">MIN</span>
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Order Status</h3>
              
              <div className="relative pl-6 space-y-6 border-l-2 border-[#2b2418] ml-2">
                {/* Step 1: Recibido */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-neutral-950 stroke-[3]" />
                  </div>
                  <h4 className="text-white font-bold text-sm leading-none">Recibido</h4>
                  <p className="text-neutral-500 text-xs mt-1">02:15 AM</p>
                </div>

                {/* Step 2: Preparando */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-neutral-950 stroke-[3]" />
                  </div>
                  <h4 className="text-white font-bold text-sm leading-none">Preparando</h4>
                  <p className="text-neutral-400 text-xs mt-1">02:22 AM - Empacando botellas</p>
                </div>

                {/* Step 3: En Camino (Active) */}
                <div className="relative">
                  <div className="absolute -left-[35px] -top-0.5 w-6 h-6 rounded-full border-2 border-amber-400 bg-[#12100d] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  </div>
                  <h4 className="text-amber-400 font-extrabold text-sm leading-none">En Camino</h4>
                  <p className="text-neutral-300 text-xs mt-1 font-medium">Tu driver está cerca</p>
                </div>

                {/* Step 4: Entregado */}
                <div className="relative opacity-40">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border border-neutral-600 bg-[#12100d]" />
                  <h4 className="text-neutral-400 font-semibold text-sm leading-none">Entregado</h4>
                  <p className="text-neutral-600 text-xs mt-1">Pendiente</p>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Information Card */}
          <div className="bg-[#191611] border border-[#2e261a] rounded-2xl p-4 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-neutral-800 border border-amber-400/50 overflow-hidden shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Driver Carlos M."
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-bold text-sm">Carlos M.</h4>
                  <span className="text-amber-400 text-xs font-bold flex items-center gap-0.5">
                    ★ 4.9
                  </span>
                </div>
                <p className="text-neutral-400 text-xs mt-0.5">Moto Yamaha Bera - Placa AB123C</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                type="button"
                className="bg-[#242019] hover:bg-[#2d2820] text-white font-semibold py-2.5 px-3 rounded-xl border border-[#382f21] text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare size={14} />
                Chat
              </button>
              <button
                type="button"
                className="bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-amber-500/10"
              >
                <Phone size={14} />
                Llamar
              </button>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: MAPA EN VIVO */}
        <div className="hidden md:flex flex-1 relative bg-[#0b0a08] items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#3a3121_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <path d="M 50,0 L 50,650 M 200,0 L 200,650 M 400,0 L 400,650 M 600,0 L 600,650" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,5" />
            <path d="M 0,150 L 800,150 M 0,350 L 800,350 M 0,550 L 800,550" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,5" />
          </svg>

          <div className="absolute top-[45%] left-[40%] flex flex-col items-center animate-bounce">
            <div className="w-12 h-12 bg-amber-400 text-neutral-950 rounded-full flex items-center justify-center shadow-2xl border-2 border-white ring-4 ring-amber-400/20">
              <Bike size={24} />
            </div>
          </div>

          <div className="absolute top-[40%] right-[25%] flex flex-col items-center">
            <div className="w-12 h-12 bg-[#1c1813] border-2 border-amber-400 text-amber-400 rounded-full flex items-center justify-center shadow-xl">
              <Home size={22} />
            </div>
            <span className="mt-2 bg-[#12100d] border border-[#2d2518] text-amber-400 text-xs font-bold px-3 py-1 rounded-full shadow-md">
              Barcelona
            </span>
          </div>

          <div className="absolute bottom-6 right-6 flex items-center gap-2 opacity-40 text-neutral-400 font-bold text-sm">
            <GlassWater size={18} className="text-amber-400" />
            PanaDrink Delivery
          </div>
        </div>
      </div>
    </div>
  );
};