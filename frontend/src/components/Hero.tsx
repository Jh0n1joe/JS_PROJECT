import React, { useState, useEffect } from 'react';
import { MapPin, Sparkles, Store } from 'lucide-react';
import CircularGallery from './CircularGallery';

// Interface alineada con la respuesta de SedeSerializer en Django
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

interface HeroProps {
  onSelectSede?: (sede: Sede) => void;
  sedeSeleccionadaSlug?: string;
}

export const Hero: React.FC<HeroProps> = ({ onSelectSede, sedeSeleccionadaSlug }) => {
  const [address, setAddress] = useState('');
  const [showResults, setShowResults] = useState(true);
  const [sedesDB, setSedesDB] = useState<Sede[]>([]);
  const [cargando, setCargando] = useState(true);

  // Consumir la API de Django (/api/sedes/)
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/sedes/')
      .then((res) => {
        if (!res.ok) throw new Error('Error al consultar sedes');
        return res.json();
      })
      .then((data: Sede[]) => {
        setSedesDB(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error('Error cargando sedes desde Django:', err);
        setCargando(false);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };

  // Filtrar sedes activas según la búsqueda
  const sedesFiltradas = sedesDB.filter(
    (s) =>
      s.nombre.toLowerCase().includes(address.toLowerCase()) ||
      s.direccion.toLowerCase().includes(address.toLowerCase()) ||
      s.id_slug.toLowerCase().includes(address.toLowerCase())
  );

  const sedesAMostrar = sedesFiltradas.length > 0 ? sedesFiltradas : sedesDB;

  const scrollToCatalogo = () => {
    const catalogSection = document.getElementById('catalogo');
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-[#0a0907] border-b border-[#262016] py-14 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto text-center space-y-6">
        
        {/* Badge 24/7 */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3.5 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Disponible 24/7 en tu zona
        </div>

        {/* Titular Principal */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
          La Noche es Joven. <br />
          <span className="text-amber-400">Nosotros También.</span>
        </h1>

        <p className="text-neutral-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Ingresa tu zona para ver qué centro de despacho PanaDrink o licorería aliada está más cerca de ti y calcular tu tiempo récord de entrega.
        </p>

        {/* Barra de Búsqueda de Cobertura */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto pt-2">
          <div className="bg-[#14120f] border border-[#2e2619] focus-within:border-amber-500/70 p-2 rounded-2xl flex items-center gap-2 shadow-2xl transition-all">
            <MapPin className="text-amber-400 ml-3 shrink-0" size={20} />
            <input
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (e.target.value.trim() !== '') setShowResults(true);
              }}
              placeholder="Ej: Barcelona, Lechería, Puerto La Cruz..."
              className="bg-transparent text-sm text-white placeholder-neutral-500 w-full focus:outline-none"
            />
            <button
              type="submit"
              className="bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black text-xs md:text-sm px-5 py-3 rounded-xl flex items-center gap-2 shrink-0 transition-all cursor-pointer active:scale-95 shadow-md shadow-amber-400/20"
            >
              <Sparkles size={16} />
              Buscar Sedes
            </button>
          </div>
        </form>

        {/* MÓDULO INTERACTIVO DE SEDES / TIENDAS CERCANAS */}
        {showResults && (
          <div className="pt-8 animate-fade-in w-full">
            {/* Encabezado alineado con la retícula */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between max-w-6xl mx-auto mb-2 px-1 gap-2 border-b border-[#221c13] pb-3">
              <span className="text-xs font-black text-amber-400 flex items-center gap-2 uppercase tracking-wider">
                <Store size={16} />
                Centros de Despacho Cercanos ({sedesAMostrar.length})
              </span>
              <span className="text-xs text-neutral-400 font-medium">
                Selecciona la más cercana para pedir
              </span>
            </div>

            {cargando ? (
              <p className="text-neutral-500 text-xs py-8">Cargando sedes disponibles desde la base de datos...</p>
            ) : sedesAMostrar.length === 0 ? (
              <p className="text-neutral-400 text-xs py-8">No se encontraron sedes activas para la zona ingresada.</p>
            ) : (
              /* Carrusel 3D Interactivo Reemplazante */
              <div className="w-full">
                <CircularGallery
                  sedes={sedesAMostrar}
                  sedeSeleccionadaSlug={sedeSeleccionadaSlug}
                  onSelectSede={onSelectSede}
                  scrollToCatalogo={scrollToCatalogo}
                />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};