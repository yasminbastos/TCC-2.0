import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, doc, getDoc, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { 
  Image, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Modal, 
  ActivityIndicator 
} from 'react-native';
import { auth, db } from '../../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIdioma } from '../../contexts/IdiomaContext';

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

const textos = {
  pt: {
    subBrand: "Seu lugar ",
    subBrandBold: "seguro!",
    bomDia: "Bom dia",
    boaTarde: "Boa tarde",
    boaNoite: "Boa noite",
    usuarioPadrao: "Usuária",
    contatoPadrao: "Contato",
    safetyTitle: "Você não está sozinha.",
    safetySubtitle: "Estamos aqui para te proteger",
    redeSeguranca: "Minha rede de segurança",
    verTodas: "Ver todas",
    adicionar: "Adicionar",
    informativos: "Informativos e Conscientização",
    dicaZella: "Dica Zella",
    aprenderSinais: "Aprenda a identificar os sinais",
    resumoIa: "Nosso agente de IA está buscando e resumindo os melhores artigos e informativos sobre segurança e direitos para você.",
    saibaMais: "Saiba mais",
    modalWelcome: "Bem-vinda à Zella!",
    modalDesc: "Preparamos um tutorial rápido para ajudar você a conhecer o aplicativo e aprender a utilizar seus recursos de segurança.",
    modalBtn: "Assistir ao tutorial",
    modalNotAgain: "Não mostrar novamente",
    modalFooter: "Você pode fechar esta janela e acessar o aplicativo normalmente."
  },
  en: {
    subBrand: "Your ",
    subBrandBold: "safe place!",
    bomDia: "Good morning",
    boaTarde: "Good afternoon",
    boaNoite: "Good evening",
    usuarioPadrao: "User",
    contatoPadrao: "Contact",
    safetyTitle: "You are not alone.",
    safetySubtitle: "We are here to protect you",
    redeSeguranca: "My safety network",
    verTodas: "See all",
    adicionar: "Add",
    informativos: "Information & Awareness",
    dicaZella: "Zella Tip",
    aprenderSinais: "Learn to identify the signs",
    resumoIa: "Our AI agent is searching and summarizing the best articles and information on safety and rights for you.",
    saibaMais: "Learn more",
    modalWelcome: "Welcome to Zella!",
    modalDesc: "We've prepared a quick tutorial to help you get to know the app and learn how to use its safety features.",
    modalBtn: "Watch tutorial",
    modalNotAgain: "Don't show again",
    modalFooter: "You can close this window and access the app normally."
  }
};

