import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIdioma } from '../../contexts/IdiomaContext';

const Colors = {
  primary: '#751935',
  secondary: '#f0c4cfff',
  background: '#fcf0f4ff',
  text: '#4d2a33ff',
  white: '#ffffff',
  green: '#c6486eff',
  alert: 'rgba(194, 11, 51, 1)'
};

const textos = {
  pt: {
    headerTitle: "Guia de Fortalecimento",
    subTitle: "Aprenda, interaja e proteja-se diariamente.",
    quizTag: "MOMENTO REFLEXÃO",
    btnAcontece: "Acontece",
    btnNaoAcontece: "Não acontece",
    proximaReflexao: "Próxima reflexão",
    sectionTitle: "Informativos de Identificação",
    saberMais: "Saber mais",
    footerText: "Você é incrível e não está sozinha.",
    perguntas: [
      {
        id: 1,
        pergunta: "Ele pede minhas senhas das redes sociais para provar que não escondo nada.",
        tipo: "alerta",
        msgSeAcontece: "Atenção! Privacidade é respeito. Senhas são pessoais e o amor verdadeiro não precisa de vigilância ou monitoramento para ser real. 🚩",
        msgSeNaoAcontece: "Perfeito! Isso mostra que existe respeito ao espaço individual de cada um. Confiança é a base de tudo! ✨"
      },
      {
        id: 2,
        pergunta: "Conversamos abertamente sobre nossos sentimentos, mesmo quando estamos chateados.",
        tipo: "saudavel",
        msgSeAcontece: "Maravilhoso! O diálogo honesto e acolhedor é o pilar mais forte de uma convivência que faz bem ao coração. ❤️",
        msgSeNaoAcontece: "Cultivar momentos para conversar sem medo é um passo lindo. Que tal tentar abrir o coração um pouquinho mais na próxima? 🌸"
      },
      {
        id: 3,
        pergunta: "Sinto que preciso mudar meu jeito de vestir para ele não ficar bravo.",
        tipo: "alerta",
        msgSeAcontece: "Fique atenta! Você é livre para se expressar e usar o que te faz sentir bem. Ninguém deve controlar sua imagem ou suas roupas. 👗",
        msgSeNaoAcontece: "Isso aí! Sua liberdade e sua identidade devem ser sempre celebradas e respeitadas. Ninguém manda no seu estilo! 🌟"
      },
      {
        id: 4,
        pergunta: "Meu parceiro me incentiva a fazer aquele curso que eu tanto queria e comemora minhas conquistas.",
        tipo: "saudavel",
        msgSeAcontece: "Que lindo! Quem ama de verdade quer ver o outro crescer, estudar, brilhar e conquistar o mundo inteirinho. 🚀",
        msgSeNaoAcontece: "Lembre-se de que os seus sonhos importam muito. Cerque-se sempre de incentivos para voar alto! 👑"
      },
      {
        id: 5,
        pergunta: "Quando saio com minhas amigas, passo o tempo todo respondendo mensagens para provar onde estou.",
        tipo: "alerta",
        msgSeAcontece: "Olha o sinalzinho de alerta! Curtir momentos separados com suas amizades é super saudável. Confiança não exige relatórios em tempo real. 📱",
        msgSeNaoAcontece: "Excelente! Ter o seu momento com as amigas sem pressões ajuda a manter sua vida equilibrada e cheia de energia boa. 💃"
      },
      {
        id: 6,
        pergunta: "Quando discordamos, conseguimos conversar sem gritos ou ofensas.",
        tipo: "saudavel",
        msgSeAcontece: "Perfeito! Discordar faz parte de qualquer convivência, mas manter a calma e o respeito mútuo mostra muita maturidade. 🕊️",
        msgSeNaoAcontece: "Gritos e ofensas machucam. O diálogo calmo e seguro é o caminho certo para resolver qualquer desentendimento. 🌱"
      },
      {
        id: 7,
        pergunta: "Uma amiga sempre faz piadas sobre mim na frente dos outros e depois diz que eu não sei brincar.",
        tipo: "alerta",
        msgSeAcontece: "Fique de olho! Se uma brincadeira te causa desconforto, vergonha ou mágoa, ela deixou de ser uma piada saudável. Suas emoções são válidas. 💛",
        msgSeNaoAcontece: "Muito bem! Amizades verdadeiras servem para nos colocar para cima e nos fazer sentir seguras e acolhidas. 🥰"
      },
      {
        id: 8,
        pergunta: "Meu parceiro diz que sente muito ciúmes porque me ama.",
        tipo: "alerta",
        msgSeAcontece: "Atenção: ciúme em excesso ou sufocante não é sinônimo de amor, mas sim de insegurança ou sentimento de posse. O afeto real traz paz. 🌿",
        msgSeNaoAcontece: "Isso mesmo! O amor saudável é leve, constrói pontes e não grades. Ele prospera na liberdade e na tranquilidade. 🌻"
      },
      {
        id: 9,
        pergunta: "Conhecido insiste em me tocar, como beijo na bochecha ou abraço, mesmo eu demonstrando desconforto.",
        tipo: "alerta",
        msgSeAcontece: "Seu corpo é seu território sagrado! O consentimento é obrigatório em qualquer aproximação. Se te desconforta, imponha limites sem medo. ✋",
        msgSeNaoAcontece: "Perfeito! Respeitar o espaço físico e a vontade de cada um é a regra número um de qualquer interação social saudável. ⭐"
      },
      {
        id: 10,
        pergunta: "Meu parceiro pede desculpas quando erra e procura mudar suas atitudes.",
        tipo: "saudavel",
        msgSeAcontece: "Incrível! Humildade para reconhecer falhas e agir ativamente para mudar mostra um compromisso real com o seu bem-estar. 🌹",
        msgSeNaoAcontece: "Desculpas vazias sem mudanças reais de comportamento podem virar um ciclo cansativo. Preste atenção nas atitudes do dia a dia. 💭"
      },
      {
        id: 11,
        pergunta: "Meu chefe faz presentes frequentes esperando tratamento especial em troca.",
        tipo: "alerta",
        msgSeAcontece: "Cuidado com as intenções! Relações profissionais devem ser estritamente baseadas em competência, respeito mútuo e limites bem claros. 💼",
        msgSeNaoAcontece: "Excelente! Manter o profissionalismo e a transparência no ambiente de trabalho afasta mal-entendidos e protege sua carreira. 📈"
      },
      {
        id: 12,
        pergunta: "Meu parceiro diz que só quer me proteger e decide com quem posso sair.",
        tipo: "alerta",
        msgSeAcontece: "Fique alerta! Proteção de verdade apoia e cuida, mas nunca deve anular sua autonomia, controlar seus passos ou te isolar do mundo. 🗺️",
        msgSeNaoAcontece: "Exatamente! Você tem toda a capacidade e o direito de decidir seus caminhos, suas companhias e seus momentos de lazer. 🎡"
      },
      {
        id: 13,
        pergunta: "Uma pessoa vive dizendo que ninguém vai gostar de mim como ela gosta.",
        tipo: "alerta",
        msgSeAcontece: "Isso não é verdade, viu? Esse tipo de frase tenta diminuir sua autoconfiança para te deixar dependente. Você é valiosa e merece amor genuíno! ✨",
        msgSeNaoAcontece: "Com certeza! Você sabe o seu valor e entende que merece um afeto livre de manipulações ou chantagens emocionais. 💖"
      },
      {
        id: 14,
        pergunta: "Quando erro, a outra pessoa usa esse erro repetidamente para me fazer sentir culpado.",
        tipo: "alerta",
        msgSeAcontece: "Cuidado! Erros devem ser superados e resolvidos em conjunto através da conversa, e nunca guardados para serem usados como armas de culpa. 🍂",
        msgSeNaoAcontece: "Isso mesmo! Em relações saudáveis existe espaço para aprender com os erros e seguir em frente sem ressentimentos guardados. 🍃"
      },
      {
        id: 15,
        pergunta: "Amigo ou parceiro fica chateado quando faço programas sem convidá-lo.",
        tipo: "alerta",
        msgSeAcontece: "Atenção aos limites! É natural querer estar perto, mas cada um precisa manter seus momentos individuais e hobbies próprios vivos. 👥",
        msgSeNaoAcontece: "Perfeito! Manter a sua individualidade e respeitar o espaço do outro fortalece os laços e evita o desgaste na convivência. 🍇"
      },
      {
        id: 16,
        pergunta: "Uma pessoa sempre toma as decisões por mim porque diz que eu fico nervosa para escolher.",
        tipo: "alerta",
        msgSeAcontece: "Pratique sua voz! Mesmo nas pequenas escolhas, exercer a sua autonomia é fundamental para desenvolver sua segurança interna. 🎯",
        msgSeNaoAcontece: "Muito bem! Tomar suas próprias decisões, errando ou acertando, é o que constrói sua independência e sua autoconfiança. 👑"
      }
    ],
    guias: [
      {
        id: '1',
        categoria: 'CONSCIENTIZAÇÃO',
        titulo: 'Sinais no Corpo',
        descricao: 'O respeito físico é inegociável. Qualquer ato que force, machuque ou tire sua segurança física acende um alerta importante.',
        icon: 'fitness-outline',
        url: 'https://www.fundobrasil.org.br/blog/violencia-contra-a-mulher-como-identificar-e-combater/',
      },
      {
        id: '2',
        categoria: 'INTELIGÊNCIA EMOCIONAL',
        titulo: 'Protegendo sua Mente',
        descricao: 'Humilhações, ofensas frequentes, isolamento dos amigos ou controle emocional disfarçado de amor também deixam marcas invisíveis.',
        icon: 'brain-outline',
        url: 'https://www.cnj.jus.br/silenciosa-e-brutal-violencia-psicologica-atinge-milhares-de-mulheres-no-brasil/',
      },
      {
        id: '3',
        categoria: 'RELACIONAMENTOS',
        titulo: 'Autonomia e Escolha',
        descricao: 'Relações saudáveis são baseadas no consentimento mútuo. Forçar intimidade ou desrespeitar seu tempo e decisões não faz bem.',
        icon: 'heart-dislike-outline',
        url: 'https://www.conexasaude.com.br/blog/um-relacionamento-abusivo/',
      },
      {
        id: '4',
        categoria: 'INDEPENDÊNCIA',
        titulo: 'Sua Liberdade Financeira',
        descricao: 'A retenção do seu próprio dinheiro, destruição de objetos pessoais ou o controle do que você trabalha para conquistar limita sua autonomia.',
        icon: 'wallet-outline',
        url: 'https://www.guetto.org/post/violencia-patrimonial',
      },
    ]
  },
  en: {
    headerTitle: "Empowerment Guide",
    subTitle: "Learn, interact, and protect yourself daily.",
    quizTag: "REFLECTION MOMENT",
    btnAcontece: "Happens",
    btnNaoAcontece: "Doesn't happen",
    proximaReflexao: "Next reflection",
    sectionTitle: "Identification Guides",
    saberMais: "Learn more",
    footerText: "You are amazing and you are not alone.",
    perguntas: [
      {
        id: 1,
        pergunta: "They ask for my social media passwords to prove I have nothing to hide.",
        tipo: "alerta",
        msgSeAcontece: "Attention! Privacy is respect. Passwords are personal and true love doesn't need surveillance or monitoring to be real. 🚩",
        msgSeNaoAcontece: "Perfect! This shows respect for each other's individual space. Trust is the foundation of everything! ✨"
      },
      {
        id: 2,
        pergunta: "We talk openly about our feelings, even when we are upset.",
        tipo: "saudavel",
        msgSeAcontece: "Wonderful! Honest and welcoming dialogue is the strongest pillar of a relationship that does good to the heart. ❤️",
        msgSeNaoAcontece: "Cultivating moments to talk without fear is a wonderful step. How about trying to open your heart a little more next time? 🌸"
      },
      {
        id: 3,
        pergunta: "I feel like I need to change the way I dress so they won't get mad.",
        tipo: "alerta",
        msgSeAcontece: "Stay alert! You are free to express yourself and wear what makes you feel good. No one should control your image or your clothes. 👗",
        msgSeNaoAcontece: "That's it! Your freedom and identity should always be celebrated and respected. No one dictates your style! 🌟"
      },
      {
        id: 4,
        pergunta: "My partner encourages me to take that course I really wanted and celebrates my achievements.",
        tipo: "saudavel",
        msgSeAcontece: "How sweet! True love wants to see the other person grow, study, shine, and conquer the whole world. 🚀",
        msgSeNaoAcontece: "Remember that your dreams matter a lot. Always surround yourself with encouragement to fly high! 👑"
      },
      {
        id: 5,
        pergunta: "When I go out with my friends, I spend the whole time replying to messages to prove where I am.",
        tipo: "alerta",
        msgSeAcontece: "Look at the warning sign! Enjoying separate moments with your friends is super healthy. Trust doesn't require real-time reporting. 📱",
        msgSeNaoAcontece: "Excellent! Having your time with friends without pressure helps keep your life balanced and full of good energy. 💃"
      },
      {
        id: 6,
        pergunta: "When we disagree, we manage to talk without shouting or insults.",
        tipo: "saudavel",
        msgSeAcontece: "Perfect! Disagreeing is part of any relationship, but staying calm and showing mutual respect shows a lot of maturity. 🕊️",
        msgSeNaoAcontece: "Shouting and insults hurt. Calm and safe dialogue is the right way to resolve any disagreement. 🌱"
      },
      {
        id: 7,
        pergunta: "A friend always makes jokes about me in front of others and then says I can't take a joke.",
        tipo: "alerta",
        msgSeAcontece: "Keep an eye out! If a joke causes you discomfort, shame, or hurt, it is no longer a healthy joke. Your emotions are valid. 💛",
        msgSeNaoAcontece: "Very well! True friendships are meant to lift us up and make us feel safe and welcomed. 🥰"
      },
      {
        id: 8,
        pergunta: "My partner says they feel very jealous because they love me.",
        tipo: "alerta",
        msgSeAcontece: "Attention: excessive or suffocating jealousy is not a sign of love, but rather of insecurity or possessiveness. Real affection brings peace. 🌿",
        msgSeNaoAcontece: "That's right! Healthy love is light, builds bridges rather than fences. It thrives on freedom and tranquility. 🌻"
      },
      {
        id: 9,
        pergunta: "An acquaintance insists on touching me, like kissing my cheek or hugging, even when I show discomfort.",
        tipo: "alerta",
        msgSeAcontece: "Your body is your sacred territory! Consent is mandatory in any approach. If it makes you uncomfortable, set boundaries without fear. ✋",
        msgSeNaoAcontece: "Perfect! Respecting physical space and each other's wishes is rule number one of any healthy social interaction. ⭐"
      },
      {
        id: 10,
        pergunta: "My partner apologizes when they make a mistake and tries to change their attitude.",
        tipo: "saudavel",
        msgSeAcontece: "Incredible! Humility to recognize flaws and actively act to change shows a real commitment to your well-being. 🌹",
        msgSeNaoAcontece: "Empty apologies without real behavioral changes can become a tiring cycle. Pay attention to everyday attitudes. 💭"
      },
      {
        id: 11,
        pergunta: "My boss gives frequent gifts expecting special treatment in return.",
        tipo: "alerta",
        msgSeAcontece: "Beware of intentions! Professional relationships must be strictly based on competence, mutual respect, and clear boundaries. 💼",
        msgSeNaoAcontece: "Excellent! Maintaining professionalism and transparency in the workplace prevents misunderstandings and protects your career. 📈"
      },
      {
        id: 12,
        pergunta: "My partner says they just want to protect me and decides who I can go out with.",
        tipo: "alerta",
        msgSeAcontece: "Stay alert! True protection supports and cares, but should never nullify your autonomy, control your steps, or isolate you from the world. 🗺️",
        msgSeNaoAcontece: "Exactly! You have all the capacity and the right to decide your paths, your friends, and your leisure time. 🎡"
      },
      {
        id: 13,
        pergunta: "Someone keeps saying nobody will ever like me as much as they do.",
        tipo: "alerta",
        msgSeAcontece: "That's not true, you see? This kind of phrasing tries to lower your self-confidence to make you dependent. You are valuable and deserve genuine love! ✨",
        msgSeNaoAcontece: "For sure! You know your worth and understand that you deserve affection free of manipulation or emotional blackmail. 💖"
      },
      {
        id: 14,
        pergunta: "When I make a mistake, the other person brings it up repeatedly to make me feel guilty.",
        tipo: "alerta",
        msgSeAcontece: "Careful! Mistakes should be overcome and resolved together through conversation, never saved to be used as weapons of guilt. 🍂",
        msgSeNaoAcontece: "That's right! In healthy relationships, there is space to learn from mistakes and move on without holding onto resentment. 🍃"
      },
      {
        id: 15,
        pergunta: "A friend or partner gets upset when I make plans without inviting them.",
        tipo: "alerta",
        msgSeAcontece: "Pay attention to boundaries! It's natural to want to be close, but everyone needs to keep their individual moments and personal hobbies alive. 👥",
        msgSeNaoAcontece: "Perfect! Maintaining your individuality and respecting each other's space strengthens ties and prevents wear and tear in the relationship. 🍇"
      },
      {
        id: 16,
        pergunta: "Someone always makes decisions for me because they say I get nervous choosing.",
        tipo: "alerta",
        msgSeAcontece: "Practice your voice! Even in small choices, exercising your autonomy is fundamental to developing your inner security. 🎯",
        msgSeNaoAcontece: "Very well! Making your own decisions, whether right or wrong, is what builds your independence and self-confidence. 👑"
      }
    ],
    guias: [
      {
        id: '1',
        categoria: 'AWARENESS',
        titulo: 'Body Signals',
        descricao: 'Physical respect is non-negotiable. Any act that forces, hurts, or takes away your physical safety raises an important red flag.',
        icon: 'fitness-outline',
        url: 'https://www.fundobrasil.org.br/blog/violencia-contra-a-mulher-como-identificar-e-combater/',
      },
      {
        id: '2',
        categoria: 'EMOTIONAL INTELLIGENCE',
        titulo: 'Protecting Your Mind',
        descricao: 'Humiliations, frequent insults, isolation from friends, or emotional control disguised as love also leave invisible scars.',
        icon: 'brain-outline',
        url: 'https://www.cnj.jus.br/silenciosa-e-brutal-violencia-psicologica-atinge-milhares-de-mulheres-no-brasil/',
      },
      {
        id: '3',
        categoria: 'RELATIONSHIPS',
        titulo: 'Autonomy and Choice',
        descricao: 'Healthy relationships are based on mutual consent. Forcing intimacy or disregarding your time and decisions is not okay.',
        icon: 'heart-dislike-outline',
        url: 'https://www.conexasaude.com.br/blog/um-relacionamento-abusivo/',
      },
      {
        id: '4',
        categoria: 'INDEPENDENCE',
        titulo: 'Your Financial Freedom',
        descricao: 'Withholding your own money, destroying personal belongings, or controlling what you work to achieve limits your autonomy.',
        icon: 'wallet-outline',
        url: 'https://www.guetto.org/post/violencia-patrimonial',
      },
    ]
  }
};

