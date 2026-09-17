// frontend/src/components/LocationModal.tsx
import React, { useState } from 'react';
import { MapPin, X, Check, Store } from 'lucide-react';
import { useLocationStore } from '../store/useLocationStore';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CENTROS_DESPACHO = [
  {
    id: 'barcelona-centro',
    nombre: 'PanaDrink Express - Barcelona Centro',
    zona: 'Centro, Barcelona',
    distancia: '1.2 km',
    tiempo: '10-15 MIN',
  },
  {
    id: 'lecheria-plaza',
    nombre: 'PanaDrink Hub - Lechería Plaza',
    zona: 'Lechería / Urb. El Morro',
    distancia: '3.8 km',
    tiempo: '15-20 MIN',
  },
];

const ZONAS_BARCELONA = [
  { zona: 'Nueva Barcelona, Barcelona', sedeId: 'barcelona-centro' },
  { zona: 'Lechería / Urb. El Morro', sedeId: 'lecheria-plaza' },
  { zona: 'Centro, Barcelona', sedeId: 'barcelona-centro' },
  { zona: 'Av. Intercomunal / Las Garzas', sedeId: 'barcelona-centro' },
  { zona: 'Boyacá I, II y III, Barcelona', sedeId: 'barcelona-centro' },
  { zona: 'Colinas de Neverí, Barcelona', sedeId: 'barcelona-centro' },
  { zona: 'Puerto La Cruz (Zona Baja)', sedeId: 'lecheria-plaza' },
];

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { currentLocation, currentSedeId, setLocation, setSede } = useLocationStore();
  const [customInput, setCustomInput] = useState('');

  if (!isOpen) return null;

  const handleSelectSedeDirecta = (sedeId: string, zonaNombre: string) => {
    setSede(sedeId);
    setLocation(zonaNombre);
    onClose();
  };

  const handleSelectZona = (item: { zona: string; sedeId: string }) => {
    setLocation(item.zona);
    setSede(item.sedeId);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      const nuevaUbicacion = `${customInput.trim()}, Barcelona`;
      setLocation(nuevaUbicacion);
      // Asigna por defecto la sede principal si la dirección es personalizada
      setSede('barcelona-centro');
      setCustomInput('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#14120f] border border-[#2e2619] w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
            <MapPin size={22} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">¿Dónde entregamos?</h3>
            <p className="text-xs text-neutral-400">Selecciona tu sede o zona de entrega</p>
          </div>
        </div>

        {/* Sección de Selección Directa de Sedes */}
        <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          Centros de Despacho (Sedes)
        </div>
        <div className="grid grid-cols-1 gap-2 mb-4">
          {CENTROS_DESPACHO.map((sede) => {
            const isSelected = currentSedeId === sede.id;
            return (
              <button
                key={sede.id}
                onClick={() => handleSelectSedeDirecta(sede.id, sede.zona)}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                    : 'bg-[#191611] border-[#292217] hover:border-[#3d3323]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Store size={18} className={isSelected ? 'text-amber-400' : 'text-neutral-500'} />
                  <div>
                    <h4 className="text-xs font-bold text-white">{sede.nombre}</h4>
                    <p className="text-[10px] text-neutral-400">{sede.distancia} • {sede.tiempo}</p>
                  </div>
                </div>
                {isSelected && <Check size={16} className="text-amber-500" />}
              </button>
            );
          })}
        </div>

        {/* Formulario Custom */}
        <form onSubmit={handleCustomSubmit} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ej: Urb. Fundalara, Av. Caracas..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 bg-[#1c1914] border border-[#2e2619] rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Guardar
            </button>
          </div>
        </form>

        <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          Zonas populares
        </div>

        {/* Lista de Zonas */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {ZONAS_BARCELONA.map((item) => {
            const isSelected = currentLocation === item.zona;
            return (
              <button
                key={item.zona}
                onClick={() => handleSelectZona(item)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                    : 'bg-[#181510] border-[#252016] text-neutral-300 hover:border-[#3d3323] hover:text-white'
                }`}
              >
                <span>{item.zona}</span>
                {isSelected && <Check size={16} className="text-amber-500" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};