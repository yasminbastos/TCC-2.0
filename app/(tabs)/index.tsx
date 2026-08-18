import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, doc, getDoc, limit, onSnapshot, orderBy, query, deleteDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Vibration } from 'react-native';
import { auth, db } from '../../config/firebase';

const womanPerfil = require('../../assets/images/woman.png');

const AVATARES: Record<string, string> = {
  person: "person",
  happy: "happy-outline",
  planet: "planet-outline",
  star: "star-outline",
  paw: "paw-outline",
  leaf: "leaf-outline",
};

interface NoticiaIA {
  id: string;
  title: string;
  aiSummary: string;
  category: string;
  image?: string;
  publishedAt: string;
  urlOriginal?: string;
}

const HomeScreen = () => {
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [avatarId, setAvatarId] = useState('person');
  const [saudacao, setSaudacao] = useState('Olá');
  const [listaContatos, setListaContatos] = useState<any[]>([]);
  const [noticiasIA, setNoticiasIA] = useState<NoticiaIA[]>([]);
  
  // 📍 Estados para controlar o SOS recebido em tempo real
  const [alertaAtivo, setAlertaAtivo] = useState<any>(null);

  const router = useRouter();

  const obterSaudacao = () => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return 'Bom dia';
    if (hora >= 12 && hora < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Listener em tempo real para as notícias
  useEffect(() => {
    const q = query(
      collection(db, "news"),
      orderBy("publishedAt", "desc"),
      limit(3)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista: NoticiaIA[] = [];
      snapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() } as NoticiaIA);
      });
      setNoticiasIA(lista);
    });

    return () => unsubscribe();
  }, []);

  // 🚨 Listener em tempo real conectado à coleção sos_history (Apenas para contatos!)
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'sos_history'),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribeAlerta = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const dadosSOS = snapshot.docs[0].data();
        const remetenteId = dadosSOS.userId;

        // 🛡️ Se o SOS for meu: Ignora! Não exibe na minha própria Home.
        if (remetenteId === user.uid) {
          setAlertaAtivo(null);
          return;
        }

        try {
          // Verifica se o usuário atual pertence à rede de quem enviou o SOS
          const remetenteDoc = await getDoc(doc(db, 'usuarios', remetenteId));
          if (remetenteDoc.exists()) {
            const contatosDoRemetente = remetenteDoc.data().contatosEmergencia || [];
            if (contatosDoRemetente.includes(user.uid)) {
              setAlertaAtivo({ id: snapshot.docs[0].id, ...dadosSOS });
              Vibration.vibrate([1000, 500, 1000, 500, 1000], true);
              return;
            }
          }
        } catch (error) {
          console.log("Erro ao validar permissão do alerta:", error);
        }
      }
      setAlertaAtivo(null);
    });

    return () => unsubscribeAlerta();
  }, []);

  // Ação ao clicar no botão de notificação da Home
  const lidarCliqueNotificacao = async () => {
    Vibration.cancel();
    if (alertaAtivo) {
      const linkDoMapa = alertaAtivo.mapUrl || `https://maps.google.com/?q=${alertaAtivo.latitude},${alertaAtivo.longitude}`;

      Alert.alert(
        "🚨 ALERTA DE SOS!",
        `${alertaAtivo.userName || 'Alguém'} precisa de ajuda agora! Deseja abrir a localização no mapa?`,
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "Abrir Mapa", 
            onPress: () => {
              Linking.openURL(linkDoMapa).catch((err) => 
                console.error("Não foi possível abrir o mapa:", err)
              );
            } 
          },
          {
            text: "Limpar Alerta",
            style: "destructive",
            onPress: () => {
              setAlertaAtivo(null);
            }
          }
        ]
      );
    } else {
      Alert.alert("Notificações", "Nenhuma emergência ativa ou pendente no momento.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      setSaudacao(obterSaudacao());

      const buscarDadosEContatos = async () => {
        const user = auth.currentUser;
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
            if (userDoc.exists()) {
              const dados = userDoc.data();
              setNomeUsuario(dados.nome?.split(' ')[0] || "Usuária");
              setAvatarId(dados.avatarId || "person");

              const idsContatos = dados.contatosEmergencia || [];
              const apelidos = dados.apelidosContatos || {};
              const contatosBuscados = [];

              for (const id of idsContatos) {
                const contatoDoc = await getDoc(doc(db, 'usuarios', id));
                if (contatoDoc.exists()) {
                  const dadosContato = contatoDoc.data();

                  const nomeExibicao = apelidos[id] && apelidos[id].trim() !== ''
                    ? apelidos[id]
                    : (dadosContato.nome?.split(' ')[0] || "Contato");

                  contatosBuscados.push({
                    id: id,
                    ...dadosContato,
                    nomeExibicao: nomeExibicao
                  });
                }
              }
              setListaContatos(contatosBuscados);
            } else {
              setNomeUsuario(user.displayName?.split(' ')[0] || "Usuária");
            }
          } catch (error) {
            console.log("Erro ao buscar dados no Firebase:", error);
            setNomeUsuario("Usuária");
          }
        }
      };

      buscarDadosEContatos();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.bubbleTopLeft} />
      <View style={styles.bubbleMiddleRight} />
      <View style={styles.bubbleBottomLeft} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* HEADER SUPERIOR */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brandTitle}>Zella<Text style={styles.sparkle}>✦</Text></Text>
            <Text style={styles.subBrandTitle}>Seu lugar <Text style={styles.subBrandBold}>seguro!</Text></Text>
          </View>
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.avatarButton} onPress={() => router.push('/perfil' as any)}>
              <Ionicons name={AVATARES[avatarId] as any || "person"} size={24} color="#751935" />
            </TouchableOpacity>
            
            {/* 🔔 BOTÃO DE NOTIFICAÇÃO COM BADGE DE ALERTA DINÂMICO */}
            <TouchableOpacity style={styles.notificationButton} onPress={lidarCliqueNotificacao}>
              <Ionicons 
                name={alertaAtivo ? "notifications-sharp" : "notifications"} 
                size={24} 
                color={alertaAtivo ? "#760c27ff" : "#7a0a2aff"} 
              />
              {alertaAtivo && <View style={styles.badgeAlerta} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* SAUDAÇÃO DINÂMICA */}
        <Text style={styles.greeting}>{saudacao}, {nomeUsuario}!</Text>

        {/* CARD PRINCIPAL DE PROTEÇÃO */}
        <TouchableOpacity style={styles.safetyCard} onPress={() => router.push('/emergencia')}>
          <View style={styles.safetyShieldCircle}>
            <Ionicons name="shield-checkmark-outline" size={28} color="#751935" />
          </View>
          <View style={styles.safetyTextContainer}>
            <Text style={styles.safetyTitle}>Você não está sozinha.</Text>
            <Text style={styles.safetySubtitle}>Estamos aqui para te proteger</Text>
          </View>

          <Image
            source={womanPerfil}
            style={styles.cardIllustration}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* SEÇÃO: MINHA REDE DE SEGURANÇA */}
        <View style={styles.networkSectionHeader}>
          <Text style={styles.sectionTitle}>Minha rede de segurança</Text>
          <TouchableOpacity onPress={() => router.push('/contatos' as any)}>
            <Text style={styles.seeAllText}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.networkRow}>
          <TouchableOpacity style={styles.networkItem} onPress={() => router.push('/contatos' as any)}>
            <View style={styles.addContactCircle}>
              <Ionicons name="add" size={24} color="#751935" />
            </View>
            <Text style={styles.contactName} numberOfLines={1}>Adicionar</Text>
          </TouchableOpacity>

          {listaContatos.map((contato, index) => (
            <TouchableOpacity
              key={contato.id || index}
              style={styles.networkItem}
              onPress={() => router.push('/contatos' as any)}
            >
              <View style={styles.contactAvatarCircle}>
                <Ionicons name={AVATARES[contato.avatarId] as any || "person-outline"} size={22} color="#751935" />
                <View style={[styles.statusDot, { backgroundColor: '#2caa41ff' }]} />
              </View>
              <Text style={styles.contactName} numberOfLines={1}>
                {contato.nomeExibicao}
              </Text>
              <Text style={styles.contactStatusText}>● Online</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SEÇÃO: INFORMATIVOS E NOTÍCIAS */}
        <View style={[styles.networkSectionHeader, { marginTop: 10 }]}>
          <Text style={styles.sectionTitle}>Informativos e Conscientização</Text>
          <TouchableOpacity onPress={() => router.push('/noticias' as any)}>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.noticiasRow}>
          {noticiasIA.map((item) => (
            <View key={item.id} style={styles.noticiaCard}>
              {item.image && (
                <Image source={{ uri: item.image }} style={styles.noticiaImage} />
              )}
              <View style={styles.noticiaTag}>
                <Text style={styles.noticiaTagText}>{item.category || "Apoio"}</Text>
              </View>
              <Text style={styles.noticiaTitle}>{item.title}</Text>
              <Text style={styles.noticiaSummary}>{item.aiSummary}</Text>
              <TouchableOpacity
                style={styles.saibaMaisBotao}
                onPress={() => {
                  if (item.urlOriginal) {
                    Linking.openURL(item.urlOriginal.trim()).catch((err) =>
                      console.error("Erro ao abrir navegador nativo:", err)
                    );
                  }
                }}
              >
                <Text style={styles.saibaMaisTexto}>Saiba mais</Text>
                <Ionicons name="arrow-forward" size={16} color="#751935" />
              </TouchableOpacity>
            </View>
          ))}

          {noticiasIA.length === 0 && (
            <View style={styles.noticiaCard}>
              <View style={[styles.noticiaTag, { backgroundColor: '#F0C4CF' }]}>
                <Text style={[styles.noticiaTagText, { color: '#751935' }]}>Dica Zella</Text>
              </View>
              <Text style={styles.noticiaTitle}>Aprenda a identificar os sinais</Text>
              <Text style={styles.noticiaSummary}>
                Nosso agente de IA está buscando e resumindo os melhores artigos e informativos sobre segurança e direitos para você.
              </Text>
            </View>
          )}
        </ScrollView>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcf0f4ff', position: 'relative' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 140 },
  bubbleTopLeft: { position: 'absolute', top: 0, left: 0, width: 250, height: 250, borderRadius: 125, backgroundColor: '#f7dce4', opacity: 0.6 },
  bubbleMiddleRight: { position: 'absolute', top: '45%', right: -30, width: 200, height: 200, borderRadius: 100, backgroundColor: '#f3d3dc', opacity: 0.5 },
  bubbleBottomLeft: { position: 'absolute', bottom: 90, left: -20, width: 190, height: 190, borderRadius: 95, backgroundColor: '#eed0da', opacity: 0.4 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  brandTitle: { fontSize: 42, fontWeight: '900', color: '#65132B', letterSpacing: -0.5 },
  sparkle: { fontSize: 24, color: '#d37387ff' },
  subBrandTitle: { fontSize: 14, color: '#333', marginTop: -4 },
  subBrandBold: { color: '#751935', fontWeight: 'bold' },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#EFEFEF', elevation: 2 },
  notificationButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2, position: 'relative' },
  badgeAlerta: { position: 'absolute', top: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#c31e50ff', borderWidth: 2, borderColor: '#FFF' },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#4d2a33ff', marginTop: 15, marginBottom: 20 },
  safetyCard: { backgroundColor: '#f0c4cfff', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 25, borderWidth: 1, borderColor: '#ffffffff', overflow: 'hidden', elevation: 3 },
  safetyShieldCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255, 255, 255, 0.6)', justifyContent: 'center', alignItems: 'center' },
  safetyTextContainer: { flex: 1, marginLeft: 15, zIndex: 2 },
  safetyTitle: { color: '#333', fontSize: 16, fontWeight: 'bold' },
  safetySubtitle: { color: '#555', fontSize: 12, marginTop: 2 },
  cardIllustration: { width: 85, height: 100, position: 'absolute', right: 0, bottom: -10 },
  networkSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#5f162bff' },
  seeAllText: { fontSize: 12, color: '#5f162bff', fontWeight: '600' },
  networkRow: { gap: 16, paddingVertical: 4, marginBottom: 25 },
  networkItem: { alignItems: 'center', width: 75 },
  addContactCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#e8bfc7ff', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  contactAvatarCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 6, borderWidth: 1, borderColor: '#FFD6E0', position: 'relative' },
  statusDot: { position: 'absolute', bottom: 0, right: 2, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#FFF' },
  contactName: { fontSize: 11, fontWeight: '600', color: '#333', textAlign: 'center' },
  contactStatusText: { fontSize: 9, color: '#0b9d23ff', fontWeight: 'bold', marginTop: 2 },
  noticiasRow: { gap: 16, paddingVertical: 4, paddingRight: 24, marginBottom: 30 },
  noticiaCard: { backgroundColor: '#FFF', width: 300, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#FFFFFF', elevation: 3, shadowColor: '#830c30ff', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  noticiaImage: { width: '100%', height: 130, borderRadius: 12, marginBottom: 10 },
  noticiaTag: { alignSelf: 'flex-start', backgroundColor: '#75193515', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  noticiaTagText: { fontSize: 10, fontWeight: '700', color: '#7a0f2fff', textTransform: 'uppercase' },
  noticiaTitle: { fontSize: 16, fontWeight: 'bold', color: '#6b1027ff', marginBottom: 6, lineHeight: 20 },
  noticiaSummary: { fontSize: 13, color: '#555555ff', lineHeight: 18 },
  saibaMaisBotao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#951136ff' },
  saibaMaisTexto: { fontSize: 12, fontWeight: '700', color: '#8c1f40ff' }
});