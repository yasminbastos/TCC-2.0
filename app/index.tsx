import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { auth } from '../config/firebase';

export default function Index() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [ondeNavegar, setOndeNavegar] = useState<string | null>(null);

  // 1. Variáveis da Logo
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.75)).current;
  const logoTranslate = useRef(new Animated.Value(25)).current;
  const logoPulse = useRef(new Animated.Value(1)).current;

  // 2. Variáveis das Ondas (Duas ondas para dar fluidez)
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;

  // 3. Variáveis do Texto (Para surgir em efeito cascata)
  const textFade = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    // --- ANIMAÇÃO DE ENTRADA (LOGO) ---
    Animated.parallel([
      Animated.timing(logoFade, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.cubic), // Transição muito mais suave que a exponencial
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6, // Movimento ligeiramente mais amortecido
        tension: 35,
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslate, {
        toValue: 0,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // --- PULSAÇÃO DA LOGO (Só começa após estabilizar) ---
      Animated.loop(
        Animated.sequence([
          Animated.timing(logoPulse, {
            toValue: 1.03, // Pulsação sutil (3%) para não ficar agressivo
            duration: 1400, // Mais lento = mais natural
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(logoPulse, {
            toValue: 1,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // --- ENTRADA DO TEXTO (Atraso de 400ms para efeito cascata) ---
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(textFade, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textTranslate, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // --- CONFIGURAÇÃO DAS ONDAS FLUIDAS ---
    const criarLoopOnda = (animacao: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animacao, {
            toValue: 1,
            duration: 2500, // Onda mais lenta e pacífica
            easing: Easing.out(Easing.ease), // Começa rápido e dissipa devagar
            useNativeDriver: true,
          }),
          Animated.timing(animacao, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Inicializa a Onda 1 imediatamente e a Onda 2 com 1.25s de atraso
    criarLoopOnda(waveAnim1, 0).start();
    criarLoopOnda(waveAnim2, 1250).start();

    // --- FIREBASE & TIMEOUT ---
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setOndeNavegar('/(tabs)');
      } else {
        setOndeNavegar('/auth/login');
      }
    });

    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000); // 4 segundos para desfrutar da animação completa

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!loading && ondeNavegar) {
      router.replace(ondeNavegar as any);
    }
  }, [loading, ondeNavegar]);

  // Interpolações da Onda 1
  const waveScale1 = waveAnim1.interpolate({ inputRange: [0, 1], outputRange: [0.95, 2.8] });
  const waveOpacity1 = waveAnim1.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.35, 0] });

  // Interpolações da Onda 2
  const waveScale2 = waveAnim2.interpolate({ inputRange: [0, 1], outputRange: [0.95, 2.8] });
  const waveOpacity2 = waveAnim2.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.35, 0] });

  const finalLogoScale = Animated.multiply(logoScale, logoPulse);

  return (
    <View style={styles.container}>
      {/* Onda 1 */}
      <Animated.View
        style={[
          styles.wave,
          {
            opacity: waveOpacity1,
            transform: [{ scale: waveScale1 }],
          },
        ]}
      />

      {/* Onda 2 */}
      <Animated.View
        style={[
          styles.wave,
          {
            opacity: waveOpacity2,
            transform: [{ scale: waveScale2 }],
          },
        ]}
      />

      {/* Logo Zella */}
      <Animated.Image
        source={require('../assets/images/icon2.png')}
        resizeMode="contain"
        style={[
          styles.logo,
          {
            opacity: logoFade,
            transform: [
              { scale: finalLogoScale },
              { translateY: logoTranslate },
            ],
          },
        ]}
      />

      {/* Bloco de Texto Animado */}
      <Animated.View 
        style={{ 
          opacity: textFade, 
          transform: [{ translateY: textTranslate }],
          alignItems: 'center' 
        }}
      >
        <Text style={styles.title}>ZELLA</Text>
        <Text style={styles.subtitle}>Proteção e segurança feminina</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf0f6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 999,
    backgroundColor: '#ebd0dd', // Cor super suave para as ondas parecerem sombras de luz
    top: '50%',
    left: '50%',
    marginTop: -120, // Alinha o centro do círculo exatamente atrás da logo
    marginLeft: -85,
  },
  logo: {
    width: 190,
    height: 190,
    marginBottom: 28,
    zIndex: 2,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#700c3c',
    letterSpacing: 5,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#9b5577',
    letterSpacing: 1.2,
  },
});