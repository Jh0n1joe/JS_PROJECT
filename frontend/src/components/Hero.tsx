import React, { useState, useEffect } from 'react';
import { MapPin, Sparkles, Clock, CheckCircle, Store, ChevronRight } from 'lucide-react';

// 1. Interface alineada con la respuesta de SedeSerializer en Django
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

const IMAGEN_POR_DEFECTO = 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80';

export const Hero: React.FC<HeroProps> = ({ onSelectSede, sedeSeleccionadaSlug }) => {
  const [address, setAddress] = useState('');
  const [showResults, setShowResults] = useState(true); // Mostrar por defecto
  const [sedesDB, setSedesDB] = useState<Sede[]>([]);
  const [cargando, setCargando] = useState(true);

  // 2. Consumir la API de Django (/api/sedes/)
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

  // 3. Filtrar sedes activas según la búsqueda
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
    <div className="relative overflow-hidden bg-[#0a0907] border-b border-[#262016] py-14 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        
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
          <div className="pt-6 animate-fade-in">
            <div className="flex items-center justify-between max-w-2xl mx-auto mb-4 px-1">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Store size={15} />
                Centros de Despacho Cercanos ({sedesAMostrar.length})
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">
                Selecciona la más cercana para pedir
              </span>
            </div>

            {cargando ? (
              <p className="text-neutral-500 text-xs py-6">Cargando sedes disponibles desde la base de datos...</p>
            ) : sedesAMostrar.length === 0 ? (
              <p className="text-neutral-400 text-xs py-6">No se encontraron sedes activas para la zona ingresada.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {sedesAMostrar.map((sede) => {
                  const isSelected = sedeSeleccionadaSlug === sede.id_slug;

                  return (
                    <div
                      key={sede.id}
                      onClick={() => {
                        localStorage.setItem('user_selected_sede_slug', sede.id_slug);
                        localStorage.setItem('user_delivery_address', sede.nombre);
                        if (onSelectSede) onSelectSede(sede);
                        scrollToCatalogo();
                      }}
                      className={`group relative bg-[#13110d] border ${
                        isSelected ? 'border-amber-400 ring-1 ring-amber-400' : 'border-[#2b2418] hover:border-amber-400/80'
                      } rounded-2xl overflow-hidden p-3 transition-all cursor-pointer text-left hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-0.5 flex flex-col justify-between`}
                    >
                      <div>
                        {/* Imagen de la Sede con Badge de Tiempo */}
                        <div className="relative h-28 w-full rounded-xl overflow-hidden mb-3 bg-neutral-900">
                          <img
                            src={sede.imagen || IMAGEN_POR_DEFECTO}
                            alt={sede.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2 right-2 bg-neutral-950/80 backdrop-blur-md border border-amber-400/40 text-amber-400 font-black text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                            <Clock size={11} className="animate-pulse" />
                            {sede.tiempo_estimado}
                          </div>
                          <div className="absolute bottom-2 left-2 bg-emerald-500/90 text-neutral-950 font-bold text-[9px] px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle size={10} />
                            Abierto
                          </div>
                        </div>

                        {/* Nombre y Dirección */}
                        <h4 className="text-white font-bold text-xs leading-snug group-hover:text-amber-400 transition-colors line-clamp-1">
                          {sede.nombre}
                        </h4>
                        <p className="text-neutral-500 text-[11px] mt-1 line-clamp-2">
                          {sede.direccion}
                        </p>
                      </div>

                      {/* Botón Acción */}
                      <div className="mt-3 pt-2 border-t border-[#221c13] flex items-center justify-between text-amber-400 text-[11px] font-bold">
                        <span>{isSelected ? 'Sede Seleccionada ✓' : 'Pedir desde aquí'}</span>
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};