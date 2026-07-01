import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const infoCards = [
  {
    id: '1',
    titulo: 'Violência Física',
    descricao: 'Empurrões, socos, sacudir, bater ou qualquer ato que fira o corpo.',
    icon: 'fitness-outline',
  },
  {
    id: '2',
    titulo: 'Violência Psicológica',
    descricao: 'Humilhação, insultos, isolamento, perseguição e ameaças.',
    icon: 'brain-outline',
  },
  {
    id: '3',
    titulo: 'Violência Sexual',
    descricao: 'Forçar relações não desejadas, impedir o uso de métodos contraceptivos.',
    icon: 'heart-dislike-outline',
  },
  {
    id: '4',
    titulo: 'Violência Patrimonial',
    descricao: 'Reter dinheiro, destruir documentos, objetos ou bens pessoais.',
    icon: 'wallet-outline',
  },
  {
    id: '5',
    titulo: 'Violência Moral',
    descricao: 'Calúnia, difamação ou injúria (espalhar mentiras ou ofensas).',
    icon: 'megaphone-outline',
  },
];

export default function NotificasScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Aprenda a Identificar</Text>
      <Text style={styles.subTitle}>
        Conhecer os sinais é o primeiro passo para buscar ajuda.
      </Text>

      {infoCards.map((card) => (
        <View key={card.id} style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name={card.icon as any} size={28} color={Colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{card.titulo}</Text>
            <Text style={styles.cardDescription}>{card.descricao}</Text>
            <TouchableOpacity style={styles.learnMore}>
              <Text style={styles.learnMoreText}>Saiba mais</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Fonte: Lei Maria da Penha (Lei 11.340/06)</Text>
      </View>
    </ScrollView>
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
    fontSize: 15,
    color: Colors.secondary,
    marginBottom: 30,
    marginTop: 5,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  cardDescription: {
    fontSize: 13,
    color: Colors.secondary,
    marginTop: 4,
    lineHeight: 18,
  },
  learnMore: {
    marginTop: 10,
  },
  learnMoreText: {
    color: Colors.accent,
    fontWeight: 'bold',
    fontSize: 12,
  },
  footer: {
    marginVertical: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.secondary,
    fontStyle: 'italic',
  },
});