import { getFunctions, httpsCallable } from 'firebase/functions';

import { auth, firebaseApp } from '@/config/firebase';

type SendWhatsAppSosInput = {
  latitude?: number;
  longitude?: number;
};

export type WhatsAppSosResult = {
  eligible: number;
  sent: number;
  failed: number;
};

const functions = getFunctions(firebaseApp, 'southamerica-east1');

export async function sendWhatsAppSos(
  input: SendWhatsAppSosInput
): Promise<WhatsAppSosResult> {
  if (!auth.currentUser) {
    throw new Error('É necessário estar autenticada para enviar o SOS pelo WhatsApp.');
  }

  const sendSos = httpsCallable<SendWhatsAppSosInput, WhatsAppSosResult>(
    functions,
    'sendSosWhatsapp'
  );
  const response = await sendSos(input);
  return response.data;
}
