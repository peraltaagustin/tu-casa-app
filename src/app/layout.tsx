import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { Building2, Settings } from "lucide-react";

// Configuración de la fuente
const inter = Inter({ subsets: ["latin"] });

// Meta etiquetas para SEO
export const metadata: Metadata = {
  title: `${siteConfig.name} - Encuentra tu lugar ideal`,
  description: "La mejor plataforma para comprar, vender y alquilar propiedades.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}>
        
        {/* HEADER / BARRA DE NAVEGACIÓN */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo y Nombre */}
            <Link href="/" className="flex items-center gap-2 text-slate-800 hover:text-green-700 transition-colors">
              <Building2 size={28} className="text-green-700" />
              <span className="font-black text-xl tracking-tight uppercase">{siteConfig.name}</span>
            </Link>

            {/* Menú de Navegación */}
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="text-slate-600 hover:text-green-700 transition-colors">
                Catálogo
              </Link>
              {/* Botón hacia el Panel de Administración */}
              <Link 
                href="/admin" 
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md transition-colors"
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Administrar</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* CONTENIDO DE LA PÁGINA */}
        <div className="flex-1">
          {children}
        </div>

        {/* FOOTER */}
        <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.</p>
            <p className="mt-2 text-slate-500">Desarrollado con Next.js y Supabase.</p>
          </div>
        </footer>

      </body>
    </html>
  );
}