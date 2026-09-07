import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Vibration } from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { auth, db } from '@/config/firebase';
import { SOS_CHANNEL_ID, SOS_SOUND, setupEmergencyChannel } from '@/constants/sos-notifications';
import {
  readCachedBackgroundSosProfile,
  syncBackgroundSosProfile,
  type BackgroundSosProfile,
} from '@/services/background-sos-control';
import { sendWhatsAppSos } from '@/services/whatsapp-sos';

type Coordinates = { latitude: number; longitude: number };

async function getLocationWithTimeout(): Promise<Coordinates | null> {
  const permission = await Location.getForegroundPermissionsAsync();
  if (!permission.granted) return null;

  // Uma posição recente permite que o alerta saia quase imediatamente.
  const lastLocation = await Location.getLastKnownPositionAsync({ maxAge: 10 * 60 * 1000 });
  if (lastLocation) {
    return {
      latitude: lastLocation.coords.latitude,
      longitude: lastLocation.coords.longitude,
    };
  }

  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const currentLocation = Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    }).then(({ coords }) => ({ latitude: coords.latitude, longitude: coords.longitude }));
    const timeoutResult = new Promise<null>((resolve) => {
      timeout = setTimeout(() => resolve(null), 3_500);
    });
    const result = await Promise.race([currentLocation, timeoutResult]);
    if (result) return result;
  } catch (error) {
    console.log('Não foi possível obter a localização atual do SOS:', error);
  } finally {
    if (timeout) clearTimeout(timeout);
  }

  return null;
}

async function getProfile(): Promise<BackgroundSosProfile | null> {
  const cachedProfile = await readCachedBackgroundSosProfile();
  if (cachedProfile) return cachedProfile;

  if (auth.currentUser) {
    try {
      return await syncBackgroundSosProfile();
    } catch (error) {
      console.log('Usando dados em cache para o SOS:', error);
    }
  }
  return null;
}

async function notifyOwner(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}

export async function handleBackgroundSos() {
  Vibration.vibrate([500, 200, 500]);

  try {
    await setupEmergencyChannel();
    const [profile, coordinates] = await Promise.all([getProfile(), getLocationWithTimeout()]);

    if (!profile) {
      await notifyOwner(
        'SOS não enviado',
        'Abra o Zella e entre novamente para reativar seus dados de emergência.'
      );
      return;
    }

    const mapUrl = coordinates
      ? `https://maps.google.com/?q=${coordinates.latitude},${coordinates.longitude}`
      : '';

    if (auth.currentUser?.uid === profile.uid) {
      try {
        await addDoc(collection(db, 'sos_history'), {
          userId: profile.uid,
          userName: profile.name,
          date: new Date().toLocaleString('pt-BR'),
          timestamp: serverTimestamp(),
          latitude: coordinates?.latitude ?? null,
          longitude: coordinates?.longitude ?? null,
          mapUrl,
          source: 'background-volume-buttons',
        });
      } catch (error) {
        console.log('Não foi possível salvar o histórico do SOS em segundo plano:', error);
      }
    }

    let pushAccepted = 0;
    if (profile.contactPushTokens.length > 0) {
      const messages = profile.contactPushTokens.map((token) => ({
        to: token,
        title: '🚨 ALERTA DE EMERGÊNCIA - ZELLA',
        body: `${profile.name} precisa de ajuda agora!`,
        data: {
          type: 'SOS',
          senderName: profile.name,
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
          mapUrl,
        },
        priority: 'high',
        channelId: SOS_CHANNEL_ID,
        sound: SOS_SOUND,
      }));

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(messages),
      });
      if (!response.ok) throw new Error(`Falha no envio push: HTTP ${response.status}`);

      const result = await response.json() as {
        data?: Array<{ status?: string; message?: string }>;
      };
      const tickets = Array.isArray(result.data) ? result.data : [];
      pushAccepted = tickets.filter((ticket) => ticket.status === 'ok').length;
      const firstError = tickets.find((ticket) => ticket.status !== 'ok');
      if (pushAccepted === 0 && firstError) {
        throw new Error(firstError.message || 'A Expo recusou os tokens dos contatos.');
      }
    }

    let whatsappSent = 0;
    if (auth.currentUser?.uid === profile.uid) {
      try {
        const whatsapp = await sendWhatsAppSos({
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
        });
        whatsappSent = whatsapp.sent;
      } catch (error) {
        // Uma falha do WhatsApp não deve impedir o alerta push.
        console.log('Não foi possível enviar o SOS pelo WhatsApp:', error);
      }
    }

    await notifyOwner(
      'SOS acionado em segundo plano',
      pushAccepted > 0 || whatsappSent > 0
        ? `Push aceito para ${pushAccepted} e WhatsApp enviado para ${whatsappSent} contato(s).`
        : 'SOS registrado, mas nenhum contato com notificações ativas foi encontrado.'
    );
  } catch (error) {
    console.log('Erro no SOS em segundo plano:', error);
    try {
      await notifyOwner('Falha ao enviar SOS', 'Abra o Zella e tente novamente.');
    } catch {}
  }
}
