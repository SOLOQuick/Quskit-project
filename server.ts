import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client lazily or when key exists
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "QuantumLearn API", timestamp: new Date().toISOString() });
});

// Quantum AI Mentor endpoint
app.post("/api/quantum-mentor", async (req, res) => {
  try {
    const { question, circuitContext, topic } = req.body;
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'question' parameter" });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        answer: `[Simulated Quantum Mentor Offline Mode]\n\nRegarding your question on "${topic || 'Quantum Computing'}":\n\n` +
          `Quantum states exist as vectors in complex Hilbert spaces. For a single qubit: |ψ⟩ = α|0⟩ + β|1⟩ where |α|² + |β|² = 1. ` +
          `In algorithms like QAOA for disaster logistics, parameterized rotations explore the solution space through constructive and destructive phase interference.\n\n` +
          `(Tip: Set GEMINI_API_KEY in the Settings menu to activate live AI tutoring.)`,
        model: "offline-fallback",
      });
    }

    const systemPrompt = `You are the Quantum Computing Research Mentor for the QuantumLearn platform.
Your role is to clearly and enthusiastically explain quantum concepts (superposition, entanglement, Bloch sphere, phase interference, measurement collapse, quantum gates, circuits, and Qiskit 1.x syntax), as well as real-world applications like QAOA for disaster management and humanitarian logistics.

Guidelines:
1. Explain both the intuition (analogies) and the rigorous mathematics (bra-ket notation, matrix representation, Hamiltonians) cleanly.
2. If the user asks about Qiskit, provide modern Qiskit 1.x code snippets (using QuantumCircuit, AerSimulator, Statevector, etc.).
3. When discussing disaster response optimization via QAOA, highlight the Cost Hamiltonian H_C, Mixer Hamiltonian H_M, and the quantum-classical variational loop.
4. Format with clear Markdown, bullet points, and LaTeX-style math where appropriate (|0⟩, |1⟩, α|0⟩ + β|1⟩).
5. Keep explanations concise, inspiring, and direct.`;

    const promptText = `User Topic: ${topic || "Quantum Computing"}
Circuit Context: ${circuitContext ? JSON.stringify(circuitContext) : "None provided"}
User Question: ${question}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({
      answer: response.text || "No response generated.",
      model: "gemini-3.8-flash",
    });
  } catch (error: any) {
    console.error("Quantum mentor error:", error);
    res.status(500).json({
      error: "Failed to generate quantum mentor response",
      details: error?.message || "Unknown error",
    });
  }
});

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`QuantumLearn server running at http://0.0.0.0:${PORT}`);
  });
}

start();
