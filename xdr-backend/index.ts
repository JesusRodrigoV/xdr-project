import express from "express";
import cors from "cors";
import config from "./config";
import chatbotRoutes from "./src/routes/chatbot.routes";
import { createServer } from "http";
import { initializeWebSocket } from "./src/websockets";
import threatAnalysisRoutes from "./src/routes/threatAnalysis.routes";

const app = express();
const httpServer = createServer(app);

const alertService = initializeWebSocket(httpServer);

app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    services: {
      websocket: alertService ? "active" : "inactive",
    },
  });
});

const corsOptions = {
  origin: config.frontendUrl,
  optionsSuccessStatus: 200,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/chatbot", chatbotRoutes);
app.use("/api/threat", threatAnalysisRoutes);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  },
);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}
WebSocket: ${config.wsPort}`);
});
