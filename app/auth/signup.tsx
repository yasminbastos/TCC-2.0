import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import React, { useState } from 'react';
// IMPORTANTE: Adicionei o db (Firestore) e as funções doc e setDoc
import { doc, setDoc } from 'firebase/firestore'; 
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

import { auth, db } from '../../config/firebase'; // Certifique-掲e que o db está exportado aqui
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
      // 1. Cria o usuário com e-mail e senha no Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // 2. Vincula o nome ao perfil do usuário no Auth
      await updateProfile(user, {
        displayName: nome
      });

      // 🔥 3. O PASSO QUE FALTAVA: Criar o documento na coleção 'users' no Firestore
      // Isso permite que outras pessoas te achem pelo e-mail
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        nome: nome,
        email: email.toLowerCase().trim(), // Salva em minúsculo para facilitar a busca
        contatosEmergencia: [], // Começa vazio
        pushToken: "", // Será preenchido pelo RootLayout
        createdAt: new Date()
      });

      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      router.replace('/(tabs)');

    } catch (error: any) {
      console.log(error);
      let mensagem = "Erro ao criar conta.";
      if (error.code === 'auth/email-already-in-use') mensagem = "Este e-mail já está em uso.";
      Alert.alert('Erro', mensagem);
    } finally {
      setLoading(false);
    }
  };

  // ... (restante do seu código de retorno UI continua igual)
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>

        <View style={styles.header}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Junte-se com segurança</Text>
        </View>

        <View style={styles.form}>

          {/* NOME */}
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={Colors.primary} />
            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          {/* EMAIL */}
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
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
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!showSenha}
            />
            <TouchableOpacity onPress={() => setShowSenha(!showSenha)}>
              <Ionicons
                name={showSenha ? 'eye-off' : 'eye'}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          {/* CONFIRMAR SENHA */}
          <View style={styles.inputWrapper}>
            <Ionicons name="shield-outline" size={20} color={Colors.primary} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar senha"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry={!showConfirmar}
            />
            <TouchableOpacity onPress={() => setShowConfirmar(!showConfirmar)}>
              <Ionicons
                name={showConfirmar ? 'eye-off' : 'eye'}
                size={20}
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
              <Text style={styles.buttonText}>CADASTRAR</Text>
            )}
          </TouchableOpacity>

        </View>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.footer}>
            Já tem conta? <Text style={styles.link}>Entrar</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF9' },
  inner: { flex: 1, justifyContent: 'center', padding: 25 },
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 80, height: 80, marginBottom: 10 },
  title: { fontSize: 26, fontWeight: 'bold', color: Colors.primary },
  subtitle: { fontSize: 14, color: '#8E8E8E' },
  form: { gap: 12 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    justifyContent: 'space-between'
  },
  input: { flex: 1, marginLeft: 10 },
  button: {
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
  footer: { textAlign: 'center', marginTop: 20, color: '#777' },
  link: { color: Colors.accent, fontWeight: 'bold' }
});