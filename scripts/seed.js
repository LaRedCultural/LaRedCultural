const { Pool } = require('pg');

async function seedData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:YUF3m4rdvwB2WLBO@db.zyhltmxgodkjesgtmjix.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  try {
    console.log('Seeding demo places and events...');

    // 1. Crear un usuario de prueba creador
    const usrRes = await client.query(`
      INSERT INTO usuarios (usr_id, usr_nombre, usr_apellido, usr_pass, usr_celular, usr_codigopostal, usr_estado_id)
      VALUES ('admin@laredcultural.com', 'Administrador', 'LRC', 'admin123', '+54 11 4444-5555', '1642', 1)
      ON CONFLICT (usr_id) DO UPDATE SET usr_nombre = EXCLUDED.usr_nombre
      RETURNING id;
    `);
    const adminId = usrRes.rows[0].id;

    // 2. Lugares y Domicilios
    const lugares = [
      {
        nombre: 'Centro Cultural San Martín',
        calle: 'Sarmiento', numero: '1551', partido: 'Comuna 1', localidad: 'CABA', cp: '1042'
      },
      {
        nombre: 'Teatro Colón',
        calle: 'Cerrito', numero: '628', partido: 'Comuna 1', localidad: 'CABA', cp: '1010'
      },
      {
        nombre: 'Usina del Arte',
        calle: 'Agustín R. Caffarena', numero: '1', partido: 'La Boca', localidad: 'CABA', cp: '1157'
      },
      {
        nombre: 'Centro Cultural de San Isidro',
        calle: 'Av. del Libertador', numero: '16138', partido: 'San Isidro', localidad: 'San Isidro', cp: '1642'
      },
      {
        nombre: 'Polideportivo Tigre Cultural',
        calle: 'Av. Cazón', numero: '1200', partido: 'Tigre', localidad: 'Tigre', cp: '1648'
      }
    ];

    const lugarIds = [];
    for (const l of lugares) {
      const lRes = await client.query(
        `INSERT INTO lugares_eventos (lugarevento_nombre, lugarevento_estado_id) VALUES ($1, 1) RETURNING id`,
        [l.nombre]
      );
      const lid = lRes.rows[0].id;
      lugarIds.push(lid);

      await client.query(`
        INSERT INTO lugares_eventos_domicilios 
        (lugarevento_id, lugareventodom_partido, lugareventodom_localidad, lugareventodom_codigopostal, lugareventodom_calle, lugareventodom_numero, lugareventodom_estado_id)
        VALUES ($1, $2, $3, $4, $5, $6, 1)
      `, [lid, l.partido, l.localidad, l.cp, l.calle, l.numero]);
    }

    // 3. Tipos de eventos
    const tipos = await client.query(`SELECT id, tipoevento_descripcion FROM tipos_eventos`);
    const tipoMap = {};
    tipos.rows.forEach(t => { tipoMap[t.tipoevento_descripcion] = t.id; });

    // 4. Crear Eventos
    const demoEventos = [
      {
        nombre: 'Festival de Jazz & Fusión Rioplatense',
        descripcion: 'Una noche de jazz contemporáneo con leyendas de la música rioplatense e instrumentistas invitados.',
        tipo_id: tipoMap['Musical'],
        lugar_id: lugarIds[0],
        categoria: null,
        fec_inicio: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 días
        fec_fin: new Date(Date.now() + 86400000 * 2 + 14400000).toISOString(),
        capacidad: 250,
        permite_cancelar: true,
        horas_limite: 12,
        artistas: [
          { nombre: 'Escalandrum Ensamble', principal: true, inicio: '20:30', fin: '22:00' },
          { nombre: 'Trío Del Sur', principal: false, inicio: '19:30', fin: '20:15' }
        ]
      },
      {
        nombre: 'Gala Sinfónica: Beethoven & Brahms',
        descripcion: 'Interpretación magistral de la 9na Sinfonía de Beethoven bajo la dirección de maestros invitados.',
        tipo_id: tipoMap['Musical'],
        lugar_id: lugarIds[1],
        categoria: null,
        fec_inicio: new Date(Date.now() + 86400000 * 4).toISOString(),
        fec_fin: new Date(Date.now() + 86400000 * 4 + 10800000).toISOString(),
        capacidad: 500,
        permite_cancelar: true,
        horas_limite: 24,
        artistas: [
          { nombre: 'Orquesta Filarmónica de Buenos Aires', principal: true, inicio: '20:00', fin: '22:30' }
        ]
      },
      {
        nombre: 'Torneo Abierto de Ajedrez & Cultura Estratégica',
        descripcion: 'Torneo relámpago y simultáneas con Grandes Maestros internacionales y talleres de pensamiento crítico.',
        tipo_id: tipoMap['Deportivo'],
        lugar_id: lugarIds[4],
        categoria: 'Blitz Master Sub-2200',
        fec_inicio: new Date(Date.now() + 86400000 * 5).toISOString(),
        fec_fin: new Date(Date.now() + 86400000 * 5 + 18000000).toISOString(),
        capacidad: 60,
        permite_cancelar: true,
        horas_limite: 4,
        artistas: []
      },
      {
        nombre: 'Exposición Óleos & Escultura Urbana "Raíces Vivas"',
        descripcion: 'Muestra retrospectiva de arte plástico rioplatense combinando pintura al óleo y piezas en bronce.',
        tipo_id: tipoMap['Plástico'],
        lugar_id: lugarIds[2],
        categoria: null,
        fec_inicio: new Date(Date.now() + 86400000 * 7).toISOString(),
        fec_fin: new Date(Date.now() + 86400000 * 14).toISOString(),
        capacidad: 150,
        permite_cancelar: true,
        horas_limite: 2,
        artistas: [
          { nombre: 'Marta Minujín Colectivo', principal: true, inicio: '18:00', fin: '21:00' }
        ]
      },
      {
        nombre: 'Noche de Rock Acústico & Poesía en San Isidro',
        descripcion: 'Encuentro íntimo acústico de solistas y poetas locales en el corazón de San Isidro.',
        tipo_id: tipoMap['Musical'],
        lugar_id: lugarIds[3],
        categoria: null,
        fec_inicio: new Date(Date.now() + 86400000 * 9).toISOString(),
        fec_fin: new Date(Date.now() + 86400000 * 9 + 14400000).toISOString(),
        capacidad: 120,
        permite_cancelar: true,
        horas_limite: 6,
        artistas: [
          { nombre: 'Lisandro Aristimuño (Invitado)', principal: true, inicio: '21:00', fin: '23:00' },
          { nombre: 'Clara Cantore', principal: false, inicio: '20:00', fin: '20:45' }
        ]
      }
    ];

    for (const ev of demoEventos) {
      const evRes = await client.query(`
        INSERT INTO eventos (creador_usr_id, tipoevento_id, lugarevento_id, nombre, descripcion, categoria, fec_inicio, fec_fin, capacidad_maxima, permite_cancelar, horas_limite_cancelacion, estado_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 1)
        RETURNING id;
      `, [adminId, ev.tipo_id, ev.lugar_id, ev.nombre, ev.descripcion, ev.categoria, ev.fec_inicio, ev.fec_fin, ev.capacidad, ev.permite_cancelar, ev.horas_limite]);

      const eventoId = evRes.rows[0].id;
      for (const art of ev.artistas) {
        await client.query(`
          INSERT INTO eventos_artistas (evento_id, nombre_artista, es_principal)
          VALUES ($1, $2, $3);
        `, [eventoId, art.nombre, art.principal]);
      }
    }

    console.log('Seed completed successfully!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedData();
