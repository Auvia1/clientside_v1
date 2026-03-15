// server.js — Custom Next.js server with WebSocket proxy
// Place this in the ROOT of your frontend project (same level as package.json)
// Run with: node server.js  (instead of next start / next dev)

const { createServer } = require("http");
const { parse }        = require("url");
const next             = require("next");
const httpProxy        = require("http-proxy");

const dev   = process.env.NODE_ENV !== "production";
const app   = next({ dev });
const handle = app.getRequestHandler();

// Private backend address — only reachable inside the VPC
const BACKEND_INTERNAL = "http://10.0.11.76:4002";
const BACKEND_WS       = "ws://10.0.11.76:4002";

const PORT = process.env.PORT || 3002;

// Create a proxy instance
const proxy = httpProxy.createProxyServer({
  target:      BACKEND_INTERNAL,
  ws:          true,
  changeOrigin: true,
});

proxy.on("error", (err, req, res) => {
  console.error("[Proxy error]", err.message);
  if (res && res.writeHead) {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: "Backend unreachable" }));
  }
});

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    // All /api/* requests are proxied to the backend
    if (parsedUrl.pathname.startsWith("/api/")) {
      proxy.web(req, res, { target: BACKEND_INTERNAL });
    } else {
      handle(req, res, parsedUrl);
    }
  });

  // Proxy WebSocket upgrade requests
  server.on("upgrade", (req, socket, head) => {
    const parsedUrl = parse(req.url, true);
    if (parsedUrl.pathname === "/ws/activity") {
      console.log("[WS Proxy] Upgrading connection to backend");
      proxy.ws(req, socket, head, { target: BACKEND_WS });
    } else {
      // Let Next.js handle all other WS connections (HMR, etc.)
      app.getUpgradeHandler()(req, socket, head);
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Frontend → http://0.0.0.0:${PORT}`);
    console.log(`   Proxying /api/* → ${BACKEND_INTERNAL}`);
    console.log(`   Proxying /ws/activity → ${BACKEND_WS}\n`);
  });
});