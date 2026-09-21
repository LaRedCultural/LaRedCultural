-- ==========================================================
-- SCRIPT DDL: BASE DE DATOS LA RED CULTURAL (Supabase / PostgreSQL)
-- ==========================================================

-- 1. TABLA: ESTADOS
CREATE TABLE IF NOT EXISTS estados (
    id SERIAL PRIMARY KEY,
    descripcion VARCHAR(20) NOT NULL,
    activo INT DEFAULT 1
);

-- Valores iniciales de estados
INSERT INTO estados (descripcion, activo) VALUES 
('ACTIVO', 1),
('INACTIVO', 1),
('PENDIENTE_CONFIRM', 1),
('CANCELADO', 1),
('SUSPENDIDO', 1)
ON CONFLICT DO NOTHING;

-- 2. TABLA: TIPOS_MAIL
CREATE TABLE IF NOT EXISTS tipos_mail (
    id SERIAL PRIMARY KEY,
    tipomail_descripcion VARCHAR(100) NOT NULL,
    tipomail_estado_id INT REFERENCES estados(id) DEFAULT 1
);

INSERT INTO tipos_mail (tipomail_descripcion, tipomail_estado_id) VALUES
('PERSONAL', 1),
('LABORAL', 1)
ON CONFLICT DO NOTHING;

-- 3. TABLA: USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    usr_id VARCHAR(100) UNIQUE NOT NULL, -- Email de ingreso
    usr_nombre VARCHAR(100) NOT NULL,
    usr_apellido VARCHAR(100) NOT NULL,
    usr_pass VARCHAR(255) NOT NULL,
    usr_celular VARCHAR(30),
    usr_codigopostal VARCHAR(10),
    usr_estado_id INT REFERENCES estados(id) DEFAULT 3, -- 3 = PENDIENTE_CONFIRM
    usr_fec_alta TIMESTAMPTZ DEFAULT NOW(),
    usr_fec_ult_mod TIMESTAMPTZ DEFAULT NOW(),
    usr_usr_ult_mod INT,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMPTZ
);

