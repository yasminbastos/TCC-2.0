import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import axios from "axios";
import OpenAI from "openai";

admin.initializeApp();
const db = admin.firestore();

// Inicializa o ChatGPT com a chave segura do Firebase
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const agenteNoticiasZella = onRequest({ secrets: ["OPENAI_API_KEY", "GNEWS_API_KEY"] }, async (req, res) => {
  try {
    const urlNoticias = `https://gnews.io/api/v4/search?q=("direitos das mulheres" OR "Autoestima feminina" OR "Amor próprio" OR "lei maria da penha" OR "proteção à mulher" OR "combate à violência contra a mulher")&lang=pt&country=br&max=5&apikey=${process.env.GNEWS_API_KEY}`; 
    const response = await axios.get(urlNoticias);
    const artigos = response.data.articles;

    if (!artigos || artigos.length === 0) {
      res.status(200).send("Nenhuma notícia nova encontrada.");
      return;
    }

    for (const artigo of artigos) {
      const noticiaId = Buffer.from(artigo.url).toString("base64").substring(0, 20);
      const docRef = db.collection("news").doc(noticiaId);
      const docSnap = await docRef.get();

      if (docSnap.exists) continue;

      const promptAgente = `
        Você é a assistente de Inteligência Artificial do aplicativo Zella, focado em proteção, acolhimento e conscientização de mulheres.
        
        Sua tarefa é analisar a notícia fornecida e criar um resumo focado em EDUCAÇÃO, DIREITOS e APOIO.
        
        Regras de conteúdo e tom:
        - NUNCA detalhe atos de violência ou nomes de agressores/vítimas de casos específicos.
        - Mantenha o foco nos direitos da mulher, leis vigentes, canais de denúncia (como Ligue 180), inclua também notícias sobre amor próprio e autoestima feminina e formas de prevenção.
        - O resumo ("aiSummary") deve ter no máximo 3 frases, ser empático, claro e focar na informação útil para quem lê.
        - Classifique a notícia em APENAS UMA destas categorias ("category"): "Conscientização", "Lei e Direitos", "Redes de Segurança" ou "Apoio".
        
        Notícia para analisar:
        Título: ${artigo.title}
        Conteúdo: ${artigo.description || artigo.content}
        
        Responda EXCLUSIVAMENTE em formato JSON válido:
        {
          "aiSummary": "Texto do resumo empático e informativo aqui...",
          "category": "Categoria selecionada aqui"
        }
      `;

      // Chamada para o OpenAI GPT-4o-mini
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: promptAgente }],
        response_format: { type: "json_object" }
      });

      const textoIA = completion.choices[0].message.content || "{}";

      // Limpeza de segurança (caso venha com marcadores Markdown) antes do parse
      const respostaLimpa = textoIA.replace(/```json|```/g, '').trim();
      const dadosTratadosIA = JSON.parse(respostaLimpa);

      await docRef.set({
        title: artigo.title,
        description: artigo.description,
        urlOriginal: artigo.url,
        image: artigo.image || "https://images.unsplash.com/photo-1573164713988-8665fc963095",
        publishedAt: artigo.publishedAt,
        aiSummary: dadosTratadosIA.aiSummary,
        category: dadosTratadosIA.category,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.status(200).send("Agente Zella executado com sucesso com OpenAI!");
  } catch (error) {
    console.error("Erro no Agente Zella:", error);
    res.status(500).send("Erro no processamento.");
  }
});