import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { setupSocketHandlers } from "./server/socket";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

console.log("[SERVER] Starting server...");

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  console.log("[SERVER] Next.js app prepared");
  
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("[SERVER] Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  // Setup Socket.IO
  console.log("[SERVER] Setting up Socket.IO...");
  setupSocketHandlers(server);

  server.listen(port, () => {
    console.log(`[SERVER] Ready on http://${hostname}:${port}`);
  });
});
