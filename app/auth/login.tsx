import { auth } from '@/config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';

import React, { useState, useCallback } from 'react';

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

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/theme';

// CONFIG GOOGLE
GoogleSignin.configure({
  webClientId:
    '290499813790-ocvq68ahnp9nsmahqc18c409ucnsseh6.apps.googleusercontent.com',
});

// Dicionário de Idiomas para Login
const textosLogin = {
  pt: {
    seletor: "EN",
    subtitulo: "Seu espaço seguro",
    avisoCampos: "Preencha e-mail e senha.",
    titEmailVerificado: "E-mail não verificado",
    msgEmailVerificado: "Você precisa validar a sua conta através do link enviado ao seu e-mail antes de acessar o aplicativo.",
    errInvalidos: "E-mail ou senha inválidos.",
    avisoReset: "Por favor, insira o seu e-mail no campo de texto acima para que possamos enviar o link de redefinição.",
    titReset: "E-mail enviado",
    msgReset: "Um link para redefinição de senha foi enviado para o endereço informado. Verifique também sua caixa de spam.",
    errReset: "Não foi possível enviar o e-mail de redefinição. Verifique se o endereço está correto.",
    errGoogleToken: "Token Google não encontrado.",
    errGoogleGeral: "Não foi possível entrar com Google.",
    esqueceuSenha: "Esqueceu a senha?",
    btnEntrar: "ENTRAR",
    divisor: "ou",
    btnGoogle: "Entrar com Google",
    semConta: "Não tem conta?",
    cadastrese: "Cadastre-se",
  },
  en: {
    seletor: "PT",
    subtitulo: "Your safe space",
    avisoCampos: "Please fill in both email and password.",
    titEmailVerificado: "Email not verified",
    msgEmailVerificado: "You need to validate your account through the link sent to your email before accessing the app.",
    errInvalidos: "Invalid email or password.",
    avisoReset: "Please enter your email in the text field above so we can send the reset link.",
    titReset: "Email sent",
    msgReset: "A password reset link has been sent to the provided address. Please also check your spam folder.",
    errReset: "Could not send reset email. Please verify if the address is correct.",
    errGoogleToken: "Google Token not found.",
    errGoogleGeral: "Could not sign in with Google.",
    esqueceuSenha: "Forgot password?",
    btnEntrar: "SIGN IN",
    divisor: "or",
    btnGoogle: "Sign in with Google",
    semConta: "Don't have an account?",
    cadastrese: "Sign up",
  }
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [idioma, setIdioma] = useState<'pt' | 'en'>('pt');

  const router = useRouter();

  // Monitora o AsyncStorage toda vez que o usuário entra na tela
  useFocusEffect(
    useCallback(() => {
      const carregarIdioma = async () => {
        try {
          const salvo = await AsyncStorage.getItem('@zella_idioma');
          if (salvo === 'pt' || salvo === 'en') {
            setIdioma(salvo);
          }
        } catch (e) {
          console.log(e);
        }
      };
      carregarIdioma();
    }, [])
  );

  // Alterna o idioma e salva a preferência global
  const alternarIdioma = async () => {
    const novoIdioma = idioma === 'pt' ? 'en' : 'pt';
    setIdioma(novoIdioma);
    await AsyncStorage.setItem('@zella_idioma', novoIdioma);
  };

  const t = textosLogin[idioma];

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert(idioma === 'pt' ? 'Aviso' : 'Notice', t.avisoCampos);
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        senha
      );

      const user = userCredential.user;

      if (!user.emailVerified) {
        Alert.alert(t.titEmailVerificado, t.msgEmailVerificado);
        setLoading(false);
        return; 
      }

      router.replace('/(tabs)');

    } catch (error) {
      Alert.alert(idioma === 'pt' ? 'Erro' : 'Error', t.errInvalidos);
    } finally {
      setLoading(false);
    }
  };

  const handleEsqueceuSenha = async () => {
    if (!email) {
      Alert.alert(idioma === 'pt' ? 'Aviso' : 'Notice', t.avisoReset);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(t.titReset, t.msgReset);
    } catch (error: any) {
      console.log(error);
      Alert.alert(idioma === 'pt' ? 'Erro' : 'Error', t.errReset);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        Alert.alert(idioma === 'pt' ? 'Erro' : 'Error', t.errGoogleToken);
        return;
      }

      const googleCredential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, googleCredential);
      router.replace('/(tabs)');

    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Login cancelado');
      } else {
        console.log(error);
        Alert.alert(idioma === 'pt' ? 'Erro' : 'Error', t.errGoogleGeral);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* SELETOR DE IDIOMA MINIMALISTA */}
      <View style={styles.languageContainer}>
        <TouchableOpacity style={styles.languageButton} onPress={alternarIdioma}>
          <Text style={styles.languageText}>{t.seletor}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inner}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/icon2.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Zella</Text>
          <Text style={styles.subtitle}>{t.subtitulo}</Text>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          {/* EMAIL */}
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
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
            <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
            <TextInput
              style={styles.input}
              placeholder={idioma === 'pt' ? "Senha" : "Password"}
              placeholderTextColor="#999"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!showSenha}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowSenha(!showSenha)} style={styles.eyeButton}>
              <Ionicons
                name={showSenha ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          {/* BOTÃO ESQUECEU A SENHA */}
          <TouchableOpacity onPress={handleEsqueceuSenha} style={styles.forgotContainer}>
            <Text style={styles.forgotText}>{t.esqueceuSenha}</Text>
          </TouchableOpacity>

          {/* LOGIN */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading || googleLoading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>{t.btnEntrar}</Text>
            )}
          </TouchableOpacity>

          {/* DIVISOR */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t.divisor}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* GOOGLE */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <View style={styles.googleButtonContent}>
                <Ionicons name="logo-google" size={20} color="#FFF" />
                <Text style={styles.googleButtonText}>{t.btnGoogle}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{t.semConta} </Text>
          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <Text style={styles.link}>{t.cadastrese}</Text>
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
  languageContainer: {
    position: 'absolute',
    top: 55,
    right: 25,
    zIndex: 10,
  },
  languageButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  languageText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3D1F2B',
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
  forgotContainer: {
    alignSelf: 'flex-end',
    marginVertical: 2,
    marginRight: 4,
  },
  forgotText: {
    color: '#8E8E8E',
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
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
    shadowOffset: { width: 0, height: 2 },
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