import nodemailer from 'nodemailer';

const GMAIL_USER = process.env.GMAIL_USER || 'laredcultural.ok@gmail.com';
const GMAIL_PASS = (process.env.GMAIL_APP_PASSWORD || process.env.GOOGLE_API_KEY || '').trim();
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

function createTransporter() {
  if (!GMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS,
    },
  });
}

/**
 * Enviar correo de confirmación de registro (con validez de 24 horas)
 */
export async function sendVerificationEmail(
  toEmail: string,
  nombre: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const confirmUrl = `${SITE_URL}/api/auth/confirm?token=${encodeURIComponent(token)}`;

  const htmlContent = `
    <div style="background-color: #0d0f14; color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #232936;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #f59e0b; margin: 0; font-size: 28px; letter-spacing: 2px;">LA RED CULTURAL</h1>
        <p style="color: #9ca3af; font-size: 14px; margin-top: 5px;">Conectando a las personas con la cultura</p>
      </div>
      
      <div style="background: #171b24; padding: 24px; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">¡Hola, ${nombre}!</h2>
        <p style="line-height: 1.6; color: #d1d5db;">
          Gracias por sumarte a <strong>La Red Cultural</strong>. Para activar tu cuenta y acceder a la grilla completa de eventos, por favor confirma tu dirección de correo electrónico haciendo clic en el siguiente botón:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmUrl}" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #0d0f14; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 6px; display: inline-block; font-size: 16px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);">
            Confirmar mi cuenta
          </a>
        </div>

        <p style="font-size: 13px; color: #f59e0b; margin-top: 20px;">
          ⚠️ <strong>Importante:</strong> Este enlace tiene una validez de <strong>24 horas</strong>. Si no confirmas tu correo dentro de este plazo, deberás registrarte nuevamente.
        </p>
        
        <p style="font-size: 12px; color: #6b7280; margin-top: 15px;">
          Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br />
          <a href="${confirmUrl}" style="color: #f59e0b; word-break: break-all;">${confirmUrl}</a>
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280;">
        © 2026 La Red Cultural. Todos los derechos reservados.
      </div>
    </div>
  `;

  const transporter = createTransporter();
  if (!transporter) {
    console.log(`\n=============================================================`);
    console.log(`[SIMULACIÓN EMAIL GOOGLE] Para: ${toEmail}`);
    console.log(`Enlace de confirmación generado: ${confirmUrl}`);
    console.log(`=============================================================\n`);
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: `"La Red Cultural" <${GMAIL_USER}>`,
      to: toEmail,
      subject: 'Confirma tu cuenta en La Red Cultural',
      html: htmlContent,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error al enviar correo de verificación:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Enviar aviso de cancelación de evento a los asistentes
 */
export async function sendEventCancellationEmail(
  toEmail: string,
  nombreUsuario: string,
  nombreEvento: string,
  fechaEvento: string
): Promise<{ success: boolean; error?: string }> {
  const htmlContent = `
    <div style="background-color: #0d0f14; color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #232936;">
      <h1 style="color: #ef4444; margin: 0; font-size: 24px;">Aviso de Evento Cancelado</h1>
      <p style="color: #9ca3af; font-size: 14px;">La Red Cultural - Notificaciones de Asistencia</p>
      <div style="background: #171b24; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ef4444;">
        <p>Hola ${nombreUsuario},</p>
        <p>Te informamos que el evento <strong>${nombreEvento}</strong> programado para el día <strong>${fechaEvento}</strong> ha sido cancelado por su organizador.</p>
        <p>Tu asistencia ha sido dada de baja automáticamente.</p>
      </div>
    </div>
  `;

  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[SIMULACIÓN EMAIL CANCELACIÓN] Para: ${toEmail} | Evento: ${nombreEvento}`);
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: `"La Red Cultural" <${GMAIL_USER}>`,
      to: toEmail,
      subject: `Cancelación del evento: ${nombreEvento}`,
      html: htmlContent,
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Enviar campaña de difusión a un usuario segmentado
 */
export async function sendCampaignEmail(
  toEmail: string,
  nombreUsuario: string,
  evento: { id: number; nombre: string; fecha: string; lugar: string; tipo: string }
): Promise<{ success: boolean; error?: string }> {
  const eventUrl = `${SITE_URL}/explorar?eventoId=${evento.id}`;

  const htmlContent = `
    <div style="background-color: #0d0f14; color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #232936;">
      <h1 style="color: #f59e0b; margin: 0; font-size: 24px;">¡Nuevo evento en tu zona de interés!</h1>
      <p style="color: #9ca3af; font-size: 14px;">La Red Cultural te invita a:</p>
      <div style="background: #171b24; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #f59e0b;">
        <h2 style="color: #ffffff; margin-top: 0;">${evento.nombre}</h2>
        <p><strong>Tipo:</strong> ${evento.tipo}</p>
        <p><strong>Lugar:</strong> ${evento.lugar}</p>
        <p><strong>Fecha:</strong> ${evento.fecha}</p>
        <div style="margin-top: 20px; text-align: center;">
          <a href="${eventUrl}" style="background: #f59e0b; color: #0d0f14; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block;">
            Ver Detalles y Confirmar Asistencia
          </a>
        </div>
      </div>
    </div>
  `;

  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[SIMULACIÓN CAMPAÑA EMAIL] Para: ${toEmail} | Evento: ${evento.nombre}`);
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: `"La Red Cultural" <${GMAIL_USER}>`,
      to: toEmail,
      subject: `Invitación a evento: ${evento.nombre}`,
      html: htmlContent,
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
