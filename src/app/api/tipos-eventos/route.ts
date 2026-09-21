import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const rows = await query(
      `SELECT id, tipoevento_descripcion, tipoevento_estado_id 
       FROM tipos_eventos 
       WHERE tipoevento_estado_id = 1 
       ORDER BY tipoevento_descripcion ASC`
    );
    return NextResponse.json({ tipos: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ABM: Permitir dar de alta un nuevo tipo de evento
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { descripcion } = await req.json();
    if (!descripcion || !descripcion.trim()) {
      return NextResponse.json({ error: 'La descripción es obligatoria' }, { status: 400 });
    }

    const rows = await query(
      `INSERT INTO tipos_eventos (tipoevento_descripcion, tipoevento_estado_id)
       VALUES ($1, 1) RETURNING id, tipoevento_descripcion`,
      [descripcion.trim()]
    );

    return NextResponse.json({ success: true, tipo: rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
