// frontend/src/store/useLocationStore.ts
import { create } from 'zustand';

interface LocationState {
  currentLocation: string;
  currentSedeId: string | null;
  setLocation: (location: string) => void;
  setSede: (sedeId: string | null) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: 'Barcelona, Anzoátegui',
  currentSedeId: 'barcelona-centro', // Sede activa por defecto
  setLocation: (location) => set({ currentLocation: location }),
  setSede: (sedeId) => set({ currentSedeId: sedeId }),
}));