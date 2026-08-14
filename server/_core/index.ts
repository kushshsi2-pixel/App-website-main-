import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  // Customer access is handled by Supabase in this deployment. Do not register
  // the Manus OAuth callback here: Railway does not provide its OAuth runtime.
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Railway routes traffic only to the exact PORT it injects. Never scan for a
  // fallback port in production, or the container becomes unreachable.
  const port = Number(process.env.PORT || "3000");

  server.listen(port, "0.0.0.0", () => {
    console.log(`[Server] Listening on 0.0.0.0:${port} (PORT=${process.env.PORT || "3000"})`);
  });
}

startServer().catch(console.error);
