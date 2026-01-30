import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

/* =============================
   GEMINI CONFIG
============================= */

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY não encontrada no .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log("✅ Gemini carregado");

/* =============================
   SYSTEM PROMPT KALFIX
============================= */

const SYSTEM_PROMPT = `
Você é um consultor técnico especialista da KALFIX.

Regras obrigatórias:

- Responder de forma técnica e profissional
- Focar em produtos para construção civil
- Ser objetivo e claro
- Falar como especialista da marca
- Não inventar produtos inexistentes
- Se não souber, orientar a procurar suporte técnico Kalfix

Tom de voz:
Consultivo, técnico, profissional e confiável.
`;

/* =============================
   ROTAS BASE
============================= */

app.get("/", (req, res) => {
  res.send("API KALFIX rodando 🚀 | Desenvolvido pela Somar.IA - Automações inteligentes");
});

app.get("/status", (req, res) => {
  res.json({
    status: "online",
    projeto: "kalfix-ai-backend",
    versao: "1.0",
    desenvolvido_por: "Somar.IA"
  });
});

/* =============================
   ROTA CHAT OFICIAL
============================= */

app.post("/chat", async (req, res) => {

  try {

    const { pergunta } = req.body;

    if (!pergunta) {
      return res.status(400).json({
        erro: "Pergunta não enviada"
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro"
    });

    const promptFinal = `
${SYSTEM_PROMPT}

Pergunta do cliente:
${pergunta}
`;

    const result = await model.generateContent(promptFinal);
    const resposta = result.response.text();

    res.json({
      resposta,
      fonte: "Kalfix IA",
      desenvolvido_por: "Somar.IA",
      versao: "piloto-1"
    });

  } catch (erro) {

    console.error("❌ ERRO GEMINI COMPLETO:");
    console.error(erro);

    res.status(500).json({
      erro: "Erro ao consultar IA"
    });

  }

});

/* =============================
   START SERVER
============================= */

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🤖 IA Kalfix ativa`);
});
