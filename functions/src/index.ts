import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import axios from "axios";
import OpenAI from "openai"; // Nossa IA - ChatGPT

admin.initializeApp();
const db = admin.firestore();

// Inicializa o ChatGPT com a chave segura do Firebase
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const agenteNoticiasZella = onRequest({ secrets: ["OPENAI_API_KEY", "GNEWS_API_KEY"] }, async (req, res) => {
  try {
    const urlNoticias = `https://gnews.io/api/v4/search?q="direitos das mulheres" OR "violência doméstica" OR "lei maria da penha"&lang=pt&country=br&max=3&apikey=${process.env.GNEWS_API_KEY}`;
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
        Você é a assistente de Inteligência Artificial do aplicativo Zella, uma plataforma dedicada à proteção e conscientização de mulheres.
        Analise o texto fornecido e gere um resumo educativo focado em apoio, direitos e prevenção.
        
        Regras fundamentais:
        - O texto do resumo ("aiSummary") deve ser empático, informativo e direto, com no máximo 3 linhas.
        - Classifique a notícia em apenas uma dessas categorias ("category"): Conscientização, Lei e Direitos, Redes de Segurança ou Apoio.
        
        Título: ${artigo.title}
        Conteúdo: ${artigo.description}
        
        Responda estritamente em formato JSON válido como o exemplo a seguir, sem crases de markdown:
        {
          "aiSummary": "O resumo aqui...",
          "category": "A categoria aqui"
        }
      `;

      // Chamada para o modelo inteligente do ChatGPT (GPT-4o mini é super rápido e muito barato)
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: promptAgente }],
        response_format: { type: "json_object" } // Garante que o ChatGPT responda em JSON certinho
      });

      const textoIA = completion.choices[0].message.content || "{}";
      const dadosTratadosIA = JSON.parse(textoIA);

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