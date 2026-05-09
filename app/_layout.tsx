import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Alert, Linking, Vibration } from 'react-native';
import 'react-native-reanimated';
import { db, auth } from '../config/firebase';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// HARDWARE E SENSORES
import * as Location from 'expo-location';
import { VolumeManager } from 'react-native-volume-manager';

// NOTIFICAÇÕES
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

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

  // REGISTRO DE TOKEN
  async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) return;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    try {
      const tokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId: '6f73f0fa-6ef9-4f14-960e-afbcc59bbf0b',
      });
      const token = tokenResponse.data;
      console.log("LOG: Token Gerado ->", token);

      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, { 
          pushToken: token,
          email: auth.currentUser.email,
          uid: auth.currentUser.uid
        }, { merge: true });
        console.log("LOG: Documento e Token sincronizados no Firestore");
      }
    } catch (e) {
      console.error("Erro ao registrar notificações:", e);
    }
  }

  // --- FUNÇÃO SOS OTIMIZADA (Mais rápida e estável) ---
  const dispararSOS = async () => {
    Vibration.vibrate([500, 200, 500]);
    console.log("🚨 SOS: Protocolo de Alta Velocidade Iniciado!");
    
    try {
      // 1. Localização (Accuracy.Balanced é muito mais rápido que o High)
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return Alert.alert("Erro", "O Zela precisa de acesso ao GPS.");
      }

      const location = await Location.getCurrentPositionAsync({ 
        accuracy: Location.Accuracy.Balanced 
      });
      
      const { latitude, longitude } = location.coords;
      
      // Link do Google Maps corrigido para o formato universal
      const mapaUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

      // 2. WhatsApp IMEDIATO (Não espera o banco de dados)
      const msgWpp = `🚨 *ZELA SOS: PRECISO DE AJUDA!* \n\nMinha localização: ${mapaUrl}`;
      const urlWpp = `whatsapp://send?text=${encodeURIComponent(msgWpp)}`;

      Linking.openURL(urlWpp).catch(() => {
        Linking.openURL(`https://wa.me/?text=${encodeURIComponent(msgWpp)}`);
      });

      // 3. Processos de Fundo (Firebase e Push rodam sem travar o app)
      if (auth.currentUser) {
        (async () => {
          try {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
            const dadosUsuaria = userDoc.data();
            const idsContatos = dadosUsuaria?.contatosEmergencia || [];

            // Salva no histórico (Sem dar 'await' no fluxo principal)
            addDoc(collection(db, 'sos_history'), {
              userId: auth.currentUser!.uid,
              userName: dadosUsuaria?.nome || 'Usuária',
              date: new Date().toLocaleString('pt-BR'),
              timestamp: serverTimestamp(),
              latitude,
              longitude,
              mapUrl: mapaUrl
            });

            console.log("✅ LOG: Histórico sendo salvo em segundo plano.");

            // Busca e envia as notificações push
            if (idsContatos.length > 0) {
              const tokensParaEnviar: string[] = [];
              for (const id of idsContatos) {
                const contatoDoc = await getDoc(doc(db, 'users', id));
                const token = contatoDoc.data()?.pushToken;
                if (token) tokensParaEnviar.push(token);
              }

              if (tokensParaEnviar.length > 0) {
                fetch('https://exp.host/--/api/v2/push/send', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(tokensParaEnviar.map(token => ({
                    to: token,
                    sound: 'default',
                    title: '🚨 ALERTA DE EMERGÊNCIA - ZELA',
                    body: `${dadosUsuaria?.nome || 'Sua amiga'} precisa de ajuda agora!`,
                    data: { latitude, longitude, mapaUrl },
                    priority: 'high',
                  }))),
                });
                console.log("✅ LOG: Requisição de Push enviada.");
              }
            }
          } catch (e) {
            console.error("Erro no processamento paralelo:", e);
          }
        })();
      }

    } catch (error) {
      console.error("Erro no processo SOS:", error);
      Alert.alert("Erro no SOS", "Ocorreu um problema ao disparar o alerta.");
    }
  };

  useEffect(() => {
    registerForPushNotificationsAsync();

    const subscription = VolumeManager.addVolumeListener(() => {
      cliquesRef.current += 1;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        cliquesRef.current = 0;
      }, 1500); 

      if (cliquesRef.current >= 3) {
        cliquesRef.current = 0;
        if (timerRef.current) clearTimeout(timerRef.current);
        dispararSOS();
      }
    });

    return () => {
      subscription.remove();
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