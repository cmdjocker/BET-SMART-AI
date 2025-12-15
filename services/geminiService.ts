import { GoogleGenAI, Type } from "@google/genai";
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
    const prompt = `List 4 exciting football matches playing today (${today}) or in the next 24 hours. Focus on major leagues (EPL, La Liga, Serie A, Bundesliga, Champions League) or popular international matches. If no major games today, list the biggest upcoming games. Return strictly JSON.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.INTEGER },
                            league: { type: Type.STRING },
                            home: { type: Type.STRING },
                            away: { type: Type.STRING },
                            time: { type: Type.STRING }
                        },
                        required: ["id", "league", "home", "away", "time"]
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as TrendingMatch[];
        }
        return [];
    } catch (e) {
        console.error("Failed to fetch trending matches", e);
        // Fallback data if API fails to avoid empty UI
        return [
            { id: 1, league: "Example League", home: "Home Team", away: "Away Team", time: "20:00" },
            { id: 2, league: "Example League", home: "Home Team", away: "Away Team", time: "21:00" }
        ];
    }
}