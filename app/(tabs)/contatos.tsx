import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/theme';
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
  getDocs 
} from 'firebase/firestore';

interface Contato {
  id: string;
  nome: string;
  email: string;
}

export default function ContatosScreen() {
  const [emailBusca, setEmailBusca] = useState('');
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(false);

  // Carrega os contatos do Firebase ao abrir a tela
  useEffect(() => {
    buscarContatosSalvos();
  }, []);

  const buscarContatosSalvos = async () => {
    if (!auth.currentUser) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const idsContatos = userDoc.data().contatosEmergencia || [];
        
        const listaTemporaria: Contato[] = [];
        // Loop para pegar os dados de cada contato pelo ID
        for (const id of idsContatos) {
          const contatoDoc = await getDoc(doc(db, 'users', id));
          if (contatoDoc.exists()) {
            listaTemporaria.push({ 
              id: contatoDoc.id, 
              nome: contatoDoc.data().nome, 
              email: contatoDoc.data().email 
            });
          }
        }
        setContatos(listaTemporaria);
      }
    } catch (error) {
      console.error("Erro ao carregar contatos:", error);
    }
  };

  const adicionarContato = async () => {
    // Tratamento rigoroso do input para evitar erros de busca
    const emailLimpo = emailBusca.trim().toLowerCase();

    if (emailLimpo === '') {
      Alert.alert("Erro", "Digite o e-mail do contato.");
      return;
    }

    if (emailLimpo === auth.currentUser?.email?.toLowerCase()) {
      Alert.alert("Erro", "Você não pode adicionar seu próprio e-mail.");
      return;
    }

    setLoading(true);

    try {
      // 1. Busca se o contato existe na coleção 'users' do Firestore
      const q = query(collection(db, 'users'), where("email", "==", emailLimpo));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Não encontrado", "Este e-mail não está cadastrado no Zella. Peça para a pessoa criar uma conta primeiro.");
        setLoading(false);
        return;
      }

      const contatoDoc = querySnapshot.docs[0];
      const contatoId = contatoDoc.id;

      // Verifica se já está na lista para não duplicar
      if (contatos.some(c => c.id === contatoId)) {
        Alert.alert("Aviso", "Este contato já está na sua lista.");
        setLoading(false);
        return;
      }

      // 2. Salva o ID no documento da usuária logada (Somente no Firestore)
      const userRef = doc(db, 'users', auth.currentUser!.uid);
      await updateDoc(userRef, {
        contatosEmergencia: arrayUnion(contatoId)
      });

      Alert.alert("Sucesso", "Contato adicionado à sua rede de proteção!");
      setEmailBusca('');
      buscarContatosSalvos(); // Recarrega a lista da tela

    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao adicionar contato no servidor.");
    } finally {
      setLoading(false);
    }
  };

  const removerContato = async (id: string) => {
    try {
      const userRef = doc(db, 'users', auth.currentUser!.uid);
      await updateDoc(userRef, {
        contatosEmergencia: arrayRemove(id)
      });
      setContatos(contatos.filter(c => c.id !== id));
      Alert.alert("Removido", "Contato removido com sucesso.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível remover o contato.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Contatos de Emergência</Text>
      <Text style={styles.description}>
        Adicione e-mails de pessoas que possuem o app Zella para receberem seus alertas de localização.
      </Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="E-mail do Contato"
          value={emailBusca}
          onChangeText={setEmailBusca}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#BB8C94"
        />
        <TouchableOpacity 
          style={[styles.addButton, loading && { opacity: 0.7 }]} 
          onPress={adicionarContato}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.addButtonText}>BUSCAR E ADICIONAR</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={contatos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNome}>{item.nome}</Text>
              <Text style={styles.cardEmail}>{item.email}</Text>
            </View>
            <TouchableOpacity onPress={() => removerContato(item.id)}>
              <Ionicons name="trash-outline" size={24} color={Colors.accent} />
            </TouchableOpacity>
          </View>
        )}
        style={styles.list}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>
            Nenhum contato cadastrado.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 25,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: 30,
    lineHeight: 20,
  },
  form: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light,
    color: Colors.primary,
  },
  addButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: Colors.accent,
  },
  cardInfo: {
    flex: 1,
  },
  cardNome: {
    fontWeight: 'bold',
    fontSize: 16,
    color: Colors.primary,
  },
  cardEmail: {
    color: Colors.secondary,
    fontSize: 14,
    marginTop: 2,
  },
});