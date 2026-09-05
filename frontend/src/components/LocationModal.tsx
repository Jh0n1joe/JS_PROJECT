// frontend/src/components/LocationModal.tsx
import React, { useState } from 'react';
import { MapPin, X, Check } from 'lucide-react';
import { useLocationStore } from '../store/useLocationStore';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ZONAS_CARACAS = [
  'Chacao, Caracas',
  'Las Mercedes, Caracas',
  'Altamira, Caracas',
  'Los Palos Grandes, Caracas',
  'El Hatillo, Caracas',
  'Baruta, Caracas',
  'La Castellana, Caracas',
];

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { currentLocation, setLocation } = useLocationStore();
  const [customInput, setCustomInput] = useState('');

  if (!isOpen) return null;

  const handleSelect = (zone: string) => {
    setLocation(zone);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      setLocation(`${customInput.trim()}, Caracas`);
      setCustomInput('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#14120f] border border-[#2e2619] w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
            <MapPin size={22} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">¿Dónde entregamos?</h3>
            <p className="text-xs text-neutral-400">Selecciona tu zona de delivery en Caracas</p>
          </div>
        </div>

        {/* Formulario Custom */}
        <form onSubmit={handleCustomSubmit} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ej: Concresa, Prados del Este..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 bg-[#1c1914] border border-[#2e2619] rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>

        <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          Zonas populares
        </div>

        {/* Lista de Zonas */}
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {ZONAS_CARACAS.map((zone) => {
            const isSelected = currentLocation === zone;
            return (
              <button
                key={zone}
                onClick={() => handleSelect(zone)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                    : 'bg-[#181510] border-[#252016] text-neutral-300 hover:border-[#3d3323] hover:text-white'
                }`}
              >
                <span>{zone}</span>
                {isSelected && <Check size={16} className="text-amber-500" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};