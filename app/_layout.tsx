import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Alert, Linking, Vibration } from 'react-native';
import 'react-native-reanimated';

import { auth, db } from '../config/firebase';

// Altere a linha 12 para buscar pela raiz do projeto usando o '@'
//import '@/config/i18n';

import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import * as Location from 'expo-location';

import { VolumeManager } from 'react-native-volume-manager';

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import { useColorScheme } from '@/hooks/use-color-scheme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {

  const colorScheme = useColorScheme();

  const cliquesRef = useRef(0);

  const timerRef = useRef<any>(null);

  // 🚨 EVITA SOS DUPLICADO
  const executandoSOSRef = useRef(false);

  async function registerForPushNotificationsAsync() {

    if (!Device.isDevice) {
      console.log('Push só funciona em celular físico.');
      return;
    }

    try {

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {

        const { status } =
          await Notifications.requestPermissionsAsync();

        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permissão negada.');
        return;
      }

      const tokenResponse =
        await Notifications.getExpoPushTokenAsync({
          projectId: '6f73f0fa-6ef9-4f14-960e-afbcc59bbf0b',
        });

      const token = tokenResponse.data;

      console.log('✅ TOKEN:', token);

      if (auth.currentUser) {

        await setDoc(
          doc(db, 'users', auth.currentUser.uid),
          {
            pushToken: token,
            email: auth.currentUser.email,
            uid: auth.currentUser.uid,
          },
          { merge: true }
        );

        console.log('✅ Token salvo');
      }

    } catch (e) {
      console.log('❌ Erro token:', e);
    }
  }

  // 🚨 FUNÇÃO SOS
  const dispararSOS = async () => {

    // 🚫 EVITA DUPLICAR
    if (executandoSOSRef.current) {
      return;
    }

    executandoSOSRef.current = true;

    console.log('🚨 SOS');

    Vibration.vibrate([500, 200, 500]);

    try {

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {

        Alert.alert(
          'Erro',
          'Permita o GPS.'
        );

        executandoSOSRef.current = false;

        return;
      }

      // 🚀 GPS MAIS RÁPIDO
      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });

      const { latitude, longitude } =
        location.coords;

      const mapaUrl =
        `https://www.google.com/maps?q=${latitude},${longitude}`;

      if (auth.currentUser) {

        try {

          const userDoc = await getDoc(
            doc(db, 'users', auth.currentUser.uid)
          );

          const dadosUsuaria = userDoc.data();

          const idsContatos =
            dadosUsuaria?.contatosEmergencia || [];

          // ✅ SALVA HISTÓRICO
          await addDoc(
            collection(db, 'sos_history'),
            {
              userId: auth.currentUser.uid,

              userName:
                dadosUsuaria?.nome || 'Usuária',

              date:
                new Date().toLocaleString('pt-BR'),

              timestamp: serverTimestamp(),

              latitude,
              longitude,

              mapUrl: mapaUrl,
            }
          );

          console.log('✅ Histórico salvo');

          // ✅ BUSCA TOKENS
          const tokensParaEnviar: string[] = [];

          for (const id of idsContatos) {

            const contatoDoc =
              await getDoc(
                doc(db, 'users', id)
              );

            if (contatoDoc.exists()) {

              const token =
                contatoDoc.data()?.pushToken;

              if (token) {
                tokensParaEnviar.push(token);
              }
            }
          }

          console.log(
            '📨 Tokens:',
            tokensParaEnviar.length
          );

          // ✅ ENVIA PUSH
          if (tokensParaEnviar.length > 0) {

            const message =
              tokensParaEnviar.map((token) => ({
                to: token,

                sound: 'default',

                title:
                  '🚨 ALERTA DE EMERGÊNCIA - ZELLA',

                body:
                  `${dadosUsuaria?.nome || 'Sua amiga'} precisa de ajuda agora!`,

                data: {
                  latitude,
                  longitude,
                  mapaUrl,
                },

                priority: 'high',
              }));

            const response = await fetch(
              'https://exp.host/--/api/v2/push/send',
              {
                method: 'POST',

                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                },

                body: JSON.stringify(message),
              }
            );

            const resJson =
              await response.json();

            console.log('✅ PUSH:', resJson);
          }

        } catch (e) {
          console.log('❌ Erro push:', e);
        }
      }

      // ✅ WHATSAPP
      const msgWpp =
        `🚨 *ZELLA SOS: PRECISO DE AJUDA!* \n\nMinha localização: ${mapaUrl}`;

      const urlWpp =
        `whatsapp://send?text=${encodeURIComponent(msgWpp)}`;

      Linking.openURL(urlWpp).catch(() => {

        Linking.openURL(
          `https://wa.me/?text=${encodeURIComponent(msgWpp)}`
        );
      });

    } catch (error) {

      console.log('❌ Erro SOS:', error);

      Alert.alert(
        'Erro',
        'Não foi possível enviar o SOS.'
      );
    }

    // 🔓 LIBERA NOVAMENTE
    executandoSOSRef.current = false;
  };

  useEffect(() => {

    registerForPushNotificationsAsync();

    const subscription =
      VolumeManager.addVolumeListener(() => {

        cliquesRef.current += 1;

        console.log(
          '🔊 Cliques:',
          cliquesRef.current
        );

        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
          cliquesRef.current = 0;
        }, 2000);

        if (cliquesRef.current >= 3) {

          cliquesRef.current = 0;

          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }

          dispararSOS();
        }
      });

    return () => {

      subscription.remove();

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };

  }, []);

  return (

    <ThemeProvider
      value={
        colorScheme === 'dark'
          ? DarkTheme
          : DefaultTheme
      }
    >

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
      </Stack>

      <StatusBar style="auto" />

    </ThemeProvider>
  );
}