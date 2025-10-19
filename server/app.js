require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");

const app = express();

// Config
const PORT = process.env.PORT || 8787;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const AI_PROVIDER = process.env.AI_PROVIDER || "openai"; // 'openai' | 'hf'
const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 20000);

//  globl Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: "1mb" })); // help me to prevents hug payloads so used 1mb

const limiter = rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true });
app.use("/api/ai", limiter);

// Validation schema
const chatReq = z.object({ prompt: z.string().min(1).max(4000) });

// OpenAI provider
async function callOpenAIKey(prompt) {
  const apiresponse = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    },
    {
      headers: { Authorization: `Bearer ${AI_API_KEY}` },
      timeout: AI_TIMEOUT_MS,
    }
  );
  return apiresponse.data?.choices?.[0]?.message?.content ?? "";
}

// Optional HF provider - i did the code for checking if anything happen with open ai then i will try HF
async function hfGenerate(prompt) {
  const apiresponse = await axios.post(
    "https://api-inference.huggingface.co/models/bigscience/bloom",
    { inputs: prompt },
    {
      headers: { Authorization: `Bearer ${AI_API_KEY}` },
      timeout: AI_TIMEOUT_MS,
    }
  );
  const data = apiresponse.data;
  if (Array.isArray(data)) return data[0]?.generated_text ?? "";
  return data?.generated_text ?? "";
}

// ✅ Must return a FUNCTION
function getProvider() {
  return AI_PROVIDER === "hf" ? hfGenerate : callOpenAIKey;
}

// health check
app.get("/health", (_req, apiresponse) => apiresponse.json({ ok: true }));

// Routes
app.post("/api/ai", async (req, apiresponse) => {
  try {
    if (!AI_API_KEY) {
      return apiresponse.status(500).json({
        error: {
          code: "NO_API_KEY",
          message: "AI_API_KEY is not set. Please check the key.",
        },
      });
    }

    const parsed = chatReq.safeParse(req.body);
    if (!parsed.success) {
      return apiresponse.status(400).json({
        error: { code: "BAD_REQUEST", message: parsed.error.message },
      });
    }

    const generate = getProvider(); // will return callOpenAIKey for 'openai'
    const content = await generate(parsed.data.prompt);

    return apiresponse.json({ message: { role: "assistant", content } });
  } catch (err) {
    const status = err?.response?.status || 500;
    const details = err?.response?.data || err.message || "Internal error";
    return apiresponse
      .status(status)
      .json({ error: { code: "AI_UPSTREAM_ERROR", message: details } });
  }
});

module.exports = { app, PORT };
