import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Vibration, Alert } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { Colors } from '../../constants/theme'; 
import { VolumeManager } from 'react-native-volume-manager';
import * as SMS from 'expo-sms';

const HomeScreen = () => {
  // Refs para controlar os cliques sem travar a interface
  const cliques = useRef<number>(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // FUNÇÃO DE EMERGÊNCIA (SMS + Alerta)
  const handleEmergency = async () => {
    // Feedback tátil imediato
    Vibration.vibrate([100, 200, 100, 200]); 

    // Verifica se o aparelho pode enviar SMS
    const isAvailable = await SMS.isAvailableAsync();
    
    if (isAvailable) {
      Alert.alert(
        "SERENE: SOS",
        "Deseja enviar o alerta de socorro para seus contatos?",
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "ENVIAR AGORA", 
            onPress: async () => {
              // Aqui você coloca o número de teste (ex: do seu Tio Marcelo)
              await SMS.sendSMSAsync(
                ['11999999999'], 
                'SERENE: SOS! Preciso de ajuda. Esta é uma mensagem de emergência automática do meu aplicativo.'
              );
            },
            style: "destructive"
          }
        ]
      );
    } else {
      Alert.alert("Erro", "O envio de SMS não está disponível neste aparelho.");
    }
  };

  // MONITOR DOS BOTÕES DE VOLUME
  useEffect(() => {
    const subscription = VolumeManager.addVolumeListener(() => {
      cliques.current += 1;

      // Inicia contagem de 2 segundos no primeiro clique
      if (cliques.current === 1) {
        timer.current = setTimeout(() => {
          cliques.current = 0; 
        }, 2000);
      }

      // Se chegar a 3 cliques dentro do tempo
      if (cliques.current >= 3) {
        if (timer.current) {
          clearTimeout(timer.current);
          timer.current = null;
        }
        cliques.current = 0;
        handleEmergency();
      }
    });

    // Limpa os processos ao sair da tela
    return () => {
      subscription.remove();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Boa noite, Duda 🌸</Text>
      </View>

      {/* Barra de busca */}
      <TextInput 
        placeholder="Buscar ajuda ou informações..."
        placeholderTextColor="#BB8C94"
        style={styles.search}
      />

      {/* Card Principal - Serene */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Serene</Text>
        <Text style={styles.cardSubtitle}>
          Se sinta mais segura, se sinta mais você!
        </Text>

        <TouchableOpacity 
          style={styles.emergencyButton} 
          onPress={handleEmergency}
          activeOpacity={0.8}
        >
          <Text style={styles.emergencyButtonText}>ACIONAR EMERGÊNCIA</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recursos Principais</Text>

      <View style={styles.categories}>
        <TouchableOpacity style={styles.category}>
          <Text style={styles.categoryIcon}>💬</Text>
          <Text style={styles.categoryText}>Fórum</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.category}>
          <Text style={styles.categoryIcon}>📖</Text>
          <Text style={styles.categoryText}>Conteúdo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.category}>
          <Text style={styles.categoryIcon}>📍</Text>
          <Text style={styles.categoryText}>Locais</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf0f6',
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 15,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.primary,
  },
  search: {
    backgroundColor: Colors.white,
    borderRadius: 25,
    padding: 15,
    marginBottom: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  card: {
    backgroundColor: Colors.soft,
    borderRadius: 30,
    padding: 25,
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  cardSubtitle: {
    fontSize: 16,
    color: Colors.secondary,
    marginVertical: 12,
    lineHeight: 22,
  },
  emergencyButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  emergencyButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  category: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 20,
    width: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  categoryText: {
    color: Colors.secondary,
    fontSize: 12,
    fontWeight: '600',
  }
});