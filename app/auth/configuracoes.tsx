import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importação do armazenamento local
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
    AppState,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { showAppAlert } from '@/components/app-alert';
import { auth } from "../../config/firebase";
import {
  canUseFullScreenSosAlert,
  isBackgroundSosEnabled,
  openFullScreenSosSettings,
  startBackgroundSos,
  stopBackgroundSos,
  syncBackgroundSosProfile,
} from "../../services/background-sos-control";
import {
  cancelLocalSosTest,
  getPendingLocalSosTestId,
  LocalSosTestError,
  scheduleLocalSosTest,
} from "../../utils/local-sos-notification-test";

const textos = {
  pt: {
    titulo: "Configurações",
    seguranca: "Segurança",
    alterarSenha: "Alterar Senha de Acesso",
    subSenha: "Envia um link seguro para o seu e-mail",
    acessibilidade: "Acessibilidade e Idioma",
    idiomaApp: "Idioma do App",
    preferencias: "Preferências",
    notificacoes: "Notificações Push",
    naoPerturbe: "Alertas no Não Perturbe",
    subNaoPerturbe: "Autorize o Zella no acesso especial do Android",
    sucessoEnvio: "E-mail Enviado",
    msgEnvio: "Verifique sua caixa de entrada para redefinir sua senha.",
    erro: "Erro",
    msgErro: "Não foi possível enviar o e-mail de redefinição."
  },
  en: {
    titulo: "Settings",
    seguranca: "Security",
    alterarSenha: "Change Password",
    subSenha: "Sends a secure link to your email",
    acessibilidade: "Accessibility & Language",
    idiomaApp: "App Language",
    preferencias: "Preferences",
    notificacoes: "Push Notifications",
    naoPerturbe: "Do Not Disturb alerts",
    subNaoPerturbe: "Allow Zella in Android special access",
    sucessoEnvio: "Email Sent",
    msgEnvio: "Check your inbox to reset your password.",
    erro: "Error",
    msgErro: "Could not send the password reset email."
  }
};

