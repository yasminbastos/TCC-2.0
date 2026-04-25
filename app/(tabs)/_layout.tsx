import React from 'react';
import { Tabs } from 'expo-router';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons'; // Biblioteca de ícones que já vem no Expo

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary, // Vinho da sua paleta
        tabBarInactiveTintColor: '#BB8C94',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.light,
          height: 65,
          paddingBottom: 10,
        },
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

      {/* A página de contatos pode ficar oculta do menu principal se preferir, 
          acessando-a pelo perfil ou pela página de emergência */}
      <Tabs.Screen
        name="contatos"
        options={{
          title: 'Contatos',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />

    </Tabs>
  );
}