import { NextRequest, NextResponse } from "next/server";
import prisma from "lib/prisma";
import { z } from "zod";
import { broadcastLeaderboardUpdate } from "../../../../lib/sse-connections";
import { AppError, toApiError, toValidationApiError } from "lib/errors";
import { secureCompare } from "lib/secureCompare";
import { enforceRateLimit, leaderboardSubmitLimiter } from "lib/ratelimit";
import { revalidateTag } from "next/cache";

const addScoreSchema = z.object({
  playerName: z.string().min(1).max(50),
  lapTime: z.number().positive(),
  eventName: z.string().min(1).max(100).optional()
});

// API Key validation function
function validateApiKey(
  request: NextRequest
): "ok" | "unauthorized" | "unconfigured" {
  const apiKey =
    request.headers.get("x-api-key") ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  const validApiKey = process.env.LEADERBOARD_API_KEY;

  if (!validApiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("LEADERBOARD_API_KEY not set - allowing in development");
      return "ok";
    }
    return "unconfigured";
  }

  return secureCompare(apiKey, validApiKey) ? "ok" : "unauthorized";
}

// GET - Fetch leaderboard for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    const leaderboard = await prisma.leaderboard.findMany({
      where: { eventId },
      orderBy: { lapTime: "asc" },
      take: 50 // Limit to top 50 players
    });

    // Calculate positions
    const leaderboardWithPositions = leaderboard.map(
      (entry: any, index: number) => ({
        ...entry,
        position: index + 1
      })
    );

    return NextResponse.json(leaderboardWithPositions);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(toApiError(error), { status: 500 });
  }
}

// POST - Add or update a player's score
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    // Validate API key for POST requests
    const keyCheck = validateApiKey(request);
    if (keyCheck === "unconfigured") {
      return NextResponse.json(
        toApiError(
          new AppError("LEADERBOARD_API_KEY not configured", {
            kind: "config"
          })
        ),
        { status: 503 }
      );
    }
    if (keyCheck === "unauthorized") {
      return NextResponse.json(
        toApiError(new AppError("Invalid API key", { kind: "auth" })),
        { status: 401 }
      );
    }

    const { eventId } = await params;

    const limited = await enforceRateLimit(leaderboardSubmitLimiter, eventId);
    if (limited) {
      return limited;
    }

    const body = await request.json();

    const { playerName, lapTime, eventName } = addScoreSchema.parse(body);

    // Check if player already exists for this event
    const existingEntry = await prisma.leaderboard.findUnique({
      where: {
        unique_player_per_event: {
          eventId,
          playerName
        }
      }
    });

    let result;
    let isNewRecord = false;
    let isPersonalBest = false;

    if (existingEntry) {
      // Update only if new time is better (lower)
      if (lapTime < existingEntry.lapTime) {
        result = await prisma.leaderboard.update({
          where: { id: existingEntry.id },
          data: { lapTime, updatedAt: new Date() }
        });
        isPersonalBest = true;
      } else {
        // Return existing record if new time isn't better
        result = existingEntry;
      }
    } else {
      // Create new entry
      result = await prisma.leaderboard.create({
        data: {
          eventId,
          eventName: eventName || `Event ${eventId}`,
          playerName,
          lapTime
        }
      });
      isNewRecord = true;
    }

    // Position is computed on read everywhere (GET, SSE) — the stored
    // column is never read back, so only compute it for this response
    const betterTimes = await prisma.leaderboard.count({
      where: {
        eventId,
        lapTime: { lt: result.lapTime }
      }
    });

    const position = betterTimes + 1;

    // Broadcast update to SSE connections
    broadcastLeaderboardUpdate(eventId);
    revalidateTag(`leaderboard:${eventId}`, "max");

    return NextResponse.json({
      ...result,
      position,
      isNewRecord,
      isPersonalBest
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(toValidationApiError(error.issues), {
        status: 400
      });
    }

    console.error("Error adding score:", error);
    return NextResponse.json(toApiError(error), { status: 500 });
  }
}
