import { NextRequest, NextResponse } from "next/server";
import prisma from "lib/prisma";
import {
  addConnection,
  isEventFull,
  removeConnection,
  type SSEWriter
} from "../../../../../lib/sse-connections";
import { AppError, toApiError } from "lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  if (isEventFull(eventId)) {
    return NextResponse.json(
      toApiError(
        new AppError("Too many open connections for this event", {
          kind: "http",
          status: 503,
          retryable: true,
          publicMessage:
            "Too many viewers are connected right now. Please try again shortly."
        })
      ),
      { status: 503 }
    );
  }

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Create a writer for this connection
      const writer: SSEWriter = {
        write: (data: string) => {
          try {
            controller.enqueue(encoder.encode(data));
          } catch (error) {
            console.error("Error writing to SSE stream:", error);
          }
        },
        close: () => {
          try {
            controller.close();
          } catch (error) {
            console.error("Error closing SSE stream:", error);
          }
        }
      };

      // Add this connection
      addConnection(eventId, writer);

      // Send initial connection message
      writer.write(
        `data: ${JSON.stringify({ type: "connected", eventId })}\n\n`
      );

      // Send current leaderboard state
      fetchAndSendLeaderboard(eventId, writer);

      // Set up keep-alive ping every 30 seconds
      const keepAliveInterval = setInterval(() => {
        try {
          writer.write(`data: ${JSON.stringify({ type: "ping" })}\n\n`);
        } catch (error) {
          console.error("Error sending keep-alive ping:", error);
          clearInterval(keepAliveInterval);
        }
      }, 30000);

      // Cleanup on client disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(keepAliveInterval);
        removeConnection(eventId, writer);
        writer.close();
      });
    }
  });

  // Same-origin only: the Sentral frontend is the sole consumer,
  // so no CORS headers are needed
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no" // Disable nginx buffering
    }
  });
}

async function fetchAndSendLeaderboard(eventId: string, writer: SSEWriter) {
  try {
    const leaderboard = await prisma.leaderboard.findMany({
      where: { eventId },
      orderBy: { lapTime: "asc" },
      take: 50
    });

    const leaderboardWithPositions = leaderboard.map(
      (entry: any, index: number) => ({
        ...entry,
        position: index + 1
      })
    );

    writer.write(
      `data: ${JSON.stringify({
        type: "leaderboard_update",
        data: leaderboardWithPositions
      })}\n\n`
    );
  } catch (error) {
    console.error("Error fetching leaderboard for SSE:", error);
    writer.write(
      `data: ${JSON.stringify({
        type: "error",
        message: "Failed to fetch leaderboard"
      })}\n\n`
    );
  }
}
