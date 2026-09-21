import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesión para confirmar o cancelar tu asistencia.' }, { status: 401 });
  }

  const eventoId = parseInt(params.id, 10);
  if (isNaN(eventoId)) {
    return NextResponse.json({ error: 'ID de evento inválido' }, { status: 400 });
  }

  try {
    const { accion } = await req.json(); // 'confirmar' o 'cancelar'

    // Obtener datos del evento
    const evRows = await query(
      `SELECT id, nombre, fec_inicio, capacidad_maxima, permite_cancelar, horas_limite_cancelacion
       FROM eventos WHERE id = $1 AND estado_id = 1`,
      [eventoId]
    );

    if (evRows.length === 0) {
      return NextResponse.json({ error: 'El evento no existe o no está activo.' }, { status: 404 });
    }

    const evento = evRows[0];

    // Verificar estado actual de asistencia del usuario
    const asistRows = await query(
      `SELECT id, estado FROM eventos_asistencias WHERE evento_id = $1 AND usr_id = $2`,
      [eventoId, user.id]
    );
    const asistenciaActual = asistRows[0];

    if (accion === 'cancelar') {
      if (!asistenciaActual || asistenciaActual.estado !== 'CONFIRMADO') {
        return NextResponse.json({ error: 'No tienes una asistencia confirmada para este evento.' }, { status: 400 });
      }

      if (!evento.permite_cancelar) {
        return NextResponse.json({ error: 'Este evento no admite cancelación de asistencia.' }, { status: 400 });
      }

      // Validar límite de horas
      const fechaInicio = new Date(evento.fec_inicio).getTime();
      const horasRestantes = (fechaInicio - Date.now()) / (1000 * 60 * 60);

      if (horasRestantes < evento.horas_limite_cancelacion) {
        return NextResponse.json(
          {
            error: `El plazo para cancelar asistencia ha vencido. Se permite cancelar hasta ${evento.horas_limite_cancelacion} horas antes del evento.`,
          },
          { status: 400 }
        );
      }

      // Cancelar asistencia
      await query(
        `UPDATE eventos_asistencias 
         SET estado = 'CANCELADO', fec_cancelacion = NOW() 
         WHERE id = $1`,
        [asistenciaActual.id]
      );

      return NextResponse.json({ success: true, message: 'Tu asistencia ha sido cancelada correctamente.' });
    } else {
      // Acción: 'confirmar'
      if (asistenciaActual && asistenciaActual.estado === 'CONFIRMADO') {
        return NextResponse.json({ error: 'Ya tienes confirmada tu asistencia a este evento.' }, { status: 400 });
      }

      // Verificar cupo disponible
      if (evento.capacidad_maxima > 0) {
        const countRows = await query(
          `SELECT COUNT(*)::int as total FROM eventos_asistencias WHERE evento_id = $1 AND estado = 'CONFIRMADO'`,
          [eventoId]
        );
        const confirmados = countRows[0]?.total || 0;
        if (confirmados >= evento.capacidad_maxima) {
          return NextResponse.json({ error: 'El cupo de este evento se encuentra agotado.' }, { status: 400 });
        }
      }

      if (asistenciaActual) {
        // Reactivar
        await query(
          `UPDATE eventos_asistencias 
           SET estado = 'CONFIRMADO', fec_confirmacion = NOW(), fec_cancelacion = NULL 
           WHERE id = $1`,
          [asistenciaActual.id]
        );
      } else {
        // Insertar nuevo registro
        await query(
          `INSERT INTO eventos_asistencias (evento_id, usr_id, estado, fec_confirmacion)
           VALUES ($1, $2, 'CONFIRMADO', NOW())`,
          [eventoId, user.id]
        );
      }

      return NextResponse.json({ success: true, message: '¡Asistencia confirmada con éxito!' });
    }
  } catch (error: any) {
    console.error('Error al gestionar asistencia:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
