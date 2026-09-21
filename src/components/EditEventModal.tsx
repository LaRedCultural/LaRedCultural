'use client';

import React, { useState, useEffect } from 'react';
import {
  X, Calendar, Clock, MapPin, Sparkles, Users,
  AlertCircle, CheckCircle2, Loader2, Plus, Trash2, Edit3
} from 'lucide-react';
import { Evento, TipoEvento } from '@/types/database';

interface ArtistaForm {
  nombre_artista: string;
  fec_inicio?: string;
  fec_fin?: string;
}

interface EditEventModalProps {
  evento: Evento | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditEventModal({
  evento,
  isOpen,
  onClose,
  onSuccess,
}: EditEventModalProps) {
  const [tipos, setTipos] = useState<TipoEvento[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Estados del formulario
  const [tipoEventoId, setTipoEventoId] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [nombreLugar, setNombreLugar] = useState('');
  const [calle, setCalle] = useState('');
  const [numero, setNumero] = useState('');
  const [depto, setDepto] = useState('');
  const [partido, setPartido] = useState('');
  const [fecInicio, setFecInicio] = useState('');
  const [fecFin, setFecFin] = useState('');
  const [capacidadMaxima, setCapacidadMaxima] = useState('');
  const [categoria, setCategoria] = useState('');
  const [permiteCancelar, setPermiteCancelar] = useState(true);
  const [horasLimiteCancelacion, setHorasLimiteCancelacion] = useState('12');
  const [artistas, setArtistas] = useState<ArtistaForm[]>([]);

  // Función para convertir fecha ISO a formato requerido por input type="datetime-local" (YYYY-MM-DDTHH:mm)
  const formatForDateTimeLocal = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  useEffect(() => {
    if (!isOpen || !evento) return;

    // Cargar tipos de eventos
    fetch('/api/tipos-eventos')
      .then((r) => r.json())
      .then((data) => {
        if (data.tipos) setTipos(data.tipos);
      })
      .catch((e) => console.error(e));

    // Cargar datos completos del evento desde la API
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    fetch(`/api/eventos/${evento.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.evento) {
          const ev = data.evento;
          setTipoEventoId(String(ev.tipoevento_id || ''));
          setNombre(ev.nombre || '');
          setDescripcion(ev.descripcion || '');
          setNombreLugar(ev.lugar_nombre || '');
          setCalle(ev.calle || '');
          setNumero(ev.numero || '');
          setDepto(ev.depto || '');
          setPartido(ev.partido || '');
          setFecInicio(formatForDateTimeLocal(ev.fec_inicio));
          setFecFin(formatForDateTimeLocal(ev.fec_fin));
          setCapacidadMaxima(ev.capacidad_maxima ? String(ev.capacidad_maxima) : '');
          setCategoria(ev.categoria || '');
          setPermiteCancelar(Boolean(ev.permite_cancelar));
          setHorasLimiteCancelacion(String(ev.horas_limite_cancelacion ?? 12));

          if (Array.isArray(ev.artistas) && ev.artistas.length > 0) {
            setArtistas(
              ev.artistas.map((a: any) => ({
                nombre_artista: a.nombre_artista || '',
                fec_inicio: a.fec_inicio ? formatForDateTimeLocal(a.fec_inicio) : '',
                fec_fin: a.fec_fin ? formatForDateTimeLocal(a.fec_fin) : '',
              }))
            );
          } else {
            setArtistas([]);
          }
        }
      })
      .catch((e) => {
        console.error(e);
        setErrorMsg('Error al obtener los datos del evento.');
      })
      .finally(() => setLoading(false));
  }, [isOpen, evento]);

  if (!isOpen || !evento) return null;

  const addArtista = () => {
    setArtistas([...artistas, { nombre_artista: '', fec_inicio: '', fec_fin: '' }]);
  };

  const removeArtista = (index: number) => {
    setArtistas(artistas.filter((_, i) => i !== index));
  };

  const updateArtista = (index: number, field: keyof ArtistaForm, value: string) => {
    const updated = [...artistas];
    updated[index][field] = value;
    setArtistas(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/eventos/${evento.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoevento_id: tipoEventoId,
          nombre,
          descripcion,
          nombre_lugar: nombreLugar,
          calle,
          numero,
          depto,
          partido,
          fec_inicio: fecInicio,
          fec_fin: fecFin,
          capacidad_maxima: capacidadMaxima,
          categoria,
          permite_cancelar: permiteCancelar,
          horas_limite_cancelacion: horasLimiteCancelacion,
          artistas: artistas.filter((a) => a.nombre_artista.trim() !== ''),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Error al guardar los cambios.');
      } else {
        setSuccessMsg('¡Evento modificado con éxito!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg('Error de conexión al actualizar evento.');
    } finally {
      setSaving(false);
    }
  };

  const tipoSeleccionado = tipos.find((t) => String(t.id) === String(tipoEventoId));
  const esDeportivo = tipoSeleccionado?.tipoevento_descripcion.toLowerCase().includes('deportiv');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-obsidian-900 border border-obsidian-700 rounded-3xl p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 rounded-xl hover:bg-obsidian-800 transition-colors"
        >
          <X size={22} />
        </button>

        {/* Encabezado */}
        <div className="mb-6 pb-4 border-b border-obsidian-800">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
            <Edit3 size={15} /> Modificar Evento
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Editar: {evento.nombre}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Actualiza los datos del evento, lugar, fecha y artistas participantes.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle size={17} className="text-red-400 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 size={17} className="text-emerald-400 shrink-0 mt-0.5" />
            <p>{successMsg}</p>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 size={36} className="animate-spin text-amber-500 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Cargando información del evento...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Tipo de Evento & Nombre */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Tipo de Evento <span className="text-amber-500">*</span>
                </label>
                <select
                  value={tipoEventoId}
                  onChange={(e) => setTipoEventoId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  required
                >
                  {tipos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tipoevento_descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Nombre del Evento <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Noche de Jazz en Vivo"
                  className="w-full px-3.5 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* 2. Descripción */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                placeholder="Detalla de qué trata la actividad..."
                className="w-full px-3.5 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* 3. Lugar y Domicilio */}
            <div className="p-4 rounded-2xl bg-obsidian-850/70 border border-obsidian-800 space-y-4">
              <div className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} /> Ubicación y Domicilio
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Nombre del Lugar</label>
                <input
                  type="text"
                  value={nombreLugar}
                  onChange={(e) => setNombreLugar(e.target.value)}
                  placeholder="Ej. Teatro Municipal"
                  className="w-full px-3 py-2 bg-obsidian-900 border border-obsidian-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="col-span-2 sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Calle <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={calle}
                    onChange={(e) => setCalle(e.target.value)}
                    placeholder="Ej. Av. Santa Fe"
                    className="w-full px-3 py-2 bg-obsidian-900 border border-obsidian-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Número <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="1234"
                    className="w-full px-3 py-2 bg-obsidian-900 border border-obsidian-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Depto / Piso</label>
                  <input
                    type="text"
                    value={depto}
                    onChange={(e) => setDepto(e.target.value)}
                    placeholder="Ej. 2B"
                    className="w-full px-3 py-2 bg-obsidian-900 border border-obsidian-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Partido / Municipio <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  value={partido}
                  onChange={(e) => setPartido(e.target.value)}
                  placeholder="Ej. San Isidro, Tigre, Comuna 1..."
                  className="w-full px-3 py-2 bg-obsidian-900 border border-obsidian-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* 4. Fechas y Horarios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Fecha y Hora de Inicio <span className="text-amber-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={fecInicio}
                  onChange={(e) => setFecInicio(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Fecha y Hora de Fin <span className="text-amber-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={fecFin}
                  onChange={(e) => setFecFin(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* 5. Capacidad, Categoría & Cancelación */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Capacidad Máxima (Cupo)
                </label>
                <input
                  type="number"
                  min="0"
                  value={capacidadMaxima}
                  onChange={(e) => setCapacidadMaxima(e.target.value)}
                  placeholder="0 = Sin límite"
                  className="w-full px-3.5 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {esDeportivo && (
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    Categoría Deportiva
                  </label>
                  <input
                    type="text"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    placeholder="Ej. Sub-20, Senior, Libre"
                    className="w-full px-3.5 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Reglas de Cancelación de Asistencia */}
            <div className="p-4 rounded-2xl bg-obsidian-850/70 border border-obsidian-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permiteCancelar}
                  onChange={(e) => setPermiteCancelar(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-obsidian-900 border-obsidian-700"
                />
                <span className="text-sm text-gray-200 font-medium">
                  Permitir cancelación de asistencia a los usuarios
                </span>
              </label>

              {permiteCancelar && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 whitespace-nowrap">Hasta</span>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={horasLimiteCancelacion}
                    onChange={(e) => setHorasLimiteCancelacion(e.target.value)}
                    className="w-20 px-2 py-1 bg-obsidian-900 border border-obsidian-700 rounded-lg text-white text-sm text-center"
                  />
                  <span className="text-xs text-gray-400 whitespace-nowrap">hs antes del evento</span>
                </div>
              )}
            </div>

            {/* 6. Artistas Participantes */}
            <div className="p-4 rounded-2xl bg-obsidian-850/70 border border-obsidian-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Users size={14} /> Artistas Participantes
                </div>
                <button
                  type="button"
                  onClick={addArtista}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                >
                  <Plus size={14} /> Agregar Artista
                </button>
              </div>

              {artistas.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-2">
                  No se han registrado artistas específicos para este evento.
                </p>
              ) : (
                <div className="space-y-3">
                  {artistas.map((art, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-obsidian-900 rounded-xl border border-obsidian-700">
                      <input
                        type="text"
                        value={art.nombre_artista}
                        onChange={(e) => updateArtista(idx, 'nombre_artista', e.target.value)}
                        placeholder={`Artista ${idx === 0 ? '(Principal / Destacado)' : '#' + (idx + 1)}`}
                        className="w-full sm:flex-1 px-3 py-1.5 bg-obsidian-850 border border-obsidian-700 rounded-lg text-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeArtista(idx)}
                        className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg self-end sm:self-auto"
                        title="Eliminar artista"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="pt-4 border-t border-obsidian-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-gray-300 font-semibold text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-obsidian-950 font-bold text-sm shadow-amber-glow transition-all flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
