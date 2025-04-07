import express from "express";
import { processChatbotQuery } from "../services/chatbotService.js";

const router = express.Router();

router.post("/chatbot", async (req, res) => {
  try {
    const { message } = req.body;
    const response = await processChatbotQuery(message);
    res.json(response);
  } catch (error) {
    console.error("Error en Gemini:", error);
    res.status(500).json({
      error: error.message,
      resumen: "Error al procesar la solicitud",
      explicacion: "Ocurrió un error al procesar tu pregunta",
      recomendaciones: ["Por favor, intenta de nuevo más tarde"],
      referencias: [],
    });
  }
});

export default router;
