'use client';

import { useState } from 'react';
import { Check, Bed, Bath, Maximize, MapPin, Home, ChevronLeft, ChevronRight, X, ZoomIn, MessageCircle } from 'lucide-react';
import type { Property } from '@/types/database';
import { siteConfig } from '@/lib/config';

interface PropertyCardProps {
  property: Property;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

export function PropertyCard({ property, isSelected, onToggleSelect }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(property.price);

  const images = property.images && property.images.length > 0 ? property.images : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'];

  const nextImage = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % images.length); };
  const prevImage = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length); };

  return (
    <>
      <div className={`relative group bg-white rounded-md overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full border ${isSelected ? 'border-green-600 ring-2 ring-green-600/30' : 'border-gray-200'}`}>
        
        {property.status === 'vendido' && (
          <div className="absolute inset-0 bg-white/50 z-30 flex items-center justify-center backdrop-blur-[2px]">
            <div className="bg-green-600 text-white font-black text-3xl px-8 py-3 rounded-lg -rotate-12 shadow-2xl border-4 border-white">VENDIDA</div>
          </div>
        )}

        {property.status !== 'vendido' && (
          <button onClick={() => onToggleSelect(property.id)} className={`absolute top-3 right-3 z-20 w-8 h-8 rounded flex items-center justify-center transition-all border-2 ${isSelected ? 'bg-green-600 border-green-600 text-white' : 'bg-white/80 border-gray-300 text-transparent hover:bg-white hover:border-gray-400'}`} title={isSelected ? "Quitar selección" : "Seleccionar"}>
            <Check size={16} strokeWidth={4} />
          </button>
        )}

        <div className="relative h-56 w-full bg-gray-200 overflow-hidden cursor-pointer" onClick={() => setIsLightboxOpen(true)}>
          <img src={images[currentImageIndex]} alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-10 pointer-events-none">
            <div className="bg-white/80 p-2 rounded-full text-slate-800 backdrop-blur-sm shadow-lg"><ZoomIn size={24} /></div>
          </div>
          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/70 transition z-20"><ChevronLeft size={20} /></button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/70 transition z-20"><ChevronRight size={20} /></button>
              <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded z-20">{currentImageIndex + 1} / {images.length}</div>
            </>
          )}
          <div className="absolute top-3 right-14 bg-orange-500 text-white px-3 py-1 text-xs font-bold uppercase rounded shadow z-10">{property.operation_type}</div>
          <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-4 py-1.5 text-lg font-black rounded shadow-lg z-10">{formattedPrice}</div>
        </div>

        <div className="p-5 flex-1 flex flex-col relative z-10">
          <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide line-clamp-1">{property.title}</h3>
          
          <div className="flex items-start gap-1.5 text-xs text-gray-500 mb-4 h-10 overflow-hidden">
            <MapPin size={14} className="text-orange-500 shrink-0 mt-0.5" />
            <p className="line-clamp-2" title={property.location}>{property.location || "Ubicación a consultar"}</p>
          </div>
          
          <div className="mt-auto">
            <hr className="border-gray-100 my-3" />
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs font-medium text-gray-600 mb-4">
              <div className="flex items-center gap-1.5"><Home size={16} className="text-orange-500" /><span className="capitalize">{property.property_type}</span></div>
              <div className="flex items-center gap-1.5"><Maximize size={16} className="text-orange-500" /><span>{property.square_meters} m²</span></div>
              <div className="flex items-center gap-1.5"><Bed size={16} className="text-orange-500" /><span>{property.bedrooms} Dor.</span></div>
              <div className="flex items-center gap-1.5"><Bath size={16} className="text-orange-500" /><span>{property.bathrooms} Baños</span></div>
            </div>

            {/* NUEVO BOTÓN: Consultar directo al vendedor */}
            <a 
              href={`https://wa.me/${siteConfig.agent.phone}?text=${encodeURIComponent(`¡Hola ${siteConfig.agent.name}! Me interesa saber más sobre esta propiedad: "${property.title}" por ${formattedPrice}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-slate-50 hover:bg-green-50 text-slate-700 hover:text-green-700 font-bold text-sm py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors border border-slate-200 hover:border-green-300"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle size={16} className="text-[#25D366]" /> Consultar Propiedad
            </a>
          </div>
        </div>
      </div>

      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm p-4">
          <button onClick={() => setIsLightboxOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 p-2 rounded-full transition-colors z-50"><X size={32} /></button>
          <img src={images[currentImageIndex]} alt={property.title} className="max-w-full max-h-[90vh] object-contain select-none" />
          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 text-white rounded-full p-3 hover:bg-white/20 transition z-50"><ChevronLeft size={32} /></button>
              <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 text-white rounded-full p-3 hover:bg-white/20 transition z-50"><ChevronRight size={32} /></button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm font-bold px-4 py-2 rounded-full z-50">{currentImageIndex + 1} de {images.length}</div>
            </>
          )}
        </div>
      )}
    </>
  );
}