export default function NotificasScreen() {
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostaUsuario, setRespostaUsuario] = useState<string | null>(null);
  const [feedbackIcone, setFeedbackIcone] = useState<string>("checkmark-circle");
  const [textoFeedback, setTextoFeedback] = useState<string>(" ");

  const { idioma } = useIdioma();
  const t = textos[idioma] || textos.pt;
  const perguntasQuiz = t.perguntas;
  const guiasCuidado = t.guias;

  const checarResposta = (opcao: 'Acontece' | 'Não acontece') => {
    const pergunta = perguntasQuiz[perguntaAtual];
    setRespostaUsuario(opcao);

    if (opcao === "Acontece") {
      setTextoFeedback(pergunta.msgSeAcontece);
    } else {
      setTextoFeedback(pergunta.msgSeNaoAcontece);
    }
    
    if (pergunta.tipo === "saudavel") {
      if (opcao === "Acontece") {
        setFeedbackIcone("checkmark-circle");
      } else {
        setFeedbackIcone("information-circle-outline");
      }
    } else if (pergunta.tipo === "alerta") {
      if (opcao === "Acontece") {
        setFeedbackIcone("alert-circle-outline");
      } else {
        setFeedbackIcone("checkmark-circle");
      }
    }
  };

  const proximaPergunta = () => {
    setRespostaUsuario(null);
    setTextoFeedback("");
    setPerguntaAtual((prev) => (prev + 1) % perguntasQuiz.length);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.headerTitle}</Text>
        <Text style={styles.subTitle}>{t.subTitle}</Text>
      </View>

      {/* SEÇÃO DO JOGUINHO: MOMENTO REFLEXÃO */}
      <View style={styles.quizCard}>
        <View style={styles.quizHeader}>
          <Ionicons name="game-controller-outline" size={20} color={Colors.white} />
          <Text style={styles.quizTag}>{t.quizTag}</Text>
        </View>

        {!respostaUsuario ? (
          <View>
            <Text style={styles.quizQuestion}>{perguntasQuiz[perguntaAtual].pergunta}</Text>
            <View style={styles.quizOptions}>
              <TouchableOpacity style={[styles.quizBtn, {backgroundColor: Colors.white}]} onPress={() => checarResposta('Acontece')}>
                <Text style={[styles.quizBtnText, {color: Colors.green}]}>{t.btnAcontece}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quizBtn, {backgroundColor: Colors.white}]} onPress={() => checarResposta('Não acontece')}>
                <Text style={[styles.quizBtnText, {color: Colors.alert}]}>{t.btnNaoAcontece}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.feedbackContainer}>
            <Ionicons 
              name={feedbackIcone as any} 
              size={40} 
              color={Colors.white} 
            />
            <Text style={styles.feedbackText}>{textoFeedback}</Text>
            <TouchableOpacity style={styles.nextBtn} onPress={proximaPergunta}>
              <Text style={styles.nextBtnText}>{t.proximaReflexao}</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>{t.sectionTitle}</Text>

      {/* RENDERIZAÇÃO DOS CARDS COM LINKS DINÂMICOS */}
      {guiasCuidado.map((card) => (
        <View key={card.id} style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name={card.icon as any} size={28} color={Colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardCategory}>{card.categoria}</Text>
            <Text style={styles.cardTitle}>{card.titulo}</Text>
            <Text style={styles.cardDescription}>{card.descricao}</Text>
            <TouchableOpacity 
              style={styles.learnMore}
              onPress={() => {
                if (card.url) {
                  Linking.openURL(card.url).catch((err) => 
                    console.error("Erro ao abrir o link do card:", err)
                  );
                }
              }}
            >
              <Text style={styles.learnMoreText}>{t.saberMais}</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Ionicons name="sparkles" size={20} color={Colors.primary} />
        <Text style={styles.footerText}>{t.footerText}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 20 },
  header: { marginTop: 60, marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#65132B' },
  subTitle: { fontSize: 14, color: '#666' },
  
  quizCard: {
    backgroundColor: Colors.primary,
    borderRadius: 28,
    padding: 20,
    marginBottom: 30,
    elevation: 5,
  },
  quizHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  quizTag: { color: Colors.white, fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  quizQuestion: { color: Colors.white, fontSize: 18, fontWeight: '700', lineHeight: 24, marginBottom: 20 },
  quizOptions: { flexDirection: 'row', gap: 12 },
  quizBtn: { flex: 1, paddingVertical: 12, borderRadius: 15, alignItems: 'center' },
  quizBtnText: { fontWeight: 'bold', fontSize: 14 },
  
  feedbackContainer: { alignItems: 'center' },
  feedbackText: { color: Colors.white, textAlign: 'center', fontSize: 15, marginTop: 10, lineHeight: 22, fontWeight: '500' },
  nextBtn: { marginTop: 15, flexDirection: 'row', alignItems: 'center', gap: 6, borderBottomWidth: 1, borderBottomColor: Colors.white, paddingBottom: 2 },
  nextBtnText: { color: Colors.white, fontWeight: 'bold' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#65132B', marginBottom: 15 },
  card: { backgroundColor: Colors.white, borderRadius: 24, padding: 20, flexDirection: 'row', marginBottom: 16 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.secondary, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardContent: { flex: 1 },
  cardCategory: { fontSize: 9, fontWeight: 'bold', color: Colors.primary, marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
  cardDescription: { fontSize: 12, color: '#555', lineHeight: 18, marginBottom: 10 },
  learnMore: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  learnMoreText: { fontSize: 12, fontWeight: 'bold', color: Colors.primary },
  footer: { marginVertical: 30, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  footerText: { fontSize: 13, color: Colors.primary, fontWeight: '600' }
});