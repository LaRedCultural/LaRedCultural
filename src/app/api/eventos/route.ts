import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tipoId = searchParams.get('tipo');
  const search = searchParams.get('q');
  const partido = searchParams.get('partido');
  const creadorId = searchParams.get('creador');
  const user = await getCurrentUser();

  try {
    let sql = `
      SELECT 
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
        t.tipoevento_descripcion AS tipo_nombre,
        t.id AS tipoevento_id,
        l.lugarevento_nombre AS lugar_nombre,
        d.lugareventodom_calle AS calle,
        d.lugareventodom_numero AS numero,
        d.lugareventodom_piso AS piso,
        d.lugareventodom_puerta AS puerta,
        d.lugareventodom_partido AS partido,
        d.lugareventodom_localidad AS localidad,
        d.lugareventodom_codigopostal AS codigopostal,
        (
          SELECT nombre_artista 
          FROM eventos_artistas 
          WHERE evento_id = e.id 
          ORDER BY es_principal DESC, id ASC 
          LIMIT 1
        ) AS artista_principal,
        (
          SELECT COUNT(*)::int 
          FROM eventos_asistencias 
          WHERE evento_id = e.id AND estado = 'CONFIRMADO'
        ) AS asistentes_confirmados
    `;

    if (user) {
      sql += `,
        EXISTS (
          SELECT 1 FROM eventos_asistencias 
          WHERE evento_id = e.id AND usr_id = ${user.id} AND estado = 'CONFIRMADO'
        ) AS asiste_usuario_actual
      `;
    } else {
      sql += `, false AS asiste_usuario_actual`;
    }

    sql += `
      FROM eventos e
      LEFT JOIN tipos_eventos t ON e.tipoevento_id = t.id
      LEFT JOIN lugares_eventos l ON e.lugarevento_id = l.id
      LEFT JOIN lugares_eventos_domicilios d ON d.lugarevento_id = l.id
      WHERE e.estado_id = 1
    `;

    const params: any[] = [];
    let paramIdx = 1;

    if (tipoId) {
      sql += ` AND e.tipoevento_id = $${paramIdx++}`;
      params.push(parseInt(tipoId, 10));
    }

    if (creadorId) {
      sql += ` AND e.creador_usr_id = $${paramIdx++}`;
      params.push(parseInt(creadorId, 10));
    }

    if (partido) {
      sql += ` AND LOWER(d.lugareventodom_partido) LIKE $${paramIdx++}`;
      params.push(`%${partido.toLowerCase()}%`);
    }

    if (search) {
      sql += ` AND (
        LOWER(e.nombre) LIKE $${paramIdx} OR 
        LOWER(e.descripcion) LIKE $${paramIdx} OR 
        LOWER(l.lugarevento_nombre) LIKE $${paramIdx}
      )`;
      params.push(`%${search.toLowerCase()}%`);
      paramIdx++;
    }

    // "ordenados de forma que en la parte superior de la grilla se vean los más cercanos a realizarse"
    sql += ` ORDER BY e.fec_inicio ASC`;

    const eventos = await query(sql, params);

    // Formatear disponibilidad y traer artistas de cada evento
    const formatted = await Promise.all(
      eventos.map(async (ev: any) => {
        const cupoDisponible =
          ev.capacidad_maxima > 0 && ev.asistentes_confirmados >= ev.capacidad_maxima
            ? 'Agotado'
            : 'Hay lugar';

        const direccionCompleta = [
          ev.calle ? `${ev.calle} ${ev.numero || ''}` : '',
          ev.piso ? `Piso ${ev.piso} ${ev.puerta || ''}` : '',
          ev.partido ? `(${ev.partido})` : '',
        ]
          .filter(Boolean)
          .join(', ');

        const artistas = await query(
          `SELECT id, nombre_artista, es_principal, fec_inicio, fec_fin
           FROM eventos_artistas 
           WHERE evento_id = $1 
           ORDER BY es_principal DESC, id ASC`,
          [ev.id]
        );

        return {
          ...ev,
          cupo_disponible: cupoDisponible,
          direccion_completa: direccionCompleta,
          artistas,
        };
      })
    );

    return NextResponse.json({ eventos: formatted });
  } catch (error: any) {
    console.error('Error al obtener eventos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Crear un evento (Panel de Creadores)
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesión para crear eventos.' }, { status: 401 });
  }

  try {
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

    // Validaciones según el documento:
    if (!tipoevento_id || !nombre || !calle || !numero || !partido || !fec_inicio || !fec_fin) {
      return NextResponse.json(
        { error: 'Campos obligatorios incompletos: Tipo, Nombre, Calle, Número, Partido, Fecha de inicio y fin.' },
        { status: 400 }
      );
    }

    // Validar tipo de evento musical: Artistas obligatorios
    const tipoRows = await query(`SELECT tipoevento_descripcion FROM tipos_eventos WHERE id = $1`, [tipoevento_id]);
    const tipoNombre = tipoRows[0]?.tipoevento_descripcion || '';
    if (tipoNombre.toLowerCase().includes('musical') && (!artistas || artistas.length === 0)) {
      return NextResponse.json(
        { error: 'Para eventos de tipo Musical es obligatorio indicar al menos un artista participante.' },
        { status: 400 }
      );
    }

    // 1. Crear o asociar Lugar y Domicilio
    const lugarRes = await query(
      `INSERT INTO lugares_eventos (lugarevento_nombre, lugarevento_estado_id)
       VALUES ($1, 1) RETURNING id`,
      [nombre_lugar?.trim() || 'Lugar por definir']
    );
    const lugarId = lugarRes[0].id;

    await query(
      `INSERT INTO lugares_eventos_domicilios (
        lugarevento_id, lugareventodom_calle, lugareventodom_numero, 
        lugareventodom_puerta, lugareventodom_partido, lugareventodom_estado_id
      ) VALUES ($1, $2, $3, $4, $5, 1)`,
      [lugarId, calle.trim(), numero.trim(), depto?.trim() || null, partido.trim()]
    );

    // 2. Asociar el usuario creador al lugar
    await query(
      `INSERT INTO lugares_eventos_usuarios (lugarevento_id, usr_id, vinculo_id)
       VALUES ($1, $2, 3)`, // 3 = ORGANIZADOR
      [lugarId, user.id]
    );

    // 3. Crear el Evento
    const evRes = await query(
      `INSERT INTO eventos (
        creador_usr_id, tipoevento_id, lugarevento_id, nombre, descripcion,
        categoria, fec_inicio, fec_fin, capacidad_maxima, permite_cancelar,
        horas_limite_cancelacion, estado_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 1)
      RETURNING id`,
      [
        user.id,
        parseInt(tipoevento_id, 10),
        lugarId,
        nombre.trim(),
        descripcion?.trim() || null,
        categoria?.trim() || null,
        new Date(fec_inicio).toISOString(),
        new Date(fec_fin).toISOString(),
        capacidad_maxima ? parseInt(capacidad_maxima, 10) : 0,
        Boolean(permite_cancelar),
        horas_limite_cancelacion ? parseInt(horas_limite_cancelacion, 10) : 0,
      ]
    );

    const eventoId = evRes[0].id;

    // 4. Insertar artistas participantes si los hay
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
              i === 0, // El primero es destacado
              art.fec_inicio ? new Date(art.fec_inicio).toISOString() : null,
              art.fec_fin ? new Date(art.fec_fin).toISOString() : null,
            ]
          );
        }
      }
    }

    return NextResponse.json({ success: true, evento_id: eventoId });
  } catch (error: any) {
    console.error('Error al crear evento:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
