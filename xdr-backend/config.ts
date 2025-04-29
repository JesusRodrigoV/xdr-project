export const config = {
  jwtSecret: (process.env.JWT_SECRET as string) || "My_Secret_Key",
  port: process.env.PORT || 4000,
  wsPort: process.env.PORT || 4000,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:4200",
  gemini: {
    API_KEY: process.env.GEMINI_API_KEY,
    MODEL: process.env.GEMINI_MODEL,
    apiVersion: "v1",
  },
  python: {
    path: process.env.PYTHON_PATH || "./venv/bin/python3",
    env: process.env.PYTHON_ENV || "production",
  },
  ml: {
    modelVersion: process.env.ML_MODEL_VERSION || "v2.3.1",
    thresholdHigh: parseFloat(process.env.ML_THRESHOLD_HIGH || "0.7"),
    thresholdMedium: parseFloat(process.env.ML_THRESHOLD_MEDIUM || "0.4"),
  },
};

export default config;
