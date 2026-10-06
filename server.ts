import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import AdmZip from "adm-zip";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route to download the entire codebase as a zip archive
app.get("/api/download-zip", (req, res) => {
  try {
    const zip = new AdmZip();
    const rootDir = process.cwd();

    // Include core project files and folders, excluding heavy build artifacts and dependencies
    const includeEntries = [
      "src",
      "assets",
      "index.html",
      "package.json",
      "tsconfig.json",
      "vite.config.ts",
      "server.ts",
      ".env.example",
      ".gitignore",
      "metadata.json",
      "README.md",
      "update_questions.js"
    ];

    for (const entry of includeEntries) {
      const fullPath = path.join(rootDir, entry);
      if (fs.existsSync(fullPath)) {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          zip.addLocalFolder(fullPath, entry);
        } else {
          zip.addLocalFile(fullPath);
        }
      }
    }

    const zipBuffer = zip.toBuffer();
    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="grand-quiz-codebase.zip"',
      "Content-Length": zipBuffer.length.toString(),
    });
    return res.send(zipBuffer);
  } catch (err: any) {
    console.error("Error creating codebase zip:", err);
    return res.status(500).json({ error: "Failed to generate project zip archive." });
  }
});

// API route for generating quiz questions using Gemini API
app.post("/api/generate-questions", async (req, res) => {
  const { category, count = 5, difficulty = "Medium" } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return res.status(200).json({
      success: false,
      error: "GEMINI_API_KEY is not set or using placeholder. Please set your key in Settings > Secrets.",
      questions: [] // UI will fall back to rich pre-authored category bank
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const prompt = `You are a world-class quiz question writer for a Global Quiz Company. 
Generate exactly ${count} quiz questions for the category '${category}' at '${difficulty}' difficulty. 

Follow these rules:
1. Scope is worldwide, keep it accessible and highly engaging.
2. Ensure every question is factually verified and contains plausible wrong answers that a smart person might pick.
3. Provide a genuinely surprising fun fact ('fact' field) that is excellent for reading aloud to a crowd of 50 people.
4. All options in the 'opts' array must be explicitly prefixed with 'A) ', 'B) ', 'C) ', and 'D) '.
5. The 'ans' field must contain exactly the letter of the correct option ('A', 'B', 'C', or 'D').
6. In the 'explanations' object, provide a specific 1-2 sentence explanation for EACH option (A, B, C, D). If it's the correct answer, explain why it's right. If it's a wrong answer, explain what that thing actually is or why it's incorrect.`;

    let response;
    const maxRetries = 3;
    let delayMs = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "You are the head quizmaster and content lead for Grand Quiz. Your output must be strict JSON matching the requested schema. No conversational filler, no markdown wrappers.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              description: "List of generated quiz questions",
              items: {
                type: Type.OBJECT,
                properties: {
                  q: { type: Type.STRING, description: "The quiz question text." },
                  opts: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Array of exactly 4 options, prefixed with A), B), C), D)"
                  },
                  ans: { type: Type.STRING, description: "The single-letter correct answer: A, B, C, or D" },
                  diff: { type: Type.STRING, description: "Difficulty level (Easy, Medium, Hard, Expert)" },
                  use: { type: Type.STRING, description: "Typical use case (e.g. Public League, Corporate, Institutional, Championship)" },
                  fact: { type: Type.STRING, description: "Fun fact or explanation revealed after answering." },
                  explanations: {
                    type: Type.OBJECT,
                    description: "Specific explanations for each option letter",
                    properties: {
                      A: { type: Type.STRING },
                      B: { type: Type.STRING },
                      C: { type: Type.STRING },
                      D: { type: Type.STRING }
                    },
                    required: ["A", "B", "C", "D"]
                  }
                },
                required: ["q", "opts", "ans", "diff", "use", "fact", "explanations"]
              }
            }
          }
        });
        break; // Success, break out of retry loop
      } catch (err: any) {
        const errStr = JSON.stringify(err);
        const isTransient = err.status === 503 || err.status === 429 || 
                            errStr.includes("503") || errStr.includes("429") || 
                            errStr.includes("UNAVAILABLE") || errStr.includes("high demand") ||
                            (err.message && (err.message.includes("503") || err.message.includes("429") || err.message.includes("UNAVAILABLE") || err.message.includes("high demand")));
        
        if (isTransient && attempt < maxRetries) {
          console.warn(`Transient Gemini error (attempt ${attempt}/${maxRetries}). Retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          delayMs *= 2; // Exponential backoff
        } else {
          throw err; // Re-throw if not transient or if we reached max retries
        }
      }
    }

    if (!response) {
      throw new Error("No response received from Gemini after retries.");
    }

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from Gemini.");
    }

    const questions = JSON.parse(responseText.trim());
    return res.json({
      success: true,
      questions
    });

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    
    // Check if it's a 503/UNAVAILABLE or heavy demand error and return a polished error message
    let friendlyError = error.message || "An error occurred while generating questions.";
    if (friendlyError.includes("503") || friendlyError.includes("UNAVAILABLE") || friendlyError.includes("high demand")) {
      friendlyError = "The Gemini AI model is currently experiencing extremely high demand. Grand Quiz has safely loaded your local deduplicated offline question bank so you can keep playing seamlessly!";
    }

    return res.status(200).json({
      success: false,
      error: friendlyError,
      questions: []
    });
  }
});

// Setup Vite Dev Server / Serve Static Files
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Grand Quiz Server running on http://localhost:${PORT}`);
  });
}

setupServer();
