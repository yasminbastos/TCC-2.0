import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Section = { icon: keyof typeof Ionicons.glyphMap; title: string; text: string };

const content = {
  pt: {
    header: 'Termos e Privacidade',
    eyebrow: 'ZELLA • DOCUMENTO LEGAL',
    title: 'Termos de Uso e Aviso de Privacidade',
    introduction: 'Este documento explica as regras de utilização do Zella e como os dados pessoais necessários ao serviço são tratados. Leia-o antes de criar ou continuar usando sua conta.',
    effective: 'Vigente desde 12 de setembro de 2026',
    sections: [
      { icon: 'document-text-outline', title: '1. Aceitação e finalidade', text: 'Ao criar uma conta ou utilizar o Zella, você declara que leu e concorda com estes termos. O aplicativo oferece recursos de apoio, informação, rede de contatos de confiança e acionamento de alertas de emergência.' },
      { icon: 'alert-circle-outline', title: '2. Limites do serviço de emergência', text: 'O Zella é uma ferramenta complementar e não substitui a Polícia Militar (190), o SAMU (192), os Bombeiros (193) ou outros serviços públicos. Alertas podem sofrer atrasos ou falhas por falta de internet, sinal, bateria, permissões do aparelho ou indisponibilidade de serviços externos.' },
      { icon: 'person-circle-outline', title: '3. Conta e responsabilidades', text: 'Você deve fornecer dados corretos, manter suas credenciais protegidas, cadastrar apenas contatos autorizados e usar os recursos de SOS de boa-fé. É proibido utilizar o aplicativo para assédio, fraude, ameaças, conteúdo ilícito ou alertas deliberadamente falsos.' },
      { icon: 'server-outline', title: '4. Dados tratados', text: 'Podemos tratar dados de cadastro e perfil, contatos de emergência, preferências, tokens de notificação, registros de SOS e localização quando você concede permissão e aciona um recurso que a utiliza. O tratamento é limitado às finalidades informadas e à operação, segurança e melhoria do serviço.' },
      { icon: 'logo-whatsapp', title: '5. Alertas e serviços de terceiros', text: 'Quando você ativa alertas pelo WhatsApp, autoriza o uso do número informado para receber mensagens de emergência. Firebase, Expo, Google e Meta/WhatsApp podem processar dados necessários à entrega de autenticação, armazenamento, notificações, mapas e mensagens, conforme seus próprios termos e políticas.' },
      { icon: 'shield-checkmark-outline', title: '6. Segurança e conservação', text: 'São adotadas medidas técnicas e administrativas razoáveis para proteger os dados. Nenhum sistema, porém, é totalmente imune a incidentes. As informações são mantidas pelo período necessário ao funcionamento do serviço, ao cumprimento de obrigações legais e à proteção de direitos.' },
      { icon: 'key-outline', title: '7. Seus direitos e escolhas', text: 'Nos termos da LGPD, você pode solicitar confirmação e acesso aos dados, correção, informação sobre compartilhamentos, portabilidade quando aplicável, eliminação nas hipóteses legais e revogação do consentimento. Permissões do aparelho e a opção de WhatsApp podem ser desativadas a qualquer momento.' },
      { icon: 'refresh-outline', title: '8. Alterações destes termos', text: 'Este documento pode ser atualizado para refletir mudanças legais, técnicas ou funcionais. Alterações relevantes serão comunicadas no aplicativo e passarão a valer a partir da data indicada na versão atualizada.' },
    ] as Section[],
    footer: 'Versão 2.0 • Última atualização: 12 de setembro de 2026',
  },
  en: {
    header: 'Terms & Privacy',
    eyebrow: 'ZELLA • LEGAL DOCUMENT',
    title: 'Terms of Use and Privacy Notice',
    introduction: 'This document explains the rules for using Zella and how personal data required for the service is processed. Please read it before creating or continuing to use your account.',
    effective: 'Effective as of September 12, 2026',
    sections: [
      { icon: 'document-text-outline', title: '1. Acceptance and purpose', text: 'By creating an account or using Zella, you confirm that you have read and accepted these terms. The app provides support resources, information, a trusted-contact network, and emergency alerts.' },
      { icon: 'alert-circle-outline', title: '2. Emergency service limitations', text: 'Zella is a supplementary tool and does not replace police, ambulance, fire, or other public emergency services. Alerts may be delayed or fail due to connectivity, signal, battery, device permissions, or third-party service availability.' },
      { icon: 'person-circle-outline', title: '3. Account responsibilities', text: 'You must provide accurate details, protect your credentials, add only authorized contacts, and use SOS features in good faith. Harassment, fraud, threats, unlawful content, and deliberately false alerts are prohibited.' },
      { icon: 'server-outline', title: '4. Data we process', text: 'We may process account and profile data, emergency contacts, preferences, notification tokens, SOS records, and location when you grant permission and use a feature that requires it. Processing is limited to the stated purposes and the operation, safety, and improvement of the service.' },
      { icon: 'logo-whatsapp', title: '5. Alerts and third-party services', text: 'When WhatsApp alerts are enabled, you authorize use of the provided number for emergency messages. Firebase, Expo, Google, and Meta/WhatsApp may process data required for authentication, storage, notifications, maps, and message delivery under their own terms and policies.' },
      { icon: 'shield-checkmark-outline', title: '6. Security and retention', text: 'Reasonable technical and organizational safeguards are used to protect data, but no system is entirely immune to incidents. Information is retained as needed to operate the service, comply with legal obligations, and protect rights.' },
      { icon: 'key-outline', title: '7. Your rights and choices', text: 'Subject to applicable law, you may request access, correction, information about sharing, portability where applicable, deletion in legally permitted cases, and withdrawal of consent. Device permissions and WhatsApp alerts can be disabled at any time.' },
      { icon: 'refresh-outline', title: '8. Changes to these terms', text: 'This document may be updated to reflect legal, technical, or product changes. Material changes will be communicated in the app and take effect on the date stated in the updated version.' },
    ] as Section[],
    footer: 'Version 2.0 • Last updated: September 12, 2026',
  },
};

