import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.usr_id,
      nombre: user.usr_nombre,
      apellido: user.usr_apellido,
      celular: user.usr_celular,
      codigoPostal: user.usr_codigopostal,
    },
  });
}
