import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Colors = {
  primary: '#751935',
  secondary: '#f0c4cfff',
  background: '#fcf0f4ff',
  text: '#4d2a33ff',
  white: '#ffffff',
  green: '#c6486eff',
  alert: 'rgba(194, 11, 51, 1)'
};

// DADOS DO JOGUINHO 
const perguntasQuiz = [
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
    msgSeAcontece: "Atenção: ciúme em excesso ou sufocante não é sinônimo de amor, mas sim de insecurity ou sentimento de posse. O afeto real traz paz. 🌿",
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
];

const guiasCuidado = [
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
];

export default function NotificasScreen() {
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostaUsuario, setRespostaUsuario] = useState<string | null>(null);
  const [feedbackIcone, setFeedbackIcone] = useState<string>("checkmark-circle");
  const [textoFeedback, setTextoFeedback] = useState<string>(" ");

  const checarResposta = (opcao: 'Acontece' | 'Não acontece') => {
    const pergunta = perguntasQuiz[perguntaAtual];
    setRespostaUsuario(opcao);

    // Define o texto dinâmico com base no clique
    if (opcao === "Acontece") {
      setTextoFeedback(pergunta.msgSeAcontece);
    } else {
      setTextoFeedback(pergunta.msgSeNaoAcontece);
    }
    
    if (pergunta.tipo === "saudavel") {
      if (opcao === "Acontece") {
        setFeedbackIcone("checkmark-circle"); // Situação saudável ocorrendo -> Sucesso!
      } else {
        setFeedbackIcone("information-circle-outline"); // Situação saudável ausente -> Info/Dica
      }
    } else if (pergunta.tipo === "alerta") {
      if (opcao === "Acontece") {
        setFeedbackIcone("alert-circle-outline"); // Situação de alerta ocorrendo -> Atenção!
      } else {
        setFeedbackIcone("checkmark-circle"); // Situação de alerta ausente -> Sucesso!
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
        <Text style={styles.headerTitle}>Guia de Fortalecimento</Text>
        <Text style={styles.subTitle}>Aprenda, interaja e proteja-se diariamente.</Text>
      </View>

      {/* SEÇÃO DO JOGUINHO: MOMENTO REFLEXÃO */}
      <View style={styles.quizCard}>
        <View style={styles.quizHeader}>
          <Ionicons name="game-controller-outline" size={20} color={Colors.white} />
          <Text style={styles.quizTag}>MOMENTO REFLEXÃO</Text>
        </View>

        {!respostaUsuario ? (
          <View>
            <Text style={styles.quizQuestion}>{perguntasQuiz[perguntaAtual].pergunta}</Text>
            <View style={styles.quizOptions}>
              <TouchableOpacity style={[styles.quizBtn, {backgroundColor: Colors.white}]} onPress={() => checarResposta('Acontece')}>
                <Text style={[styles.quizBtnText, {color: Colors.green}]}>Acontece</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quizBtn, {backgroundColor: Colors.white}]} onPress={() => checarResposta('Não acontece')}>
                <Text style={[styles.quizBtnText, {color: Colors.alert}]}>Não acontece</Text>
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
              <Text style={styles.nextBtnText}>Próxima reflexão</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Informativos de Identificação</Text>

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
              <Text style={styles.learnMoreText}>Saber mais</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Ionicons name="sparkles" size={20} color={Colors.primary} />
        <Text style={styles.footerText}>Você é incrível e não está sozinha.</Text>
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