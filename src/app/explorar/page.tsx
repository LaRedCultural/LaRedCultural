'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { 
  Search, Filter, Sparkles, MapPin, Calendar, 
  Loader2, CheckCircle2, SlidersHorizontal, RefreshCw 
} from 'lucide-react';
import EventCard from '@/components/EventCard';
import EventDetailModal from '@/components/EventDetailModal';
import LoginModal from '@/components/LoginModal';
import { Evento, TipoEvento } from '@/types/database';
import { useSearchParams } from 'next/navigation';

function ExplorarContent() {
  const searchParams = useSearchParams();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [tipos, setTipos] = useState<TipoEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroPartido, setFiltroPartido] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');
  const [mensajeBienvenida, setMensajeBienvenida] = useState(false);

  useEffect(() => {
    if (searchParams.get('cuenta_activada') === 'true') {
      setMensajeBienvenida(true);
    }

    // Verificar usuario
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) setCurrentUser(d.user);
      });

    // Cargar tipos de evento
    fetch('/api/tipos-eventos')
      .then((r) => r.json())
      .then((d) => {
        if (d.tipos) setTipos(d.tipos);
      });
  }, [searchParams]);

  const loadEventos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroTipo) params.append('tipo', filtroTipo);
      if (filtroPartido) params.append('partido', filtroPartido);
      if (busqueda) params.append('q', busqueda);

      const res = await fetch(`/api/eventos?${params.toString()}`);
      const data = await res.json();
      if (data.eventos) {
        setEventos(data.eventos);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventos();
  }, [filtroTipo, filtroPartido]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEventos();
  };

  return (
    <div className="min-h-screen bg-obsidian-950 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Banner de bienvenida si recién activó cuenta */}
      {mensajeBienvenida && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-emerald-950/60 border border-emerald-600 text-emerald-200 text-sm flex items-center justify-between shadow-amber-glow animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={22} className="text-emerald-400" />
            <div>
              <p className="font-bold text-emerald-300">¡Tu correo ha sido confirmado con éxito!</p>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Ya puedes confirmar asistencia a eventos, gestionar tus actividades y recibir avisos exclusivos.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setMensajeBienvenida(false)} 
            className="text-xs uppercase font-bold text-emerald-400 hover:underline px-2 py-1"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Cabecera & Barra de Búsqueda estilo Netflix */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-obsidian-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">
            <Sparkles size={14} /> Cartelera Cultural Oficial
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explorar Eventos
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Visualización organizada por fecha: los más cercanos a realizarse en la parte superior.
          </p>
        </div>

        {/* Buscador interactivo */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-96">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3.5 top-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar evento, lugar o artista..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-obsidian-950 font-bold rounded-xl text-sm transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Filtros rápidos (Pills horizontales) */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase mr-2">
          <SlidersHorizontal size={14} className="text-amber-500" />
          <span>Filtros:</span>
        </div>

        {/* Todos */}
        <button
          onClick={() => setFiltroTipo('')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            filtroTipo === ''
              ? 'bg-amber-500 text-obsidian-950 shadow-amber-glow'
              : 'bg-obsidian-850 hover:bg-obsidian-800 text-gray-300 border border-obsidian-700'
          }`}
        >
          Todos los Tipos
        </button>

        {/* Lista dinámica de tipos de eventos de la BBDD */}
        {tipos.map((tipo) => (
          <button
            key={tipo.id}
            onClick={() => setFiltroTipo(filtroTipo === String(tipo.id) ? '' : String(tipo.id))}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filtroTipo === String(tipo.id)
                ? 'bg-amber-500 text-obsidian-950 shadow-amber-glow'
                : 'bg-obsidian-850 hover:bg-obsidian-800 text-gray-300 border border-obsidian-700'
            }`}
          >
            {tipo.tipoevento_descripcion}
          </button>
        ))}

        {/* Filtro por Partido/Zona */}
        <div className="ml-auto w-full sm:w-auto mt-2 sm:mt-0">
          <input
            type="text"
            placeholder="Filtrar por partido (ej. San Isidro, Tigre...)"
            value={filtroPartido}
            onChange={(e) => setFiltroPartido(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-1.5 bg-obsidian-850 border border-obsidian-700 rounded-full text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Grilla de Eventos (Netflix Style) */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 size={36} className="animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-gray-400 text-sm font-medium">Cargando eventos de la cartelera...</p>
        </div>
      ) : eventos.length === 0 ? (
        <div className="py-20 text-center bg-obsidian-900 border border-obsidian-800 rounded-3xl p-8">
          <Calendar size={42} className="text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No se encontraron eventos con estos criterios</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
            Prueba ajustando los filtros de búsqueda o sé el primero en crear un evento en esta categoría.
          </p>
          <button
            onClick={() => {
              setFiltroTipo('');
              setFiltroPartido('');
              setBusqueda('');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-amber-400 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw size={13} /> Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {eventos.map((evento) => (
            <EventCard
              key={evento.id}
              evento={evento}
              onSelect={(ev) => setSelectedEvent(ev)}
            />
          ))}
        </div>
      )}

      {/* Modal de Detalle */}
      <EventDetailModal
        evento={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onAttendanceChanged={loadEventos}
        isAuthenticated={!!currentUser}
        onRequireLogin={() => {
          setSelectedEvent(null);
          setLoginModalOpen(true);
        }}
      />

      {/* Modal de Login */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={() => {
          fetch('/api/auth/me')
            .then((r) => r.json())
            .then((d) => {
              if (d.authenticated) setCurrentUser(d.user);
            });
          setLoginModalOpen(false);
          loadEventos();
        }}
      />
    </div>
  );
}

export default function ExplorarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-obsidian-950 pt-36 text-center">
        <Loader2 size={36} className="animate-spin text-amber-500 mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    }>
      <ExplorarContent />
    </Suspense>
  );
}

