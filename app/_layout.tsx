import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { Vibration, Alert, Platform } from 'react-native';
import { VolumeManager } from 'react-native-volume-manager';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    let cliques = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    // Função de alerta
    const dispararSOS = () => {
      Vibration.vibrate([500, 200, 500]);
      Alert.alert("SERENE: EMERGÊNCIA", "Acionando contatos de segurança...");
    };

    // Monitor do Volume
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
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}