import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const SOS_CHANNEL_ID = 'sos-emergency-v4';
export const SOS_SOUND = 'sos.mp3';

export async function setupEmergencyChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(SOS_CHANNEL_ID, {
    name: 'Alerta de Emergência SOS',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 500, 250, 500, 250, 500],
    sound: SOS_SOUND,
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: true,
    audioAttributes: {
      usage: Notifications.AndroidAudioUsage.ALARM,
      contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      flags: {
        enforceAudibility: true,
        requestHardwareAudioVideoSynchronization: false,
      },
    },
  });
}

