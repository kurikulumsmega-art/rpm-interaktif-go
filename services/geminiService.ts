import { GoogleGenAI } from "@google/genai";
import { PROMPT_TEMPLATES } from "../constants";
import { GenerationContext } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAiContent = async (
  promptKey: string,
  context: GenerationContext,
  userPrompt: string = ''
): Promise<string> => {
  let promptTemplate = PROMPT_TEMPLATES[promptKey];
  if (!promptTemplate) {
    throw new Error(`Template not found for key: ${promptKey}`);
  }

  let finalPrompt = promptTemplate;
  for (const key in context) {
    const val = context[key as keyof GenerationContext];
    finalPrompt = finalPrompt.replace(new RegExp(`{${key}}`, 'g'), val);
  }

  if (userPrompt) {
    finalPrompt += `\n\nFokus tambahan dari pengguna: "${userPrompt}"`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: finalPrompt,
    });
    return response.text || '';
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
