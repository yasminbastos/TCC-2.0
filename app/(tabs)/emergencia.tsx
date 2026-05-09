import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
// 1. Removido SQLite e adicionado Firebase
import { db, auth } from '../../config/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const HistoryScreen = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    if (!auth.currentUser) return;
    setLoading(true);

    try {
      // 2. Busca os alertas do Firestore filtrando pelo seu ID
      const q = query(
        collection(db, 'sos_history'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc') // Mais recentes primeiro
      );

      const querySnapshot = await getDocs(q);
      const lista: any[] = [];
      
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });

      setLogs(lista);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="warning" size={20} color="#ff4d4d" />
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
      <Text style={styles.coordText}>
        Lat: {item.latitude?.toFixed(4)} | Lon: {item.longitude?.toFixed(4)}
      </Text>
      <TouchableOpacity 
        style={styles.mapButton} 
        onPress={() => Linking.openURL(item.mapUrl)} // mapUrl vindo do Firestore
      >
        <Text style={styles.mapButtonText}>Ver no Mapa</Text>
        <Ionicons name="map-outline" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registros de SOS</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      ) : logs.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum alerta disparado ainda.</Text>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.primary, marginBottom: 20, marginTop: 40 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dateText: { fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
  coordText: { color: '#666', fontSize: 12, marginBottom: 10 },
  mapButton: { backgroundColor: Colors.primary, flexDirection: 'row', padding: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  mapButtonText: { color: 'white', marginRight: 8, fontWeight: '500' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 50 }
});