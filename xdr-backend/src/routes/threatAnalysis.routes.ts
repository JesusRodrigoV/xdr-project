import type { Request, Response } from "express";
import { Router } from "express";
import { ThreatAnalysisService } from "../services/threatAnalysis.service";
import logger from "../utils/logs/logger";
import config from "../../config";
import { safeParse } from "valibot";
import type {
  NetworkEvent,
  ThreatAnalysisResponse,
} from "../types/networkEvent.type";
import { NetworkEventSchema } from "../models/threatAnalysis.model";

const router = Router();
const analysisService = new ThreatAnalysisService();

router.get("/health", async (_req, res) => {
  try {
    const testEvent = {
      timestamp: Date.now(),
      type: "health_check",
      sourceIP: "127.0.0.1",
      destinationIP: "127.0.0.1",
      severity: "low" as const,
      details: JSON.stringify({ packet_length: 0 }),
    };

    await analysisService.analyzeThreat(testEvent);

    res.json({
      status: "OK",
      modelVersion: config.ml.modelVersion,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.post(
  "/predict",
  async (
    req: Request<{}, ThreatAnalysisResponse, NetworkEvent>,
    res: Response<ThreatAnalysisResponse>,
  ) => {
    try {
      const validation = safeParse(NetworkEventSchema, req.body);

      if (!validation.success) {
        const validationErrors = validation.issues.map(
          (issue: { message: string }) => issue.message,
        );
        logger.warn("Validación fallida", { validationErrors });
        return res.status(400).json({
          success: false,
          error: validationErrors.join(", "),
          code: "VALIDATION_ERROR",
        });
      }

      const result = await analysisService.analyzeThreat(validation.output);

      return res.status(200).json({
        success: true,
        data: result,
        metadata: {
          modelVersion: config.ml.modelVersion,
          analyzedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error("Error en endpoint /predict:", error);
      return res.status(500).json({
        success: false,
        error: "Error interno del servidor",
        code: "THREAT_ANALYSIS_FAILED",
      });
    }
  },
);

export default router;
