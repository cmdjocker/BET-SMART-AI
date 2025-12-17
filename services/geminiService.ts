import { GoogleGenAI, Chat } from "@google/genai";
import { PredictionData, TrendingMatch, Source } from "../types";

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
    
    // Fix: Trailing commas (e.g. , } or , ])
    cleanText = cleanText.replace(/,\s*([}\]])/g, '$1');

    try {
        return JSON.parse(cleanText) as T;
    } catch (e) {
        // 6. Last Resort: Auto-wrap array
        // If the text looks like a list of objects "{...}, {...}" but is missing [ ], wrap it.
        if (cleanText.trim().startsWith('{') && cleanText.includes('}')) {
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
    Act as a professional Sports Analyst.
    Task: Analyze the upcoming match "${matchQuery}" using real-time statistics.
    
    STEP 1: SEARCH
    Use Google Search to find specific data points. 
    MANDATORY: You must search for "SportMonks ${matchQuery} stats" and "Forebet ${matchQuery}" to get precise data.
    Look for:
    - Recent form (Last 5 matches)
    - Head-to-Head (H2H) history
    - Injuries and suspensions
    - Expected Goals (xG) stats if available
    
    STEP 2: ANALYZE
    Based strictly on the search results, determine the most likely outcome.
    
    STEP 3: OUTPUT JSON
    Return valid JSON matching the schema below. 
    Do NOT use Markdown formatting.
    Do NOT include conversational text.
    
    Schema:
    {
      "homeTeam": "string",
      "awayTeam": "string",
      "predictedWinner": "string (Team Name or 'Draw')",
      "scorePrediction": "string (e.g. '2-1')",
      "confidence": number (integer 0-100),
      "reasoning": "string (Concise analysis citing specific stats found)",
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
        // Prevent safety blocks on "gambling" by using a neutral persona in prompt, 
        // but we rely on default safety settings.
      }
    });

    const text = response.text || "";
    const data = extractJSON<PredictionData>(text);
    
    if (data) {
        // Extract sources from grounding metadata
        const sources: Source[] = [];
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        if (groundingChunks) {
            groundingChunks.forEach((chunk: any) => {
                if (chunk.web) {
                    sources.push({
                        title: chunk.web.title || "Source",
                        uri: chunk.web.uri
                    });
                }
            });
        }
        
        // Remove duplicates based on URI
        data.sources = sources.filter((v,i,a)=>a.findIndex(v2=>(v2.uri===v.uri))===i).slice(0, 5);
        return data;
    }
    
    console.error("AI response could not be parsed as JSON:", text);
    throw new Error("AI response was not valid JSON.");

  } catch (error: any) {
    console.error("Error fetching prediction:", error);
    // Return a more descriptive error if available
    if (error.message && error.message.includes("SAFETY")) {
         throw new Error("The request was blocked by safety filters. Please try a different match.");
    }
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
          Task: Find 4 high-profile football matches playing today (${today}) or tomorrow.
          Use Google Search to verify schedule.
          
          Output: JSON Array ONLY. No Markdown.
          Schema: [{"id": 1, "league": "string", "home": "string", "away": "string", "time": "string"}]
          
          Example:
          [
            {"id": 1, "league": "Premier League", "home": "Arsenal", "away": "Chelsea", "time": "15:00 UTC"},
            {"id": 2, "league": "La Liga", "home": "Real Madrid", "away": "Barcelona", "time": "20:00 UTC"}
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
        const parsed = extractJSON<any>(text);
        
        let matches: any[] = [];
        if (Array.isArray(parsed)) {
            matches = parsed;
        } else if (parsed && typeof parsed === 'object') {
            matches = [parsed];
        } else {
             return [];
        }

        return matches.slice(0, 4).map((m: any, i: number) => ({
            id: i + 1,
            league: m.league || "Unknown",
            home: m.home || "Home",
            away: m.away || "Away",
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