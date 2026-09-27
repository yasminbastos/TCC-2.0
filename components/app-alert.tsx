import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { AlertButton, AlertOptions } from 'react-native';

type AlertRequest = {
  id: number;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  options?: AlertOptions;
};

type AlertKind = 'success' | 'error' | 'warning' | 'danger' | 'info';

let nextAlertId = 1;
let listener: ((request: AlertRequest) => void) | null = null;
const pendingAlerts: AlertRequest[] = [];

/** Exibe o alerta visual padronizado do Zella em qualquer tela do aplicativo. */
export function showAppAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AlertOptions
) {
  const request = { id: nextAlertId++, title, message, buttons, options };

  if (listener) listener(request);
  else pendingAlerts.push(request);
}

function inferKind(title: string): AlertKind {
  const normalized = title.toLocaleLowerCase('pt-BR');

  if (/(excluir|exclusão|apagar|remover)/.test(normalized)) return 'danger';
  if (/(erro|error|falha|não foi possível|não encontrado|não agendado)/.test(normalized)) {
    return 'error';
  }
  if (/(aviso|atenção|notice|senha fraca|configurações)/.test(normalized)) return 'warning';
  if (/(sucesso|success|enviado|sent|ativad|agendado|cancelado|entregue|verifique)/.test(normalized)) {
    return 'success';
  }

  return 'info';
}

const appearance: Record<AlertKind, { color: string; soft: string; icon: keyof typeof Ionicons.glyphMap }> = {
  success: { color: '#16805B', soft: '#E7F6EF', icon: 'checkmark-circle' },
  error: { color: '#C43D4B', soft: '#FDECEF', icon: 'close-circle' },
  warning: { color: '#C47A16', soft: '#FFF4DF', icon: 'alert-circle' },
  danger: { color: '#C43D4B', soft: '#FDECEF', icon: 'trash' },
  info: { color: '#9C3569', soft: '#F8EAF1', icon: 'information-circle' },
};

export function AppAlertProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<AlertRequest | null>(null);
  const queueRef = useRef<AlertRequest[]>([]);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  const presentNext = () => {
    setCurrent((visible) => visible ?? queueRef.current.shift() ?? null);
  };

  useEffect(() => {
    listener = (request) => {
      queueRef.current.push(request);
      presentNext();
    };

    if (pendingAlerts.length) {
      queueRef.current.push(...pendingAlerts.splice(0));
      presentNext();
    }

    return () => {
      listener = null;
    };
  }, []);

  useEffect(() => {
    if (!current) return;

    opacity.setValue(0);
    scale.setValue(0.92);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        damping: 17,
        stiffness: 220,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [current, opacity, scale]);

  const kind = useMemo(() => inferKind(current?.title ?? ''), [current?.title]);
  const theme = appearance[kind];
  const buttons = current?.buttons?.length ? current.buttons : [{ text: 'OK' }];

  const dismiss = (button?: AlertButton) => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 130, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.96, duration: 130, useNativeDriver: true }),
    ]).start(() => {
      setCurrent(null);
      requestAnimationFrame(() => {
        button?.onPress?.();
        current?.options?.onDismiss?.();
        requestAnimationFrame(presentNext);
      });
    });
  };

  const cancelButton = buttons.find((button) => button.style === 'cancel');
  const handleRequestClose = () => {
    if (cancelButton) dismiss(cancelButton);
    else if (current?.options?.cancelable) dismiss();
  };

  return (
    <>
      {children}
      <Modal
        animationType="none"
        transparent
        visible={Boolean(current)}
        statusBarTranslucent
        onRequestClose={handleRequestClose}
      >
        <Animated.View style={[styles.overlay, { opacity }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar aviso"
            disabled={!current?.options?.cancelable}
            onPress={() => dismiss(cancelButton)}
            style={StyleSheet.absoluteFill}
          />

          <Animated.View
            accessibilityRole="alert"
            style={[styles.card, { opacity, transform: [{ scale }] }]}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.soft }]}>
              <Ionicons name={theme.icon} size={30} color={theme.color} />
            </View>

            <Text style={styles.title}>{current?.title}</Text>
            {current?.message ? <Text style={styles.message}>{current.message}</Text> : null}

            <View style={[styles.actions, buttons.length > 2 && styles.actionsStacked]}>
              {buttons.map((button, index) => {
                const destructive = button.style === 'destructive';
                const cancel = button.style === 'cancel';
                const primary = !cancel && index === buttons.length - 1;
                const buttonColor = destructive ? appearance.danger.color : theme.color;

                return (
                  <Pressable
                    accessibilityRole="button"
                    key={`${button.text ?? 'OK'}-${index}`}
                    onPress={() => dismiss(button)}
                    style={({ pressed }) => [
                      styles.button,
                      buttons.length > 2 && styles.stackedButton,
                      primary && { backgroundColor: buttonColor, borderColor: buttonColor },
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        { color: destructive && !primary ? appearance.danger.color : '#5D4A54' },
                        primary && styles.primaryButtonText,
                      ]}
                    >
                      {button.text ?? 'OK'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(39, 22, 31, 0.52)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    elevation: 12,
    maxWidth: 380,
    paddingBottom: 20,
    paddingHorizontal: 22,
    paddingTop: 24,
    shadowColor: '#351523',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginBottom: 14,
    width: 48,
  },
  title: {
    color: '#2E2027',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.25,
    textAlign: 'center',
  },
  message: {
    color: '#74636C',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
    width: '100%',
  },
  actionsStacked: {
    flexDirection: 'column',
  },
  button: {
    alignItems: 'center',
    borderColor: '#E8DDE3',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  stackedButton: {
    flex: 0,
    width: '100%',
  },
  buttonPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.985 }],
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
});
