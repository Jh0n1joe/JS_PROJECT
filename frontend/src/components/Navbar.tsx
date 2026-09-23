// frontend/src/components/Navbar.tsx
<<<<<<< HEAD
import React, { useState } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> a493002 (error de imagenes)
import { 
  MapPin, 
  Search, 
  Sparkles, 
  ShoppingBag, 
  Loader2, 
  X, 
  Package, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Filter,
  User,
<<<<<<< HEAD
  Store,
  LogOut,
  ChevronDown,
  Settings
=======
  LogOut,
  Settings,
  ChevronDown
>>>>>>> a493002 (error de imagenes)
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuthStore } from '../store/useAuthStore';
import { AuthModal } from './AuthModal';

interface NavbarProps {
  onOpenCart?: () => void;
  onSearch?: (query: string) => void;
  onCategoryChange?: (category: string) => void;
  selectedCategory?: string;
  categorias?: { id: string; nombre: string }[];
  onOpenTracking?: () => void;
<<<<<<< HEAD
  onOpenVendorDashboard?: () => void; // <-- Prop declarada
=======
  onOpenAuthModal?: () => void; // Callback para abrir el modal de Auth/Login
  onOpenVendorDashboard?: () => void; // Callback para ir al panel de Proveedor
>>>>>>> a493002 (error de imagenes)
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenCart, 
  onSearch, 
  onCategoryChange,
  selectedCategory = 'TODOS',
  categorias = [{ id: 'TODOS', nombre: 'Todas las Categorías' }],
  onOpenTracking,
<<<<<<< HEAD
  onOpenVendorDashboard // <-- Prop desestructurada
=======
  onOpenAuthModal,
  onOpenVendorDashboard
>>>>>>> a493002 (error de imagenes)
}) => {
  const [locationText, setLocationText] = useState('Barcelona, Anzoátegui');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
<<<<<<< HEAD
  // Estado de Autenticación
  const { user, logout } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
=======
  // Estado para Sesión del Usuario y Menú Desplegable
  const [user, setUser] = useState<any>(null);
>>>>>>> a493002 (error de imagenes)
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Estado para el modal de Historial
  const [showHistory, setShowHistory] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Cargar usuario desde localStorage al montar el componente
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error al parsear usuario:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setShowUserMenu(false);
    window.location.reload();
  };

  // Cargar únicamente los pedidos del usuario actual
  const loadOrders = async () => {
    setLoadingOrders(true);
    setOrdersError(null);
    try {
      const localIds: number[] = JSON.parse(localStorage.getItem('my_orders') || '[]');

      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiUrl}/api/pedidos/`);

      if (!response.ok) {
        throw new Error('Error al conectar con la base de datos de pedidos.');
      }

      const data = await response.json();
      const listaCompleta: any[] = Array.isArray(data) ? data : data.results || [];

      const misPedidos = localIds.length > 0
        ? listaCompleta.filter((order) => localIds.includes(order.id))
        : listaCompleta;

      misPedidos.sort((a, b) => b.id - a.id);
      setOrders(misPedidos);
    } catch (e: any) {
      console.error('Error al cargar historial de pedidos:', e);
      setOrdersError('No se pudieron sincronizar los pedidos con el servidor.');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleOpenHistory = () => {
    loadOrders();
    setShowHistory(true);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const address = data.address;

          let rawSuburb = address.suburb || address.neighbourhood || address.quarter || address.city_district || '';
          let city = address.city || address.town || address.municipality || address.state || '';

          rawSuburb = rawSuburb.replace(/^(Urbanización|Urb\.|Sector|Residencias)\s+/i, '');

          if (rawSuburb && city) {
            setLocationText(`${rawSuburb}, ${city}`);
          } else if (rawSuburb) {
            setLocationText(rawSuburb);
          } else if (city) {
            setLocationText(city);
          } else {
            setLocationText('Ubicación detectada');
          }
        } catch (error) {
          console.error('Error al obtener la dirección:', error);
          setLocationText('Ubicación obtenida');
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error('Error de geolocalización:', error);
        setLoadingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          alert('Debes permitir el acceso a tu ubicación en el navegador.');
        } else {
          alert('No se pudo obtener tu ubicación actual.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) onSearch(value);
  };

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onCategoryChange) onCategoryChange(e.target.value);
  };

  return (
    <>
      <header className="border-b border-[#262016] bg-[#0d0c0a]/95 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* LOGO DE LA MARCA */}
          <div className="shrink-0">
            <Logo className="h-11" />
          </div>

          {/* SECCIÓN CENTRAL: UBICACIÓN + BÚSQUEDA + FILTRO */}
          <div className="flex items-center gap-2 flex-1 max-w-3xl mx-2">
            
            {/* BOTÓN DE UBICACIÓN */}
            <button
              onClick={detectLocation}
              disabled={loadingLocation}
              type="button"
              title="Obtener mi ubicación actual"
              className="flex items-center gap-2 bg-[#181510] hover:bg-[#221d16] border border-[#2e2619] hover:border-amber-500/40 text-xs px-3.5 py-2.5 rounded-full text-neutral-200 transition-all shrink-0 active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {loadingLocation ? (
                <Loader2 size={15} className="text-amber-500 animate-spin" />
              ) : (
                <MapPin size={15} className="text-amber-500 shrink-0" />
              )}
              <span className="font-semibold whitespace-nowrap hidden sm:inline">
                {loadingLocation ? 'Detectando...' : locationText}
              </span>
            </button>

            {/* BARRA DE BÚSQUEDA */}
            <div className="relative flex-1 hidden md:block">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Buscar whisky, ron, cerveza, hielos..."
                className="w-full bg-[#14120f] border border-[#292217] rounded-full pl-9 pr-4 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>

            {/* SELECTOR DE FILTRO DE CATEGORÍA */}
            <div className="relative shrink-0 hidden md:block">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={handleCategorySelect}
                className="bg-[#14120f] border border-[#292217] text-neutral-200 hover:border-amber-500/40 text-xs font-semibold rounded-full pl-8 pr-7 py-2 appearance-none focus:outline-none focus:border-amber-500/60 cursor-pointer transition-all"
              >
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#12100d] text-white">
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* SECCIÓN DERECHA: EXPRESS + MIS PEDIDOS + ICONO/PERFIL USUARIO */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* BADGE EXPRESS 24/7 */}
            <div className="hidden lg:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/40 text-amber-400 px-3.5 py-2 rounded-full text-xs font-bold tracking-wide">
              <Sparkles size={14} />
              <span>Express 24/7</span>
            </div>

<<<<<<< HEAD
            {/* SI ES CLIENTE O NO REGISTRADO: Muestra "Mis Pedidos" */}
            {(!user || user.rol === 'CLIENTE') && (
              <button
                onClick={handleOpenHistory}
                type="button"
                className="flex items-center gap-2 bg-[#181510] hover:bg-[#221d16] border border-[#2e2619] hover:border-amber-500/40 text-white font-bold text-xs px-4 py-2.5 rounded-full transition-all active:scale-95 cursor-pointer"
              >
                <ShoppingBag size={16} className="text-amber-400" />
                <span className="hidden sm:inline">Mis Pedidos</span>
              </button>
            )}

            {/* ICONO Y MENÚ DESPLEGABLE DE USUARIO */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    type="button"
                    className="flex items-center gap-2 bg-[#181510] hover:bg-[#221d16] border border-[#2e2619] hover:border-amber-500/50 px-3 py-2 rounded-full transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                      {user.rol === 'PROVEEDOR' ? <Store size={15} /> : <User size={15} />}
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-xs font-bold text-white leading-none">{user.nombre}</p>
                      <span className="text-[10px] text-amber-400 font-medium">
                        {user.rol === 'PROVEEDOR' ? 'Proveedor' : 'Cliente'}
                      </span>
                    </div>
                    <ChevronDown size={14} className="text-neutral-400" />
                  </button>

                  {/* DESPLEGABLE DEL PERFIL */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#14120e] border border-[#2a2419] rounded-xl shadow-2xl py-2 z-50 space-y-1">
                      <div className="px-3 py-1.5 border-b border-[#221c13] text-xs">
                        <p className="text-white font-bold truncate">{user.nombre}</p>
                        <p className="text-neutral-500 text-[10px] truncate">{user.email}</p>
                      </div>

                      {user.rol === 'CLIENTE' ? (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleOpenHistory();
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:bg-[#221d15] hover:text-amber-400 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Package size={14} /> Mis Pedidos
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            if (onOpenVendorDashboard) onOpenVendorDashboard();
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:bg-[#221d15] hover:text-amber-400 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Settings size={14} /> Gestionar Mi Sede
                        </button>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors border-t border-[#221c13] cursor-pointer"
                      >
                        <LogOut size={14} /> Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* BOTÓN INGRESAR / REGISTRO SI NO HA INICIADO SESIÓN */
                <button
                  onClick={() => setShowAuthModal(true)}
                  type="button"
                  className="bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black text-xs px-4 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-md shadow-amber-400/10 cursor-pointer active:scale-95"
                >
                  <User size={16} />
                  <span className="hidden sm:inline">Ingresar</span>
                </button>
              )}
            </div>

=======
            {/* BOTÓN MIS PEDIDOS */}
            <button
              onClick={handleOpenHistory}
              type="button"
              className="flex items-center gap-2 bg-[#181510] hover:bg-[#221d16] border border-[#2e2619] hover:border-amber-500/40 text-white font-bold text-xs px-4 py-2.5 rounded-full transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingBag size={16} className="text-amber-400" />
              <span className="hidden sm:inline">Mis Pedidos</span>
            </button>

            {/* AUTENTICACIÓN / MENÚ DE USUARIO */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  type="button"
                  className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs px-3.5 py-2.5 rounded-full transition-all cursor-pointer"
                >
                  <User size={15} />
                  <span className="max-w-[100px] truncate">{user.nombre}</span>
                  <ChevronDown size={14} className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* DROPDOWN DEL USUARIO */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#12100d] border border-[#2e2619] rounded-xl shadow-2xl py-1.5 z-50 animate-fade-in">
                    <div className="px-3 py-2 border-b border-[#262016]">
                      <p className="text-xs font-bold text-white truncate">{user.nombre}</p>
                      <p className="text-[10px] text-amber-400/80 font-mono uppercase">{user.rol || 'CLIENTE'}</p>
                    </div>

                    {user.rol === 'PROVEEDOR' && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          if (onOpenVendorDashboard) onOpenVendorDashboard();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:bg-[#221d15] hover:text-amber-400 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Settings size={14} /> Gestionar Mi Sede
                      </button>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-[#221d15] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                type="button"
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-4 py-2.5 rounded-full transition-all active:scale-95 shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                <User size={16} />
                <span>Iniciar Sesión</span>
              </button>
            )}

>>>>>>> a493002 (error de imagenes)
          </div>

        </div>
      </header>

      {/* MODAL DE AUTENTICACIÓN */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* MODAL HISTORIAL DE PEDIDOS */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12100d] border border-[#2e2619] text-neutral-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
            
            {/* ENCABEZADO */}
            <div className="flex items-center justify-between border-b border-[#262016] pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Historial de Pedidos</h3>
                  <p className="text-xs text-neutral-400">Tus compras registradas en este dispositivo</p>
                </div>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-[#221d16] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* LISTA DE PEDIDOS */}
            <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
              {loadingOrders ? (
                <div className="flex flex-col items-center justify-center py-12 text-neutral-400 gap-2">
                  <Loader2 size={28} className="animate-spin text-amber-400" />
                  <p className="text-xs">Cargando tus compras...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-10">
                  <ShoppingBag size={40} className="mx-auto text-neutral-600 mb-3 opacity-50" />
                  <p className="text-sm text-neutral-400">Aún no has realizado ningún pedido.</p>
                  <p className="text-xs text-neutral-500 mt-1">Tus compras procesadas aparecerán aquí.</p>
                </div>
              ) : (
                orders.map((order: any, index: number) => {
                  const itemsList: any[] = order.items || order.detalles || [];
                  
                  const calculatedTotal = itemsList.reduce((acc, it) => {
                    const price = parseFloat(it.precio_unitario_usd || it.precio_usd || 0);
                    return acc + price * (it.cantidad || 1);
                  }, 0);

                  const finalTotalUSD = parseFloat(order.total_usd || order.monto_usd || order.total || calculatedTotal);

                  return (
                    <div
                      key={order.id || index}
                      className="bg-[#181510] border border-[#292217] rounded-xl p-4 hover:border-amber-500/30 transition-all space-y-2.5"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Orden #{order.id}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                            <Calendar size={12} />
                            <span>
                              {order.created_at || order.fecha || order.creado_en
                                ? new Date(order.created_at || order.fecha || order.creado_en).toLocaleString('es-VE')
                                : 'Reciente'}
                            </span>
                          </div>
                        </div>
                        <span className="text-base font-black text-amber-400">
                          ${finalTotalUSD > 0 ? finalTotalUSD.toFixed(2) : '0.00'}
                        </span>
                      </div>

                      {/* Productos incluidos */}
                      {itemsList.length > 0 && (
                        <div className="bg-[#0e0d0a] p-2.5 rounded-lg border border-[#221c13] space-y-1 my-2">
                          {itemsList.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-xs text-neutral-300">
                              <span className="truncate max-w-[220px]">
                                <strong className="text-amber-400">{item.cantidad}x</strong>{' '}
                                {item.producto_nombre || item.producto?.nombre || 'Producto'}
                              </span>
                              <span className="font-mono text-neutral-400">
                                ${(parseFloat(item.precio_unitario_usd || item.precio_usd || 0) * item.cantidad).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-[#262016] text-xs">
                        <span className="text-neutral-400">Estado:</span>
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold uppercase text-[11px]">
                          <CheckCircle2 size={13} />
                          {order.estado || 'Procesado'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {ordersError && (
                <div className="flex items-center gap-2 text-amber-500 text-xs p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20 mt-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{ordersError}</span>
                </div>
              )}
            </div>

            {/* FOOTER MODAL (CERRAR) */}
            <div className="mt-5 pt-3 border-t border-[#262016] flex justify-end">
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="w-full py-2.5 bg-[#221d16] hover:bg-[#2c261d] border border-[#382f22] text-xs font-bold text-neutral-200 rounded-xl transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};