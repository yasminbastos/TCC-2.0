import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '@/config/firebase';

export const BACKGROUND_SOS_PROFILE_KEY = '@zella_background_sos_profile';

export type BackgroundSosProfile = {
  uid: string;
  name: string;
  contactPushTokens: string[];
};

type BackgroundSosNativeModule = {
  start(): Promise<boolean>;
  stop(): Promise<boolean>;
  isEnabled(): Promise<boolean>;
  stopIncomingSosAlert(): Promise<boolean>;
  canUseFullScreenIntent(): Promise<boolean>;
  openFullScreenIntentSettings(): Promise<boolean>;
};

function nativeModule(): BackgroundSosNativeModule | null {
  if (Platform.OS !== 'android') return null;
  return NativeModules.ZellaBackgroundSos ?? null;
}

export async function startBackgroundSos() {
  const module = nativeModule();
  if (!module) throw new Error('O serviço de SOS em segundo plano não está disponível.');
  return module.start();
}

export async function stopBackgroundSos() {
  const module = nativeModule();
  return module ? module.stop() : false;
}

export async function stopIncomingSosAlert() {
  const module = nativeModule();
  return module ? module.stopIncomingSosAlert() : false;
}

export async function isBackgroundSosEnabled() {
  const module = nativeModule();
  return module ? module.isEnabled() : false;
}

export async function canUseFullScreenSosAlert() {
  const module = nativeModule();
  return module ? module.canUseFullScreenIntent() : false;
}

export async function openFullScreenSosSettings() {
  const module = nativeModule();
  return module ? module.openFullScreenIntentSettings() : false;
}

export async function syncBackgroundSosProfile(): Promise<BackgroundSosProfile | null> {
  const user = auth.currentUser;
  if (!user) return null;

  const userSnapshot = await getDoc(doc(db, 'usuarios', user.uid));
  const userData = userSnapshot.data();
  const contactIds: string[] = Array.isArray(userData?.contatosEmergencia)
    ? userData.contatosEmergencia.filter((value: unknown): value is string => typeof value === 'string')
    : [];

  const contactSnapshots = await Promise.all(
    contactIds.map((contactId) => getDoc(doc(db, 'usuarios', contactId)))
  );
  const contactPushTokens = Array.from(new Set(
    contactSnapshots
      .map((snapshot) => snapshot.data()?.pushToken)
      .filter((token: unknown): token is string => typeof token === 'string' && token.length > 0)
  ));

  const profile: BackgroundSosProfile = {
    uid: user.uid,
    name: typeof userData?.nome === 'string' && userData.nome.trim()
      ? userData.nome.trim()
      : user.displayName || 'Usuária',
    contactPushTokens,
  };

  await AsyncStorage.setItem(BACKGROUND_SOS_PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export async function readCachedBackgroundSosProfile(): Promise<BackgroundSosProfile | null> {
  const serialized = await AsyncStorage.getItem(BACKGROUND_SOS_PROFILE_KEY);
  if (!serialized) return null;

  try {
    const value = JSON.parse(serialized) as Partial<BackgroundSosProfile>;
    if (typeof value.uid !== 'string' || typeof value.name !== 'string') return null;
    return {
      uid: value.uid,
      name: value.name,
      contactPushTokens: Array.isArray(value.contactPushTokens)
        ? value.contactPushTokens.filter((token): token is string => typeof token === 'string')
        : [],
    };
  } catch {
    return null;
  }
}
