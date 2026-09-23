// frontend/src/components/AuthModal.tsx
import React, { useState } from 'react';
<<<<<<< HEAD
import { X, User, Store, LogIn, UserPlus, Upload, ShieldCheck, FileText } from 'lucide-react';
import { useAuthStore, type UserRole } from '../store/useAuthStore';

interface Props {
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('CLIENTE');
  
  // Campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [documentoIdentidad, setDocumentoIdentidad] = useState(''); // Cédula o RIF
  
  // Archivos (Imágenes)
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null);
  const [fotoDocumento, setFotoDocumento] = useState<File | null>(null);

  const loginStore = useAuthStore((state) => state.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulación de usuario guardado
    const mockUser = {
      id: Date.now(),
      email,
      nombre: nombre || email.split('@')[0],
      rol: isLogin ? 'CLIENTE' : role,
      documentoIdentidad,
      verificado: role === 'PROVEEDOR', // Se activará tras validación backend
    };
    
    loginStore(mockUser, 'mock-jwt-token-12345');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#14120e] border border-[#2a2419] rounded-2xl max-w-md w-full p-6 relative shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1.5 rounded-lg bg-[#1f1a13] cursor-pointer"
=======
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Store, 
  Loader2, 
  AlertCircle, 
  ArrowRight,
  IdCard,
  Camera,
  FileCheck,
  Building,
  MapPin
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccessLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos Generales
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState<'CLIENTE' | 'PROVEEDOR'>('CLIENTE');

  // Campos para CLIENTE
  const [cedula, setCedula] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null);
  const [fotoCedula, setFotoCedula] = useState<File | null>(null);

  // Campos para PROVEEDOR
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [fotoLocal, setFotoLocal] = useState<File | null>(null);
  const [comprobanteLocal, setComprobanteLocal] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

    try {
      if (isLogin) {
        const response = await fetch(`${apiUrl}/api/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Credenciales incorrectas.');

        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);

        if (onSuccessLogin) onSuccessLogin(data.user);
        onClose();
        window.location.reload();
      } else {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('nombre', nombre);
        formData.append('telefono', telefono);
        formData.append('rol', rol);

        if (rol === 'CLIENTE') {
          formData.append('cedula', cedula);
          if (fotoPerfil) formData.append('foto_perfil', fotoPerfil);
          if (fotoCedula) formData.append('foto_cedula', fotoCedula);
        } else if (rol === 'PROVEEDOR') {
          formData.append('direccion', direccion);
          formData.append('ciudad', ciudad);
          if (fotoLocal) formData.append('foto_local', fotoLocal);
          if (comprobanteLocal) formData.append('comprobante_local', comprobanteLocal);
        }

        const response = await fetch(`${apiUrl}/api/registro/`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al registrar el usuario.');

        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);

        if (onSuccessLogin) onSuccessLogin(data.user);
        onClose();
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#12100d] border border-[#2e2619] text-neutral-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-[#221d16] transition-colors cursor-pointer"
>>>>>>> a493002 (error de imagenes)
        >
          <X size={18} />
        </button>

<<<<<<< HEAD
        {/* Encabezado */}
        <div className="text-center space-y-1">
          <h3 className="text-xl font-black text-white">
            {isLogin ? '¡Bienvenido de Nuevo!' : 'Crear una Cuenta'}
          </h3>
          <p className="text-xs text-neutral-400">
            {isLogin ? 'Ingresa para gestionar tus compras o tu tienda' : 'Selecciona cómo deseas registrarte'}
          </p>
        </div>

        {/* Selector de Rol */}
        {!isLogin && (
          <div className="grid grid-cols-2 gap-3 p-1 bg-[#0b0a08] border border-[#231e15] rounded-xl">
            <button
              type="button"
              onClick={() => setRole('CLIENTE')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === 'CLIENTE'
                  ? 'bg-amber-400 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <User size={16} />
              Soy Cliente
            </button>
            <button
              type="button"
              onClick={() => setRole('PROVEEDOR')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === 'PROVEEDOR'
                  ? 'bg-amber-400 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Store size={16} />
              Soy Proveedor
            </button>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              {/* Nombre */}
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">
                  {role === 'PROVEEDOR' ? 'Nombre del Comercio / Sede' : 'Nombre Completo'}
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder={role === 'PROVEEDOR' ? 'Ej. Bodegón El Pana' : 'Ej. Juan Pérez'}
                  className="w-full bg-[#1b1813] border border-[#2c261b] rounded-xl px-4 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Digitos de Cédula o RIF */}
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">
                  {role === 'PROVEEDOR' ? 'Número de RIF Comercial' : 'Cédula de Identidad'}
                </label>
                <input
                  type="text"
                  required
                  value={documentoIdentidad}
                  onChange={(e) => setDocumentoIdentidad(e.target.value)}
                  placeholder={role === 'PROVEEDOR' ? 'J-12345678-0' : 'V-12345678'}
                  className="w-full bg-[#1b1813] border border-[#2c261b] rounded-xl px-4 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Carga de Foto de Perfil */}
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">
                  {role === 'PROVEEDOR' ? 'Logo del Comercio' : 'Foto de Perfil'}
                </label>
                <div className="relative border border-dashed border-[#2c261b] bg-[#1b1813] hover:border-amber-400/50 rounded-xl p-3 text-center transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setFotoPerfil(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-center gap-2 text-neutral-400 text-xs">
                    <Upload size={14} className="text-amber-400" />
                    <span className="truncate">
                      {fotoPerfil ? fotoPerfil.name : 'Subir imagen de perfil'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Carga de Comprobante / Cédula digital */}
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">
                  {role === 'PROVEEDOR' ? 'Comprobante de Fiabilidad (RIF / Licencia)' : 'Foto de Cédula (Legible)'}
                </label>
                <div className="relative border border-dashed border-[#2c261b] bg-[#1b1813] hover:border-amber-400/50 rounded-xl p-3 text-center transition-colors">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    required
                    onChange={(e) => setFotoDocumento(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-center gap-2 text-neutral-400 text-xs">
                    {role === 'PROVEEDOR' ? <ShieldCheck size={14} className="text-emerald-400" /> : <FileText size={14} className="text-amber-400" />}
                    <span className="truncate">
                      {fotoDocumento ? fotoDocumento.name : role === 'PROVEEDOR' ? 'Adjuntar comprobante fiscal' : 'Adjuntar foto de la cédula'}
                    </span>
                  </div>
=======
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-2 text-amber-400">
            <User size={24} />
          </div>
          <h3 className="text-xl font-black text-white">
            {isLogin ? 'Iniciar Sesión' : 'Crear una Cuenta'}
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            {isLogin
              ? 'Accede a tu cuenta para gestionar tus pedidos o productos'
              : 'Únete para realizar o recibir pedidos express 24/7'}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                  Tipo de Cuenta
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRol('CLIENTE')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      rol === 'CLIENTE'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                        : 'bg-[#181510] border-[#292217] text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <User size={14} /> Cliente
                  </button>
                  <button
                    type="button"
                    onClick={() => setRol('PROVEEDOR')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      rol === 'PROVEEDOR'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                        : 'bg-[#181510] border-[#292217] text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Store size={14} /> Licorería
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                  {rol === 'CLIENTE' ? 'Nombre Completo' : 'Nombre de la Licorería'}
                </label>
                <div className="relative">
                  {rol === 'CLIENTE' ? (
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  ) : (
                    <Building size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  )}
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder={rol === 'CLIENTE' ? 'Ej: Juan Pérez' : 'Ej: Licorería El Triunfo'}
                    className="w-full bg-[#181510] border border-[#292217] rounded-xl pl-9 pr-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 transition-colors"
                  />
                </div>
              </div>

              {rol === 'CLIENTE' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                      Cédula de Identidad / DNI
                    </label>
                    <div className="relative">
                      <IdCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="text"
                        required
                        value={cedula}
                        onChange={(e) => setCedula(e.target.value)}
                        placeholder="V-12345678"
                        className="w-full bg-[#181510] border border-[#292217] rounded-xl pl-9 pr-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                      Foto de Perfil (Opcional)
                    </label>
                    <div className="flex items-center gap-2 bg-[#181510] border border-[#292217] rounded-xl p-2">
                      <Camera size={16} className="text-amber-500 ml-1.5 shrink-0" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFotoPerfil(e.target.files?.[0] || null)}
                        className="text-xs text-neutral-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 cursor-pointer w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                      Foto de Cédula (Verificación)
                    </label>
                    <div className="flex items-center gap-2 bg-[#181510] border border-[#292217] rounded-xl p-2">
                      <FileCheck size={16} className="text-amber-500 ml-1.5 shrink-0" />
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) => setFotoCedula(e.target.files?.[0] || null)}
                        className="text-xs text-neutral-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 cursor-pointer w-full"
                      />
                    </div>
                  </div>
                </>
              )}

              {rol === 'PROVEEDOR' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                      Ciudad / Zona
                    </label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="text"
                        required
                        value={ciudad}
                        onChange={(e) => setCiudad(e.target.value)}
                        placeholder="Ej: Barcelona / Nueva Barcelona"
                        className="w-full bg-[#181510] border border-[#292217] rounded-xl pl-9 pr-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                      Dirección Detallada del Local
                    </label>
                    <textarea
                      required
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      rows={2}
                      placeholder="Ej: Av. Nueva Barcelona cruzamiento con Av. Centurión..."
                      className="w-full bg-[#181510] border border-[#292217] rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                      Foto de la Fachada (Se usará como foto de la Sede)
                    </label>
                    <div className="flex items-center gap-2 bg-[#181510] border border-[#292217] rounded-xl p-2">
                      <Camera size={16} className="text-amber-500 ml-1.5 shrink-0" />
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) => setFotoLocal(e.target.files?.[0] || null)}
                        className="text-xs text-neutral-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 cursor-pointer w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                      Comprobante del Local (RIF / Licencia de Licores)
                    </label>
                    <div className="flex items-center gap-2 bg-[#181510] border border-[#292217] rounded-xl p-2">
                      <FileCheck size={16} className="text-amber-500 ml-1.5 shrink-0" />
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        required
                        onChange={(e) => setComprobanteLocal(e.target.files?.[0] || null)}
                        className="text-xs text-neutral-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 cursor-pointer w-full"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                  Teléfono / WhatsApp
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="0412-1234567"
                    className="w-full bg-[#181510] border border-[#292217] rounded-xl pl-9 pr-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 transition-colors"
                  />
>>>>>>> a493002 (error de imagenes)
                </div>
              </div>
            </>
          )}

<<<<<<< HEAD
          {/* Email y Contraseña */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full bg-[#1b1813] border border-[#2c261b] rounded-xl px-4 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#1b1813] border border-[#2c261b] rounded-xl px-4 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
            />
=======
          <div>
            <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full bg-[#181510] border border-[#292217] rounded-xl pl-9 pr-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#181510] border border-[#292217] rounded-xl pl-9 pr-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>
>>>>>>> a493002 (error de imagenes)
          </div>

          <button
            type="submit"
<<<<<<< HEAD
            className="w-full bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black py-3 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors shadow-lg shadow-amber-400/10 cursor-pointer mt-2"
          >
            {isLogin ? <LogIn size={16} /> : <UserPlus size={16} />}
            {isLogin ? 'Iniciar Sesión' : 'Registrarse y Verificar'}
          </button>
        </form>

        {/* Alternar entre Login y Registro */}
        <div className="text-center pt-2 border-t border-[#221c13]">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia Sesión'}
          </button>
=======
            disabled={loading}
            className="w-full mt-3 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Ingresar' : 'Registrarse'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-[#262016] text-center">
          <p className="text-xs text-neutral-400">
            {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes cuenta?'}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="ml-1 text-amber-400 font-bold hover:underline cursor-pointer"
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
            </button>
          </p>
>>>>>>> a493002 (error de imagenes)
        </div>

      </div>
    </div>
  );
};