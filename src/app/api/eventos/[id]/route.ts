import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// Obtener un evento específico con todos sus datos completos para edición
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const eventoId = parseInt(params.id, 10);
  if (isNaN(eventoId)) {
    return NextResponse.json({ error: 'ID de evento inválido' }, { status: 400 });
  }

  try {
    const rows = await query(
      `SELECT 
        e.id,
        e.nombre,
        e.descripcion,
        e.categoria,
        e.fec_inicio,
        e.fec_fin,
        e.capacidad_maxima,
        e.permite_cancelar,
        e.horas_limite_cancelacion,
        e.estado_id,
        e.creador_usr_id,
        e.tipoevento_id,
        t.tipoevento_descripcion AS tipo_nombre,
        l.id AS lugar_id,
        l.lugarevento_nombre AS lugar_nombre,
        d.lugareventodom_calle AS calle,
        d.lugareventodom_numero AS numero,
        d.lugareventodom_puerta AS depto,
        d.lugareventodom_partido AS partido,
        d.lugareventodom_codigopostal AS codigopostal
       FROM eventos e
       LEFT JOIN tipos_eventos t ON e.tipoevento_id = t.id
       LEFT JOIN lugares_eventos l ON e.lugarevento_id = l.id
       LEFT JOIN lugares_eventos_domicilios d ON d.lugarevento_id = l.id
       WHERE e.id = $1`,
      [eventoId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    const evento = rows[0];

    // Cargar artistas participantes
    const artistas = await query(
      `SELECT id, nombre_artista, es_principal, fec_inicio, fec_fin
       FROM eventos_artistas
       WHERE evento_id = $1
       ORDER BY es_principal DESC, id ASC`,
      [eventoId]
    );

    return NextResponse.json({
      evento: {
        ...evento,
        artistas: artistas || [],
      },
    });
  } catch (error: any) {
    console.error('Error al obtener evento:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Actualizar datos de un evento existente (solo creador)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesión para editar eventos.' }, { status: 401 });
  }

  const eventoId = parseInt(params.id, 10);
  if (isNaN(eventoId)) {
    return NextResponse.json({ error: 'ID de evento inválido' }, { status: 400 });
  }

  try {
    // 1. Verificar que el evento exista y pertenezca al usuario
    const currentRows = await query(
      `SELECT id, creador_usr_id, lugarevento_id FROM eventos WHERE id = $1`,
      [eventoId]
    );

    if (currentRows.length === 0) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    const currentEvent = currentRows[0];
    if (currentEvent.creador_usr_id !== user.id) {
      return NextResponse.json({ error: 'No tienes permisos para editar este evento.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      tipoevento_id,
      nombre,
      descripcion,
      nombre_lugar,
      calle,
      numero,
      depto,
      partido,
      fec_inicio,
      fec_fin,
      capacidad_maxima,
      categoria,
      permite_cancelar,
      horas_limite_cancelacion,
      artistas,
    } = body;

    if (!tipoevento_id || !nombre || !calle || !numero || !partido || !fec_inicio || !fec_fin) {
      return NextResponse.json(
        { error: 'Campos obligatorios incompletos: Tipo, Nombre, Calle, Número, Partido, Fecha de inicio y fin.' },
        { status: 400 }
      );
    }

    // 2. Actualizar datos en eventos
    await query(
      `UPDATE eventos SET
        tipoevento_id = $1,
        nombre = $2,
        descripcion = $3,
        categoria = $4,
        fec_inicio = $5,
        fec_fin = $6,
        capacidad_maxima = $7,
        permite_cancelar = $8,
        horas_limite_cancelacion = $9
       WHERE id = $10`,
      [
        parseInt(tipoevento_id, 10),
        nombre.trim(),
        descripcion?.trim() || null,
        categoria?.trim() || null,
        new Date(fec_inicio).toISOString(),
        new Date(fec_fin).toISOString(),
        capacidad_maxima ? parseInt(capacidad_maxima, 10) : 0,
        Boolean(permite_cancelar),
        horas_limite_cancelacion ? parseInt(horas_limite_cancelacion, 10) : 0,
        eventoId,
      ]
    );

    // 3. Actualizar lugar y domicilio
    const lugarId = currentEvent.lugarevento_id;
    if (lugarId) {
      if (nombre_lugar) {
        await query(
          `UPDATE lugares_eventos SET lugarevento_nombre = $1 WHERE id = $2`,
          [nombre_lugar.trim(), lugarId]
        );
      }

      await query(
        `UPDATE lugares_eventos_domicilios SET
          lugareventodom_calle = $1,
          lugareventodom_numero = $2,
          lugareventodom_puerta = $3,
          lugareventodom_partido = $4
         WHERE lugarevento_id = $5`,
        [calle.trim(), numero.trim(), depto?.trim() || null, partido.trim(), lugarId]
      );
    }

    // 4. Actualizar artistas: borrar existentes y volver a insertar
    await query(`DELETE FROM eventos_artistas WHERE evento_id = $1`, [eventoId]);

    if (Array.isArray(artistas) && artistas.length > 0) {
      for (let i = 0; i < artistas.length; i++) {
        const art = artistas[i];
        if (art.nombre_artista?.trim()) {
          await query(
            `INSERT INTO eventos_artistas (
              evento_id, nombre_artista, es_principal, fec_inicio, fec_fin
            ) VALUES ($1, $2, $3, $4, $5)`,
            [
              eventoId,
              art.nombre_artista.trim(),
              i === 0, // El primero es el principal
              art.fec_inicio ? new Date(art.fec_inicio).toISOString() : null,
              art.fec_fin ? new Date(art.fec_fin).toISOString() : null,
            ]
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Evento modificado y guardado con éxito.',
    });
  } catch (error: any) {
    console.error('Error al actualizar evento:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
