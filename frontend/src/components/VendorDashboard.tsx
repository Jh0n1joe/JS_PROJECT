import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Package, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle, 
  ArrowLeft,
  DollarSign,
  Power,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { TASA_BCV } from '../data/mockProductos';

interface Props {
  onBack: () => void;
}

export const VendorDashboard: React.FC<Props> = ({ onBack }) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'pedidos' | 'inventario'>('pedidos');
  
  // Estados de datos
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar pedidos entrantes desde Django API
  const fetchVendorOrders = async () => {
    setLoadingPedidos(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiUrl}/api/pedidos/`);

      if (!response.ok) throw new Error('Error al conectar con la API de pedidos.');

      const data = await response.json();
      const lista: any[] = Array.isArray(data) ? data : data.results || [];

      // Si el proveedor tiene una sede asignada, se filtran los pedidos de su sede
      const pedidosSede = user?.sedeId
        ? lista.filter((p) => p.sede === user.sedeId || p.sede_id === user.sedeId)
        : lista;

      pedidosSede.sort((a, b) => b.id - a.id);
      setPedidos(pedidosSede);
    } catch (err: any) {
      console.error(err);
      setError('No se pudieron cargar los pedidos de la sede.');
    } finally {
      setLoadingPedidos(false);
    }
  };

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  // Actualizar estado del pedido (Ej: Pendiente -> En Camino)
  const handleUpdateStatus = async (orderId: number, nuevoEstado: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiUrl}/api/pedidos/${orderId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (response.ok) {
        setPedidos((prev) =>
          prev.map((p) => (p.id === orderId ? { ...p, estado: nuevoEstado } : p))
        );
      }
    } catch (err) {
      console.error('Error actualizando estado:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0c0a] text-neutral-100 font-sans">
      
      {/* Header del Panel de Proveedor */}
      <header className="bg-[#12110e] border-b border-[#2a2419] px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              type="button"
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-xs font-bold cursor-pointer"
            >
              <ArrowLeft size={16} />
              Volver a la tienda
            </button>
            <div className="h-4 w-[1px] bg-[#2a2419]" />
            <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
              <Store size={18} />
              <span>Panel de Proveedor — {user?.nombre || 'Sede Central'}</span>
            </div>
          </div>

          <button
            onClick={fetchVendorOrders}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-400 bg-[#1a1712] border border-[#2c261b] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={loadingPedidos ? 'animate-spin' : ''} />
            Sincronizar
          </button>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Pestañas de Navegación */}
        <div className="flex items-center gap-3 border-b border-[#262016] pb-4 mb-8">
          <button
            onClick={() => setActiveTab('pedidos')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pedidos'
                ? 'bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/10'
                : 'bg-[#14120e] border border-[#2a2419] text-neutral-400 hover:text-white'
            }`}
          >
            <ShoppingBag size={16} />
            Pedidos Entrantes ({pedidos.length})
          </button>

          <button
            onClick={() => setActiveTab('inventario')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inventario'
                ? 'bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/10'
                : 'bg-[#14120e] border border-[#2a2419] text-neutral-400 hover:text-white'
            }`}
          >
            <Package size={16} />
            Inventario & Stock
          </button>
        </div>

        {/* CONTENIDO TAB 1: PEDIDOS ENTRANTES */}
        {activeTab === 'pedidos' && (
          <div className="space-y-4">
            {loadingPedidos ? (
              <div className="text-center py-16 text-neutral-500 text-xs">
                Cargando pedidos de la sede...
              </div>
            ) : error ? (
              <div className="bg-red-950/50 border border-red-500/30 p-4 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            ) : pedidos.length === 0 ? (
              <div className="text-center py-16 text-neutral-500 text-xs">
                No hay pedidos registrados para esta sede en este momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pedidos.map((order) => (
                  <div
                    key={order.id}
                    className="bg-[#14120e] border border-[#2a2419] rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Cabecera de Orden */}
                      <div className="flex justify-between items-start border-b border-[#221c13] pb-3 mb-3">
                        <div>
                          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Orden #{order.id}
                          </span>
                          <p className="text-[11px] text-neutral-400 mt-1 font-semibold">
                            Cliente: {order.nombre_cliente || 'Anónimo'}
                          </p>
                          <p className="text-[10px] text-neutral-500">
                            Tel: {order.telefono || 'Sin teléfono'}
                          </p>
                        </div>
                        <span className="text-lg font-black text-amber-400">
                          ${parseFloat(order.total_usd || 0).toFixed(2)}
                        </span>
                      </div>

                      {/* Dirección */}
                      <div className="text-[11px] text-neutral-300 bg-[#0e0d0a] p-2.5 rounded-xl border border-[#221c13] mb-3">
                        <strong className="text-amber-400 block mb-0.5">Dirección de Entrega:</strong>
                        {order.direccion_entrega || 'Ubicación local'}
                      </div>

                      {/* Ítems del Pedido */}
                      <div className="space-y-1 text-xs text-neutral-300">
                        {(order.items || order.detalles || []).map((it: any, i: number) => (
                          <div key={i} className="flex justify-between">
                            <span>
                              <strong className="text-amber-400">{it.cantidad}x</strong>{' '}
                              {it.producto_nombre || it.producto?.nombre || 'Liqueur Item'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Acciones de Estado */}
                    <div className="pt-3 border-t border-[#221c13] space-y-2">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                        Estado Actual: <span className="text-emerald-400">{order.estado || 'PROCESADO'}</span>
                      </span>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'EN PREPARACION')}
                          className="bg-[#1e1b15] hover:bg-[#2b251b] border border-[#382f20] text-amber-400 text-[11px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          En Preparación
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'EN CAMINO')}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Despachar Delivery
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO TAB 2: INVENTARIO */}
        {activeTab === 'inventario' && (
          <div className="bg-[#14120e] border border-[#2a2419] rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-2">Control de Productos de la Sede</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Ajusta la disponibilidad o altera precios del catálogo asignado a esta licorería.
            </p>

            <div className="text-center py-12 text-neutral-500 text-xs border border-dashed border-[#2a2419] rounded-xl">
              Próximamente: Formulario rápido para modificar precios e inventario directo a Django.
            </div>
          </div>
        )}

      </main>
    </div>
  );
};