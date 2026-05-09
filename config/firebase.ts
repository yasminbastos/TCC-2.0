import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);