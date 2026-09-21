import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { sendCampaignEmail } from '@/lib/emailService';

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
    // Obtener datos del evento y su ubicación/tipo
    const evRows = await query(
      `SELECT 
        e.id, e.nombre, e.tipoevento_id, e.creador_usr_id, e.fec_inicio,
        t.tipoevento_descripcion as tipo,
        l.lugarevento_nombre as lugar,
        d.lugareventodom_codigopostal as codigopostal
       FROM eventos e
       LEFT JOIN tipos_eventos t ON e.tipoevento_id = t.id
       LEFT JOIN lugares_eventos l ON e.lugarevento_id = l.id
       LEFT JOIN lugares_eventos_domicilios d ON d.lugarevento_id = l.id
       WHERE e.id = $1`,
      [eventoId]
    );

    if (evRows.length === 0) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    const evento = evRows[0];
    if (evento.creador_usr_id !== user.id) {
      return NextResponse.json({ error: 'No tienes autorización para publicitar este evento.' }, { status: 403 });
    }

    // Segmentación de usuarios calificados según las 3 condiciones:
    // 1. Interés del mismo tipo
    // 2. Asistencias previas a eventos del mismo tipo
    // 3. Coincidencia de código postal
    // Usuarios activos (usr_estado_id = 1) y distintos al creador
    const targetUsers = await query(
      `SELECT DISTINCT u.id, u.usr_nombre, u.usr_id as email
       FROM usuarios u
       WHERE u.usr_estado_id = 1 
         AND u.id != $1
         AND (
           -- Condición 1: hayan indicado dentro de sus intereses eventos del mismo tipo
           EXISTS (
             SELECT 1 FROM usuarios_intereses ui 
             WHERE ui.usr_id = u.id AND ui.tipoevento_id = $2
           )
           OR
           -- Condición 2: hayan asistido previamente a eventos del mismo tipo
           EXISTS (
             SELECT 1 FROM eventos_asistencias ea
             INNER JOIN eventos ev ON ea.evento_id = ev.id
             WHERE ea.usr_id = u.id AND ev.tipoevento_id = $2 AND ea.estado = 'CONFIRMADO'
           )
           OR
           -- Condición 3: el código postal coincida con el del evento
           (
             $3 IS NOT NULL AND $3 != '' AND u.usr_codigopostal = $3
           )
         )`,
      [user.id, evento.tipoevento_id, evento.codigopostal || '']
    );

    const fechaStr = new Date(evento.fec_inicio).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });

    let emailsEnviados = 0;
    for (const target of targetUsers) {
      await sendCampaignEmail(target.email, target.usr_nombre, {
        id: evento.id,
        nombre: evento.nombre,
        fecha: fechaStr,
        lugar: evento.lugar || 'Lugar por confirmar',
        tipo: evento.tipo || 'Evento Cultural',
      });
      emailsEnviados++;
    }

    return NextResponse.json({
      success: true,
      destinatariosCalificados: targetUsers.length,
      emailsEnviados,
      message: `Campaña lanzada con éxito a ${emailsEnviados} usuarios calificados (segmentados por interés, historial y código postal).`,
    });
  } catch (error: any) {
    console.error('Error al lanzar campaña:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
