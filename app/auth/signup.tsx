import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';

import React, { useState } from 'react';

import {
  doc,
  setDoc
} from 'firebase/firestore';

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
  View
} from 'react-native';

import { auth, db } from '../../config/firebase';
import { Colors } from '../../constants/theme';

export default function SignUpScreen() {

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSignUp = async () => {

    if (!nome || !email || !senha || !confirmarSenha) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {

      // CRIA USUÁRIO
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          senha
        );

      const user = userCredential.user;

      // ATUALIZA PERFIL
      await updateProfile(user, {
        displayName: nome,
      });

      // SALVA NO FIRESTORE
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        nome: nome,
        email: email.toLowerCase().trim(),
        contatosEmergencia: [],
        pushToken: '',
        createdAt: new Date(),
      });

      Alert.alert(
        'Sucesso',
        'Conta criada com sucesso!'
      );

      router.replace('/(tabs)');

    } catch (error: any) {

      console.log(error);

      let mensagem = 'Erro ao criar conta.';

      if (error.code === 'auth/email-already-in-use') {
        mensagem = 'Este e-mail já está em uso.';
      }

      Alert.alert('Erro', mensagem);

    } finally {
      setLoading(false);
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
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
          />

          <Text style={styles.title}>
            Criar Conta
          </Text>

          <Text style={styles.subtitle}>
            Junte-se com segurança
          </Text>

        </View>

        {/* FORM */}
        <View style={styles.form}>

          {/* NOME */}
          <View style={styles.inputWrapper}>

            <Ionicons
              name="person-outline"
              size={20}
              color={Colors.primary}
            />

            <TextInput
              style={styles.input}
              placeholder="Nome"
              placeholderTextColor="#999"
              value={nome}
              onChangeText={setNome}
            />

          </View>

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

          {/* CONFIRMAR SENHA */}
          <View style={styles.inputWrapper}>

            <Ionicons
              name="shield-outline"
              size={20}
              color={Colors.primary}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirmar senha"
              placeholderTextColor="#999"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry={!showConfirmar}
              autoCapitalize="none"
            />

            <TouchableOpacity
              onPress={() =>
                setShowConfirmar(!showConfirmar)
              }
              style={styles.eyeButton}
            >

              <Ionicons
                name={
                  showConfirmar
                    ? 'eye-off-outline'
                    : 'eye-outline'
                }
                size={22}
                color="#888"
              />

            </TouchableOpacity>

          </View>

          {/* BOTÃO */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSignUp}
            disabled={loading}
          >

            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>
                CADASTRAR
              </Text>
            )}

          </TouchableOpacity>

        </View>

        {/* FOOTER */}
        <TouchableOpacity
          onPress={() => router.back()}
        >

          <Text style={styles.footer}>
            Já tem conta?{' '}
            <Text style={styles.link}>
              Entrar
            </Text>
          </Text>

        </TouchableOpacity>

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
    fontSize: 26,
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

  footer: {
    textAlign: 'center',
    marginTop: 20,
    color: '#777',
  },

  link: {
    color: Colors.accent,
    fontWeight: 'bold',
  },

});