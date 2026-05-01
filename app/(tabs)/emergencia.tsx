import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const HistoryScreen = () => {
  const [logs, setLogs] = useState<any[]>([]);

  // Carrega os dados sempre que você entra na aba
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    const db = await SQLite.openDatabaseAsync('zela_db');
    const allRows = await db.getAllAsync('SELECT * FROM history ORDER BY id DESC');
    setLogs(allRows);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="warning" size={20} color="#ff4d4d" />
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
      <Text style={styles.coordText}>Lat: {item.latitude} | Lon: {item.longitude}</Text>
      <TouchableOpacity 
        style={styles.mapButton} 
        onPress={() => Linking.openURL(item.map_url)}
      >
        <Text style={styles.mapButtonText}>Ver no Mapa</Text>
        <Ionicons name="map-outline" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registros de SOS</Text>
      {logs.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum alerta disparado ainda.</Text>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id.toString()}
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