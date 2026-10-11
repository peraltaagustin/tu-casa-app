'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Property } from '@/types/database';
import { ArrowLeft, Bed, Bath, Maximize, Home, ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';

// Sub-componente para manejar el estado individual de fotos de cada tarjeta en el comparador
function ComparatorCard({ property }: { property: Property }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.price);
  
  const images = property.images && property.images.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="w-[300px] md:w-[350px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col shrink-0">
        
        {/* Contenedor de Imagen con Carrusel */}
        <div 
          className="h-56 w-full relative group cursor-pointer bg-slate-100"
          onClick={() => setIsLightboxOpen(true)}
          title="Ver imagen ampliada"
        >
          <img src={images[currentImageIndex]} alt={property.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-10 pointer-events-none">
            <div className="bg-white/80 p-2 rounded-full text-slate-800 backdrop-blur-sm shadow-lg">
              <ZoomIn size={24} />
            </div>
          </div>

          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/70 transition z-20">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/70 transition z-20">
                <ChevronRight size={20} />
              </button>
              <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded z-20">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}

          <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 text-xs font-bold uppercase rounded z-10">
            {property.operation_type}
          </div>
        </div>
        
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-2xl font-black text-slate-800 mb-1">{formattedPrice}</h3>
          <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-4 line-clamp-1">{property.title}</h4>
          
          <div className="space-y-4 text-sm text-slate-600 mt-auto">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="flex items-center gap-2 text-slate-400"><Home size={16}/> Tipo</span>
              <span className="font-semibold capitalize">{property.property_type}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="flex items-center gap-2 text-slate-400"><Maximize size={16}/> Sup. Total</span>
              <span className="font-semibold">{property.square_meters} m²</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="flex items-center gap-2 text-slate-400"><Bed size={16}/> Dormitorios</span>
              <span className="font-semibold">{property.bedrooms}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="flex items-center gap-2 text-slate-400"><Bath size={16}/> Baños</span>
              <span className="font-semibold">{property.bathrooms}</span>
            </div>
          </div>
        </div>
      </div>

      {/* VISOR GIGANTE (Lightbox) EN EL COMPARADOR */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm p-4">
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 p-2 rounded-full transition-colors z-50"
          >
            <X size={32} />
          </button>
          
          <img src={images[currentImageIndex]} alt={property.title} className="max-w-full max-h-[90vh] object-contain select-none" />

          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 text-white rounded-full p-3 hover:bg-white/20 transition z-50">
                <ChevronLeft size={32} />
              </button>
              <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 text-white rounded-full p-3 hover:bg-white/20 transition z-50">
                <ChevronRight size={32} />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm font-bold px-4 py-2 rounded-full z-50">
                {currentImageIndex + 1} de {images.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

// Componente principal del comparador
function ComparadorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idsParam = searchParams.get('ids');
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      if (!idsParam) {
        setLoading(false);
        return;
      }
      const ids = idsParam.split(',');
      const { data, error } = await supabase.from('properties').select('*').in('id', ids);
      if (data) setProperties(data);
      setLoading(false);
    }
    fetchProperties();
  }, [idsParam]);

  if (loading) return <div className="min-h-screen flex justify-center items-center">Cargando propiedades...</div>;

  if (properties.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">No se encontraron propiedades</h2>
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-blue-600 hover:underline">
          <ArrowLeft size={20} /> Volver al catálogo
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 transition-colors">
          <ArrowLeft size={20} /> Volver al catálogo
        </button>

        <h1 className="text-3xl font-light text-slate-800 uppercase tracking-widest mb-2">Comparador de Propiedades</h1>
        <div className="w-16 h-1 bg-green-700 mb-10"></div>

        <div className="overflow-x-auto pb-8">
          <div className="flex gap-6 min-w-max">
            {properties.map((property) => (
              <ComparatorCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ComparadorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center">Cargando módulo...</div>}>
      <ComparadorContent />
    </Suspense>
  );
}