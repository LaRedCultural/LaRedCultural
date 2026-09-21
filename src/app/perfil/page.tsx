'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, Mail, Phone, MapPin, Sparkles, CheckCircle2, 
  AlertCircle, Loader2, Heart 
} from 'lucide-react';
import { TipoEvento } from '@/types/database';

export default function PerfilPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');

  const [tiposDisponibles, setTiposDisponibles] = useState<TipoEvento[]>([]);
  const [interesesSeleccionados, setInteresesSeleccionados] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Cargar tipos
    fetch('/api/tipos-eventos')
      .then((r) => r.json())
      .then((d) => {
        if (d.tipos) setTiposDisponibles(d.tipos);
      });

    // Cargar datos actuales del perfil
    fetch('/api/perfil')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setCurrentUser(d.user);
          setNombre(d.user.usr_nombre || '');
          setApellido(d.user.usr_apellido || '');
          setEmail(d.user.usr_id || '');
          setCelular(d.user.usr_celular || '');
          setCodigoPostal(d.user.usr_codigopostal || '');
        }
        if (d.intereses) {
          setInteresesSeleccionados(d.intereses);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const toggleInteres = (tipoId: number) => {
    if (interesesSeleccionados.includes(tipoId)) {
      setInteresesSeleccionados(interesesSeleccionados.filter((id) => id !== tipoId));
    } else {
      setInteresesSeleccionados([...interesesSeleccionados, tipoId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          apellido,
          celular,
          codigoPostal,
          intereses: interesesSeleccionados,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || 'Perfil actualizado con éxito');
      } else {
        setErrorMsg(data.error || 'Error al guardar los cambios.');
      }
    } catch (err) {
      setErrorMsg('Error de red al actualizar perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian-950 pt-36 text-center">
        <Loader2 size={36} className="animate-spin text-amber-500 mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Cargando tus datos de perfil...</p>
      </div>
    );
  }

  if (!currentUser && !loading) {
    return (
      <div className="min-h-screen bg-obsidian-950 pt-28 pb-20 px-4 max-w-4xl mx-auto">
        <div className="text-center py-20 bg-obsidian-900 border border-obsidian-800 rounded-3xl p-8">
          <p className="text-gray-300 mb-4">Debes iniciar sesión para ver y editar tus datos de perfil e intereses.</p>
          <Link href="/" className="px-6 py-2.5 rounded-xl bg-amber-500 text-obsidian-950 font-bold text-sm shadow-amber-glow">
            Ir al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian-950 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="mb-10 pb-6 border-b border-obsidian-800">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
          <Sparkles size={14} /> Ajustes de Usuario
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Datos Personales e Intereses
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Personaliza tu perfil y selecciona los temas culturales que te apasionan para recibir recomendaciones a tu medida.
        </p>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-sm flex items-start gap-3">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <p>{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-800 text-red-200 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <p>{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-obsidian-900 border border-obsidian-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl">
        {/* Datos Personales */}
        <div>
          <h2 className="text-lg font-bold text-amber-400 mb-4 pb-2 border-b border-obsidian-700 flex items-center gap-2">
            <User size={18} /> Datos de Contacto
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Nombre
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Apellido
              </label>
              <input
                type="text"
                required
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="w-full px-4 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Email (Usuario)
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-4 py-2.5 bg-obsidian-850/50 border border-obsidian-800 rounded-xl text-gray-400 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Celular
              </label>
              <input
                type="tel"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                placeholder="+54 11..."
                className="w-full px-4 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Código Postal
              </label>
              <input
                type="text"
                value={codigoPostal}
                onChange={(e) => setCodigoPostal(e.target.value)}
                placeholder="Ej. 1642"
                className="w-full px-4 py-2.5 bg-obsidian-850 border border-obsidian-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Intereses Culturales */}
        <div>
          <h2 className="text-lg font-bold text-amber-400 mb-2 pb-2 border-b border-obsidian-700 flex items-center gap-2">
            <Heart size={18} /> Mis Intereses Culturales
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Selecciona las categorías que te interesan para que los organizadores puedan notificarte de eventos compatibles en tu zona.
          </p>

          <div className="flex flex-wrap gap-3">
            {tiposDisponibles.map((tipo) => {
              const selected = interesesSeleccionados.includes(tipo.id);
              return (
                <button
                  type="button"
                  key={tipo.id}
                  onClick={() => toggleInteres(tipo.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                    selected
                      ? 'bg-amber-500 text-obsidian-950 shadow-amber-glow scale-105'
                      : 'bg-obsidian-850 hover:bg-obsidian-800 text-gray-300 border border-obsidian-700'
                  }`}
                >
                  <span>{tipo.tipoevento_descripcion}</span>
                  {selected && <CheckCircle2 size={14} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-6 border-t border-obsidian-700 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-obsidian-950 font-extrabold rounded-xl text-sm shadow-amber-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}
