import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Vibration } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Colors } from '../../constants/theme'; 
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../config/firebase'; // Importei o db também
import { doc, getDoc } from 'firebase/firestore';

const HomeScreen = () => {
  const [nomeUsuario, setNomeUsuario] = useState('');
  const router = useRouter();

  useEffect(() => {
    const buscarDadosUsuario = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // Busca o nome direto do Firestore para garantir que apareça o nome real
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setNomeUsuario(userDoc.data().nome || "Usuária");
          } else {
            setNomeUsuario(user.displayName || "Usuária");
          }
        } catch (error) {
          setNomeUsuario("Usuária");
        }
      }
    };
    
    buscarDadosUsuario();
  }, []);

  // Removi a função handleEmergency e o VolumeListener daqui.
  // AGORA O SOS SERÁ GERENCIADO APENAS PELO _LAYOUT.TSX,


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Boa noite, {nomeUsuario} 🌸</Text>
        <Text style={styles.subGreeting}>Aqui você está segura. ❤️</Text>
      </View>

      <TextInput placeholder="Buscar ajuda..." placeholderTextColor="#BB8C94" style={styles.search} />

      {/* Botão Principal: Agora ele leva para a tela de Emergência onde tem o botão de Pânico manual */}
      <TouchableOpacity style={styles.sosCard} onPress={() => router.push('/emergencia')}>
        <View style={styles.sosTextContainer}>
          <Text style={styles.sosTitle}>Zela, o app que cuida de você</Text>
          <Text style={styles.sosSubtitle}>Toque aqui para ver opções de ajuda</Text>
        </View>
        <View style={styles.sosCircle}>
          <Ionicons name="shield-checkmark" size={28} color="#fff" />
        </View>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Acesso Rápido</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.smallCard} onPress={() => router.push('/contatos')}>
          <View style={styles.roundIcon}>
            <Ionicons name="people" size={29} color="#751935" />
          </View>
          <Text style={styles.smallCardText}>Contatos de Confiança</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallCard} onPress={() => router.push('/forum')}>
          <View style={[styles.roundIcon, { backgroundColor: '#eca9b4' }]}>
            <Ionicons name="heart" size={24} color="#751935" />
          </View>
          <Text style={styles.smallCardText}>Rede de Apoio</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Navegar por categorias</Text>
      
      <View style={styles.row}>
        <TouchableOpacity style={styles.smallCard} onPress={() => router.push('/noticias')}>
          <View style={styles.roundIcon}>
            <Ionicons name="book-outline" size={24} color="#751935" />
          </View>
          <Text style={styles.smallCardText}>Notícias</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallCard} onPress={() => router.push('/forum')}>
          <View style={styles.roundIcon}>
            <Ionicons name="chatbubbles-outline" size={24} color="#751935" />
          </View>
          <Text style={styles.smallCardText}>Fórum</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7e6ee' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { marginTop: 50, marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#5e1128ff' },
  subGreeting: { fontSize: 14, color: '#912e50', marginTop: 4 },
  search: { 
    backgroundColor: '#FFF', 
    borderRadius: 25, 
    padding: 15, 
    marginBottom: 25,
  },
  sosCard: {
    backgroundColor:'#792240ff',
    borderRadius: 20,
    padding: 31,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  sosTextContainer: { flex: 1 },
  sosTitle: { color: '#FFF5F7', fontSize: 19, fontWeight: 'bold' },
  sosSubtitle: { color: '#FFE4EC', fontSize: 13 },
  sosCircle: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 30 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  smallCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    borderRadius: 25, 
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#eebfc7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  smallCardText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3D1F2B',
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#751935',
    marginBottom: 15,
    marginTop: 10
  },
});