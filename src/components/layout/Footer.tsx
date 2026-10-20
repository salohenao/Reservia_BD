import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#141210] text-slate-400 py-12 px-6 sm:px-8 lg:px-12 border-t border-neutral-900">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-xs sm:text-sm">
        
        {/* Brand */}
        <div className="text-center md:text-left">
          <span className="text-lg font-bold text-white tracking-tight font-serif">
            Reservia
          </span>
          <p className="text-xs text-slate-500 mt-0.5">
            Plataforma de Reservas de Servicios
          </p>
        </div>

        {/* Center Links */}
        <div className="flex items-center gap-8 text-xs text-slate-400">
          <a href="#terminos" className="hover:text-white transition-colors">
            Términos
          </a>
          <a href="#privacidad" className="hover:text-white transition-colors">
            Privacidad
          </a>
          <a href="mailto:soporte@reservia.co" className="hover:text-white transition-colors">
            Contacto
          </a>
        </div>

        {/* Right Copyright */}
        <div className="text-xs text-slate-500 text-center md:text-right">
          © 2026 Reservia. Todos los derechos reservados.
        </div>

      </div>
    </footer>
  );
}
