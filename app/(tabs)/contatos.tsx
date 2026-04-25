import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface Contato {
  id: string;
  nome: string;
  telefone: string;
}

export default function ContatosScreen() {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [contatos, setContatos] = useState<Contato[]>([
    { id: '1', nome: 'Exemplo: Mãe', telefone: '(11) 99999-9999' }
  ]);

  const adicionarContato = () => {
    if (nome.trim() === '' || telefone.trim() === '') {
      Alert.alert("Erro", "Por favor, preencha nome e telefone.");
      return;
    }

    const novoContato = {
      id: Math.random().toString(),
      nome,
      telefone,
    };

    setContatos([...contatos, novoContato]);
    setNome('');
    setTelefone('');
  };

  const removerContato = (id: string) => {
    setContatos(contatos.filter(c => c.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Contatos de Emergência</Text>
      <Text style={styles.description}>
        Adicione pessoas de confiança que receberão seu alerta de SOS.
      </Text>

      {/* Formulário de Cadastro */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nome do Contato"
          value={nome}
          onChangeText={setNome}
          placeholderTextColor="#BB8C94"
        />
        <TextInput
          style={styles.input}
          placeholder="Telefone com DDD"
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
          placeholderTextColor="#BB8C94"
        />
        <TouchableOpacity style={styles.addButton} onPress={adicionarContato}>
          <Text style={styles.addButtonText}>ADICIONAR CONTATO</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Contatos */}
      <FlatList
        data={contatos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNome}>{item.nome}</Text>
              <Text style={styles.cardTelefone}>{item.telefone}</Text>
            </View>
            <TouchableOpacity onPress={() => removerContato(item.id)}>
              <Ionicons name="trash-outline" size={24} color={Colors.accent} />
            </TouchableOpacity>
          </View>
        )}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // Oat Milk
    padding: 25,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary, // Vinho
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
    borderLeftColor: Colors.accent, // Rosa Vibrante
  },
  cardInfo: {
    flex: 1,
  },
  cardNome: {
    fontWeight: 'bold',
    fontSize: 16,
    color: Colors.primary,
  },
  cardTelefone: {
    color: Colors.secondary,
    fontSize: 14,
    marginTop: 2,
  },
});