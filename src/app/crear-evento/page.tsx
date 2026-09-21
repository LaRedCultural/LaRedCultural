'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, Trash2, Calendar, Clock, MapPin, Sparkles, 
  Users, AlertCircle, CheckCircle2, Loader2, PlusCircle 
} from 'lucide-react';
import { TipoEvento } from '@/types/database';

interface ArtistaForm {
  nombre_artista: string;
  fec_inicio: string;
  fec_fin: string;
}

export default function CrearEventoPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [tipos, setTipos] = useState<TipoEvento[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal para ABM de nuevo tipo de evento
  const [modalNuevoTipoOpen, setModalNuevoTipoOpen] = useState(false);
  const [nuevoTipoNombre, setNuevoTipoNombre] = useState('');
  const [creandoTipo, setCreandoTipo] = useState(false);

  // Formulario principal
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

  // Artistas participantes
  const [artistas, setArtistas] = useState<ArtistaForm[]>([
    { nombre_artista: '', fec_inicio: '', fec_fin: '' },
  ]);

  const loadTipos = async () => {
    try {
      const res = await fetch('/api/tipos-eventos');
      const data = await res.json();
      if (data.tipos) {
        setTipos(data.tipos);
        if (data.tipos.length > 0 && !tipoEventoId) {
          setTipoEventoId(String(data.tipos[0].id));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTipos(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) {
          setCurrentUser(d.user);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setCheckingAuth(false));

    loadTipos();
  }, []);

  // Determinar si el tipo seleccionado es musical o deportivo
  const tipoSeleccionado = tipos.find((t) => String(t.id) === String(tipoEventoId));
  const esMusical = tipoSeleccionado?.tipoevento_descripcion.toLowerCase().includes('musical');
  const esDeportivo = tipoSeleccionado?.tipoevento_descripcion.toLowerCase().includes('deportiv');

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

  const handleCrearNuevoTipo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTipoNombre.trim()) return;
    setCreandoTipo(true);

    try {
      const res = await fetch('/api/tipos-eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion: nuevoTipoNombre.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.tipo) {
        await loadTipos();
        setTipoEventoId(String(data.tipo.id));
        setNuevoTipoNombre('');
        setModalNuevoTipoOpen(false);
      } else {
        alert(data.error || 'Error al crear nuevo tipo de evento');
      }
    } catch (e) {
      alert('Error de conexión');
    } finally {
      setCreandoTipo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validación según especificación
    if (!tipoEventoId || !nombre || !calle || !numero || !partido || !fecInicio || !fecFin) {
      setErrorMsg('Por favor completa todos los campos obligatorios (*).');
      return;
    }

    if (esMusical) {
      const tieneArtista = artistas.some((a) => a.nombre_artista.trim() !== '');
      if (!tieneArtista) {
        setErrorMsg('Para un evento Musical es obligatorio ingresar al menos un artista participante.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload = {
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
        capacidad_maxima: capacidadMaxima ? parseInt(capacidadMaxima, 10) : 0,
        categoria: esDeportivo ? categoria : null,
        permite_cancelar: permiteCancelar,
        horas_limite_cancelacion: permiteCancelar ? parseInt(horasLimiteCancelacion || '0', 10) : 0,
        artistas: artistas.filter((a) => a.nombre_artista.trim() !== ''),
      };

      const res = await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Error al publicar evento.');
      } else {
        setSuccessMsg('¡Evento publicado con éxito en La Red Cultural!');
        setTimeout(() => {
          router.push('/mis-eventos');
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg('Error al conectar con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">
          <Sparkles size={14} /> Panel de Creadores LRC
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Crear Nuevo Evento
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Publica tu actividad cultural en la plataforma y llega a personas de tu zona con intereses afines.
        </p>
      </div>

      {!currentUser && !checkingAuth ? (
        <div className="text-center py-20 bg-obsidian-900 border border-obsidian-800 rounded-3xl p-8">
          <p className="text-gray-300 mb-4">Debes iniciar sesión para publicar un nuevo evento.</p>
          <Link href="/" className="px-6 py-2.5 rounded-xl bg-amber-500 text-obsidian-950 font-bold text-sm">
            Ir al Inicio
          </Link>
        </div>
      ) : checkingAuth ? (
        <div className="py-24 text-center">
          <Loader2 size={36} className="animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Verificando sesión...</p>
        </div>
      ) : (
        <>
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-800 text-red-200 text-sm flex items-start gap-3">
              <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-sm flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <p>{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 bg-obsidian-900 border border-obsidian-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl">
        {/* SECCIÓN 1: DATOS GENERALES */}
        <div>
          <h2 className="text-lg font-bold text-amber-400 mb-4 pb-2 border-b border-obsidian-700 flex items-center gap-2">
            1. Información General
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Tipo de evento con ABM */}
            <div className="sm:col-span-1">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Tipo de Evento <span className="text-amber-500">*</span>
                </label>
                {/* ABM boton */}
                <button
                  type="button"
                  onClick={() => setModalNuevoTipoOpen(true)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1"
                  title="Dar de alta nuevo tipo de evento"
                >
                  <PlusCircle size={12} /> + Agregar Tipo
                </button>
              </div>
              <select
                required
                value={tipoEventoId}
                onChange={(e) => setTipoEventoId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              >
                {tipos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.tipoevento_descripcion}
                  </option>
                ))}
              </select>
            </div>

            {/* Nombre del evento */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Nombre del Evento <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Festival de Jazz & Blues de Otoño"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Categoría para evento deportivo (varchar 250 libre sin FK) */}
          {esDeportivo && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
                Categoría Deportiva (Campo libre)
              </label>
              <input
                type="text"
                placeholder="Ej. Torneo Relámpago Sub-20, Senior Libre, Exhibición..."
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                maxLength={250}
                className="w-full px-4 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Descripción */}
          <div className="mt-4">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Descripción o Reseña
            </label>
            <textarea
              rows={3}
              placeholder="Detalles del repertorio, programa, invitados o particularidades de la jornada..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-4 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* SECCIÓN 2: UBICACIÓN Y DOMICILIO */}
        <div>
          <h2 className="text-lg font-bold text-amber-400 mb-4 pb-2 border-b border-obsidian-700 flex items-center gap-2">
            2. Lugar y Domicilio
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Nombre del Lugar / Centro Cultural
              </label>
              <input
                type="text"
                placeholder="Ej. Teatro Municipal, Sala Central, Polideportivo..."
                value={nombreLugar}
                onChange={(e) => setNombreLugar(e.target.value)}
                className="w-full px-4 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Partido / Municipio <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. San Isidro, Tigre, Vicente López, CABA..."
                value={partido}
                onChange={(e) => setPartido(e.target.value)}
                className="w-full px-4 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Calle <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Av. del Libertador"
                value={calle}
                onChange={(e) => setCalle(e.target.value)}
                className="w-full px-4 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Número <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. 16138"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="w-full px-4 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Depto / Piso
              </label>
              <input
                type="text"
                placeholder="Ej. Piso 2 / Sala A"
                value={depto}
                onChange={(e) => setDepto(e.target.value)}
                className="w-full px-4 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: FECHAS, HORARIOS Y CUPOS */}
        <div>
          <h2 className="text-lg font-bold text-amber-400 mb-4 pb-2 border-b border-obsidian-700 flex items-center gap-2">
            3. Fechas, Horarios y Capacidad
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Horario de Inicio <span className="text-amber-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={fecInicio}
                onChange={(e) => setFecInicio(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Horario de Finalización <span className="text-amber-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={fecFin}
                onChange={(e) => setFecFin(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Capacidad Máxima (Cupo)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Ej. 150 (0 = sin límite)"
                value={capacidadMaxima}
                onChange={(e) => setCapacidadMaxima(e.target.value)}
                className="w-full px-4 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Configuración de cancelación de asistencia */}
          <div className="mt-5 p-4 rounded-xl bg-obsidian-850 border border-obsidian-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="permite-cancelar-toggle"
                checked={permiteCancelar}
                onChange={(e) => setPermiteCancelar(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 border-obsidian-700"
              />
              <label htmlFor="permite-cancelar-toggle" className="text-xs sm:text-sm font-semibold text-gray-200 cursor-pointer">
                Permitir a los asistentes cancelar su confirmación
              </label>
            </div>

            {permiteCancelar && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">Hasta cuántas horas previas:</span>
                <input
                  type="number"
                  min="0"
                  max="168"
                  value={horasLimiteCancelacion}
                  onChange={(e) => setHorasLimiteCancelacion(e.target.value)}
                  className="w-20 px-2 py-1 bg-obsidian-900 border border-obsidian-700 rounded-lg text-white text-center font-bold"
                />
                <span className="text-gray-400">hs antes</span>
              </div>
            )}
          </div>
        </div>

        {/* SECCIÓN 4: ARTISTAS PARTICIPANTES (DINÁMICO CON BOTÓN +) */}
        <div>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-obsidian-700">
            <div>
              <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                4. Artistas Participantes {esMusical && <span className="text-amber-500 text-xs font-bold uppercase">(Obligatorio)</span>}
              </h2>
              <p className="text-xs text-gray-400">
                Se habilitará uno y se permitirá agregar más a demanda mediante el botón +
              </p>
            </div>
            <button
              type="button"
              onClick={addArtista}
              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} /> Agregar Artista (+)
            </button>
          </div>

          <div className="space-y-4">
            {artistas.map((art, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-obsidian-850 border border-obsidian-700 relative flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:flex-1">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {idx === 0 ? 'Artista Principal / Destacado' : `Artista Participante #${idx + 1}`}
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre del artista, banda o grupo"
                    value={art.nombre_artista}
                    onChange={(e) => updateArtista(idx, 'nombre_artista', e.target.value)}
                    className="w-full px-3.5 py-2 bg-obsidian-900 border border-obsidian-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="w-full sm:w-44">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Horario de inicio
                  </label>
                  <input
                    type="datetime-local"
                    value={art.fec_inicio}
                    onChange={(e) => updateArtista(idx, 'fec_inicio', e.target.value)}
                    className="w-full px-2.5 py-2 bg-obsidian-900 border border-obsidian-700 rounded-lg text-white text-xs"
                  />
                </div>

                <div className="w-full sm:w-44">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Horario de finalización
                  </label>
                  <input
                    type="datetime-local"
                    value={art.fec_fin}
                    onChange={(e) => updateArtista(idx, 'fec_fin', e.target.value)}
                    className="w-full px-2.5 py-2 bg-obsidian-900 border border-obsidian-700 rounded-lg text-white text-xs"
                  />
                </div>

                {artistas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArtista(idx)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-obsidian-900 rounded-lg transition-colors mt-4 sm:mt-0"
                    title="Quitar artista"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* BOTÓN SUBMIT */}
        <div className="pt-6 border-t border-obsidian-700 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-obsidian-950 font-black rounded-xl text-base shadow-amber-glow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Publicando evento...
              </>
            ) : (
              'Publicar Evento en La Red Cultural'
            )}
          </button>
        </div>
      </form>

          {modalNuevoTipoOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-md bg-obsidian-900 border border-obsidian-700 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-2">Nuevo Tipo de Evento (ABM)</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Ingresa el nombre de la nueva categoría cultural para sumarla al desplegable.
                </p>
                <form onSubmit={handleCrearNuevoTipo}>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Fotografía, Danza Contemporánea..."
                    value={nuevoTipoNombre}
                    onChange={(e) => setNuevoTipoNombre(e.target.value)}
                    className="w-full px-4 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 mb-4"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setModalNuevoTipoOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={creandoTipo}
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-obsidian-950 text-xs font-bold shadow-amber-glow"
                    >
                      {creandoTipo ? 'Guardando...' : 'Guardar y Seleccionar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
