import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

// Dados fictícios para o protótipo
const postsIniciais = [
  {
    id: '1',
    usuario: 'Anônima',
    texto: 'Hoje consegui dar o primeiro passo e procurei o CRAS da minha região. Me senti acolhida.',
    tempo: '2h atrás',
    apoios: 12,
  },
  {
    id: '2',
    usuario: 'Maria S.',
    texto: 'Alguém sabe me dizer se a medida protetiva demora muito para sair aqui em SP?',
    tempo: '5h atrás',
    apoios: 8,
  },
];

export default function ForumScreen() {
  const [posts, setPosts] = useState(postsIniciais);
  const [novoPost, setNovoPost] = useState('');

  const handlePostar = () => {
    if (novoPost.trim() === '') return;
    
    const post = {
      id: Math.random().toString(),
      usuario: 'Você',
      texto: novoPost,
      tempo: 'Agora',
      apoios: 0,
    };

    setPosts([post, ...posts]);
    setNovoPost('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Espaço Seguro</Text>
      <Text style={styles.subTitle}>Compartilhe sua história e apoie outras mulheres.</Text>

      {/* Input de Novo Post */}
      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="Como você está se sentindo hoje?"
          placeholderTextColor={Colors.secondary}
          multiline
          value={novoPost}
          onChangeText={setNovoPost}
        />
        <TouchableOpacity style={styles.postButton} onPress={handlePostar}>
          <Ionicons name="send" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Lista de Feed */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.userIcon}>
                <Ionicons name="person-circle-outline" size={24} color={Colors.primary} />
                <Text style={styles.userName}>{item.usuario}</Text>
              </View>
              <Text style={styles.postTime}>{item.tempo}</Text>
            </View>
            
            <Text style={styles.postText}>{item.texto}</Text>
            
            <View style={styles.postFooter}>
              <TouchableOpacity style={styles.supportButton}>
                <Ionicons name="heart-outline" size={18} color={Colors.accent} />
                <Text style={styles.supportText}>Dar Apoio ({item.apoios})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.commentButton}>
                <Ionicons name="chatbubble-outline" size={18} color={Colors.secondary} />
                <Text style={styles.commentText}>Comentar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subTitle: {
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: 25,
  },
  inputCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
    elevation: 3,
  },
  input: {
    flex: 1,
    minHeight: 50,
    maxHeight: 100,
    paddingHorizontal: 10,
    color: Colors.primary,
    fontSize: 15,
  },
  postButton: {
    backgroundColor: Colors.primary,
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  postCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 5,
  },
  postTime: {
    fontSize: 12,
    color: Colors.secondary,
  },
  postText: {
    fontSize: 15,
    color: Colors.primary,
    lineHeight: 22,
    marginBottom: 15,
  },
  postFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.light,
    paddingTop: 10,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  supportText: {
    fontSize: 13,
    color: Colors.accent,
    marginLeft: 5,
    fontWeight: '500',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentText: {
    fontSize: 13,
    color: Colors.secondary,
    marginLeft: 5,
  },
});