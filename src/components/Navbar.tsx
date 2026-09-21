'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu, X, Search, CalendarPlus, Ticket, User,
  LogOut, Sparkles, FolderHeart, ChevronDown
} from 'lucide-react';
import LoginModal from './LoginModal';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated) {
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUser();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    setMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-obsidian-950/95 backdrop-blur-md border-b border-obsidian-700/60 shadow-xl'
          : 'bg-gradient-to-b from-obsidian-950/90 via-obsidian-950/50 to-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Menú hamburguesa (izquierda según requerimiento) */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2.5 rounded-lg bg-obsidian-850/80 hover:bg-obsidian-700 text-amber-500 border border-obsidian-700/80 transition-all flex items-center gap-2 group"
              title="Menú de opciones"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
              <span className="text-xs uppercase tracking-wider text-gray-300 group-hover:text-amber-400 font-semibold hidden md:inline">
                Menú
              </span>
            </button>

            {/* Logo oficial LRC */}
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-amber-500/40 shadow-amber-glow">
                <Image
                  src="/IMG_logo-LRC.png"
                  alt="La Red Cultural"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <span className="font-extrabold text-lg sm:text-xl tracking-wider text-white hidden sm:inline-block">
                LA RED <span className="text-amber-500 font-black">CULTURAL</span>
              </span>
            </Link>
          </div>

          {/* Enlaces directos para desktop */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300">
            <Link
              href="/explorar"
              className={`hover:text-amber-400 transition-colors flex items-center gap-1.5 ${pathname === '/explorar' ? 'text-amber-500 font-semibold' : ''
                }`}
            >
              <Search size={16} /> Explorar Cartelera
            </Link>
            {currentUser && (
              <>
                <Link
                  href="/crear-evento"
                  className={`hover:text-amber-400 transition-colors flex items-center gap-1.5 ${pathname === '/crear-evento' ? 'text-amber-500 font-semibold' : ''
                    }`}
                >
                  <CalendarPlus size={16} /> Crear Evento
                </Link>
                <Link
                  href="/mis-asistencias"
                  className={`hover:text-amber-400 transition-colors flex items-center gap-1.5 ${pathname === '/mis-asistencias' ? 'text-amber-500 font-semibold' : ''
                    }`}
                >
                  <Ticket size={16} /> Mis Asistencias
                </Link>
                <Link
                  href="/mis-eventos"
                  className={`hover:text-amber-400 transition-colors flex items-center gap-1.5 ${pathname === '/mis-eventos' ? 'text-amber-500 font-semibold' : ''
                    }`}
                >
                  <FolderHeart size={16} /> Mis Eventos
                </Link>
              </>
            )}
          </nav>

          {/* Botón superior derecho (Login / Usuario) */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/perfil"
                  className="flex items-center gap-2 bg-obsidian-850 hover:bg-obsidian-700 px-3 py-1.5 rounded-full border border-obsidian-700 text-sm text-gray-200 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">
                    {currentUser.nombre.charAt(0)}
                  </div>
                  <span className="hidden sm:inline font-medium">{currentUser.nombre}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-obsidian-850 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut size={19} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-obsidian-950 font-bold px-5 py-2 rounded-lg text-sm shadow-amber-glow transition-all transform hover:scale-105 active:scale-95"
              >
                Ingresar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Menú lateral desplegable (Requerimiento funcional: icono superior izquierdo con las opciones) */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay oscuro */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer menú */}
          <div className="relative w-80 max-w-[85vw] bg-obsidian-900 border-r border-obsidian-700 p-6 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-obsidian-700">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-amber-500/40">
                    <Image src="/IMG_logo-LRC.png" alt="LRC" fill className="object-cover" />
                  </div>
                  <span className="font-bold text-white tracking-wide">LA RED CULTURAL</span>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-obsidian-800"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Opciones requeridas en el documento */}
              <div className="mt-8 space-y-2">
                <p className="text-xs font-semibold text-amber-500/80 uppercase tracking-wider mb-3 px-3">
                  Navegación Principal
                </p>
                <Link
                  href="/explorar"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3.5 px-3 py-3 rounded-lg text-gray-200 hover:bg-obsidian-800 hover:text-amber-400 transition-colors"
                >
                  <Search size={18} className="text-amber-500" />
                  <span className="font-medium">Buscar evento</span>
                </Link>

                {/* Opciones disponibles ÚNICAMENTE para usuarios autenticados */}
                {currentUser && (
                  <>
                    <Link
                      href="/crear-evento"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3.5 px-3 py-3 rounded-lg text-gray-200 hover:bg-obsidian-800 hover:text-amber-400 transition-colors"
                    >
                      <CalendarPlus size={18} className="text-amber-500" />
                      <span className="font-medium">Crear nuevo evento</span>
                    </Link>

                    <Link
                      href="/mis-asistencias"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3.5 px-3 py-3 rounded-lg text-gray-200 hover:bg-obsidian-800 hover:text-amber-400 transition-colors"
                    >
                      <Ticket size={18} className="text-amber-500" />
                      <span className="font-medium">Eventos a los que asistiré</span>
                    </Link>

                    <Link
                      href="/mis-eventos"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3.5 px-3 py-3 rounded-lg text-gray-200 hover:bg-obsidian-800 hover:text-amber-400 transition-colors"
                    >
                      <FolderHeart size={18} className="text-amber-500" />
                      <span className="font-medium">Eventos creados por mí</span>
                    </Link>

                    <Link
                      href="/perfil"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3.5 px-3 py-3 rounded-lg text-gray-200 hover:bg-obsidian-800 hover:text-amber-400 transition-colors"
                    >
                      <User size={18} className="text-amber-500" />
                      <span className="font-medium">Mis datos e intereses</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Pie del menú */}
            <div className="pt-6 border-t border-obsidian-700">
              {currentUser ? (
                <div className="flex items-center justify-between">
                  <div className="truncate">
                    <p className="text-sm font-semibold text-white truncate">{currentUser.nombre} {currentUser.apellido}</p>
                    <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-400"
                    title="Cerrar sesión"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setLoginModalOpen(true);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-obsidian-950 font-bold py-2.5 rounded-lg text-sm text-center shadow-amber-glow"
                >
                  Ingresar a mi cuenta
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Login */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={() => {
          fetchUser();
          setLoginModalOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
