import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const intereses = await query(
      `SELECT t.id, t.tipoevento_descripcion 
       FROM usuarios_intereses ui
       INNER JOIN tipos_eventos t ON ui.tipoevento_id = t.id
       WHERE ui.usr_id = $1`,
      [user.id]
    );

    return NextResponse.json({
      user,
      intereses: intereses.map((i: any) => i.id),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const { nombre, apellido, celular, codigoPostal, intereses } = await req.json();

    // Actualizar datos personales
    await query(
      `UPDATE usuarios SET 
        usr_nombre = $1,
        usr_apellido = $2,
        usr_celular = $3,
        usr_codigopostal = $4,
        usr_fec_ult_mod = NOW()
       WHERE id = $5`,
      [nombre?.trim(), apellido?.trim(), celular?.trim(), codigoPostal?.trim(), user.id]
    );

    // Actualizar intereses
    if (Array.isArray(intereses)) {
      await query(`DELETE FROM usuarios_intereses WHERE usr_id = $1`, [user.id]);
      for (const tipoId of intereses) {
        await query(
          `INSERT INTO usuarios_intereses (usr_id, tipoevento_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [user.id, tipoId]
        );
      }
    }

    return NextResponse.json({ success: true, message: 'Perfil e intereses actualizados con éxito.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
