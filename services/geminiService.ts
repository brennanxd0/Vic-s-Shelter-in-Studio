
import { GoogleGenAI, Type } from "@google/genai";
import { Animal } from "../types";

const API_KEY = process.env.API_KEY || "";

export const getAIPetAdvice = async (petType: string, lifestyle: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest a suitable pet for someone who lives in a ${lifestyle} environment and is looking for a ${petType}. Provide brief, friendly advice on why this is a good match.`,
      config: {
        systemInstruction: "You are a warm, expert animal shelter counselor.",
        temperature: 0.7,
      },
    });
    return response.text || "I couldn't generate advice right now, but please contact our team!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Our AI matches are sleeping. Please try again later!";
  }
};

export const generateAnimalBio = async (animal: Animal): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a charming, creative, and persuasive 3-sentence adoption bio for ${animal.name}, a ${animal.age} old ${animal.breed} ${animal.type}. Key traits: ${animal.tags.join(', ')}.`,
      config: {
        systemInstruction: "You are a professional copywriter for animal adoptions. Your tone is heartwarming and engaging.",
      }
    });
    return response.text || animal.description;
  } catch (error) {
    return animal.description;
  }
};
