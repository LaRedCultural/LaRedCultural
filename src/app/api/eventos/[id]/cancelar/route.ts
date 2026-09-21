import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { sendEventCancellationEmail } from '@/lib/emailService';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
  }

  const eventoId = parseInt(params.id, 10);
  if (isNaN(eventoId)) {
    return NextResponse.json({ error: 'ID de evento inválido' }, { status: 400 });
  }

  try {
    // Verificar que el evento exista y pertenezca al usuario logueado
    const evRows = await query(
      `SELECT id, nombre, fec_inicio, creador_usr_id, estado_id 
       FROM eventos WHERE id = $1`,
      [eventoId]
    );

    if (evRows.length === 0) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    const evento = evRows[0];
    if (evento.creador_usr_id !== user.id) {
      return NextResponse.json({ error: 'No tienes permiso para cancelar este evento.' }, { status: 403 });
    }

    if (evento.estado_id === 4) {
      return NextResponse.json({ error: 'El evento ya se encuentra cancelado.' }, { status: 400 });
    }

    // Cambiar estado a 4 (CANCELADO)
    await query(`UPDATE eventos SET estado_id = 4 WHERE id = $1`, [eventoId]);

    // Obtener la lista de usuarios asistentes confirmados
    const asistentes = await query(
      `SELECT u.usr_nombre, u.usr_id as email
       FROM eventos_asistencias a
       INNER JOIN usuarios u ON a.usr_id = u.id
       WHERE a.evento_id = $1 AND a.estado = 'CONFIRMADO'`,
      [eventoId]
    );

    const fechaFormateada = new Date(evento.fec_inicio).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Enviar correo masivo a todos los asistentes confirmados
    let notificados = 0;
    for (const asist of asistentes) {
      await sendEventCancellationEmail(asist.email, asist.usr_nombre, evento.nombre, fechaFormateada);
      notificados++;
    }

    return NextResponse.json({
      success: true,
      message: `El evento ha sido cancelado con éxito. Se enviaron ${notificados} notificaciones por correo a los asistentes confirmados.`,
      notificados,
    });
  } catch (error: any) {
    console.error('Error al cancelar evento:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
