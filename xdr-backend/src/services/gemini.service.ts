import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../../config";
import { AppError } from "../utils/errors/appError";

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor() {
    if (!config.gemini.API_KEY) {
      throw new AppError("GEMINI_API_KEY no está configurado", 500);
    }

    this.genAI = new GoogleGenerativeAI(config.gemini.API_KEY);
    this.model = config.gemini.MODEL || "gemini-pro";
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw new AppError(
        "Error al generar respuesta con Gemini",
        500,
        error instanceof Error ? error : undefined,
      );
    }
  }
}
