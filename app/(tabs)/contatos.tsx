import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet as RNStyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  ActivityIndicator, 
  Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../../config/firebase';
import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  deleteField 
} from 'firebase/firestore';

const AVATARES = [
  { id: "person", icon: "person", color: "#921637ff" },
  { id: "happy", icon: "happy-outline", color: "#921637ff" },
  { id: "planet", icon: "planet-outline", color: "#921637ff" },
  { id: "star", icon: "star-outline", color: "#921637ff" },
  { id: "paw", icon: "paw-outline", color: "#921637ff" },
  { id: "leaf", icon: "leaf-outline", color: "#921637ff" },
];

interface Contato {
  id: string;
  nome: string;
  email: string;
  apelido?: string; 
  avatarId?: string; 
}

export default function ContatosScreen() {
  const [emailBusca, setEmailBusca] = useState('');
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [modalVisivel, setModalVisivel] = useState(false);
  const [contatoSelecionado, setContatoSelecionado] = useState<Contato | null>(null);
  const [novoApelido, setNovoApelido] = useState('');

  useEffect(() => {
    buscarContatosSalvos();
  }, []);

  const buscarContatosSalvos = async () => {
    if (!auth.currentUser) return;
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', auth.currentUser.uid));
      if (userDoc.exists()) {
        const idsContatos = userDoc.data().contatosEmergencia || [];
        const apelidos = userDoc.data().apelidosContatos || {}; 
        
        const listaTemporaria: Contato[] = [];
        for (const id of idsContatos) {
          const contatoDoc = await getDoc(doc(db, 'usuarios', id));
          if (contatoDoc.exists()) {
            listaTemporaria.push({ 
              id: contatoDoc.id, 
              nome: contatoDoc.data().nome, 
              email: contatoDoc.data().email,
              apelido: apelidos[id] || '',
              avatarId: contatoDoc.data().avatarId || 'person' 
            });
          }
        }
        setContatos(listaTemporaria);
      }
    } catch (error) {
      console.error("Erro ao carregar contatos:", error);
    }
  };

  // 🔄 FUNÇÃO ADICIONAR CONTATO CORRIGIDA
  const adicionarContato = async () => {
    const emailLimpo = emailBusca.trim().toLowerCase();

    // 1️⃣ Validação de campo vazio
    if (emailLimpo === '') {
      Alert.alert("Erro", "Digite o e-mail.");
      return;
    }

    // 2️⃣ 🚫 BLOQUEIO DE SEGURANÇA: Não deixa adicionar você mesma!
    if (emailLimpo === auth.currentUser?.email?.toLowerCase()) {
      Alert.alert("Aviso", "Você não pode adicionar você mesma como seu próprio contato de emergência.");
      return; 
    }

    setLoading(true);
    try {
      const q = query(collection(db, 'usuarios'), where("email", "==", emailLimpo));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Não encontrado", "E-mail não cadastrado no Zella.");
        setLoading(false);
        return;
      }

      const contatoId = querySnapshot.docs[0].id;
      if (contatos.some(c => c.id === contatoId)) {
        Alert.alert("Aviso", "Já está na sua lista.");
        setLoading(false);
        return;
      }

      const userRef = doc(db, 'usuarios', auth.currentUser!.uid);
      await updateDoc(userRef, { contatosEmergencia: arrayUnion(contatoId) });

      setEmailBusca('');
      buscarContatosSalvos();
      Alert.alert("Sucesso", "Contato adicionado!");
    } catch (error) {
      Alert.alert("Erro", "Falha ao adicionar.");
    } finally {
      setLoading(false);
    }
  };

  const salvarApelido = async () => {
    if (!contatoSelecionado || !auth.currentUser) return;
    try {
      const userRef = doc(db, 'usuarios', auth.currentUser.uid);
      await updateDoc(userRef, {
        [`apelidosContatos.${contatoSelecionado.id}`]: novoApelido.trim()
      });
      setModalVisivel(false);
      buscarContatosSalvos(); 
      Alert.alert("Sucesso", "Nome de exibição updated!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o apelido.");
    }
  };

  const removerContato = async (id: string) => {
    try {
      const userRef = doc(db, 'usuarios', auth.currentUser!.uid);
      await updateDoc(userRef, {
        contatosEmergencia: arrayRemove(id),
        [`apelidosContatos.${id}`]: deleteField()
      });
      setContatos(contatos.filter(c => c.id !== id));
    } catch (error) {
      Alert.alert("Erro", "Não removeu.");
    }
  };

  const abrirModalEdicao = (contato: Contato) => {
    setContatoSelecionado(contato);
    setNovoApelido(contato.apelido || contato.nome);
    setModalVisivel(true);
  };

  const obterIconeAvatar = (avatarId?: string) => {
    return AVATARES.find(a => a.id === avatarId) || AVATARES[0];
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <View style={styles.shieldIcon}>
            <Ionicons name="shield-checkmark" size={24} color="#98203aff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Contatos de Emergência</Text>
            <Text style={styles.description}>
              Pessoas de confiança que receberão sua localização no SOS.
            </Text>
          </View>
        </View>

        <View style={styles.inputBox}>
          <Ionicons name="mail-outline" size={20} color="#8A929A" style={{ marginRight: 12 }} />
          <TextInput
            placeholder="E-mail do contato"
            placeholderTextColor="#91979e"
            value={emailBusca}
            onChangeText={setEmailBusca}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.inputTextStyle}
          />
          <TouchableOpacity style={styles.inlineButton} onPress={adicionarContato}>
            {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.inlineButtonText}>Adicionar</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={14} color="#FCEAEF" />
          <Text style={styles.infoText}>Apenas usuários cadastrados no Zella.</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listHeaderText}>Seus contatos ({contatos.length})</Text>
          <View style={styles.line} />
        </View>

        <FlatList
          data={contatos}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const avatarConfig = obterIconeAvatar(item.avatarId);
            return (
              <View style={styles.card}>
                <View style={styles.avatarWrapper}>
                  <View style={styles.avatarCircle}>
                    <Ionicons 
                      name={avatarConfig.icon as any} 
                      size={26} 
                      color={avatarConfig.color} 
                    />
                  </View>
                  <View style={styles.statusDot} />
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.cardNome} numberOfLines={1}>{item.apelido || item.nome}</Text>
                  <Text style={styles.cardEmail} numberOfLines={1}>{item.email}</Text>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => abrirModalEdicao(item)} style={styles.actionBtn}>
                    <Ionicons name="pencil-sharp" size={16} color="#8e2038ff" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removerContato(item.id)} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={16} color="#E03131" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      </View>

      <Modal visible={modalVisivel} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar apelido</Text>
            <Text style={styles.modalSub}>Como você quer identificar essa pessoa no app?</Text>
            <TextInput
              value={novoApelido}
              onChangeText={setNovoApelido}
              style={styles.modalInputStyle}
              placeholder="Ex: Mãe, Irmão..."
              placeholderTextColor="#A4ACB4"
            />
            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setModalVisivel(false)} style={styles.cancelBtn}>
                <Text style={{ color: '#495057', fontWeight: '500' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={salvarApelido} style={styles.saveBtn}>
                <Text style={{ color: '#FFF', fontWeight: '600' }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = RNStyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#73122cff', 
    paddingTop: 65 
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingBottom: 9,
  },
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 21, 
    gap: 13 , 
  },
  shieldIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    backgroundColor: '#FCEAEF', 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#FFFFFF', 
    marginBottom: 4 
  },
  description: { 
    fontSize: 13, 
    color: '#FCEAEF', 
    lineHeight: 18,
    opacity: 0.9
  },
  inputBox: { 
    backgroundColor: '#FFF', 
    height: 55, 
    borderRadius: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingLeft: 16, 
    paddingRight: 6,
  },
  inputTextStyle: {
    flex: 1,
    height: 48,
    color: '#1A1C1E',
    fontSize: 15,
  },
  inlineButton: { 
    backgroundColor: '#a22949ff', 
    height: 44, 
    paddingHorizontal: 16, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  inlineButtonText: { 
    color: '#FFF', 
    fontWeight: '600', 
    fontSize: 14 
  },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10, 
    marginBottom: 16, 
    paddingHorizontal: 4 
  },
  infoText: { 
    fontSize: 12, 
    color: '#FCEAEF', 
    marginLeft: 6,
    opacity: 0.9
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FCEAEF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  listHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  listHeaderText: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#7e1833ff' 
  },
  line: { 
    flex: 1, 
    height: 1, 
    backgroundColor: '#E9ECEF', 
    marginLeft: 12 
  },
  card: { 
    backgroundColor: '#9d364cff', 
    borderRadius: 24, 
    padding: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 14 
  },
  avatarWrapper: { 
    position: 'relative' 
  },
  avatarCircle: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: '#FCEAEF', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  statusDot: { 
    position: 'absolute', 
    bottom: 1, 
    right: 1, 
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    backgroundColor: '#2FB35D', 
    borderWidth: 2, 
    borderColor: '#f7f0f2ff' 
  },
  cardContent: { 
    flex: 1, 
    marginLeft: 16, 
    marginRight: 8 
  },
  cardNome: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#FFFFFF', 
    marginBottom: 2 
  },
  cardEmail: { 
    fontSize: 13, 
    color: '#FCEAEF',
    opacity: 0.85 
  },
  cardActions: { 
    flexDirection: 'row', 
    gap: 8 
  },
  actionBtn: { 
    width: 38, 
    height: 38, 
    borderRadius: 12, 
    backgroundColor: '#FFFFFF', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'center', 
    padding: 24 
  },
  modalContent: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 24, 
    width: '100%' 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1A1C1E', 
    marginBottom: 6 
  },
  modalSub: { 
    fontSize: 14, 
    color: '#495057', 
    marginBottom: 16 
  },
  modalInputStyle: {
    backgroundColor: '#FCEAEF',
    width: '100%',
    padding: 14,
    borderRadius: 12,
    color: '#1A1C1E',
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'left',
  },
  modalFooter: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    gap: 12, 
    width: '100%' 
  },
  cancelBtn: { 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 12, 
    justifyContent: 'center' 
  },
  saveBtn: { 
    backgroundColor: '#8A1938', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 12, 
    justifyContent: 'center' 
  }
});