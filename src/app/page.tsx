'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Sparkles, CheckCircle, AlertCircle, Loader2, Play, 
  ArrowRight, ShieldCheck, Mail, Lock, Phone, MapPin, User, ChevronDown
} from 'lucide-react';
import EventCard from '@/components/EventCard';
import EventDetailModal from '@/components/EventDetailModal';
import LoginModal from '@/components/LoginModal';
import { Evento } from '@/types/database';

export default function LandingPage() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [demoEvents, setDemoEvents] = useState<Evento[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Formulario de registro
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmarPassword: '',
    celular: '',
    codigoPostal: '',
  });

  const [regLoading, setRegLoading] = useState(false);
  const [regSuccessMsg, setRegSuccessMsg] = useState('');
  const [regErrorMsg, setRegErrorMsg] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Cargar eventos destacados para la preview de la landing
    fetch('/api/eventos')
      .then((res) => res.json())
      .then((data) => {
        if (data.eventos) setDemoEvents(data.eventos.slice(0, 4));
      })
      .catch((e) => console.error(e));
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegSuccessMsg('');
    setRegErrorMsg('');

    if (formData.password !== formData.confirmarPassword) {
      setRegErrorMsg('Las contraseñas no coinciden.');
      setRegLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setRegErrorMsg(data.error || 'Error al completar el registro.');
      } else {
        setRegSuccessMsg(data.message);
        setFormData({
          nombre: '',
          apellido: '',
          email: '',
          password: '',
          confirmarPassword: '',
          celular: '',
          codigoPostal: '',
        });
      }
    } catch (err: any) {
      setRegErrorMsg('Error al conectar con el servidor.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-white flex flex-col">
      {/* 1. SECCIÓN PRINCIPAL: HERO CON VIDEO AL FRENTE DE LA PANTALLA Y BOTONES DEBAJO */}
      <section className="relative w-full pt-28 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center bg-gradient-to-b from-obsidian-900 via-obsidian-950 to-obsidian-950 border-b border-obsidian-850">
        
        {/* Cabecera introductoria */}
        <div className="max-w-4xl mx-auto text-center mb-8 animate-in fade-in duration-500">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 shadow-amber-glow">
            <Sparkles size={16} /> Próximamente la mayor comunidad cultural
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            CONECTA CON LA <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-autumn-copper">CULTURA</span>
          </h1>

          <p className="mt-3 text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            Música, artes plásticas, teatro, deporte y expresiones vivas en un solo lugar. Descubre qué está pasando cerca de ti y sé parte de la comunidad.
          </p>
        </div>

        {/* Reproductor de Video en Primer Plano (Frontal) */}
        <div className="w-full max-w-4xl mx-auto relative rounded-3xl overflow-hidden border-2 border-amber-500/30 bg-obsidian-900 shadow-[0_0_50px_rgba(245,158,11,0.25)] aspect-video">
          {/* Imagen de carga / Poster mientras carga el video */}
          <div 
            className={`absolute inset-0 transition-opacity duration-700 z-10 ${
              videoLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <div className="relative w-full h-full bg-obsidian-900 flex flex-col items-center justify-center p-6">
              <div className="relative w-44 h-44 sm:w-60 sm:h-60 animate-pulse">
                <Image
                  src="/IMG_logo-LRC.png"
                  alt="La Red Cultural Poster"
                  fill
                  priority
                  className="object-contain filter drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]"
                />
              </div>
              <div className="mt-4 flex items-center gap-2 text-amber-500 text-sm font-semibold tracking-wider">
                <Loader2 className="animate-spin" size={18} />
                <span>Cargando video...</span>
              </div>
            </div>
          </div>

          {/* Video frontal visible */}
          <video
            ref={videoRef}
            src="/VID_proximamente.mp4"
            autoPlay
            loop
            muted
            playsInline
            controls
            onLoadedData={() => setVideoLoaded(true)}
            className="w-full h-full object-cover relative z-0"
          />
        </div>

        {/* Botones solicitados: inmediatamente debajo del video */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
          <a
            href="#registro-section"
            className="w-full sm:w-auto flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-obsidian-950 font-extrabold text-base shadow-amber-glow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-center"
          >
            Registrate gratis <ArrowRight size={18} />
          </a>

          <Link
            href="/explorar"
            className="w-full sm:w-auto flex-1 px-8 py-4 rounded-xl bg-obsidian-900 hover:bg-obsidian-800 border border-obsidian-700 hover:border-amber-500/50 text-white font-bold text-base backdrop-blur transition-all flex items-center justify-center gap-2 text-center"
          >
            Explorar Cartelera
          </Link>
        </div>

        <a 
          href="#registro-section" 
          className="inline-block mt-8 text-gray-500 hover:text-amber-400 transition-colors animate-bounce"
          aria-label="Ir a registro"
        >
          <ChevronDown size={28} />
        </a>
      </section>

      {/* 2. SECCIÓN INFERIOR DE REGISTRO (DEBAJO DEL VIDEO PRINCIPAL SEGÚN REQUERIMIENTO) */}
      <section id="registro-section" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-obsidian-900 border-t border-obsidian-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck size={14} /> Registro de Miembros
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Súmate a La Red Cultural
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
              Crea tu usuario para confirmar asistencias, publicar tus propios eventos y recibir recomendaciones personalizadas según tu zona e intereses.
            </p>
          </div>

          <div className="bg-obsidian-850/90 border border-obsidian-700 rounded-3xl p-6 sm:p-10 shadow-card-dark backdrop-blur-xl relative overflow-hidden">
            {/* Aviso reglamentario de 24 horas */}
            <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start gap-3">
              <Sparkles size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300">Validación de Correo:</strong> Te enviaremos un email de activación. Tendrás <strong>24 horas</strong> para confirmarlo antes de tu primer ingreso.
              </div>
            </div>

            {regSuccessMsg && (
              <div className="mb-6 p-5 rounded-2xl bg-emerald-950/60 border border-emerald-700 text-emerald-200 text-sm flex items-start gap-3 animate-in fade-in">
                <CheckCircle size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-300">¡Registro enviado con éxito!</h4>
                  <p className="mt-1 leading-relaxed">{regSuccessMsg}</p>
                </div>
              </div>
            )}

            {regErrorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-800 text-red-200 text-sm flex items-start gap-3 animate-in fade-in">
                <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <p>{regErrorMsg}</p>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Nombre */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    Nombre <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-obsidian-900 border border-obsidian-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                    />
                  </div>
                </div>

                {/* Apellido */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    Apellido <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Pérez"
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-obsidian-900 border border-obsidian-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Email (usuario para ingresar) */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Email (será tu usuario de ingreso) <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                  <input
                    type="email"
                    required
                    placeholder="tunombre@correo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-obsidian-900 border border-obsidian-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Contraseña */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    Contraseña <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-obsidian-900 border border-obsidian-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                    />
                  </div>
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    Confirmar Contraseña <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.confirmarPassword}
                      onChange={(e) => setFormData({ ...formData, confirmarPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-obsidian-900 border border-obsidian-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Número de celular */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    Número de Celular
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                    <input
                      type="tel"
                      placeholder="+54 11 1234-5678"
                      value={formData.celular}
                      onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-obsidian-900 border border-obsidian-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                    />
                  </div>
                </div>

                {/* Código Postal */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    Código Postal (para eventos cercanos)
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Ej. 1642"
                      value={formData.codigoPostal}
                      onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-obsidian-900 border border-obsidian-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-obsidian-950 font-black py-4 rounded-xl text-base shadow-amber-glow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {regLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Registrando usuario...
                  </>
                ) : (
                  'Crear mi cuenta en La Red Cultural'
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-400">
              ¿Ya estás registrado y confirmaste tu email?{' '}
              <button
                onClick={() => setLoginModalOpen(true)}
                className="text-amber-400 hover:underline font-bold"
              >
                Inicia sesión aquí
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VISTA PREVIA DE EVENTOS EN CARTELERA (NETFLIX STYLE) */}
      {demoEvents.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Próximos en Cartelera
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Eventos culturales más cercanos organizados en nuestra red
              </p>
            </div>
            <Link
              href="/explorar"
              className="text-amber-400 hover:text-amber-300 font-bold text-sm flex items-center gap-1 hover:underline"
            >
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoEvents.map((evento) => (
              <EventCard
                key={evento.id}
                evento={evento}
                onSelect={(ev) => setSelectedEvent(ev)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Modal de Detalle */}
      <EventDetailModal
        evento={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onAttendanceChanged={() => {
          fetch('/api/eventos')
            .then((r) => r.json())
            .then((d) => setDemoEvents(d.eventos.slice(0, 4)));
        }}
        isAuthenticated={false}
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
          setLoginModalOpen(false);
          window.location.href = '/explorar';
        }}
      />
    </div>
  );
}
