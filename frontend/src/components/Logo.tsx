// frontend/src/components/Logo.tsx
import React from 'react';
import logoImg from '../assets/logo.jpg'; 

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-11", showText = true }) => {
  return (
    <div className={`flex items-center gap-3.5 select-none pointer-events-none ${className}`}>
      {/* Icono del logo mimetizado con el fondo */}
      <img
        src={logoImg}
        alt="PanaDrink"
        className="h-18 w-auto object-contain mix-blend-lighten"
      />

      {/* Texto de la marca */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <span className="text-white font-black text-2xl tracking-tight">
            Pana<span className="text-[#F59E0B]">Drink</span>
          </span>
          <span className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase mt-1">
            24/7 LIQUOR DELIVERY
          </span>
        </div>
      )}
    </div>
  );
};