-- 4. TABLA: USUARIOS_MAIL
CREATE TABLE IF NOT EXISTS usuarios_mail (
    id SERIAL PRIMARY KEY,
    usrmail_tipo INT REFERENCES tipos_mail(id),
    usrmail_mail VARCHAR(200) NOT NULL,
    usrmail_principal INT DEFAULT 1, -- 0 o 1
    usrmail_estado_id INT REFERENCES estados(id) DEFAULT 1,
    usrmail_usr_id INT REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 5. TABLA: VINCULOS
CREATE TABLE IF NOT EXISTS vinculos (
    id SERIAL PRIMARY KEY,
    vinc_descripcion VARCHAR(100) NOT NULL, -- Dueño, Encargado, Organizador
    vinc_estado_id INT REFERENCES estados(id) DEFAULT 1
);

INSERT INTO vinculos (vinc_descripcion, vinc_estado_id) VALUES
('DUEÑO', 1),
('ENCARGADO', 1),
('ORGANIZADOR', 1)
ON CONFLICT DO NOTHING;

-- 6. TABLA: TIPOS_EVENTOS (ABM disponible para creadores)
CREATE TABLE IF NOT EXISTS tipos_eventos (
    id SERIAL PRIMARY KEY,
    tipoevento_descripcion VARCHAR(100) NOT NULL,
    tipoevento_estado_id INT REFERENCES estados(id) DEFAULT 1
);

INSERT INTO tipos_eventos (tipoevento_descripcion, tipoevento_estado_id) VALUES
('Musical', 1),
('Deportivo', 1),
('Plástico', 1),
('Teatral', 1),
('Cinematográfico', 1),
('Literario', 1),
('Gastronómico', 1)
ON CONFLICT DO NOTHING;

-- 7. TABLA: LUGARES_EVENTOS
CREATE TABLE IF NOT EXISTS lugares_eventos (
    id SERIAL PRIMARY KEY,
    lugarevento_nombre VARCHAR(255) NOT NULL,
    lugarevento_estado_id INT REFERENCES estados(id) DEFAULT 1
);

-- 8. TABLA: LUGARES_EVENTOS_DOMICILIOS
CREATE TABLE IF NOT EXISTS lugares_eventos_domicilios (
    id SERIAL PRIMARY KEY,
    lugarevento_id INT REFERENCES lugares_eventos(id) ON DELETE CASCADE,
    lugareventodom_pais INT DEFAULT 1,
    lugareventodom_provincia INT DEFAULT 1,
    lugareventodom_partido VARCHAR(100) NOT NULL,
    lugareventodom_localidad VARCHAR(100),
    lugareventodom_codigopostal VARCHAR(10),
    lugareventodom_calle VARCHAR(150) NOT NULL,
    lugareventodom_numero VARCHAR(10) NOT NULL,
    lugareventodom_piso VARCHAR(10),
    lugareventodom_puerta VARCHAR(10),
    lugareventodom_estado_id INT REFERENCES estados(id) DEFAULT 1
);

-- 9. TABLA: LUGARES_EVENTOS_USUARIOS
CREATE TABLE IF NOT EXISTS lugares_eventos_usuarios (
    id SERIAL PRIMARY KEY,
    lugarevento_id INT REFERENCES lugares_eventos(id) ON DELETE CASCADE,
    usr_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    vinculo_id INT REFERENCES vinculos(id)
);

-- 10. TABLA: EVENTOS
-- Nota: tipoevento_id tiene FK a tipos_eventos
-- Nota: categoria es varchar(250) libre, sin FK
CREATE TABLE IF NOT EXISTS eventos (
    id SERIAL PRIMARY KEY,
    creador_usr_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    tipoevento_id INT NOT NULL REFERENCES tipos_eventos(id),
    lugarevento_id INT REFERENCES lugares_eventos(id),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(250), -- Libre sin FK
    fec_inicio TIMESTAMPTZ NOT NULL,
    fec_fin TIMESTAMPTZ NOT NULL,
    capacidad_maxima INT DEFAULT 0,
    permite_cancelar BOOLEAN DEFAULT TRUE,
    horas_limite_cancelacion INT DEFAULT 0,
    estado_id INT REFERENCES estados(id) DEFAULT 1,
    fec_alta TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABLA: EVENTOS_ARTISTAS
CREATE TABLE IF NOT EXISTS eventos_artistas (
    id SERIAL PRIMARY KEY,
    evento_id INT REFERENCES eventos(id) ON DELETE CASCADE,
    nombre_artista VARCHAR(255) NOT NULL,
    es_principal BOOLEAN DEFAULT FALSE,
    fec_inicio TIMESTAMPTZ,
    fec_fin TIMESTAMPTZ
);

-- 12. TABLA: EVENTOS_ASISTENCIAS
CREATE TABLE IF NOT EXISTS eventos_asistencias (
    id SERIAL PRIMARY KEY,
    evento_id INT REFERENCES eventos(id) ON DELETE CASCADE,
    usr_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    estado VARCHAR(50) DEFAULT 'CONFIRMADO', -- 'CONFIRMADO', 'CANCELADO'
    fec_confirmacion TIMESTAMPTZ DEFAULT NOW(),
    fec_cancelacion TIMESTAMPTZ,
    UNIQUE(evento_id, usr_id)
);

-- 13. TABLA: USUARIOS_INTERESES
CREATE TABLE IF NOT EXISTS usuarios_intereses (
    id SERIAL PRIMARY KEY,
    usr_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    tipoevento_id INT REFERENCES tipos_eventos(id) ON DELETE CASCADE,
    UNIQUE(usr_id, tipoevento_id)
);

-- ÍNDICES DE RENDIMIENTO PARA BÚSQUEDAS Y MATCHES DE CAMPAÑAS
CREATE INDEX IF NOT EXISTS idx_eventos_fechas ON eventos(fec_inicio, fec_fin);
CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON eventos(tipoevento_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_cp ON usuarios(usr_codigopostal);
CREATE INDEX IF NOT EXISTS idx_asistencias_evento ON eventos_asistencias(evento_id);
CREATE INDEX IF NOT EXISTS idx_intereses_usr ON usuarios_intereses(usr_id);
