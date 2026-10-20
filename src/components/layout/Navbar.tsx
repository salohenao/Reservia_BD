'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  CalendarDays,
  Menu,
  X,
  LogOut,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12 h-20">
        {/* Brand Logo - Exact Figma Design */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#025a4e] text-white shadow-sm transition-transform group-hover:scale-105">
            <CalendarDays className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            Reservia
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[13.5px] font-medium text-slate-700">
          {isAuthenticated && user?.role === 'CLIENT' ? (
            <React.Suspense
              fallback={
                <>
                  <Link href="/services" className="hover:text-[#025a4e] transition-colors">
                    Explorar
                  </Link>
                  <Link href="/dashboard/client?tab=citas" className="hover:text-[#025a4e] transition-colors font-semibold text-[#025a4e]">
                    Mis citas
                  </Link>
                  <Link href="/dashboard/client?tab=historial" className="hover:text-[#025a4e] transition-colors">
                    Historial
                  </Link>
                  <Link href="/dashboard/client?tab=perfil" className="hover:text-[#025a4e] transition-colors">
                    Mi perfil
                  </Link>
                </>
              }
            >
              <ClientNavLinks />
            </React.Suspense>
          ) : isAuthenticated && user?.role === 'PROVIDER' ? (
            <React.Suspense
              fallback={
                <>
                  <Link href="/dashboard/provider?tab=agenda" className="hover:text-[#025a4e] transition-colors font-semibold text-[#025a4e]">
                    Agenda
                  </Link>
                  <Link href="/dashboard/provider?tab=servicios" className="hover:text-[#025a4e] transition-colors">
                    Servicios
                  </Link>
                  <Link href="/dashboard/provider?tab=horarios" className="hover:text-[#025a4e] transition-colors">
                    Horarios
                  </Link>
                  <Link href="/dashboard/provider?tab=reportes" className="hover:text-[#025a4e] transition-colors">
                    Reportes
                  </Link>
                  <Link href="/dashboard/provider?tab=perfil" className="hover:text-[#025a4e] transition-colors">
                    Mi perfil
                  </Link>
                </>
              }
            >
              <ProviderNavLinks />
            </React.Suspense>
          ) : (
            <>
              <Link href="/services" className="hover:text-[#025a4e] transition-colors">
                Explorar servicios
              </Link>
              <Link href="/#para-negocios" className="hover:text-[#025a4e] transition-colors">
                Para negocios
              </Link>
            </>
          )}
        </nav>

        {/* Right side Auth actions */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                {user.role === 'PROVIDER' ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#025a4e] text-white font-bold text-xs flex-shrink-0">
                    {user.businessName
                      ? user.businessName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'CD'}
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f7f2] text-[#025a4e] font-bold text-xs flex-shrink-0">
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() || 'AG'}
                  </div>
                )}
                <div className="flex flex-col text-left max-w-[140px]">
                  <span className="text-xs font-bold text-slate-800 leading-tight truncate">
                    {user.role === 'PROVIDER' ? (user.businessName || user.name) : user.name.split(' ')[0]}
                  </span>
                  <span className={`text-[10px] font-medium leading-tight ${user.role === 'PROVIDER' ? 'text-[#025a4e] font-semibold' : 'text-slate-400'}`}>
                    {user.role === 'PROVIDER' ? 'Proveedor' : 'Cliente'}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                title="Cerrar sesión"
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors ml-2 py-1 px-1.5 rounded"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Salir</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link
                href="/login"
                className="text-[13.5px] font-medium text-slate-800 hover:text-[#025a4e] transition-colors"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/register/client"
                className="inline-flex items-center justify-center rounded-lg bg-[#025a4e] px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-sm hover:bg-[#03483e] active:scale-[0.98] transition-all"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus:outline-none"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-3">
          <nav className="flex flex-col space-y-1 text-sm font-medium text-slate-700">
            {isAuthenticated && user?.role === 'CLIENT' ? (
              <React.Suspense
                fallback={
                  <>
                    <Link
                      href="/services"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg hover:bg-slate-50"
                    >
                      Explorar
                    </Link>
                    <Link
                      href="/dashboard/client?tab=citas"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg bg-teal-50 text-[#025a4e] font-semibold"
                    >
                      Mis citas
                    </Link>
                    <Link
                      href="/dashboard/client?tab=historial"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg hover:bg-slate-50"
                    >
                      Historial
                    </Link>
                    <Link
                      href="/dashboard/client?tab=perfil"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg hover:bg-slate-50"
                    >
                      Mi perfil
                    </Link>
                  </>
                }
              >
                <ClientMobileNavLinks onClose={() => setMobileMenuOpen(false)} />
              </React.Suspense>
            ) : isAuthenticated && user?.role === 'PROVIDER' ? (
              <React.Suspense
                fallback={
                  <>
                    <Link
                      href="/dashboard/provider?tab=agenda"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg bg-teal-50 text-[#025a4e] font-semibold"
                    >
                      Agenda
                    </Link>
                    <Link
                      href="/dashboard/provider?tab=servicios"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg hover:bg-slate-50"
                    >
                      Servicios
                    </Link>
                    <Link
                      href="/dashboard/provider?tab=horarios"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg hover:bg-slate-50"
                    >
                      Horarios
                    </Link>
                    <Link
                      href="/dashboard/provider?tab=reportes"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg hover:bg-slate-50"
                    >
                      Reportes
                    </Link>
                    <Link
                      href="/dashboard/provider?tab=perfil"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg hover:bg-slate-50"
                    >
                      Mi perfil
                    </Link>
                  </>
                }
              >
                <ProviderMobileNavLinks onClose={() => setMobileMenuOpen(false)} />
              </React.Suspense>
            ) : (
              <>
                <Link
                  href="/services"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-slate-50"
                >
                  Explorar servicios
                </Link>
                <Link
                  href="/#para-negocios"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-slate-50"
                >
                  Para negocios
                </Link>
              </>
            )}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-[#e8f7f2] text-[#025a4e] flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {user.role === 'PROVIDER' ? 'Proveedor' : 'Cliente'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-800"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register/client"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-lg bg-[#025a4e] py-2 text-sm font-semibold text-white"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function ClientNavLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'citas';
  const isDashboard = pathname === '/dashboard/client';

  return (
    <>
      <Link
        href="/services"
        className={`hover:text-[#025a4e] transition-colors ${
          pathname === '/services' ? 'font-semibold text-[#025a4e]' : ''
        }`}
      >
        Explorar
      </Link>
      <Link
        href="/dashboard/client?tab=citas"
        className={`hover:text-[#025a4e] transition-colors ${
          isDashboard && currentTab === 'citas' ? 'font-semibold text-[#025a4e]' : ''
        }`}
      >
        Mis citas
      </Link>
      <Link
        href="/dashboard/client?tab=historial"
        className={`hover:text-[#025a4e] transition-colors ${
          isDashboard && currentTab === 'historial' ? 'font-semibold text-[#025a4e]' : ''
        }`}
      >
        Historial
      </Link>
      <Link
        href="/dashboard/client?tab=perfil"
        className={`hover:text-[#025a4e] transition-colors ${
          isDashboard && currentTab === 'perfil' ? 'font-semibold text-[#025a4e]' : ''
        }`}
      >
        Mi perfil
      </Link>
    </>
  );
}

function ClientMobileNavLinks({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'citas';
  const isDashboard = pathname === '/dashboard/client';

  return (
    <>
      <Link
        href="/services"
        onClick={onClose}
        className={`px-3 py-2 rounded-lg hover:bg-slate-50 ${
          pathname === '/services' ? 'bg-teal-50 text-[#025a4e] font-semibold' : ''
        }`}
      >
        Explorar
      </Link>
      <Link
        href="/dashboard/client?tab=citas"
        onClick={onClose}
        className={`px-3 py-2 rounded-lg hover:bg-slate-50 ${
          isDashboard && currentTab === 'citas' ? 'bg-teal-50 text-[#025a4e] font-semibold' : ''
        }`}
      >
        Mis citas
      </Link>
      <Link
        href="/dashboard/client?tab=historial"
        onClick={onClose}
        className={`px-3 py-2 rounded-lg hover:bg-slate-50 ${
          isDashboard && currentTab === 'historial' ? 'bg-teal-50 text-[#025a4e] font-semibold' : ''
        }`}
      >
        Historial
      </Link>
      <Link
        href="/dashboard/client?tab=perfil"
        onClick={onClose}
        className={`px-3 py-2 rounded-lg hover:bg-slate-50 ${
          isDashboard && currentTab === 'perfil' ? 'bg-teal-50 text-[#025a4e] font-semibold' : ''
        }`}
      >
        Mi perfil
      </Link>
    </>
  );
}

function ProviderNavLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'agenda';
  const isDashboard = pathname === '/dashboard/provider';

  return (
    <>
      <Link
        href="/dashboard/provider?tab=agenda"
        className={`hover:text-[#025a4e] transition-colors ${
          isDashboard && currentTab === 'agenda' ? 'font-semibold text-[#025a4e]' : ''
        }`}
      >
        Agenda
      </Link>
      <Link
        href="/dashboard/provider?tab=servicios"
        className={`hover:text-[#025a4e] transition-colors ${
          isDashboard && currentTab === 'servicios' ? 'font-semibold text-[#025a4e]' : ''
        }`}
      >
        Servicios
      </Link>
      <Link
        href="/dashboard/provider?tab=horarios"
        className={`hover:text-[#025a4e] transition-colors ${
          isDashboard && currentTab === 'horarios' ? 'font-semibold text-[#025a4e]' : ''
        }`}
      >
        Horarios
      </Link>
      <Link
        href="/dashboard/provider?tab=reportes"
        className={`hover:text-[#025a4e] transition-colors ${
          isDashboard && currentTab === 'reportes' ? 'font-semibold text-[#025a4e]' : ''
        }`}
      >
        Reportes
      </Link>
      <Link
        href="/dashboard/provider?tab=perfil"
        className={`hover:text-[#025a4e] transition-colors ${
          isDashboard && currentTab === 'perfil' ? 'font-semibold text-[#025a4e]' : ''
        }`}
      >
        Mi perfil
      </Link>
    </>
  );
}

function ProviderMobileNavLinks({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'agenda';
  const isDashboard = pathname === '/dashboard/provider';

  return (
    <>
      <Link
        href="/dashboard/provider?tab=agenda"
        onClick={onClose}
        className={`px-3 py-2 rounded-lg hover:bg-slate-50 ${
          isDashboard && currentTab === 'agenda' ? 'bg-teal-50 text-[#025a4e] font-semibold' : ''
        }`}
      >
        Agenda
      </Link>
      <Link
        href="/dashboard/provider?tab=servicios"
        onClick={onClose}
        className={`px-3 py-2 rounded-lg hover:bg-slate-50 ${
          isDashboard && currentTab === 'servicios' ? 'bg-teal-50 text-[#025a4e] font-semibold' : ''
        }`}
      >
        Servicios
      </Link>
      <Link
        href="/dashboard/provider?tab=horarios"
        onClick={onClose}
        className={`px-3 py-2 rounded-lg hover:bg-slate-50 ${
          isDashboard && currentTab === 'horarios' ? 'bg-teal-50 text-[#025a4e] font-semibold' : ''
        }`}
      >
        Horarios
      </Link>
      <Link
        href="/dashboard/provider?tab=reportes"
        onClick={onClose}
        className={`px-3 py-2 rounded-lg hover:bg-slate-50 ${
          isDashboard && currentTab === 'reportes' ? 'bg-teal-50 text-[#025a4e] font-semibold' : ''
        }`}
      >
        Reportes
      </Link>
      <Link
        href="/dashboard/provider?tab=perfil"
        onClick={onClose}
        className={`px-3 py-2 rounded-lg hover:bg-slate-50 ${
          isDashboard && currentTab === 'perfil' ? 'bg-teal-50 text-[#025a4e] font-semibold' : ''
        }`}
      >
        Mi perfil
      </Link>
    </>
  );
}
