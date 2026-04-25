import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function PerfilScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho do Perfil */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={60} color={Colors.primary} />
        </View>
        <Text style={styles.userName}>Duda</Text>
        <Text style={styles.userStatus}>Sua proteção está ativa</Text>
      </View>

      {/* Opções do Menu */}
      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Minha Conta</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.iconArea}>
            <Ionicons name="heart-outline" size={22} color={Colors.primary} />
            <Text style={styles.menuText}>Meus Dados</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.iconArea}>
            <Ionicons name="shield-half-outline" size={22} color={Colors.primary} />
            <Text style={styles.menuText}>Privacidade e Segurança</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.iconArea}>
            <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
            <Text style={styles.menuText}>Configurar Alertas</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
        </TouchableOpacity>

        <Text style={[styles.menuTitle, { marginTop: 25 }]}>Suporte</Text>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.iconArea}>
            <Ionicons name="help-circle-outline" size={22} color={Colors.primary} />
            <Text style={styles.menuText}>Como denunciar?</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.exitButton]}>
          <View style={styles.iconArea}>
            <Ionicons name="log-out-outline" size={22} color={Colors.accent} />
            <Text style={[styles.menuText, { color: Colors.accent }]}>Sair do Aplicativo</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Serene App - Protótipo TCC v1.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    elevation: 4,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  userStatus: {
    fontSize: 14,
    color: Colors.secondary,
    marginTop: 5,
  },
  menuContainer: {
    padding: 25,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
    opacity: 0.7,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  iconArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    marginLeft: 12,
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '500',
  },
  exitButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.light,
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  versionText: {
    color: Colors.secondary,
    fontSize: 12,
  }
});