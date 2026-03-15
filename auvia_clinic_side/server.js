// // server.js — Custom Next.js server with WebSocket proxy
// // Place in ROOT of frontend project (same level as package.json)

// const { createServer } = require("http");
// const { parse }        = require("url");
// const next             = require("next");
// const WebSocket        = require("ws");

// const dev    = process.env.NODE_ENV !== "production";
// const app    = next({ dev });
// const handle = app.getRequestHandler();

// const BACKEND_HTTP = "http://10.0.11.76:4002";
// const BACKEND_WS   = "ws://10.0.11.76:4002";
// const PORT         = process.env.PORT || 3002;

// app.prepare().then(() => {
//   const server = createServer(async (req, res) => {
//     const parsedUrl = parse(req.url, true);

//     if (parsedUrl.pathname.startsWith("/api/")) {
//       // Proxy HTTP requests to backend
//       const targetUrl = `${BACKEND_HTTP}${req.url}`;
//       const headers = { ...req.headers, host: "10.0.11.76:4002" };

//       const http = require("http");
//       const proxyReq = http.request(targetUrl, {
//         method:  req.method,
//         headers: headers,
//       }, (proxyRes) => {
//         res.writeHead(proxyRes.statusCode, proxyRes.headers);
//         proxyRes.pipe(res);
//       });

//       proxyReq.on("error", (err) => {
//         console.error("[HTTP Proxy error]", err.message);
//         if (!res.headersSent) {
//           res.writeHead(502, { "Content-Type": "application/json" });
//           res.end(JSON.stringify({ success: false, error: "Backend unreachable" }));
//         }
//       });

//       req.pipe(proxyReq);
//     } else {
//       handle(req, res, parsedUrl);
//     }
//   });

//   // WebSocket proxy — manually bridge browser ↔ backend
//   server.on("upgrade", (req, socket, head) => {
//     const parsedUrl = parse(req.url, true);

//     if (parsedUrl.pathname === "/ws/activity") {
//       console.log("[WS] Browser connected, opening backend tunnel...");

//       const backendWs = new WebSocket(`${BACKEND_WS}/ws/activity`);

//       backendWs.on("open", () => {
//         console.log("[WS] Backend tunnel open — bridging browser ↔ backend");

//         // Complete the WebSocket handshake with the browser
//         const key = req.headers["sec-websocket-key"];
//         const crypto = require("crypto");
//         const acceptKey = crypto
//           .createHash("sha1")
//           .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
//           .digest("base64");

//         socket.write(
//           "HTTP/1.1 101 Switching Protocols\r\n" +
//           "Upgrade: websocket\r\n" +
//           "Connection: Upgrade\r\n" +
//           `Sec-WebSocket-Accept: ${acceptKey}\r\n\r\n`
//         );

//         const browserWs = new WebSocket(null, { socket, head, skipUTF8Validation: true });

//         // Backend → Browser
//         backendWs.on("message", (data, isBinary) => {
//           if (browserWs.readyState === WebSocket.OPEN) {
//             browserWs.send(data, { binary: isBinary });
//           }
//         });

//         // Browser → Backend
//         browserWs.on("message", (data, isBinary) => {
//           if (backendWs.readyState === WebSocket.OPEN) {
//             backendWs.send(data, { binary: isBinary });
//           }
//         });

//         browserWs.on("close", () => {
//           console.log("[WS] Browser disconnected");
//           backendWs.close();
//         });

//         backendWs.on("close", () => {
//           console.log("[WS] Backend tunnel closed");
//           browserWs.close();
//         });

//         browserWs.on("error", (e) => console.error("[WS] Browser error:", e.message));
//         backendWs.on("error", (e) => console.error("[WS] Backend error:", e.message));
//       });

//       backendWs.on("error", (err) => {
//         console.error("[WS] Could not connect to backend:", err.message);
//         socket.destroy();
//       });

//     } else {
//       // Let Next.js handle HMR and other WS connections
//       app.getUpgradeHandler()(req, socket, head);
//     }
//   });

