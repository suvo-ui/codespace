import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import morgan from "morgan";

const app = express();

app.use(morgan("combined"));

// Health check
app.get("/api/status/healthz", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

// Readiness check
app.get("/api/status/readyz", (req, res) => {
  res.status(200).json({
    status: "ready",
  });
});

const proxies = {};

function getProxies(sandboxId) {
  if (!proxies[sandboxId]) {
    proxies[sandboxId] = createProxyMiddleware({
      target: `http://sandbox-service-${sandboxId}`,
      ws: true,
      changeOrigin: true,
    });
  }

  return proxies[sandboxId];
}

// Dynamic sandbox proxy
app.use((req, res, next) => {
  const host = req.headers.host;

  const sandboxId = host.split(".")[0];

  return getProxies(sandboxId)(req, res, next);
});

export default app;
