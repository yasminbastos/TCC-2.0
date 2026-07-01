import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";

// Sua configuração (mantenha exatamente como está)
const firebaseConfig = {
  apiKey: "AIzaSyA1BD-dyScWUcnYi9H8ZKkKfX5RBxJNoNM",
  authDomain: "zella-f34bd.firebaseapp.com",
  projectId: "zella-f34bd",
  storageBucket: "zella-f34bd.firebasestorage.app",
  messagingSenderId: "290499813790",
  appId: "1:290499813790:web:514534b5de60d54ed4b68f",
  measurementId: "G-T4J59ZC085"
};

const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
