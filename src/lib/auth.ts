import { cookies } from 'next/headers';
import { query } from './db';
import { Usuario } from '@/types/database';

const SESSION_COOKIE = 'lrc_session_user';

export async function getCurrentUser(): Promise<Usuario | null> {
  const cookieStore = cookies();
  const sessionUser = cookieStore.get(SESSION_COOKIE);
  if (!sessionUser || !sessionUser.value) {
    return null;
  }

  try {
    const userId = parseInt(sessionUser.value, 10);
    if (isNaN(userId)) return null;

    const rows = await query<Usuario>(
      `SELECT id, usr_id, usr_nombre, usr_apellido, usr_celular, usr_codigopostal, usr_estado_id
       FROM usuarios WHERE id = $1 AND usr_estado_id = 1`,
      [userId]
    );

    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}
