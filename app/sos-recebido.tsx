import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { playSOSSound, stopSOSSound } from './useSOSAlarm';

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function validGoogleMapsUrl(value: string | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return url.protocol === 'https:' &&
      (hostname === 'maps.google.com' || hostname === 'google.com')
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function coordinate(value: string | undefined, minimum: number, maximum: number) {
  if (!value || !Number.isFinite(Number(value))) return null;
  const parsed = Number(value);
  return parsed >= minimum && parsed <= maximum ? parsed : null;
}

export default function SosRecebidoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    senderName?: string | string[];
    latitude?: string | string[];
    longitude?: string | string[];
    mapUrl?: string | string[];
    testMode?: string | string[];
  }>();
  const [alarmeAtivo, setAlarmeAtivo] = useState(true);

  const testMode = firstParam(params.testMode) === 'true';
  const senderName = firstParam(params.senderName)?.trim() || 'Contato de confiança';
  const latitude = coordinate(firstParam(params.latitude), -90, 90);
  const longitude = coordinate(firstParam(params.longitude), -180, 180);
  const mapUrl = useMemo(() => {
    if (testMode) return null;
    const receivedUrl = validGoogleMapsUrl(firstParam(params.mapUrl));
    if (receivedUrl) return receivedUrl;
    if (latitude === null || longitude === null) return null;
    return `https://maps.google.com/?q=${latitude},${longitude}`;
  }, [latitude, longitude, params.mapUrl, testMode]);

  useEffect(() => {
    playSOSSound();
    return () => {
      stopSOSSound();
    };
  }, []);

  const pararAlarme = async () => {
    await stopSOSSound();
    setAlarmeAtivo(false);
  };

  const abrirLocalizacao = async () => {
    if (testMode || !mapUrl) return;
    try {
      await Linking.openURL(mapUrl);
    } catch {
      Alert.alert('Não foi possível abrir o mapa', 'Tente novamente em instantes.');
    }
  };

  const abrirAcessoNaoPerturbe = async () => {
    if (Platform.OS !== 'android') return;
    try {
      await Linking.sendIntent('android.settings.NOTIFICATION_POLICY_ACCESS_SETTINGS');
    } catch {
      Alert.alert(
        'Abra as configurações do Android',
        'Procure por Acesso especial > Acesso ao Não Perturbe e autorize o Zella.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.alertIcon}>
          <Ionicons name="warning" size={52} color="#FFFFFF" />
        </View>
        <Text style={styles.eyebrow}>ALERTA DE SOS</Text>
        {testMode && <Text style={styles.testMode}>MODO DE TESTE LOCAL</Text>}
        <Text style={styles.title}>
          {testMode ? 'Alerta gerado somente neste aparelho' : `${senderName} precisa de ajuda`}
        </Text>
        {testMode && <Text style={styles.testSender}>{senderName}</Text>}
        <Text style={styles.location}>
          {mapUrl ? 'Localização disponível' : 'Localização indisponível'}
        </Text>

        <TouchableOpacity
          accessibilityRole="button"
          disabled={!mapUrl}
          onPress={abrirLocalizacao}
          style={[styles.primaryButton, !mapUrl && styles.disabledButton]}
        >
          <Ionicons name="location" size={22} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Abrir localização</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          disabled={!alarmeAtivo}
          onPress={pararAlarme}
          style={[styles.stopButton, !alarmeAtivo && styles.stoppedButton]}
        >
          <Ionicons name="volume-mute" size={22} color="#751935" />
          <Text style={styles.stopButtonText}>
            {alarmeAtivo ? 'Parar alarme' : 'Alarme parado'}
          </Text>
        </TouchableOpacity>

        {Platform.OS === 'android' && (
          <View style={styles.dndCard}>
            <Ionicons name="moon" size={24} color="#751935" />
            <View style={styles.dndText}>
              <Text style={styles.dndTitle}>Alertas no Não Perturbe</Text>
              <Text style={styles.dndDescription}>
                Autorize o Zella no acesso especial do Android para permitir alertas SOS
                durante o modo Não Perturbe.
              </Text>
              <TouchableOpacity onPress={abrirAcessoNaoPerturbe}>
                <Text style={styles.dndLink}>Abrir acesso especial</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#751935' },
  header: { paddingHorizontal: 20, paddingTop: 12 },
  backButton: { alignSelf: 'flex-start', padding: 8 },
  content: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FDF9FA',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: 20,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  alertIcon: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#B4233F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  eyebrow: { color: '#B4233F', fontSize: 14, fontWeight: '800', letterSpacing: 1.5 },
  testMode: {
    color: '#751935',
    backgroundColor: '#F5E9EE',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  title: {
    color: '#3D1F2B',
    fontSize: 27,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 10,
  },
  testSender: { color: '#725563', fontSize: 14, fontWeight: '700', marginTop: 8 },
  location: { color: '#725563', fontSize: 16, marginBottom: 34, marginTop: 12 },
  primaryButton: {
    width: '100%',
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: '#751935',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  disabledButton: { backgroundColor: '#BDAEB4' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  stopButton: {
    width: '100%',
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1CCD5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 12,
  },
  stoppedButton: { opacity: 0.55 },
  stopButtonText: { color: '#751935', fontSize: 16, fontWeight: '700' },
  dndCard: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#F5E9EE',
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    padding: 18,
  },
  dndText: { flex: 1 },
  dndTitle: { color: '#3D1F2B', fontSize: 15, fontWeight: '700' },
  dndDescription: { color: '#725563', fontSize: 13, lineHeight: 19, marginTop: 5 },
  dndLink: { color: '#751935', fontSize: 14, fontWeight: '800', marginTop: 10 },
});