export default function PoliticaPrivacidade() {
  const router = useRouter();
  const [language, setLanguage] = useState<'pt' | 'en'>('pt');

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('@zella_idioma')
      .then((saved) => { if (saved === 'pt' || saved === 'en') setLanguage(saved); })
      .catch((error) => console.log('Erro ao carregar idioma nos Termos:', error));
  }, []));

  const text = content[language];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel={language === 'pt' ? 'Voltar' : 'Go back'} onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={23} color="#3D1F2B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{text.header}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <View style={styles.documentIcon}><Ionicons name="reader-outline" size={25} color="#751935" /></View>
          <Text style={styles.eyebrow}>{text.eyebrow}</Text>
          <Text style={styles.title}>{text.title}</Text>
          <Text style={styles.introduction}>{text.introduction}</Text>
          <View style={styles.effectiveBadge}>
            <Ionicons name="calendar-clear-outline" size={14} color="#751935" />
            <Text style={styles.effectiveText}>{text.effective}</Text>
          </View>
        </View>

        {text.sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}><Ionicons name={section.icon} size={19} color="#751935" /></View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <Text style={styles.paragraph}>{section.text}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Ionicons name="shield-checkmark-outline" size={17} color="#9C7180" />
          <Text style={styles.footerText}>{text.footer}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4F6' },
  header: { alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomColor: '#EDE3E7', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 16, paddingHorizontal: 20, paddingTop: 56 },
  backButton: { alignItems: 'center', backgroundColor: '#F8F1F4', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  headerTitle: { color: '#3D1F2B', fontSize: 17, fontWeight: '700' },
  headerSpacer: { width: 36 },
  scrollContent: { padding: 20, paddingBottom: 46 },
  hero: { backgroundColor: '#FFFFFF', borderColor: '#EDE3E7', borderRadius: 24, borderWidth: 1, marginBottom: 18, padding: 22 },
  documentIcon: { alignItems: 'center', backgroundColor: '#F7E9EF', borderRadius: 14, height: 46, justifyContent: 'center', marginBottom: 18, width: 46 },
  eyebrow: { color: '#9C3569', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  title: { color: '#2F1E26', fontSize: 25, fontWeight: '800', letterSpacing: -0.4, lineHeight: 31, marginTop: 7 },
  introduction: { color: '#6F5A64', fontSize: 14, lineHeight: 22, marginTop: 12 },
  effectiveBadge: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#F8F1F4', borderRadius: 10, flexDirection: 'row', gap: 7, marginTop: 17, paddingHorizontal: 10, paddingVertical: 8 },
  effectiveText: { color: '#751935', fontSize: 11, fontWeight: '700' },
  section: { backgroundColor: '#FFFFFF', borderColor: '#EDE3E7', borderRadius: 18, borderWidth: 1, marginBottom: 12, padding: 18 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', gap: 11, marginBottom: 11 },
  sectionIcon: { alignItems: 'center', backgroundColor: '#F8EEF2', borderRadius: 11, height: 36, justifyContent: 'center', width: 36 },
  sectionTitle: { color: '#3D1F2B', flex: 1, fontSize: 15, fontWeight: '700', lineHeight: 20 },
  paragraph: { color: '#715E67', fontSize: 13.5, lineHeight: 21 },
  footer: { alignItems: 'center', flexDirection: 'row', gap: 7, justifyContent: 'center', marginTop: 18 },
  footerText: { color: '#9C8690', fontSize: 11, fontWeight: '600' },
});