//   server.listen(PORT, "0.0.0.0", () => {
//     console.log(`\n🚀 Frontend  → http://0.0.0.0:${PORT}`);
//     console.log(`   HTTP proxy → ${BACKEND_HTTP}`);
//     console.log(`   WS proxy   → ${BACKEND_WS}\n`);
//   });
// });

// server.js — Custom Next.js server with WebSocket proxy

const { createServer } = require("http");
const { parse }        = require("url");
const next             = require("next");
const WebSocket        = require("ws");
const crypto           = require("crypto");
const http             = require("http");

const dev    = process.env.NODE_ENV !== "production";
const app    = next({ dev });
const handle = app.getRequestHandler();

const BACKEND_HTTP = "http://10.0.11.76:4002";
const BACKEND_WS   = "ws://10.0.11.76:4002";
const PORT         = process.env.PORT || 3002;

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);

    if (parsedUrl.pathname.startsWith("/api/")) {
      const targetUrl = `${BACKEND_HTTP}${req.url}`;
      const proxyReq  = http.request(targetUrl, {
        method:  req.method,
        headers: { ...req.headers, host: "10.0.11.76:4002" },
      }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });
      proxyReq.on("error", (err) => {
        console.error("[HTTP Proxy error]", err.message);
        if (!res.headersSent) {
          res.writeHead(502, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Backend unreachable" }));
        }
      });
      req.pipe(proxyReq);
    } else {
      handle(req, res, parsedUrl);
    }
  });

  server.on("upgrade", (req, socket, head) => {
    const parsedUrl = parse(req.url, true);

    if (parsedUrl.pathname === "/ws/activity") {
      console.log("[WS] Browser connected, opening backend tunnel...");

      const backendWs = new WebSocket(`${BACKEND_WS}/ws/activity`);

      backendWs.on("open", () => {
        console.log("[WS] Backend tunnel open — bridging browser ↔ backend");

        // Complete WebSocket handshake with the browser manually
        const acceptKey = crypto
          .createHash("sha1")
          .update(req.headers["sec-websocket-key"] + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
          .digest("base64");

        socket.write(
          "HTTP/1.1 101 Switching Protocols\r\n" +
          "Upgrade: websocket\r\n" +
          "Connection: Upgrade\r\n" +
          `Sec-WebSocket-Accept: ${acceptKey}\r\n\r\n`
        );

        // Use a wss server to wrap the raw socket into a WebSocket object
        const wss = new WebSocket.Server({ noServer: true });
        wss.handleUpgrade(req, socket, head, (browserWs) => {
          // Backend → Browser
          backendWs.on("message", (data, isBinary) => {
            if (browserWs.readyState === WebSocket.OPEN) {
              browserWs.send(data, { binary: isBinary });
            }
          });

          // Browser → Backend
          browserWs.on("message", (data, isBinary) => {
            if (backendWs.readyState === WebSocket.OPEN) {
              backendWs.send(data, { binary: isBinary });
            }
          });

          browserWs.on("close", () => {
            console.log("[WS] Browser disconnected");
            backendWs.close();
          });

          backendWs.on("close", () => {
            console.log("[WS] Backend tunnel closed");
            if (browserWs.readyState === WebSocket.OPEN) browserWs.close();
          });

          browserWs.on("error", (e) => console.error("[WS] Browser error:", e.message));
          backendWs.on("error", (e) => console.error("[WS] Backend error:", e.message));
        });
      });

      backendWs.on("error", (err) => {
        console.error("[WS] Could not connect to backend:", err.message);
        socket.destroy();
      });

    } else {
      // Let Next.js handle HMR and other WS connections
      app.getUpgradeHandler()(req, socket, head);
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Frontend  → http://0.0.0.0:${PORT}`);
    console.log(`   HTTP proxy → ${BACKEND_HTTP}`);
    console.log(`   WS proxy   → ${BACKEND_WS}\n`);
  });
});