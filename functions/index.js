const { getApps, initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { logger } = require('firebase-functions');
const { defineSecret, defineString } = require('firebase-functions/params');
const { HttpsError, onCall } = require('firebase-functions/v2/https');

if (getApps().length === 0) initializeApp();

const whatsappAccessToken = defineSecret('WHATSAPP_ACCESS_TOKEN');
const whatsappPhoneNumberId = defineString('WHATSAPP_PHONE_NUMBER_ID');
const whatsappTemplateName = defineString('WHATSAPP_TEMPLATE_NAME', { default: 'zella_sos_alert' });
const whatsappTemplateLanguage = defineString('WHATSAPP_TEMPLATE_LANGUAGE', { default: 'pt_BR' });
const whatsappGraphVersion = defineString('WHATSAPP_GRAPH_VERSION', { default: 'v25.0' });
const SEND_COOLDOWN_MS = 60_000;

function normalizeWhatsAppNumber(rawValue) {
  if (typeof rawValue !== 'string') return null;
  const trimmed = rawValue.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return null;

  const normalized = trimmed.startsWith('+') || digits.startsWith('55')
    ? digits
    : (digits.length === 10 || digits.length === 11 ? `55${digits}` : digits);
  return normalized.length >= 10 && normalized.length <= 15 ? normalized : null;
}

function readCoordinate(value, min, max) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
    ? value
    : null;
}

async function enforceRateLimit(uid) {
  const db = getFirestore();
  const ref = db.collection('sos_whatsapp_rate_limits').doc(uid);
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const previous = snapshot.data()?.lastSentAt?.toMillis?.() ?? 0;
    if (Date.now() - previous < SEND_COOLDOWN_MS) {
      throw new HttpsError('resource-exhausted', 'Aguarde um minuto antes de enviar outro alerta pelo WhatsApp.');
    }
    transaction.set(ref, { lastSentAt: FieldValue.serverTimestamp() }, { merge: true });
  });
}

async function sendTemplateMessage({ to, senderName, locationText }) {
  const token = whatsappAccessToken.value();
  const phoneNumberId = whatsappPhoneNumberId.value();
  if (!token || !phoneNumberId) {
    throw new HttpsError('failed-precondition', 'A integração do WhatsApp ainda não foi configurada no servidor.');
  }

  const response = await fetch(
    `https://graph.facebook.com/${whatsappGraphVersion.value()}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'template',
        template: {
          name: whatsappTemplateName.value(),
          language: { code: whatsappTemplateLanguage.value() },
          components: [{
            type: 'body',
            parameters: [
              { type: 'text', text: senderName },
              { type: 'text', text: locationText },
            ],
          }],
        },
      }),
    }
  );

  if (!response.ok) {
    const responseText = await response.text();
    logger.error('Meta recusou uma mensagem SOS.', {
      status: response.status,
      response: responseText.slice(0, 1000),
    });
    throw new Error(`Meta HTTP ${response.status}`);
  }
}

exports.sendSosWhatsapp = onCall(
  {
    region: 'southamerica-east1',
    timeoutSeconds: 30,
    memory: '256MiB',
    secrets: [whatsappAccessToken],
  },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError('unauthenticated', 'Entre no Zella para enviar o SOS.');

    const latitude = readCoordinate(request.data?.latitude, -90, 90);
    const longitude = readCoordinate(request.data?.longitude, -180, 180);
    const locationText = latitude !== null && longitude !== null
      ? `https://maps.google.com/?q=${latitude},${longitude}`
      : 'Localização indisponível';

    const db = getFirestore();
    const senderSnapshot = await db.collection('usuarios').doc(uid).get();
    if (!senderSnapshot.exists) throw new HttpsError('not-found', 'Perfil da usuária não encontrado.');

    const sender = senderSnapshot.data() || {};
    const contactIds = Array.isArray(sender.contatosEmergencia)
      ? [...new Set(sender.contatosEmergencia.filter((id) => typeof id === 'string'))]
      : [];
    if (contactIds.length === 0) return { eligible: 0, sent: 0, failed: 0 };

    const contactSnapshots = await db.getAll(
      ...contactIds.map((contactId) => db.collection('usuarios').doc(contactId))
    );
    const recipients = [...new Set(
      contactSnapshots
        .filter((snapshot) => snapshot.exists && snapshot.data()?.whatsappSosEnabled === true)
        .map((snapshot) => normalizeWhatsAppNumber(snapshot.data()?.telefone))
        .filter(Boolean)
    )];
    if (recipients.length === 0) return { eligible: 0, sent: 0, failed: 0 };

    await enforceRateLimit(uid);
    const senderName = typeof sender.nome === 'string' && sender.nome.trim()
      ? sender.nome.trim().slice(0, 100)
      : 'Seu contato de confiança';
    const results = await Promise.allSettled(
      recipients.map((to) => sendTemplateMessage({ to, senderName, locationText }))
    );
    const sent = results.filter((result) => result.status === 'fulfilled').length;
    const failed = results.length - sent;

    logger.info('Envio automático do SOS pelo WhatsApp concluído.', {
      uid,
      eligible: recipients.length,
      sent,
      failed,
    });
    return { eligible: recipients.length, sent, failed };
  }
);
