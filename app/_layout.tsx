import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Alert, Linking, Platform, Vibration } from 'react-native';
import 'react-native-reanimated';
import { playSOSSound, stopSOSSound } from './useSOSAlarm';

import { auth, db } from '../config/firebase';

import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import * as Location from 'expo-location';
import { VolumeManager } from 'react-native-volume-manager';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
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

async function setupEmergencyChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('sos-emergency-v2', {
      name: 'Alerta de Emergência SOS',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500, 250, 500],
      sound: 'default',
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
    });
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const cliquesRef = useRef(0);
  const timerRef = useRef<any>(null);
  const executandoSOSRef = useRef(false);
  const [alertaAtivo, setAlertaAtivo] = useState<any>(null);

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

  const dispararSOS = async () => {
    if (executandoSOSRef.current) return;

    executandoSOSRef.current = true;
    console.log('🚨 SOS INICIADO');
    Vibration.vibrate([500, 200, 500]);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Erro', 'Permita o acesso ao GPS nas configurações do aparelho.');
        executandoSOSRef.current = false;
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      const mapaUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', auth.currentUser.uid));
          const dadosUsuaria = userDoc.data();
          const idsContatos = dadosUsuaria?.contatosEmergencia || [];

          await addDoc(collection(db, 'sos_history'), {
            userId: auth.currentUser.uid,
            userName: dadosUsuaria?.nome || 'Usuária',
            date: new Date().toLocaleString('pt-BR'),
            timestamp: serverTimestamp(),
            latitude,
            longitude,
            mapUrl: mapaUrl,
          });

          console.log('✅ Histórico salvo no Firestore');

          const tokensParaEnviar: string[] = [];
          for (const id of idsContatos) {
            const contatoDoc = await getDoc(doc(db, 'usuarios', id));
            if (contatoDoc.exists()) {
              const token = contatoDoc.data()?.pushToken;
              if (token) tokensParaEnviar.push(token);
            }
          }

          console.log('📨 Enviando para', tokensParaEnviar.length, 'contatos.');

          if (tokensParaEnviar.length > 0) {
            const messages = tokensParaEnviar.map((token) => ({
              to: token,
              title: '🚨 ALERTA DE EMERGÊNCIA - ZELLA',
              body: `${dadosUsuaria?.nome || 'Sua amiga'} precisa de ajuda agora!`,
              data: { latitude, longitude, mapUrl: mapaUrl },
              priority: 'high',
              channelId: 'sos-emergency-v2',
              _displayInForeground: true,
            }));

            const response = await fetch('https://exp.host/--/api/v2/push/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify(messages),
            });

            const resJson = await response.json();
            console.log('✅ Resposta da API Expo:', resJson);
          }
        } catch (e) {
          console.log('❌ Erro ao processar banco/notificações:', e);
        }
      }

      const msgWpp = `🚨 *ZELLA SOS: PRECISO DE AJUDA!* \n\nMinha localização: ${mapaUrl}`;
      const urlWpp = `whatsapp://send?text=${encodeURIComponent(msgWpp)}`;

      Linking.openURL(urlWpp).catch(() => {
        Linking.openURL(`https://wa.me/?text=${encodeURIComponent(msgWpp)}`);
      });

    } catch (error) {
      console.log('❌ Erro geral no SOS:', error);
    }

    executandoSOSRef.current = false;
  };

  // 🚨 POPOP / ALERTA VISUAL COM SOM E VIBRAÇÃO CONTINUA
  useEffect(() => {
    if (alertaAtivo) {
      const linkDoMapa = alertaAtivo.mapUrl || `https://maps.google.com/?q=${alertaAtivo.latitude},${alertaAtivo.longitude}`;

      Alert.alert(
        "🚨 ALERTA DE SOS RECEBIDO!",
        `${alertaAtivo.userName || 'Sua amiga'} precisa de ajuda agora!`,
        [
          { 
            text: "Cancelar", 
            style: "cancel",
            onPress: () => {
              stopSOSSound();
              Vibration.cancel();
              setAlertaAtivo(null);
            } 
          },
          { 
            text: "Abrir Mapa", 
            onPress: () => {
              stopSOSSound();
              Vibration.cancel();
              setAlertaAtivo(null);
              Linking.openURL(linkDoMapa);
            } 
          }
        ],
        { cancelable: false }
      );
    }
  }, [alertaAtivo]);

  useEffect(() => {
    setupEmergencyChannel();

    let unsubscribeFirestore: () => void;

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log('👤 Usuário logado:', user.uid);
        
        await registerForPushNotificationsAsync(user.uid, user.email);

        // 🚨 ESCUTA O FIRESTORE PARA RECONHECER O SOS EM TEMPO REAL E TOCAR O ALARME
        const q = query(
          collection(db, 'sos_history'), //conversa com o banco de dados
          orderBy('timestamp', 'desc'),
          limit(1)
        );

        let cargaInicial = true;
        unsubscribeFirestore = onSnapshot(q, (snapshot) => { //receber a notificação em tempo real
          if (cargaInicial) {
            cargaInicial = false;
            return;
          }

          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const dados = change.doc.data();
              
              // Se o SOS não foi disparado por este próprio usuário
             // if (dados.userId !== user.uid) {
                setAlertaAtivo(dados);
                Vibration.vibrate([1000, 500, 1000, 500], true);
                playSOSSound(); // toca o áudio
            //  }
            }
          });
        });

      } else {
        console.log('👤 Nenhum usuário logado.');
      }
    });

    let subscription: any = null;

    const timerInicializacao = setTimeout(() => {
      try {
        subscription = VolumeManager.addVolumeListener(() => {
          cliquesRef.current += 1;
          
          if (timerRef.current) clearTimeout(timerRef.current);

          timerRef.current = setTimeout(() => {
            cliquesRef.current = 0;
          }, 2000);

          if (cliquesRef.current >= 2) {
            cliquesRef.current = 0;
            if (timerRef.current) clearTimeout(timerRef.current);
            dispararSOS();
          }
        });
      } catch (error) {
        console.log('⚠️ Erro ao iniciar VolumeManager:', error);
      }
    }, 1500);

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
      clearTimeout(timerInicializacao);
      if (subscription?.remove) subscription.remove();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}