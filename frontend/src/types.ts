export interface Maridaje {
  nombre: string;
  tipo: 'chocolate' | 'habano' | 'carne' | 'queso' | 'hielo';
}

export interface Sede {
  id: string;
  nombre: string;
  direccion: string;
  tiempo_estimado: string;
  distancia: string;
  abierto: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  subcategoria?: string;
  descripcion?: string;
  precio_usd: number;
  precio_bs?: number;
  precio_anterior_usd?: number;
  descuento_porcentaje?: number;
  stock: number;
  imagen?: string; // 👈 Coincidente con Django
  imagen_url?: string; // 👈 Mantener por compatibilidad
  disponible_247?: boolean;
  maridajes?: Maridaje[];
  sedes_disponibles?: string[]; // 👈 Ej: ['barcelona-centro', 'lecheria-plaza']
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}