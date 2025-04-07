import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_CONFIG } from "../config/app.js";

const genAI = new GoogleGenerativeAI(GEMINI_CONFIG.apiKey);
const model = genAI.getGenerativeModel({
  model: GEMINI_CONFIG.model,
  apiVersion: GEMINI_CONFIG.apiVersion,
});

export const processChatbotQuery = async (message) => {
  const prompt = `Eres un experto en seguridad de redes. Analiza la siguiente pregunta y proporciona una respuesta estructurada en español.
  IMPORTANTE: Responde SOLAMENTE con un objeto JSON válido, sin ningún otro texto o formato adicional.
  
  El JSON debe seguir este esquema:
  {
    "resumen": "Un breve resumen de la respuesta",
    "explicacion": "La explicación detallada",
    "recomendaciones": ["Lista de recomendaciones si aplican"],
    "referencias": ["Enlaces o referencias relevantes si aplican"]
  }

  Pregunta: ${message}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    const jsonString = text.includes("```json")
      ? text.split("```json\n")[1].split("\n```")[0]
      : text;

    return JSON.parse(jsonString.trim());
  } catch (parseError) {
    console.error("Error parsing response:", parseError);
    return {
      resumen: "Error al procesar la respuesta",
      explicacion:
        "La respuesta del modelo no pudo ser estructurada correctamente",
      recomendaciones: ["Por favor, intenta reformular tu pregunta"],
      referencias: [],
    };
  }
};
