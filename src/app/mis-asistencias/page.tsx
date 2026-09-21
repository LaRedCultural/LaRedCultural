'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Ticket, Calendar, MapPin, Clock, XCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Evento } from '@/types/database';

export default function MisAsistenciasPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadAsistencias = async () => {
    try {
      // Trae los eventos y filtramos por los confirmados del usuario
      const res = await fetch('/api/eventos');
      const data = await res.json();
      if (data.eventos) {
        const misAsistencias = data.eventos.filter((e: Evento) => e.asiste_usuario_actual);
        setEventos(misAsistencias);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) {
          setCurrentUser(d.user);
          loadAsistencias();
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCancelar = async (evento: Evento) => {
    setCancellingId(evento.id);
    setMessage(null);

    try {
      const res = await fetch(`/api/eventos/${evento.id}/asistir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'cancelar' }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Tu asistencia ha sido cancelada.');
        loadAsistencias();
      } else {
        setMessage(data.error || 'Error al cancelar asistencia.');
      }
    } catch (e) {
      setMessage('Error de conexión.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="mb-10 pb-6 border-b border-obsidian-800">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
          <Sparkles size={14} /> Mis Entradas y Asistencias
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Eventos a los que Asistiré
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Consulta las fechas, ubicaciones y gestiona tu confirmación de participación.
        </p>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-xl bg-obsidian-850 border border-obsidian-700 text-sm text-amber-400">
          {message}
        </div>
      )}

      {!currentUser && !loading ? (
        <div className="text-center py-20 bg-obsidian-900 border border-obsidian-800 rounded-3xl p-8">
          <p className="text-gray-300 mb-4">Debes iniciar sesión para consultar tus asistencias confirmadas.</p>
          <Link href="/" className="px-6 py-2.5 rounded-xl bg-amber-500 text-obsidian-950 font-bold text-sm shadow-amber-glow">
            Ir al Inicio
          </Link>
        </div>
      ) : loading ? (
        <div className="py-24 text-center">
          <Loader2 size={36} className="animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Cargando tus eventos confirmados...</p>
        </div>
      ) : eventos.length === 0 ? (
        <div className="text-center py-20 bg-obsidian-900 border border-obsidian-800 rounded-3xl p-8">
          <Ticket size={44} className="text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No tienes asistencias confirmadas</h3>
          <p className="text-sm text-gray-400 mt-1 mb-6 max-w-sm mx-auto">
            Explora la cartelera cultural y reserva tu lugar en los eventos de tu preferencia.
          </p>
          <Link
            href="/explorar"
            className="px-6 py-3 rounded-xl bg-amber-500 text-obsidian-950 font-bold text-sm shadow-amber-glow"
          >
            Explorar Eventos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {eventos.map((ev) => {
            const fechaObj = new Date(ev.fec_inicio);
            const horasRestantes = (fechaObj.getTime() - Date.now()) / (1000 * 60 * 60);
            const puedeCancelar = ev.permite_cancelar && horasRestantes >= ev.horas_limite_cancelacion;

            return (
              <div
                key={ev.id}
                className="bg-obsidian-900 border border-obsidian-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {ev.tipo_nombre}
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
                      Confirmado
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white">{ev.nombre}</h3>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                    <MapPin size={13} className="text-amber-500" />
                    {ev.lugar_nombre} — {ev.direccion_completa}
                  </p>

                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-300 font-medium">
                    <div className="flex items-center gap-1">
                      <Calendar size={13} className="text-amber-500" />
                      <span>{fechaObj.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={13} className="text-amber-500" />
                      <span>{fechaObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</span>
                    </div>
                  </div>
                </div>

                <div>
                  {ev.permite_cancelar ? (
                    <button
                      onClick={() => handleCancelar(ev)}
                      disabled={cancellingId === ev.id || !puedeCancelar}
                      className="px-4 py-2.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-800 text-red-300 text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-2"
                      title={!puedeCancelar ? 'Plazo de cancelación expirado' : 'Cancelar asistencia'}
                    >
                      {cancellingId === ev.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <XCircle size={14} />
                      )}
                      Cancelar mi asistencia
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500">Cancelación no permitida</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
