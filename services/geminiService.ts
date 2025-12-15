import { GoogleGenAI, Type, Chat } from "@google/genai";
import { PredictionData, TrendingMatch } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPrediction = async (matchQuery: string): Promise<PredictionData> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const model = "gemini-2.5-flash";
  
  const systemInstruction = `
    You are an expert sports betting analyst and aggregator. 
    Your goal is to provide high-probability betting predictions by simulating the analysis of top statistical sources, including:
    SportMonks, Forebet, SportsMole, FiveThirtyEight, FootyStats, PredictZ, and SofaScore.
    
    Analyze the match provided by the user. 
    Synthesize a consensus prediction based on team form, head-to-head stats, and injuries.
    Include specific betting markets like Over/Under 2.5 goals and Both Teams To Score (BTTS).
    Calculate a "Prediction Level" from 1-100 indicating the strength of the signal.
    Return the data in a strict JSON format.
  `;

  const prompt = `Analyze this match: "${matchQuery}". Provide a prediction based on aggregated statistical logic.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            homeTeam: { type: Type.STRING },
            awayTeam: { type: Type.STRING },
            predictedWinner: { type: Type.STRING, description: "Name of the winning team or 'Draw'" },
            scorePrediction: { type: Type.STRING, description: "e.g., 2-1" },
            confidence: { type: Type.INTEGER, description: "Percentage confidence 0-100" },
            reasoning: { type: Type.STRING, description: "A brief summary of why this outcome is predicted" },
            keyStats: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 bullet points of critical statistics"
            },
            overUnder: { type: Type.STRING, description: "Prediction for Over/Under 2.5 Goals (e.g. 'Over 2.5')" },
            btts: { type: Type.STRING, description: "Both Teams To Score prediction (e.g. 'Yes' or 'No')" },
            predictionLevel: { type: Type.INTEGER, description: "A score from 1-100 indicating the strength of this prediction status." }
          },
          required: ["homeTeam", "awayTeam", "predictedWinner", "scorePrediction", "confidence", "reasoning", "keyStats", "overUnder", "btts", "predictionLevel"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as PredictionData;
    }
    throw new Error("No data returned from AI");
  } catch (error) {
    console.error("Error fetching prediction:", error);
    throw error;
  }
};

export const getTrendingMatches = async (): Promise<TrendingMatch[]> => {
    if (!process.env.API_KEY) return [];
    
    const today = new Date().toDateString();
    const model = "gemini-2.5-flash";
    
    // We use the Google Search tool to get REAL match data.
    // Since responseSchema is not supported with tools, we ask for raw JSON text.
    const prompt = `
      Using Google Search, find 4 confirmed football matches playing today (${today}) or tomorrow.
      Focus on major leagues (EPL, La Liga, Serie A, Bundesliga, Champions League) or popular international matches.
      
      Output the result strictly as a JSON array of objects. Do not use markdown formatting or code blocks.
      Each object must have these fields: "id" (number), "league" (string), "home" (string), "away" (string), "time" (string).
      Example format: [{"id": 1, "league": "Premier League", "home": "Arsenal", "away": "Chelsea", "time": "20:00"}]
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
        
        // Robust JSON extraction
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const matches = JSON.parse(jsonMatch[0]) as TrendingMatch[];
            // Ensure we return valid objects
            return matches.slice(0, 4).map((m, i) => ({
                id: i + 1,
                league: m.league || "Unknown League",
                home: m.home || "Home Team",
                away: m.away || "Away Team",
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
  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: "You are 'BetBot', a friendly and professional customer support agent for 'Bet Smart With AI'. Your goal is to assist users with navigating the website, explaining the VIP plans (Weekly, Monthly Pro, Season Ticket), and clarifying betting terms (Over/Under, BTTS). You can explain how the AI works (aggregating stats). If users ask for a specific match prediction during this chat, kindly guide them to use the main search bar on the home page. Keep your answers concise, helpful, and polite.",
    }
  });
};