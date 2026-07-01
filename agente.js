import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import { cert, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

// Lendo a chave direto da memória do ambiente, sem criar nenhum arquivo .json!
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const GNEWS_API_KEY = process.env.GNEWS_API_KEY; 
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Inicializa o cliente do Gemini
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function rodarAgente() {
  try {
    console.log("🤖 Buscando notícias reais nos portais parceiros...");
    const termoBusca = encodeURIComponent('"empoderamento feminino" OR "saúde mental" OR "autoestima"');
    const urlNoticias = `https://gnews.io/api/v4/search?q=${termoBusca}&lang=pt&country=br&max=3&apikey=${GNEWS_API_KEY}`;    
    
    const response = await axios.get(urlNoticias);
    const artigos = response.data.articles;
    
    if (!artigos || artigos.length === 0) {
      console.log("💤 Nenhuma notícia nova encontrada.");
      return;
    }

    for (const artigo of artigos) {
      // CORREÇÃO DO ID: Remove caracteres especiais que quebram o Firestore/React Native
      const noticiaId = Buffer.from(artigo.url)
        .toString("base64")
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 20);

      const docRef = db.collection("news").doc(noticiaId);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        console.log(`⏩ Notícia já processada antes: ${artigo.title.substring(0, 30)}...`);
        continue;
      }

      console.log(`🧠 Gemini está gerando um informativo educativo para: ${artigo.title.substring(0, 30)}...`);

      // PROMPT DO GEMINI:
      const prompt = `
        Você é a inteligência artificial do aplicativo Zella, um espaço seguro de apoio, autocuidado e fortalecimento para mulheres.
        Baseado no artigo abaixo, crie um informativo rápido, acolhedor e inspirador de no máximo 3 linhas para o feed do app.
        
        Foque em extrair dicas práticas de bem-estar, insights sobre saúde mental, superação ou a importância de redes de apoio. 
        O tom deve ser sempre positivo, leve e focado no autocuidado, agindo como uma pílula de sabedoria diária.
        
        Artigo: ${artigo.title}
        Contexto: ${artigo.description}
      `;

      let resumoInteligente = "";
      try {
        const aiResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        resumoInteligente = aiResponse.text.trim();
      } catch (aiError) {
        console.error("⚠️ Erro ao chamar o Gemini, usando fallback de segurança:", aiError);
        resumoInteligente = `Informativo Zella: Esta notícia aborda direitos e segurança das mulheres. Mantenha-se informada e use canais de apoio como o Ligue 180 para acolhimento.`;
      }
      
      // Salva os dados limpos e o resumo real gerado pela IA no banco
      await docRef.set({
        title: artigo.title,
        description: artigo.description || "",
        urlOriginal: artigo.url,
        image: artigo.image || "https://images.unsplash.com/photo-1573164713988-8665fc963095",
        publishedAt: artigo.publishedAt,
        aiSummary: resumoInteligente,
        category: "Bem-estar",
        createdAt: FieldValue.serverTimestamp(),
      });
      
      console.log("✅ Gravado com sucesso no Firestore com o resumo do Gemini!");
    }

    console.log("🚀 Agente executado com sucesso completo! Abra seu app!");
  } catch (error) {
    console.error("❌ Erro na execução do Agente:", error);
  }
}

rodarAgente();