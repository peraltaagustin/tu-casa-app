'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Building2, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Correo o contraseña incorrectos.');
      setLoading(false);
    } else if (data.session) {
      router.push('/admin'); // Si es correcto, lo enviamos al panel
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-green-100 p-3 rounded-full mb-4">
            <Building2 size={32} className="text-green-700" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Acceso Administrativo</h1>
          <p className="text-sm text-slate-500 mt-2">Ingresa tus credenciales para continuar</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6 text-center border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-green-700 text-white font-bold py-3 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-70"
          >
            {loading ? 'Verificando...' : <><Lock size={18} /> Iniciar Sesión</>}
          </button>
        </form>
      </div>
    </div>
  );
}