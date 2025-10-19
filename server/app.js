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
