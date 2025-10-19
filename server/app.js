require("dotenv").config();

const app = express();

// Config
const PORT = process.env.PORT || 8787;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const AI_PROVIDER = process.env.AI_PROVIDER || "openai"; // 'openai' | 'hf'
const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 20000);
