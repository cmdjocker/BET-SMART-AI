import { GoogleGenAI, Chat } from "@google/genai";
import { PredictionData, TrendingMatch } from "../types";

// Declare process for TypeScript
declare const process: {
  env: {
    API_KEY: string | undefined
  }
};

/**
 * Helper to get an initialized AI instance.
 * Throws if API Key is missing.
 */
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing in environment variables. Please check your Vercel settings.");
    throw new Error("API Key is missing. Please check your Vercel settings.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Robust JSON extraction helper
 */
const extractJSON = <T>(text: string): T | null => {
    try {
        // Remove markdown code blocks if present
        let cleanText = text.replace(/```json|```/g, '').trim();
        
        // Find the first '{' or '['
        const firstOpen = cleanText.search(/[{[]/);
        if (firstOpen !== -1) {
            cleanText = cleanText.substring(firstOpen);
            // Find the last '}' or ']'
            const lastClose = cleanText.search(/[}\]](?!.*[}\]])/);
            if (lastClose !== -1) {
                cleanText = cleanText.substring(0, lastClose + 1);
            }
        }
        
        return JSON.parse(cleanText) as T;
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.log("Raw text was:", text);
        return null;
    }
};

export const getPrediction = async (matchQuery: string): Promise<PredictionData> => {
  const ai = getAI();
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Analyze this match: "${matchQuery}".
    
    Step 1: SEARCH. Perform a Google Search to find the latest statistics, team form, head-to-head records, and injury news. 
    Prioritize data from these sources if available: SportMonks, Forebet, SportsMole, FiveThirtyEight, SofaScore, FlashScore.
    
    Step 2: PREDICT. Based on the search results, synthesize a betting prediction.
    
    Step 3: OUTPUT. Return the result STRICTLY as a valid JSON object. 
    DO NOT output any conversational text before or after the JSON.
    
    The JSON object must strictly follow this schema:
    {
      "homeTeam": "string",
      "awayTeam": "string",
      "predictedWinner": "string (Team Name or 'Draw')",
      "scorePrediction": "string (e.g. '2-1')",
      "confidence": number (0-100),
      "reasoning": "string (Concise analysis citing the stats found)",
      "keyStats": ["string", "string", "string"],
      "overUnder": "string (e.g. 'Over 2.5')",
      "btts": "string (e.g. 'Yes' or 'No')",
      "predictionLevel": number (1-100 score of prediction strength)
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType is NOT allowed with tools
      }
    });

    const text = response.text || "";
    const data = extractJSON<PredictionData>(text);
    
    if (data) {
      return data;
    }
    
    throw new Error("AI response could not be parsed as JSON");

  } catch (error) {
    console.error("Error fetching prediction:", error);
    throw error;
  }
};

export const getTrendingMatches = async (): Promise<TrendingMatch[]> => {
    try {
        if (!process.env.API_KEY) {
            console.warn("Skipping trending matches: API Key missing.");
            return [];
        }

        const ai = getAI();
        const today = new Date().toDateString();
        const model = "gemini-2.5-flash";
        
        const prompt = `
          Using Google Search, find 4 confirmed high-profile football matches playing today (${today}) or tomorrow.
          
          Output the result STRICTLY as a JSON array of objects. 
          DO NOT output any conversational text.
          Format: [{"id": 1, "league": "string", "home": "string", "away": "string", "time": "string"}]
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }], 
            }
        });

        const text = response.text || "";
        const matches = extractJSON<TrendingMatch[]>(text);
        
        if (matches && Array.isArray(matches)) {
            return matches.slice(0, 4).map((m, i) => ({
                id: i + 1,
                league: m.league || "Unknown",
                home: m.home || "Home",
                away: m.away || "Away",
                time: m.time || "TBD"
            }));
        }
        
        console.warn("Failed to parse trending matches JSON.");
        return [];
    } catch (e) {
        console.error("Failed to fetch trending matches", e);
        return [];
    }
};

export const createSupportChat = (): Chat => {
  const ai = getAI();
  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: "You are 'BetBot', a support agent for 'Bet Smart With AI'. Help users with VIP plans and explaining betting terms. If asked for predictions, guide them to the home page search bar.",
    }
  });
};