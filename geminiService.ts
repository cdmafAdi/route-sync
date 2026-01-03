
import { GoogleGenAI } from "@google/genai";

// Fix: Initializing GoogleGenAI with a named parameter and using process.env.API_KEY directly as required by guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiResponse = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are 'Route Sync Assistant', an AI expert on Pune city transport. You know about Pune Metro (Purple & Aqua lines), PMPML bus routes, and local Pune geography. Help users plan their travel, suggest food spots near metro stations, and explain traffic rules. Keep responses concise and helpful.",
      },
    });
    return response.text || "I'm having trouble connecting right now.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I encountered an error. Please try again later.";
  }
};

export const suggestOptimizedRoute = async (from: string, to: string) => {
  const prompt = `Optimize a route from ${from} to ${to} in Pune. Consider PMPML buses and Pune Metro. Provide a summary of the best way to travel including estimated cost and time.`;
  return await getGeminiResponse(prompt);
};
