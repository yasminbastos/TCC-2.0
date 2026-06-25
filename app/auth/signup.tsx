import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';

import React, { useState, useCallback } from 'react';

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

import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../../config/firebase';
import { Colors } from '../../constants/theme';

// Dicionário de Idiomas para o Cadastro
const textosCadastro = {
  pt: {
    seletor: "EN",
    titulo: "Criar Conta",
    subtitulo: "Junte-se com segurança",
    avisoPreencha: "Preencha todos os campos.",
    avisoSenhas: "As senhas não coincidem.",
    titSenhaFraca: "Senha muito fraca",
    msgSenhaFraca: "A sua senha deve conter no mínimo 8 caracteres, incluindo pelo menos uma letra maiúscula, uma letra minúscula e um número.",
    titSucesso: "Conta criada!",
    msgSucesso: "Um e-mail de verificação foi enviado para o seu endereço. Por favor, valide sua conta no link recebido antes de fazer o login.",
    errUso: "Este e-mail já está em uso.",
    errGeral: "Erro ao criar conta.",
    btnCadastrar: "CADASTRAR",
    textoCheckbox: "Eu aceito a ",
    linkPolitica: "Política de Privacidade",
    avisoPolitica: "Você precisa aceitar a Política de Privacidade para continuar.",
    jaTemConta: "Já tem conta? ",
    entrar: "Entrar",
  },
  en: {
    seletor: "PT",
    titulo: "Create Account",
    subtitulo: "Join us securely",
    avisoPreencha: "Please fill in all fields.",
    avisoSenhas: "Passwords do not match.",
    titSenhaFraca: "Weak password",
    msgSenhaFraca: "Your password must be at least 8 characters long, including at least one uppercase letter, one lowercase letter, and one number.",
    titSucesso: "Account created!",
    msgSucesso: "A verification email has been sent to your address. Please validate your account using the link before signing in.",
    errUso: "This email is already in use.",
    errGeral: "Error creating account.",
    btnCadastrar: "SIGN UP",
    textoCheckbox: "I agree to the ",
    linkPolitica: "Privacy Policy",
    avisoPolitica: "You must accept the Privacy Policy to proceed.",
    jaTemConta: "Already have an account? ",
    entrar: "Sign in",
  }
};

export default function SignUpScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [aceitouPolitica, setAceitouPolitica] = useState(false); // <-- Estado do Checkbox
  const [loading, setLoading] = useState(false);
  const [idioma, setIdioma] = useState<'pt' | 'en'>('pt');

  const router = useRouter();

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

  const alternarIdioma = async () => {
    const novoIdioma = idioma === 'pt' ? 'en' : 'pt';
    setIdioma(novoIdioma);
    await AsyncStorage.setItem('@zella_idioma', novoIdioma);
  };

  const t = textosCadastro[idioma];

  const handleSignUp = async () => {
    if (!nome || !email || !senha || !confirmarSenha) {
      Alert.alert(idioma === 'pt' ? 'Erro' : 'Error', t.avisoPreencha);
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert(idioma === 'pt' ? 'Erro' : 'Error', t.avisoSenhas);
      return;
    }

    // Validação se o Checkbox está marcado
    if (!aceitouPolitica) {
      Alert.alert(idioma === 'pt' ? 'Aviso' : 'Notice', t.avisoPolitica);
      return;
    }

    const regexSenhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!regexSenhaForte.test(senha)) {
      Alert.alert(t.titSenhaFraca, t.msgSenhaFraca);
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      await updateProfile(user, { displayName: nome });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        nome: nome,
        email: email.toLowerCase().trim(),
        contatosEmergencia: [],
        pushToken: '',
        createdAt: new Date(),
      });

      await sendEmailVerification(user);

      Alert.alert(
        t.titSucesso,
        t.msgSucesso,
        [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
      );

    } catch (error: any) {
      console.log(error);
      let mensagem = t.errGeral;
      if (error.code === 'auth/email-already-in-use') {
        mensagem = t.errUso;
      }
      Alert.alert(idioma === 'pt' ? 'Erro' : 'Error', mensagem);
    } finally {
      setLoading(false);
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
          <Text style={styles.title}>{t.titulo}</Text>
          <Text style={styles.subtitle}>{t.subtitulo}</Text>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          {/* NOME */}
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={Colors.primary} />
            <TextInput
              style={styles.input}
              placeholder={idioma === 'pt' ? "Nome" : "Name"}
              placeholderTextColor="#999"
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

          {/* CONFIRMAR SENHA */}
          <View style={styles.inputWrapper}>
            <Ionicons name="shield-outline" size={20} color={Colors.primary} />
            <TextInput
              style={styles.input}
              placeholder={idioma === 'pt' ? "Confirmar senha" : "Confirm password"}
              placeholderTextColor="#999"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry={!showConfirmar}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowConfirmar(!showConfirmar)} style={styles.eyeButton}>
              <Ionicons
                name={showConfirmar ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          {/* CHECKBOX DA POLÍTICA DE PRIVACIDADE */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              style={[styles.checkbox, aceitouPolitica && styles.checkboxChecked]} 
              onPress={() => setAceitouPolitica(!aceitouPolitica)}
              activeOpacity={0.8}
            >
              {aceitouPolitica && <Ionicons name="checkmark" size={14} color="#FFF" />}
            </TouchableOpacity>
            
            <Text style={styles.checkboxLabel}>
              {t.textoCheckbox}
              <Text 
                style={styles.checkboxLink} 
                onPress={() => router.push('/auth/politica')}
              >
                {t.linkPolitica}
              </Text>
            </Text>
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
              <Text style={styles.buttonText}>{t.btnCadastrar}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.footer}>
            {t.jaTemConta}
            <Text style={styles.link}>{t.entrar}</Text>
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5,
    paddingHorizontal: 4,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D0C4C7',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#777',
    flex: 1,
  },
  checkboxLink: {
    color: Colors.accent,
    fontWeight: '600',
    textDecorationLine: 'underline',
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