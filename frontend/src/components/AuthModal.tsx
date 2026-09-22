// frontend/src/components/AuthModal.tsx
import React, { useState } from 'react';
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
        >
          <X size={18} />
        </button>

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
                </div>
              </div>
            </>
          )}

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
          </div>

          <button
            type="submit"
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
        </div>

      </div>
    </div>
  );
};