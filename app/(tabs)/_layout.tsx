import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useIdioma } from '../../contexts/IdiomaContext'; // Ajuste o caminho conforme a sua pasta

const textosAbas = {
  pt: {
    inicio: 'Início',
    forum: 'Fórum',
    cuidese: 'Cuide-se',
    perfil: 'Perfil',
  },
  en: {
    inicio: 'Home',
    forum: 'Forum',
    cuidese: 'Self-care',
    perfil: 'Profile',
  },
};

export default function TabLayout() {
  const { idioma } = useIdioma();
  const t = textosAbas[idioma];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#891437ff', 
        tabBarInactiveTintColor: '#8E6B79', 
        tabBarStyle: {
          backgroundColor: '#F3ECEF', 
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 95 : 75,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 10,
          position: 'absolute', 
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        }
      }}>
      
      {/* INÍCIO */}
      <Tabs.Screen
        name="index"
        options={{
          title: t.inicio,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />

      {/* FÓRUM */}
      <Tabs.Screen
        name="forum"
        options={{
          title: t.forum,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={24} color={color} />
          ),
        }}
      />

      {/* SOS (Botão Central) */}
      <Tabs.Screen
        name="emergencia"
        options={{
          title: 'SOS',
          tabBarLabel: () => null, 
          tabBarButton: (props) => {
            const { delayLongPress, ...restProps } = props as any;
            return (
              <TouchableOpacity
                {...restProps}
                activeOpacity={0.8}
                style={styles.sosButtonContainer}
              >
                <View style={styles.sosCircle}>
                  <Ionicons name="shield-checkmark" size={28} color="#FFF" />
                  <Text style={styles.sosText}>SOS</Text>
                </View>
              </TouchableOpacity>
            );
          },
        }}
      />

      {/* CUIDE-SE / NOTÍCIAS */}
      <Tabs.Screen
        name="noticias"
        options={{
          title: t.cuidese,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "book" : "book-outline"} size={24} color={color} />
          ),
        }}
      />

      {/* PERFIL */}
      <Tabs.Screen
        name="perfil" 
        options={{
          title: t.perfil,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
        }}
      />

      {/* CONTATOS (Oculto na barra) */}
      <Tabs.Screen
        name="contatos" 
        options={{
          href: null, 
        }}
      />

    </Tabs>
  );
}

const styles = StyleSheet.create({
  sosButtonContainer: {
    top: -20, 
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
  },
  sosCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#C74B6E', 
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#FCEEF3', 
    elevation: 5,
    shadowColor: '#801a54ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  sosText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    marginTop: -2,
  },
});