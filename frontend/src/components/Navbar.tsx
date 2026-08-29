// frontend/src/components/Navbar.tsx
import React, { useState } from 'react';
import { MapPin, Search, Sparkles, ShoppingBag, Loader2 } from 'lucide-react';
import { Logo } from './Logo';

interface NavbarProps {
  onOpenCart?: () => void;
  onSearch?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, onSearch }) => {
  const [locationText, setLocationText] = useState('Barcelona, Anzoátegui');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const address = data.address;

          // Extrae el sector/barrio o ciudad
          let rawSuburb = address.suburb || address.neighbourhood || address.quarter || address.city_district || '';
          let city = address.city || address.town || address.municipality || address.state || '';

          // Limpia prefijos largos como "Urbanización" o "Sector" para ahorrar espacio
          rawSuburb = rawSuburb.replace(/^(Urbanización|Urb\.|Sector|Residencias)\s+/i, '');

          if (rawSuburb && city) {
            setLocationText(`${rawSuburb}, ${city}`);
          } else if (rawSuburb) {
            setLocationText(rawSuburb);
          } else if (city) {
            setLocationText(city);
          } else {
            setLocationText('Ubicación detectada');
          }
        } catch (error) {
          console.error('Error al obtener la dirección:', error);
          setLocationText('Ubicación obtenida');
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error('Error de geolocalización:', error);
        setLoadingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          alert('Debes permitir el acceso a tu ubicación en el navegador.');
        } else {
          alert('No se pudo obtener tu ubicación actual.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) onSearch(value);
  };

  return (
    <header className="border-b border-[#262016] bg-[#0d0c0a]/95 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* LOGO DE LA MARCA */}
        <div className="shrink-0">
          <Logo className="h-11" />
        </div>

        {/* SECCIÓN CENTRAL */}
        <div className="flex items-center gap-3 flex-1 max-w-3xl mx-2">
          
          {/* BOTÓN DE UBICACIÓN (MUESTRA EL TEXTO COMPLETO) */}
          <button
            onClick={detectLocation}
            disabled={loadingLocation}
            type="button"
            title="Obtener mi ubicación actual"
            className="flex items-center gap-2 bg-[#181510] hover:bg-[#221d16] border border-[#2e2619] hover:border-amber-500/40 text-xs px-4 py-2.5 rounded-full text-neutral-200 transition-all shrink-0 active:scale-95 disabled:opacity-60"
          >
            {loadingLocation ? (
              <Loader2 size={15} className="text-amber-500 animate-spin" />
            ) : (
              <MapPin size={15} className="text-amber-500 shrink-0" />
            )}
            <span className="font-semibold whitespace-nowrap">
              {loadingLocation ? 'Detectando...' : locationText}
            </span>
          </button>

          {/* BARRA DE BÚSQUEDA */}
          <div className="relative flex-1 hidden md:block">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar whisky, ron, cerveza, hielos..."
              className="w-full bg-[#14120f] border border-[#292217] rounded-full pl-10 pr-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 transition-colors"
            />
          </div>
        </div>

        {/* SECCIÓN DERECHA */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* BADGE EXPRESS 24/7 */}
          <div className="hidden lg:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/40 text-amber-400 px-3.5 py-2 rounded-full text-xs font-bold tracking-wide">
            <Sparkles size={14} />
            <span>Express 24/7</span>
          </div>

          {/* BOTÓN MI PEDIDO */}
          <button
            onClick={onOpenCart}
            type="button"
            className="flex items-center gap-2 bg-[#181510] hover:bg-[#221d16] border border-[#2e2619] hover:border-amber-500/40 text-white font-bold text-xs px-4 py-2.5 rounded-full transition-all active:scale-95"
          >
            <ShoppingBag size={16} className="text-amber-400" />
            <span>Mi Pedido</span>
          </button>
        </div>

      </div>
    </header>
  );
};