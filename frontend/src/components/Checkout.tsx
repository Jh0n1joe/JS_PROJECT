import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  ShoppingBag, 
  CreditCard, 
  Copy, 
  Check, 
  ArrowLeft, 
  Crosshair, 
  Loader2 
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { TASA_BCV } from '../data/mockProductos';

interface Props {
  onBack: () => void;
  onConfirmOrder: () => void;
}

export const Checkout: React.FC<Props> = ({ onBack, onConfirmOrder }) => {
  const { cart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<'pago_movil' | 'zelle' | 'efectivo'>('pago_movil');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Datos del formulario
  const [address, setAddress] = useState('');
  const [apt, setApt] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [instructions, setInstructions] = useState('');
  const [comprobante, setComprobante] = useState('');
  const [loadingGps, setLoadingGps] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const subtotalUSD = cart.reduce((acc, item) => acc + item.producto.precio_usd * item.cantidad, 0);
  const deliveryUSD = cart.length > 0 ? 3.00 : 0.00;
  const totalUSD = subtotalUSD + deliveryUSD;
  const totalBs = (totalUSD * TASA_BCV).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Función para obtener la ubicación exacta por GPS
  const handleGetExactLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }

    setLoadingGps(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress(`${latitude}, ${longitude}`);
          }
        } catch (error) {
          console.error('Error al obtener dirección:', error);
          alert('No se pudo convertir las coordenadas a dirección.');
        } finally {
          setLoadingGps(false);
        }
      },
      (error) => {
        console.error(error);
        setLoadingGps(false);
        alert('No se pudo acceder a tu ubicación.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'pago_movil' && !/^\d{4}$/.test(comprobante)) {
      alert('Ingresa exactamente los últimos 4 dígitos del comprobante de Pago Móvil.');
      return;
    }

    setSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiUrl}/api/pedidos/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_cliente: customerName,
          telefono: phone,
          direccion_entrega: address,
          referencia_ubicacion: [apt, instructions].filter(Boolean).join(' | '),
          metodo_pago: paymentMethod === 'pago_movil'
            ? 'PAGO_MOVIL'
            : paymentMethod === 'zelle'
              ? 'ZELLE'
              : 'EFECTIVO',
          items: cart.map((item) => ({
            producto_id: item.producto.id,
            cantidad: item.cantidad,
          })),
          comprobante: paymentMethod === 'pago_movil' ? comprobante : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const detail = errorData?.detail || Object.values(errorData || {}).flat().join(' ');
        throw new Error(detail || 'No se pudo guardar el pedido.');
      }

      onConfirmOrder();
    } catch (err) {
      console.error('Error inesperado:', err);
      alert('Ocurrió un error inesperado al procesar el pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0c0a] text-neutral-100 flex flex-col justify-between font-sans">
      <div>
        {/* Header Checkout Seguro */}
        <header className="bg-[#12110e] border-b border-[#2a2419] px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={onBack}
              type="button"
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-semibold"
            >
              <ArrowLeft size={18} />
              Volver al catálogo
            </button>
            <div className="flex items-center gap-2 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck size={16} className="text-amber-400" />
              Secure Checkout
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-10">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Columna Izquierda: Formulario + Resumen de Ítems */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              {/* Delivery Details */}
              <div className="bg-[#14120e] border border-[#2a2419] rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 text-amber-400 font-bold text-lg mb-6">
                  <Truck size={22} />
                  <h2>Delivery Details</h2>
                </div>

                <div className="flex flex-col gap-4">
                  {/* FULL ADDRESS CON BOTÓN DE MIRA GPS */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 mb-1.5 uppercase tracking-wider">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Full name"
                      className="w-full bg-[#1e1b15] border border-[#332b1c] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-400 mb-1.5 uppercase tracking-wider">
                      Full Address
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street, Sector, Municipality"
                        className="flex-1 bg-[#1e1b15] border border-[#332b1c] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleGetExactLocation}
                        disabled={loadingGps}
                        title="Obtener ubicación exacta por GPS"
                        className="bg-[#1e1b15] hover:bg-[#2c261b] border border-[#332b1c] hover:border-amber-400 text-amber-400 p-3 rounded-xl transition-all flex items-center justify-center shrink-0 disabled:opacity-50 active:scale-95"
                      >
                        {loadingGps ? (
                          <Loader2 size={18} className="animate-spin text-amber-400" />
                        ) : (
                          <Crosshair size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-400 mb-1.5 uppercase tracking-wider">
                        Apt / Suite
                      </label>
                      <input
                        type="text"
                        value={apt}
                        onChange={(e) => setApt(e.target.value)}
                        placeholder="e.g. Apt 4B"
                        className="w-full bg-[#1e1b15] border border-[#332b1c] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-400 mb-1.5 uppercase tracking-wider">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="04XX-XXXXXXX"
                        className="w-full bg-[#1e1b15] border border-[#332b1c] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-400 mb-1.5 uppercase tracking-wider">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Leave at reception, call upon arrival..."
                      className="w-full bg-[#1e1b15] border border-[#332b1c] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary Items */}
              <div className="bg-[#14120e] border border-[#2a2419] rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 text-amber-400 font-bold text-lg mb-6">
                  <ShoppingBag size={22} />
                  <h2>Order Summary</h2>
                </div>

                <div className="flex flex-col gap-3">
                  {cart.map((item) => (
                    <div
                      key={item.producto.id}
                      className="bg-[#1b1813] border border-[#2c261b] rounded-xl p-3.5 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#0d0c0a] border border-[#262016] rounded-lg p-1.5 flex items-center justify-center shrink-0">
                          <img
                            src={item.producto.imagen_url}
                            alt={item.producto.nombre}
                            className="max-h-full object-contain"
                          />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-sm">{item.producto.nombre}</h4>
                          <p className="text-neutral-500 text-xs mt-0.5">
                            {item.producto.subcategoria || item.producto.categoria} • Qty: {item.cantidad}
                          </p>
                        </div>
                      </div>
                      <span className="text-amber-400 font-extrabold text-base whitespace-nowrap">
                        ${(item.producto.precio_usd * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Columna Derecha: Métodos de Pago y Checkout */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-[#14120e] border border-[#2a2419] rounded-2xl p-6 shadow-xl sticky top-24">
                <div className="flex items-center gap-3 text-amber-400 font-bold text-lg mb-6">
                  <CreditCard size={22} />
                  <h2>Payment Method</h2>
                </div>

                {/* Seleccionador de Método de Pago */}
                <div className="flex flex-col gap-3 mb-6">
                  <label
                    onClick={() => setPaymentMethod('pago_movil')}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'pago_movil'
                        ? 'border-amber-400 bg-[#221d15]'
                        : 'border-[#2a2419] bg-[#1a1712] hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'pago_movil' ? 'border-amber-400 bg-amber-400' : 'border-neutral-600'
                      }`}>
                        {paymentMethod === 'pago_movil' && <div className="w-1.5 h-1.5 rounded-full bg-neutral-950" />}
                      </div>
                      <span className="text-white font-bold text-sm">Pago Móvil</span>
                    </div>
                    <span className="text-neutral-400 text-xs">📲</span>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('zelle')}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'zelle'
                        ? 'border-amber-400 bg-[#221d15]'
                        : 'border-[#2a2419] bg-[#1a1712] hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'zelle' ? 'border-amber-400 bg-amber-400' : 'border-neutral-600'
                      }`}>
                        {paymentMethod === 'zelle' && <div className="w-1.5 h-1.5 rounded-full bg-neutral-950" />}
                      </div>
                      <span className="text-white font-bold text-sm">Zelle</span>
                    </div>
                    <span className="text-neutral-400 text-xs font-bold">$</span>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('efectivo')}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'efectivo'
                        ? 'border-amber-400 bg-[#221d15]'
                        : 'border-[#2a2419] bg-[#1a1712] hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'efectivo' ? 'border-amber-400 bg-amber-400' : 'border-neutral-600'
                      }`}>
                        {paymentMethod === 'efectivo' && <div className="w-1.5 h-1.5 rounded-full bg-neutral-950" />}
                      </div>
                      <span className="text-white font-bold text-sm">Cash on Delivery</span>
                    </div>
                    <span className="text-neutral-400 text-xs">💵</span>
                  </label>
                </div>

                {/* Transfer Details según selección */}
                {paymentMethod === 'pago_movil' && (
                  <div className="bg-[#181510] border border-[#2b2418] rounded-xl p-4 mb-6">
                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                      Transfer Details
                    </h4>
                    <div className="flex flex-col gap-2.5 text-xs">
                      <div className="flex justify-between items-center bg-[#0e0d0a] p-2.5 rounded-lg border border-[#241e14]">
                        <div>
                          <span className="text-neutral-500 block text-[10px]">Bank</span>
                          <span className="text-white font-semibold">BDV (0102)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('0102', 'bank')}
                          className="text-neutral-400 hover:text-amber-400 transition-colors"
                        >
                          {copiedField === 'bank' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>

                      <div className="flex justify-between items-center bg-[#0e0d0a] p-2.5 rounded-lg border border-[#241e14]">
                        <div>
                          <span className="text-neutral-500 block text-[10px]">Phone</span>
                          <span className="text-white font-semibold">0412-3333510</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('04123333510', 'phone')}
                          className="text-neutral-400 hover:text-amber-400 transition-colors"
                        >
                          {copiedField === 'phone' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>

                      <div className="flex justify-between items-center bg-[#0e0d0a] p-2.5 rounded-lg border border-[#241e14]">
                        <div>
                          <span className="text-neutral-500 block text-[10px]">RIF</span>
                          <span className="text-white font-semibold">J-32765839</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('J32765839', 'rif')}
                          className="text-neutral-400 hover:text-amber-400 transition-colors"
                        >
                          {copiedField === 'rif' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>

                      <div>
                        <label htmlFor="comprobante" className="text-neutral-300 block mb-1.5 font-semibold">
                          Últimos 4 dígitos del comprobante
                        </label>
                        <input
                          id="comprobante"
                          name="comprobante"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]{4}"
                          minLength={4}
                          maxLength={4}
                          required={paymentMethod === 'pago_movil'}
                          value={comprobante}
                          onChange={(event) => setComprobante(event.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="Ej. 4821"
                          aria-describedby="comprobante-help"
                          className="w-full bg-[#0e0d0a] border border-[#332b1c] rounded-lg px-3 py-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                        />
                        <span id="comprobante-help" className="text-neutral-500 block mt-1">
                          Debe contener exactamente 4 dígitos.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'zelle' && (
                  <div className="bg-[#181510] border border-[#2b2418] rounded-xl p-4 mb-6">
                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                      Zelle Details
                    </h4>
                    <div className="flex justify-between items-center bg-[#0e0d0a] p-2.5 rounded-lg border border-[#241e14]">
                      <div>
                        <span className="text-neutral-500 block text-[10px]">Email</span>
                        <span className="text-white font-semibold text-xs">pagos@panadrink247.com</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('pagos@panadrink247.com', 'zelle')}
                        className="text-neutral-400 hover:text-amber-400 transition-colors"
                      >
                        {copiedField === 'zelle' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Desglose de Totales */}
                <div className="border-t border-[#262016] pt-4 flex flex-col gap-2 text-sm">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span className="text-white font-medium">${subtotalUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Delivery</span>
                    <span className="text-white font-medium">${deliveryUSD.toFixed(2)}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#262016] flex flex-col items-end">
                    <div className="flex justify-between w-full items-baseline">
                      <span className="text-white font-bold text-lg">Total</span>
                      <span className="text-amber-400 font-black text-3xl">${totalUSD.toFixed(2)}</span>
                    </div>
                    <span className="text-neutral-400 text-xs font-medium mt-1">
                      ≈ Bs. {totalBs} <span className="text-neutral-500">(Tasa BCV)</span>
                    </span>
                  </div>
                </div>

                {/* Botón Pagar */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-6 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-neutral-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-500/10 text-base"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin text-neutral-950" />
                      Guardando pedido...
                    </>
                  ) : (
                    <>
                      Confirmar y Pagar
                      <Check size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>

      <footer className="bg-[#080706] border-t border-[#1f1a12] py-6 px-6 text-neutral-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 PanaDrink Delivery. Premium Spirits 24/7.</p>
          <div className="flex items-center gap-6">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Contact Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};