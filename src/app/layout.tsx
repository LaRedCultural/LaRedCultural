import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'La Red Cultural (LRC) — Conectando con la Cultura',
  description: 'Plataforma digital para conectar personas con eventos, actividades y expresiones culturales en su comunidad.',
  icons: {
    icon: '/IMG_logo-LRC.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-obsidian-950 text-gray-100 min-h-screen flex flex-col antialiased selection:bg-amber-500 selection:text-obsidian-950">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-obsidian-800/80 bg-obsidian-950 py-8 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} La Red Cultural (LRC). Todos los derechos reservados.</p>
          <p className="mt-1 text-gray-600">Conectando pasiones, arte y comunidad.</p>
        </footer>
      </body>
    </html>
  );
}
