import { auth } from '@/config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { Colors } from '../../constants/theme';

// CONFIG GOOGLE
GoogleSignin.configure({
  webClientId:
    '290499813790-ocvq68ahnp9nsmahqc18c409ucnsseh6.apps.googleusercontent.com',
});

export default function LoginScreen() {

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const router = useRouter();

  // LOGIN EMAIL E SENHA
  const handleLogin = async () => {

    if (!email || !senha) {
      Alert.alert('Aviso', 'Preencha e-mail e senha.');
      return;
    }

    setLoading(true);

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        senha
      );

      router.replace('/(tabs)');

    } catch (error) {

      Alert.alert(
        'Erro',
        'E-mail ou senha inválidos.'
      );

    } finally {

      setLoading(false);
    }
  };

  // LOGIN GOOGLE
  const handleGoogleLogin = async () => {

    try {

      setGoogleLoading(true);

      await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();

      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        Alert.alert(
          'Erro',
          'Token Google não encontrado.'
        );
        return;
      }

      const googleCredential =
        GoogleAuthProvider.credential(idToken);

      await signInWithCredential(
        auth,
        googleCredential
      );

      router.replace('/(tabs)');

    } catch (error: any) {

      if (
        error.code ===
        statusCodes.SIGN_IN_CANCELLED
      ) {

        console.log('Login cancelado');

      } else {

        console.log(error);

        Alert.alert(
          'Erro',
          'Não foi possível entrar com Google.'
        );
      }

    } finally {

      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }
      style={styles.container}
    >
      <View style={styles.inner}>

        {/* HEADER */}
        <View style={styles.header}>

          <Image
            source={require('../../assets/images/icon2.png')}
            style={styles.logo}
          />

          <Text style={styles.title}>
            Zella
          </Text>

          <Text style={styles.subtitle}>
            Seu espaço seguro
          </Text>

        </View>

        {/* FORM */}
        <View style={styles.form}>

          {/* EMAIL */}
          <View style={styles.inputWrapper}>

            <Ionicons
              name="mail-outline"
              size={20}
              color={Colors.primary}
            />

            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

          </View>

          {/* SENHA */}
          <View style={styles.inputWrapper}>

            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={Colors.primary}
            />

            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#999"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!showSenha}
              autoCapitalize="none"
            />

            <TouchableOpacity
              onPress={() =>
                setShowSenha(!showSenha)
              }
              style={styles.eyeButton}
            >
              <Ionicons
                name={
                  showSenha
                    ? 'eye-off-outline'
                    : 'eye-outline'
                }
                size={22}
                color="#888"
              />
            </TouchableOpacity>

          </View>

          {/* LOGIN */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={
              loading || googleLoading
            }
          >

            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>
                ENTRAR
              </Text>
            )}

          </TouchableOpacity>

          {/* DIVISOR */}
          <View style={styles.dividerRow}>

            <View style={styles.dividerLine} />

            <Text style={styles.dividerText}>
              ou
            </Text>

            <View style={styles.dividerLine} />

          </View>

          {/* GOOGLE */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            disabled={
              loading || googleLoading
            }
          >

            {googleLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <View
                style={
                  styles.googleButtonContent
                }
              >

                <Ionicons
                  name="logo-google"
                  size={20}
                  color="#FFF"
                />

                <Text
                  style={
                    styles.googleButtonText
                  }
                >
                  Entrar com Google
                </Text>

              </View>
            )}

          </TouchableOpacity>

        </View>

        {/* FOOTER */}
        <View style={styles.footerRow}>

          <Text style={styles.footerText}>
            Não tem conta?
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push('/auth/signup')
            }
          >

            <Text style={styles.link}>
              {' '}Cadastre-se
            </Text>

          </TouchableOpacity>

        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FDFBF9',
  },

  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
  },

  header: {
    alignItems: 'center',
    marginBottom: 30,
  },

  logo: {
    width: 85,
    height: 85,
    marginBottom: 10,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: Colors.primary,
  },

  subtitle: {
    fontSize: 14,
    color: '#8E8E8E',
  },

  form: {
    gap: 12,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },

  input: {
    flex: 1,
    marginLeft: 10,
    color: '#000',
  },

  eyeButton: {
    paddingLeft: 10,
  },

  button: {
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EFEFEF',
  },

  dividerText: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 14,
  },

  googleButton: {
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.1,
    shadowRadius: 3,

    elevation: 3,
  },

  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  googleButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },

  footerText: {
    color: '#777',
  },

  link: {
    color: Colors.accent,
    fontWeight: 'bold',
  },
});