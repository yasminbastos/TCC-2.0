import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";

import { signOut } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { useRouter, useFocusEffect } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";

// Mapeamento dos avatares utilizando as cores oficiais do aplicativo
const AVATARES = [
  { id: "person", icon: "person", color: "#9c3569" },
  { id: "happy", icon: "happy-outline", color: "#9c3569" },
  { id: "planet", icon: "planet-outline", color: "#9c3569" },
  { id: "star", icon: "star-outline", color: "#9c3569" },
  { id: "paw", icon: "paw-outline", color: "#9c3569" },
  { id: "leaf", icon: "leaf-outline", color: "#9c3569" },
];

// Dicionário de tradução local
const textosPerfil = {
  pt: {
    titulo: "Área do Usuário",
    loadingText: "Carregando...",
    usuarioPadrao: "Usuário",
    meuPerfil: "Meu Perfil",
    configuracoes: "Configurações",
    politica: "Política de Privacidade",
    sair: "Sair do aplicativo",
    erro: "Erro",
    erroMsg: "Não foi possível sair da conta.",
  },
  en: {
    titulo: "User Area",
    loadingText: "Loading...",
    usuarioPadrao: "User",
    meuPerfil: "My Profile",
    configuracoes: "Settings",
    politica: "Privacy Policy",
    sair: "Log Out",
    erro: "Error",
    erroMsg: "Could not log out.",
  },
};

export default function Perfil() {
  const router = useRouter();
  const user = auth.currentUser;

  const [idioma, setIdioma] = useState<"pt" | "en">("pt");
  const [username, setUsername] = useState("");
  const [avatarId, setAvatarId] = useState("person");
  const [loading, setLoading] = useState(true);

  // Carrega o idioma e os dados de forma reativa sempre que focar na tela
  useFocusEffect(
    useCallback(() => {
      async function buscarDadosUsuario() {
        if (!user) return;
        try {
          // Atualiza o idioma primeiro
          const salvo = await AsyncStorage.getItem("@zella_idioma");
          if (salvo === "pt" || salvo === "en") {
            setIdioma(salvo);
          }

          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const dados = docSnap.data();
            setUsername(dados.username || user.displayName || user.email?.split("@")[0] || "Usuário");
            setAvatarId(dados.avatarId || "person");
          } else {
            setUsername(user.displayName || user.email?.split("@")[0] || "Usuário");
          }
        } catch (error) {
          console.log("Erro ao buscar dados do perfil:", error);
        } finally {
          setLoading(false);
        }
      }

      buscarDadosUsuario();
    }, [user])
  );

  const t = textosPerfil[idioma];
  const userEmail = user?.email || "email@exemplo.com";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/auth/login");
    } catch (error) {
      console.log("Erro ao sair:", error);
      Alert.alert(t.erro, t.erroMsg);
    }
  };

  // Encontra o objeto do avatar atual com base no ID salvo
  const currentAvatar = AVATARES.find((a) => a.id === avatarId) || AVATARES[0];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" backgroundColor="#751935" />

      {/* HEADER COLORIDO INTEGRADO */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.titulo}</Text>
      </View>

      {/* SEÇÃO DE PERFIL */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {/* A borda agora segue a cor padrão do app (#751935) para combinar com o Header */}
          <View style={styles.avatarPlaceholder}>
            {loading ? (
              <ActivityIndicator size="small" color="#751935" />
            ) : (
              <Ionicons name={currentAvatar.icon as any} size={75} color={currentAvatar.color} />
            )}
          </View>
        </View>

        <Text style={styles.name}>{loading ? t.loadingText : (username === "Usuário" ? t.usuarioPadrao : username)}</Text>
        <Text style={styles.email}>{userEmail}</Text>
      </View>

      {/* MENU DE OPÇÕES */}
      <View style={styles.menuContainer}>
        
        {/* MEU PERFIL */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push("/auth/meu-perfil" as any)}
        >
          <View style={styles.leftContent}>
            <View style={styles.iconBox}>
              <Ionicons name="person-outline" size={22} color="#9c3569" />
            </View>
            <Text style={styles.menuText}>{t.meuPerfil}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7C7" />
        </TouchableOpacity>

        {/* CONFIGURAÇÕES */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push("/auth/configuracoes" as any)}
        >
          <View style={styles.leftContent}>
            <View style={styles.iconBox}>
              <Ionicons name="settings-outline" size={22} color="#9c3569" />
            </View>
            <Text style={styles.menuText}>{t.configuracoes}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7C7" />
        </TouchableOpacity>

        {/* POLÍTICA DE PRIVACIDADE */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push("/auth/politica" as any)}
        >
          <View style={styles.leftContent}>
            <View style={styles.iconBox}>
              <MaterialIcons name="privacy-tip" size={22} color="#9c3569" />
            </View>
            <Text style={styles.menuText}>{t.politica}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7C7" />
        </TouchableOpacity>
      </View>

      {/* BOTÃO SAIR */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#9c3569" />
        <Text style={styles.logoutText}>{t.sair}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF9FA",
  },
  header: {
    backgroundColor: "#751935",
    height: 220,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    alignItems: "center",
    paddingTop: 60,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  profileSection: {
    alignItems: "center",
    marginTop: -90,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#751935",
    
    elevation: 8,
    shadowColor: "#751935",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3D1F2B",
    marginTop: 15,
  },
  email: {
    fontSize: 14,
    color: "#8E6B79",
    marginTop: 4,
  },
  menuContainer: {
    marginTop: 35,
    paddingHorizontal: 24,
    gap: 14,
  },
  menuItem: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F7ECEF",
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 14,
    color: "#3D1F2B",
  },
  logoutButton: {
    marginTop: 30,
    marginBottom: 50,
    marginHorizontal: 24,
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#F3ECEF",
    
    elevation: 1,
  },
  logoutText: {
    color: "#9c3569",
    fontSize: 16,
    fontWeight: "700",
  },
});