const HomeScreen = () => {
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [tutorialVisivel, setTutorialVisivel] = useState(false);
  const [verificandoTutorial, setVerificandoTutorial] = useState(true);
  const [avatarId, setAvatarId] = useState('person');
  const [saudacaoKey, setSaudacaoKey] = useState<'bomDia' | 'boaTarde' | 'boaNoite'>('bomDia');
  const [listaContatos, setListaContatos] = useState<any[]>([]);
  const [noticiasIA, setNoticiasIA] = useState<NoticiaIA[]>([]);

  const router = useRouter();
  const { idioma } = useIdioma();
  const t = textos[idioma] || textos.pt;

  const obterChaveSaudacao = (): 'bomDia' | 'boaTarde' | 'boaNoite' => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return 'bomDia';
    if (hora >= 12 && hora < 18) return 'boaTarde';
    return 'boaNoite';
  };

  useEffect(() => {
    const verificarTutorial = async () => {
      try {
        const naoMostrar = await AsyncStorage.getItem('@zella:naoMostrarTutorial');
        setTutorialVisivel(naoMostrar !== 'sim');
      } catch (error) {
        console.log('Erro ao verificar preferência do tutorial:', error);
        setTutorialVisivel(true);
      } finally {
        setVerificandoTutorial(false);
      }
    };

    verificarTutorial();
  }, []);

  const fecharTutorial = () => {
    setTutorialVisivel(false);
  };

  const naoMostrarTutorialNovamente = async () => {
    try {
      await AsyncStorage.setItem('@zella:naoMostrarTutorial', 'sim');
    } catch (error) {
      console.log('Erro ao salvar preferência do tutorial:', error);
    } finally {
      setTutorialVisivel(false);
    }
  };

  const assistirTutorial = async () => {
    try {
      await Linking.openURL('https://youtube.com/shorts/9d1UnmcSgxQ?si=uSOMBgdvxT3hEqZZ');
    } catch (error) {
      console.log('Erro ao abrir o tutorial:', error);
    }
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

  useFocusEffect(
    useCallback(() => {
      setSaudacaoKey(obterChaveSaudacao());

      const buscarDadosEContatos = async () => {
        const user = auth.currentUser;
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
            if (userDoc.exists()) {
              const dados = userDoc.data();
              setNomeUsuario(dados.nome?.split(' ')[0] || t.usuarioPadrao);
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
                    : (dadosContato.nome?.split(' ')[0] || t.contatoPadrao);

                  contatosBuscados.push({
                    id: id,
                    ...dadosContato,
                    nomeExibicao: nomeExibicao
                  });
                }
              }
              setListaContatos(contatosBuscados);
            } else {
              setNomeUsuario(user.displayName?.split(' ')[0] || t.usuarioPadrao);
            }
          } catch (error) {
            console.log("Erro ao buscar dados no Firebase:", error);
            setNomeUsuario(t.usuarioPadrao);
          }
        }
      };

      buscarDadosEContatos();
    }, [idioma])
  );

  const saudacaoTexto = t[saudacaoKey];

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
            <Text style={styles.subBrandTitle}>{t.subBrand}<Text style={styles.subBrandBold}>{t.subBrandBold}</Text></Text>
          </View>
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.avatarButton} onPress={() => router.push('/perfil' as any)}>
              <Ionicons name={AVATARES[avatarId] as any || "person"} size={24} color="#751935" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SAUDAÇÃO DINÂMICA */}
        <Text style={styles.greeting}>{saudacaoTexto}, {nomeUsuario}!</Text>

        {/* CARD PRINCIPAL DE PROTEÇÃO */}
        <TouchableOpacity style={styles.safetyCard} onPress={() => router.push('/emergencia')}>
          <View style={styles.safetyShieldCircle}>
            <Ionicons name="shield-checkmark-outline" size={28} color="#751935" />
          </View>
          <View style={styles.safetyTextContainer}>
            <Text style={styles.safetyTitle}>{t.safetyTitle}</Text>
            <Text style={styles.safetySubtitle}>{t.safetySubtitle}</Text>
          </View>

          <Image
            source={womanPerfil}
            style={styles.cardIllustration}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* SEÇÃO: MINHA REDE DE SEGURANÇA */}
        <View style={styles.networkSectionHeader}>
          <Text style={styles.sectionTitle}>{t.redeSeguranca}</Text>
          <TouchableOpacity onPress={() => router.push('/contatos' as any)}>
            <Text style={styles.seeAllText}>{t.verTodas}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.networkRow}>
          <TouchableOpacity style={styles.networkItem} onPress={() => router.push('/contatos' as any)}>
            <View style={styles.addContactCircle}>
              <Ionicons name="add" size={24} color="#751935" />
            </View>
            <Text style={styles.contactName} numberOfLines={1}>{t.adicionar}</Text>
          </TouchableOpacity>

          {listaContatos.map((contato, index) => (
            <TouchableOpacity
              key={contato.id || index}
              style={styles.networkItem}
              onPress={() => router.push('/contatos' as any)}
            >
              <View style={styles.contactAvatarCircle}>
                <Ionicons name={AVATARES[contato.avatarId] as any || "person-outline"} size={22} color="#751935" />
              </View>
              <Text style={styles.contactName} numberOfLines={1}>
                {contato.nomeExibicao}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SEÇÃO: INFORMATIVOS E NOTÍCIAS */}
        <View style={[styles.networkSectionHeader, { marginTop: 10 }]}>
          <Text style={styles.sectionTitle}>{t.informativos}</Text>
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
                <Text style={styles.saibaMaisTexto}>{t.saibaMais}</Text>
                <Ionicons name="arrow-forward" size={16} color="#751935" />
              </TouchableOpacity>
            </View>
          ))}

          {noticiasIA.length === 0 && (
            <View style={styles.noticiaCard}>
              <View style={[styles.noticiaTag, { backgroundColor: '#F0C4CF' }]}>
                <Text style={[styles.noticiaTagText, { color: '#751935' }]}>{t.dicaZella}</Text>
              </View>
              <Text style={styles.noticiaTitle}>{t.aprenderSinais}</Text>
              <Text style={styles.noticiaSummary}>
                {t.resumoIa}
              </Text>
            </View>
          )}
        </ScrollView>
      
      </ScrollView>

      <Modal
        visible={tutorialVisivel && !verificandoTutorial}
        transparent
        animationType="fade"
        onRequestClose={fecharTutorial}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={fecharTutorial}
              accessibilityLabel="Fechar tutorial"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color="#751935" />
            </TouchableOpacity>

            <View style={styles.modalIconCircle}>
              <Ionicons
                name="play-circle-outline"
                size={42}
                color="#751935"
              />
            </View>

            <Text style={styles.modalTitle}>
              {t.modalWelcome}
            </Text>

            <Text style={styles.modalDescription}>
              {t.modalDesc}
            </Text>

            <TouchableOpacity
              style={styles.modalPrimaryButton}
              onPress={assistirTutorial}
              accessibilityRole="button"
            >
              <Ionicons name="logo-youtube" size={21} color="#FFFFFF" />
              <Text style={styles.modalPrimaryButtonText}>
                {t.modalBtn}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalSecondaryButton}
              onPress={naoMostrarTutorialNovamente}
              accessibilityRole="button"
            >
              <Text style={styles.modalSecondaryButtonText}>
                {t.modalNotAgain}
              </Text>
            </TouchableOpacity>

            <Text style={styles.modalFooter}>
              {t.modalFooter}
            </Text>
          </View>
        </View>
      </Modal>
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
  contactName: { fontSize: 11, fontWeight: '600', color: '#333', textAlign: 'center' },
  noticiasRow: { gap: 16, paddingVertical: 4, paddingRight: 24, marginBottom: 30 },
  noticiaCard: { backgroundColor: '#FFF', width: 300, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#FFFFFF', elevation: 3, shadowColor: '#830c30ff', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  noticiaImage: { width: '100%', height: 130, borderRadius: 12, marginBottom: 10 },
  noticiaTag: { alignSelf: 'flex-start', backgroundColor: '#75193515', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  noticiaTagText: { fontSize: 10, fontWeight: '700', color: '#7a0f2fff', textTransform: 'uppercase' },
  noticiaTitle: { fontSize: 16, fontWeight: 'bold', color: '#6b1027ff', marginBottom: 6, lineHeight: 20 },
  noticiaSummary: { fontSize: 13, color: '#555555ff', lineHeight: 18 },
  saibaMaisBotao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#951136ff' },
  saibaMaisTexto: { fontSize: 12, fontWeight: '700', color: '#8c1f40ff' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(32, 5, 17, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFF9FB',
    borderRadius: 26,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0C4CF',
    elevation: 8,
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  modalIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FBE5EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#65132B',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: '#5B3A43',
    textAlign: 'center',
    marginBottom: 22,
  },
  modalPrimaryButton: {
    width: '100%',
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#751935',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  modalPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalSecondaryButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 6,
  },
  modalSecondaryButtonText: {
    color: '#751935',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  modalFooter: {
    color: '#80616A',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 6,
  }
});