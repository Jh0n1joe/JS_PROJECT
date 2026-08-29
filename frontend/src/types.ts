export interface Maridaje {
  nombre: string;
  tipo: 'chocolate' | 'habano' | 'carne' | 'queso' | 'hielo';
}

export interface Producto {
  id: number;
  nombre: string;
  categoria: 'whiskey' | 'wine' | 'rum' | 'beer' | 'mixers';
  subcategoria?: string;
  descripcion: string;
  precio_usd: number;
  precio_anterior_usd?: number;
  descuento_porcentaje?: number;
  stock: number;
  imagen_url: string;
  disponible_247: boolean;
  maridajes?: Maridaje[];
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}