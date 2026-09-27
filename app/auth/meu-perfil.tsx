import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useState, useCallback } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Switch,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db } from "../../config/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showAppAlert } from '@/components/app-alert';

// Avatares personalizados
const AVATARES = [
  { id: "person", icon: "person", color: "#9c3569" },
  { id: "happy", icon: "happy-outline", color: "#9c3569" },
  { id: "planet", icon: "planet-outline", color: "#9c3569" },
  { id: "star", icon: "star-outline", color: "#9c3569" },
  { id: "paw", icon: "paw-outline", color: "#9c3569" },
  { id: "leaf", icon: "leaf-outline", color: "#9c3569" },
];

// Dicionário de tradução local
const textosMeuPerfil = {
  pt: {
    titulo: "Meus Dados",
    instrucaoAvatar: "Escolha um avatar para manter seu anonimato:",
    labelNome: "Nome Completo",
    placeholderNome: "Seu nome completo",
    labelUsername: "Nome de Usuário (Apelido)",
    placeholderUsername: "@seu_user",
    labelTelefone: "Telefone / Celular",
    placeholderTelefone: "(11) 99999-9999",
    labelWhatsappSos: "Alertas SOS pelo WhatsApp",
    ajudaWhatsappSos: "Receba mensagens de emergência de pessoas que adicionaram você à rede de segurança.",
    telefoneObrigatorio: "Informe um celular válido com DDD antes de ativar os alertas pelo WhatsApp.",
    whatsappAtivo: "Ativado",
    whatsappInativo: "Desativado",
    whatsappSalvando: "Salvando...",
    whatsappAtivadoTitulo: "WhatsApp ativado",
    whatsappAtivadoMsg: "Sua preferência e seu número foram salvos. Você poderá receber alertas SOS de seus contatos de confiança.",
    whatsappDesativadoTitulo: "WhatsApp desativado",
    whatsappDesativadoMsg: "Você não receberá novos alertas SOS por este canal.",
    whatsappErro: "Não foi possível atualizar a preferência do WhatsApp.",
    labelEmail: "E-mail da Conta",
    botaoSalvar: "SALVAR ALTERAÇÕES",
    botaoSalvando: "SALVANDO...",
    loadingText: "Carregando seus dados...",
    aviso: "Aviso",
    avisoNomeVazio: "O nome não pode ficar em branco.",
    sucesso: "Sucesso",
    sucessoMsg: "Perfil atualizado e salvo com segurança!",
    erro: "Erro",
    erroMsg: "Não foi possível salvar as alterações.",
  },
  en: {
    titulo: "My Data",
    instrucaoAvatar: "Choose an avatar to remain anonymous:",
    labelNome: "Full Name",
    placeholderNome: "Your full name",
    labelUsername: "Username (Nickname)",
    placeholderUsername: "@your_user",
    labelTelefone: "Phone Number",
    placeholderTelefone: "+1 (11) 99999-9999",
    labelWhatsappSos: "WhatsApp SOS alerts",
    ajudaWhatsappSos: "Receive emergency messages from people who added you to their safety network.",
    telefoneObrigatorio: "Enter a valid mobile number with area code before enabling WhatsApp alerts.",
    whatsappAtivo: "Enabled",
    whatsappInativo: "Disabled",
    whatsappSalvando: "Saving...",
    whatsappAtivadoTitulo: "WhatsApp enabled",
    whatsappAtivadoMsg: "Your preference and number were saved. You can receive SOS alerts from your trusted contacts.",
    whatsappDesativadoTitulo: "WhatsApp disabled",
    whatsappDesativadoMsg: "You will no longer receive new SOS alerts through this channel.",
    whatsappErro: "Could not update the WhatsApp preference.",
    labelEmail: "Account Email",
    botaoSalvar: "SAVE CHANGES",
    botaoSalvando: "SAVING...",
    loadingText: "Loading your data...",
    aviso: "Warning",
    avisoNomeVazio: "Name field cannot be blank.",
    sucesso: "Success",
    sucessoMsg: "Profile securely updated and saved!",
    erro: "Error",
    erroMsg: "Could not save changes.",
  },
};

