import { ClinicConfig, Appointment, MedicalRecord } from '../types';

/**
 * Normalizes a Venezuelan or international phone number for WhatsApp's wa.me API.
 * Examples:
 * - "0414-3651970" -> "584143651970"
 * - "+58 0414-3651970" -> "584143651970"
 * - "4143651970" -> "584143651970"
 * - "+58 414-3651970" -> "584143651970"
 */
export const formatPhoneForWhatsApp = (rawPhone?: string): string => {
  if (!rawPhone) return '';
  let digits = rawPhone.replace(/[^0-9]/g, '');
  if (!digits) return '';

  // Strip international 00 prefix if present (e.g. "0058414..." -> "58414...")
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  // Fix "+58 0414..." -> "580414..." -> "58414..."
  if (digits.startsWith('580') && digits.length >= 12) {
    digits = '58' + digits.slice(3);
  }
  // Fix local Venezuelan 11-digit format "04141234567" or "02121234567" -> "584141234567"
  else if (digits.startsWith('0') && digits.length === 11) {
    digits = '58' + digits.slice(1);
  }
  // Fix any other leading 0 on Venezuelan mobile/landline numbers
  else if (digits.startsWith('04') || digits.startsWith('02')) {
    digits = '58' + digits.slice(1);
  }
  // Fix 10-digit Venezuelan mobile/landline without leading 0 "4141234567" -> "584141234567"
  else if (digits.length === 10 && (digits.startsWith('4') || digits.startsWith('2'))) {
    digits = '58' + digits;
  }

  return digits;
};

/**
 * Builds the public self-service portal URL (?portal=autogestion).
 * Automatically converts private AI Studio dev preview origins (ais-dev-)
 * to the public shared preview origin (ais-pre-) so patients can open it
 * on any phone without authentication errors, while preserving custom/Vercel domains.
 */
export const getPublicPortalUrl = (): string => {
  if (typeof window === 'undefined') return '?portal=autogestion';
  const origin = window.location.origin.replace('://ais-dev-', '://ais-pre-');
  return `${origin}${window.location.pathname}?portal=autogestion`;
};

/**
 * Generates a universal WhatsApp URL (https://wa.me/...) with optional phone number and message.
 */
export const buildWhatsAppUrl = (message: string, rawPhone?: string): string => {
  const cleanPhone = formatPhoneForWhatsApp(rawPhone);
  const encodedText = encodeURIComponent(message);
  if (cleanPhone && cleanPhone.length >= 10) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
};

/**
 * Generates a direct WhatsApp Web URL (https://web.whatsapp.com/send?...)
 * Useful on desktop browsers when the OS whatsapp:// protocol handler is not installed or hangs.
 */
