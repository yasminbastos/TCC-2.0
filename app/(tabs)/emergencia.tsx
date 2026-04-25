import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Colors, Fonts } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const EmergencyScreen = () => {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [subscription, setSubscription] = useState<any>(null);

  // Função central de Alerta [cite: 10, 14]
  const triggerSOS = () => {
    Alert.alert(
      "🚨 SOS ATIVADO",
      "Sua localização e pedido de ajuda foram enviados aos seus contatos cadastrados.",
      [{ text: "OK", onPress: () => console.log("Alerta enviado") }]
    );
  };

  // Configuração do sensor de movimento
  const _subscribe = () => {
    setSubscription(
      Accelerometer.addListener(accelerometerData => {
        setData(accelerometerData);
        
        // Lógica de detecção de agitação forte
        const { x, y, z } = accelerometerData;
        const totalForce = Math.abs(x) + Math.abs(y) + Math.abs(z);
        
        if (totalForce > 3.5) { // Ajuste a sensibilidade conforme necessário
          triggerSOS();
          _unsubscribe(); // Para de ouvir após disparar para evitar múltiplos alertas
          setTimeout(_subscribe, 5000); // Reativa após 5 segundos
        }
      })
    );
    Accelerometer.setUpdateInterval(100);
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Centro de Ajuda</Text>
      <Text style={styles.subtitle}>
        Pressione o botão ou balance o telemóvel energicamente para pedir socorro.
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.sosButton} 
          onPress={triggerSOS}
          activeOpacity={0.8}
        >
          <View style={styles.innerCircle}>
            <Ionicons name="alert-outline" size={80} color={Colors.white} />
            <Text style={styles.sosText}>SOS</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.infoBox, { backgroundColor: subscription ? '#e8f5e9' : '#ffebee' }]}>
        <Ionicons 
          name={subscription ? "flash-outline" : "flash-off-outline"} 
          size={20} 
          color={subscription ? "green" : "red"} 
        />
        <Text style={styles.infoText}>
          {subscription ? " Sensor de movimento ativo" : " Sensor desativado"}
        </Text>
      </View>
    </View>
  );
};

export default EmergencyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    fontFamily: Fonts?.rounded || 'sans-serif',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: Colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
  },
  sosButton: {
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    alignItems: 'center',
  },
  sosText: {
    color: Colors.white,
    fontSize: 35,
    fontWeight: 'bold',
    marginTop: 10,
  },
  infoBox: {
    flexDirection: 'row',
    marginTop: 40,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
    justifyContent: 'center'
  },
  infoText: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8
  }
});