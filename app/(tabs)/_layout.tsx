
import React from 'react';
import { Tabs } from 'expo-router';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native'; // Importamos o Platform para ajustes finos

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#BB8C94',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.light,
          // Aumentamos a altura para 80 ou 90 para dar mais espaço
          height: Platform.OS === 'ios' ? 100 : 85, 
          // O paddingBottom maior empurra os ícones e textos para cima
          paddingBottom: Platform.OS === 'ios' ? 50 : 25,
          paddingTop: 10,
        },
        // Isso garante que o rótulo (texto) acompanhe o ícone com espaçamento
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 10,
        }
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="forum"
        options={{
          title: 'Fórum',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="emergencia"
        options={{
          title: 'SOS',
          tabBarIcon: ({ color, size }) => <Ionicons name="alert-circle" size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="noticias"
        options={{
          title: 'Educar',
          tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />

      {<Tabs.Screen
        name="contatos"
        options={{
          href: null, // Isso esconde o ícone da barra de baixo, mas a página continua existindo
        }}
      /> }
      

    </Tabs>
  );
}