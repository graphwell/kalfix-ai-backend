import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(express.json());

/* =============================
   CORS (Netlify -> Vercel)
============================= */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

/* =============================
   GEMINI CONFIG
============================= */

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY não encontrada no ambiente (.env / Vercel)");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

console.log("✅ Backend carregado | Gemini init:", !!genAI);

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

Assinatura obrigatória (sempre manter):
“Desenvolvido pela Somar.IA — Automações inteligentes”
`;

/* =============================
   ROTAS BASE
============================= */

app.get("/", (req, res) => {
  res.send("API KALFIX rodando 🚀 | Desenvolvido pela Somar.IA — Automações inteligentes");
});

app.get("/status", (req, res) => {
  res.json({
    status: "online",
    projeto: "kalfix-ai-backend",
    versao: "1.0",
    desenvolvido_por: "Somar.IA",
  });
});

/* =============================
   ROTA CHAT OFICIAL
============================= */

app.post("/chat", async (req, res) => {
  try {
    const { pergunta } = req.body;

    if (!pergunta || typeof pergunta !== "string") {
      return res.status(400).json({ erro: "Pergunta não enviada" });
    }

    if (!genAI) {
      return res.status(500).json({
        erro: "GEMINI_API_KEY ausente no ambiente do servidor (Vercel)",
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
    });

    const promptFinal = `
${SYSTEM_PROMPT}

Pergunta do cliente:
${pergunta}
`;

    const result = await model.generateContent(promptFinal);
    const resposta = result.response.text();

    return res.json({
      resposta,
      fonte: "Kalfix IA",
      desenvolvido_por: "Somar.IA",
      versao: "piloto-1",
    });
  } catch (erro) {
    console.error("❌ ERRO GEMINI:", erro);
    return res.status(500).json({ erro: "Erro ao consultar IA" });
  }
});

/* =============================
   EXPORT (Vercel Serverless)
============================= */

// ✅ MUITO IMPORTANTE: no Vercel NÃO usamos app.listen()
// o Vercel chama essa função automaticamente.
export default app;

