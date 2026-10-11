'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import type { Property } from '@/types/database';
import { UploadCloud, X, Trash2, Star, Tag, RefreshCw } from 'lucide-react';

export default function AdminPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const { register, handleSubmit, reset } = useForm<Partial<Property>>();
  
  // --- INICIO CÓDIGO DE SEGURIDAD ---
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setIsAuth(true);
      }
    };
    checkUser();
  }, [router]);
  // --- FIN CÓDIGO DE SEGURIDAD ---

  // 1. Cargar las propiedades existentes
  const fetchMyProperties = async () => {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setMyProperties(data);
  };

  useEffect(() => {
    if (isAuth) {
        fetchMyProperties();
    }
  }, [isAuth]);

  // 2. Funciones para manejar la selección de imágenes del formulario
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // 3. Crear Nueva Propiedad
  const onSubmit = async (data: Partial<Property>) => {
    setIsUploading(true);
    try {
      const imageUrls: string[] = [];

      for (const file of selectedImages) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('property-images').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('property-images').getPublicUrl(fileName);
        imageUrls.push(publicUrlData.publicUrl);
      }

      const { error: dbError } = await supabase.from('properties').insert([{
        title: data.title,
        description: data.description,
        location: data.location,
        price: Number(data.price),
        operation_type: data.operation_type,
        property_type: data.property_type,
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        square_meters: Number(data.square_meters),
        images: imageUrls,
        status: 'disponible',
        is_promoted: false
      }]);

      if (dbError) throw dbError;
      
      alert('¡Propiedad publicada!');
      reset();
      setSelectedImages([]);
      fetchMyProperties(); 
      
    } catch (error) {
      console.error(error);
      alert('Error al guardar.');
    } finally {
      setIsUploading(false);
    }
  };

  // 4. ACCIONES DE ADMINISTRACIÓN
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres borrar esta propiedad para siempre?')) return;
    await supabase.from('properties').delete().eq('id', id);
    fetchMyProperties();
  };

  const togglePromoted = async (id: string, currentPromoted: boolean) => {
    await supabase.from('properties').update({ is_promoted: !currentPromoted }).eq('id', id);
    fetchMyProperties();
  };

  const toggleSoldStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'vendido' ? 'disponible' : 'vendido';
    await supabase.from('properties').update({ status: newStatus }).eq('id', id);
    fetchMyProperties();
  };

  // Pantalla de carga mientras verifica la seguridad
  if (!isAuth) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Verificando seguridad...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 font-sans flex flex-col lg:flex-row gap-8 items-start">
      
      {/* COLUMNA IZQUIERDA: Formulario de Carga */}
      <div className="w-full lg:w-1/2">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">Publicar Nueva Propiedad</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                <UploadCloud className="w-6 h-6 mb-2" />
                <p className="text-sm font-semibold">Clic para subir fotos</p>
              </div>
              <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageSelect} />
            </label>
            {selectedImages.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedImages.map((file, index) => (
                  <div key={index} className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md text-xs border border-slate-200">
                    <span className="truncate max-w-[80px]">{file.name}</span>
                    <button type="button" onClick={() => removeImage(index)} className="text-red-500"><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">TÍTULO</label>
              <input {...register('title', { required: true })} className="w-full p-2 bg-slate-50 border rounded-md" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">PRECIO (USD)</label>
              <input type="number" {...register('price', { required: true })} className="w-full p-2 bg-slate-50 border rounded-md" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">UBICACIÓN EXACTA</label>
            <input {...register('location', { required: true })} className="w-full p-2 bg-slate-50 border rounded-md" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">OPERACIÓN</label>
              <select {...register('operation_type')} className="w-full p-2 bg-slate-50 border rounded-md">
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">TIPO</label>
              <select {...register('property_type')} className="w-full p-2 bg-slate-50 border rounded-md">
                <option value="casa">Casa</option>
                <option value="departamento">Departamento</option>
                <option value="terreno">Terreno</option>
                <option value="local">Local</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">DORMITORIOS</label>
              <input type="number" {...register('bedrooms')} className="w-full p-2 bg-slate-50 border rounded-md" defaultValue={0} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">BAÑOS</label>
              <input type="number" {...register('bathrooms')} className="w-full p-2 bg-slate-50 border rounded-md" defaultValue={0} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">M²</label>
              <input type="number" {...register('square_meters')} className="w-full p-2 bg-slate-50 border rounded-md" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">DESCRIPCIÓN</label>
            <textarea {...register('description')} rows={3} className="w-full p-2 bg-slate-50 border rounded-md resize-none" />
          </div>

          <button type="submit" disabled={isUploading} className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 disabled:opacity-50">
            {isUploading ? 'Subiendo...' : 'Publicar Propiedad'}
          </button>
        </form>
      </div>

      {/* COLUMNA DERECHA: Lista para Gestionar */}
      <div className="w-full lg:w-1/2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Mis Propiedades</h2>
          <button onClick={fetchMyProperties} className="text-slate-500 hover:text-blue-600 flex items-center gap-1 text-sm">
            <RefreshCw size={16} /> Actualizar
          </button>
        </div>

        <div className="space-y-4">
          {myProperties.map((prop) => (
            <div key={prop.id} className={`bg-white p-4 rounded-xl border flex gap-4 items-center shadow-sm transition-all ${prop.status === 'vendido' ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
              
              <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                <img src={prop.images[0] || 'https://via.placeholder.com/150'} alt={prop.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-sm text-slate-800 line-clamp-1">{prop.title}</h3>
                <p className="text-xs text-slate-500 mb-2">${prop.price} • {prop.operation_type}</p>
                
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => togglePromoted(prop.id, prop.is_promoted)}
                    className={`flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-md transition-colors ${prop.is_promoted ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    <Star size={14} className={prop.is_promoted ? "fill-current" : ""} />
                    {prop.is_promoted ? 'Destacada' : 'Destacar'}
                  </button>

                  <button 
                    onClick={() => toggleSoldStatus(prop.id, prop.status)}
                    className={`flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-md transition-colors ${prop.status === 'vendido' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    <Tag size={14} />
                    {prop.status === 'vendido' ? 'VENDIDA' : 'Marcar Vendida'}
                  </button>
                </div>
              </div>

              <button 
                onClick={() => handleDelete(prop.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Borrar propiedad"
              >
                <Trash2 size={20} />
              </button>

            </div>
          ))}

          {myProperties.length === 0 && (
            <p className="text-center text-slate-500 py-10 border-2 border-dashed rounded-xl">No tienes propiedades publicadas.</p>
          )}
        </div>
      </div>

    </div>
  );
}