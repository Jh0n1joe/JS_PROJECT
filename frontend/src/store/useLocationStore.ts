// frontend/src/store/useLocationStore.ts
import { create } from 'zustand';

interface LocationState {
  currentLocation: string;
  setLocation: (location: string) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: 'Barcelona, Anzoátegui',
  setLocation: (location) => set({ currentLocation: location }),
}));