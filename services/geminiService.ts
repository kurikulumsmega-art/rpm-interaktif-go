import { GoogleGenAI } from "@google/genai";
import { PROMPT_TEMPLATES } from "../constants";
import { GenerationContext } from "../types";

// Mengambil API Key dari environment variables
// CATATAN PENTING: Di Vercel/Netlify, pastikan Anda sudah mensetting Environment Variable bernama 'API_KEY'
const getApiKey = () => {
  // Prioritaskan environment variable. 
  // Sesuai guidelines @google/genai, kita gunakan process.env.API_KEY.
  // Di Vite, pastikan 'define' di vite.config.ts sudah dikonfigurasi untuk me-replace variable ini.
  return process.env.API_KEY || "";
};

const apiKey = getApiKey();

// Inisialisasi AI hanya jika API Key ada, jika tidak biarkan error muncul saat dipanggil agar user sadar
const ai = apiKey ? new GoogleGenAI({ apiKey: apiKey }) : null;

export const generateAiContent = async (
  promptKey: string,
  context: GenerationContext,
  userPrompt: string = ''
): Promise<string> => {
  if (!ai) {
    console.error("API Key tidak ditemukan. Pastikan Anda telah mengatur Environment Variable 'API_KEY' di dashboard Vercel/Netlify.");
    throw new Error("API Key belum dikonfigurasi. Hubungi administrator sistem.");
  }

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