import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FirebaseAuth from "firebase/auth";
import { getAuth, initializeAuth, type Persistence } from "firebase/auth";

// O entrypoint React Native exporta esta função em runtime, embora os tipos
// genéricos do pacote Firebase usados pelo TypeScript não a exponham.
const { getReactNativePersistence } = FirebaseAuth as typeof FirebaseAuth & {
  getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
};

const firebaseConfig = {
  apiKey: "AIzaSyA1BD-dyScWUcnYi9H8ZKkKfX5RBxJNoNM",
  authDomain: "zella-f34bd.firebaseapp.com",
  projectId: "zella-f34bd",
  storageBucket: "zella-f34bd.firebasestorage.app",
  messagingSenderId: "290499813790",
  appId: "1:290499813790:web:514534b5de60d54ed4b68f",
  measurementId: "G-T4J59ZC085"
};

// Inicializa o Firebase de forma segura para evitar erros de re-initialization
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Mantém a sessão disponível quando o Android recria o processo para executar
// o SOS em segundo plano. No Fast Refresh, a instância pode já existir.
export const auth = (() => {
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(firebaseApp);
  }
})();
export const db = getFirestore(firebaseApp);
