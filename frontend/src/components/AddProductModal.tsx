// frontend/src/components/AddProductModal.tsx
import React, { useState } from 'react';
import { X, Plus, Package, DollarSign, Image, Loader2, AlertCircle, Hash, Utensils } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
  categorias: { id: string; nombre: string }[];
}

const OPCIONES_MARIDAJE = [
  { id: 'chocolate', label: 'Chocolate / Dulces' },
  { id: 'humo', label: 'Humo' },
  { id: 'frituras', label: 'Frituras / Pasapalos' },
  { id: 'frutos_secos', label: 'Frutos Secos' },
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onProductAdded,
  categorias,
}) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precioUsd, setPrecioUsd] = useState('');
  const [precioBs, setPrecioBs] = useState('');
  const [stock, setStock] = useState('10');
  const [categoria, setCategoria] = useState('');
  const [maridajesSeleccionados, setMaridajesSeleccionados] = useState<string[]>([]);
  const [imagen, setImagen] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleMaridaje = (id: string) => {
    setMaridajesSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const resetForm = () => {
    setNombre('');
    setDescripcion('');
    setPrecioUsd('');
    setPrecioBs('');
    setStock('10');
    setCategoria('');
    setMaridajesSeleccionados([]);
    setImagen(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('descripcion', descripcion);
      formData.append('precio_usd', precioUsd);
      formData.append('precio_bs', precioBs);
      formData.append('stock', stock);
      formData.append('categoria', categoria);

      if (user?.sede_id) {
        formData.append('sede_id', user.sede_id);
      }

      formData.append('maridajes', JSON.stringify(maridajesSeleccionados));

      if (imagen) {
        formData.append('imagen', imagen);
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/productos/crear/`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.detail || 'Error al guardar el producto.');
      }

      resetForm();
      onProductAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#12100d] border border-[#2e2619] text-neutral-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => {
            resetForm();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-[#221d16] transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-2 text-amber-400">
            <Plus size={24} />
          </div>
          <h3 className="text-xl font-black text-white">Añadir Nuevo Producto</h3>
          <p className="text-xs text-neutral-400 mt-1">
            Sube un nuevo licor o bebida al catálogo de tu sede
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
              Nombre del Producto
            </label>
            <div className="relative">
              <Package size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Ron Santa Teresa 1796"
                className="w-full bg-[#181510] border border-[#292217] rounded-xl pl-9 pr-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                Categoría
              </label>
              <select
                required
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full bg-[#181510] border border-[#292217] rounded-xl px-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500/60 transition-colors cursor-pointer"
              >
                <option value="">Selecciona</option>
                {categorias.filter((c) => c.id !== 'TODOS').map((cat) => (
                  <option key={cat.id} value={cat.nombre}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                Stock / Cantidad
              </label>
              <div className="relative">
                <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="10"
                  className="w-full bg-[#181510] border border-[#292217] rounded-xl pl-9 pr-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                Precio USD ($)
              </label>
              <div className="relative">
                <DollarSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={precioUsd}
                  onChange={(e) => setPrecioUsd(e.target.value)}
                  placeholder="35.00"
                  className="w-full bg-[#181510] border border-[#292217] rounded-xl pl-9 pr-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                Precio Bs.
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={precioBs}
                onChange={(e) => setPrecioBs(e.target.value)}
                placeholder="1400.00"
                className="w-full bg-[#181510] border border-[#292217] rounded-xl px-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1 flex items-center gap-1">
              <Utensils size={13} className="text-amber-500" /> Maridajes Sugeridos
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {OPCIONES_MARIDAJE.map((m) => {
                const isSelected = maridajesSeleccionados.includes(m.id);
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => toggleMaridaje(m.id)}
                    className={`py-1.5 px-2.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#181510] border-[#292217] text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
              Descripción
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles del producto (ej: Presentación 750ml)..."
              className="w-full bg-[#181510] border border-[#292217] rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
              Imagen del Producto
            </label>
            <div className="flex items-center gap-2 bg-[#181510] border border-[#292217] rounded-xl p-2">
              <Image size={16} className="text-amber-500 ml-1.5 shrink-0" />
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setImagen(e.target.files?.[0] || null)}
                className="text-xs text-neutral-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 cursor-pointer w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Publicar Producto'}
          </button>
        </form>
      </div>
    </div>
  );
};