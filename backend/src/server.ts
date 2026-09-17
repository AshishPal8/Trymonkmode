import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { startAllCrons, stopAllCrons } from "./modules/cron/index.js";

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Try Monk Mode Backend Server Running`);
      console.log(`🌐 URL: http://localhost:${env.PORT}`);
      console.log(`📡 Health Check: http://localhost:${env.PORT}/health`);
    });

    // ⚡ Background Cron Engine (Reminders & Midnight DB Maintenance)
    // Comment this single line if you ever want to stop all server crons:
    startAllCrons();

    const handleShutdown = (signal: string) => {
      console.log(`Received ${signal}. Shutting down gracefully...`);
      stopAllCrons();
      server.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => handleShutdown("SIGINT"));
    process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  } catch (error) {
    console.error("Fatal error during server startup:", error);
    process.exit(1);
  }
}

startServer();
