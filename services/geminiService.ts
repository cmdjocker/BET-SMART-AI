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
    console.error("API_KEY is missing in environment variables.");
    throw new Error("API Key is missing. Please check your Vercel settings.");
  }
  return new GoogleGenAI({ apiKey });
};

export const getPrediction = async (matchQuery: string): Promise<PredictionData> => {
  const ai = getAI();
  const model = "gemini-2.5-flash";
  
  // We use googleSearch to get real stats from the requested sources.
  // Note: When using tools, we cannot use responseMimeType: "application/json".
  // We must ask for JSON in the prompt and parse it manually.
  
  const prompt = `
    Analyze this match: "${matchQuery}".
    
    Step 1: SEARCH. Perform a Google Search to find the latest statistics, team form, head-to-head records, and injury news. 
    Prioritize data from these sources if available: SportMonks, Forebet, SportsMole, FiveThirtyEight, SofaScore.
    
    Step 2: PREDICT. Based on the search results, synthesize a betting prediction.
    
    Step 3: OUTPUT. Return the result STRICTLY as a valid JSON object. Do not include markdown formatting (like \`\`\`json).
    
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
        // responseMimeType is NOT allowed with tools in the current SDK version for this model family
      }
    });

    const text = response.text || "";
    
    // Clean up markdown if present
    const cleanText = text.replace(/```json|```/g, '').trim();
    
    // Extract JSON object
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as PredictionData;
    }
    
    console.error("AI returned invalid format:", text);
    throw new Error("AI response could not be parsed as JSON");

  } catch (error) {
    console.error("Error fetching prediction:", error);
    throw error;
  }
};

export const getTrendingMatches = async (): Promise<TrendingMatch[]> => {
    try {
        // Safe check for API key without throwing to avoid crashing the home page load
        if (!process.env.API_KEY) {
            console.warn("Skipping trending matches: API Key missing.");
            return [];
        }

        const ai = getAI();
        const today = new Date().toDateString();
        const model = "gemini-2.5-flash";
        
        const prompt = `
          Using Google Search, find 4 high-profile football matches playing today (${today}) or tomorrow.
          
          Output the result strictly as a JSON array of objects. Do not use markdown.
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
        const cleanText = text.replace(/```json|```/g, '').trim();
        const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
            const matches = JSON.parse(jsonMatch[0]) as TrendingMatch[];
            return matches.slice(0, 4).map((m, i) => ({
                id: i + 1,
                league: m.league || "Unknown",
                home: m.home || "Home",
                away: m.away || "Away",
                time: m.time || "TBD"
            }));
        }
        
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