import React, { useEffect, useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MessageSquare, 
  Bike, 
  GlassWater, 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  PackageCheck, 
  ArrowRight, 
  Star,
  Bell,
  Navigation,
  MapPin,
  ShoppingBag
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;

const homeIcon = L.divIcon({
  className: 'custom-home-icon',
  html: `<div style="background-color: #0d0c0a; border: 2.5px solid #f59e0b; color: #f59e0b; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(245, 158, 11, 0.6);">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>`,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

const bikeIcon = L.divIcon({
  className: 'custom-bike-icon',
  html: `<div style="background-color: #f59e0b; color: #0d0c0a; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 25px rgba(245, 158, 11, 0.8); border: 2.5px solid #ffffff;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
        </div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

interface Repartidor {
  id: number;
  nombre: string;
  telefono: string;
  vehiculo: string;
  calificacion: string | number;
  foto_url?: string;
  latitud_actual?: number;
  longitud_actual?: number;
}

interface PedidoItem {
  id?: number;
  producto_nombre?: string;
  nombre?: string;
  cantidad: number;
  precio_unitario_usd?: number | string;
  precio_usd?: number | string;
}

interface Pedido {
  id: number;
  estado?: string;
  monto_total_usd?: number | string;
  metodo_pago?: string;
  nombre_cliente?: string;
  direccion_entrega?: string;
  tiempo_estimado?: string;
  repartidor?: Repartidor | null;
  items?: PedidoItem[];
  detalles?: PedidoItem[];
}

interface Props {
  onClose: () => void;
}

const ESTADOS_ORDEN = [
  { clave: 'RECIBIDO', titulo: 'Recibido', desc: 'Pedido registrado con éxito' },
  { clave: 'PREPARANDO', titulo: 'Preparando', desc: 'Empacando tus bebidas' },
  { clave: 'EN_CAMINO', titulo: 'En Camino', desc: 'Tu repartidor está en ruta' },
  { clave: 'ENTREGADO', titulo: 'Entregado', desc: '¡Disfruta tu pedido!' },
];

export const OrderTrackingModal: React.FC<Props> = ({ onClose }) => {
  const [ultimoPedido, setUltimoPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const destCoords: [number, number] = [10.1353, -64.6862];
  const driverCoords: [number, number] = [
    ultimoPedido?.repartidor?.latitud_actual || 10.1410,
    ultimoPedido?.repartidor?.longitud_actual || -64.6950,
  ];

  const fetchUltimoPedido = async () => {
    try {
      const localIds: number[] = JSON.parse(localStorage.getItem('my_orders') || '[]');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiUrl}/api/pedidos/`);

      if (!response.ok) throw new Error('No se pudo conectar con el servidor.');

      const data = await response.json();
      const listaPedidos: Pedido[] = Array.isArray(data) ? data : data.results || [];

      const misPedidos = localIds.length > 0
        ? listaPedidos.filter((p) => localIds.includes(p.id))
        : listaPedidos;

      if (misPedidos.length > 0) {
        misPedidos.sort((a, b) => b.id - a.id);
        const pedidoActualizado = misPedidos[0];

        if (ultimoPedido && ultimoPedido.id === pedidoActualizado.id && ultimoPedido.estado !== pedidoActualizado.estado) {
          triggerToast(pedidoActualizado.estado || '');
        }

        setUltimoPedido(pedidoActualizado);
      } else {
        setUltimoPedido(null);
      }
    } catch (err: any) {
      console.error(err);
      setError('Error al consultar el pedido en curso.');
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (nuevoEstado: string) => {
    let mensaje = 'El estado de tu pedido ha cambiado.';
    if (nuevoEstado === 'PREPARANDO') mensaje = '🍹 ¡Tu pedido está siendo empacado!';
    if (nuevoEstado === 'EN_CAMINO') mensaje = '🛵 ¡Tu repartidor ya va en camino!';
    if (nuevoEstado === 'ENTREGADO') mensaje = '🎉 ¡Tu pedido ha sido entregado!';

    setToastMessage(mensaje);
    setTimeout(() => setToastMessage(null), 4500);
  };

  useEffect(() => {
    fetchUltimoPedido();
    if (ultimoPedido?.estado === 'ENTREGADO') return;

    const interval = setInterval(fetchUltimoPedido, 4000);
    return () => clearInterval(interval);
  }, [ultimoPedido?.estado]);

  const handleFinishAndNewOrder = () => {
    if (ultimoPedido) {
      const localIds: number[] = JSON.parse(localStorage.getItem('my_orders') || '[]');
      const updatedOrders = localIds.filter((id) => id !== ultimoPedido.id);
      localStorage.setItem('my_orders', JSON.stringify(updatedOrders));
    }
    onClose();
  };

  const estadoActual = ultimoPedido?.estado || 'RECIBIDO';
  const indexEstadoActual = ESTADOS_ORDEN.findIndex((e) => e.clave === estadoActual);
  const esEntregado = estadoActual === 'ENTREGADO';
  const totalUSD = parseFloat(String(ultimoPedido?.monto_total_usd || 0));

  const itemsComprados = ultimoPedido?.items || ultimoPedido?.detalles || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <style>{`
        .leaflet-tile-pane {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3);
        }
        .leaflet-container {
          background: #0d0c0a !important;
        }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: #14120e !important;
          color: #ffffff !important;
          border: 1px solid #2a2419 !important;
          border-radius: 12px !important;
        }
      `}</style>

      {toastMessage && (
        <div className="absolute top-6 z-50 bg-amber-400 text-neutral-950 font-black px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border-2 border-white text-sm">
          <Bell size={20} className="shrink-0 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="relative w-full max-w-5xl h-[650px] bg-[#0d0c0a] border border-[#2a2419] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* PANEL IZQUIERDO */}
        <div className="w-full md:w-[420px] bg-[#12100d]/95 border-r border-[#262016] p-6 flex flex-col justify-between z-10 overflow-y-auto">
          <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#262016] pb-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {loading && !ultimoPedido ? 'Cargando...' : ultimoPedido ? `Pedido #${ultimoPedido.id}` : 'Sin Pedidos'}
                </h2>
                <p className="text-neutral-400 text-xs mt-1">
                  {ultimoPedido?.nombre_cliente ? `Cliente: ${ultimoPedido.nombre_cliente}` : 'PanaDrink Delivery'}
                </p>
              </div>
              <button
                onClick={onClose}
                type="button"
                className="w-9 h-9 bg-[#1c1914] border border-[#332a1b] rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:border-amber-400 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {loading && !ultimoPedido ? (
              <div className="flex flex-col items-center justify-center py-20 text-neutral-400 gap-3">
                <Loader2 size={32} className="animate-spin text-amber-400" />
                <p className="text-sm">Buscando pedido...</p>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-red-400 text-sm py-10 justify-center">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            ) : !ultimoPedido ? (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <GlassWater size={32} className="text-neutral-600 mb-2" />
                <p className="text-white font-semibold">Sin pedidos activos.</p>
              </div>
            ) : (
              <>
                {/* Banner Tiempo */}
                {esEntregado ? (
                  <div className="bg-gradient-to-r from-emerald-950/80 to-emerald-900/50 border border-emerald-500/40 p-4 rounded-2xl flex items-center gap-3">
                    <Sparkles size={28} className="text-emerald-400 shrink-0 animate-pulse" />
                    <div>
                      <h4 className="text-emerald-400 font-bold text-sm">¡Pedido Entregado!</h4>
                      <p className="text-emerald-200/80 text-xs">¡Gracias por preferir PanaDrink!</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#1b1712] border border-[#382e1c] rounded-2xl p-4 text-center shadow-inner">
                    <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                      <Clock size={14} className="animate-pulse" />
                      Tiempo Estimado
                    </div>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-black text-amber-400 tracking-tight">
                        {ultimoPedido.tiempo_estimado || '15-25'}
                      </span>
                      {!ultimoPedido.tiempo_estimado?.includes('MIN') && (
                        <span className="text-xl font-bold text-amber-400/90 uppercase">MIN</span>
                      )}
                    </div>
                    <p className="text-neutral-400 text-xs mt-2 font-medium">
                      Total: <span className="text-white font-bold">${totalUSD.toFixed(2)}</span> ({ultimoPedido.metodo_pago || 'Pago Móvil'})
                    </p>
                  </div>
                )}

                {/* Timeline */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Progreso de la Orden</h3>
                  <div className="relative pl-6 space-y-4 border-l-2 border-[#2b2418] ml-2">
                    {ESTADOS_ORDEN.map((est, idx) => {
                      const estaCompletado = idx < indexEstadoActual || esEntregado;
                      const esElActual = idx === indexEstadoActual && !esEntregado;

                      return (
                        <div key={est.clave} className="relative">
                          {estaCompletado ? (
                            <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center">
                              <CheckCircle2 size={12} className="text-neutral-950 stroke-[3]" />
                            </div>
                          ) : esElActual ? (
                            <div className="absolute -left-[35px] -top-0.5 w-6 h-6 rounded-full border-2 border-amber-400 bg-[#12100d] flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            </div>
                          ) : (
                            <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border border-neutral-600 bg-[#12100d]" />
                          )}

                          <h4 className={`font-bold text-sm leading-none ${esElActual ? 'text-amber-400 font-extrabold' : estaCompletado ? 'text-white' : 'text-neutral-500'}`}>
                            {est.titulo}
                          </h4>
                          <p className={`text-xs mt-1 ${esElActual ? 'text-neutral-200 font-medium' : 'text-neutral-500'}`}>
                            {esElActual ? est.desc : estaCompletado ? 'Completado' : 'Pendiente'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tarjeta de Dirección de Entrega */}
                {ultimoPedido?.direccion_entrega && (
                  <div className="bg-[#181510] border border-[#2b2418] rounded-2xl p-3.5 flex items-start gap-3">
                    <MapPin size={18} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white">Dirección de Entrega</h5>
                      <p className="text-neutral-400 text-xs mt-0.5 line-clamp-2">
                        {ultimoPedido.direccion_entrega}
                      </p>
                    </div>
                  </div>
                )}

                {/* Resumen Compacto de Productos */}
                {itemsComprados.length > 0 && (
                  <div className="bg-[#181510] border border-[#2b2418] rounded-2xl p-3.5">
                    <div className="flex items-center gap-2 mb-2 text-neutral-300 font-bold text-xs">
                      <ShoppingBag size={14} className="text-amber-400" />
                      <span>Resumen de la Orden</span>
                    </div>
                    <div className="flex flex-col gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {itemsComprados.map((it, i) => (
                        <div key={i} className="flex justify-between items-center text-xs text-neutral-400">
                          <span className="truncate max-w-[200px]">
                            {it.cantidad}x {it.producto_nombre || it.nombre || 'Producto'}
                          </span>
                          <span className="text-white font-semibold">
                            ${((parseFloat(String(it.precio_usd || it.precio_unitario_usd || 0))) * it.cantidad).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Pie del Panel (Repartidor o Calificación) */}
          <div className="mt-4 pt-3 border-t border-[#262016]">
            {esEntregado ? (
              <div className="flex flex-col gap-3">
                <div className="bg-[#181510] border border-[#2c2518] rounded-2xl p-3 text-center">
                  <p className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">Califica tu servicio</p>
                  <div className="flex justify-center gap-2 my-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="cursor-pointer"
                      >
                        <Star size={22} className={star <= (hoverRating || rating) ? 'text-amber-400 fill-amber-400' : 'text-neutral-600'} />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFinishAndNewOrder}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  Hacer otro pedido
                  <ArrowRight size={18} />
                </button>
              </div>
            ) : ultimoPedido?.repartidor ? (
              <div className="bg-[#191611] border border-[#2e261a] rounded-2xl p-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 border border-amber-400/50 overflow-hidden shrink-0">
                    <img src={ultimoPedido.repartidor.foto_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} alt={ultimoPedido.repartidor.nombre} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{ultimoPedido.repartidor.nombre}</h4>
                    <p className="text-neutral-400 text-xs">{ultimoPedido.repartidor.vehiculo}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button type="button" onClick={() => window.open(`https://wa.me/${ultimoPedido.repartidor?.telefono}`, '_blank')} className="bg-[#242019] text-white py-2 px-3 rounded-xl border border-[#382f21] text-xs flex items-center justify-center gap-2">
                    <MessageSquare size={14} /> Chat
                  </button>
                  <a href={`tel:${ultimoPedido.repartidor.telefono}`} className="bg-amber-400 text-neutral-950 font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2">
                    <Phone size={14} /> Llamar
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-neutral-500 text-xs flex items-center justify-center gap-2">
                <Bike size={16} className="text-amber-400 animate-bounce" />
                <span>Asignando repartidor cercano...</span>
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO: MAPA LEAFLET */}
        <div className="hidden md:block flex-1 relative bg-[#080705] overflow-hidden">
          {esEntregado ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-[#080705]">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
                <PackageCheck size={40} />
              </div>
              <h3 className="text-white font-bold text-xl">¡Pedido Entregado con Éxito!</h3>
            </div>
          ) : (
            <MapContainer
              center={destCoords}
              zoom={14}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />

              <Marker position={destCoords} icon={homeIcon}>
                <Popup>
                  <span className="font-bold text-xs">{ultimoPedido?.direccion_entrega || 'Tu ubicación'}</span>
                </Popup>
              </Marker>

              <Marker position={driverCoords} icon={bikeIcon}>
                <Popup>
                  <span className="font-bold text-xs">{ultimoPedido?.repartidor?.nombre || 'Repartidor en camino'}</span>
                </Popup>
              </Marker>

              <Polyline
                positions={[driverCoords, destCoords]}
                pathOptions={{ color: '#f59e0b', weight: 4, dashArray: '8, 8' }}
              />
            </MapContainer>
          )}

          <div className="absolute bottom-4 right-4 z-[400] flex items-center gap-2 bg-[#12100d]/90 border border-[#262016] px-3.5 py-1.5 rounded-full text-neutral-300 text-xs font-semibold backdrop-blur-md">
            <Navigation size={14} className="text-amber-400 animate-spin" />
            <span>GPS PanaDrink Live Tracking</span>
          </div>
        </div>

      </div>
    </div>
  );
};