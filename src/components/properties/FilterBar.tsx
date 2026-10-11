'use client';

import { useState } from 'react';

export interface FilterState {
  operation_type: string;
  property_type: string;
  minPrice: number | '';
  maxPrice: number | '';
}

export function FilterBar({ onFilter }: { onFilter: (filters: FilterState) => void }) {
  const [filters, setFilters] = useState<FilterState>({
    operation_type: 'todas',
    property_type: 'todas',
    minPrice: '',
    maxPrice: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
      <div className="flex flex-col gap-2 flex-1 min-w-[150px]">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Operación</label>
        <select name="operation_type" onChange={handleChange} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
          <option value="todas">Todas</option>
          <option value="venta">En Venta</option>
          <option value="alquiler">En Alquiler</option>
        </select>
      </div>

      <div className="flex flex-col gap-2 flex-1 min-w-[150px]">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</label>
        <select name="property_type" onChange={handleChange} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
          <option value="todas">Todos</option>
          <option value="casa">Casa</option>
          <option value="departamento">Departamento</option>
          <option value="terreno">Terreno / Lote</option>
          <option value="local">Local / Comercio</option>
        </select>
      </div>

      <div className="flex flex-col gap-2 flex-1 min-w-[120px]">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Precio Min</label>
        <input type="number" name="minPrice" placeholder="0" onChange={handleChange} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>

      <div className="flex flex-col gap-2 flex-1 min-w-[120px]">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Precio Max</label>
        <input type="number" name="maxPrice" placeholder="Sin límite" onChange={handleChange} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
    </div>
  );
}