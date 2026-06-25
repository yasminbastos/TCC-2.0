import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Dicionário de tradução local
const textosPolitica = {
  pt: {
    titulo: "Privacidade",
    subtitulo: "Política de Privacidade",
    introducao: "A sua privacidade é importante para nós. Conheça de forma transparente como cuidamos dos seus dados.",
    secao1Titulo: "Coleta de Dados",
    secao1Texto: "Coletamos informações como nome, username e telefone apenas para personalização do perfil e autenticação segura.",
    secao2Titulo: "Segurança Total",
    secao2Texto: "Seus dados são criptografados e armazenados de forma isolada no Firebase, sem qualquer compartilhamento com terceiros.",
    secao3Titulo: "Seu Consentimento",
    secao3Texto: "Ao utilizar o aplicativo, você autoriza o uso das informações fornecidas estritamente para o funcionamento do sistema.",
    rodape: "Última atualização: Junho de 2026",
  },
  en: {
    titulo: "Privacy",
    subtitulo: "Privacy Policy",
    introducao: "Your privacy matters to us. Learn in a transparent way how we look after your data.",
    secao1Titulo: "Data Collection",
    secao1Texto: "We collect information such as name, username, and phone number solely for profile customization and secure authentication.",
    secao2Titulo: "Total Security",
    secao2Texto: "Your data is encrypted and securely stored using Firebase services, with absolutely no third-party sharing.",
    secao3Titulo: "Your Consent",
    secao3Texto: "By using this application, you agree to the storage of the provided data strictly for core system operations.",
    rodape: "Last updated: June 2026",
  },
};

export default function PoliticaPrivacidade() {
  const router = useRouter();
  const [idioma, setIdioma] = useState<"pt" | "en">("pt");

  useFocusEffect(
    useCallback(() => {
      const carregarIdioma = async () => {
        try {
          const salvo = await AsyncStorage.getItem("@zella_idioma");
          if (salvo === "pt" || salvo === "en") {
            setIdioma(salvo);
          }
        } catch (error) {
          console.log("Erro ao carregar idioma na Política:", error);
        }
      };
      carregarIdioma();
    }, [])
  );

  const t = textosPolitica[idioma];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* HEADER MODERNO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3D1F2B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.titulo}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* INTRODUÇÃO EM DESTAQUE */}
        <View style={styles.introContainer}>
          <Text style={styles.mainSubtitle}>{t.subtitulo}</Text>
          <Text style={styles.introText}>{t.introducao}</Text>
        </View>

        {/* CARD 1: COLETA */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="document-text-outline" size={20} color="#751935" />
            </View>
            <Text style={styles.sectionTitle}>{t.secao1Titulo}</Text>
          </View>
          <Text style={styles.paragraph}>{t.secao1Texto}</Text>
        </View>

        {/* CARD 2: SEGURANÇA */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#751935" />
            </View>
            <Text style={styles.sectionTitle}>{t.secao2Titulo}</Text>
          </View>
          <Text style={styles.paragraph}>{t.secao2Texto}</Text>
        </View>

        {/* CARD 3: CONSENTIMENTO */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="checkbox-outline" size={20} color="#751935" />
            </View>
            <Text style={styles.sectionTitle}>{t.secao3Titulo}</Text>
          </View>
          <Text style={styles.paragraph}>{t.secao3Texto}</Text>
        </View>

        <Text style={styles.footerText}>{t.rodape}</Text>
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
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 40,
  },
  introContainer: {
    marginBottom: 25,
    paddingHorizontal: 4,
  },
  mainSubtitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#3D1F2B",
    marginBottom: 8,
  },
  introText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#8E6B79",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3ECEF",
    
    // Sombras leves e modernas
    elevation: 2,
    shadowColor: "#751935",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F7ECEF",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3D1F2B",
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: "#8E6B79",
    fontWeight: "500",
  },
  footerText: {
    fontSize: 12,
    color: "#C3B0B7",
    textAlign: "center",
    marginTop: 20,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});