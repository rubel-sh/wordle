import { NextResponse } from "next/server";
import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";

console.log("[API SOCKET] Loading socket route...");

interface SocketWithIO extends NetSocket {
  server: HTTPServer & {
    io?: SocketIOServer;
  };
}

interface NextApiResponseWithSocket extends Response {
  socket: SocketWithIO;
}

// Store the IO instance
let io: SocketIOServer | null = null;

export async function GET(req: Request) {
  console.log("[API SOCKET] GET request received");

  if (io) {
    console.log("[API SOCKET] Socket.IO already initialized");
    return NextResponse.json({ success: true, message: "Socket.IO already initialized" });
  }

  console.log("[API SOCKET] Initializing Socket.IO server...");

  try {
    const socket = req as unknown as SocketWithIO;

    if (socket.server) {
      // Import socket handlers dynamically
      const { setupSocketHandlers } = await import("@/server/socket");
      io = setupSocketHandlers(socket.server);
      console.log("[API SOCKET] Socket.IO server initialized successfully");
    }

    return NextResponse.json({ success: true, message: "Socket.IO initialized" });
  } catch (error) {
    console.error("[API SOCKET] Error initializing Socket.IO:", error);
    return NextResponse.json({ success: false, message: "Failed to initialize" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
