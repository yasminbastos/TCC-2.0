import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";

import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import { router } from "expo-router";

import {
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";

export default function Perfil() {
  // Pega os dados do usuário logado no Firebase
  const user = auth.currentUser;
  
  // Lógica simples para o nome: usa o displayName ou a parte antes do @ do email
  const userName = user?.displayName || user?.email?.split('@')[0] || "Usuário";
  const userEmail = user?.email || "email@exemplo.com";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/auth/login");
    } catch (error) {
      console.log("Erro ao sair:", error);
      Alert.alert("Erro", "Não foi possível sair da conta.");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER COLORIDO */}
      <View style={styles.header} />

      {/* SEÇÃO DE PERFIL */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {/* Círculo com Ícone em vez de Image */}
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={80} color="#b36482ff" />
          </View>
          
        </View>

        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.email}>{userEmail}</Text>
      </View>

      {/* MENU DE OPÇÕES */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.leftContent}>
            <View style={styles.iconBox}>
              <Ionicons name="person-outline" size={22} color="#9c3569ff" />
            </View>
            <Text style={styles.menuText}>Meu Perfil</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#C7C7C7" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.leftContent}>
            <View style={styles.iconBox}>
              <Ionicons name="settings-outline" size={22} color="#9c3569ff" />
            </View>
            <Text style={styles.menuText}>Configurações</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#C7C7C7" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.leftContent}>
            <View style={styles.iconBox}>
              <MaterialIcons name="privacy-tip" size={22} color="#9c3569ff" />
            </View>
            <Text style={styles.menuText}>Política de Privacidade</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#C7C7C7" />
        </TouchableOpacity>
      </View>

      {/* BOTÃO SAIR */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#9c3569ff" />
        <Text style={styles.logoutText}>Sair do aplicativo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5FA",
  },
  header: {
    backgroundColor: "#751935ff",
    height: 250,
    borderBottomLeftRadius: 70,
    borderBottomRightRadius: 70,
  },
  profileSection: {
    alignItems: "center",
    marginTop: -100,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "#ac5f7dff",
    // Sombra para o círculo
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 8,
    right: 10,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    borderWidth: 3,
    borderColor: "#fff",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3D1F2B",
    marginTop: 15,
  },
  email: {
    fontSize: 16,
    color: "#8E6B79",
    marginTop: 5,
  },
  menuContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
    gap: 15,
  },
  menuItem: {
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#e9d6ddff",
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: {
    fontSize: 17,
    fontWeight: "500",
    marginLeft: 15,
    color: "#3D1F2B",
  },
  logoutButton: {
    marginTop: 25,
    marginBottom: 40,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    elevation: 4,
  },
  logoutText: {
    color: "#963352ff",
    fontSize: 18,
    fontWeight: "600",
  },
});