export default function MeuPerfil() {
  const router = useRouter();
  const user = auth.currentUser;

  // Estado do idioma
  const [idioma, setIdioma] = useState<"pt" | "en">("pt");

  // Estados do formulário
  const [nome, setNome] = useState(user?.displayName || "");
  const [username, setUsername] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsappSosEnabled, setWhatsappSosEnabled] = useState(false);
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  const [avatarSelecionado, setAvatarSelecionado] = useState("person");

  // Estados de controle da interface
  const [isEditingNome, setIsEditingNome] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingTelefone, setIsEditingTelefone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);

  // Carrega o idioma de forma reativa quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      const carregarIdioma = async () => {
        try {
          const salvo = await AsyncStorage.getItem("@zella_idioma");
          if (salvo === "pt" || salvo === "en") {
            setIdioma(salvo);
          }
        } catch (error) {
          console.log("Erro ao carregar idioma no Meu Perfil:", error);
        }
      };
      carregarIdioma();
    }, [])
  );

  // Busca os dados adicionais salvos no Firestore ao abrir a tela
  useEffect(() => {
    async function carregarDadosPerfil() {
      if (!user) return;
      try {
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const dados = docSnap.data();
          if (dados.username) setUsername(dados.username);
          if (dados.telefone) setTelefone(dados.telefone);
          setWhatsappSosEnabled(dados.whatsappSosEnabled === true);
          if (dados.avatarId) setAvatarSelecionado(dados.avatarId);
        }
      } catch (error) {
        console.log("Erro ao carregar dados do Firestore:", error);
      } finally {
        setLoadingDados(false);
      }
    }

    carregarDadosPerfil();
  }, [user]);

  const t = textosMeuPerfil[idioma];

  const normalizeWhatsAppPhone = (value: string) => {
    const trimmed = value.trim();
    const digits = trimmed.replace(/\D/g, '');
    if (!digits) return null;

    const normalized = trimmed.startsWith('+') || digits.startsWith('55')
      ? digits
      : digits.length === 10 || digits.length === 11
        ? `55${digits}`
        : digits;

    return normalized.length >= 10 && normalized.length <= 15 ? `+${normalized}` : null;
  };

  const handleWhatsappChange = async (enabled: boolean) => {
    if (!user || savingWhatsapp) return;

    const normalizedPhone = normalizeWhatsAppPhone(telefone);
    if (enabled && !normalizedPhone) {
      setIsEditingTelefone(true);
      showAppAlert(t.aviso, t.telefoneObrigatorio);
      return;
    }

    setSavingWhatsapp(true);
    try {
      await setDoc(doc(db, 'usuarios', user.uid), {
        whatsappSosEnabled: enabled,
        ...(normalizedPhone ? { telefone: normalizedPhone } : {}),
        updatedAt: new Date(),
      }, { merge: true });

      if (normalizedPhone) setTelefone(normalizedPhone);
      setWhatsappSosEnabled(enabled);
      showAppAlert(
        enabled ? t.whatsappAtivadoTitulo : t.whatsappDesativadoTitulo,
        enabled ? t.whatsappAtivadoMsg : t.whatsappDesativadoMsg
      );
    } catch (error) {
      console.log('Erro ao atualizar alertas do WhatsApp:', error);
      showAppAlert(t.erro, t.whatsappErro);
    } finally {
      setSavingWhatsapp(false);
    }
  };

  const handleSalvar = async () => {
    if (!user) return;
    if (!nome.trim()) {
      showAppAlert(t.aviso, t.avisoNomeVazio);
      return;
    }
    const normalizedPhone = normalizeWhatsAppPhone(telefone);
    if (whatsappSosEnabled && !normalizedPhone) {
      showAppAlert(t.aviso, t.telefoneObrigatorio);
      return;
    }

    setLoading(true);
    try {
      await updateProfile(user, { displayName: nome.trim() });
      
      const docRef = doc(db, "usuarios", user.uid);
      await setDoc(docRef, {
        nome: nome.trim(),
        username: username.trim(),
        telefone: normalizedPhone ?? telefone.trim(),
        whatsappSosEnabled,
        avatarId: avatarSelecionado,
        email: user.email,
        updatedAt: new Date()
      }, { merge: true });

      setIsEditingNome(false);
      setIsEditingUsername(false);
      setIsEditingTelefone(false);
      if (normalizedPhone) setTelefone(normalizedPhone);

      showAppAlert(t.sucesso, t.sucessoMsg);
    } catch (error) {
      console.log("Erro ao salvar dados no Firestore:", error);
      showAppAlert(t.erro, t.erroMsg);
    } finally {
      setLoading(false);
    }
  };

  const currentAvatar = AVATARES.find(a => a.id === avatarSelecionado) || AVATARES[0];

  if (loadingDados) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#751935" />
        <Text style={styles.loadingText}>{t.loadingText}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* HEADER DE VOLTAR */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3D1F2B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.titulo}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* EXIBIÇÃO DO AVATAR ATUAL */}
        <View style={styles.avatarSection}>
          {/* Borda vinho (#751935) idêntica à tela principal de perfil */}
          <View style={[styles.avatarPlaceholder, { borderColor: "#751935" }]}>
            <Ionicons name={currentAvatar.icon as any} size={70} color={currentAvatar.color} />
          </View>
          <Text style={styles.avatarInstruction}>{t.instrucaoAvatar}</Text>
          
          {/* SELETOR DE AVATARES DISPONÍVEIS */}
          <View style={styles.avatarList}>
            {AVATARES.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.avatarOption,
                  avatarSelecionado === item.id && { backgroundColor: "#75193515", borderColor: "#751935" }
                ]}
                onPress={() => setAvatarSelecionado(item.id)}
              >
                <Ionicons name={item.icon as any} size={26} color={item.color} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CAMPOS DO FORMULÁRIO */}
        <View style={styles.form}>
          
          {/* NOME COMPLETO */}
          <Text style={styles.label}>{t.labelNome}</Text>
          <View style={[styles.inputWrapper, !isEditingNome && styles.disabledInput]}>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              editable={isEditingNome}
              placeholder={t.placeholderNome}
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => setIsEditingNome(!isEditingNome)}>
              <Ionicons
                name={isEditingNome ? "checkmark-circle" : "pencil-sharp"}
                size={20}
                color="#9c3569"
              />
            </TouchableOpacity>
          </View>

          {/* NOME DE USUÁRIO (@USERNAME) */}
          <Text style={styles.label}>{t.labelUsername}</Text>
          <View style={[styles.inputWrapper, !isEditingUsername && styles.disabledInput]}>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              editable={isEditingUsername}
              placeholder={t.placeholderUsername}
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => setIsEditingUsername(!isEditingUsername)}>
              <Ionicons
                name={isEditingUsername ? "checkmark-circle" : "pencil-sharp"}
                size={20}
                color="#9c3569"
              />
            </TouchableOpacity>
          </View>

          {/* TELEFONE */}
          <Text style={styles.label}>{t.labelTelefone}</Text>
          <View style={[styles.inputWrapper, !isEditingTelefone && styles.disabledInput]}>
            <TextInput
              style={styles.input}
              value={telefone}
              onChangeText={setTelefone}
              editable={isEditingTelefone}
              keyboardType="phone-pad"
              placeholder={t.placeholderTelefone}
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => setIsEditingTelefone(!isEditingTelefone)}>
              <Ionicons
                name={isEditingTelefone ? "checkmark-circle" : "pencil-sharp"}
                size={20}
                color="#9c3569"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.whatsappConsentRow}>
            <View style={styles.whatsappIconBox}>
              <Ionicons name="logo-whatsapp" size={24} color="#16805B" />
            </View>
            <View style={styles.whatsappConsentText}>
              <Text style={styles.whatsappTitle}>{t.labelWhatsappSos}</Text>
              <Text style={styles.whatsappHelp}>{t.ajudaWhatsappSos}</Text>
              <View style={[styles.whatsappStatus, whatsappSosEnabled && styles.whatsappStatusActive]}>
                <View style={[styles.whatsappStatusDot, whatsappSosEnabled && styles.whatsappStatusDotActive]} />
                <Text style={[styles.whatsappStatusText, whatsappSosEnabled && styles.whatsappStatusTextActive]}>
                  {savingWhatsapp
                    ? t.whatsappSalvando
                    : whatsappSosEnabled
                      ? t.whatsappAtivo
                      : t.whatsappInativo}
                </Text>
              </View>
            </View>
            <Switch
              disabled={savingWhatsapp}
              value={whatsappSosEnabled}
              onValueChange={handleWhatsappChange}
              trackColor={{ false: '#D8CDD1', true: '#79CFA9' }}
              thumbColor={whatsappSosEnabled ? '#16805B' : '#F5F5F5'}
            />
          </View>

          {/* EMAIL (SEMPRE BLOQUEADO) */}
          <Text style={styles.label}>{t.labelEmail}</Text>
          <View style={[styles.inputWrapper, styles.disabledInput]}>
            <TextInput
              style={[styles.input, { color: "#888" }]}
              value={user?.email || "email@exemplo.com"}
              editable={false}
            />
            <Ionicons name="lock-closed-outline" size={18} color="#BBB" />
          </View>

          {/* BOTÃO SALVAR */}
          {(isEditingNome || isEditingUsername || isEditingTelefone || avatarSelecionado !== "person") && (
            <TouchableOpacity style={styles.button} onPress={handleSalvar} disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? t.botaoSalvando : t.botaoSalvar}
              </Text>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FDF9FA",
  },
  loadingText: {
    marginTop: 10,
    color: "#8E6B79",
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderColor: "#F3ECEF",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3D1F2B",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 25,
    paddingHorizontal: 20,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  avatarInstruction: {
    fontSize: 14,
    color: "#8E6B79",
    marginTop: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  avatarList: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0E6EA",
  },
  avatarOption: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F7F5F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  form: {
    paddingHorizontal: 24,
    marginTop: 25,
    gap: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8E6B79",
    marginBottom: -8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 55,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  disabledInput: {
    backgroundColor: "#F6F1F3",
    borderColor: "#EDE6E9",
  },
  input: {
    flex: 1,
    color: "#3D1F2B",
    fontSize: 16,
    fontWeight: "500",
  },
  whatsappConsentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    padding: 16,
    shadowColor: '#351523',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  whatsappIconBox: {
    alignItems: 'center',
    backgroundColor: '#E8F7F0',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  whatsappConsentText: {
    flex: 1,
  },
  whatsappTitle: {
    color: '#3D1F2B',
    fontSize: 14,
    fontWeight: '700',
  },
  whatsappHelp: {
    color: "#735A64",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },
  whatsappStatus: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F2EEF0',
    borderRadius: 9,
    flexDirection: 'row',
    gap: 5,
    marginTop: 9,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  whatsappStatusActive: {
    backgroundColor: '#E8F7F0',
  },
  whatsappStatusDot: {
    backgroundColor: '#A8989F',
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  whatsappStatusDotActive: {
    backgroundColor: '#16805B',
  },
  whatsappStatusText: {
    color: '#77656D',
    fontSize: 10,
    fontWeight: '700',
  },
  whatsappStatusTextActive: {
    color: '#16805B',
  },
  button: {
    backgroundColor: "#751935",
    height: 55,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    elevation: 2,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
