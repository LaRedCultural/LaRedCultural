import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = cookies();
  cookieStore.delete('lrc_session_user');
  return NextResponse.json({ success: true });
}
