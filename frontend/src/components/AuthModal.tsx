import React, { useState } from 'react';
import { ArrowRight, Building, Loader2, Lock, Mail, User, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccessLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<'CLIENTE' | 'PROVEEDOR'>('CLIENTE');

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const requestBody = isLogin
        ? JSON.stringify({ email, password })
        : (() => {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            formData.append('nombre', nombre);
            formData.append('rol', rol);
            return formData;
          })();
      const response = await fetch(`${apiUrl}/api/${isLogin ? 'login' : 'registro'}/`, {
        method: 'POST',
        headers: isLogin ? { 'Content-Type': 'application/json' } : undefined,
        body: requestBody,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.detail || 'No se pudo completar la operación.');

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      onSuccessLogin?.(data.user);
      onClose();
    } catch (requestError: any) {
      setError(requestError.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-[#2e2619] bg-[#12100d] p-6 text-neutral-200 shadow-2xl">
        <button onClick={onClose} type="button" className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-400 hover:bg-[#221d16] hover:text-white"><X size={18} /></button>
        <div className="mb-5 text-center"><h2 className="text-xl font-black text-white">{isLogin ? 'Iniciar Sesión' : 'Crear una Cuenta'}</h2><p className="mt-1 text-xs text-neutral-400">Gestiona tus pedidos y tu sede.</p></div>
        {error && <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && <><div className="flex gap-2"><button type="button" onClick={() => setRol('CLIENTE')} className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold ${rol === 'CLIENTE' ? 'border-amber-400 text-amber-400' : 'border-[#2e2619] text-neutral-400'}`}><User size={14} className="mr-1 inline" />Cliente</button><button type="button" onClick={() => setRol('PROVEEDOR')} className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold ${rol === 'PROVEEDOR' ? 'border-amber-400 text-amber-400' : 'border-[#2e2619] text-neutral-400'}`}><Building size={14} className="mr-1 inline" />Proveedor</button></div><input required value={nombre} onChange={(event) => setNombre(event.target.value)} placeholder="Nombre o comercio" className="w-full rounded-xl border border-[#292217] bg-[#181510] px-4 py-2.5 text-xs text-white outline-none focus:border-amber-400" /></>}
          <div className="relative"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="correo@ejemplo.com" className="w-full rounded-xl border border-[#292217] bg-[#181510] py-2.5 pl-9 pr-4 text-xs text-white outline-none focus:border-amber-400" /></div>
          <div className="relative"><Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" /><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Contraseña" className="w-full rounded-xl border border-[#292217] bg-[#181510] py-2.5 pl-9 pr-4 text-xs text-white outline-none focus:border-amber-400" /></div>
          <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-xs font-black text-neutral-950 disabled:opacity-60">{loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}{isLogin ? 'Ingresar' : 'Registrarse'}</button>
        </form>
        <button type="button" onClick={() => { setIsLogin(!isLogin); setError(null); }} className="mt-4 w-full text-center text-xs text-neutral-400 hover:text-amber-400">{isLogin ? 'Crear una cuenta' : 'Ya tengo una cuenta'}</button>
      </div>
    </div>
  );
};
