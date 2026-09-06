export interface Maridaje {
  nombre: string;
  tipo: 'chocolate' | 'habano' | 'carne' | 'queso' | 'hielo';
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
  imagen?: string; // 👈 Campo corregido coincidente con el JSON de Django
  imagen_url?: string; // 👈 Mantener opcional por compatibilidad
  disponible_247?: boolean;
  maridajes?: Maridaje[];
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}