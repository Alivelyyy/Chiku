require("module-alias/register");

const express    = require("express");
const cors       = require("cors");
const rateLimit  = require("express-rate-limit");
const logger     = require("@plugins/logger");

const authMiddleware = require("./middleware/auth");
const statsRouter    = require("./routes/stats");
const guildsRouter   = require("./routes/guilds");
const playerRouter   = require("./routes/player");
const queueRouter    = require("./routes/queue");
const settingsRouter = require("./routes/settings");
const topggRouter    = require("./routes/topgg");

module.exports = function startApi(client, config) {
  const app    = express();
  const port   = config.DASHBOARD?.PORT || 3001;
  const origin = config.DASHBOARD?.ALLOWED_ORIGIN || "*";

  app.set("trust proxy", 1);
  app.use(express.json());

  app.use(cors({
    origin,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  }));

  app.use(rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === "/health",
  }));

  app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

  app.use("/api/topgg", topggRouter(client, config));

  app.use(authMiddleware(config));

  app.use("/api/stats", statsRouter(client));
  app.use("/api/guilds", guildsRouter(client));
  app.use("/api/guilds/:guildId/player", playerRouter(client));
  app.use("/api/guilds/:guildId/queue", queueRouter(client));
  app.use("/api/guilds/:guildId/settings", settingsRouter(client));

  app.use((err, _req, res, _next) => {
    logger.error(`[API] ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  });

  app.listen(port, "0.0.0.0", () => {
    logger.success(`Dashboard API listening on port ${port}`);
  });
};
