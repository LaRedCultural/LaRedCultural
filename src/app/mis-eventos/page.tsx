'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FolderHeart, Calendar, MapPin, Users, Send, 
  XCircle, AlertTriangle, CheckCircle2, Loader2, Plus, Sparkles, Edit3 
} from 'lucide-react';
import { Evento } from '@/types/database';
import EditEventModal from '@/components/EditEventModal';

export default function MisEventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Estados para modal de acción (Campaña o Cancelación)
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [modalAction, setModalAction] = useState<'campana' | 'cancelar' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResponse, setActionResponse] = useState<string | null>(null);

  // Estados para modal de edición
  const [editingEvent, setEditingEvent] = useState<Evento | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchMisEventos = async (userId: number) => {
    try {
      const res = await fetch(`/api/eventos?creador=${userId}`);
      const data = await res.json();
      if (data.eventos) setEventos(data.eventos);
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
          fetchMisEventos(d.user.id);
        } else {
          setLoading(false);
        }
      });
  }, []);

  const handleCancelarEvento = async () => {
    if (!selectedEvent) return;
    setActionLoading(true);
    setActionResponse(null);

    try {
      const res = await fetch(`/api/eventos/${selectedEvent.id}/cancelar`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setActionResponse(data.message);
        if (currentUser) fetchMisEventos(currentUser.id);
      } else {
        setActionResponse(data.error || 'Error al cancelar evento.');
      }
    } catch (e: any) {
      setActionResponse('Error de red al cancelar evento.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLanzarCampana = async () => {
    if (!selectedEvent) return;
    setActionLoading(true);
    setActionResponse(null);

    try {
      const res = await fetch(`/api/eventos/${selectedEvent.id}/campana`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setActionResponse(data.message);
      } else {
        setActionResponse(data.error || 'Error al lanzar campaña.');
      }
    } catch (e: any) {
      setActionResponse('Error de conexión.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-obsidian-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
            <Sparkles size={14} /> Panel del Organizador
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Eventos Creados por Mí
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Gestiona la asistencia, difunde tus eventos con campañas segmentadas o gestiona cancelaciones.
          </p>
        </div>

        <Link
          href="/crear-evento"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-obsidian-950 font-bold text-sm shadow-amber-glow transition-all self-start sm:self-auto"
        >
          <Plus size={18} /> Crear Nuevo Evento
        </Link>
      </div>

      {!currentUser && !loading ? (
        <div className="text-center py-20 bg-obsidian-900 border border-obsidian-800 rounded-3xl p-8">
          <p className="text-gray-300 mb-4">Debes iniciar sesión para consultar tus eventos creados.</p>
          <Link href="/" className="px-6 py-2.5 rounded-xl bg-amber-500 text-obsidian-950 font-bold text-sm">
            Ir al Inicio
          </Link>
        </div>
      ) : loading ? (
        <div className="py-24 text-center">
          <Loader2 size={36} className="animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Cargando tus eventos...</p>
        </div>
      ) : eventos.length === 0 ? (
        <div className="text-center py-20 bg-obsidian-900 border border-obsidian-800 rounded-3xl p-8">
          <FolderHeart size={44} className="text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Aún no has creado ningún evento</h3>
          <p className="text-sm text-gray-400 mt-1 mb-6 max-w-sm mx-auto">
            Comienza a conectar con el público cultural publicando tu primera actividad.
          </p>
          <Link
            href="/crear-evento"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-obsidian-950 font-bold text-sm shadow-amber-glow"
          >
            Crear mi primer evento
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {eventos.map((ev) => (
            <div
              key={ev.id}
              className="bg-obsidian-900 hover:bg-obsidian-850 border border-obsidian-800 hover:border-amber-500/50 rounded-2xl p-6 transition-all shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {ev.tipo_nombre}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(ev.fec_inicio).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })} hs
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white">{ev.nombre}</h3>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                  <MapPin size={13} className="text-amber-500" />
                  {ev.lugar_nombre} — {ev.direccion_completa}
                </p>

                {/* Métricas de asistentes */}
                <div className="mt-4 flex items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-amber-400 bg-amber-950/40 border border-amber-800/60 px-3 py-1.5 rounded-lg">
                    <Users size={14} />
                    <span>
                      Asistentes confirmados: <strong>{ev.asistentes_confirmados || 0}</strong>
                      {ev.capacidad_maxima > 0 && ` / ${ev.capacidad_maxima}`}
                    </span>
                  </div>

                  <span className="text-gray-400">
                    Cupo: <strong className="text-white">{ev.cupo_disponible}</strong>
                  </span>
                </div>
              </div>

              {/* Botones de acción según especificación funcional */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
                {/* Botón Editar Evento */}
                <button
                  onClick={() => {
                    setEditingEvent(ev);
                    setIsEditModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-obsidian-800 hover:bg-amber-500 hover:text-obsidian-950 text-amber-300 border border-obsidian-700 hover:border-amber-500/50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  title="Modificar los datos del evento"
                >
                  <Edit3 size={15} /> Editar
                </button>

                {/* Botón Lanzar Campaña */}
                <button
                  onClick={() => {
                    setSelectedEvent(ev);
                    setActionResponse(null);
                    setModalAction('campana');
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-obsidian-800 hover:bg-amber-500 hover:text-obsidian-950 text-amber-400 border border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  title="Enviar publicidad a usuarios con intereses compatibles y mismo código postal"
                >
                  <Send size={15} /> Lanzar Campaña de Difusión
                </button>

                {/* Botón Cancelar Evento */}
                <button
                  onClick={() => {
                    setSelectedEvent(ev);
                    setActionResponse(null);
                    setModalAction('cancelar');
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-red-950/40 hover:bg-red-900 border border-red-800 text-red-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  title="Cancelar evento y avisar a todos los asistentes confirmados"
                >
                  <XCircle size={15} /> Cancelar Evento
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CAMPAÑA O CANCELACIÓN */}
      {modalAction && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-obsidian-900 border border-obsidian-700 rounded-3xl p-6 sm:p-8 shadow-2xl">
            {modalAction === 'campana' ? (
              <>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mb-4 border border-amber-500/20">
                  <Send size={22} />
                </div>
                <h3 className="text-xl font-bold text-white">Lanzar Campaña de Publicidad</h3>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                  Esta acción buscará de forma automatizada a todos los usuarios de <strong>La Red Cultural</strong> que:
                </p>
                <ul className="text-xs text-gray-400 list-disc list-inside mt-2 space-y-1 bg-obsidian-850 p-3 rounded-xl border border-obsidian-800">
                  <li>Hayan indicado dentro de sus intereses eventos de tipo <strong>{selectedEvent.tipo_nombre}</strong>.</li>
                  <li>Hayan asistido previamente a eventos de tipo <strong>{selectedEvent.tipo_nombre}</strong>.</li>
                  <li>Cuyo código postal coincida con la zona del evento.</li>
                </ul>
                <p className="text-xs text-amber-400 mt-3 font-semibold">
                  Se enviará un correo con enlace directo para solicitar y confirmar su asistencia.
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 mb-4 border border-red-500/20">
                  <AlertTriangle size={22} />
                </div>
                <h3 className="text-xl font-bold text-white">¿Cancelar este evento?</h3>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                  Estás a punto de cancelar el evento <strong>{selectedEvent.nombre}</strong>.
                </p>
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-xs mt-3">
                  ⚠️ Esta acción dará de baja el evento y <strong>enviará automáticamente un correo masivo a todos los {selectedEvent.asistentes_confirmados || 0} asistentes confirmados</strong> informando la cancelación.
                </div>
              </>
            )}

            {actionResponse && (
              <div className="mt-4 p-3.5 rounded-xl bg-obsidian-850 border border-obsidian-700 text-xs text-white">
                {actionResponse}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-obsidian-800">
              <button
                type="button"
                onClick={() => {
                  setModalAction(null);
                  setSelectedEvent(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white"
              >
                Cerrar
              </button>

              {modalAction === 'campana' ? (
                <button
                  onClick={handleLanzarCampana}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-obsidian-950 text-xs font-bold shadow-amber-glow flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                  Disparar Campaña Masiva
                </button>
              ) : (
                <button
                  onClick={handleCancelarEvento}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={15} />}
                  Confirmar y Notificar Asistentes
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDICIÓN DE EVENTO */}
      <EditEventModal
        evento={editingEvent}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingEvent(null);
        }}
        onSuccess={() => {
          if (currentUser) fetchMisEventos(currentUser.id);
        }}
      />
    </div>
  );
}
