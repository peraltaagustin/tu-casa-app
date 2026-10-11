export interface Property {
  id: string;
  title: string;
  description: string | null;
  location: string; // <-- Nuevo campo agregado
  price: number;
  operation_type: 'venta' | 'alquiler';
  property_type: 'casa' | 'departamento' | 'terreno' | 'local'; // <-- 'local' agregado
  images: string[];
  bedrooms: number;
  bathrooms: number;
  square_meters: number | null;
  status: 'disponible' | 'reservado' | 'vendido';
  is_promoted: boolean;
  created_at: string;
  updated_at: string;
}