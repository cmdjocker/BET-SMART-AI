import { GoogleGenAI, Type } from "@google/genai";
import { PredictionData } from "../types";

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
            }
          },
          required: ["homeTeam", "awayTeam", "predictedWinner", "scorePrediction", "confidence", "reasoning", "keyStats"]
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