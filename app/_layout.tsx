import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Alert, Linking, Vibration } from 'react-native';
import 'react-native-reanimated';

import { auth, db } from '../config/firebase';

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
  const executandoSOSRef = useRef(false);

  // 📝 REGISTRO DO TOKEN (Sincronizado com o projectId do app.json)
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

      // ✅ PROJECT ID CORRIGIDO PARA COMBINAR COM O APP.JSON
      const tokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId: '248a4f18-a586-41c6-98ef-9d781ece3dbb',
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

  // 🚨 FUNÇÃO SOS
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
      
      // 🗺️ LINK UNIVERSAL E OFICIAL DO GOOGLE MAPS (IDÊNTICO PARA TODAS AS FUNÇÕES)
      const mapaUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', auth.currentUser.uid));
          const dadosUsuaria = userDoc.data();
          const idsContatos = dadosUsuaria?.contatosEmergencia || [];

          // 1. Salvando histórico com a URL correta
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
              sound: 'default',
              title: '🚨 ALERTA DE EMERGÊNCIA - ZELLA',
              body: `${dadosUsuaria?.nome || 'Sua amiga'} precisa de ajuda agora!`,
              data: { latitude, longitude, mapUrl: mapaUrl }, // URL correta enviada nos metadados do Push
              priority: 'high',
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

      // 2. WhatsApp enviando rigorosamente o mesmo link universal
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

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log('👤 Usuário logado:', user.uid);
        
        await registerForPushNotificationsAsync(user.uid, user.email);

        // 🔄 AUTOMAÇÃO DE TESTE
        try {
          const userRef = doc(db, 'usuarios', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const dados = userDoc.data();
            if (!dados.contatosEmergencia || dados.contatosEmergencia.length === 0) {
              await setDoc(userRef, {
                contatosEmergencia: [user.uid]
              }, { merge: true });
              console.log('✅ Automação: Campo contatosEmergencia preenchido para testes!');
            }
          }
        } catch (error) {
          console.log('⚠️ Erro na automação dos contatos:', error);
        }

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