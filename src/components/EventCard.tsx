'use client';

import React from 'react';
import { Calendar, Clock, MapPin, UserCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { Evento } from '@/types/database';

interface EventCardProps {
  evento: Evento;
  onSelect: (evento: Evento) => void;
}

export default function EventCard({ evento, onSelect }: EventCardProps) {
  const isAgotado = evento.cupo_disponible === 'Agotado';
  const fechaObj = new Date(evento.fec_inicio);

  const fechaFormateada = fechaObj.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
  });

  const horaFormateada = fechaObj.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Colores temáticos según el tipo de evento
  const getTipoBadgeStyle = (tipo?: string) => {
    const t = tipo?.toLowerCase() || '';
    if (t.includes('musical')) return 'bg-purple-950/70 text-purple-300 border-purple-800/80';
    if (t.includes('deportiv')) return 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80';
    if (t.includes('plástic') || t.includes('art')) return 'bg-rose-950/70 text-rose-300 border-rose-800/80';
    if (t.includes('teatr')) return 'bg-amber-950/70 text-amber-300 border-amber-800/80';
    return 'bg-blue-950/70 text-blue-300 border-blue-800/80';
  };

  return (
    <div
      onClick={() => onSelect(evento)}
      className="group relative bg-obsidian-850 hover:bg-obsidian-800 border border-obsidian-700/80 hover:border-amber-500/80 rounded-2xl p-5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-amber-glow flex flex-col justify-between overflow-hidden"
    >
      {/* Glow de fondo decorativo al hover */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

      <div>
        {/* Cabecera de la tarjeta: Tipo de evento y Badge de Cupo */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getTipoBadgeStyle(evento.tipo_nombre)}`}>
            {evento.tipo_nombre || 'Cultural'}
          </span>

          <div className="flex items-center gap-1.5">
            {evento.asiste_usuario_actual && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-md">
                <CheckCircle2 size={12} /> Asistirás
              </span>
            )}

            {/* Cupo disponible (Hay lugar/Agotado) */}
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                isAgotado
                  ? 'bg-red-950/70 text-red-400 border-red-800/80 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {isAgotado ? 'Agotado' : 'Hay lugar'}
            </span>
          </div>
        </div>

        {/* Nombre del evento */}
        <h3 className="text-lg font-extrabold text-white group-hover:text-amber-400 transition-colors line-clamp-2 tracking-tight">
          {evento.nombre}
        </h3>

        {/* Artista principal/destacado */}
        {evento.artista_principal && (
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-amber-300/90">
            <Sparkles size={14} className="text-amber-400 shrink-0" />
            <span className="truncate">Artista: {evento.artista_principal}</span>
          </div>
        )}

        {/* Nombre del lugar */}
        <div className="flex items-center gap-1.5 mt-2.5 text-xs text-gray-300 font-medium">
          <span className="text-amber-500 font-bold">📍</span>
          <span className="truncate font-semibold">{evento.lugar_nombre || 'Sede del evento'}</span>
        </div>

        {/* Dirección (Calle, número y partido) */}
        <div className="flex items-start gap-1.5 mt-1.5 text-xs text-gray-400">
          <MapPin size={13} className="shrink-0 mt-0.5 text-gray-500" />
          <span className="line-clamp-1">{evento.direccion_completa || 'Dirección a confirmar'}</span>
        </div>
      </div>

      {/* Pie de la tarjeta: Horario de inicio y botón ver */}
      <div className="mt-5 pt-3.5 border-t border-obsidian-700/60 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-300 font-semibold">
          <div className="flex items-center gap-1">
            <Calendar size={13} className="text-amber-500" />
            <span>{fechaFormateada}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={13} className="text-amber-500" />
            <span>{horaFormateada} hs</span>
          </div>
        </div>

        <span className="text-xs font-bold text-amber-500 group-hover:underline">
          Ver detalle →
        </span>
      </div>
    </div>
  );
}
