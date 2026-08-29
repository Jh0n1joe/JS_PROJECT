import type { Producto } from '../types';

export const TASA_BCV = 791.67; // Tasa de cambio de ejemplo en Bs.

export const PRODUCTOS_MOCK: Producto[] = [
  {
    id: 1,
    nombre: 'Santa Teresa 1796',
    categoria: 'rum',
    subcategoria: 'Ron Añejo Solera',
    descripcion: 'Santa Teresa 1796 es un ron audaz y elegante, creado para celebrar el bicentenario de la Hacienda Santa Teresa. Pionero en el uso del método Solera, ofrece una mezcla de rones envejecidos hasta 35 años, resultando en un perfil suave, seco y balanceado con notas de nueces tostadas, cuero, vainilla y canela.',
    precio_usd: 45.00,
    stock: 10,
    imagen_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600',
    disponible_247: true,
    maridajes: [
      { nombre: 'Chocolate Oscuro', tipo: 'chocolate' },
      { nombre: 'Habano Medio', tipo: 'habano' },
      { nombre: 'Carnes Rojas', tipo: 'carne' },
    ]
  },
  {
    id: 2,
    nombre: 'Macallan 12 Years',
    categoria: 'whiskey',
    subcategoria: 'Single Malt Scotch Whisky, 700ml',
    descripcion: 'Whisky escocés de malta única madurado en barricas de roble sazonadas con jerez.',
    precio_usd: 68.00,
    precio_anterior_usd: 85.00,
    descuento_porcentaje: 20,
    stock: 5,
    imagen_url: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=600',
    disponible_247: true,
  },
  {
    id: 4,
    nombre: 'Zacapa Centenario 23',
    categoria: 'rum',
    subcategoria: 'Ron Añejo, 750ml',
    descripcion: 'Añejado en las alturas de Guatemala utilizando el sistema de solera.',
    precio_usd: 51.00,
    precio_anterior_usd: 60.00,
    descuento_porcentaje: 15,
    stock: 8,
    imagen_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600',
    disponible_247: true,
  }
];