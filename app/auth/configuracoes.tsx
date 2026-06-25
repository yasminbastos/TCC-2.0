import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importação do armazenamento local
import { useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { auth } from "../../config/firebase";

const textos = {
  pt: {
    titulo: "Configurações",
    seguranca: "Segurança",
    alterarSenha: "Alterar Senha de Acesso",
    subSenha: "Envia um link seguro para o seu e-mail",
    acessibilidade: "Acessibilidade e Idioma",
    idiomaApp: "Idioma do App",
    preferencias: "Preferências",
    notificacoes: "Notificações Push",
    sucessoEnvio: "E-mail Enviado",
    msgEnvio: "Verifique sua caixa de entrada para redefinir sua senha.",
    erro: "Erro",
    msgErro: "Não foi possível enviar o e-mail de redefinição."
  },
  en: {
    titulo: "Settings",
    seguranca: "Security",
    alterarSenha: "Change Password",
    subSenha: "Sends a secure link to your email",
    acessibilidade: "Accessibility & Language",
    idiomaApp: "App Language",
    preferencias: "Preferences",
    notificacoes: "Push Notifications",
    sucessoEnvio: "Email Sent",
    msgEnvio: "Check your inbox to reset your password.",
    erro: "Error",
    msgErro: "Could not send the password reset email."
  }
};

export default function Configuracoes() {
  const router = useRouter();
  const user = auth.currentUser;

  const [idioma, setIdioma] = useState<"pt" | "en">("pt");
  const [notificacoes, setNotificacoes] = useState(true);

  // Carrega o idioma salvo assim que o usuário entra na tela
  useEffect(() => {
    const buscarIdiomaSalvo = async () => {
      try {
        const idiomaSalvo = await AsyncStorage.getItem("@zella_idioma");
        if (idiomaSalvo === "pt" || idiomaSalvo === "en") {
          setIdioma(idiomaSalvo);
        }
      } catch (error) {
        console.log("Erro ao carregar idioma local:", error);
      }
    };

    buscarIdiomaSalvo();
  }, []);

  // Função para mudar o idioma e salvar a escolha no dispositivo
  const handleAlterarIdioma = async (novoIdioma: "pt" | "en") => {
    setIdioma(novoIdioma);
    try {
      await AsyncStorage.setItem("@zella_idioma", novoIdioma);
    } catch (error) {
      console.log("Erro ao salvar idioma local:", error);
    }
  };

  const t = textos[idioma];

  const handleMudarSenha = async () => {
    if (!user || !user.email) {
      Alert.alert(t.erro, "User not found / Usuário não encontrado.");
      return;
    }

    Alert.alert(
      t.alterarSenha,
      idioma === "pt" 
        ? `Deseja enviar um e-mail de redefinição para: ${user.email}?`
        : `Do you want to send a reset email to: ${user.email}?`,
      [
        { text: idioma === "pt" ? "Cancelar" : "Cancel", style: "cancel" },
        {
          text: idioma === "pt" ? "Enviar" : "Send",
          onPress: async () => {
            try {
              await sendPasswordResetEmail(auth, user.email!);
              Alert.alert(t.sucessoEnvio, t.msgEnvio);
            } catch (error) {
              console.log("Erro ao redefinir senha:", error);
              Alert.alert(t.erro, t.msgErro);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3D1F2B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.titulo}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* SEGURANÇA */}
        <Text style={styles.sectionTitle}>{t.seguranca}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem} onPress={handleMudarSenha}>
            <View style={styles.leftContent}>
              <View style={styles.iconBox}>
                <Ionicons name="lock-closed-outline" size={20} color="#9c3569" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuText}>{t.alterarSenha}</Text>
                <Text style={styles.subText}>{t.subSenha}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C7C7C7" />
          </TouchableOpacity>
        </View>

        {/* IDIOMA */}
        <Text style={styles.sectionTitle}>{t.acessibilidade}</Text>
        <View style={styles.card}>
          <View style={styles.languageContainer}>
            <View style={styles.leftContent}>
              <View style={styles.iconBox}>
                <MaterialIcons name="language" size={20} color="#9c3569" />
              </View>
              <Text style={styles.menuText}>{t.idiomaApp}</Text>
            </View>
            
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radioButton, idioma === "pt" && styles.radioActive]}
                onPress={() => handleAlterarIdioma("pt")}
              >
                <Text style={[styles.radioLabel, idioma === "pt" && styles.radioLabelActive]}>PT</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.radioButton, idioma === "en" && styles.radioActive]}
                onPress={() => handleAlterarIdioma("en")}
              >
                <Text style={[styles.radioLabel, idioma === "en" && styles.radioLabelActive]}>EN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* PREFERÊNCIAS */}
        <Text style={styles.sectionTitle}>{t.preferencias}</Text>
        <View style={styles.card}>
          <View style={styles.switchContainer}>
            <View style={styles.leftContent}>
              <View style={styles.iconBox}>
                <Ionicons name="notifications-outline" size={20} color="#9c3569" />
              </View>
              <Text style={styles.menuText}>{t.notificacoes}</Text>
            </View>
            <Switch
              value={notificacoes}
              onValueChange={setNotificacoes}
              trackColor={{ false: "#EAEAEA", true: "#9c3569" }}
              thumbColor={notificacoes ? "#751935" : "#FFF"}
            />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF9FA",
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
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8E6B79",
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 15,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: "#F0E6EA",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  languageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F7ECEF",
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3D1F2B",
  },
  subText: {
    fontSize: 12,
    color: "#8E6B79",
    marginTop: 2,
  },
  radioGroup: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 3,
  },
  radioButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  radioActive: {
    backgroundColor: "#751935",
  },
  radioLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
  },
  radioLabelActive: {
    color: "#FFF",
  },
});