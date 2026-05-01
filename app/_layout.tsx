import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { Vibration, Alert, Linking } from 'react-native';
import { VolumeManager } from 'react-native-volume-manager';
import * as Location from 'expo-location';
import * as SQLite from 'expo-sqlite'; // Adicionado para salvar no banco
import { useColorScheme } from '@/hooks/use-color-scheme';

import { initializeDatabase } from '../src/database/initialize';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    initializeDatabase();

    let cliques = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const dispararSOS = async () => {
  Vibration.vibrate([500, 200, 500]);
  
  // Alerta visual para você saber que o processo começou
  console.log("Iniciando busca de localização...");

  try {
    // 1. Força o pedido de permissão se ainda não tiver
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Erro", "O Zela precisa de permissão de GPS nas configurações do celular.");
      return;
    }

    // 2. Tenta pegar a localização (com timeout para não travar)
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    if (!location) {
      throw new Error("Localização não encontrada");
    }

    const { latitude, longitude } = location.coords;
    const mapaUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    
    // 3. Formatação do WhatsApp (IMPORTANTE: Verifique o número)
    const telefone = "55119XXXXXXXX"; // Use 55 + DDD + Número (ex: 5511988887777)
    const mensagem = `🚨 ZELA SOS: Preciso de ajuda! Localização: ${mapaUrl}`;
    
    // Tentativa direta pelo link de API do WhatsApp (mais confiável)
    const urlWhatsapp = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

    // 4. Salvar no Banco antes de sair do app
    const db = await SQLite.openDatabaseAsync('zela_db');
    const agora = new Date().toLocaleString('pt-BR');
    await db.runAsync(
      'INSERT INTO history (date, latitude, longitude, map_url) VALUES (?, ?, ?, ?)',
      [agora, latitude.toString(), longitude.toString(), mapaUrl]
    );

    // 5. Abrir o WhatsApp
    await Linking.openURL(urlWhatsapp);

  } catch (error) {
    console.error(error);
    Alert.alert("Erro no SOS", "Certifique-se de que o GPS está ligado e tente novamente.");
  }
};

    const subscription = VolumeManager.addVolumeListener(() => {
      cliques++;
      if (cliques === 1) {
        timer = setTimeout(() => { cliques = 0; }, 2000);
      }
      if (cliques >= 3) {
        if (timer) clearTimeout(timer);
        cliques = 0;
        dispararSOS();
      }
    });

    return () => {
      subscription.remove();
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}