export default function Configuracoes() {
  const router = useRouter();
  const user = auth.currentUser;

  const [idioma, setIdioma] = useState<"pt" | "en">("pt");
  const [notificacoes, setNotificacoes] = useState(true);
  const [sosSegundoPlano, setSosSegundoPlano] = useState(false);
  const [alertaTelaCheiaPermitido, setAlertaTelaCheiaPermitido] = useState(true);
  const [alterandoSosSegundoPlano, setAlterandoSosSegundoPlano] = useState(false);
  const [testeLocalAgendadoId, setTesteLocalAgendadoId] = useState<string | null>(null);
  const testeLocalEmAndamentoRef = useRef(false);

  // Carrega o idioma salvo assim que o usuário entra na tela
  useEffect(() => {
    const buscarIdiomaSalvo = async () => {
      try {
        const idiomaSalvo = await AsyncStorage.getItem("@zella_idioma");
        if (idiomaSalvo === "pt" || idiomaSalvo === "en") {
          setIdioma(idiomaSalvo);
        }
      } catch (error) {
        console.log("Erro ao carregar idioma local:", error);
      }
    };

    buscarIdiomaSalvo();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const atualizarPermissao = () => {
      canUseFullScreenSosAlert()
        .then(setAlertaTelaCheiaPermitido)
        .catch((error) => console.log('Erro ao consultar alerta em tela cheia:', error));
    };
    atualizarPermissao();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') atualizarPermissao();
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    isBackgroundSosEnabled()
      .then(setSosSegundoPlano)
      .catch((error) => console.log('Erro ao consultar SOS em segundo plano:', error));
  }, []);

  useEffect(() => {
    if (!__DEV__) return;

    getPendingLocalSosTestId()
      .then(setTesteLocalAgendadoId)
      .catch((error) => console.log('Erro ao consultar teste SOS local:', error));
  }, []);

  // Função para mudar o idioma e salvar a escolha no dispositivo
  const handleAlterarIdioma = async (novoIdioma: "pt" | "en") => {
    setIdioma(novoIdioma);
    try {
      await AsyncStorage.setItem("@zella_idioma", novoIdioma);
    } catch (error) {
      console.log("Erro ao salvar idioma local:", error);
    }
  };

  const t = textos[idioma];

  const handleMudarSenha = async () => {
    if (!user || !user.email) {
      showAppAlert(t.erro, "User not found / Usuário não encontrado.");
      return;
    }

    showAppAlert(
      t.alterarSenha,
      idioma === "pt" 
        ? `Deseja enviar um e-mail de redefinição para: ${user.email}?`
        : `Do you want to send a reset email to: ${user.email}?`,
      [
        { text: idioma === "pt" ? "Cancelar" : "Cancel", style: "cancel" },
        {
          text: idioma === "pt" ? "Enviar" : "Send",
          onPress: async () => {
            try {
              await sendPasswordResetEmail(auth, user.email!);
              showAppAlert(t.sucessoEnvio, t.msgEnvio);
            } catch (error) {
              console.log("Erro ao redefinir senha:", error);
              showAppAlert(t.erro, t.msgErro);
            }
          },
        },
      ]
    );
  };

  const handleAbrirAcessoNaoPerturbe = async () => {
    try {
      await Linking.sendIntent('android.settings.NOTIFICATION_POLICY_ACCESS_SETTINGS');
    } catch {
      showAppAlert(
        t.erro,
        idioma === 'pt'
          ? 'Abra Acesso especial > Acesso ao Não Perturbe e autorize o Zella.'
          : 'Open Special access > Do Not Disturb access and allow Zella.'
      );
    }
  };

  const handleAbrirAlertaTelaCheia = async () => {
    try {
      await openFullScreenSosSettings();
    } catch {
      showAppAlert(
        t.erro,
        idioma === 'pt'
          ? 'Abra Acesso especial > Alertas em tela cheia e autorize o Zella.'
          : 'Open Special access > Full-screen alerts and allow Zella.'
      );
    }
  };

  const ativarSosSegundoPlano = async () => {
    if (Platform.OS !== 'android' || alterandoSosSegundoPlano) return;
    setAlterandoSosSegundoPlano(true);
    try {
      if (!auth.currentUser) throw new Error('Entre na sua conta antes de ativar esta proteção.');

      const locationPermission = await Location.requestForegroundPermissionsAsync();
      if (!locationPermission.granted) {
        throw new Error('A localização é necessária para enviar sua posição no SOS.');
      }

      const notificationPermission = await Notifications.requestPermissionsAsync();
      if (!notificationPermission.granted) {
        throw new Error('As notificações são necessárias para manter a proteção ativa.');
      }

      await syncBackgroundSosProfile();
      await startBackgroundSos();
      setSosSegundoPlano(true);
      showAppAlert(
        'Proteção em segundo plano ativada',
        'Pressione três vezes o botão de aumentar volume em até 3 segundos para acionar o SOS. Com o app minimizado, mantenha o volume abaixo do máximo.'
      );
    } catch (error) {
      setSosSegundoPlano(false);
      showAppAlert(
        'Não foi possível ativar',
        error instanceof Error ? error.message : 'Tente novamente.'
      );
    } finally {
      setAlterandoSosSegundoPlano(false);
    }
  };

  const alterarSosSegundoPlano = (enabled: boolean) => {
    if (enabled) {
      showAppAlert(
        'Ativar SOS em segundo plano?',
        'Uma notificação permanente será exibida. Pressionar aumentar volume três vezes rapidamente acionará um SOS real. Diminuir volume será ignorado.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ativar', onPress: ativarSosSegundoPlano },
        ]
      );
      return;
    }

    setAlterandoSosSegundoPlano(true);
    stopBackgroundSos()
      .then(() => setSosSegundoPlano(false))
      .catch(() => showAppAlert('Erro', 'Não foi possível desativar a proteção.'))
      .finally(() => setAlterandoSosSegundoPlano(false));
  };

  const executarTesteLocalSeguro = async () => {
    if (!__DEV__ || testeLocalEmAndamentoRef.current) return;

    testeLocalEmAndamentoRef.current = true;
    try {
      const identifier = await scheduleLocalSosTest();
      setTesteLocalAgendadoId(identifier);
      showAppAlert(
        'Teste local agendado',
        'O alerta aparecerá em 10 segundos. Você pode manter o app aberto, colocá-lo em segundo plano ou removê-lo dos recentes.'
      );
    } catch (error) {
      const message =
        error instanceof LocalSosTestError
          ? error.message
          : 'Não foi possível agendar o teste local.';
      showAppAlert('Teste local não agendado', message);

      if (error instanceof LocalSosTestError && error.code === 'already-scheduled') {
        setTesteLocalAgendadoId(await getPendingLocalSosTestId());
      }
    } finally {
      testeLocalEmAndamentoRef.current = false;
    }
  };

  const handleTestarAlertaLocal = () => {
    if (!__DEV__) return;

    showAppAlert(
      'Testar alerta SOS neste aparelho',
      'Este teste é estritamente local. Nenhum contato será avisado e nenhum dado será enviado para serviços externos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Agendar em 10 segundos', onPress: executarTesteLocalSeguro },
      ]
    );
  };

  const handleCancelarTesteLocal = async () => {
    if (!__DEV__ || !testeLocalAgendadoId || testeLocalEmAndamentoRef.current) return;

    testeLocalEmAndamentoRef.current = true;
    try {
      const canceled = await cancelLocalSosTest(testeLocalAgendadoId);
      setTesteLocalAgendadoId(null);
      showAppAlert(
        canceled ? 'Teste local cancelado' : 'Teste local já entregue',
        canceled
          ? 'A notificação agendada foi cancelada.'
          : 'A notificação não estava mais entre os alertas agendados.'
      );
    } catch {
      showAppAlert('Erro', 'Não foi possível cancelar o teste local.');
    } finally {
      testeLocalEmAndamentoRef.current = false;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3D1F2B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.titulo}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* SEGURANÇA */}
        <Text style={styles.sectionTitle}>{t.seguranca}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem} onPress={handleMudarSenha}>
            <View style={styles.leftContent}>
              <View style={styles.iconBox}>
                <Ionicons name="lock-closed-outline" size={20} color="#9c3569" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuText}>{t.alterarSenha}</Text>
                <Text style={styles.subText}>{t.subSenha}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C7C7C7" />
          </TouchableOpacity>
        </View>

        {/* IDIOMA */}
        <Text style={styles.sectionTitle}>{t.acessibilidade}</Text>
        <View style={styles.card}>
          <View style={styles.languageContainer}>
            <View style={styles.leftContent}>
              <View style={styles.iconBox}>
                <MaterialIcons name="language" size={20} color="#9c3569" />
              </View>
              <Text style={styles.menuText}>{t.idiomaApp}</Text>
            </View>
            
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radioButton, idioma === "pt" && styles.radioActive]}
                onPress={() => handleAlterarIdioma("pt")}
              >
                <Text style={[styles.radioLabel, idioma === "pt" && styles.radioLabelActive]}>PT</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.radioButton, idioma === "en" && styles.radioActive]}
                onPress={() => handleAlterarIdioma("en")}
              >
                <Text style={[styles.radioLabel, idioma === "en" && styles.radioLabelActive]}>EN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* PREFERÊNCIAS */}
        <Text style={styles.sectionTitle}>{t.preferencias}</Text>
        <View style={styles.card}>
          <View style={styles.switchContainer}>
            <View style={styles.leftContent}>
              <View style={styles.iconBox}>
                <Ionicons name="notifications-outline" size={20} color="#9c3569" />
              </View>
              <Text style={styles.menuText}>{t.notificacoes}</Text>
            </View>
            <Switch
              value={notificacoes}
              onValueChange={setNotificacoes}
              trackColor={{ false: "#EAEAEA", true: "#9c3569" }}
              thumbColor={notificacoes ? "#751935" : "#FFF"}
            />
          </View>
          {Platform.OS === 'android' && (
            <View style={styles.switchContainer}>
              <View style={[styles.leftContent, { flex: 1, paddingRight: 12 }]}>
                <View style={styles.iconBox}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#9c3569" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuText}>SOS em segundo plano</Text>
                  <Text style={styles.subText}>Três toques em aumentar volume; diminuir é ignorado</Text>
                </View>
              </View>
              <Switch
                value={sosSegundoPlano}
                disabled={alterandoSosSegundoPlano}
                onValueChange={alterarSosSegundoPlano}
                trackColor={{ false: "#EAEAEA", true: "#9c3569" }}
                thumbColor={sosSegundoPlano ? "#751935" : "#FFF"}
              />
            </View>
          )}
          {Platform.OS === 'android' && (
            <TouchableOpacity style={styles.menuItem} onPress={handleAbrirAcessoNaoPerturbe}>
              <View style={styles.leftContent}>
                <View style={styles.iconBox}>
                  <Ionicons name="moon-outline" size={20} color="#9c3569" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuText}>{t.naoPerturbe}</Text>
                  <Text style={styles.subText}>{t.subNaoPerturbe}</Text>
                </View>
              </View>
              <Ionicons name="open-outline" size={18} color="#751935" />
            </TouchableOpacity>
          )}
          {Platform.OS === 'android' && Number(Platform.Version) >= 34 && (
            <TouchableOpacity style={styles.menuItem} onPress={handleAbrirAlertaTelaCheia}>
              <View style={styles.leftContent}>
                <View style={styles.iconBox}>
                  <Ionicons name="phone-portrait-outline" size={20} color="#9c3569" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuText}>Alerta SOS em tela cheia</Text>
                  <Text style={styles.subText}>
                    {alertaTelaCheiaPermitido
                      ? 'Permitido neste aparelho'
                      : 'Toque para permitir no Android'}
                  </Text>
                </View>
              </View>
              <Ionicons
                name={alertaTelaCheiaPermitido ? 'checkmark-circle' : 'warning-outline'}
                size={19}
                color={alertaTelaCheiaPermitido ? '#27864A' : '#C46B18'}
              />
            </TouchableOpacity>
          )}
          {__DEV__ && (
            <>
              <TouchableOpacity style={styles.menuItem} onPress={handleTestarAlertaLocal}>
                <View style={styles.leftContent}>
                  <View style={styles.iconBox}>
                    <Ionicons name="flask-outline" size={20} color="#9c3569" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuText}>Testar alerta SOS neste aparelho</Text>
                    <Text style={styles.subText}>Teste local; nenhum contato será avisado</Text>
                  </View>
                </View>
                <Ionicons name="timer-outline" size={18} color="#751935" />
              </TouchableOpacity>
              {testeLocalAgendadoId && (
                <TouchableOpacity style={styles.menuItem} onPress={handleCancelarTesteLocal}>
                  <View style={styles.leftContent}>
                    <View style={styles.iconBox}>
                      <Ionicons name="close-circle-outline" size={20} color="#9c3569" />
                    </View>
                    <Text style={styles.menuText}>Cancelar teste local agendado</Text>
                  </View>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderColor: "#F3ECEF",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3D1F2B",
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8E6B79",
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 15,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: "#F0E6EA",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  languageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F7ECEF",
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3D1F2B",
  },
  subText: {
    fontSize: 12,
    color: "#8E6B79",
    marginTop: 2,
  },
  radioGroup: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 3,
  },
  radioButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  radioActive: {
    backgroundColor: "#751935",
  },
  radioLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
  },
  radioLabelActive: {
    color: "#FFF",
  },
});
