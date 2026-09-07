import * as Notifications from 'expo-notifications';

import { SOS_CHANNEL_ID, SOS_SOUND, setupEmergencyChannel } from '@/constants/sos-notifications';

let scheduleOperationInProgress = false;

export class LocalSosTestError extends Error {
  constructor(
    public readonly code: 'disabled' | 'permission-denied' | 'already-scheduled',
    message: string
  ) {
    super(message);
    this.name = 'LocalSosTestError';
  }
}

function assertLocalTestEnabled() {
  if (!__DEV__) {
    throw new LocalSosTestError('disabled', 'O teste local está desabilitado neste build.');
  }
}

function isPendingLocalSosTest(request: Notifications.NotificationRequest) {
  return request.content.data?.type === 'SOS' && request.content.data?.testMode === true;
}

export async function getPendingLocalSosTestId() {
  assertLocalTestEnabled();
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.find(isPendingLocalSosTest)?.identifier ?? null;
}

export async function scheduleLocalSosTest() {
  assertLocalTestEnabled();

  if (scheduleOperationInProgress) {
    throw new LocalSosTestError('already-scheduled', 'Já existe um teste local agendado.');
  }

  scheduleOperationInProgress = true;
  try {
    const pendingId = await getPendingLocalSosTestId();
    if (pendingId) {
      throw new LocalSosTestError('already-scheduled', 'Já existe um teste local agendado.');
    }

    await setupEmergencyChannel();

    const currentPermission = await Notifications.getPermissionsAsync();
    const permission = currentPermission.granted
      ? currentPermission
      : await Notifications.requestPermissionsAsync();

    if (!permission.granted) {
      throw new LocalSosTestError(
        'permission-denied',
        'A permissão de notificação é necessária para executar o teste local.'
      );
    }

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: ' TESTE LOCAL — ZELLA',
        body: 'Este alerta foi gerado somente neste aparelho.',
        sound: SOS_SOUND,
        data: {
          type: 'SOS',
          senderName: 'Teste local',
          testMode: true,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 10,
        repeats: false,
        channelId: SOS_CHANNEL_ID,
      },
    });
  } finally {
    scheduleOperationInProgress = false;
  }
}

export async function cancelLocalSosTest(identifier: string) {
  assertLocalTestEnabled();
  const pendingId = await getPendingLocalSosTestId();

  if (pendingId !== identifier) return false;

  await Notifications.cancelScheduledNotificationAsync(identifier);
  return true;
}
