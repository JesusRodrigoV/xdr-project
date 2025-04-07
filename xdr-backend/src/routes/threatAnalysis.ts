import { Router } from "express";
import { ThreatAnalyzer, NetworkEvent } from "../services/threatAnalysis";

const router = Router();
const analyzer = new ThreatAnalyzer();

router.post("/predict", async (req, res) => {
  try {
    const event: NetworkEvent = req.body;
    const result = await analyzer.analyzeThreat(event);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      error: "Analysis failed",
      details: error.message,
    });
  }
});

export default router;
