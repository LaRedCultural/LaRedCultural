import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return new Response(
      `<html><body style="background:#0d0f14;color:#fff;font-family:sans-serif;text-align:center;padding:50px;">
        <h1 style="color:#ef4444;">Enlace inválido</h1>
        <p>No se proporcionó ningún token de confirmación.</p>
        <a href="/" style="color:#f59e0b;">Volver al inicio</a>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 400 }
    );
  }

  try {
    const rows = await query(
      `SELECT id, usr_nombre, usr_fec_alta, email_verification_expires
       FROM usuarios WHERE email_verification_token = $1`,
      [token]
    );

    if (rows.length === 0) {
      return new Response(
        `<html><body style="background:#0d0f14;color:#fff;font-family:sans-serif;text-align:center;padding:50px;">
          <h1 style="color:#ef4444;">Token no encontrado o ya utilizado</h1>
          <p>El enlace de activación no es válido o tu cuenta ya fue confirmada.</p>
          <a href="/" style="color:#f59e0b;font-weight:bold;">Ir a La Red Cultural</a>
        </body></html>`,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 404 }
      );
    }

    const user = rows[0];
    const now = new Date();
    const expires = new Date(user.email_verification_expires);

    if (now > expires) {
      // Expirado tras 24hs
      await query(`DELETE FROM usuarios WHERE id = $1`, [user.id]);
      return new Response(
        `<html><body style="background:#0d0f14;color:#fff;font-family:sans-serif;text-align:center;padding:50px;">
          <h1 style="color:#ef4444;">Plazo de confirmación vencido</h1>
          <p>Han pasado más de 24 horas desde tu solicitud. Por razones de seguridad, tu registro ha expirado.</p>
          <p>Por favor vuelve a registrarte en la plataforma.</p>
          <a href="/" style="color:#f59e0b;font-weight:bold;">Volver a registrarme</a>
        </body></html>`,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 410 }
      );
    }

    // Activar usuario
    await query(
      `UPDATE usuarios SET 
        usr_estado_id = 1, 
        email_verification_token = NULL,
        usr_fec_ult_mod = NOW()
       WHERE id = $1`,
      [user.id]
    );

    // Iniciar sesión automáticamente
    const cookieStore = cookies();
    cookieStore.set('lrc_session_user', String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    // Redireccionar al usuario a la grilla de eventos
    return NextResponse.redirect(new URL('/explorar?cuenta_activada=true', req.url));
  } catch (error) {
    console.error('Error al confirmar correo:', error);
    return new Response(
      `<html><body style="background:#0d0f14;color:#fff;font-family:sans-serif;text-align:center;padding:50px;">
        <h1 style="color:#ef4444;">Error del servidor</h1>
        <p>Ocurrió un inconveniente al validar tu correo.</p>
        <a href="/" style="color:#f59e0b;">Volver al inicio</a>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 500 }
    );
  }
}
