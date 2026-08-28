import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Image,
  Alert,
  SafeAreaView
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { db, auth } from '../../config/firebase';
import { collection, query, where, getDocs, orderBy, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// SUBSTTTUA PELA SUA CHAVE DO GOOGLE MAPS (Caso tenha uma)
const GOOGLE_MAPS_API_KEY = 'SUA_CHAVE_API_AQUI';

const Theme = {
  background: '#FDF5F6',
  primary: '#5B0E2D',
  accent: '#E65C62',
  cardBg: '#FFFFFF',
  textDark: '#1A1A1A',
  textMuted: '#8E8E93',
  badgeBg: '#FCD8E0',
  badgeText: '#A8203D',
};

const HistoryScreen = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'todos' | 'mes' | 'antigos'>('todos');

  // Estados para seleção e exclusão
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    if (!auth.currentUser) return;
    setLoading(true);

    try {
      const q = query(
        collection(db, 'sos_history'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const lista: any[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let dateObj = data.timestamp?.toDate ? data.timestamp.toDate() : new Date();

        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = dateObj.toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
        const time = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const fullDate = dateObj.toLocaleDateString('pt-BR');

        lista.push({
          id: docSnap.id,
          ...data,
          formattedDay: day,
          formattedMonth: month,
          formattedTime: time,
          fullDate: fullDate,
          rawDate: dateObj,
        });
      });

      setLogs(lista);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  // Alternar seleção do item
  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Confirmar Exclusão com Modal
  const confirmDelete = () => {
    if (selectedIds.length === 0) {
      Alert.alert("Atenção", "Selecione pelo menos um registro para excluir.");
      return;
    }

    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja apagar ${selectedIds.length} registro(s) do histórico? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: handleDeleteSelected
        }
      ]
    );
  };

  // Apagar itens selecionados no Firestore
  const handleDeleteSelected = async () => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      selectedIds.forEach((id) => {
        const docRef = doc(db, 'sos_history', id);
        batch.delete(docRef);
      });

      await batch.commit();

      // Limpa os selecionados e atualiza a tela
      setSelectedIds([]);
      setIsSelectionMode(false);
      await loadHistory();
    } catch (error) {
      console.error("Erro ao excluir registros:", error);
      Alert.alert("Erro", "Não foi possível excluir os registros selecionados.");
      setLoading(false);
    }
  };

  // Filtragem
  const filteredLogs = useMemo(() => {
    if (activeFilter === 'mes') {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      return logs.filter(log => {
        const d = log.rawDate;
        return d && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    }
    if (activeFilter === 'antigos') {
      return [...logs].reverse();
    }
    return logs;
  }, [logs, activeFilter]);

  const lastAlert = logs.length > 0 ? `${logs[0].fullDate} às ${logs[0].formattedTime}` : '--';

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isFirst = index === 0;
    const isLast = index === filteredLogs.length - 1;
    const isSelected = selectedIds.includes(item.id);

    const GEOAPIFY_API_KEY = '4e1779dd5c8f4661bb1c27426032b4ea';

    const mapImageUrl = (item.latitude && item.longitude)
      ? `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=300&height=150&center=lonlat:${item.longitude},${item.latitude}&zoom=15&marker=lonlat:${item.longitude},${item.latitude};color:%23e65c62;size:medium&apiKey=${GEOAPIFY_API_KEY}`
      : 'https://tile.openstreetmap.org/15/9312/12501.png';

    return (
      <View style={styles.timelineRow}>
        {/* Checkbox em modo de seleção ou Bolinha da linha do tempo */}
        {isSelectionMode ? (
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => toggleSelect(item.id)}
          >
            <Ionicons
              name={isSelected ? "checkbox" : "square-outline"}
              size={24}
              color={isSelected ? Theme.accent : Theme.textMuted}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.timelineContainer}>
            {!isFirst && <View style={styles.timelineLineTop} />}
            <View style={styles.timelineDot} />
            {!isLast && <View style={styles.timelineLineBottom} />}
          </View>
        )}

        {/* Card */}
        <TouchableOpacity
          style={styles.cardContainer}
          activeOpacity={isSelectionMode ? 0.7 : 1}
          onPress={() => isSelectionMode && toggleSelect(item.id)}
        >
          {isFirst && !isSelectionMode && (
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>MAIS RECENTE</Text>
              </View>
            </View>
          )}

          <View style={[styles.card, isSelected && styles.cardSelected]}>
            <View style={styles.cardContent}>
              <View style={styles.leftColumn}>
                <View style={styles.dateTimeHeader}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dayText}>{item.formattedDay}</Text>
                    <Text style={styles.monthText}>{item.formattedMonth}</Text>
                  </View>

                  <View style={styles.timeBox}>
                    <View style={styles.timeRow}>
                      <Text style={styles.timeText}>{item.formattedTime}</Text>
                      <Ionicons name="warning" size={18} color={Theme.accent} style={{ marginLeft: 6 }} />
                    </View>
                    <Text style={styles.alertTitle}>SOS acionado</Text>
                  </View>
                </View>

                <View style={styles.locationContainer}>
                  <Ionicons name="location-sharp" size={16} color={Theme.accent} />
                  <View style={{ marginLeft: 4 }}>
                    <Text style={styles.locationLabel}>Localização registrada</Text>
                    <Text style={styles.locationText}>{item.cityState || 'São Paulo, SP'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.rightColumn}>
                {/* Visualização de imagem real do mapa */}
                <View style={styles.mapPreviewContainer}>
                  <Image source={{ uri: mapImageUrl }} style={styles.mapImage} />
                </View>

                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => item.mapUrl && Linking.openURL(item.mapUrl)}
                  activeOpacity={0.8}
                  disabled={isSelectionMode}
                >
                  <Text style={styles.mapButtonText}>Ver localização</Text>
                  <Ionicons name="open-outline" size={14} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com os 3 pontinhos e ações */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Registros de SOS</Text>
          <Text style={styles.subtitle}>
            {isSelectionMode
              ? `${selectedIds.length} selecionado(s)`
              : 'Seu histórico de acionamentos de emergência'}
          </Text>
        </View>

        {isSelectionMode ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={confirmDelete} style={{ marginRight: 12 }}>
              <Ionicons name="trash" size={24} color={Theme.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setIsSelectionMode(false); setSelectedIds([]); }}>
              <Ionicons name="close" size={24} color={Theme.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setIsSelectionMode(true)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={Theme.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Estatísticas */}
      <View style={styles.statsCard}>
        <View style={styles.statBox}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="shield-check" size={26} color={Theme.accent} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statNumber}>{logs.length}</Text>
            <Text style={styles.statLabel}>registros realizados</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="calendar-clock" size={24} color={Theme.primary} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.lastAlertLabel}>Último acionamento</Text>
            <Text style={styles.lastAlertValue}>{lastAlert}</Text>
          </View>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'todos' && styles.filterTabActive]}
          onPress={() => setActiveFilter('todos')}
        >
          <Text style={[styles.filterText, activeFilter === 'todos' && styles.filterTextActive]}>Todos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'mes' && styles.filterTabActive]}
          onPress={() => setActiveFilter('mes')}
        >
          <Text style={[styles.filterText, activeFilter === 'mes' && styles.filterTextActive]}>Este mês</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'antigos' && styles.filterTabActive]}
          onPress={() => setActiveFilter('antigos')}
        >
          <Text style={[styles.filterText, activeFilter === 'antigos' && styles.filterTextActive]}>Mais antigos</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      {loading ? (
        <ActivityIndicator size="large" color={Theme.primary} style={{ marginTop: 50 }} />
      ) : filteredLogs.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum alerta disparado ainda.</Text>
      ) : (
        <FlatList
          data={filteredLogs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.textMuted,
    marginTop: 2,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7E8EC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stats
  statsCard: {
    backgroundColor: Theme.cardBg,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    marginBottom: 18,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FCECEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statTextContainer: { flex: 1 },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: Theme.textDark },
  statLabel: { fontSize: 11, color: Theme.textMuted, marginTop: -2 },
  statDivider: { width: 1, height: 35, backgroundColor: '#EBEBEB', marginHorizontal: 8 },
  lastAlertLabel: { fontSize: 11, color: Theme.textMuted },
  lastAlertValue: { fontSize: 12, fontWeight: 'bold', color: Theme.textDark, marginTop: 2 },

  // Filters
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5E9ED',
    borderRadius: 25,
    padding: 3,
    marginBottom: 20,
  },
  filterTab: { flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: 'center' },
  filterTabActive: { backgroundColor: Theme.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: Theme.primary },
  filterTextActive: { color: 'white' },

  // Timeline & Checkbox
  timelineRow: { flexDirection: 'row', marginBottom: 12 },
  timelineContainer: { width: 24, alignItems: 'center', marginRight: 8 },
  checkboxContainer: { width: 24, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Theme.accent,
    backgroundColor: Theme.background,
    marginTop: 18,
    zIndex: 2,
  },
  timelineLineTop: { position: 'absolute', top: 0, bottom: '50%', width: 2, backgroundColor: Theme.accent },
  timelineLineBottom: { position: 'absolute', top: 18, bottom: -16, width: 2, backgroundColor: Theme.accent },

  // Cards
  cardContainer: { flex: 1 },
  badgeContainer: { alignItems: 'center', marginBottom: 6 },
  badge: { backgroundColor: Theme.badgeBg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { color: Theme.badgeText, fontSize: 10, fontWeight: 'bold' },
  card: {
    backgroundColor: Theme.cardBg,
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: Theme.accent,
    backgroundColor: '#FFF0F2',
  },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between' },
  leftColumn: { flex: 1.1, justifyContent: 'space-between' },
  dateTimeHeader: { flexDirection: 'row', alignItems: 'center' },
  dateBox: { alignItems: 'center', marginRight: 12 },
  dayText: { fontSize: 20, fontWeight: 'bold', color: Theme.textDark },
  monthText: { fontSize: 11, fontWeight: '600', color: Theme.textMuted },
  timeBox: { justifyContent: 'center' },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 18, fontWeight: 'bold', color: Theme.textDark },
  alertTitle: { fontSize: 12, fontWeight: 'bold', color: Theme.textDark, marginTop: 2 },
  locationContainer: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 12 },
  locationLabel: { fontSize: 11, color: Theme.textMuted },
  locationText: { fontSize: 11, color: Theme.textMuted },

  // Right Map & Button
  rightColumn: { flex: 0.9, alignItems: 'flex-end', justifyContent: 'space-between', paddingLeft: 8 },
  mapPreviewContainer: {
    width: '100%',
    height: 55,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  mapImage: { width: '100%', height: '100%', borderRadius: 10 },
  mapButton: {
    backgroundColor: Theme.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    width: '100%',
  },
  mapButtonText: { color: 'white', fontSize: 11, fontWeight: '600', marginRight: 4 },
  emptyText: { textAlign: 'center', color: Theme.textMuted, marginTop: 50 },
});