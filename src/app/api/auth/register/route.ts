import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/emailService';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, apellido, email, password, confirmarPassword, celular, codigoPostal } = body;

    // Validaciones
    if (!nombre || !apellido || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, apellido, email y contraseña son obligatorios.' },
        { status: 400 }
      );
    }

    if (password !== confirmarPassword) {
      return NextResponse.json(
        { error: 'Las contraseñas no coinciden.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Comprobar si el usuario ya existe
    const existing = await query(
      `SELECT id, usr_estado_id, usr_fec_alta FROM usuarios WHERE usr_id = $1`,
      [cleanEmail]
    );

    if (existing.length > 0) {
      const user = existing[0];
      // Si el usuario ya está activo
      if (user.usr_estado_id === 1) {
        return NextResponse.json(
          { error: 'El correo electrónico ya se encuentra registrado y activo. Por favor inicia sesión.' },
          { status: 400 }
        );
      }

      // Si está pendiente, verificar si pasaron más de 24 horas
      const fechaAlta = new Date(user.usr_fec_alta).getTime();
      const horasDiferencia = (Date.now() - fechaAlta) / (1000 * 60 * 60);

      if (horasDiferencia > 24) {
        // Eliminar registro expirado para permitir nuevo registro
        await query(`DELETE FROM usuarios WHERE id = $1`, [user.id]);
      } else {
        return NextResponse.json(
          { error: 'Ya existe un registro pendiente para este correo. Por favor revisa tu bandeja de entrada o espera a que expire tras 24hs.' },
          { status: 400 }
        );
      }
    }

    // Generar token de verificación con expiración en 24 horas
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24hs

    // Insertar en tabla usuarios (estado 3 = PENDIENTE_CONFIRM)
    const result = await query(
      `INSERT INTO usuarios (
        usr_id, usr_nombre, usr_apellido, usr_pass, usr_celular, usr_codigopostal, 
        usr_estado_id, email_verification_token, email_verification_expires
      ) VALUES ($1, $2, $3, $4, $5, $6, 3, $7, $8) RETURNING id`,
      [cleanEmail, nombre.trim(), apellido.trim(), password, celular?.trim() || null, codigoPostal?.trim() || null, token, expiresAt]
    );

    const newUserId = result[0].id;

    // Insertar en tabla usuarios_mail
    await query(
      `INSERT INTO usuarios_mail (usrmail_tipo, usrmail_mail, usrmail_principal, usrmail_estado_id, usrmail_usr_id)
       VALUES (1, $1, 1, 1, $2)`,
      [cleanEmail, newUserId]
    );

    // Enviar correo de confirmación
    await sendVerificationEmail(cleanEmail, nombre, token);

    return NextResponse.json({
      success: true,
      message: 'Registro exitoso. Se ha enviado un enlace de confirmación a tu correo electrónico. Recuerda que tienes 24 horas para activarlo.',
    });
  } catch (error: any) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el registro: ' + error.message },
      { status: 500 }
    );
  }
}
