import { supabase } from '../lib/supabase';

interface EmailTemplate {
  subject: string;
  body: string;
}

const templates: Record<string, (data: any) => EmailTemplate> = {
  vela: (data) => ({
    subject: `Nueva vela encendida en el homenaje de ${data.tribute_nombre}`,
    body: `
      Alguien ha encendido una vela en el homenaje de ${data.tribute_nombre}.
      ${data.mensaje ? `\n\nMensaje: "${data.mensaje}"` : ''}
      \n\nVisita el homenaje: ${window.location.origin}/homenaje/${data.tribute_id}
    `,
  }),
  comentario: (data) => ({
    subject: `Nuevo comentario en el homenaje de ${data.tribute_nombre}`,
    body: `
      Alguien ha dejado un comentario en el homenaje de ${data.tribute_nombre}.
      \n\nComentario: "${data.contenido}"
      \n\nVisita el homenaje: ${window.location.origin}/homenaje/${data.tribute_id}
    `,
  }),
  suscripcion: (data) => ({
    subject: 'Confirmación de suscripción',
    body: `
      ¡Gracias por suscribirte a nuestro plan ${data.plan_nombre}!
      \n\nTu suscripción está activa hasta el ${new Date(data.fecha_fin).toLocaleDateString()}.
      \n\nDisfruta de todas las características premium.
    `,
  }),
};

export async function sendEmail(notificationId: string): Promise<void> {
  try {
    const { data: notification, error: fetchError } = await supabase
      .from('email_notifications')
      .select('*')
      .eq('id', notificationId)
      .single();

    if (fetchError) throw fetchError;

    const template = templates[notification.tipo](notification.datos);

    // Aquí iría la lógica de envío de email usando el servicio que elijas
    // Por ejemplo, usando SendGrid, Amazon SES, etc.
    console.log('Enviando email:', {
      to: notification.user_id,
      ...template,
    });

    // Marcar como enviado
    const { error: updateError } = await supabase
      .from('email_notifications')
      .update({
        estado: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (updateError) throw updateError;
  } catch (err) {
    console.error('Error al enviar email:', err);

    // Marcar como fallido
    await supabase
      .from('email_notifications')
      .update({
        estado: 'failed',
      })
      .eq('id', notificationId);

    throw err;
  }
}
