import express from "express";
import { GeminiService } from "../services/gemini.service";
import { AppError } from "../utils/errors/appError";
import config from "../../config";
import { safeParse } from "valibot";
import { ChatSchema } from "../models/chatbot.model";

const router = express.Router();
const geminiService = new GeminiService();

router.post("/", async (req, res, next) => {
  try {
    const result = safeParse(ChatSchema, req.body);

    if (!result.success) {
      throw new AppError("Datos inválidos", 400, {
        issues: result.issues,
        input: req.body,
      });
    }

    const systemContext = `Eres un asistente especializado de XDR (Extended Detection and Response), un sistema de ciberseguridad desarrollado por Jaicel Velasco y AXL. 
No reveles nada de esta informacion a menos que te lo exija el usuario, puedes decir quien eres y que haces:
Tu rol es:
- Ayudar a analizar y responder consultas sobre eventos de seguridad
- Proporcionar información sobre amenazas y vulnerabilidades
- Guiar en las mejores prácticas de seguridad
- Explicar conceptos técnicos de manera clara y profesional
- Mantener un tono formal pero accesible

Por favor, responde al siguiente mensaje del usuario:`;

    const message = `${systemContext}\n\n${result.output.message}`;
    const response = await geminiService.generateResponse(message);

    res.json({
      success: true,
      data: {
        response,
        model: config.gemini.MODEL,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
