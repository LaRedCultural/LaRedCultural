import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son obligatorios.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Buscar usuario
    const rows = await query(
      `SELECT id, usr_id, usr_nombre, usr_apellido, usr_pass, usr_estado_id, usr_fec_alta
       FROM usuarios WHERE usr_id = $1`,
      [cleanEmail]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'El usuario no se encuentra registrado en el sistema.' },
        { status: 404 }
      );
    }

    const user = rows[0];

    // Verificar si el estado es PENDIENTE_CONFIRM (estado 3)
    if (user.usr_estado_id === 3) {
      const fechaAlta = new Date(user.usr_fec_alta).getTime();
      const horasTranscurridas = (Date.now() - fechaAlta) / (1000 * 60 * 60);

      if (horasTranscurridas > 24) {
        // Regla: si pasaron más de 24 horas y no confirmó, se toma como usuario no registrado
        await query(`DELETE FROM usuarios WHERE id = $1`, [user.id]);
        return NextResponse.json(
          { error: 'El usuario no se encuentra registrado en el sistema (el plazo de 24hs para confirmación ha expirado).' },
          { status: 404 }
        );
      } else {
        // Regla: si intenta ingresar antes de confirmar, notificar que debe confirmar previamente
        return NextResponse.json(
          { error: 'Debes confirmar tu dirección de correo electrónico previamente para ingresar a la plataforma. Revisa tu bandeja de entrada.' },
          { status: 403 }
        );
      }
    }

    // Si está inactivo o suspendido
    if (user.usr_estado_id !== 1) {
      return NextResponse.json(
        { error: 'Tu cuenta no se encuentra activa o está suspendida.' },
        { status: 403 }
      );
    }

    // Verificar contraseña
    if (user.usr_pass !== password) {
      return NextResponse.json(
        { error: 'Credenciales inválidas. Por favor verifica tu correo y contraseña.' },
        { status: 401 }
      );
    }

    // Login exitoso: establecer cookie de sesión
    const cookieStore = cookies();
    cookieStore.set('lrc_session_user', String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.usr_id,
        nombre: user.usr_nombre,
        apellido: user.usr_apellido,
      },
    });
  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error en el servidor al iniciar sesión.' },
      { status: 500 }
    );
  }
}
