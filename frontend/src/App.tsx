import { useState, useEffect } from 'react';
import { Clock, ShoppingBag, MapPin } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { OfferCard } from './components/OfferCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { Checkout } from './components/Checkout';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import type { Producto } from './types';
import { useCartStore } from './store/useCartStore';

export function App() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para Búsqueda y Categorías Dinámicas
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [categoriasDB, setCategoriasDB] = useState<{ id: string; nombre: string }[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [view, setView] = useState<'home' | 'checkout'>('home');
  const [showTracking, setShowTracking] = useState(false);
  
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);

  // Cargar productos y categorías dinámicas desde la API de Django
  useEffect(() => {
    const fetchCatalogo = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
        
        // 1. Petición a la API de productos
        const response = await fetch(`${apiUrl}/api/productos/`);
        if (!response.ok) {
          throw new Error('Error al obtener la lista de productos');
        }
        const data = await response.json();
        
        // Formatear precios a número para el cálculo
        const productosFormateados = data.map((prod: any) => ({
          ...prod,
          precio_usd: parseFloat(prod.precio_usd) || 0,
          precio_bs: parseFloat(prod.precio_bs) || 0,
        }));

        setProductos(productosFormateados);

        // 2. Extraer categorías únicas reales asociadas a los productos en Django Admin
        const nombresCategorias = Array.from(
          new Set(
            data
              .map((p: any) => p.categoria_nombre || p.categoria?.nombre || p.categoria)
              .filter(Boolean)
          )
        );

        const listaCats = [
          { id: 'TODOS', nombre: 'Todas las Categorías' },
          ...nombresCategorias.map((c: any) => ({
            id: String(c).toUpperCase(),
            nombre: String(c),
          })),
        ];

        setCategoriasDB(listaCats);
      } catch (err: any) {
        console.error(err);
        setError('No se pudieron cargar los datos del servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogo();
  }, []);

  // Lógica de Filtrado dinámico por Búsqueda + Categoría Seleccionada
  const productosFiltrados = productos.filter((prod: any) => {
    const query = searchQuery.toLowerCase();
    const categoriaProd = String(prod.categoria_nombre || prod.categoria?.nombre || prod.categoria || '').toLowerCase();
    
    const coincideBusqueda = 
      prod.nombre.toLowerCase().includes(query) ||
      categoriaProd.includes(query) ||
      (prod.descripcion && prod.descripcion.toLowerCase().includes(query));

    const coincideCategoria = 
      selectedCategory === 'TODOS' || 
      categoriaProd.toUpperCase().includes(selectedCategory.toUpperCase());

    return coincideBusqueda && coincideCategoria;
  });

  // Cálculos del carrito
  const totalUSD = cart.reduce((acc, item) => acc + item.producto.precio_usd * item.cantidad, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  // Temporizador para "Ofertas de Medianoche"
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 45, seconds: 8 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  // VISTA 2: FLUJO DE CHECKOUT + MODAL DE SEGUIMIENTO
  if (view === 'checkout') {
    return (
      <>
        <Checkout
          onBack={() => setView('home')}
          onConfirmOrder={() => {
            setShowTracking(true);
          }}
        />

        {showTracking && (
          <OrderTrackingModal
            onClose={() => {
              setShowTracking(false);
              clearCart();
              setView('home');
            }}
          />
        )}
      </>
    );
  }

  // VISTA 1: CATÁLOGO Y PANTALLA PRINCIPAL
  return (
    <div className="min-h-screen bg-[#0d0c0a] text-neutral-100 flex flex-col justify-between font-sans selection:bg-amber-500 selection:text-neutral-950">
      <div>
        {/* Navbar con Búsqueda, Categorías dinámicas de Django y Tracking */}
        <Navbar 
          onSearch={(query) => setSearchQuery(query)}
          selectedCategory={selectedCategory}
          onCategoryChange={(cat) => setSelectedCategory(cat)}
          categorias={categoriasDB}
          onOpenTracking={() => setShowTracking(true)}
        />

        {/* Hero Banner */}
        <Hero />

        {/* Sección Ofertas de Medianoche */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-[#262016] pb-6">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xl md:text-2xl">
                <Clock size={24} />
                <h2>Ofertas de Medianoche</h2>
              </div>
              <p className="text-neutral-500 text-xs md:text-sm mt-1">
                Precios exclusivos que desaparecen al amanecer.
              </p>
            </div>

            {/* Reloj Cuenta Regresiva */}
            <div className="bg-[#181510] border border-[#2e2619] rounded-xl px-4 py-2 flex items-center gap-3 self-start md:self-auto">
              <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                Termina en:
              </span>
              <div className="flex items-center gap-1 font-mono font-bold text-amber-400 text-base">
                <span className="bg-[#0b0a08] px-2 py-1 rounded border border-[#382f1f]">
                  {formatNumber(timeLeft.hours)}
                </span>
                <span>:</span>
                <span className="bg-[#0b0a08] px-2 py-1 rounded border border-[#382f1f]">
                  {formatNumber(timeLeft.minutes)}
                </span>
                <span>:</span>
                <span className="bg-[#0b0a08] px-2 py-1 rounded border border-[#382f1f]">
                  {formatNumber(timeLeft.seconds)}
                </span>
              </div>
            </div>
          </div>

          {/* Grid de Productos Filtrados Dinámicamente */}
          {loading ? (
            <div className="text-center py-12 text-amber-400 font-bold">
              Cargando catálogo desde el servidor...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 font-semibold">
              {error}
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              No se encontraron productos que coincidan con la búsqueda o categoría seleccionada.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productosFiltrados.map((prod) => (
                <OfferCard
                  key={prod.id}
                  producto={prod}
                  onSelect={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Botón Flotante para Rastrear Delivery (Inferior Izquierda) */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setShowTracking(true)}
          title="Rastrear mi pedido en tiempo real"
          className="group relative bg-[#1a1712] border border-amber-500/50 hover:border-amber-400 text-white rounded-full p-3.5 shadow-2xl flex items-center gap-3 transition-all backdrop-blur-md active:scale-95 hover:bg-[#241e17] cursor-pointer"
        >
          <div className="relative bg-amber-400 text-neutral-950 p-2.5 rounded-full font-black flex items-center justify-center shadow-lg shadow-amber-400/20">
            <MapPin size={22} className="animate-bounce" />
          </div>
          <span className="hidden sm:inline-block pr-2 font-bold text-xs text-amber-400 tracking-wide">
            Rastrear Pedido
          </span>
        </button>
      </div>

      {/* Widget Flotante del Carrito (Inferior Derecha) */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setView('checkout')}
            className="bg-[#1a1712] border border-amber-500/40 text-white rounded-full p-2.5 pr-6 shadow-2xl flex items-center gap-3 hover:border-amber-400 transition-all group backdrop-blur-md cursor-pointer"
          >
            <div className="relative bg-amber-400 text-neutral-950 p-3 rounded-full font-black flex items-center justify-center">
              <ShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 bg-neutral-950 text-amber-400 text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-amber-400">
                {totalItems}
              </span>
            </div>
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-semibold">
                Total
              </span>
              <span className="text-amber-400 font-black text-lg leading-tight">
                ${totalUSD.toFixed(2)}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Modal Detalle de Producto */}
      {selectedProduct && (
        <ProductDetailModal
          producto={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Modal de Seguimiento / Delivery */}
      {showTracking && (
        <OrderTrackingModal
          onClose={() => setShowTracking(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-[#080706] border-t border-[#1f1a12] py-8 px-6 mt-16 text-neutral-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-white font-bold text-sm tracking-tight">
              Pana<span className="text-amber-400">Drink</span>
            </span>
            <p className="mt-1">© 2026 PanaDrink Delivery. Premium Spirits 24/7.</p>
          </div>
          <div className="flex items-center gap-6">
            <button className="hover:text-neutral-300 transition-colors">Terms of Service</button>
            <button className="hover:text-neutral-300 transition-colors">Privacy Policy</button>
            <button className="hover:text-neutral-300 transition-colors">Contact Support</button>
            <button className="hover:text-neutral-300 transition-colors">Delivery Areas</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;