import { auth } from '@/config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
import { Colors } from '../../constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Aviso', 'Preencha e-mail e senha.');
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, senha);

      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Erro', 'E-mail ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>

        {/* LOGO */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/icon2.png')}
            style={styles.logo}
          />

          <Text style={styles.title}>Zella</Text>

          <Text style={styles.subtitle}>
            Seu espaço seguro
          </Text>
        </View>

        {/* FORMULÁRIO */}
        <View style={styles.form}>

          {/* INPUT EMAIL */}
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

          {/* INPUT SENHA */}
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
              onPress={() => setShowSenha(!showSenha)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showSenha ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          {/* BOTÃO LOGIN */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>
                ENTRAR
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* RODAPÉ */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>
            Não tem conta?
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/auth/signup')}
          >
            <Text style={styles.link}>
              Cadastre-se
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
    width: 80,
    height: 80,
    marginBottom: 10,
  },

  title: {
    fontSize: 28,
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

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },

  footerText: {
    color: '#777',
  },

  link: {
    color: Colors.accent,
    fontWeight: 'bold',
  },
});