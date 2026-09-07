import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import 'react-native-reanimated';

import { auth, db } from '../config/firebase';

import { doc, setDoc } from 'firebase/firestore';

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { setupEmergencyChannel } from '@/constants/sos-notifications';
import {
  isBackgroundSosEnabled,
  startBackgroundSos,
  syncBackgroundSosProfile,
} from '@/services/background-sos-control';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type SosNotificationData = {
  type?: unknown;
  senderName?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  mapUrl?: unknown;
  testMode?: unknown;
};

function optionalString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function optionalCoordinate(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'string' && Number.isFinite(Number(value))) return value;
  return '';
}

export default function RootLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const respostasProcessadasRef = useRef(new Set<string>());

  async function registerForPushNotificationsAsync(userUid: string, userEmail: string | null) {
    if (!Device.isDevice) {
      console.log('📌 Push só funciona em celular físico (Emulador/Simulador não gera token).');
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permissão de notificação negada pelo usuário.');
        return;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? 
        Constants?.easConfig?.projectId ??
        '248a4f18-a586-41c6-9d78-1ece3dbb';

      const tokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });

      const token = tokenResponse.data;
      console.log('✅ TOKEN GERADO:', token);

      if (userUid) {
        await setDoc(
          doc(db, 'usuarios', userUid),
          {
            pushToken: token,
            email: userEmail,
            uid: userUid,
          },
          { merge: true }
        );
        console.log('✅ Token salvo com sucesso no Firestore em "usuarios" para o UID:', userUid);
      }
    } catch (e) {
      console.log('❌ Erro ao gerar ou salvar o token:', e);
    }
  }

  useEffect(() => {
    const configurarCanalEmergencia = () => {
      setupEmergencyChannel().catch((error) =>
        console.log('Erro ao configurar o canal SOS:', error)
      );
    };

    configurarCanalEmergencia();

    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') configurarCanalEmergencia();
    });

    const abrirNotificacaoSos = (request: Notifications.NotificationRequest) => {
      const responseKey = request.identifier;

      if (respostasProcessadasRef.current.has(responseKey)) return;

      const data = request.content.data as SosNotificationData;
      if (data?.type !== 'SOS') return;

      respostasProcessadasRef.current.add(responseKey);
      router.push({
        pathname: '/sos-recebido',
        params: {
          senderName: optionalString(data.senderName) || 'Contato de confiança',
          latitude: optionalCoordinate(data.latitude),
          longitude: optionalCoordinate(data.longitude),
          mapUrl: optionalString(data.mapUrl),
          testMode: data.testMode === true ? 'true' : '',
        },
      });
    };

    const notificationReceivedSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        abrirNotificacaoSos(notification.request);
      });

    const notificationResponseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        abrirNotificacaoSos(response.notification.request);
      });

    // O toque pode ter iniciado o processo antes de o listener JavaScript existir.
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) abrirNotificacaoSos(response.notification.request);
      })
      .catch((error) => console.log('Erro ao ler a notificação inicial:', error))
      .finally(() => Notifications.clearLastNotificationResponseAsync());

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log('👤 Usuário logado:', user.uid);
        
        await registerForPushNotificationsAsync(user.uid, user.email);
        try {
          await syncBackgroundSosProfile();
          if (await isBackgroundSosEnabled()) await startBackgroundSos();
        } catch (error) {
          console.log('Erro ao preparar o SOS em segundo plano:', error);
        }
      } else {
        console.log('👤 Nenhum usuário logado.');
      }
    });

    return () => {
      unsubscribeAuth();
      appStateSubscription.remove();
      notificationReceivedSubscription.remove();
      notificationResponseSubscription.remove();
    };
  }, [router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="sos-recebido" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
