'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Property } from '@/types/database';
import { FilterBar, type FilterState } from '@/components/properties/FilterBar';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { MessageCircle, Search, Share2 } from 'lucide-react';
import { siteConfig } from '@/lib/config';

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [promotedProperties, setPromotedProperties] = useState<Property[]>([]);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  useEffect(() => {
    async function fetchProperties() {
      const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
      if (data) {
        setProperties(data); setFilteredProperties(data); setPromotedProperties(data.filter(p => p.is_promoted)); 
      }
      setLoading(false);
    }
    fetchProperties();
  }, []);

  useEffect(() => {
    if (promotedProperties.length <= 1) return;
    const timer = setInterval(() => setCurrentPromoIndex(prev => (prev + 1) % promotedProperties.length), 4000);
    return () => clearInterval(timer);
  }, [promotedProperties.length]);

  const handleFilter = (filters: FilterState) => {
    let result = properties;
    if (filters.operation_type !== 'todas') result = result.filter(p => p.operation_type === filters.operation_type);
    if (filters.property_type !== 'todas') result = result.filter(p => p.property_type === filters.property_type);
    if (filters.minPrice !== '') result = result.filter(p => p.price >= Number(filters.minPrice));
    if (filters.maxPrice !== '') result = result.filter(p => p.price <= Number(filters.maxPrice));
    setFilteredProperties(result);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // Función para compartir (Abre WhatsApp en blanco para mandarle a un familiar)
  const handleShareGeneral = () => {
    const shareUrl = `${siteConfig.url}/comparador?ids=${selectedIds.join(',')}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(`¡Mira estas propiedades interesantes!\n\n${shareUrl}`)}`, '_blank');
  };

  // Función para consultar (Te envía el mensaje directamente a TI como vendedor)
  const handleConsultarVendedor = () => {
    const shareUrl = `${siteConfig.url}/comparador?ids=${selectedIds.join(',')}`;
    window.open(`https://wa.me/${siteConfig.agent.phone}?text=${encodeURIComponent(`¡Hola ${siteConfig.agent.name}! Me interesan estas propiedades que seleccioné en el catálogo:\n\n${shareUrl}`)}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20 relative">
      
      {/* BOTÓN FLOTANTE GENERAL DE CHAT (Para conversar en general) */}
      <a
        href={`https://wa.me/${siteConfig.agent.phone}?text=${encodeURIComponent(`¡Hola ${siteConfig.agent.name}! Estoy en tu web y me gustaría hacer una consulta general.`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center ${selectedIds.length > 0 ? 'bottom-28' : 'bottom-6'}`}
        title="Chatear con nosotros"
      >
        <MessageCircle size={32} />
      </a>

      {/* HERO & BUSCADOR */}
      <section className="relative h-[400px] md:h-[500px] flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }}>
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="relative z-10 w-full max-w-[1550px] px-6 mt-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8 drop-shadow-lg">Encuentra tu lugar ideal</h1>
          <FilterBar onFilter={handleFilter} />
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL DIVIDIDO */}
      <section className="max-w-[1550px] mx-auto px-6 mt-12">
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-24">
          
          {/* PANEL IZQUIERDO */}
          <div className="w-full lg:w-[320px] xl:w-[380px] shrink-0">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest border-b-2 border-green-600 pb-2 mb-6">Destacados</h3>
            {promotedProperties.length > 0 ? (
              <div className="sticky top-24">
                <PropertyCard property={promotedProperties[currentPromoIndex]} isSelected={selectedIds.includes(promotedProperties[currentPromoIndex].id)} onToggleSelect={toggleSelect} />
                <div className="flex justify-center gap-1.5 mt-4">
                  {promotedProperties.map((_, idx) => (
                    <div key={idx} className={`h-2 rounded-full transition-all duration-500 ${idx === currentPromoIndex ? 'w-8 bg-green-600' : 'w-2 bg-gray-300'}`} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-md border border-dashed border-gray-300 text-center text-sm text-gray-500">Aún no hay propiedades destacadas.</div>
            )}
          </div>

          {/* PANEL DERECHO */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest border-b-2 border-slate-200 pb-2 mb-6">Catálogo Completo</h2>
            {loading ? (
              <div className="text-center py-20 text-gray-500">Cargando propiedades...</div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-md border border-gray-200">
                <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No hay resultados</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 text-left">
                {filteredProperties.map(property => (
                  <PropertyCard key={property.id} property={property} isSelected={selectedIds.includes(property.id)} onToggleSelect={toggleSelect} />
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* PANEL FLOTANTE DE SELECCIÓN ACTUALIZADO */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)] p-4 z-50 animate-in slide-in-from-bottom-10">
          <div className="max-w-[1550px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center bg-green-600 text-white font-bold h-8 w-8 rounded-full">{selectedIds.length}</span>
              <span className="font-semibold text-gray-800">Propiedades listas para comparar</span>
            </div>
            
            <div className="flex flex-wrap w-full sm:w-auto gap-3">
              <button onClick={() => setSelectedIds([])} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Limpiar</button>
              
              {/* Opción 1: Compartir con amigos/familia */}
              <button onClick={handleShareGeneral} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-md font-bold transition-colors shadow-sm">
                <Share2 size={18} /> Compartir
              </button>

              {/* Opción 2: Consultarle al Vendedor (Tu número) */}
              <button onClick={handleConsultarVendedor} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-2.5 rounded-md font-bold transition-colors shadow-sm">
                <MessageCircle size={20} /> Consultar al Vendedor
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}