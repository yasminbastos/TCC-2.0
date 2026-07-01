import { Redirect } from 'expo-router';
import { auth } from '../config/firebase';

export default function Index() {
  const user = auth.currentUser;

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth/login" />;
}