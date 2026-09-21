'use client';

import React, { useState } from 'react';
import { 
  X, Calendar, Clock, MapPin, Users, Sparkles, 
  CheckCircle2, XCircle, AlertCircle, Loader2 
} from 'lucide-react';
import { Evento } from '@/types/database';

interface EventDetailModalProps {
  evento: Evento | null;
  onClose: () => void;
  onAttendanceChanged: () => void;
  isAuthenticated: boolean;
  onRequireLogin: () => void;
}

export default function EventDetailModal({
  evento,
  onClose,
  onAttendanceChanged,
  isAuthenticated,
  onRequireLogin,
}: EventDetailModalProps) {
  const [loadingAction, setLoadingAction] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!evento) return null;

  const fechaInicioObj = new Date(evento.fec_inicio);
  const fechaFinObj = new Date(evento.fec_fin);

  const fechaFormateada = fechaInicioObj.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const horaInicio = fechaInicioObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const horaFin = fechaFinObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  // Cupos disponibles numéricos
  const capacidad = evento.capacidad_maxima || 0;
  const confirmados = evento.asistentes_confirmados || 0;
  const lugaresDisponibles = capacidad > 0 ? Math.max(0, capacidad - confirmados) : 'Sin límite informado';

  // Verificar si la cancelación está dentro de la ventana horaria permitida
  const horasRestantes = (fechaInicioObj.getTime() - Date.now()) / (1000 * 60 * 60);
  const permiteCancelarPorTiempo = evento.permite_cancelar && horasRestantes >= evento.horas_limite_cancelacion;

  const handleAttendance = async (accion: 'confirmar' | 'cancelar') => {
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }

    setLoadingAction(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/eventos/${evento.id}/asistir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionMessage({ type: 'error', text: data.error || 'Error al procesar la solicitud.' });
      } else {
        setActionMessage({ type: 'success', text: data.message });
        onAttendanceChanged();
      }
    } catch (e: any) {
      setActionMessage({ type: 'error', text: 'Error de red.' });
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-obsidian-900 border border-obsidian-700 rounded-3xl p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 rounded-xl hover:bg-obsidian-800 transition-colors"
        >
          <X size={22} />
        </button>

        {/* Tipo de evento & Estado de cupo */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
            {evento.tipo_nombre || 'Evento'}
          </span>
          {evento.categoria && (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-obsidian-800 text-gray-300 border border-obsidian-700">
              Categoría: {evento.categoria}
            </span>
          )}
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            evento.cupo_disponible === 'Agotado' 
              ? 'bg-red-950/60 text-red-400 border-red-800' 
              : 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
          }`}>
            {evento.cupo_disponible}
          </span>
        </div>

        {/* Nombre del evento */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
          {evento.nombre}
        </h2>

        {evento.descripcion && (
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6">
            {evento.descripcion}
          </p>
        )}

        {/* Mensajes de respuesta de acción */}
        {actionMessage && (
          <div className={`mb-6 p-4 rounded-xl border text-sm flex items-start gap-3 ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' 
              : 'bg-red-950/40 border-red-800 text-red-200'
          }`}>
            {actionMessage.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
            )}
            <p>{actionMessage.text}</p>
          </div>
        )}

        {/* Cuadrícula de detalles requeridos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Ubicación */}
          <div className="p-4 rounded-2xl bg-obsidian-850 border border-obsidian-700/80">
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin size={15} /> Lugar y Dirección
            </h4>
            <p className="text-base font-bold text-white">{evento.lugar_nombre || 'Sede'}</p>
            <p className="text-xs text-gray-400 mt-1">{evento.direccion_completa || 'Dirección a confirmar'}</p>
          </div>

          {/* Horarios & Lugares disponibles */}
          <div className="p-4 rounded-2xl bg-obsidian-850 border border-obsidian-700/80">
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar size={15} /> Fecha y Horarios
            </h4>
            <p className="text-xs text-gray-200 font-semibold capitalize">{fechaFormateada}</p>
            <p className="text-sm font-extrabold text-white mt-0.5">
              Inicio: {horaInicio} hs — Finalización: {horaFin} hs
            </p>
            <div className="mt-2 text-xs text-gray-400 flex items-center gap-1.5">
              <Users size={14} className="text-amber-500" />
              <span>Lugares disponibles: <strong className="text-amber-400">{lugaresDisponibles}</strong></span>
            </div>
          </div>
        </div>

        {/* Lista de Artistas participantes con horarios de inicio y finalización */}
        {evento.artistas && evento.artistas.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-obsidian-850 border border-obsidian-700/80">
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles size={15} /> Artistas Participantes
            </h4>
            <div className="space-y-2">
              {evento.artistas.map((art, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-obsidian-700/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{art.nombre_artista}</span>
                    {art.es_principal && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">
                        Principal
                      </span>
                    )}
                  </div>
                  {(art.fec_inicio || art.fec_fin) && (
                    <span className="text-gray-400">
                      {art.fec_inicio ? new Date(art.fec_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      {art.fec_fin ? ` a ${new Date(art.fec_fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs` : ''}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información de política de cancelación */}
        {evento.permite_cancelar && (
          <p className="text-xs text-gray-400 mb-6 bg-obsidian-850/60 p-3 rounded-xl border border-obsidian-800">
            ℹ️ Cancelación de asistencia: Disponible hasta <strong>{evento.horas_limite_cancelacion} horas antes</strong> del inicio del evento.
          </p>
        )}

        {/* Botones de acción requeridos */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-obsidian-700">
          {evento.asiste_usuario_actual ? (
            <div className="w-full flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-sm font-bold flex items-center justify-center gap-2">
                <CheckCircle2 size={18} /> ¡Ya estás anotado a este evento!
              </div>

              {evento.permite_cancelar && (
                <button
                  onClick={() => handleAttendance('cancelar')}
                  disabled={loadingAction || !permiteCancelarPorTiempo}
                  title={!permiteCancelarPorTiempo ? 'El plazo para cancelar asistencia ha expirado' : 'Cancelar mi asistencia'}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-950/50 hover:bg-red-900 border border-red-700/80 text-red-200 text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingAction ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                  Cancelar asistencia
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => handleAttendance('confirmar')}
              disabled={loadingAction || evento.cupo_disponible === 'Agotado'}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-obsidian-950 font-bold py-3.5 px-6 rounded-xl shadow-amber-glow transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingAction ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Procesando...
                </>
              ) : evento.cupo_disponible === 'Agotado' ? (
                'Cupo Agotado'
              ) : (
                'Confirmar Asistencia'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
