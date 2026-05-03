const chalk = require("chalk");

module.exports = (client) => {
  const tag = "[AntiCrash]";

  process.on("unhandledRejection", (reason) => {
    const msg = reason instanceof Error ? reason.stack || reason.message : String(reason);
    console.error(
      chalk.red(`${tag} Unhandled Promise Rejection:`),
      chalk.yellow(msg?.slice(0, 500) || "Unknown reason")
    );
  });

  process.on("uncaughtException", (err) => {
    console.error(
      chalk.red(`${tag} Uncaught Exception:`),
      chalk.yellow(err?.stack || err?.message || String(err))
    );
  });

  process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.error(
      chalk.red(`${tag} Uncaught Exception Monitor (${origin}):`),
      chalk.yellow(err?.message || String(err))
    );
  });

  process.on("warning", (warning) => {
    console.warn(
      chalk.yellow(`${tag} Warning [${warning.name}]:`),
      warning.message
    );
  });

  process.on("SIGINT", async () => {
    console.log(chalk.cyan("\n[Shutdown] Received SIGINT — gracefully shutting down..."));
    try {
      if (client?.kazagumo?.players?.size) {
        for (const player of client.kazagumo.players.values()) {
          await player.destroy().catch(() => {});
        }
      }
      if (client?.destroy) client.destroy();
    } catch {}
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log(chalk.cyan("[Shutdown] Received SIGTERM — shutting down..."));
    try {
      if (client?.destroy) client.destroy();
    } catch {}
    process.exit(0);
  });
};
