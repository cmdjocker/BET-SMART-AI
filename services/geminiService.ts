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
    // 1. Remove Markdown Code Blocks
    let cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    // 2. Locate the outer-most JSON structure (Object or Array)
    const firstBrace = cleanText.indexOf('{');
    const firstBracket = cleanText.indexOf('[');
    
    let startIndex = -1;
    // Determine start index based on what comes first
    if (firstBrace !== -1 && firstBracket !== -1) {
        startIndex = Math.min(firstBrace, firstBracket);
    } else {
        startIndex = firstBrace !== -1 ? firstBrace : firstBracket;
    }
    
    if (startIndex === -1) return null;

    // Find the last closing character
    const lastBrace = cleanText.lastIndexOf('}');
    const lastBracket = cleanText.lastIndexOf(']');
    const endIndex = Math.max(lastBrace, lastBracket);
    
    if (endIndex === -1 || endIndex < startIndex) return null;

    cleanText = cleanText.substring(startIndex, endIndex + 1);

    // 3. Remove JS-style comments (// ...) which are invalid in JSON but common in AI output
    cleanText = cleanText.replace(/\/\/.*$/gm, '');

    // 4. Attempt First Parse (Cleaned Raw)
    try {
        return JSON.parse(cleanText) as T;
    } catch (e) {
        // Fall through to repair logic
    }

    // 5. Repair Logic
    
    // Fix: Missing commas between objects (e.g., } { or } \n {)
    // We replace '}' followed by optional whitespace and then '{' with '}, {'
    cleanText = cleanText.replace(/}(\s*){/g, '},$1{');
    
    // Fix: Trailing commas (e.g., ,} or ,])
    cleanText = cleanText.replace(/,\s*([}\]])/g, '$1');

    try {
        return JSON.parse(cleanText) as T;
    } catch (e) {
        // 6. Last Resort: Auto-wrap array
        // If the text looks like a list of objects "{...}, {...}" but is missing [ ], wrap it.
        if (cleanText.trim().startsWith('{')) {
             try {
                return JSON.parse(`[${cleanText}]`) as T;
             } catch(e2) {}
        }

        console.error("JSON Parsing failed after repairs.");
        console.log("Failed Text:", cleanText);
        return null;
    }
};

export const getPrediction = async (matchQuery: string): Promise<PredictionData> => {
  const ai = getAI();
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Analyze this match: "${matchQuery}".
    
    Step 1: SEARCH. Perform a Google Search to find the latest statistics, team form, head-to-head records, and injury news. 
    Prioritize data from: SportMonks (https://www.sportmonks.com), Forebet, SportsMole, SofaScore, FlashScore.
    
    Step 2: PREDICT. Based on the search results, synthesize a betting prediction.
    
    Step 3: OUTPUT. Return the result STRICTLY as a valid JSON object. 
    DO NOT output any conversational text before or after the JSON.
    
    The JSON object must strictly follow this schema:
    {
      "homeTeam": "string",
      "awayTeam": "string",
      "predictedWinner": "string (Team Name or 'Draw')",
      "scorePrediction": "string (e.g. '2-1')",
      "confidence": number (integer 0-100),
      "reasoning": "string (Concise analysis citing the stats found)",
      "keyStats": ["string", "string", "string"],
      "overUnder": "string (e.g. 'Over 2.5')",
      "btts": "string (e.g. 'Yes' or 'No')",
      "predictionLevel": number (integer 1-100 score of prediction strength)
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "";
    const data = extractJSON<PredictionData>(text);
    
    if (data) {
      return data;
    }
    
    throw new Error("AI response could not be parsed as JSON.");

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
          Task: Find 4 confirmed high-profile football matches playing today (${today}) or tomorrow.
          
          Priority Sources: SportMonks (https://www.sportmonks.com), FlashScore.
          
          Output Requirements:
          1. Return ONLY a valid JSON Array.
          2. No markdown formatting.
          3. Strictly follow the JSON format below.
          4. No comments.

          Example Format:
          [
            {"id": 1, "league": "EPL", "home": "Arsenal", "away": "Chelsea", "time": "15:00 UTC"},
            {"id": 2, "league": "La Liga", "home": "Real Madrid", "away": "Barca", "time": "20:00 UTC"}
          ]
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }], 
            }
        });

        const text = response.text || "";
        
        // Try extracting. It might be an Array, or a single Object if the AI messes up.
        // We type as any here to inspect it manually below.
        const parsed = extractJSON<any>(text);
        
        let matches: any[] = [];

        if (Array.isArray(parsed)) {
            matches = parsed;
        } else if (parsed && typeof parsed === 'object') {
            // Handle single object return
            matches = [parsed];
        } else {
             console.warn("Failed to parse trending matches JSON.");
             return [];
        }

        // Validate structure and map to type
        return matches.slice(0, 4).map((m: any, i: number) => ({
            id: i + 1,
            league: m.league || "Unknown League",
            home: m.home || "Home Team",
            away: m.away || "Away Team",
            time: m.time || "TBD"
        }));

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