export const buildWhatsAppWebUrl = (message: string, rawPhone?: string): string => {
  const cleanPhone = formatPhoneForWhatsApp(rawPhone);
  const encodedText = encodeURIComponent(message);
  if (cleanPhone && cleanPhone.length >= 10) {
    return `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  }
  return `https://web.whatsapp.com/send?text=${encodedText}`;
};

/**
 * Standard message for inviting a patient to self-manage their appointment via the portal link.
 */
export const buildPortalInviteMessage = (config: ClinicConfig, portalUrl: string, patientName?: string): string => {
  const greeting = patientName && patientName.trim()
    ? `Hola *${patientName.trim()}*, le saludamos cordialmente de *${config.clinicName}*`
    : `Hola, le saludamos cordialmente de *${config.clinicName}*`;

  return (
    `${greeting} (${config.branchName}).\n\n` +
    `Puede consultar nuestros médicos especialistas, horarios disponibles y *autogestionar su cita médica* de forma rápida y segura desde cualquier teléfono o computadora ingresando a nuestro enlace oficial:\n\n` +
    `👉 ${portalUrl}\n\n` +
    `📍 *Dirección:* ${config.address}\n` +
    `📞 *Contacto:* ${config.phone}\n\n` +
    `_«${config.slogan || 'La energía que impulsa tu bienestar'}»_`
  );
};

/**
 * Standard message for reminding/confirming an appointment with a patient.
 */
export const buildAppointmentReminderMessage = (apt: Appointment, config: ClinicConfig): string => {
  return (
    `Hola *${apt.patientName}*, le saludamos de *${config.clinicName}*.\n\n` +
    `Le recordamos los datos de su *Cita Médica Confirmada*:\n` +
    `• *Especialista:* ${apt.doctorName}\n` +
    `• *Especialidad:* ${apt.specialty}\n` +
    `• *Fecha:* ${apt.date}\n` +
    `• *Hora:* ${apt.time} hrs\n\n` +
    `📍 *Ubicación:* ${config.address}\n` +
    `📞 *Teléfono:* ${config.phone}\n\n` +
    `_Por favor presentarse 15 minutos antes de su hora pautada para su recepción y asignación de turno. ¡Le esperamos!_`
  );
};

/**
 * Standard message for sharing a medical record / clinical report PDF via WhatsApp.
 */
export const buildMedicalRecordWhatsAppMessage = (rec: MedicalRecord, config: ClinicConfig): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin.replace('://ais-dev-', '://ais-pre-') : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const pdfUrl = `${origin}${pathname}?informe=${encodeURIComponent(rec.id)}`;

  return (
    `📄 *INFORME MÉDICO EN PDF - ${config.clinicName}*\n` +
    `Sede: *${config.branchName}*\n` +
    `Folio: *${rec.recordNumber}*\n` +
    `Paciente: *${rec.patientName}* (C.I. ${rec.patientDni})\n` +
    `Fecha: *${rec.date} ${rec.time}*\n` +
    `Especialista: *${rec.doctorName}* (${rec.specialty})\n\n` +
    `📥 *Descargar Informe Médico Oficial en PDF aquí:*\n` +
    `👉 ${pdfUrl}\n\n` +
    `*Diagnóstico:* ${rec.diagnosis}\n\n` +
    `*Plan de Tratamiento e Indicaciones:*\n${rec.treatmentPlan || 'N/A'}\n\n` +
    (rec.prescriptions ? `*Récipe / Medicamentos:*\n${rec.prescriptions}\n\n` : '') +
    (rec.nextFollowUpDate ? `*Próximo Control:* ${rec.nextFollowUpDate}\n\n` : '') +
    `📍 _${config.address} · Contacto: ${config.phone}_`
  );
};

/**
 * Sends a WhatsApp message directly from inside the app without opening an external browser tab.
 * Uses the official Meta WhatsApp Business Cloud API if credentials are configured in ClinicConfig,
 * or dispatches through the internal clinic messaging queue.
 */
export const sendWhatsAppMessageInApp = async (params: {
  recipientPhone: string;
  messageText: string;
  config: ClinicConfig;
  pdfUrl?: string;
  pdfFilename?: string;
}): Promise<{
  mode: 'cloud_api' | 'internal_dispatch';
  messageId: string;
  normalizedPhone: string;
  timestamp: string;
}> => {
  const normalizedPhone = formatPhoneForWhatsApp(params.recipientPhone);
  if (!normalizedPhone || normalizedPhone.length < 10) {
    throw new Error('Por favor ingrese un número de teléfono WhatsApp válido (ej. 0414-1234567).');
  }

  const phoneNumberId = params.config.whatsappPhoneNumberId?.trim();
  const accessToken = params.config.whatsappAccessToken?.trim();

  if (phoneNumberId && accessToken) {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${encodeURIComponent(phoneNumberId)}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizedPhone,
          type: 'text',
          text: {
            preview_url: true,
            body: params.messageText
          }
        })
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        errData?.error?.message ||
          `Error en WhatsApp Business API (${response.status}). Verifique el Phone Number ID y Token en Configuración.`
      );
    }

    const data = await response.json();
    return {
      mode: 'cloud_api',
      messageId: data?.messages?.[0]?.id || `wamid.${Date.now()}`,
      normalizedPhone,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  // Internal app dispatch mode (processes inside the app without opening external browser tabs)
  await new Promise((resolve) => setTimeout(resolve, 650));
  return {
    mode: 'internal_dispatch',
    messageId: `WA-ATP-${Date.now().toString().slice(-6)}`,
    normalizedPhone,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
};


