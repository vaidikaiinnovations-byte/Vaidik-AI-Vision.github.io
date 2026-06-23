import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Configure larger JSON payload body limits for base64 photo uploads from browser
  app.use(express.json({ limit: "24mb" }));
  app.use(express.urlencoded({ limit: "24mb", extended: true }));

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV });
  });

  // Core visual identification endpoint
  app.post("/api/identify", async (req, res) => {
    try {
      const { image, category } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Please upload or snap a photo first." });
      }

      if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("MY_GEMINI_API_KEY") || GEMINI_API_KEY.trim() === "") {
        return res.status(500).json({
          error: "Your Gemini API Key is missing. Please add your GEMINI_API_KEY in the Secrets panel in Settings (top right gear icon) to start scanning!"
        });
      }

      // Extract raw base64 data and clean up standard headers
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let mimeType = "image/jpeg";
      let base64Data = image;

      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      }

      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      };

      const categoryDirective = category && category !== "all"
        ? `Ensure you evaluate this photo with priority emphasis on identifying are classifying it as a ${category}.`
        : "Determine if it is a plant/fungus, a living animal/species, or an inanimate physical object/thing.";

      const promptText = `
Identify and analyze the biological species (plant, animal) or inanimate physical object/thing present in this photo.
${categoryDirective}

Respond with a complete, structured, neat JSON response containing details about this item.
The careTips must be highly customized to the category (e.g. botanical care for plants, wellness/behavioral handling for animals, or preservation/safety guidelines for things).
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [imagePart, { text: promptText }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Common name of the identified species, biological asset, or inanimate object" },
              scientificName: { type: Type.STRING, description: "Scientific classification / taxonomical Name, or 'N/A' if it is a tool/material/inanimate object" },
              category: { type: Type.STRING, enum: ["plant", "animal", "thing"], description: "Primary classification category" },
              confidence: { type: Type.INTEGER, description: "An estimated identification confidence score from 0 to 100" },
              description: { type: Type.STRING, description: "A highly educational and beautiful 2-3 sentence overview describing the item and context" },
              keyFeatures: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 to 4 distinct visual traits, patterns, or physical features visible or true to its kind"
              },
              careTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 to 4 specialized professional instructions for ongoing care, feeding, water/sun, maintenance, or safe preservation"
              },
              facts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 surprising, mind-blowing fun facts about this species or object"
              },
              origin: { type: Type.STRING, description: "Native region, origin coordinate range, or region/timeline of invention" },
              dangerWarning: { type: Type.STRING, description: "Toxicity to pets/children, physical hazard notes, delicate composition details, or 'None' if completely safe" }
            },
            required: [
              "name", "scientificName", "category", "confidence", "description",
              "keyFeatures", "careTips", "facts", "origin", "dangerWarning"
            ]
          }
        }
      });

      const replyText = response.text;
      if (!replyText) {
        throw new Error("Received an empty response from the AI Vision model.");
      }

      res.json(JSON.parse(replyText.trim()));

    } catch (e: any) {
      console.error("Express /api/identify error:", e);
      res.status(500).json({ error: e.message || "An unexpected error occurred during photo identification." });
    }
  });

  // Follow-up chat assistant endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { item, messages } = req.body;
      if (!item || !messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Missing required identification metadata or message history." });
      }

      if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("MY_GEMINI_API_KEY") || GEMINI_API_KEY.trim() === "") {
        return res.status(500).json({ error: "Gemini API Key is not configured." });
      }

      const latestMsg = messages[messages.length - 1];
      if (!latestMsg) {
        return res.status(400).json({ error: "Conversation thread is empty." });
      }

      const promptContext = `
You are the dedicated AI Expert Conservator and Nature Naturalist, a specialized extension of the 'Vaidik AI Vision Companion'.
The user has scanned a photograph and successfully identified it as:
- Name: ${item.name}
- Taxon/Scientific Classification: ${item.scientificName}
- Category: ${item.category}
- Geographic Origin: ${item.origin}
- Stored Features: ${item.keyFeatures ? item.keyFeatures.join(', ') : 'unknown'}

Here is the chat timeline between user and you (the Assistant):
${messages.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n')}

Task: Formulate a highly informative, expert, and practical response directly answering the user's last block: "${latestMsg.text}". Focus on botanical science secrets, biological behavior habits, or technical preservation/maintenance instructions depending on the item type. Keep it formatted nicely in professional markdown snippets.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptContext,
      });

      const answer = response.text || "I was unable to hear you clearly. Could you please specify your query again?";
      res.json({ reply: answer });

    } catch (e: any) {
      console.error("Express /api/chat error:", e);
      res.status(500).json({ error: e.message || "Could not generate follow-up care advice right now." });
    }
  });

  // Vite static site serving or dev proxy middleware routing
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
    console.log(`[Vaidik AI Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
